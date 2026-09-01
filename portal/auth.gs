/* =========================================================================
   MORETTI STUDENT PORTAL — AUTH (Google Apps Script, second file)
   -------------------------------------------------------------------------
   THIS IS A SEPARATE FILE ON PURPOSE. Paste it into the same Apps Script
   project as Code.gs, as a NEW script file named `auth` — do not merge it
   into Code.gs. Apps Script gives every .gs file in a project one shared
   global scope, so this file can call Code.gs's helpers (getSheet_,
   findRow_, sheetSafe_, grantFolderAccess_, createFolderForStudent_,
   getAssignments_, testPrepFlags_, accomMultiplier_, isoOrNull_) and
   constants (SHEET_ID, ADMIN_KEY, NOTIFY_EMAIL) directly, with no imports.

   Code.gs itself needs exactly FOUR small edits to route requests here.
   They are written out, line by line, in portal/AUTH_INTEGRATION.md.
   Until those edits are applied this file is inert: nothing calls it, and
   the portal keeps working exactly as it does today.
   ========================================================================= */

/* ═══ SET THESE TWO BEFORE DEPLOYING ═══ */

// The OAuth 2.0 Web client ID from Google Cloud Console. See
// AUTH_INTEGRATION.md step 1 — it takes about four minutes to create.
// This same string also goes into portal/auth-client.js. It is NOT a
// secret (it ships in the page source); the security comes from checking
// that every ID token was issued FOR this client id, in
// verifyGoogleIdToken_ below.
var GOOGLE_CLIENT_ID = 'PASTE_YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com';

// Where the invite link points. Must be the live portal URL, because the
// link is emailed to families — a localhost or preview URL here sends real
// people somewhere that does not exist.
var PORTAL_URL = 'https://morettitutoring.com/portal/';

// How long an emailed invite stays claimable. Long enough that a parent can
// forward it at the weekend, short enough that a stale link in an inbox
// two months later is not still a live door.
var INVITE_TTL_DAYS = 14;

// How long a signed-in student stays signed in without re-authenticating.
// Reissued on every page load (see handleResume), so an actively-used
// portal never expires mid-program; a dormant one dies after this long.
var SESSION_TTL_DAYS = 30;

/* =========================================================================
   GOOGLE SIGN-IN, SESSIONS, AND THE APPROVAL QUEUE
   -------------------------------------------------------------------------
   WHAT CHANGED AND WHY. Before this block existed, a student's Key was the
   entire credential: whoever typed BGD2465 into the portal got that
   student's scores, reports, guardian email, Drive folder and assignments.
   There was no session, no expiry, and no way to revoke access short of
   issuing a new key. That is a bearer token printed on a slip of paper,
   against an endpoint deployed as "Anyone" — fine for a handful of
   students Luca handed keys to in person, not fine for anything wider.

   The key is now a CLAIM CODE, not a password. It is used exactly once,
   to attach a Google account to a roster row, and never again. From then
   on the credential is a verified Google identity plus a signed session.

   THE THREE WAYS IN — and every one of them requires Luca to have acted:

     1. ALREADY PAIRED. The Google account's stable subject id (`sub`)
        matches the GoogleSub column on a row. Straight in. No key.

     2. PRE-APPROVED EMAIL. The Google account's verified email matches
        the GrantedEmail column on a row. Luca typed that address into the
        sheet himself (or the student's pre-Google-sign-in login wrote it),
        so this IS his approval — the account binds to the row on the spot
        and GoogleSub is stamped. This is also what silently migrates the
        existing roster: everyone who has ever logged in already has a
        GrantedEmail, so their first Google sign-in just works.

     3. APPROVAL QUEUE. The account matches nothing, so the portal asks
        for a key. A valid key whose row has no email on file does NOT
        grant access — it files a PENDING CLAIM (PendingEmail/PendingSub/
        PendingName/PendingAt) and emails Luca a one-tap approve link with
        the student's name, key, Google email and profile photo. Nothing
        is readable until he approves. The student's screen polls and lets
        them in the moment he does.

   There is deliberately NO key-only fallback. A key alone is now worth
   nothing: it can start an approval request and that is all.

   WHAT A LEAKED KEY CAN DO NOW. File one approval request that Luca sees,
   with the leaker's real Google account and photo attached to it, which he
   declines. It cannot read anything, and it cannot displace a claim that is
   already pending (see 'claim_pending_other' below) or one already paired
   (see 'key_already_claimed').

   TOKEN VERIFICATION is a single UrlFetchApp call to Google's tokeninfo
   endpoint — no JWT library, no key rotation to manage, no new
   infrastructure. It checks `aud` against our own client id (otherwise any
   Google token issued to ANY app on the internet would validate here),
   `iss`, `exp`, and `email_verified`.

   SESSIONS are HMAC-SHA256 signed, stateless, and 30 days long. The secret
   lives in Script Properties and generates itself on first use. Revocation
   is the TokenVersion column: bump it and every outstanding session for
   that student stops resuming. Because sessions are stateless, a bump
   takes effect at the student's next page load rather than mid-request —
   resetStudentAuth also clears GoogleSub, which fails the resume check for
   the same reason, so "sign them out everywhere" is one admin click and
   lands within one page load.
   ========================================================================= */

// ═══ TOKEN + SESSION PRIMITIVES ═══

// Signing secret for session tokens. Generated once, on first use, and
// kept in Script Properties rather than in this file — a secret committed
// to git is not a secret, and unlike SHEET_ID/ADMIN_KEY this one is worth
// protecting properly because forging it forges logins. Deleting the
// SESSION_SECRET property is a valid "log every student out" panic button.
function sessionSecret_() {
  var props = PropertiesService.getScriptProperties();
  var s = props.getProperty('SESSION_SECRET');
  if (!s) {
    s = Utilities.getUuid() + '.' + Utilities.getUuid() + '.' + String(new Date().getTime());
    props.setProperty('SESSION_SECRET', s);
  }
  return s;
}

function b64url_(s) {
  return Utilities.base64EncodeWebSafe(s).replace(/=+$/, '');
}

function b64urlDecode_(s) {
  var padded = String(s || '');
  while (padded.length % 4 !== 0) padded += '=';
  return Utilities.newBlob(Utilities.base64DecodeWebSafe(padded)).getDataAsString();
}

function hmac_(payloadB64) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(payloadB64, sessionSecret_())
  ).replace(/=+$/, '');
}

// Length-independent, early-exit-free comparison. The timing signal here
// is almost certainly unexploitable across Apps Script's own latency, but
// signature comparison is exactly the place where "almost certainly" is
// not worth writing down as a reason to do it the sloppy way.
function safeEquals_(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  return diff === 0;
}

// Generic signed-blob issue/verify, used for both student sessions and the
// one-tap approval links emailed to Luca. `t` tags what the token is FOR,
// so an approval link can never be replayed as a session or vice versa.
function signToken_(obj, ttlSeconds) {
  obj.x = Math.floor(new Date().getTime() / 1000) + ttlSeconds;
  var body = b64url_(JSON.stringify(obj));
  return body + '.' + hmac_(body);
}

function readToken_(token, expectedType) {
  var parts = String(token || '').split('.');
  if (parts.length !== 2 || !parts[0]) return null;
  if (!safeEquals_(hmac_(parts[0]), parts[1])) return null;
  var obj;
  try { obj = JSON.parse(b64urlDecode_(parts[0])); } catch (e) { return null; }
  if (!obj || obj.t !== expectedType) return null;
  if (!obj.x || Number(obj.x) < Math.floor(new Date().getTime() / 1000)) return null;
  return obj;
}

function issueSession_(key, sub, email, tokenVersion) {
  return signToken_({
    t: 'session',
    k: key,
    s: String(sub),
    e: String(email || ''),
    v: Number(tokenVersion || 0)
  }, SESSION_TTL_DAYS * 86400);
}

function verifySession_(token) {
  return readToken_(token, 'session');
}

// ═══ GOOGLE ID TOKEN VERIFICATION ═══
// Returns { sub, email, name, picture } for a genuine, unexpired, verified
// Google identity issued to THIS app, or null. Everything downstream trusts
// this return value completely, so every check that matters is here.
function verifyGoogleIdToken_(idToken) {
  var raw = String(idToken || '');
  // A real ID token is ~1KB; this bounds what we'll paste into a URL.
  if (!raw || raw.length > 8192 || raw.indexOf('.') === -1) return null;
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.indexOf('PASTE_YOUR') === 0) {
    console.error('GOOGLE_CLIENT_ID is not set — every sign-in will fail. See the deployment guide.');
    return null;
  }
  var res;
  try {
    res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(raw),
      { muteHttpExceptions: true }
    );
  } catch (e) {
    console.error('tokeninfo fetch failed: ' + e);
    return null;
  }
  if (res.getResponseCode() !== 200) return null;
  var info;
  try { info = JSON.parse(res.getContentText()); } catch (e) { return null; }
  if (!info) return null;
  // THE check. Without it, an ID token minted for any other Google-signin
  // app on the internet would verify here and log its holder in.
  if (info.aud !== GOOGLE_CLIENT_ID) return null;
  if (info.iss !== 'accounts.google.com' && info.iss !== 'https://accounts.google.com') return null;
  if (!info.exp || Number(info.exp) < Math.floor(new Date().getTime() / 1000)) return null;
  // Google issues tokens for unverified addresses on some Workspace
  // configurations; an unverified address is not an identity.
  if (String(info.email_verified) !== 'true') return null;
  if (!info.sub || !info.email) return null;
  return {
    sub: String(info.sub),
    email: String(info.email).trim().toLowerCase(),
    name: String(info.name || '').trim(),
    picture: String(info.picture || '')
  };
}

