#!/usr/bin/env node
/*
 * Verifies a LIVE Apps Script deployment after the auth changes go up.
 *
 * WHY THIS EXISTS. tests/auth-test.js runs auth.gs against fakes — it proves
 * the logic is right, not that the thing you actually deployed is running
 * it. The two are different failures, and the second one is the common one:
 * editing Code.gs changes nothing until you redeploy, so the old code keeps
 * answering every request while the editor shows the new code.
 *
 * Everything here runs WITHOUT a Google account, on purpose. It checks the
 * fail-closed half of the system — the half where a mistake means a
 * stranger gets in — by confirming the deployment refuses everything it
 * should refuse. The signed-in paths need a human with a browser; there is
 * a checklist for those at the end of AUTH_INTEGRATION.md.
 *
 * Run:  node portal/tests/verify-deployment.js <exec-url>
 *       (omit the URL and it reads the one in auth-admin.js)
 *
 * Exits non-zero if anything is wrong.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

let URL_ = process.argv[2];
if (!URL_) {
  const src = fs.readFileSync(path.join(__dirname, '..', 'auth-admin.js'), 'utf8');
  const m = /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/.exec(src);
  URL_ = m && m[0];
}
if (!URL_) {
  console.error('No deployment URL given and none found in auth-admin.js.');
  process.exit(2);
}

/* ═══ THE "NEW DEPLOYMENT" TRAP ═══
   Deploy > New deployment mints a NEW /exec URL. Deploy > Manage
   deployments > edit > New version keeps the existing one. Only the second
   updates what the portal actually talks to.

   Get this wrong and everything looks fine from both ends: the new
   deployment tests perfectly green, while every student and every admin
   page keeps hitting the OLD one, unchanged, because the URL baked into
   the four client files never moved. So before testing anything, check the
   URL under test against the URL the portal actually uses. */
const CLIENTS = ['index.html', 'math-review.html', 'auth-admin.js', 'auth-admin-signin.js'];
const shipped = new Map();
for (const f of CLIENTS) {
  try {
    const txt = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    const m = /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/.exec(txt);
    if (m) shipped.set(f, m[0]);
  } catch (e) { /* file may not exist in every checkout */ }
}
const mismatched = [...shipped.entries()].filter(([, u]) => u !== URL_);
if (URL_.indexOf('script.google.com') !== -1 && mismatched.length) {
  console.log('\n\x1b[33m⚠  This is NOT the deployment your portal uses.\x1b[0m');
  console.log('   Testing : ' + URL_);
  mismatched.forEach(([f, u]) => console.log('   ' + f.padEnd(21) + ' → ' + u));
  console.log('\n   You most likely used "New deployment", which mints a new URL, instead of');
  console.log('   "Manage deployments > edit > New version", which keeps the old one.');
  console.log('   Whatever you just deployed, real students are still hitting the old URL.');
  console.log('\n   Fix it one of two ways:');
  console.log('     a) (recommended) Redeploy as a NEW VERSION of the EXISTING deployment,');
  console.log('        so the URL never changes again — then re-run this with no argument.');
  console.log('     b) Update the URL in the ' + shipped.size + ' files above, and re-run.');
  console.log('\n   Continuing against the URL you gave, so you can still see if the code is right.\n');
}

// Every client must agree with every other client, regardless of the above.
const distinct = new Set(shipped.values());
if (distinct.size > 1) {
  console.log('\n\x1b[31m⚠  The client files disagree about which backend to use:\x1b[0m');
  shipped.forEach((u, f) => console.log('   ' + f.padEnd(21) + ' → ' + u));
  console.log('   They must all point at the same deployment.\n');
}

