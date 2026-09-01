#!/usr/bin/env node
/*
 * Access-control test for portal/auth.gs.
 *
 * Sign-in is the one part of this portal where a silent regression is not
 * a cosmetic bug — it is one student reading another student's scores, or
 * a stranger reading anyone's. So unlike the UI, these rules get tested
 * directly rather than by eye.
 *
 * It runs the REAL auth.gs (no reimplementation, no mock of the logic
 * under test) inside a vm sandbox, against fakes for the four things Apps
 * Script provides and this machine does not: a Sheet, Google's tokeninfo
 * endpoint, a mailer, and the crypto/base64 in Utilities. The Code.gs
 * helpers auth.gs leans on are stubbed at their boundary too — this suite
 * is about WHO GETS IN, not about Drive folder creation.
 *
 * Run: node tests/auth-test.js
 * Exits non-zero on any failure, so it is CI-ready.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const assert = require('assert');

const AUTH_GS = fs.readFileSync(path.join(__dirname, '..', 'auth.gs'), 'utf8');

// Objects returned from inside the vm have that realm's prototypes, so
// assert.deepStrictEqual against an outer-realm literal always fails on
// identity rather than on content. These compare what actually matters.
function isErr(out, code) {
  assert.strictEqual(out && out.ok, false, 'expected a refusal, got: ' + JSON.stringify(out));
  assert.strictEqual(out.error, code, 'expected error ' + code + ', got ' + out.error);
}
function isOk(out) {
  assert.strictEqual(out && out.ok, true, 'expected success, got: ' + JSON.stringify(out));
}

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  \x1b[32m✓\x1b[0m ' + name);
  } catch (e) {
    failed++;
    console.log('  \x1b[31m✗\x1b[0m ' + name);
    console.log('    ' + (e && e.message ? e.message : e));
  }
}

/* ═══ FAKE SHEET ═══ a 2D grid with just enough of the SpreadsheetApp
   surface that auth.gs cannot tell the difference: getDataRange, ranged
   reads, single-cell writes, and columns that grow when written past the
   right-hand edge (which is how auth.gs creates its own columns). */
function makeSheet(headers, rows) {
  const grid = [headers.slice()].concat(rows.map(r => r.slice()));
  function pad() {
    const w = grid[0].length;
    grid.forEach(r => { while (r.length < w) r.push(''); });
  }
  return {
    _grid: grid,
    getLastColumn() { return grid[0].length; },
    getLastRow() { return grid.length; },
    getDataRange() { pad(); return { getValues: () => grid.map(r => r.slice()) }; },
    getRange(row, col, numRows, numCols) {
      pad();
      const nr = numRows || 1, nc = numCols || 1;
      return {
        getValues() {
          const out = [];
          for (let r = 0; r < nr; r++) {
            const line = [];
            for (let c = 0; c < nc; c++) {
              const g = grid[row - 1 + r];
              line.push(g ? (g[col - 1 + c] === undefined ? '' : g[col - 1 + c]) : '');
            }
            out.push(line);
          }
          return out;
        },
        setValue(v) {
          while (grid.length < row) grid.push([]);
          const target = grid[row - 1];
          while (target.length < col) target.push('');
          target[col - 1] = v;
          if (row === 1 && col > grid[0].length) grid[0].length = col;
          pad();
        }
      };
    },
    appendRow(vals) { grid.push(vals.slice()); pad(); },
    setFrozenRows() {}
  };
}

/* ═══ THE HARNESS ═══ a fresh sandbox per test, so no test can pass or
   fail because of state another one left behind. */