// ═══ SHEET PLUMBING ═══

// Auto-creates the columns this block needs, the same way
// handleSaveOnboardingPrefs auto-creates the onboarding ones — so nobody
// has to prepare the sheet by hand before deploying this.
function ensureAuthColumns_(sheet) {
  var headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  ['GoogleSub', 'PendingEmail', 'PendingSub', 'PendingName', 'PendingAt', 'TokenVersion', 'OnboardedAt'].forEach(function (col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col);
      headers.push(col);
    }
  });
  return headers;
}

function headerIndex_(headers, name) {
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === name) return i;
  }
  return -1;
}

function rowObject_(data, headers, i) {
  var row = { _rowIndex: i + 1, _headers: headers };
  headers.forEach(function (h, idx) { row[h] = data[i][idx]; });
  return row;
}

function setCell_(sheet, row, colName, value) {
  var i = headerIndex_(row._headers, colName);
  if (i === -1) return;
  sheet.getRange(row._rowIndex, i + 1).setValue(value);
  row[colName] = value;
}

// sheetSafe_ can prefix a cell with ' to defuse formula injection; strip
// it back off when reading, so a stored value still compares equal to what
// the client sends.
function cellText_(v) {
  return String(v == null ? '' : v).trim().replace(/^'/, '');
}

/* Does this look like a name a person would put on a roster? Same test the
   portal's old name-capture step used (non-empty, contains a space, i.e. a
   first AND last name) — kept identical on purpose, because that step is
   what this replaces.

   Why it matters: Google profile names are whatever the account holder
   typed. Plenty are "alex", a nickname, a school account's login string, or
   empty. The old flow could not produce a bad name because a human had to
   type one that passed this test; auto-filling from Google silently can.
   So a Google name that fails this is NOT written to the roster — the row's
   Name is left blank, which raises needsName and asks the student, exactly
   as before. A name Luca typed himself is never second-guessed. */
function isFullName_(v) {
  var n = cellText_(v);
  return !!n && n.indexOf(' ') !== -1;
}

// One pass over the roster, matching the Google identity two ways in
// priority order: the immutable `sub` first (an account keeps its sub
// forever, even if the person changes the address on it), then the
// verified email (which is what pairs a pre-filled row, and what silently
// migrates every student who logged in before Google sign-in existed).
function findStudentByGoogle_(sheet, sub, email) {
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var subCol = headerIndex_(headers, 'GoogleSub');
  var emailCol = headerIndex_(headers, 'GrantedEmail');
  var i;
  if (subCol !== -1 && sub) {
    for (i = 1; i < data.length; i++) {
      if (cellText_(data[i][subCol]) === sub) {
        return { row: rowObject_(data, headers, i), matched: 'sub' };
      }
    }
  }
  if (emailCol !== -1 && email) {
    for (i = 1; i < data.length; i++) {
      if (cellText_(data[i][emailCol]).toLowerCase() !== email) continue;
      // An email match must NEVER override an existing pairing. Google
      // treats an address as belonging to one account, but that is a
      // property of Google's account system, not something this code
      // should depend on: if a second Google account ever presented a
      // verified address that already sits on a row paired to a different
      // `sub` (an address reclaimed after deletion, a Workspace/consumer
      // collision), matching on email here would silently rebind the row
      // to the newcomer and hand them the student's whole record. Once
      // GoogleSub is set it is the only thing that opens that row; anyone
      // else falls through to the claim path, where the mismatch is caught
      // and reported as key_already_claimed.
      if (subCol !== -1 && cellText_(data[i][subCol]) && cellText_(data[i][subCol]) !== sub) continue;
      return { row: rowObject_(data, headers, i), matched: 'email' };
    }
  }
  return null;
}

function findPendingBySub_(sheet, sub) {
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var col = headerIndex_(headers, 'PendingSub');
  if (col === -1 || !sub) return null;
  for (var i = 1; i < data.length; i++) {
    if (cellText_(data[i][col]) === sub) return rowObject_(data, headers, i);
  }
  return null;
}

/* ═══ AUTH LOG ═══ every sign-in, claim, approval and rejection lands
   here, on its own tab, created on first write. This is the "and log it"
   half of the security fix: without it, the only record that anyone ever
   logged in is a single GrantedAt timestamp that is overwritten never and
   tells you nothing about the fifty logins after the first. Columns:
   Timestamp | Event | Key | Email | Sub | Detail. Safe to delete rows from
   or clear entirely; nothing reads it back. */
function getAuthLogSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('AuthLog');
  if (!sheet) {
    sheet = ss.insertSheet('AuthLog');
    sheet.appendRow(['Timestamp', 'Event', 'Key', 'Email', 'Sub', 'Detail']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function logAuth_(event, key, email, sub, detail) {
  try {
    getAuthLogSheet_().appendRow([
      new Date(),
      sheetSafe_(event),
      sheetSafe_(key || ''),
      sheetSafe_(email || ''),
      sheetSafe_(sub || ''),
      sheetSafe_(detail || '')
    ]);
  } catch (e) {
    // Logging must never be the reason a student can't log in.
    console.error('logAuth_ failed: ' + e);
  }
}

// ═══ FIRST-LOGIN HOUSEKEEPING ═══
// The folder-create + folder-share + GrantedAt/GrantedEmail stamping that
// used to be spread across handleAuthLocked_'s two branches, pulled out so
// every path into the portal (Google match, pre-approved email, approved
// claim) does exactly the same thing exactly once. Idempotent: everything
// here is gated on the cell it writes still being empty, so a returning
// student never re-triggers a Drive share email — that repeated
// "shared with you" mail was a real past bug, see grantFolderAccess_.
function ensureFolderAndGrant_(sheet, row, email, name) {
  if (!row.DriveFolderUrl) {
    // Deliberately row.Name ONLY, never the caller's Google name. An
    // unvetted Google name is not written to the roster (see isFullName_),
    // so letting it name the folder would produce a folder called
    // "alex — ABC123" for a student the roster calls "Alex Reed", and
    // nothing would ever reconcile the two — a folder is named once, at
    // creation. Leaving it unnamed here is the signal
    // renameFolderIfUnnamed_ looks for when the real name arrives moments
    // later via setName.
    var url = createFolderForStudent_(cellText_(row.Name), cellText_(row.Key));
    setCell_(sheet, row, 'DriveFolderUrl', url);
  }
  if (!cellText_(row.GrantedEmail) && email) {
    setCell_(sheet, row, 'GrantedEmail', sheetSafe_(email));
  }
  if (!row.GrantedAt) {
    grantFolderAccess_(row.DriveFolderUrl, email || cellText_(row.GrantedEmail));
    setCell_(sheet, row, 'GrantedAt', new Date());
  }
  return row.GrantedAt || null;
}

/* ═══ ACTION: googleAuth ═══ the front door. Called with nothing but a
   Google ID token; decides which of the three ways in (see the block
   comment at the top) this account qualifies for. */
function handleGoogleAuth(rawIdToken) {
  var id = verifyGoogleIdToken_(rawIdToken);
  if (!id) return { ok: false, error: 'bad_token' };

  // Same lock, same reason as handleAuth: the client retries slow calls,
  // and two overlapping first-logins would otherwise both create a folder
  // and both fire a Drive share email.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (lockErr) {
    return { ok: false, error: 'busy_try_again' };
  }
  try {
    var sheet = getSheet_();
    ensureAuthColumns_(sheet);
    var hit = findStudentByGoogle_(sheet, id.sub, id.email);

    if (!hit) {
      var pending = findPendingBySub_(sheet, id.sub);
      if (pending) {
        return { ok: true, pending: true, name: cellText_(pending.PendingName) || id.name, email: id.email };
      }
      // Not on the roster under this identity and nothing pending — the
      // portal will ask for a claim code next. Deliberately says nothing
      // about whether any roster row exists.
      return { ok: true, needsKey: true, email: id.email, name: id.name };
    }

    return loginRow_(sheet, hit, id, hit.matched);
  } finally {
    lock.releaseLock();
  }
}

/* The shared "this account owns this row, let them in" block. Every path
   that ends in a logged-in student goes through it — first Google sign-in,
   a claim that resolved to an existing pairing, and the approval poll — so
   the three cannot drift into pairing, sharing the Drive folder or issuing
   sessions in three subtly different ways. MUST be called with the script
   lock held: it can create a Drive folder and send a share invitation, and
   two concurrent callers doing that is the duplicate-"shared with you"-email
   bug documented above handleAuth in Code.gs. */
function loginRow_(sheet, hit, id, detail) {
  var row = hit.row;
  var key = cellText_(row.Key).toUpperCase();
  if (hit.matched === 'email') {
    // Pre-approved address, or a pre-Google-sign-in student migrating.
    // Bind the sub so future logins take the fast path and so the pairing
    // survives the person later changing the address on their account.
    setCell_(sheet, row, 'GoogleSub', id.sub);
    logAuth_('pair_by_email', key, id.email, id.sub, 'matched pre-filled GrantedEmail');
  }
  if (isFullName_(id.name) && !cellText_(row.Name)) setCell_(sheet, row, 'Name', sheetSafe_(id.name));
  var grantedAt = ensureFolderAndGrant_(sheet, row, id.email, id.name);
  logAuth_('login', key, id.email, id.sub, detail || hit.matched);
  return studentPayload_(row, grantedAt, issueSession_(key, id.sub, id.email, Number(row.TokenVersion || 0)));
}

/* ═══ ACTION: claimKey ═══ a verified Google account presenting a claim
   code. Never grants access on its own unless Luca pre-filled the matching
   email; otherwise it files a request and stops. */
function handleClaimKey(rawIdToken, rawKey, rawName) {
  var id = verifyGoogleIdToken_(rawIdToken);
  if (!id) return { ok: false, error: 'bad_token' };
  var key = String(rawKey || '').trim().toUpperCase();
  if (!key) return { ok: false, error: 'missing_key' };
  var name = String(rawName || '').trim();

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (lockErr) {
    return { ok: false, error: 'busy_try_again' };
  }
  try {
    var sheet = getSheet_();
    ensureAuthColumns_(sheet);

    // If this account already resolves to a row, the key is irrelevant —
    // just log them in rather than making them care why.
    var already = findStudentByGoogle_(sheet, id.sub, id.email);
    if (already) return loginRow_(sheet, already, id, 'resolved during claim');

    var row = findRow_(sheet, key);
    if (!row) {
      logAuth_('claim_bad_key', key, id.email, id.sub, '');
      return { ok: false, error: 'bad_key' };
    }
    // findRow_ predates ensureAuthColumns_ and may have read the header row
    // before the new columns existed on this execution; re-read them.
    row._headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    var boundSub = cellText_(row.GoogleSub);
    if (boundSub && boundSub !== id.sub) {
      logAuth_('claim_rejected', key, id.email, id.sub, 'key already paired to another Google account');
      return { ok: false, error: 'key_already_claimed' };
    }
    var boundEmail = cellText_(row.GrantedEmail).toLowerCase();
    if (boundEmail && boundEmail !== id.email) {
      logAuth_('claim_rejected', key, id.email, id.sub, 'key is linked to ' + boundEmail);
      return { ok: false, error: 'email_mismatch' };
    }

    if (boundEmail === id.email) {
      // Luca typed this address into the row himself. That IS the approval.
      setCell_(sheet, row, 'GoogleSub', id.sub);
      if (isFullName_(name) && !cellText_(row.Name)) setCell_(sheet, row, 'Name', sheetSafe_(name));
      var grantedAt = ensureFolderAndGrant_(sheet, row, id.email, name || id.name);
      logAuth_('pair_preapproved', key, id.email, id.sub, 'claim code + pre-filled email');
      return studentPayload_(row, grantedAt, issueSession_(key, id.sub, id.email, Number(row.TokenVersion || 0)));
    }

    // A claim is already pending on this row from a DIFFERENT account.
    // Refusing rather than overwriting matters: otherwise anyone holding a
    // leaked key could replace a real student's pending request seconds
    // before Luca taps approve, and he'd approve the wrong person.
    var pendingSub = cellText_(row.PendingSub);
    if (pendingSub && pendingSub !== id.sub) {
      logAuth_('claim_rejected', key, id.email, id.sub, 'another claim already pending on this key');
      return { ok: false, error: 'claim_pending_other' };
    }

    if (isFullName_(name) && !cellText_(row.Name)) setCell_(sheet, row, 'Name', sheetSafe_(name));
    setCell_(sheet, row, 'PendingEmail', sheetSafe_(id.email));
    setCell_(sheet, row, 'PendingSub', id.sub);
    setCell_(sheet, row, 'PendingName', sheetSafe_(id.name || name));
    setCell_(sheet, row, 'PendingAt', new Date());
    logAuth_('claim_pending', key, id.email, id.sub, id.name || name);
    sendClaimApprovalEmail_(row, id, key);
    return { ok: true, pending: true, name: cellText_(row.Name) || id.name, email: id.email };
  } finally {
    lock.releaseLock();
  }
}

/* ═══ ACTION: claimStatus ═══ polled by a waiting student's browser every
   few seconds. Returns the full login the instant Luca approves, so nobody
   has to know to refresh. A rejected claim clears the Pending cells, so
   this falls back to needsKey and the portal says so. */
function handleClaimStatus(rawIdToken) {
  var id = verifyGoogleIdToken_(rawIdToken);
  if (!id) return { ok: false, error: 'bad_token' };
  var sheet = getSheet_();
  // Unlocked read first: the overwhelmingly common answer to this poll is
  // "still waiting", and taking a script lock every few seconds per waiting
  // student, just to be told nothing changed, would serialise the whole
  // backend behind a spinner.
  if (!findStudentByGoogle_(sheet, id.sub, id.email)) {
    if (findPendingBySub_(sheet, id.sub)) return { ok: true, pending: true };
    return { ok: true, needsKey: true, email: id.email, name: id.name };
  }
  // Something changed — take the lock and re-read, because the approval
  // that just landed may still have been mid-write when we looked.
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (lockErr) { return { ok: false, error: 'busy_try_again' }; }
  try {
    var hit = findStudentByGoogle_(sheet, id.sub, id.email);
    if (!hit) return { ok: true, pending: true };
    return loginRow_(sheet, hit, id, 'after approval');
  } finally {
    lock.releaseLock();
  }
}

/* ═══ ACTION: resume ═══ what makes a session a session. The portal keeps
   the signed token in localStorage and calls this on load, so a returning
   student lands in the portal without re-signing-in and without ever
   retyping a key. Re-checks the pairing against the sheet on every resume
   rather than trusting the token alone, which is what makes unpairing a
   student in admin.html actually lock them out. */
function handleResume(rawSession) {
  var p = verifySession_(rawSession);
  if (!p) return { ok: false, error: 'bad_session' };
  var sheet = getSheet_();
  var row = findRow_(sheet, String(p.k || '').toUpperCase());
  if (!row) return { ok: false, error: 'bad_session' };
  if (cellText_(row.GoogleSub) !== String(p.s)) return { ok: false, error: 'session_revoked' };
  if (Number(row.TokenVersion || 0) !== Number(p.v || 0)) return { ok: false, error: 'session_revoked' };
  var key = cellText_(row.Key).toUpperCase();
  // Reissued on every resume, so an actively-used portal never expires out
  // from under a student mid-program; a dormant one still dies in 30 days.
  return studentPayload_(row, row.GrantedAt || null, issueSession_(key, p.s, p.e, Number(row.TokenVersion || 0)));
}

/* ═══ ACTION: setName ═══ the surviving half of the retired name-capture
   beat. Reached only when the roster cell is blank (see needsName in
   studentPayload_) — a name Luca typed is never overwritten, and neither
   is one already stored. Session-authenticated, so the row it writes to is
   the session's own row and nothing else. */
function handleSetName(rawSession, rawName) {
  var p = verifySession_(rawSession);
  if (!p) return { ok: false, error: 'unauthorized' };
  var name = String(rawName || '').trim().replace(/\s+/g, ' ');
  // Same rule the old capture step enforced, plus a length bound because
  // this string ends up in a sheet cell, in emails, and in the greeting.
  if (!isFullName_(name) || name.length > 80) return { ok: false, error: 'bad_name' };

  var sheet = getSheet_();
  ensureAuthColumns_(sheet);
  var row = findRow_(sheet, String(p.k || '').toUpperCase());
  if (!row) return { ok: false, error: 'unauthorized' };
  if (cellText_(row.GoogleSub) !== String(p.s)) return { ok: false, error: 'session_revoked' };
  // Never an overwrite. If a name landed between the client asking and
  // answering, that one wins and the student is simply let through.
  if (!cellText_(row.Name)) {
    setCell_(sheet, row, 'Name', sheetSafe_(name));
    renameFolderIfUnnamed_(row.DriveFolderUrl, name, cellText_(row.Key));
    logAuth_('name_set', cellText_(row.Key), cellText_(row.GrantedEmail), p.s, name);
  }
  return studentPayload_(row, row.GrantedAt || null, rawSession);
}

/* Code.gs names a student's Drive folder "Name — KEY" at the moment it
   creates it. When the row had no name yet — which is now the normal case
   for a student who supplies their own name at sign-in — that produces a
   folder literally called " — ABC123", and nothing ever fixed it, because
   the folder is only ever created once. The name arrives seconds later via
   setName; this renames the folder to match. Only touches a folder that
   still carries the unnamed form, so a folder Luca renamed by hand is left
   exactly as he left it. */
function renameFolderIfUnnamed_(url, name, key) {
  if (!url || !name) return;
  try {
    var folder = DriveApp.getFolderById(extractFolderId_(url));
    var current = String(folder.getName() || '').trim();
    if (current && current.charAt(0) !== '\u2014') return;  // already has a real name
    folder.setName(key ? (name + ' \u2014 ' + key) : name);
  } catch (err) {
    console.error('renameFolderIfUnnamed_ failed: ' + err);
  }
}

/* Stamped the moment a saveOnboardingPrefs request arrives — see the
   needsOnboarding comment in studentPayload_ for why this does not simply
   read the column that request is about to write. Write-once: the Settings
   pane reuses the same action for ordinary edits, and those must not keep
   re-stamping (or cost a write) forever. */
function noteOnboarded_(key) {
  try {
    var sheet = getSheet_();
    ensureAuthColumns_(sheet);
    var row = findRow_(sheet, String(key || '').toUpperCase());
    if (!row || row.OnboardedAt) return;
    setCell_(sheet, row, 'OnboardedAt', new Date());
  } catch (e) {
    // Never the reason a student's preferences fail to save.
    console.error('noteOnboarded_ failed: ' + e);
  }
}

/* Do the roster name and the name on the Google account look like the same
   person? Token overlap, deliberately loose — "Owen Chen" vs "owen chen",
   "Owen T. Chen", "chen owen" all match; "Owen Chen" vs "Sarah Chen" does
   not, and neither does "Owen Chen" vs "sarahc2011".

   This exists for ONE failure mode, and it is the likeliest one in the
   whole design. Keys get handed to a parent, because that is who Luca is
   talking to at signup. A parent who opens the portal on their own phone
   signs in as THEMSELVES, types the key, and files a claim that pairs the
   student's row to the parent's Google account. Nothing above catches it —
   it is a perfectly valid claim on a perfectly valid key. The only thing
   standing between that and a student who cannot log into their own portal
   is Luca reading the approval email properly, so when the names disagree
   the email says so loudly instead of looking like every other request.
   Returns false (no warning) when there is no roster name to compare. */
function namesLookDifferent_(rosterName, googleName) {
  function firstName(v) {
    var t = cellText_(v).toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
      .filter(function (x) { return x.length > 1; });
    return t.length ? t[0] : '';
  }
  var a = firstName(rosterName), b = firstName(googleName);
  if (!a || !b) return false;          // nothing to compare — never guess
  if (a === b) return false;
  // Nicknames: Will/William, Ben/Benjamin, Alex/Alexandra. A shortened form
  // is a prefix of the full one, and treating those as a match is what keeps
  // the warning rare enough that Luca still reads it when it does appear.
  if (a.indexOf(b) === 0 || b.indexOf(a) === 0) return false;
  return true;
}

/* ═══ APPROVAL EMAIL ═══ the whole point of the queue is that approving is
   one tap on Luca's phone, not a task he has to remember to go do. The
   link opens a confirmation page served by this same web app (see doGet) —
   a page with buttons, not a bare approve-on-GET URL, because mail
   scanners and link previewers follow GET links automatically and would
   otherwise approve strangers on his behalf. */
function sendClaimApprovalEmail_(row, id, key) {
  try {
    var token = signToken_({ t: 'claim', k: key, s: id.sub }, 14 * 86400);
    var base = ScriptApp.getService().getUrl();
    var link = base + '?claim=' + encodeURIComponent(token);
    var name = cellText_(row.Name) || id.name || '(no name on file)';
    var photo = id.picture
      ? '<img src="' + id.picture + '" width="64" height="64" style="border-radius:50%;display:block;margin-bottom:12px;" alt="">'
      : '';
    var mismatch = namesLookDifferent_(cellText_(row.Name), id.name);
    var mismatchHtml = mismatch
      ? '<p style="background:#FEF3C7;border-left:4px solid #D97706;padding:12px 14px;margin:0 0 16px;">' +
        '<b>Check this one.</b> The Google account is named <b>' + authEsc_(id.name) + '</b>, but this key is ' +
        'for <b>' + authEsc_(name) + '</b>. If a parent signed in on their own account by mistake, decline — ' +
        'the portal is the student\'s, and approving this would lock the student out of their own row.</p>'
      : '';
    var mismatchText = mismatch
      ? '\n*** CHECK: the Google account is named "' + (id.name || '') + '" but this key is for "' + name +
        '". If a parent signed in on their own account, decline. ***\n'
      : '';
    var html =
      '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;">' +
      '<h2 style="margin:0 0 4px;">Portal access request</h2>' +
      '<p style="margin:0 0 18px;color:#666;">Someone signed in with a Google account and entered a valid access key. ' +
      'They cannot see anything until you approve.</p>' +
      mismatchHtml +
      photo +
      '<table cellpadding="6" style="border-collapse:collapse;font-size:15px;">' +
      '<tr><td style="color:#888;">Roster name</td><td><b>' + authEsc_(name) + '</b></td></tr>' +
      '<tr><td style="color:#888;">Access key</td><td><b>' + authEsc_(key) + '</b></td></tr>' +
      '<tr><td style="color:#888;">Google name</td><td>' + authEsc_(id.name || '—') + '</td></tr>' +
      '<tr><td style="color:#888;">Google email</td><td><b>' + authEsc_(id.email) + '</b></td></tr>' +
      '</table>' +
      '<p style="margin:22px 0 8px;"><a href="' + link + '" ' +
      'style="background:#B0271C;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">' +
      'Review this request</a></p>' +
      '<p style="color:#888;font-size:13px;margin-top:16px;">Approve only if that email belongs to the student you gave key ' +
      authEsc_(key) + ' to. If you do not recognise it, decline — declining is harmless and they keep no access either way. ' +
      'You can also handle this from the Pending tab in admin.html.</p>' +
      '</div>';
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: (mismatch ? '[check] ' : '') + 'Portal access request — ' + name + ' (' + id.email + ')',
      htmlBody: html,
      body: 'Portal access request\n' + mismatchText + '\nRoster name: ' + name + '\nKey: ' + key +
            '\nGoogle name: ' + (id.name || '-') + '\nGoogle email: ' + id.email +
            '\n\nReview: ' + link
    });
  } catch (e) {
    // A mail failure must not lose the request — it is on the sheet and in
    // admin.html's Pending tab regardless.
    console.error('sendClaimApprovalEmail_ failed: ' + e);
  }
}