// Apps Script answers on a redirect; follow it, and send the body as plain
// text exactly the way the portal does (that keeps it a CORS simple request
// and is what the deployment expects).
function post(payload, redirects) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const u = new URL(URL_);
    // http as well as https so this can be pointed at a local mock — an
    // unverified verifier is worth nothing.
    const lib = u.protocol === 'http:' ? http : https;
    const req = lib.request({
      hostname: u.hostname, port: u.port || undefined, path: u.pathname + u.search, method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if ((redirects || 0) > 5) return reject(new Error('too many redirects'));
        const loc = res.headers.location;
        res.resume();
        return (loc.startsWith('http:') ? http : https).get(loc, r2 => {
          let d = '';
          r2.on('data', c => d += c);
          r2.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve({ __raw: d.slice(0, 300) }); } });
        }).on('error', reject);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve({ __raw: d.slice(0, 300) }); } });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timed out after 30s')));
    req.end(body);
  });
}

let pass = 0, fail = 0;
const notes = [];
async function check(name, fn) {
  try {
    const msg = await fn();
    pass++;
    console.log('  \x1b[32m✓\x1b[0m ' + name + (msg ? '  \x1b[90m' + msg + '\x1b[0m' : ''));
  } catch (e) {
    fail++;
    console.log('  \x1b[31m✗\x1b[0m ' + name);
    console.log('    ' + (e && e.message ? e.message : e));
    if (e && e.hint) notes.push(e.hint);
  }
}
function bad(msg, hint) { const e = new Error(msg); e.hint = hint; return e; }