function makeEnv(opts) {
  opts = opts || {};
  const students = makeSheet(
    ['Key', 'Name', 'DriveFolderUrl', 'GrantedEmail', 'GrantedAt', 'SAT', 'AccomTimeMult', 'OnboardedAt',
     'GuardianName', 'GuardianEmail'],
    opts.rows || []
  );
  const leads = makeSheet(
    ['Timestamp', 'Name', 'Email', 'Phone', 'Grade', 'Subject', 'Message', 'Stage', 'IsUSA', 'Role'],
    opts.leads || []
  );
  const sheets = { Students: students, Leads: leads };
  const sent = [];
  const shared = new Set();   // who currently has Drive access, per grant/revoke
  const folderName = { v: ' \u2014 ABC123' };  // how Code.gs names a folder for a nameless row
  const CLIENT_ID = 'test-client.apps.googleusercontent.com';

  // Stands in for Google's tokeninfo endpoint. Test tokens are plain JSON
  // so a test can hand-build a hostile one (wrong aud, expired, unverified
  // email) and check auth.gs actually refuses it.
  function tokeninfo(url) {
    const raw = decodeURIComponent(url.split('id_token=')[1] || '');
    let claims;
    // Test tokens are header.payload.signature shaped, like the real thing —
    // auth.gs refuses anything that is not, before it ever calls out.
    try { claims = JSON.parse(Buffer.from(raw.split('.')[1] || '', 'base64').toString('utf8')); }
    catch (e) { return { code: 400, text: '{}' }; }
    if (!claims) return { code: 400, text: '{}' };
    return { code: 200, text: JSON.stringify(claims) };
  }

  const sandbox = {
    console: { error() {}, log() {} },
    JSON, Math, String, Number, Boolean, Array, Object, Date, RegExp, isNaN, parseInt, parseFloat,

    // ── Apps Script services ──
    SpreadsheetApp: { openById: () => ({
      getSheetByName: n => sheets[n] || null,
      insertSheet: n => (sheets[n] = makeSheet(['a'], []))
    }) },
    PropertiesService: (() => {
      const store = {};
      return { getScriptProperties: () => ({
        getProperty: k => (k in store ? store[k] : null),
        setProperty: (k, v) => { store[k] = v; }
      }) };
    })(),
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      base64EncodeWebSafe(v) {
        const buf = Buffer.isBuffer(v) ? v : (Array.isArray(v) ? Buffer.from(v) : Buffer.from(String(v), 'utf8'));
        return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
      },
      base64DecodeWebSafe(s) {
        return Array.from(Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
      },
      newBlob: bytes => ({ getDataAsString: () => Buffer.from(bytes).toString('utf8') }),
      computeHmacSha256Signature: (value, key) =>
        Array.from(crypto.createHmac('sha256', String(key)).update(String(value)).digest())
    },
    UrlFetchApp: { fetch(url) {
      const r = tokeninfo(url);
      return { getResponseCode: () => r.code, getContentText: () => r.text };
    } },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    MailApp: { sendEmail(o) { sent.push(o); } },
    ScriptApp: {
      getService: () => ({ getUrl: () => 'https://script.example/exec' }),
      // setupLeadProvisioning installs a time trigger; nothing here needs
      // it to be real, only to not throw.
      getProjectTriggers: () => [],
      deleteTrigger: () => {},
      newTrigger: () => ({ timeBased: function () { return this; }, everyMinutes: function () { return this; }, create() {} })
    },
    HtmlService: { createHtmlOutput: h => ({ _h: h, setTitle() { return this; } }) },

    // ── Code.gs constants + helpers auth.gs calls into ──
    SHEET_ID: 'sheet',
    ADMIN_KEY: 'ADMINSECRET',
    NOTIFY_EMAIL: 'luca@example.com',
    getSheet_: () => students,
    getLeadsSheet_: () => leads,
    truthy_: v => v === true || (typeof v === 'string' && /^(true|yes|y|1)$/i.test(v.trim())),
    toDateOrNull_: v => { if (!v && v !== 0) return null; const d = (v instanceof Date) ? v : new Date(v); return isNaN(d.getTime()) ? null : d; },
    Logger: { log() {} },
    sheetSafe_: v => String(v == null ? '' : v),
    grantFolderAccess_: (url, email) => { if (url && email) shared.add(email); },
    extractFolderId_: url => String(url || '').split('/').pop(),
    DriveApp: { getFolderById: () => ({
      removeViewer: e => shared.delete(e),
      removeEditor: () => {},
      getName: () => folderName.v,
      setName: n => { folderName.v = n; }
    }) },
    createFolderForStudent_: (name, key) => {
      folderName.v = key ? (name + ' \u2014 ' + key) : name;   // Code.gs's exact naming
      return 'https://drive.example/' + key;
    },
    getAssignments_: () => [],
    testPrepFlags_: () => ({ testPrep: true, showSat: true }),
    accomMultiplier_: v => (Number(v) || null),
    isoOrNull_: v => (v instanceof Date ? v.toISOString() : (v || null)),
    findRow_(sheet, key) {
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const keyCol = headers.indexOf('Key');
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][keyCol]).trim().toUpperCase() === key) {
          const row = { _rowIndex: i + 1, _headers: headers };
          headers.forEach((h, idx) => { row[h] = data[i][idx]; });
          return row;
        }
      }
      return null;
    }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(AUTH_GS, sandbox, { filename: 'auth.gs' });
  sandbox.GOOGLE_CLIENT_ID = CLIENT_ID;   // overrides the PASTE_YOUR placeholder

  // Mints a token our fake tokeninfo will accept. Overrides let a test
  // forge a bad one.
  sandbox.token = (email, sub, extra) => {
    const claims = Object.assign({
      aud: CLIENT_ID,
      iss: 'https://accounts.google.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      email_verified: 'true',
      email, sub, name: 'Test Student'
    }, extra || {});
    return 'hdr.' + Buffer.from(JSON.stringify(claims), 'utf8').toString('base64') + '.sig';
  };
  sandbox.cell = (rowIdx, colName) => {
    const g = students._grid;
    return g[rowIdx][g[0].indexOf(colName)];
  };
  sandbox.sentMail = sent;
  sandbox.sharedWith = shared;
  sandbox.folderName = folderName;
  sandbox.leadsSheet = leads;
  sandbox.studentsSheet = students;
  sandbox.rowFor = key => {
    const g = students._grid;
    const kc = g[0].indexOf('Key');
    for (let i = 1; i < g.length; i++) if (String(g[i][kc]) === key) {
      const o = {}; g[0].forEach((h, j) => { o[h] = g[i][j]; }); return o;
    }
    return null;
  };
  return sandbox;
}

const env0 = makeEnv({ rows: [] });

console.log('\nToken verification\n');

test('rejects a token minted for a different app (wrong aud)', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  const bad = env.token('alex@x.com', 'SUB1', { aud: 'someone-elses-client.apps.googleusercontent.com' });
  isErr(env.handleGoogleAuth(bad), 'bad_token');
});

test('rejects an expired token', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  const bad = env.token('alex@x.com', 'SUB1', { exp: Math.floor(Date.now() / 1000) - 60 });
  isErr(env.handleGoogleAuth(bad), 'bad_token');
});

test('rejects an unverified email', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  const bad = env.token('alex@x.com', 'SUB1', { email_verified: 'false' });
  isErr(env.handleGoogleAuth(bad), 'bad_token');
});

test('rejects a token from the wrong issuer', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  const bad = env.token('alex@x.com', 'SUB1', { iss: 'https://evil.example' });
  isErr(env.handleGoogleAuth(bad), 'bad_token');
});

console.log('\nGetting in — the three legitimate doors\n');

test('a pre-filled GrantedEmail lets a student straight in and binds the account', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', '', true, '', '']] });
  const out = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1'));
  assert.strictEqual(out.ok, true, 'should be let in');
  assert.strictEqual(out.key, 'ABC123');
  assert.ok(out.session, 'should get a session');
  assert.strictEqual(env.cell(1, 'GoogleSub'), 'SUB1', 'GoogleSub should now be bound');
  assert.ok(env.cell(1, 'GrantedAt'), 'first login should stamp GrantedAt');
});

test('an already-paired account gets in with no key at all', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  env.handleGoogleAuth(env.token('alex@x.com', 'SUB1'));      // pairs
  const out = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1'));  // returns
  assert.strictEqual(out.ok, true);
  assert.strictEqual(out.key, 'ABC123');
});