/* Deliberately NOT named escapeHtml_: Code.gs already defines a function
   by that name, and two files in one Apps Script project share a single
   global scope, so a duplicate would silently shadow one or the other
   depending on file order. This one also escapes quotes, which Code.gs's
   does not. */
function authEsc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ═══ APPROVE / DECLINE ═══ reachable two ways, both of which prove it is
   Luca: the ADMIN_KEY (admin.html's Pending tab) or a signed 'claim' token
   that only ever existed inside an email sent to NOTIFY_EMAIL. */
function decideClaim_(key, decision, actor) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (e) { return { ok: false, error: 'busy_try_again' }; }
  try {
    var sheet = getSheet_();
    ensureAuthColumns_(sheet);
    var row = findRow_(sheet, String(key || '').trim().toUpperCase());
    if (!row) return { ok: false, error: 'bad_key' };
    row._headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    var pendEmail = cellText_(row.PendingEmail).toLowerCase();
    var pendSub = cellText_(row.PendingSub);
    if (!pendSub) return { ok: false, error: 'no_pending_claim' };

    if (decision === 'approve') {
      setCell_(sheet, row, 'GoogleSub', pendSub);
      if (!cellText_(row.GrantedEmail)) setCell_(sheet, row, 'GrantedEmail', sheetSafe_(pendEmail));
      if (!cellText_(row.Name) && isFullName_(row.PendingName)) setCell_(sheet, row, 'Name', sheetSafe_(cellText_(row.PendingName)));
      ensureFolderAndGrant_(sheet, row, pendEmail, cellText_(row.PendingName));
      clearPending_(sheet, row);
      logAuth_('claim_approved', cellText_(row.Key), pendEmail, pendSub, 'by ' + actor);
      notifyStudentApproved_(pendEmail, cellText_(row.Name));
      return { ok: true, decision: 'approve', name: cellText_(row.Name), email: pendEmail };
    }

    clearPending_(sheet, row);
    logAuth_('claim_declined', cellText_(row.Key), pendEmail, pendSub, 'by ' + actor);
    return { ok: true, decision: 'decline', name: cellText_(row.Name), email: pendEmail };
  } finally {
    lock.releaseLock();
  }
}