(async () => {
  console.log('\nVerifying ' + URL_.slice(0, 64) + '…\n');

  console.log('Reachability\n');
  await check('the deployment answers at all', async () => {
    const r = await post({ action: 'version' });
    if (r.__raw) throw bad('got HTML, not JSON — the URL is wrong or the deployment was deleted:\n    ' + r.__raw,
      'Deploy > Manage deployments, copy the Web app URL, and make sure it matches the one in index.html.');
    if (!r.ok) throw bad('version returned ' + JSON.stringify(r));
    return 'backend v' + r.version;
  });

  await check('the new code is actually deployed', async () => {
    const r = await post({ action: 'googleAuth', idToken: 'not-a-real-token' });
    if (r.error === 'unknown_action') {
      throw bad('the deployment does not know googleAuth — auth.gs is not live',
        'Paste auth.gs in, apply the Code.gs edits, then Deploy > Manage deployments > edit > New version.');
    }
    if (r.error !== 'bad_token') throw bad('expected bad_token, got ' + JSON.stringify(r));
    return 'auth.gs is live';
  });

  console.log('\nEverything that must be refused\n');

  await check('a garbage Google token is refused', async () => {
    const r = await post({ action: 'googleAuth', idToken: 'aaa.bbb.ccc' });
    if (r.ok !== false || r.error !== 'bad_token') throw bad('expected bad_token, got ' + JSON.stringify(r));
  });

  await check('the OLD key-only login is closed', async () => {
    const r = await post({ action: 'auth', key: 'ZZZZ0000' });
    if (r.error === 'google_required') return 'returns google_required';
    if (r.ok === true) throw bad('KEY-ONLY LOGIN STILL WORKS — this is the vulnerability, still open',
      'Apply Code.gs edit 3 of 6 (close the key-only door), then redeploy.');
    if (r.error === 'bad_key') throw bad('handleAuth still runs its old logic (answered bad_key)',
      'Apply Code.gs edit 3 of 6, then redeploy.');
    throw bad('unexpected: ' + JSON.stringify(r));
  });

  await check('student actions are refused with no session', async () => {
    const acts = ['getProgress', 'getAssignments', 'getScoreHistory', 'syncProgress', 'deleteAttempt'];
    for (const a of acts) {
      const r = await post({ action: a, key: 'ZZZZ0000' });
      if (r.ok !== false || r.error !== 'unauthorized') {
        throw bad(a + ' answered ' + JSON.stringify(r) + ' instead of unauthorized',
          'Check STUDENT_ACTIONS in auth.gs, and that Code.gs edit 1 of 6 (authGuard_) is applied.');
      }
    }
    return acts.length + ' actions checked';
  });

  await check('a forged session is refused', async () => {
    const forged = Buffer.from(JSON.stringify({ t: 'session', k: 'ZZZZ0000', s: 'x', v: 0, x: 4102444800 }))
      .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') + '.notavalidsignature';
    const r = await post({ action: 'getProgress', key: 'ZZZZ0000', session: forged });
    if (r.ok !== false || r.error !== 'unauthorized') throw bad('expected unauthorized, got ' + JSON.stringify(r));
  });

  await check('admin actions are refused with no session', async () => {
    const acts = ['getRoster', 'accessRoster', 'listPendingClaims', 'getStudentDetail', 'setStudentArchived'];
    for (const a of acts) {
      const r = await post({ action: a });
      if (r.ok !== false || r.error !== 'unauthorized') {
        throw bad(a + ' answered ' + JSON.stringify(r) + ' instead of unauthorized',
          'Check ADMIN_ACTIONS in auth.gs.');
      }
    }
    return acts.length + ' actions checked';
  });

  await check('the two once-ungated admin tools are closed', async () => {
    for (const a of ['listBlankComposite', 'backfillCompositeFields']) {
      const r = await post({ action: a, patches: [] });
      if (r.ok === true) throw bad(a + ' is STILL OPEN to anyone — it leaks every student key and name',
        'Apply Code.gs edit 4 of 6, then redeploy.');
      if (r.error !== 'unauthorized') throw bad(a + ' answered ' + JSON.stringify(r));
    }
  });

  await check('an invite token cannot be forged', async () => {
    const forged = Buffer.from(JSON.stringify({ t: 'invite', k: 'ZZZZ0000', n: 'x', x: 4102444800 }))
      .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') + '.nope';
    const r = await post({ action: 'claimInvite', idToken: 'aaa.bbb.ccc', invite: forged });
    // Must be a REAL refusal from the invite code path. 'unknown_action' is
    // also ok:false, so a loose check here passes on a deployment that has
    // never heard of invites — a green tick for a feature that is not
    // there, which is worse than a red one.
    if (r.error === 'unknown_action') {
      throw bad('claimInvite does not exist on this deployment — auth.gs is not live',
        'This check only means something once auth.gs is deployed.');
    }
    if (r.ok !== false || (r.error !== 'bad_token' && r.error !== 'invite_expired')) {
      throw bad('expected bad_token or invite_expired, got ' + JSON.stringify(r));
    }
  });

  await check('an approval link cannot be forged', async () => {
    const r = await post({ action: 'decideClaimByToken', token: 'aaa.bbb', decision: 'approve' });
    if (r.ok !== false || r.error !== 'bad_token') throw bad('expected bad_token, got ' + JSON.stringify(r));
  });

  console.log('\nStill public, and should be\n');

  await check('the marketing lead form still works', async () => {
    // Honeypot filled — accepted and silently dropped, exactly as designed,
    // so this creates nothing.
    const r = await post({ action: 'submitLead', name: 'verify', email: 'v@example.com', hp: 'bot' });
    if (r.ok !== true) throw bad('the public lead form is broken: ' + JSON.stringify(r),
      'submitLead must NOT be in STUDENT_ACTIONS or ADMIN_ACTIONS.');
  });

  console.log('\n' + (fail === 0
    ? '\x1b[32m' + pass + ' passed — the deployment refuses everything it should.\x1b[0m\n' +
      'Now walk the signed-in checklist in AUTH_INTEGRATION.md (Step 4).'
    : '\x1b[31m' + fail + ' failed\x1b[0m, ' + pass + ' passed') + '\n');
  notes.forEach(n => console.log('  → ' + n));
  if (notes.length) console.log('');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => {
  console.error('\n\x1b[31mCould not reach the deployment.\x1b[0m ' + (e.message || e));
  console.error('Check the URL is the Web app /exec URL and that "Who has access" is Anyone.\n');
  process.exit(2);
});