test('pairing survives the student changing the email on their Google account', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  env.handleGoogleAuth(env.token('alex@x.com', 'SUB1'));
  const out = env.handleGoogleAuth(env.token('alex.new@x.com', 'SUB1'));
  assert.strictEqual(out.ok, true, 'same sub, new address, still in');
  assert.strictEqual(out.key, 'ABC123');
});

test('an unknown Google account is asked for a key, and told nothing else', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  const out = env.handleGoogleAuth(env.token('stranger@x.com', 'SUB9'));
  assert.strictEqual(out.needsKey, true);
  assert.strictEqual(out.session, undefined, 'no session before a row is matched');
  assert.strictEqual(out.driveFolderUrl, undefined, 'nothing about any student leaks');
});

console.log('\nThe approval queue — the part that must never fail open\n');

test('a valid key with no email on file does NOT grant access; it files a request', () => {
  const env = makeEnv({ rows: [['NEWKEY1', '', '', '', '', true, '', '']] });
  const t = env.token('new@x.com', 'SUB2');
  assert.strictEqual(env.handleGoogleAuth(t).needsKey, true);
  const out = env.handleClaimKey(t, 'NEWKEY1', 'New Student');
  assert.strictEqual(out.ok, true);
  assert.strictEqual(out.pending, true, 'must be pending, not logged in');
  assert.strictEqual(out.session, undefined, 'a pending claim gets NO session');
  assert.strictEqual(out.driveFolderUrl, undefined, 'a pending claim sees no student data');
  assert.strictEqual(env.cell(1, 'PendingSub'), 'SUB2');
  assert.strictEqual(env.cell(1, 'GoogleSub'), '', 'not paired until approved');
  assert.strictEqual(env.sentMail.length, 1, 'Luca should be emailed');
  assert.ok(env.sentMail[0].to === 'luca@example.com');
  assert.ok(/NEWKEY1/.test(env.sentMail[0].body), 'the email names the key');
});

test('polling while pending keeps returning pending, never data', () => {
  const env = makeEnv({ rows: [['NEWKEY1', '', '', '', '', true, '', '']] });
  const t = env.token('new@x.com', 'SUB2');
  env.handleClaimKey(t, 'NEWKEY1', 'New Student');
  const out = env.handleClaimStatus(t);
  assert.strictEqual(out.pending, true);
  assert.strictEqual(out.session, undefined);
});

test('approving lets them in on the very next poll', () => {
  const env = makeEnv({ rows: [['NEWKEY1', '', '', '', '', true, '', '']] });
  const t = env.token('new@x.com', 'SUB2');
  env.handleClaimKey(t, 'NEWKEY1', 'New Student');
  const dec = env.handleDecideClaim('ADMINSECRET', 'NEWKEY1', 'approve');
  assert.strictEqual(dec.ok, true);
  const out = env.handleClaimStatus(t);
  assert.strictEqual(out.ok, true);
  assert.ok(out.session, 'approved student gets a session');
  assert.strictEqual(out.key, 'NEWKEY1');
  assert.strictEqual(env.cell(1, 'GoogleSub'), 'SUB2');
  assert.strictEqual(env.cell(1, 'PendingSub'), '', 'pending is cleared on approval');
});

test('declining grants nothing and clears the request', () => {
  const env = makeEnv({ rows: [['NEWKEY1', '', '', '', '', true, '', '']] });
  const t = env.token('new@x.com', 'SUB2');
  env.handleClaimKey(t, 'NEWKEY1', 'New Student');
  env.handleDecideClaim('ADMINSECRET', 'NEWKEY1', 'decline');
  assert.strictEqual(env.cell(1, 'GoogleSub'), '', 'never paired');
  assert.strictEqual(env.cell(1, 'PendingSub'), '');
  assert.strictEqual(env.handleClaimStatus(t).needsKey, true);
});

test('the approval queue cannot be driven without the admin key', () => {
  const env = makeEnv({ rows: [['NEWKEY1', '', '', '', '', true, '', '']] });
  env.handleClaimKey(env.token('new@x.com', 'SUB2'), 'NEWKEY1', 'New');
  isErr(env.handleDecideClaim('guess', 'NEWKEY1', 'approve'), 'unauthorized');
  isErr(env.handleListPendingClaims('guess'), 'unauthorized');
  assert.strictEqual(env.cell(1, 'GoogleSub'), '', 'still not paired');
});

console.log('\nWhat a leaked key can and cannot do\n');

test('a key already paired to someone else is refused', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  env.handleGoogleAuth(env.token('alex@x.com', 'SUB1'));
  const out = env.handleClaimKey(env.token('thief@x.com', 'SUB9'), 'ABC123', 'Thief');
  isErr(out, 'key_already_claimed');
});

test('a key pre-registered to a different address is refused', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex', '', 'alex@x.com', '', true, '']] });
  const out = env.handleClaimKey(env.token('thief@x.com', 'SUB9'), 'ABC123', 'Thief');
  isErr(out, 'email_mismatch');
});

test('a second claimant cannot displace a request already pending', () => {
  const env = makeEnv({ rows: [['NEWKEY1', '', '', '', '', true, '', '']] });
  env.handleClaimKey(env.token('real@x.com', 'SUB2'), 'NEWKEY1', 'Real Student');
  const out = env.handleClaimKey(env.token('thief@x.com', 'SUB9'), 'NEWKEY1', 'Thief');
  isErr(out, 'claim_pending_other');
  assert.strictEqual(env.cell(1, 'PendingSub'), 'SUB2', 'the real request is untouched');
});

test('an email match never overrides an existing pairing', () => {
  // Contrived — Google treats an address as belonging to one account — but
  // this is the one path where getting it wrong hands over a whole record.
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  env.handleGoogleAuth(env.token('alex@x.com', 'SUB1'));
  const out = env.handleGoogleAuth(env.token('alex@x.com', 'SUB_IMPOSTER'));
  assert.strictEqual(out.needsKey, true, 'must not be let in on the email alone');
  assert.strictEqual(env.cell(1, 'GoogleSub'), 'SUB1', 'the real pairing is untouched');
});