function clearPending_(sheet, row) {
  ['PendingEmail', 'PendingSub', 'PendingName', 'PendingAt'].forEach(function (c) {
    setCell_(sheet, row, c, '');
  });
}

function notifyStudentApproved_(email, name) {
  if (!email) return;
  try {
    MailApp.sendEmail({
      to: email,
      subject: "You're set up on the Moretti student portal",
      htmlBody:
        '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;">' +
        '<p>Hi' + (name ? ' ' + authEsc_(String(name).split(' ')[0]) : '') + ',</p>' +
        '<p>Your portal access is approved. Sign in any time at ' +
        '<a href="https://morettitutoring.com/portal/">morettitutoring.com/portal</a> with the same Google account — ' +
        'you will not need your access key again.</p>' +
        '<p>— Luca</p></div>',
      body: 'Your portal access is approved. Sign in at https://morettitutoring.com/portal/ with the same Google account. ' +
            'You will not need your access key again. — Luca'
    });
  } catch (e) {
    console.error('notifyStudentApproved_ failed: ' + e);
  }
}

// ═══ ADMIN ACTIONS ═══

function handleListPendingClaims(rawAdminKey) {
  if (String(rawAdminKey || '') !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var sheet = getSheet_();
  ensureAuthColumns_(sheet);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var iKey = headerIndex_(headers, 'Key');
  var iName = headerIndex_(headers, 'Name');
  var iPE = headerIndex_(headers, 'PendingEmail');
  var iPS = headerIndex_(headers, 'PendingSub');
  var iPN = headerIndex_(headers, 'PendingName');
  var iPA = headerIndex_(headers, 'PendingAt');
  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (iPS === -1 || !cellText_(data[i][iPS])) continue;
    out.push({
      key: cellText_(data[i][iKey]),
      rosterName: iName === -1 ? '' : cellText_(data[i][iName]),
      email: iPE === -1 ? '' : cellText_(data[i][iPE]),
      googleName: iPN === -1 ? '' : cellText_(data[i][iPN]),
      requestedAt: iPA === -1 ? null : isoOrNull_(data[i][iPA])
    });
  }
  return { ok: true, pending: out };
}

function handleDecideClaim(rawAdminKey, rawKey, rawDecision) {
  if (String(rawAdminKey || '') !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var decision = rawDecision === 'approve' ? 'approve' : 'decline';
  return decideClaim_(rawKey, decision, 'admin.html');
}

/* Take a student's row back to "never logged in". The reason this exists is
   the wrong-approval case: a parent holding their child's key signs in as
   themselves, Luca taps approve without reading, and now the parent's
   account owns the student's row.

   Undoing that means undoing ALL THREE things approval did, not just the
   pairing:

     GoogleSub    cleared — the account no longer resolves to this row.
     TokenVersion bumped  — every session they already hold stops resuming.
     GrantedEmail cleared — WITHOUT this the reset does nothing. The
                  approval wrote the wrong address there, and
                  findStudentByGoogle_ matches on GrantedEmail, so the same
                  account would sign straight back in on its next visit.
     GrantedAt    cleared — so the next (correct) login re-runs the folder
                  share for the person who should actually have it.
     Drive access revoked for the old address — the point of this whole
                  change is that the wrong person cannot read the student's
                  files, and leaving them as a Viewer on the folder would
                  leave exactly that in place. Clearing a cell does not
                  un-share a Drive folder; this does.

   Everything that is genuinely the student's — scores, reports, attempts,
   assignments, the folder itself — is untouched. Only the login resets. */
function handleResetStudentAuth(rawAdminKey, rawKey) {
  if (String(rawAdminKey || '') !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var sheet = getSheet_();
  ensureAuthColumns_(sheet);
  var row = findRow_(sheet, String(rawKey || '').trim().toUpperCase());
  if (!row) return { ok: false, error: 'bad_key' };
  row._headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var was = cellText_(row.GrantedEmail);
  if (was) revokeFolderAccess_(row.DriveFolderUrl, was);
  setCell_(sheet, row, 'GoogleSub', '');
  setCell_(sheet, row, 'GrantedEmail', '');
  setCell_(sheet, row, 'GrantedAt', '');
  setCell_(sheet, row, 'TokenVersion', Number(row.TokenVersion || 0) + 1);
  clearPending_(sheet, row);
  logAuth_('auth_reset', cellText_(row.Key), was, '', 'by admin.html; drive access revoked');
  return { ok: true, revokedEmail: was };
}

/* The mirror of Code.gs's grantFolderAccess_. Same defensive shape: a bad
   URL or a missing folder is a no-op, and a failure is logged rather than
   thrown, because a reset that half-works must still clear the sheet. */
function revokeFolderAccess_(url, email) {
  if (!url || !email) return;
  try {
    var folder = DriveApp.getFolderById(extractFolderId_(url));
    folder.removeViewer(email);
    folder.removeEditor(email);
  } catch (err) {
    console.error('Could not revoke folder access for ' + email + ': ' + err);
  }
}

/* ═══ THE STUDENT PAYLOAD ═══ exactly what handleAuthLocked_ in Code.gs
   used to return, plus a `session`. Every way into the portal funnels
   through here so there is one definition of "what a logged-in student
   gets", instead of the shape being retyped at each entry point and
   drifting. When Code.gs gains a new per-student field, add it HERE — the
   integration patch points handleAuthLocked_'s own return at this
   function, so there is only one list to keep up to date. */
function studentPayload_(row, grantedAtValue, session) {
  var flags = testPrepFlags_(row);
  var key = cellText_(row.Key).toUpperCase();
  return {
    ok: true,
    session: session || null,
    key: key,
    name: row.Name,
    needsEmail: false,
    email: cellText_(row.GrantedEmail),
    driveFolderUrl: row.DriveFolderUrl || '',
    satTaken: !!row.SATTakenAt,
    testPrep: flags.testPrep,
    showSat: flags.showSat,
    grantedAt: isoOrNull_(grantedAtValue),
    /* Does index.html's first-login onboarding sequence still need to run?

       The old signal was "GrantedEmail is blank", which is dead under
       Google sign-in: that cell is filled the moment Luca approves a claim,
       i.e. BEFORE the student has ever seen a screen.

       OnboardedAt is the replacement, stamped by authGuard_ the instant a
       saveOnboardingPrefs request arrives (see noteOnboarded_). Deliberately
       NOT inferred from AccomTimeMult alone: the sequence submits ONCE, at
       its final beat, fire-and-forget with a .catch that swallows failures
       (see index.html's accommodations handler), and it hands that write to
       Code.gs's handler which validates before writing. Making the "have
       they onboarded" flag depend on that write succeeding turns a swallowed
       network blip into "replay all nine beats on next login."

       AccomTimeMult is still honoured as a fallback so the ~9 students who
       onboarded before OnboardedAt existed are not sent through it again. */
    needsOnboarding: !row.OnboardedAt && !cellText_(row.AccomTimeMult),

    /* Ask the student for their name before handing them to the portal.
       Only ever true when the roster cell is genuinely blank — Luca's own
       typed names are never questioned, and a Google name good enough to
       store has already been stored (see isFullName_). This is what is left
       of the retired name-capture beat, and it is not optional politeness:
       settle() and the onboarding welcome both do name.split(' ')[0], so a
       blank name renders the portal's greeting as "Hey ." */
    needsName: !cellText_(row.Name),
    testDate: isoOrNull_(row.TestDate),
    accomTimeMult: accomMultiplier_(row.AccomTimeMult),
    accomBreakMult: accomMultiplier_(row.AccomBreakMult),
    baselineType: row.BaselineType || null,
    baselineRw: row.BaselineRW || null,
    baselineMath: row.BaselineMath || null,
    guardianName: row.GuardianName || null,
    guardianEmail: row.GuardianEmail || null,
    targetScore: row.TargetScore || null,
    tests: [],
    assignments: getAssignments_(key, row.Name)
  };
}

/* =========================================================================
   ROUTING — the two functions Code.gs's doPost calls into.
   -------------------------------------------------------------------------
   Kept here rather than as a growing else-if chain inside doPost so that
   adding or tightening an auth rule never means editing Code.gs again.
   ========================================================================= */

/* Actions a signed-in STUDENT may perform. Everything in this list gets
   its `key` OVERWRITTEN with the key inside the caller's signed session
   before it reaches its handler — so a valid session for one student
   cannot be pointed at another student's row by editing the request body,
   which is the single most obvious attack against a design where the row
   selector travels in the payload. Anything not listed here is either
   public (submitLead, version, the auth actions themselves) or admin-only
   (its handler checks ADMIN_KEY itself).

   ADDING A NEW STUDENT ACTION TO Code.gs? Add its name here too. A missing
   entry fails OPEN — the action would run unauthenticated. */
var STUDENT_ACTIONS = [
  'nextSession', 'markDiagnosticTaken', 'submitDiagnostic', 'toggleAssignment',
  'getAssignments', 'getAssignmentsCalendar', 'assignHomeworkFromDialog',
  'submitPracticeTest', 'syncProgress', 'saveQuestion', 'addIncorrectQuestion',
  'updateCollections', 'syncVocabProgress', 'syncQbAttempts', 'getProgress',
  'saveOnboardingPrefs', 'syncScoreHistory', 'getScoreHistory', 'deleteAttempt'
];

/* Returns null to mean "carry on", or an { ok:false } object that doPost
   should return immediately instead of dispatching. Mutates body.key on
   success — see the comment on STUDENT_ACTIONS. */
function authGuard_(body) {
  if (!body || STUDENT_ACTIONS.indexOf(body.action) === -1) return null;
  var p = verifySession_(body.session);
  if (!p) return { ok: false, error: 'unauthorized' };
  body.key = String(p.k || '').toUpperCase();
  // The one side effect this guard has, and it is here rather than in
  // Code.gs's handler because that handler is not ours to edit and because
  // recording "they finished onboarding" must not depend on the rest of
  // that request succeeding. See noteOnboarded_.
  if (body.action === 'saveOnboardingPrefs') noteOnboarded_(body.key);
  return null;
}

/* Handles the auth-specific actions. Returns null if `body.action` is not
   one of them, so doPost can fall through to its existing chain. */
function authRoute_(body) {
  if (!body) return null;
  switch (body.action) {
    case 'googleAuth':   return handleGoogleAuth(body.idToken);
    case 'claimKey':     return handleClaimKey(body.idToken, body.key, body.name);
    case 'claimStatus':  return handleClaimStatus(body.idToken);
    case 'resume':       return handleResume(body.session);
    case 'setName':      return handleSetName(body.session, body.name);
    case 'claimInvite':  return handleClaimInvite(body.idToken, body.invite);
    case 'createStudent':return handleCreateStudent(body.adminKey, body.student);
    case 'sendInvite':   return handleSendInvite(body.adminKey, body.key, body.to, body.deliver);
    case 'listPendingClaims': return handleListPendingClaims(body.adminKey);
    case 'accessRoster': return handleAccessRoster(body.adminKey);
    case 'decideClaim':  return handleDecideClaim(body.adminKey, body.key, body.decision);
    case 'resetStudentAuth':  return handleResetStudentAuth(body.adminKey, body.key);
    // Reached from the approval page served by doGet (see below). The
    // signed 'claim' token is the credential — it only ever existed inside
    // an email delivered to NOTIFY_EMAIL.
    case 'decideClaimByToken': {
      var t = readToken_(body.token, 'claim');
      if (!t) return { ok: false, error: 'bad_token' };
      return decideClaim_(t.k, body.decision === 'approve' ? 'approve' : 'decline', 'email link');
    }
  }
  return null;
}

/* =========================================================================
   THE APPROVAL PAGE — served by doGet when Luca taps the link in the
   access-request email. Deliberately a page with buttons rather than an
   approve-on-GET URL: mail scanners, link previewers and Gmail's own
   image proxy fetch GET links automatically, and any of them would
   otherwise silently approve a stranger on his behalf before he ever read
   the message.
   ========================================================================= */
function renderClaimPage_(rawToken) {
  var t = readToken_(rawToken, 'claim');
  var html;
  if (!t) {
    html = claimPageShell_(
      'Link expired',
      '<p>This approval link is no longer valid — they expire after 14 days, and each one stops working once the request has been handled.</p>' +
      '<p>Open <b>admin.html</b> and use the Pending tab to review any outstanding requests.</p>'
    );
    return HtmlService.createHtmlOutput(html).setTitle('Portal access request');
  }

  var sheet = getSheet_();
  var row = findRow_(sheet, String(t.k || '').toUpperCase());
  var pendingSub = row ? cellText_(row.PendingSub) : '';
  if (!row || !pendingSub) {
    html = claimPageShell_(
      'Already handled',
      '<p>There is no request waiting on key <b>' + authEsc_(t.k) + '</b> any more — it has already been approved or declined.</p>'
    );
    return HtmlService.createHtmlOutput(html).setTitle('Portal access request');
  }

  var body =
    '<table>' +
    '<tr><td>Roster name</td><td><b>' + authEsc_(cellText_(row.Name) || '—') + '</b></td></tr>' +
    '<tr><td>Access key</td><td><b>' + authEsc_(cellText_(row.Key)) + '</b></td></tr>' +
    '<tr><td>Google name</td><td>' + authEsc_(cellText_(row.PendingName) || '—') + '</td></tr>' +
    '<tr><td>Google email</td><td><b>' + authEsc_(cellText_(row.PendingEmail)) + '</b></td></tr>' +
    '</table>' +
    '<p class="warn">Approve only if that email belongs to the student you gave this key to. ' +
    'Declining is harmless — they keep no access either way, and can request again.</p>' +
    '<div class="row">' +
    '<button id="approve" class="primary">Approve access</button>' +
    '<button id="decline">Decline</button>' +
    '</div>' +
    '<p id="status"></p>' +
    '<script>' +
    'var URL_=' + JSON.stringify(ScriptApp.getService().getUrl()) + ';' +
    'var TOKEN_=' + JSON.stringify(rawToken) + ';' +
    'function go(d){' +
    'document.getElementById("approve").disabled=true;' +
    'document.getElementById("decline").disabled=true;' +
    'document.getElementById("status").textContent="Working…";' +
    // Plain-string body keeps this a CORS "simple request", the same
    // reason the portal posts that way — Apps Script web apps do not
    // answer preflight OPTIONS.
    'fetch(URL_,{method:"POST",body:JSON.stringify({action:"decideClaimByToken",token:TOKEN_,decision:d})})' +
    '.then(function(r){return r.json();}).then(function(j){' +
    'document.getElementById("status").textContent = j && j.ok' +
    ' ? (d==="approve" ? "Approved. They are being let in now, and have been emailed." : "Declined. Nothing was granted.")' +
    ' : ("Could not complete: " + ((j&&j.error)||"unknown error"));' +
    '}).catch(function(){document.getElementById("status").textContent="Network error — try again, or use admin.html.";});' +
    '}' +
    'document.getElementById("approve").onclick=function(){go("approve");};' +
    'document.getElementById("decline").onclick=function(){go("decline");};' +
    '<\/script>';

  return HtmlService.createHtmlOutput(claimPageShell_('Portal access request', body))
    .setTitle('Portal access request');
}

function claimPageShell_(title, inner) {
  return '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<style>' +
    'body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:28px 20px;color:#1a1a1a;}' +
    'h1{font-size:22px;margin:0 0 18px;}' +
    'table{border-collapse:collapse;font-size:15px;margin-bottom:18px;}' +
    'td{padding:6px 14px 6px 0;vertical-align:top;}' +
    'td:first-child{color:#888;white-space:nowrap;}' +
    '.warn{color:#666;font-size:14px;line-height:1.5;}' +
    '.row{display:flex;gap:10px;margin-top:22px;flex-wrap:wrap;}' +
    'button{font:inherit;padding:12px 20px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer;}' +
    'button.primary{background:#B0271C;border-color:#B0271C;color:#fff;font-weight:600;}' +
    'button:disabled{opacity:.5;cursor:default;}' +
    '#status{margin-top:18px;font-size:15px;}' +
    '</style></head><body><h1>' + authEsc_(title) + '</h1>' + inner + '</body></html>';
}

/* =========================================================================
   INVITES, LEAD PROVISIONING, AND ROSTER STATUS
   -------------------------------------------------------------------------
   The pipeline this exists to collapse:

     BEFORE   parent inquires → Luca reads the email → makes up a key →
              adds a row by hand → texts the key → student types it →
              Luca taps approve → student types their email → ...

     AFTER    parent inquires → row appears by itself → Luca clicks
              "Send invite" → student taps the link and signs in → done.

   One click from Luca, one tap from the family, and the student's verified
   email lands in GrantedEmail on its own — which is what the Drive folder
   share runs off, so notes and slide decks reach them without anyone ever
   being asked to spell out an address.

   THE INVITE IS NOT A WEAKENING. A key already grants nothing on its own
   (it files a claim Luca must approve). An invite grants access because
   Luca clicked send — the approval happens up front instead of afterwards,
   on the same evidence: he decided this family is a customer. It is
   single-use (an InviteNonce on the row, cleared on claim), expiring, and
   re-issuing one invalidates the last. A forwarded link that the wrong
   person claims is the same exposure as a leaked key today, with two
   things today does not have: Luca is emailed who claimed it, within
   seconds, and one click fully undoes it (see handleResetStudentAuth).

   WHY LEAD ROWS ARE SAFE TO CREATE AUTOMATICALLY. A row with no Name
   creates no Drive folder (ensureFoldersForAllStudents_ in Code.gs skips
   it), and its key grants nothing until an invite is claimed or Luca
   approves a claim. So an auto-created row is inert paperwork, not access.
   The cost is roster noise, which is what the Status column is for.
   ========================================================================= */

/* Keys look like the ones already in the sheet (BGD2465): three letters,
   four digits. I/O/0/1 are left out — these get read aloud over the phone
   and typed off a text message. Collision-checked against the roster
   rather than trusted to chance. */
function generateKey_(sheet) {
  var LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  var DIGITS = '23456789';
  var existing = {};
  var data = sheet.getDataRange().getValues();
  var keyCol = headerIndex_(data[0], 'Key');
  for (var i = 1; i < data.length; i++) existing[cellText_(data[i][keyCol]).toUpperCase()] = true;
  for (var attempt = 0; attempt < 200; attempt++) {
    var k = '';
    for (var a = 0; a < 3; a++) k += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
    for (var d = 0; d < 4; d++) k += DIGITS.charAt(Math.floor(Math.random() * DIGITS.length));
    if (!existing[k]) return k;
  }
  // 24^3 * 8^4 is ~56 million; 200 straight collisions means something is
  // wrong with the roster read, and silently returning a duplicate key
  // would merge two students' records.
  throw new Error('Could not generate an unused key after 200 attempts.');
}

/* Where a row is in the pipeline. Purely for Luca's benefit — nothing
   about access is decided by it (that is GoogleSub / InviteNonce). It is
   what stops an auto-provisioned roster from becoming unreadable:
     Inquiry  a lead came in; nobody has been invited; no access.
     Invited  Luca sent an invite; still no access until it is claimed.
     Active   an account is paired and using the portal.
   Recomputed rather than tracked, so it can never disagree with reality. */
function statusFor_(row) {
  if (cellText_(row.GoogleSub)) return 'Active';
  if (cellText_(row.InviteNonce)) return 'Invited';
  return 'Inquiry';
}

function ensureInviteColumns_(sheet) {
  var headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  ['InviteNonce', 'InviteSentAt', 'Status', 'SubjectOnly', 'LeadRole', 'Grade', 'Phone', 'Source'].forEach(function (col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col);
      headers.push(col);
    }
  });
  return headers;
}