test('a wrong key tells the holder nothing about which keys exist', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  const out = env.handleClaimKey(env.token('stranger@x.com', 'SUB9'), 'NOTAKEY', 'X');
  isErr(out, 'bad_key');
});

console.log('\nThe first-login sequence (what the retired name/email beat used to guarantee)\n');

test('a usable Google name fills a blank roster cell and nothing is asked', () => {
  const env = makeEnv({ rows: [['ABC123', '', '', 'alex@x.com', '', true, '', '']] });
  const out = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1'));
  isOk(out);
  assert.strictEqual(env.cell(1, 'Name'), 'Test Student');
  assert.strictEqual(out.needsName, false);
});

test('a one-word Google name is NOT written to the roster; the student is asked', () => {
  const env = makeEnv({ rows: [['ABC123', '', '', 'alex@x.com', '', true, '', '']] });
  const out = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1', { name: 'alex' }));
  isOk(out);
  assert.strictEqual(env.cell(1, 'Name'), '', 'a nickname must not become the roster name');
  assert.strictEqual(out.needsName, true);
});

test('an empty Google name is handled the same way, not stored as blank-and-forgotten', () => {
  const env = makeEnv({ rows: [['ABC123', '', '', 'alex@x.com', '', true, '', '']] });
  const out = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1', { name: '' }));
  assert.strictEqual(out.needsName, true);
});

test("a name Luca typed himself is never questioned, even a single word", () => {
  const env = makeEnv({ rows: [['ABC123', 'Owen', '', 'alex@x.com', '', true, '', '']] });
  const out = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1'));
  assert.strictEqual(out.needsName, false, 'Luca\'s own entry wins');
  assert.strictEqual(env.cell(1, 'Name'), 'Owen', 'and is not overwritten by Google');
});

test('a nickname from Google never names the Drive folder; the real name does', () => {
  // No folder yet — the whole point is that it gets created during this login.
  const env = makeEnv({ rows: [['ABC123', '', '', 'alex@x.com', '', true, '', '']] });
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1', { name: 'alex' })).session;
  assert.strictEqual(env.folderName.v, ' \u2014 ABC123',
    'created unnamed rather than with an unvetted Google name');
  isOk(env.handleSetName(s, 'Alex Reed'));
  assert.strictEqual(env.folderName.v, 'Alex Reed \u2014 ABC123', 'reconciled with the roster');
});

test('a usable Google name names the folder correctly first time', () => {
  const env = makeEnv({ rows: [['ABC123', '', '', 'alex@x.com', '', true, '', '']] });
  env.handleGoogleAuth(env.token('alex@x.com', 'SUB1', { name: 'Alex Reed' }));
  assert.strictEqual(env.folderName.v, 'Alex Reed \u2014 ABC123');
});

test('setName leaves a folder Luca renamed by hand alone', () => {
  const env = makeEnv({ rows: [['ABC123', '', 'https://drive.example/F1', 'alex@x.com', '', true, '', '']] });
  env.folderName.v = 'Owen (do not rename)';
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1', { name: 'alex' })).session;
  isOk(env.handleSetName(s, 'Alex Reed'));
  assert.strictEqual(env.folderName.v, 'Owen (do not rename)');
});

test('setName stores a full name and clears the prompt', () => {
  const env = makeEnv({ rows: [['ABC123', '', '', 'alex@x.com', '', true, '', '']] });
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1', { name: 'alex' })).session;
  const out = env.handleSetName(s, '  Alex   Reed ');
  isOk(out);
  assert.strictEqual(env.cell(1, 'Name'), 'Alex Reed', 'whitespace is normalised');
  assert.strictEqual(out.needsName, false);
});

test('setName refuses a single word, an empty string, and an absurd length', () => {
  const env = makeEnv({ rows: [['ABC123', '', '', 'alex@x.com', '', true, '', '']] });
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1', { name: 'alex' })).session;
  isErr(env.handleSetName(s, 'Alex'), 'bad_name');
  isErr(env.handleSetName(s, '   '), 'bad_name');
  isErr(env.handleSetName(s, 'A '.repeat(60)), 'bad_name');
  assert.strictEqual(env.cell(1, 'Name'), '');
});

test('setName needs a valid session and cannot overwrite an existing name', () => {
  const env = makeEnv({ rows: [['ABC123', '', '', 'alex@x.com', '', true, '', '']] });
  isErr(env.handleSetName('forged', 'Some One'), 'unauthorized');
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1', { name: 'alex' })).session;
  env.handleSetName(s, 'Alex Reed');
  isOk(env.handleSetName(s, 'Someone Else'));
  assert.strictEqual(env.cell(1, 'Name'), 'Alex Reed', 'first write wins; never an overwrite');
});

console.log('\nOnboarding replay\n');

test('a newly approved student is sent through onboarding', () => {
  const env = makeEnv({ rows: [['NEWKEY1', '', '', '', '', true, '', '']] });
  const t = env.token('new@x.com', 'SUB2');
  env.handleClaimKey(t, 'NEWKEY1', 'New Student');
  env.handleDecideClaim('ADMINSECRET', 'NEWKEY1', 'approve');
  assert.strictEqual(env.handleClaimStatus(t).needsOnboarding, true);
});

test('finishing onboarding stops it replaying — even though that submit is fire-and-forget', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', '', true, '', '']] });
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1')).session;
  assert.strictEqual(env.handleResume(s).needsOnboarding, true, 'not onboarded yet');
  // The real sequence's final beat: one saveOnboardingPrefs through the
  // guard. Code.gs's handler is NOT run here — that is the point. The flag
  // must not depend on it.
  env.authGuard_({ action: 'saveOnboardingPrefs', session: s, key: 'ABC123' });
  assert.strictEqual(env.handleResume(s).needsOnboarding, false, 'must not replay');
});

test('an existing student who onboarded before OnboardedAt existed is not sent through again', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1.5, '']] });
  const out = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1'));
  assert.strictEqual(out.needsOnboarding, false, 'AccomTimeMult is the legacy signal');
  assert.strictEqual(out.accomTimeMult, 1.5, 'and their accommodation still comes through');
});