function refreshStatus_(sheet, row) {
  setCell_(sheet, row, 'Status', statusFor_(row));
}

/* ═══ ADMIN ACTION: create a student row ═══ the "New student" dialog.
   Everything except the parent's email is optional, because at the moment
   Luca does this he has just got off the phone and that is genuinely all
   he reliably has. The student's own name and email arrive by themselves
   when they sign in. */
function handleCreateStudent(rawAdminKey, opts) {
  if (String(rawAdminKey || '') !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  opts = opts || {};
  var guardianEmail = String(opts.guardianEmail || '').trim().toLowerCase();
  if (guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail)) {
    return { ok: false, error: 'bad_email' };
  }
  // An email is NOT required. Plenty of families reach Luca by phone, text
  // or Messenger and never give one — for those the invite is delivered as
  // a copyable link instead (see handleSendInvite's deliver:'link'), and
  // the address arrives by itself when the student signs in with Google.
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (e) { return { ok: false, error: 'busy_try_again' }; }
  try {
    var sheet = getSheet_();
    ensureAuthColumns_(sheet);
    ensureInviteColumns_(sheet);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var key = generateKey_(sheet);
    var values = new Array(headers.length).fill('');
    function put(col, v) { var i = headerIndex_(headers, col); if (i !== -1) values[i] = v; }
    put('Key', key);
    put('Name', sheetSafe_(String(opts.name || '').trim()));
    put('GuardianName', sheetSafe_(String(opts.guardianName || '').trim()));
    put('GuardianEmail', sheetSafe_(guardianEmail));
    put('Grade', sheetSafe_(String(opts.grade || '').trim()));
    put('LeadRole', sheetSafe_(String(opts.leadRole || '').trim()));
    put('Phone', sheetSafe_(String(opts.phone || '').trim()));
    // Where this family came from. Website inquiries fill it in themselves;
    // for a phone call, a text or a Messenger thread it is the only record
    // that will ever exist of how they reached Luca.
    put('Source', sheetSafe_(String(opts.source || '').trim()));
    if (opts.subjectOnly) put('SubjectOnly', true);
    put('Status', 'Inquiry');
    sheet.appendRow(values);
    logAuth_('student_created', key, guardianEmail, '', 'by admin.html');
    return { ok: true, key: key };
  } finally {
    lock.releaseLock();
  }
}

/* ═══ ADMIN ACTION: send (or re-send) the invite ═══ */
function handleSendInvite(rawAdminKey, rawKey, rawTo, rawDeliver) {
  if (String(rawAdminKey || '') !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var sheet = getSheet_();
  ensureAuthColumns_(sheet);
  ensureInviteColumns_(sheet);
  var row = findRow_(sheet, String(rawKey || '').trim().toUpperCase());
  if (!row) return { ok: false, error: 'bad_key' };
  row._headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  if (cellText_(row.GoogleSub)) return { ok: false, error: 'already_paired' };

  /* DELIVERY IS NOT THE INVITE. The link is the invite; email is just one
     way of handing it over, and it is the wrong way for most of how this
     business actually acquires students — a phone call, a text, a Facebook
     Messenger thread. deliver:'link' mints exactly the same single-use
     token and hands it back for Luca to paste into whatever conversation
     he is already having. Nothing about the security differs: the link is
     single-use, expiring, superseded by the next one, and claiming it
     emails him who took it. */
  var deliver = rawDeliver === 'link' ? 'link' : 'email';
  var to = '';
  if (deliver === 'email') {
    to = String(rawTo || '').trim().toLowerCase() || cellText_(row.GuardianEmail).toLowerCase();
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { ok: false, error: 'no_recipient' };
  }

  // A fresh nonce on every send is what makes the invite single-use AND
  // makes re-sending revoke the previous link — the old token no longer
  // matches, so a link that went astray stops working the moment Luca
  // issues a new one.
  var nonce = Utilities.getUuid();
  setCell_(sheet, row, 'InviteNonce', nonce);
  setCell_(sheet, row, 'InviteSentAt', new Date());
  refreshStatus_(sheet, row);

  var token = signToken_({ t: 'invite', k: cellText_(row.Key).toUpperCase(), n: nonce }, INVITE_TTL_DAYS * 86400);
  var link = PORTAL_URL + '?invite=' + encodeURIComponent(token);

  if (deliver === 'link') {
    logAuth_('invite_link_created', cellText_(row.Key), cellText_(row.GuardianEmail), '',
             'handed to Luca to send himself');
    return { ok: true, deliver: 'link', link: link, expiresInDays: INVITE_TTL_DAYS };
  }

  try {
    MailApp.sendEmail({
      to: to,
      subject: 'Your Moretti Test Prep student portal is ready',
      htmlBody:
        '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;line-height:1.5;">' +
        '<p>Hi' + (cellText_(row.GuardianName) ? ' ' + authEsc_(cellText_(row.GuardianName).split(' ')[0]) : '') + ',</p>' +
        '<p>The student portal is set up and ready &mdash; practice tests, score reports, homework and the shared ' +
        'files folder all live there.</p>' +
        '<p><b>This link needs to be opened by the student</b>, on their own device, and signed in with ' +
        '<b>their own Google account</b> &mdash; that is what becomes their login and what their files get ' +
        'shared to. Forward it to them if you are reading this on your own phone.</p>' +
        '<p style="margin:24px 0;"><a href="' + link + '" ' +
        'style="background:#B0271C;color:#fff;padding:13px 24px;border-radius:6px;text-decoration:none;' +
        'font-weight:600;display:inline-block;">Open the student portal</a></p>' +
        '<p style="color:#888;font-size:13px;">This link works once and expires in ' + INVITE_TTL_DAYS +
        ' days. Need a new one, or something not working? Just reply to this email.</p>' +
        '<p>&mdash; Luca</p></div>',
      body: 'The student portal is ready.\n\nThis link must be opened BY THE STUDENT and signed in with the ' +
            "student's own Google account — that becomes their login and is what their files are shared to.\n\n" +
            link + '\n\nWorks once, expires in ' + INVITE_TTL_DAYS + ' days.\n\n— Luca'
    });
  } catch (e) {
    console.error('handleSendInvite mail failed: ' + e);
    return { ok: false, error: 'mail_failed' };
  }
  logAuth_('invite_sent', cellText_(row.Key), to, '', 'ttl ' + INVITE_TTL_DAYS + 'd');
  return { ok: true, deliver: 'email', sentTo: to, link: link, expiresInDays: INVITE_TTL_DAYS };
}

/* ═══ ACTION: claimInvite ═══ what the invite link ultimately calls, after
   the student has signed in with Google. This is the fast path that
   replaces "type a key, then wait for Luca to approve": the approval
   already happened when he clicked send. */
function handleClaimInvite(rawIdToken, rawInvite) {
  var id = verifyGoogleIdToken_(rawIdToken);
  if (!id) return { ok: false, error: 'bad_token' };
  var t = readToken_(rawInvite, 'invite');
  if (!t) return { ok: false, error: 'invite_expired' };

  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (e) { return { ok: false, error: 'busy_try_again' }; }
  try {
    var sheet = getSheet_();
    ensureAuthColumns_(sheet);
    ensureInviteColumns_(sheet);

    // Already known to us? Then the invite is redundant — log them in as
    // whoever they already are rather than binding them somewhere new.
    var already = findStudentByGoogle_(sheet, id.sub, id.email);
    if (already) return loginRow_(sheet, already, id, 'already known; invite ignored');

    var row = findRow_(sheet, String(t.k || '').toUpperCase());
    if (!row) return { ok: false, error: 'invite_expired' };
    row._headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    if (cellText_(row.GoogleSub)) return { ok: false, error: 'invite_used' };
    // Single use, and superseded by any newer invite for the same row.
    if (!cellText_(row.InviteNonce) || cellText_(row.InviteNonce) !== String(t.n)) {
      return { ok: false, error: 'invite_expired' };
    }
    var boundEmail = cellText_(row.GrantedEmail).toLowerCase();
    if (boundEmail && boundEmail !== id.email) return { ok: false, error: 'email_mismatch' };

    setCell_(sheet, row, 'GoogleSub', id.sub);
    setCell_(sheet, row, 'InviteNonce', '');          // consumed
    if (isFullName_(id.name) && !cellText_(row.Name)) setCell_(sheet, row, 'Name', sheetSafe_(id.name));
    var grantedAt = ensureFolderAndGrant_(sheet, row, id.email, id.name);
    refreshStatus_(sheet, row);
    logAuth_('invite_claimed', cellText_(row.Key), id.email, id.sub, id.name || '');
    notifyInviteClaimed_(row, id);
    return studentPayload_(row, grantedAt,
      issueSession_(cellText_(row.Key).toUpperCase(), id.sub, id.email, Number(row.TokenVersion || 0)));
  } finally {
    lock.releaseLock();
  }
}

/* Not an approval request — an FYI, sent the moment an invite is claimed.
   It is the whole reason the invite path can skip the approval tap: Luca
   still finds out immediately WHO took it, and undoing a wrong one is a
   single click. The likeliest wrong one, by a distance, is a parent
   signing in on their own phone instead of forwarding the link. */
function notifyInviteClaimed_(row, id) {
  try {
    var key = cellText_(row.Key).toUpperCase();
    var photo = id.picture
      ? '<img src="' + id.picture + '" width="56" height="56" style="border-radius:50%;display:block;margin:0 0 12px;" alt="">'
      : '';
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'Portal claimed — ' + (id.name || id.email) + ' (' + key + ')',
      htmlBody:
        '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;line-height:1.5;">' +
        '<h2 style="margin:0 0 4px;">Invite claimed</h2>' +
        '<p style="margin:0 0 16px;color:#666;">No action needed unless this is the wrong person.</p>' +
        photo +
        '<table cellpadding="6" style="border-collapse:collapse;font-size:15px;">' +
        '<tr><td style="color:#888;">Key</td><td><b>' + authEsc_(key) + '</b></td></tr>' +
        '<tr><td style="color:#888;">Signed in as</td><td><b>' + authEsc_(id.name || '—') + '</b></td></tr>' +
        '<tr><td style="color:#888;">Email</td><td><b>' + authEsc_(id.email) + '</b></td></tr>' +
        '<tr><td style="color:#888;">Files shared to</td><td>' + authEsc_(id.email) + '</td></tr>' +
        '</table>' +
        '<p style="color:#888;font-size:13px;margin-top:18px;">If a parent signed in here instead of forwarding ' +
        'the link to their child, open admin.html and use <b>Reset login</b> on ' + authEsc_(key) + '. That clears ' +
        'the pairing, signs them out everywhere, revokes their access to the files folder, and lets you send a ' +
        'fresh invite.</p></div>',
      body: 'Invite claimed for ' + key + ' by ' + (id.name || '-') + ' <' + id.email + '>.\n' +
            'Files are now shared to that address.\n\n' +
            'Wrong person? Use Reset login on ' + key + ' in admin.html.'
    });
  } catch (e) {
    console.error('notifyInviteClaimed_ failed: ' + e);
  }
}