test('a later Settings save does not re-stamp OnboardedAt', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', '', true, '', '']] });
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1')).session;
  env.authGuard_({ action: 'saveOnboardingPrefs', session: s, key: 'ABC123' });
  const first = env.cell(1, 'OnboardedAt');
  env.authGuard_({ action: 'saveOnboardingPrefs', session: s, key: 'ABC123' });
  assert.strictEqual(env.cell(1, 'OnboardedAt'), first, 'write-once');
});

console.log('\nThe parent-claimed-the-key failure mode\n');

test('the approval email flags a Google name that does not match the roster name', () => {
  const env = makeEnv({ rows: [['OWEN01', 'Owen Chen', '', '', '', true, '', '']] });
  env.handleClaimKey(env.token('sarah.chen@x.com', 'SUBP', { name: 'Sarah Chen' }), 'OWEN01');
  const mail = env.sentMail[0];
  assert.ok(/^\[check\]/.test(mail.subject), 'the subject should stand out: ' + mail.subject);
  assert.ok(/CHECK/.test(mail.body), 'the plain-text body should warn too');
  assert.ok(/Sarah Chen/.test(mail.htmlBody) && /Owen Chen/.test(mail.htmlBody));
});

test('a matching name raises no false alarm', () => {
  const env = makeEnv({ rows: [['OWEN01', 'Owen Chen', '', '', '', true, '', '']] });
  env.handleClaimKey(env.token('owen.c@x.com', 'SUBO', { name: 'owen t chen' }), 'OWEN01');
  assert.ok(!/^\[check\]/.test(env.sentMail[0].subject), 'should not warn: ' + env.sentMail[0].subject);
});

test('a roster row with no name yet cannot produce a false alarm', () => {
  const env = makeEnv({ rows: [['NEWKEY1', '', '', '', '', true, '', '']] });
  env.handleClaimKey(env.token('new@x.com', 'SUB2', { name: 'New Student' }), 'NEWKEY1');
  assert.ok(!/^\[check\]/.test(env.sentMail[0].subject));
});

test('a wrongly approved parent account is fully undone by resetting the row', () => {
  const env = makeEnv({ rows: [['OWEN01', 'Owen Chen', '', '', '', true, '', '']] });
  const parent = env.token('sarah.chen@x.com', 'SUBP', { name: 'Sarah Chen' });
  env.handleClaimKey(parent, 'OWEN01');
  env.handleDecideClaim('ADMINSECRET', 'OWEN01', 'approve');
  const parentSession = env.handleClaimStatus(parent).session;
  assert.ok(parentSession, 'the wrong account is in — this is the mistake being undone');

  assert.ok(env.sharedWith.has('sarah.chen@x.com'), 'the wrong account got Drive access too');

  isOk(env.handleResetStudentAuth('ADMINSECRET', 'OWEN01'));
  isErr(env.handleResume(parentSession), 'session_revoked');
  assert.strictEqual(env.handleGoogleAuth(parent).needsKey, true, 'parent is back to square one');
  assert.ok(!env.sharedWith.has('sarah.chen@x.com'),
    "clearing the cell is not enough — Drive access has to be revoked too");

  // And the student can now claim it properly.
  const student = env.token('owen.c@x.com', 'SUBO', { name: 'Owen Chen' });
  const out = env.handleClaimKey(student, 'OWEN01');
  assert.strictEqual(out.pending, true, 'the key works again for the right person');
});

test('a reset does not leave the old address able to walk straight back in', () => {
  // The whole reset is worthless without this: GrantedEmail is one of the
  // two things findStudentByGoogle_ matches on.
  const env = makeEnv({ rows: [['OWEN01', 'Owen Chen', '', 'sarah.chen@x.com', new Date(), true, 1, new Date()]] });
  const parent = env.token('sarah.chen@x.com', 'SUBP', { name: 'Sarah Chen' });
  isOk(env.handleGoogleAuth(parent));
  isOk(env.handleResetStudentAuth('ADMINSECRET', 'OWEN01'));
  assert.strictEqual(env.cell(1, 'GrantedEmail'), '');
  assert.strictEqual(env.handleGoogleAuth(parent).needsKey, true);
});

test('nicknames do not trigger a false alarm, but a different first name does', () => {
  const env = makeEnv({ rows: [['K1', 'William Chen', '', '', '', true, '', '']] });
  env.handleClaimKey(env.token('w@x.com', 'S1', { name: 'Will Chen' }), 'K1');
  assert.ok(!/^\[check\]/.test(env.sentMail[0].subject), 'Will/William is the same person');

  const env2 = makeEnv({ rows: [['K2', 'Owen Chen', '', '', '', true, '', '']] });
  env2.handleClaimKey(env2.token('s@x.com', 'S2', { name: 'Sarah Chen' }), 'K2');
  assert.ok(/^\[check\]/.test(env2.sentMail[0].subject),
    'a shared surname must not mask a different first name — this is the parent case');
});

console.log('\nInvites — one click from Luca, one tap from the family\n');

test('creating a student generates a unique key and grants nothing', () => {
  const env = makeEnv({ rows: [] });
  const a = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'parent@x.com', guardianName: 'Sarah Chen' });
  isOk(a);
  assert.ok(/^[A-Z]{3}[2-9]{4}$/.test(a.key), 'key shape: ' + a.key);
  const row = env.rowFor(a.key);
  assert.strictEqual(row.Name, '', 'the student names themselves at sign-in');
  assert.strictEqual(row.GuardianEmail, 'parent@x.com');
  assert.strictEqual(row.Status, 'Inquiry');
  assert.strictEqual(row.GoogleSub, '', 'no access');
  assert.strictEqual(row.SubjectOnly, '', 'SAT prep is the default');

  const b = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'other@x.com' });
  assert.notStrictEqual(b.key, a.key, 'keys must not collide');
});

test('creating a student needs the admin key', () => {
  const env = makeEnv({ rows: [] });
  isErr(env.handleCreateStudent('guess', { guardianEmail: 'p@x.com' }), 'unauthorized');
});