/* =========================================================================
   SAT BY DEFAULT — the SubjectOnly column
   -------------------------------------------------------------------------
   The roster used to carry a `SAT` checkbox that had to be TICKED for a
   student to see the SAT diagnostic and resources. That is backwards for
   this business: almost every student is here for the SAT, so the common
   case required an action and the rare case required none — which is
   exactly how a new student ends up staring at a portal with its main
   feature invisible, because a box nobody remembered to tick.

   `SubjectOnly` inverts it. Blank (the default for every new row, including
   every auto-provisioned lead) means SAT prep. Tick it only for a student
   who is here for subject tutoring and should not see the SAT material at
   all.

   Named for what it IS rather than as a negation: a column called `NotSAT`
   reads as a double negative the moment it is unticked, and a column still
   called `SAT` whose tick means "no SAT" is a trap for whoever opens this
   sheet in a year.

   Code.gs reads the flag in two places, so two one-line edits there point
   at the new column — see AUTH_INTEGRATION.md. Run migrateToSubjectOnly()
   once before applying them.
   ========================================================================= */

/* RUN THIS ONCE, from the Apps Script editor's function dropdown, BEFORE
   applying the two Code.gs edits. It reads the old SAT column and ticks
   SubjectOnly for exactly the students who were NOT doing SAT prep, so the
   inversion is a no-op for everyone. Safe to run twice; it only writes
   rows it has not already converted. Delete the old SAT column afterwards. */
function migrateToSubjectOnly() {
  var sheet = getSheet_();
  ensureInviteColumns_(sheet);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var satCol = headerIndex_(headers, 'SAT');
  var soCol = headerIndex_(headers, 'SubjectOnly');
  if (satCol === -1) {
    Logger.log('No SAT column found — nothing to migrate. New rows already default to SAT prep.');
    return;
  }
  var converted = 0;
  for (var i = 1; i < data.length; i++) {
    if (!cellText_(data[i][headerIndex_(headers, 'Key')])) continue;
    if (cellText_(data[i][soCol])) continue;              // already handled
    if (!truthy_(data[i][satCol])) {                      // was NOT an SAT student
      sheet.getRange(i + 1, soCol + 1).setValue(true);
      converted++;
    }
  }
  Logger.log('Ticked SubjectOnly for ' + converted + ' non-SAT student(s). ' +
             'Every other row now defaults to SAT prep. You can delete the old SAT column.');
}

/* =========================================================================
   LEAD → ROSTER PROVISIONING
   -------------------------------------------------------------------------
   Every inquiry from the website already lands on the Leads tab. This turns
   each new one into a Students row automatically, so by the time Luca has
   read the notification email the row exists, pre-filled, with a key, and
   one click from an invite.

   WHAT IT DOES NOT DO: grant anything. The row has no Name, so Code.gs
   creates no Drive folder for it; its key opens nothing on its own; and no
   invite is sent until Luca sends one. An auto-provisioned row is
   paperwork, not access — which is what makes it safe to drive off a public
   form.

   THE WATERMARK. setupLeadProvisioning() stamps "provision leads from now
   on" into Script Properties. Without it, the first run would provision
   every historical inquiry in the sheet at once. Leads already handled are
   skipped by the PortalKey column this writes back, which doubles as
   Luca's cross-reference between an inquiry and the row it became.

   ROLE MATTERS. The inquiry form asks "are you a parent or a student?" and
   labels its name field "Parent Name", so for a Parent lead the name and
   email belong to the parent — they become GuardianName/GuardianEmail and
   the student's own details stay blank until they sign in. For a Student
   lead the same two fields are the STUDENT's, so the name goes to Name and
   the email is pre-filled into GrantedEmail, which puts them on the
   instant-pairing fast path with no approval needed at all.
   ========================================================================= */

var LEADS_WATERMARK_PROP = 'LEADS_PROVISION_FROM';

/* RUN THIS ONCE to turn lead provisioning on. Installs the trigger and sets
   the watermark to now, so only inquiries that arrive AFTER this moment are
   provisioned. Safe to run again; it clears any duplicate trigger first. */
function setupLeadProvisioning() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'provisionNewLeads') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('provisionNewLeads').timeBased().everyMinutes(15).create();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty(LEADS_WATERMARK_PROP)) {
    props.setProperty(LEADS_WATERMARK_PROP, new Date().toISOString());
  }
  Logger.log('Lead provisioning is on. Inquiries from ' +
             props.getProperty(LEADS_WATERMARK_PROP) + ' onward will get a roster row within 15 minutes.');
}

function provisionNewLeads() {
  var props = PropertiesService.getScriptProperties();
  var fromIso = props.getProperty(LEADS_WATERMARK_PROP);
  if (!fromIso) {
    console.error('provisionNewLeads: no watermark set — run setupLeadProvisioning() once first.');
    return;
  }
  var from = new Date(fromIso);
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (e) { return; }
  try {
    var leads = getLeadsSheet_();
    var lheaders = leads.getRange(1, 1, 1, leads.getLastColumn()).getValues()[0];
    if (lheaders.indexOf('PortalKey') === -1) {
      leads.getRange(1, leads.getLastColumn() + 1).setValue('PortalKey');
      lheaders.push('PortalKey');
    }
    var data = leads.getDataRange().getValues();
    var iTs = lheaders.indexOf('Timestamp'), iName = lheaders.indexOf('Name');
    var iEmail = lheaders.indexOf('Email'), iRole = lheaders.indexOf('Role');
    var iGrade = lheaders.indexOf('Grade'), iPk = lheaders.indexOf('PortalKey');

    for (var i = 1; i < data.length; i++) {
      if (iPk !== -1 && cellText_(data[i][iPk])) continue;            // already provisioned
      var ts = toDateOrNull_(data[i][iTs]);
      if (!ts || ts <= from) continue;                                // pre-watermark
      var email = cellText_(data[i][iEmail]).toLowerCase();
      if (!email) continue;
      var role = cellText_(data[i][iRole]);
      var leadName = cellText_(data[i][iName]);
      var isStudent = /^student$/i.test(role);

      var res = handleCreateStudent(ADMIN_KEY, {
        // A Student lead named themselves; a Parent lead named the parent.
        name: isStudent ? leadName : '',
        guardianName: isStudent ? '' : leadName,
        guardianEmail: email,
        grade: cellText_(data[i][iGrade]),
        leadRole: role,
        source: 'Website'
      });
      if (!res || !res.ok) {
        console.error('provisionNewLeads: could not create a row for lead ' + (i + 1) + ': ' + JSON.stringify(res));
        continue;
      }
      // A student who gave their OWN address gets it pre-filled, which puts
      // them on the instant-pairing path — sign in, no key, no approval.
      if (isStudent) {
        var sheet = getSheet_();
        var row = findRow_(sheet, res.key);
        if (row) setCell_(sheet, row, 'GrantedEmail', sheetSafe_(email));
      }
      leads.getRange(i + 1, iPk + 1).setValue(res.key);
      logAuth_('lead_provisioned', res.key, email, '', role || '(role not given)');
    }
  } finally {
    lock.releaseLock();
  }
}

/* ═══ ADMIN: the access queue ═══ one call backing the whole access panel
   in admin.html. Deliberately returns the WHOLE roster rather than only the
   rows needing action: it is a handful of students, the payload is tiny,
   and it means the panel can offer search and "reset this student's login"
   for anyone without a second round trip. Only fields relevant to access —
   no scores, no reports, nothing this panel has no business holding. */
function handleAccessRoster(rawAdminKey) {
  if (String(rawAdminKey || '') !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var sheet = getSheet_();
  ensureAuthColumns_(sheet);
  ensureInviteColumns_(sheet);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idx = {};
  ['Key', 'Name', 'GuardianName', 'GuardianEmail', 'GrantedEmail', 'GoogleSub', 'Grade',
   'Phone', 'Source', 'InviteNonce', 'InviteSentAt', 'SubjectOnly', 'GrantedAt',
   'PendingEmail', 'PendingSub', 'PendingName', 'PendingAt'].forEach(function (c) {
    idx[c] = headerIndex_(headers, c);
  });
  function get(r, c) { return idx[c] === -1 ? '' : data[r][idx[c]]; }

  var students = [];
  for (var i = 1; i < data.length; i++) {
    var key = cellText_(get(i, 'Key'));
    if (!key) continue;
    var row = {
      GoogleSub: get(i, 'GoogleSub'),
      InviteNonce: get(i, 'InviteNonce')
    };
    students.push({
      key: key.toUpperCase(),
      name: cellText_(get(i, 'Name')),
      guardianName: cellText_(get(i, 'GuardianName')),
      guardianEmail: cellText_(get(i, 'GuardianEmail')),
      grantedEmail: cellText_(get(i, 'GrantedEmail')),
      grade: cellText_(get(i, 'Grade')),
      phone: cellText_(get(i, 'Phone')),
      source: cellText_(get(i, 'Source')),
      subjectOnly: truthy_(get(i, 'SubjectOnly')),
      status: statusFor_(row),
      inviteSentAt: isoOrNull_(get(i, 'InviteSentAt')),
      grantedAt: isoOrNull_(get(i, 'GrantedAt')),
      pending: cellText_(get(i, 'PendingSub')) ? {
        email: cellText_(get(i, 'PendingEmail')),
        googleName: cellText_(get(i, 'PendingName')),
        requestedAt: isoOrNull_(get(i, 'PendingAt'))
      } : null
    });
  }
  return { ok: true, students: students };
}