test('sending an invite emails the parent and moves the row to Invited', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'parent@x.com' }).key;
  isOk(env.handleSendInvite('ADMINSECRET', key));
  const row = env.rowFor(key);
  assert.strictEqual(row.Status, 'Invited');
  assert.ok(row.InviteNonce, 'a nonce makes the link single-use');
  const mail = env.sentMail[0];
  assert.strictEqual(mail.to, 'parent@x.com');
  assert.ok(/student/i.test(mail.body), 'the email must say it is for the student');
  assert.ok(mail.body.indexOf('?invite=') !== -1, 'carries the link');
});

test('claiming an invite pairs the account, shares the folder, and notifies Luca', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'parent@x.com' }).key;
  env.handleSendInvite('ADMINSECRET', key);
  const token = /\?invite=([^\s]+)/.exec(env.sentMail[0].body)[1];

  const out = env.handleClaimInvite(env.token('owen@x.com', 'SUBO', { name: 'Owen Chen' }), decodeURIComponent(token));
  isOk(out);
  assert.ok(out.session, 'straight in — no approval tap');
  const row = env.rowFor(key);
  assert.strictEqual(row.GoogleSub, 'SUBO');
  assert.strictEqual(row.GrantedEmail, 'owen@x.com', "the student's email arrives verified, unasked");
  assert.strictEqual(row.Status, 'Active');
  assert.ok(env.sharedWith.has('owen@x.com'), 'files folder shared to that address');
  assert.ok(env.sentMail.some(m => m.to === 'luca@example.com' && /claimed/i.test(m.subject)),
    'Luca is told who claimed it');
});

test('an invite works exactly once', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'parent@x.com' }).key;
  env.handleSendInvite('ADMINSECRET', key);
  const token = decodeURIComponent(/\?invite=([^\s]+)/.exec(env.sentMail[0].body)[1]);
  isOk(env.handleClaimInvite(env.token('owen@x.com', 'SUBO', { name: 'Owen Chen' }), token));
  isErr(env.handleClaimInvite(env.token('thief@x.com', 'SUBT', { name: 'A Thief' }), token), 'invite_used');
});

test('re-sending an invite kills the previous link', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'parent@x.com' }).key;
  env.handleSendInvite('ADMINSECRET', key);
  const first = decodeURIComponent(/\?invite=([^\s]+)/.exec(env.sentMail[0].body)[1]);
  env.handleSendInvite('ADMINSECRET', key);
  const second = decodeURIComponent(/\?invite=([^\s]+)/.exec(env.sentMail[1].body)[1]);
  assert.notStrictEqual(first, second);
  isErr(env.handleClaimInvite(env.token('owen@x.com', 'SUBO', { name: 'Owen Chen' }), first), 'invite_expired');
  isOk(env.handleClaimInvite(env.token('owen@x.com', 'SUBO', { name: 'Owen Chen' }), second));
});

test('a forged or tampered invite is refused', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'parent@x.com' }).key;
  env.handleSendInvite('ADMINSECRET', key);
  const good = decodeURIComponent(/\?invite=([^\s]+)/.exec(env.sentMail[0].body)[1]);
  isErr(env.handleClaimInvite(env.token('t@x.com', 'S', { name: 'A B' }), good.slice(0, -2) + 'xy'), 'invite_expired');
  isErr(env.handleClaimInvite(env.token('t@x.com', 'S', { name: 'A B' }), 'nonsense'), 'invite_expired');
});

test('a wrongly claimed invite is fully undone, and a fresh one works', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'parent@x.com' }).key;
  env.handleSendInvite('ADMINSECRET', key);
  const t1 = decodeURIComponent(/\?invite=([^\s]+)/.exec(env.sentMail[0].body)[1]);
  // The parent signs in on their own phone instead of forwarding it.
  isOk(env.handleClaimInvite(env.token('parent@x.com', 'SUBP', { name: 'Sarah Chen' }), t1));
  assert.ok(env.sharedWith.has('parent@x.com'));

  isOk(env.handleResetStudentAuth('ADMINSECRET', key));
  assert.ok(!env.sharedWith.has('parent@x.com'), 'their file access is revoked');
  isOk(env.handleSendInvite('ADMINSECRET', key));
  const t2 = decodeURIComponent(/\?invite=([^\s]+)/.exec(env.sentMail[env.sentMail.length - 1].body)[1]);
  const out = env.handleClaimInvite(env.token('owen@x.com', 'SUBO', { name: 'Owen Chen' }), t2);
  isOk(out);
  assert.strictEqual(env.rowFor(key).GrantedEmail, 'owen@x.com');
});

console.log('\nLeads become rows by themselves\n');

test('a new parent inquiry provisions an inert row, wired to the weekly email', () => {
  const env = makeEnv({ rows: [], leads: [] });
  env.setupLeadProvisioning();
  env.leadsSheet.appendRow([new Date(Date.now() + 1000), 'Sarah Chen', 'sarah@x.com', '555', '11th',
                            'SAT Prep', '', '', 'Yes', 'Parent']);
  env.provisionNewLeads();

  const g = env.leadsSheet._grid;
  const key = g[1][g[0].indexOf('PortalKey')];
  assert.ok(key, 'the lead is stamped with the key it became');
  const row = env.rowFor(key);
  assert.strictEqual(row.GuardianName, 'Sarah Chen', "the form's name field is the PARENT's");
  assert.strictEqual(row.GuardianEmail, 'sarah@x.com', 'wired to the Friday progress email');
  assert.strictEqual(row.Name, '', 'the student names themselves later');
  assert.strictEqual(row.Grade, '11th');
  assert.strictEqual(row.Status, 'Inquiry');
  assert.strictEqual(row.GoogleSub, '', 'no access from an inquiry alone');
  assert.strictEqual(row.GrantedEmail, '', 'and nothing pre-approved');
});

test('a STUDENT inquiry pre-fills their own email onto the instant-pairing path', () => {
  const env = makeEnv({ rows: [], leads: [] });
  env.setupLeadProvisioning();
  env.leadsSheet.appendRow([new Date(Date.now() + 1000), 'Owen Chen', 'owen@x.com', '555', '11th',
                            'SAT Prep', '', '', 'Yes', 'Student']);
  env.provisionNewLeads();
  const g = env.leadsSheet._grid;
  const row = env.rowFor(g[1][g[0].indexOf('PortalKey')]);
  assert.strictEqual(row.Name, 'Owen Chen', 'a student lead named themselves');
  assert.strictEqual(row.GrantedEmail, 'owen@x.com');
  // And that pre-fill is what lets them straight in with no key, no invite.
  const out = env.handleGoogleAuth(env.token('owen@x.com', 'SUBO', { name: 'Owen Chen' }));
  isOk(out);
  assert.ok(out.session);
});

test('provisioning is idempotent and ignores inquiries from before it was switched on', () => {
  const env = makeEnv({ rows: [], leads: [
    [new Date(Date.now() - 86400000), 'Old Lead', 'old@x.com', '', '', '', '', '', '', 'Parent']
  ] });
  env.setupLeadProvisioning();
  env.leadsSheet.appendRow([new Date(Date.now() + 1000), 'New Lead', 'new@x.com', '', '', '', '', '', '', 'Parent']);
  env.provisionNewLeads();
  env.provisionNewLeads();   // running twice must not duplicate
  const keys = env.studentsSheet._grid.slice(1).map(r => r[0]).filter(Boolean);
  assert.strictEqual(keys.length, 1, 'exactly one row: the new lead only');
});

test('a lead with no email is skipped rather than creating a dead row', () => {
  const env = makeEnv({ rows: [], leads: [] });
  env.setupLeadProvisioning();
  env.leadsSheet.appendRow([new Date(Date.now() + 1000), 'No Email', '', '', '', '', '', '', '', 'Parent']);
  env.provisionNewLeads();
  assert.strictEqual(env.studentsSheet._grid.slice(1).filter(r => r[0]).length, 0);
});

console.log('\nSAT by default\n');

test('migrating ticks SubjectOnly for exactly the non-SAT students', () => {
  const env = makeEnv({ rows: [
    ['SAT001', 'Sat Student', '', 'a@x.com', new Date(), true, 1, new Date(), '', ''],
    ['SUB001', 'Subject Only', '', 'b@x.com', new Date(), false, 1, new Date(), '', '']
  ] });
  env.migrateToSubjectOnly();
  assert.strictEqual(env.rowFor('SAT001').SubjectOnly, '', 'SAT students stay on the default');
  assert.strictEqual(env.rowFor('SUB001').SubjectOnly, true, 'the exception gets ticked');
  env.migrateToSubjectOnly();   // safe to run twice
  assert.strictEqual(env.rowFor('SAT001').SubjectOnly, '');
});

console.log('\nFamilies who never touched the website\n');

test('a student can be created with no email at all', () => {
  // The phone-call case: Luca has a name and a number, nothing else.
  const env = makeEnv({ rows: [] });
  const r = env.handleCreateStudent('ADMINSECRET', {
    guardianName: 'Sarah Chen', phone: '(201) 555-0100', source: 'Phone call'
  });
  isOk(r);
  const row = env.rowFor(r.key);
  assert.strictEqual(row.GuardianEmail, '');
  assert.strictEqual(row.Phone, '(201) 555-0100');
  assert.strictEqual(row.Source, 'Phone call');
  assert.strictEqual(row.Status, 'Inquiry');
});

test('an invite link can be minted without sending any email', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', { guardianName: 'Sarah Chen', source: 'Facebook Messenger' }).key;
  const before = env.sentMail.length;
  const r = env.handleSendInvite('ADMINSECRET', key, '', 'link');
  isOk(r);
  assert.strictEqual(r.deliver, 'link');
  assert.ok(/\?invite=/.test(r.link), 'hands back a pasteable link: ' + r.link);
  assert.strictEqual(env.sentMail.length, before, 'and sends nothing');
  assert.strictEqual(env.rowFor(key).Status, 'Invited');
});

test('a link-delivered invite works exactly like an emailed one', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', { guardianName: 'Sarah Chen' }).key;
  const link = env.handleSendInvite('ADMINSECRET', key, '', 'link').link;
  const token = decodeURIComponent(/\?invite=(.+)$/.exec(link)[1]);
  const out = env.handleClaimInvite(env.token('owen@x.com', 'SUBO', { name: 'Owen Chen' }), token);
  isOk(out);
  assert.ok(out.session);
  assert.strictEqual(env.rowFor(key).GrantedEmail, 'owen@x.com',
    'the email Luca never had arrives by itself, verified');
  assert.ok(env.sharedWith.has('owen@x.com'), 'and the files folder follows it');
});

test('emailing an invite still requires a recipient, but a link never does', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', { guardianName: 'No Email' }).key;
  isErr(env.handleSendInvite('ADMINSECRET', key, '', 'email'), 'no_recipient');
  isOk(env.handleSendInvite('ADMINSECRET', key, '', 'link'));
});

test('minting a new link kills the previous one, however it was delivered', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'parent@x.com' }).key;
  const emailed = env.handleSendInvite('ADMINSECRET', key, '', 'email').link;
  const copied = env.handleSendInvite('ADMINSECRET', key, '', 'link').link;
  const t1 = decodeURIComponent(/\?invite=(.+)$/.exec(emailed)[1]);
  const t2 = decodeURIComponent(/\?invite=(.+)$/.exec(copied)[1]);
  isErr(env.handleClaimInvite(env.token('o@x.com', 'S1', { name: 'O C' }), t1), 'invite_expired');
  isOk(env.handleClaimInvite(env.token('o@x.com', 'S1', { name: 'O C' }), t2));
});

test('subject-only can be set at intake, and SAT prep stays the default', () => {
  const env = makeEnv({ rows: [] });
  const a = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'a@x.com', subjectOnly: true });
  const b = env.handleCreateStudent('ADMINSECRET', { guardianEmail: 'b@x.com' });
  assert.strictEqual(env.rowFor(a.key).SubjectOnly, true);
  assert.strictEqual(env.rowFor(b.key).SubjectOnly, '');
});

test('a phone-only family still reaches a working portal end to end', () => {
  const env = makeEnv({ rows: [] });
  const key = env.handleCreateStudent('ADMINSECRET', {
    guardianName: 'Dana Marsh', phone: '555', source: 'Text message'
  }).key;
  const link = env.handleSendInvite('ADMINSECRET', key, '', 'link').link;
  const token = decodeURIComponent(/\?invite=(.+)$/.exec(link)[1]);
  // Google name is a nickname, so the student is asked for a real one.
  const out = env.handleClaimInvite(env.token('owen.m@x.com', 'SUBO', { name: 'owen' }), token);
  isOk(out);
  assert.strictEqual(out.needsName, true);
  isOk(env.handleSetName(out.session, 'Owen Marsh'));
  const row = env.rowFor(key);
  assert.strictEqual(row.Name, 'Owen Marsh');
  assert.strictEqual(row.GrantedEmail, 'owen.m@x.com');
  assert.strictEqual(row.Status, 'Active');
  assert.strictEqual(env.folderName.v, 'Owen Marsh \u2014 ' + key);
});

console.log('\nSessions\n');

test('a valid session resumes without re-authenticating', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1')).session;
  const out = env.handleResume(s);
  assert.strictEqual(out.ok, true);
  assert.strictEqual(out.key, 'ABC123');
});

test('a tampered session is rejected', () => {
  const env = makeEnv({ rows: [
    ['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()],
    ['ZZZ999', 'Blake Chen', '', 'blake@x.com', new Date(), true, 1, new Date()]
  ] });
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1')).session;
  const parts = s.split('.');
  const payload = JSON.parse(Buffer.from(parts[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  payload.k = 'ZZZ999';   // repoint at another student, keep the old signature
  const forged = Buffer.from(JSON.stringify(payload)).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') + '.' + parts[1];
  isErr(env.handleResume(forged), 'bad_session');
});

test('a session with no signature at all is rejected', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  isErr(env.handleResume('garbage'), 'bad_session');
  isErr(env.handleResume(''), 'bad_session');
  isErr(env.handleResume(null), 'bad_session');
});

test('resetting a student invalidates every session they hold', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1')).session;
  assert.strictEqual(env.handleResume(s).ok, true);
  assert.strictEqual(env.handleResetStudentAuth('ADMINSECRET', 'ABC123').ok, true);
  isErr(env.handleResume(s), 'session_revoked');
});

test('a student cannot reset another student — that needs the admin key', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  isErr(env.handleResetStudentAuth('nope', 'ABC123'), 'unauthorized');
});

console.log('\nThe request guard (authGuard_)\n');

test('every student action is refused without a session', () => {
  const env = makeEnv({ rows: [['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()]] });
  env.STUDENT_ACTIONS.forEach(action => {
    const guarded = env.authGuard_({ action, key: 'ABC123' });
    isErr(guarded, 'unauthorized');
  });
});

test("a valid session cannot be pointed at another student's row", () => {
  const env = makeEnv({ rows: [
    ['ABC123', 'Alex Reed', '', 'alex@x.com', new Date(), true, 1, new Date()],
    ['ZZZ999', 'Blake Chen', '', 'blake@x.com', new Date(), true, 1, new Date()]
  ] });
  const s = env.handleGoogleAuth(env.token('alex@x.com', 'SUB1')).session;
  const body = { action: 'getProgress', key: 'ZZZ999', session: s };  // Alex asking for Blake
  assert.strictEqual(env.authGuard_(body), null, 'the request itself is valid');
  assert.strictEqual(body.key, 'ABC123', "the key is forced back to the session's own student");
});

test('public actions are not gated', () => {
  const env = makeEnv({ rows: [] });
  ['submitLead', 'version', 'googleAuth', 'claimKey', 'claimStatus', 'resume'].forEach(action => {
    assert.strictEqual(env.authGuard_({ action }), null, action + ' must stay public');
  });
});

test('every student-facing action in Code.gs is listed in STUDENT_ACTIONS', () => {
  // The list fails OPEN — an action missing from it runs unauthenticated.
  // This reads Code.gs's own dispatcher so adding a handler there without
  // adding it here is caught now rather than in production.
  const codeGs = fs.readFileSync(path.join(__dirname, '..', 'Code.gs'), 'utf8');
  const dispatched = new Set();
  const re = /body\.action === '([a-zA-Z]+)'/g;
  let m;
  while ((m = re.exec(codeGs)) !== null) dispatched.add(m[1]);

  // Everything that is deliberately NOT a student action.
  const publicActions = new Set(['auth', 'submitLead', 'version']);
  const adminActions = new Set([
    'getRoster', 'getAdminAssignments', 'createAdminAssignment', 'updateAdminAssignment',
    'deleteAdminAssignment', 'getAdminCalendar', 'getStudentDetail', 'getAttemptReport',
    'listBlankComposite', 'backfillCompositeFields'
  ]);
  // Guard against this test quietly passing because the regex matched
  // nothing (a dispatcher rewrite, a moved file) — an empty set would
  // "prove" every action is gated.
  assert.ok(dispatched.size > 15, 'expected to find Code.gs\'s dispatcher; found ' + dispatched.size + ' actions');
  const listed = new Set(env0.STUDENT_ACTIONS);
  const missing = [];
  dispatched.forEach(a => {
    if (!publicActions.has(a) && !adminActions.has(a) && !listed.has(a)) missing.push(a);
  });
  assert.deepStrictEqual(missing, [],
    'these Code.gs actions are ungated — add them to STUDENT_ACTIONS in auth.gs: ' + missing.join(', '));
});

console.log('\n' + (failed === 0
  ? '\x1b[32m' + passed + ' passed\x1b[0m'
  : '\x1b[31m' + failed + ' failed\x1b[0m, ' + passed + ' passed') + '\n');
process.exit(failed === 0 ? 0 : 1);
