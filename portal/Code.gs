/* =========================================================================
   MORETTI STUDENT PORTAL — BACKEND (Google Apps Script)
   -------------------------------------------------------------------------
   This replaces the old "window.STUDENTS" list that used to live directly
   in portal/index.html. That approach shipped every student's name and
   Drive folder link to anyone who viewed the page's source, whether or
   not they had a key. This script keeps that roster in a private Google
   Sheet instead, and only ever hands back ONE student's data — the one
   matching the key that was submitted.

   It also automates folder sharing: the first time a key is used, the
   student types in their email, and this script grants that email
   "Viewer" access to their Drive folder(s) directly — no more manually
   adding people in Drive's Share dialog. That email is then locked to
   the key, so if the key ever leaks, a stranger can't re-use it to add
   their own email and get in.

   Also auto-creates each student's Drive folder: add a row with just a
   Key and a Name (leave DriveFolderUrl blank), and as soon as you save
   the sheet, a trigger creates a real Drive folder for them and fills
   in the URL automatically — no manual folder creation needed either.

   SETUP — see the deployment guide for full steps. Short version:
     1. Create a Google Sheet with a tab named "Students" and headers:
          Key | Name | DriveFolderUrl | GrantedEmail | GrantedAt | SATTakenAt | SAT | TestDate
        (SATTakenAt tracks the one-real-diagnostic feature — leave blank
        for everyone; it gets stamped automatically the first time a
        student finishes the diagnostic. A blank cell means "never taken."
        SAT is the master on/off switch for whether a student sees the SAT
        Diagnostic and SAT Resources cards on the portal home screen AT
        ALL — a student who's only doing subject tutoring, not test prep,
        should have this left blank/unchecked so those two cards just
        don't show up for them; "Your Files" always shows either way. Use
        an actual checkbox column (Insert > Checkbox) or just type
        TRUE/yes in the cell — either is read as "on". (The program is
        SAT-only now — the old separate TestPrep/ACT columns and ACT
        diagnostic support were retired; SAT alone does the job TestPrep
        used to.)
        TestDate is the student's actual SAT test date — type it in as
        a real date (Insert > Date, or just type e.g. 3/14/2027). When
        it's set, the portal home screen shows a countdown/progress bar
        running from the day the student first logged into the portal
        (GrantedAt) to this date, with the days-remaining count and your
        target logo at the finish line. Leave it blank for a student and
        the bar just doesn't show — no error, nothing broken.)
        AccomTimeMult / AccomBreakMult (a new student's testing
        accommodations — 1 / 1.5 / 2 and 1 / 2) don't need to be set up by
        hand: the portal's first-login onboarding sequence writes them
        itself the first time a new student answers that question, and
        handleSaveOnboardingPrefs() below auto-creates the columns on the
        Students sheet the first time it runs if they don't exist yet.
        A tab named "Assignments" holds the homework checklist shown on
        each student's portal home screen — it's created automatically the
        first time it's needed, with headers Timestamp | Key | Task | Done
        | DoneAt. To assign something, just add a row yourself (Key, Task
        text, today's date in Timestamp, leave Done unchecked). See
        getAssignments_() below for details.
        IncorrectQuestionsJSON / SkillStatsJSON / ProgressUpdatedAt are
        three more columns on Students, auto-created the first time a
        student finishes a diagnostic or practice test — they're what make
        the portal's "My Incorrect Questions" and "Practice My Weak Spots"
        tools work from any device instead of just the one that took the
        test. Nothing to set up or maintain here; see
        handleSyncProgress()/handleGetProgress() below for details.
        A tab named "Attempts" is also created automatically, the first
        time any student finishes a diagnostic/practice test — one row per
        attempt (a 'log' row with the full report text/Drive/email status,
        and a 'score' row with the composite/section scores, both tagged
        via the Kind column), used by the biweekly guardian summary email
        (see below) and by report.html's live Score Progress chart.
        Nothing to set up here either; see handleSyncScoreHistory() and
        logDiagnosticResult_() below.
        GuardianName / GuardianEmail are two more optional columns on
        Students — fill these in by hand for any student whose
        parent/guardian should get a biweekly progress-summary email
        (composite score trend + current weak spot). Leave GuardianEmail
        blank for a student and they're simply skipped — nothing breaks,
        nothing sends. Both auto-create the first time the summary job
        runs if they don't exist yet. See "GUARDIAN BIWEEKLY SUMMARY"
        below for how the email itself is built.
     2. Paste this file into a new Apps Script project (script.google.com).
     3. Set SHEET_ID below to that Sheet's ID (from its URL).
     4. Deploy > New deployment > Web app.
          Execute as: Me
          Who has access: Anyone
     5. Copy the deployment URL into APPS_SCRIPT_URL in portal/index.html.
     6. Select "setupTrigger" in the function dropdown and click Run once
        (authorize when asked). This turns on the auto-folder feature.
     7. (Optional) Select "setupGuardianSummaryTrigger" and click Run once
        to turn on the biweekly guardian summary email. Only needed once,
        ever — skip this entirely if you'd rather not offer it yet.
   ========================================================================= */

// ═══ RUN THIS DIRECTLY TO DIAGNOSE THE EMAIL PROBLEM ═══
// Select "testMailApp" in the function dropdown at the top of the editor
// and click Run. This bypasses the portal, the web deployment, and the
// execution log entirely — Apps Script shows the result (success toast or
// the real error) right here in the editor within a couple seconds. If
// this fails, the error message it throws IS the answer (quota exceeded,
// authorization needed, invalid address, etc.) — copy whatever it says.
// If this SUCCEEDS but portal submissions still don't email you, the
// problem is specific to handleSubmitDiagnostic's call, not MailApp
// itself, and we look there next.
function testMailApp() {
  MailApp.sendEmail(NOTIFY_EMAIL, 'Moretti Portal — test email', 'If you got this, MailApp works fine from this script. Sent ' + new Date());
  Logger.log('Sent. Check ' + NOTIFY_EMAIL + ' (and spam) for "Moretti Portal — test email".');
}

var SHEET_ID = '1z55TokZ9V2rjf7qh6WLZyv0OiKJgQKXbQl2h4cEXvOw';
var SHEET_TAB_NAME = 'Students';
var STUDENT_FOLDERS_PARENT_NAME = 'Moretti Portal — Student Folders';
// Gates the getRoster action (admin.html's whole-roster view) — a single
// shared secret, not a per-student Key, since only Luca uses that page.
// CHANGE THIS before deploying admin.html anywhere Luca doesn't fully
// trust the network it's opened from; it's a plain equality check, same
// trust model as everything else in this file (this script is server-only,
// never shipped to a browser, so this constant is never visible to a
// student even though it sits in the same file as SHEET_ID above).
var ADMIN_KEY = 'ZQ9JY4dGKhL5VowT7qoJO0ET';
// Where diagnostic-result notifications are sent. IMPORTANT: confirm this
// is the address you want results delivered to. The email is sent from the
// Google account that owns this Apps Script (Deploy > Execute as: Me).
var NOTIFY_EMAIL = 'morettitutoring@gmail.com';

function doPost(e) {
  var out;
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'auth') {
      out = handleAuth(body.key, body.email, body.name);
    } else if (body.action === 'nextSession') {
      out = handleNextSession(body.key, !!body.debug);
    } else if (body.action === 'markDiagnosticTaken') {
      out = handleMarkDiagnosticTaken(body.key, body.test);
    } else if (body.action === 'submitDiagnostic') {
      out = handleSubmitDiagnostic(body.key, body.test, body.score, body.reportLink, body.report, body);
    } else if (body.action === 'toggleAssignment') {
      out = handleToggleAssignment(body.key, body.row, !!body.done);
    } else if (body.action === 'getAssignments') {
      out = handleGetAssignments(body.key);
    } else if (body.action === 'getAssignmentsCalendar') {
      out = handleGetAssignmentsCalendar(body.key);
    } else if (body.action === 'assignHomeworkFromDialog') {
      out = handleAssignHomeworkFromDialog(body.key, body.task);
    } else if (body.action === 'submitPracticeTest') {
      out = handleSubmitPracticeTest(body.key, body.test, body.score, body.reportLink, body.report, body.testId, body);
    } else if (body.action === 'submitLead') {
      out = handleSubmitLead(body.name, body.phone, body.email, body.isUSA, body.role, body.grade, body.topic, body.message, body.hp, body.elapsedMs);
    } else if (body.action === 'syncProgress') {
      out = handleSyncProgress(body.key, body.incorrect, body.skills);
    } else if (body.action === 'saveQuestion') {
      out = handleSaveQuestion(body.key, body.record);
    } else if (body.action === 'addIncorrectQuestion') {
      out = handleAddIncorrectQuestion(body.key, body.record);
    } else if (body.action === 'updateCollections') {
      out = handleUpdateCollections(body.key, body.collections);
    } else if (body.action === 'syncVocabProgress') {
      out = handleSyncVocabProgress(body.key, body.progress);
    } else if (body.action === 'syncQbAttempts') {
      out = handleSyncQbAttempts(body.key, body.attempts);
    } else if (body.action === 'getProgress') {
      out = handleGetProgress(body.key);
    } else if (body.action === 'saveOnboardingPrefs') {
      out = handleSaveOnboardingPrefs(body.key, body.testDate, body.accomTimeMult, body.accomBreakMult, body.baselineType, body.baselineRw, body.baselineMath, body.guardianName, body.guardianEmail);
    } else if (body.action === 'syncScoreHistory') {
      out = handleSyncScoreHistory(body.key, body.entry);
    } else if (body.action === 'getScoreHistory') {
      out = handleGetScoreHistory(body.key);
    } else if (body.action === 'listBlankComposite') {
      out = handleListBlankComposite();
    } else if (body.action === 'backfillCompositeFields') {
      out = handleBackfillCompositeFields(body.patches);
    } else if (body.action === 'deleteAttempt') {
      out = handleDeleteAttempt(body.key, body.testTag, body.attemptId);
    } else if (body.action === 'getRoster') {
      out = handleGetRoster(body.adminKey);
    } else if (body.action === 'getAdminAssignments') {
      out = handleGetAdminAssignments(body.adminKey, body.key);
    } else if (body.action === 'createAdminAssignment') {
      out = handleCreateAdminAssignment(body.adminKey, body.key, body.task, body.dueDates);
    } else if (body.action === 'updateAdminAssignment') {
      out = handleUpdateAdminAssignment(body.adminKey, body.key, body.row, body.patch);
    } else if (body.action === 'deleteAdminAssignment') {
      out = handleDeleteAdminAssignment(body.adminKey, body.key, body.row);
    } else {
      out = { ok: false, error: 'unknown_action' };
    }
  } catch (err) {
    out = { ok: false, error: 'server_error', message: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// Apps Script web apps also receive a GET on first load / health checks —
// respond with something harmless instead of an error.
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: 'Moretti portal backend is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_TAB_NAME);
}

function findRow_(sheet, key) {
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var keyCol = headers.indexOf('Key');
  if (keyCol === -1) throw new Error('Students sheet is missing a "Key" column header.');
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][keyCol]).trim().toUpperCase() === key) {
      var row = { _rowIndex: i + 1, _headers: headers };
      headers.forEach(function (h, idx) { row[h] = data[i][idx]; });
      return row;
    }
  }
  return null;
}

// Reads a Students-sheet cell that's meant to be a yes/no flag (like
// SAT) and returns a real boolean. A checkbox column already comes
// back as true/false from getValues(), but this also accepts plain typed
// text (TRUE/true/yes/y/1) in case the column isn't formatted as a
// checkbox — so Luca can just type into the cell either way.
function truthy_(v) {
  if (v === true) return true;
  if (typeof v === 'string') return /^(true|yes|y|1)$/i.test(v.trim());
  return false;
}

// Google Sheets treats any cell VALUE that starts with =, +, -, or @ as a
// formula, even when written via setValue()/appendRow() from Apps Script —
// this is not limited to typing directly into the sheet. Any client-
// controlled string that reaches a sheet cell is a formula-injection vector
// (e.g. a HYPERLINK() redirect, or an IMPORTXML/IMPORTDATA() call that
// exfiltrates sheet contents to an external URL as soon as the cell is
// viewed/recalculated). Two concrete reachable paths this closes:
//   - the "email" field on first login (handleAuth) — the existing regex
//     only forbids whitespace and @ in the local part, so something like
//     =HYPERLINK("http://evil.com","x")@a.b passes it and would otherwise
//     land straight in the GrantedEmail cell as a live formula.
//   - score/report text on diagnostic submission (handleSubmitDiagnostic)
//     — both are entirely client-supplied with no format constraint.
// Prefixing with a single quote is the standard mitigation: Sheets then
// displays it as inert literal text instead of evaluating it.
function sheetSafe_(v) {
  var s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function extractFolderId_(url) {
  if (!url) return null;
  var m = String(url).match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

// Grants Viewer access on a Drive folder to an email address. Swallows
// errors (bad folder ID, folder not owned by this account, etc.) so one
// broken row in the sheet doesn't take down login for everyone else —
// worst case the student just doesn't get auto-shared and Luca has to
// add them manually as a fallback.
//
// Checks existing access FIRST rather than calling addViewer() unconditionally
// — addViewer() is a no-op on permissions for someone who's already a viewer,
// but Drive still fires a "this was shared with you" notification email on
// EVERY call regardless of whether access already existed. handleAuth's
// self-heal retry (see its comment) runs this on every returning-student
// login, which without this check meant a fresh share-notification email on
// every single login, forever.
function grantFolderAccess_(url, email) {
  var id = extractFolderId_(url);
  if (!id || !email) return;
  try {
    var folder = DriveApp.getFolderById(id);
    var lowerEmail = email.toLowerCase();
    var alreadyHasAccess = folder.getViewers().concat(folder.getEditors()).some(function (u) {
      return u.getEmail().toLowerCase() === lowerEmail;
    });
    if (alreadyHasAccess) return;
    folder.addViewer(email);
  } catch (err) {
    // logged to Apps Script's execution log for debugging
    console.error('Could not grant access to folder ' + id + ' for ' + email + ': ' + err);
  }
}

// Works out whether a student should see the SAT diagnostic/resources UI.
// The program is SAT-only now — the old separate TestPrep (master on/off)
// and SAT/ACT (which test) columns collapsed into this one SAT checkbox,
// which does both jobs at once: unchecked means subject-tutoring-only
// (never sees the SAT Diagnostic/Resources cards), checked means test
// prep. ACT is retired — showAct is always false, so any ACT-specific UI
// still in the client is simply unreachable now, not deleted outright.
function testPrepFlags_(row) {
  var showSat = truthy_(row.SAT);
  return {
    testPrep: showSat,
    showSat: showSat,
    showAct: false
  };
}

// ═══ WHY THIS FUNCTION IS LOCKED ═══ postToBackend on the client (see
// index.html) aggressively retries a slow 'auth' call — by design, since an
// Apps Script cold start can take 10+ seconds and the client has no way to
// tell "still running" apart from "actually failed." But that means a slow
// login can genuinely be TWO overlapping handleAuth() executions for the
// same key: the first one (still running server-side even though the
// client gave up on it) and the client's retry, racing each other. Without
// a lock, both can read the sheet before either has written GrantedEmail/
// DriveFolderUrl, both fall into the same "first login" branch, and
// grantFolderAccess_'s already-has-access check (see its own comment) can
// find nothing yet because the other execution's addViewer() hasn't
// propagated to a fresh Drive read yet either — so both call addViewer(),
// and the student gets a second "shared with you" folder email. This is
// the exact "random folder share request on login, sometimes" bug: it only
// shows up when a login is slow enough to trigger the client's retry,
// which is intermittent by nature. A per-script lock serializes any two
// overlapping calls (for the same key or different ones — the critical
// section here is a handful of sheet reads/writes plus one Drive check, so
// the serialization cost is imperceptible) so the second execution always
// sees the first one's completed writes before it decides what to do.
function handleAuth(rawKey, rawEmail, rawName) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';
  var name = rawName ? String(rawName).trim() : '';

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (lockErr) {
    console.error('handleAuth could not acquire lock for ' + key + ': ' + lockErr);
    return { ok: false, error: 'busy_try_again' };
  }
  try {
    return handleAuthLocked_(key, email, name);
  } finally {
    lock.releaseLock();
  }
}

function handleAuthLocked_(key, email, name) {
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  // Brand-new keys Luca creates with no name filled in yet get one from the
  // student themselves, submitted alongside their first-time email unlock
  // (see the portal's new name-step). Never overwrites a name Luca already
  // set in the roster — this only ever fills in a genuinely blank cell.
  if (name && (!row.Name || !String(row.Name).trim())) {
    var nameCol = row._headers.indexOf('Name');
    if (nameCol !== -1) {
      sheet.getRange(row._rowIndex, nameCol + 1).setValue(sheetSafe_(name));
      row.Name = name;
    }
  }

  var grantedEmail = row.GrantedEmail ? String(row.GrantedEmail).trim().toLowerCase() : '';
  // The countdown bar's start point. Defaults to whatever's already in the
  // GrantedAt cell; if this is the very first login (below), it's updated
  // to "right now" so the bar has a real start date on this very call
  // instead of waiting for a second login to pick up what was just written
  // to the sheet.
  var grantedAtValue = row.GrantedAt || null;

  if (!grantedEmail) {
    // First time this key has ever been used.
    if (!email) {
      var flags0 = testPrepFlags_(row);
      return { ok: true, name: row.Name, needsEmail: true, satTaken: !!row.SATTakenAt, actTaken: false, testPrep: flags0.testPrep, showSat: flags0.showSat, showAct: flags0.showAct };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'bad_email' };
    }
    // For a brand-new key with no Name pre-filled by Luca, the student's
    // name is written to the sheet just above (in the same call) — that
    // edit fires the onStudentsEdit trigger, but only ASYNCHRONOUSLY, and
    // even once it runs it creates the folder using its own fresh read of
    // the sheet, not this function's `row` object. So `row.DriveFolderUrl`
    // here is whatever it was when findRow_ ran at the top of this
    // function — reliably still blank for this case — and granting access
    // against a blank URL is a silent no-op (see grantFolderAccess_) that
    // then gets masked forever, because GrantedEmail is about to be set
    // below and no code path ever retries the grant after that. So: if
    // there's still no folder on this row, create it right here,
    // synchronously, before attempting the grant. (If Luca DID pre-fill a
    // folder URL, or the trigger already created one moments earlier via a
    // separate edit, row.DriveFolderUrl is already populated and this is
    // skipped — no duplicate folder.)
    if (!row.DriveFolderUrl) {
      var urlCol = row._headers.indexOf('DriveFolderUrl');
      if (urlCol !== -1) {
        var newFolderUrl = createFolderForStudent_(row.Name || name, key);
        sheet.getRange(row._rowIndex, urlCol + 1).setValue(newFolderUrl);
        row.DriveFolderUrl = newFolderUrl;
      }
    }
    grantFolderAccess_(row.DriveFolderUrl, email);
    var emailCol = row._headers.indexOf('GrantedEmail');
    var atCol = row._headers.indexOf('GrantedAt');
    grantedAtValue = new Date();
    if (emailCol !== -1) sheet.getRange(row._rowIndex, emailCol + 1).setValue(sheetSafe_(email));
    if (atCol !== -1) sheet.getRange(row._rowIndex, atCol + 1).setValue(grantedAtValue);
  } else {
    if (email && email !== grantedEmail) {
      // Someone's submitting a different email for a key that's already
      // bound to someone else — refuse rather than silently re-sharing.
      return { ok: false, error: 'email_mismatch' };
    }
    // Self-heal: any student who was granted BEFORE the fix above existed
    // has GrantedEmail permanently set but may never have actually gotten
    // Drive access, because their folder didn't exist yet at the moment
    // of that first grant. Nothing previously retried the grant after
    // GrantedEmail was set, so those students were stuck silently.
    //
    // Gated on GrantedAt being empty (never confirmed) rather than retrying
    // on every single login forever: grantFolderAccess_'s own
    // getViewers()/getEditors() check is NOT a reliable "already shared"
    // signal for every case — the folder's owner (whoever the script runs
    // as) never appears in either list, so if that account is ever also
    // the "student" on a row (e.g. Luca's own test/QA key), the check
    // never finds them and calls addViewer() again on every login, which
    // is what was sending a fresh "shared with you" folder email on every
    // single login instead of just once. Once we've attempted the grant
    // here a single time, GrantedAt gets set below and this branch never
    // touches Drive again for this row.
    if (!row.GrantedAt && row.DriveFolderUrl && grantedEmail) {
      grantFolderAccess_(row.DriveFolderUrl, grantedEmail);
      var healAtCol = row._headers.indexOf('GrantedAt');
      if (healAtCol !== -1) {
        grantedAtValue = new Date();
        sheet.getRange(row._rowIndex, healAtCol + 1).setValue(grantedAtValue);
      }
    }
  }

  var flags = testPrepFlags_(row);
  return {
    ok: true,
    name: row.Name,
    needsEmail: false,
    driveFolderUrl: row.DriveFolderUrl || '',
    satTaken: !!row.SATTakenAt,
    actTaken: false,
    testPrep: flags.testPrep,
    showSat: flags.showSat,
    showAct: flags.showAct,
    grantedAt: grantedAtValue ? new Date(grantedAtValue).toISOString() : null,
    testDate: row.TestDate ? new Date(row.TestDate).toISOString() : null,
    // Set once, during the first-login onboarding sequence (see
    // handleSaveOnboardingPrefs_ below) and read back on every login after
    // that — this is what makes "permanent for their account" actually
    // true, instead of resetting to standard timing before every attempt.
    accomTimeMult: row.AccomTimeMult || null,
    accomBreakMult: row.AccomBreakMult || null,
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
   ONBOARDING PREFERENCES — test date + testing accommodations + optional
   baseline PSAT/SAT score (as a Reading & Writing / Math section-score
   breakdown, not a composite) + optional parent/guardian contact,
   captured once during the first-login onboarding sequence (portal/
   index.html's #screen-onboard) and never asked again. TestDate reuses
   the column the countdown widget already reads (see handleAuth above);
   AccomTimeMult/AccomBreakMult/BaselineType/BaselineRW/BaselineMath/
   GuardianName/GuardianEmail are new columns, auto-created on the
   Students sheet the first time this runs (same pattern getLeadsSheet_
   uses below) so nothing needs to be set up by hand first. GuardianName/
   GuardianEmail are pure data capture right now — nothing reads them yet
   (see the "GUARDIAN BIWEEKLY SUMMARY" section further down for the one
   thing that will, once/if that's turned on).
   ========================================================================= */
function handleSaveOnboardingPrefs(rawKey, rawTestDate, rawAccomTimeMult, rawAccomBreakMult, rawBaselineType, rawBaselineRw, rawBaselineMath, rawGuardianName, rawGuardianEmail, rawTargetScore) {
  var key = String(rawKey || '').trim().toUpperCase();
  if (!key) return { ok: false, error: 'missing_key' };

  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var headers = row._headers;
  ['AccomTimeMult', 'AccomBreakMult', 'BaselineType', 'BaselineRW', 'BaselineMath', 'GuardianName', 'GuardianEmail', 'TargetScore'].forEach(function (col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col);
      headers.push(col);
    }
  });
  function setCol(col, val) {
    var i = headers.indexOf(col);
    if (i !== -1) sheet.getRange(row._rowIndex, i + 1).setValue(val);
  }

  if (rawTestDate) {
    var d = new Date(rawTestDate);
    if (!isNaN(d.getTime())) setCol('TestDate', d);
  }
  // Only ever the three known-good values — never write whatever the
  // client sends verbatim into the sheet.
  var timeMult = Number(rawAccomTimeMult);
  if (timeMult === 1 || timeMult === 1.5 || timeMult === 2) setCol('AccomTimeMult', timeMult);
  var breakMult = Number(rawAccomBreakMult);
  if (breakMult === 1 || breakMult === 2) setCol('AccomBreakMult', breakMult);

  // Optional — most underclassmen skip this, so all three arrive as
  // null/blank and nothing gets written. BaselineType is only ever 'psat'
  // or 'sat'; the two section scores are only written alongside a valid
  // type, range for that test (SAT: 200-800 each, PSAT: 160-760 each), AND
  // a real SAT/PSAT section score is always a multiple of 10 — same
  // "never trust the client" approach as the accommodation multipliers,
  // this just re-checks what the portal's own form already enforces
  // client-side.
  var baselineType = (rawBaselineType === 'psat' || rawBaselineType === 'sat') ? rawBaselineType : null;
  var baselineRange = baselineType === 'sat' ? { min: 200, max: 800 } : { min: 160, max: 760 };
  var baselineRw = Number(rawBaselineRw);
  var baselineMath = Number(rawBaselineMath);
  if (baselineType &&
      baselineRw >= baselineRange.min && baselineRw <= baselineRange.max && baselineRw % 10 === 0 &&
      baselineMath >= baselineRange.min && baselineMath <= baselineRange.max && baselineMath % 10 === 0) {
    setCol('BaselineType', baselineType);
    setCol('BaselineRW', baselineRw);
    setCol('BaselineMath', baselineMath);
  }

  // Also optional, also skippable — a blank/missing guardian email just
  // means nothing gets written, same as everything else on this screen.
  // Name is written even without an email (harmless either way); the
  // email itself gets a basic format check — same regex handleAuth uses
  // for the student's own email — before being trusted onto the sheet.
  var guardianName = String(rawGuardianName || '').trim();
  var guardianEmail = String(rawGuardianEmail || '').trim().toLowerCase();
  if (guardianName) setCol('GuardianName', sheetSafe_(guardianName));
  if (guardianEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail)) setCol('GuardianEmail', guardianEmail);

  // Target score — the goal the score-bridge chart on report.html measures
  // distance against. Loosely validated (1-1600 covers both the ACT's 1-36
  // and the SAT's 400-1600 without this function needing to know which
  // test the student is actually prepping for) rather than tightly, same
  // "never trust the client, but don't need to re-derive its own form
  // logic here" spirit as the rest of this function.
  var targetScore = Number(rawTargetScore);
  if (targetScore >= 1 && targetScore <= 1600) setCol('TargetScore', targetScore);

  return { ok: true };
}

/* =========================================================================
   HOMEWORK / ASSIGNMENT CHECKLIST
   -------------------------------------------------------------------------
   Lightweight "assigned this week" list, shown as a checkbox card on the
   portal home screen. No admin UI — to assign something, just add a row
   directly to the "Assignments" tab in the same Sheet:
     Timestamp | Key | Task | Done | DoneAt
   Type the student's Key, the task text, and today's date/time in
   Timestamp. Leave Done unchecked. Checking the box in the portal removes
   the item from the student's list immediately (it doesn't just get
   crossed out and sit there) and writes Done/DoneAt back to this row —
   there's no "undo" from the portal side, so if a student unchecks by
   mistake, just re-add the row.

   AUTO-EXPIRY: an assignment also disappears on its own, whether or not
   it was ever checked off, once the student is 20+ minutes into their
   NEXT tutoring session after it was assigned — the assumption being
   that session covers/reviews it, so it's stale by the time the
   following one starts. This reads the same shared iCloud calendar as
   the "next session" widget (see handleNextSession/getCalendarIcsUrl_
   below) to find each student's most recent past session start. If the
   calendar is unreachable or CALENDAR_ICS_URL isn't set, this silently
   skips expiry rather than failing — assignments just stay visible until
   manually checked off, same as before this feature existed. ========= */
function getAssignmentsSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('Assignments');
  if (!sheet) {
    sheet = ss.insertSheet('Assignments');
    sheet.appendRow(['Timestamp', 'Key', 'Task', 'Done', 'DoneAt', 'DueDate']);
  }
  return sheet;
}

// Adds the DueDate column to an existing Assignments sheet that predates
// it (same lazy-migration pattern as IncorrectQuestionsJSON etc. on the
// Students sheet) — called by every admin-scheduler handler below before
// it reads or writes DueDate, so this never has to be a one-time manual
// step in the spreadsheet itself.
function ensureAssignmentDueDateColumn_(sheet, headers) {
  if (headers.indexOf('DueDate') === -1) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue('DueDate');
    headers.push('DueDate');
  }
  return headers;
}

// How long into a new session an assignment from before it stays visible
// before auto-expiring.
var ASSIGNMENT_EXPIRY_GRACE_MS = 20 * 60 * 1000;

// Returns one student's not-yet-expired assignments (done AND still-open),
// newest-assigned first. `key` must already be uppercased/trimmed by the
// caller. `name` is the student's Name off the Students sheet — used only
// to match calendar events for the auto-expiry check; pass '' to skip
// expiry entirely (e.g. if the caller doesn't have the name handy).
//
// Checked-off items are deliberately NOT dropped here the moment they're
// done — they stay in the list (with done: true) until the same session
// -based expiry cutoff clears them out along with everything else. That's
// what makes "checked things disappear only when the next session comes
// around" true instead of "checked things disappear instantly."
function getAssignments_(key, name) {
  var sheet = getAssignmentsSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var keyCol = headers.indexOf('Key');
  var taskCol = headers.indexOf('Task');
  var doneCol = headers.indexOf('Done');
  var tsCol = headers.indexOf('Timestamp');
  var dueCol = headers.indexOf('DueDate'); // -1 on a sheet that predates this column — treated as "no due date" below, same as a blank cell
  if (keyCol === -1 || taskCol === -1) return [];

  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][keyCol]).trim().toUpperCase() !== key) continue;
    var task = String(data[i][taskCol] || '').trim();
    if (!task) continue;
    out.push({
      row: i + 1, // 1-based sheet row — sent back by the client on toggle
      task: task,
      done: truthy_(data[i][doneCol]),
      assignedAt: (tsCol !== -1 && data[i][tsCol]) ? new Date(data[i][tsCol]).toISOString() : null,
      dueDate: (dueCol !== -1 && data[i][dueCol]) ? new Date(data[i][dueCol]).toISOString() : null
    });
  }

  // A task scheduled for a future day shouldn't show up early just
  // because it already exists in the sheet — the whole point of the
  // admin scheduler is laying out several days at once. An undated task
  // (dueDate: null) is unaffected, same as before this column existed.
  var todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  out = out.filter(function (a) {
    if (!a.dueDate) return true;
    return new Date(a.dueDate).getTime() <= todayStart.getTime() + (24 * 60 * 60 * 1000 - 1);
  });

  var cutoff = name ? assignmentExpiryCutoff_(name) : null;
  if (cutoff) {
    out = out.filter(function (a) {
      // No timestamp on the row — can't compare, so err toward showing it
      // rather than silently hiding an assignment Luca can't explain.
      if (!a.assignedAt) return true;
      return new Date(a.assignedAt).getTime() >= cutoff.getTime();
    });
  }

  out.sort(function (a, b) { return (b.assignedAt || '').localeCompare(a.assignedAt || ''); });
  return out;
}

// The instant before which an assignment should no longer show, or null if
// there's no session data to base that on (calendar unreachable, no past
// session found, or not yet 20 minutes into the most recent one). Equal to
// the start time of the student's most recent past session — assignments
// timestamped before that are stale.
function assignmentExpiryCutoff_(name) {
  var firstName = String(name || '').trim().split(/\s+/)[0];
  if (!firstName) return null;
  try {
    var resp = UrlFetchApp.fetch(getCalendarIcsUrl_(), { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return null;
    var events = parseICS_(resp.getContentText());
    var now = new Date();
    var escaped = firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var nameRe = new RegExp(escaped, 'i');
    var mostRecent = null;
    events.filter(function (ev) { return nameRe.test(ev.summary); }).forEach(function (ev) {
      var occ = mostRecentOccurrenceOnOrBefore_(ev, now);
      if (occ && (!mostRecent || occ.getTime() > mostRecent.getTime())) mostRecent = occ;
    });
    if (!mostRecent) return null;
    if (now.getTime() - mostRecent.getTime() < ASSIGNMENT_EXPIRY_GRACE_MS) return null; // not 20 min in yet
    return mostRecent;
  } catch (err) {
    return null; // calendar unreachable / not configured — degrade gracefully
  }
}

// Mirror of nextOccurrenceOnOrAfter_ (see below), but walks a recurring
// event forward and returns the LATEST occurrence at or before `now`
// instead of the next one at or after it — i.e. "when did this student's
// most recent session actually start," not "when's their next one."
function mostRecentOccurrenceOnOrBefore_(ev, now) {
  if (!ev.start) return null;
  if (ev.start.getTime() > now.getTime()) return null; // hasn't happened yet
  if (!ev.rrule || !ev.rrule.freq) return ev.start; // non-recurring, already occurred

  var freq = ev.rrule.freq, interval = ev.rrule.interval || 1;
  var stepDays = freq === 'DAILY' ? interval
    : freq === 'WEEKLY' ? interval * 7
    : null;

  var cur = new Date(ev.start.getTime());
  var last = null;
  var n = 0;
  var maxIterations = 2000; // safety cap
  while (n < maxIterations) {
    if (ev.rrule.until && cur.getTime() > ev.rrule.until.getTime()) break;
    if (ev.rrule.count && n >= ev.rrule.count) break;
    if (cur.getTime() > now.getTime()) break;
    last = cur;

    if (stepDays) {
      cur = new Date(cur.getTime() + stepDays * 24 * 60 * 60 * 1000);
    } else if (freq === 'MONTHLY') {
      cur = new Date(cur.getFullYear(), cur.getMonth() + interval, cur.getDate(), cur.getHours(), cur.getMinutes(), cur.getSeconds());
    } else if (freq === 'YEARLY') {
      cur = new Date(cur.getFullYear() + interval, cur.getMonth(), cur.getDate(), cur.getHours(), cur.getMinutes(), cur.getSeconds());
    } else {
      break; // unsupported frequency
    }
    n++;
  }
  return last;
}

// Lightweight refresh endpoint — the portal calls this on its own (not
// just at login) so the checklist reflects the current true state on
// every page load/restore instead of trusting a possibly-stale cached
// copy from an earlier session snapshot. Read-only; looks up the
// student's Name itself so the expiry check above has what it needs.
function handleGetAssignments(rawKey) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };
  return { ok: true, assignments: getAssignments_(key, row.Name) };
}

// Powers the student portal's own Calendar tab — deliberately separate
// from getAssignments_/handleGetAssignments above (which feeds the Home
// checklist and intentionally hides anything not yet due, plus expires
// via the session-based cutoff). A calendar is exactly the place a
// student SHOULD be able to see a task scheduled for later in the week,
// so this returns every row for the student, unfiltered by date or
// session — same "return everything, let the client decide what to show"
// shape as the admin scheduler's handleGetAdminAssignments, just gated
// by the student's own key instead of ADMIN_KEY (same trust model as
// every other student-facing action in this file — the key IS the
// credential).
function handleGetAssignmentsCalendar(rawKey) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var studentsSheet = getSheet_();
  if (!findRow_(studentsSheet, key)) return { ok: false, error: 'bad_key' };

  var sheet = getAssignmentsSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = ensureAssignmentDueDateColumn_(sheet, data[0]);
  var keyCol = headers.indexOf('Key');
  var taskCol = headers.indexOf('Task');
  var doneCol = headers.indexOf('Done');
  var tsCol = headers.indexOf('Timestamp');
  var dueCol = headers.indexOf('DueDate');

  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][keyCol]).trim().toUpperCase() !== key) continue;
    var task = String(data[i][taskCol] || '').trim();
    if (!task) continue;
    out.push({
      row: i + 1,
      task: task,
      done: truthy_(data[i][doneCol]),
      assignedAt: (tsCol !== -1 && data[i][tsCol]) ? new Date(data[i][tsCol]).toISOString() : null,
      dueDate: (dueCol !== -1 && data[i][dueCol]) ? new Date(data[i][dueCol]).toISOString() : null
    });
  }
  return { ok: true, assignments: out };
}

// Marks one assignment done (the only direction the portal ever calls this
// with — there's no in-portal "undo"). Re-reads that row's OWN Key cell
// and requires it to match the key on the request before writing anything
// — without this check, a student could pass any row number (not just
// their own) and flip a different student's assignment.
function handleToggleAssignment(rawKey, rawRow, done) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var row = Number(rawRow);
  if (!row || row < 2) return { ok: false, error: 'bad_row' };

  var sheet = getAssignmentsSheet_();
  if (row > sheet.getLastRow()) return { ok: false, error: 'bad_row' };
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var keyCol = headers.indexOf('Key');
  var doneCol = headers.indexOf('Done');
  var doneAtCol = headers.indexOf('DoneAt');
  if (keyCol === -1 || doneCol === -1) return { ok: false, error: 'bad_sheet' };

  var rowKey = String(sheet.getRange(row, keyCol + 1).getValue()).trim().toUpperCase();
  if (rowKey !== key) return { ok: false, error: 'key_mismatch' };

  sheet.getRange(row, doneCol + 1).setValue(!!done);
  if (doneAtCol !== -1) sheet.getRange(row, doneAtCol + 1).setValue(done ? new Date() : '');

  var studentsSheet = getSheet_();
  var studentRow = findRow_(studentsSheet, key);
  return { ok: true, assignments: getAssignments_(key, studentRow ? studentRow.Name : '') };
}

/* ═══ ADMIN DAY SCHEDULER ═══ powers admin.html's per-student calendar
   (FullCalendar month view — see that file). All four actions here are
   gated by ADMIN_KEY (see its comment near SHEET_ID for the trust model)
   and, like handleToggleAssignment above, re-verify the target row's own
   Key cell before writing anything — not a security boundary against an
   already-authenticated admin, but cheap insurance against a stale row
   number sending an edit to the wrong student's row. Unlike
   getAssignments_ (the student-facing read), these return/accept EVERY
   row for a student — past, future, and done — since the calendar needs
   the whole picture, not just what's currently due.
   ═══════════════════════════════════════════════════════════════════ */
function handleGetAdminAssignments(rawAdminKey, rawKey) {
  if (!ADMIN_KEY || rawAdminKey !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var key = String(rawKey || '').trim().toUpperCase();
  if (!key) return { ok: false, error: 'missing_key' };

  var sheet = getAssignmentsSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = ensureAssignmentDueDateColumn_(sheet, data[0]);
  var keyCol = headers.indexOf('Key');
  var taskCol = headers.indexOf('Task');
  var doneCol = headers.indexOf('Done');
  var tsCol = headers.indexOf('Timestamp');
  var dueCol = headers.indexOf('DueDate');

  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][keyCol]).trim().toUpperCase() !== key) continue;
    var task = String(data[i][taskCol] || '').trim();
    if (!task) continue;
    out.push({
      row: i + 1,
      task: task,
      done: truthy_(data[i][doneCol]),
      assignedAt: (tsCol !== -1 && data[i][tsCol]) ? new Date(data[i][tsCol]).toISOString() : null,
      dueDate: (dueCol !== -1 && data[i][dueCol]) ? new Date(data[i][dueCol]).toISOString() : null
    });
  }
  return { ok: true, assignments: out };
}

// rawDueDates: array of "YYYY-MM-DD" strings — one row is appended per
// date, so a drag-selected range in the calendar (the "repeat this task
// on several days" convenience) becomes several independently
// completable/deletable rows rather than one recurring entry.
function handleCreateAdminAssignment(rawAdminKey, rawKey, rawTask, rawDueDates) {
  if (!ADMIN_KEY || rawAdminKey !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var key = String(rawKey || '').trim().toUpperCase();
  var task = String(rawTask || '').trim();
  var dates = Array.isArray(rawDueDates) ? rawDueDates : [];
  if (!key || !task || !dates.length) return { ok: false, error: 'missing_fields' };

  var studentsSheet = getSheet_();
  if (!findRow_(studentsSheet, key)) return { ok: false, error: 'bad_key' };

  var sheet = getAssignmentsSheet_();
  var headers = ensureAssignmentDueDateColumn_(sheet, sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
  var created = 0;
  dates.forEach(function (d) {
    var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ''));
    if (!parts) return; // silently skips a malformed date rather than failing the whole batch
    var dueDate = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
    var row = new Array(headers.length).fill('');
    row[headers.indexOf('Timestamp')] = new Date();
    row[headers.indexOf('Key')] = sheetSafe_(key);
    row[headers.indexOf('Task')] = sheetSafe_(task);
    row[headers.indexOf('Done')] = false;
    row[headers.indexOf('DoneAt')] = '';
    row[headers.indexOf('DueDate')] = dueDate;
    sheet.appendRow(row);
    created++;
  });
  if (!created) return { ok: false, error: 'no_valid_dates' };
  return { ok: true, created: created };
}

// patch: { task?, dueDate? ("YYYY-MM-DD" or null to clear), done? } — only
// the keys present are written, so a drag-to-reschedule (dueDate alone)
// doesn't touch task/done, and the edit popover's Save doesn't touch
// fields the admin didn't change.
function handleUpdateAdminAssignment(rawAdminKey, rawKey, rawRow, rawPatch) {
  if (!ADMIN_KEY || rawAdminKey !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var key = String(rawKey || '').trim().toUpperCase();
  var row = Number(rawRow);
  var patch = (rawPatch && typeof rawPatch === 'object') ? rawPatch : {};
  if (!key || !row || row < 2) return { ok: false, error: 'bad_row' };

  var sheet = getAssignmentsSheet_();
  if (row > sheet.getLastRow()) return { ok: false, error: 'bad_row' };
  var headers = ensureAssignmentDueDateColumn_(sheet, sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
  var keyCol = headers.indexOf('Key');

  var rowKey = String(sheet.getRange(row, keyCol + 1).getValue()).trim().toUpperCase();
  if (rowKey !== key) return { ok: false, error: 'key_mismatch' };

  if (typeof patch.task === 'string' && patch.task.trim()) {
    sheet.getRange(row, headers.indexOf('Task') + 1).setValue(sheetSafe_(patch.task.trim()));
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'dueDate')) {
    var dueCol = headers.indexOf('DueDate') + 1;
    if (patch.dueDate) {
      var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(patch.dueDate));
      if (parts) sheet.getRange(row, dueCol).setValue(new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])));
    } else {
      sheet.getRange(row, dueCol).setValue('');
    }
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'done')) {
    var doneCol = headers.indexOf('Done') + 1;
    var doneAtCol = headers.indexOf('DoneAt') + 1;
    sheet.getRange(row, doneCol).setValue(!!patch.done);
    sheet.getRange(row, doneAtCol).setValue(patch.done ? new Date() : '');
  }
  return { ok: true };
}

function handleDeleteAdminAssignment(rawAdminKey, rawKey, rawRow) {
  if (!ADMIN_KEY || rawAdminKey !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var key = String(rawKey || '').trim().toUpperCase();
  var row = Number(rawRow);
  if (!key || !row || row < 2) return { ok: false, error: 'bad_row' };

  var sheet = getAssignmentsSheet_();
  if (row > sheet.getLastRow()) return { ok: false, error: 'bad_row' };
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var keyCol = headers.indexOf('Key');
  var rowKey = String(sheet.getRange(row, keyCol + 1).getValue()).trim().toUpperCase();
  if (rowKey !== key) return { ok: false, error: 'key_mismatch' };

  sheet.deleteRow(row);
  return { ok: true };
}

/* =========================================================================
   "ASSIGN HOMEWORK" SHEET MENU
   -------------------------------------------------------------------------
   Adds an "Assign Homework" menu to this Sheet's own menu bar (next to
   File/Edit/View), so assigning something is: open the menu, pick a
   student from a dropdown, type the task, click Assign. It still just
   writes one normal row to the Assignments tab underneath — nothing about
   that tab's structure changes, this is only a friendlier way to add to
   it than typing a Key, date, and task across three separate cells.
   onOpen is an Apps Script "simple trigger" — it runs automatically the
   next time the spreadsheet is opened. If the menu isn't there yet after
   pasting this in, just reload the spreadsheet tab once.
   ========================================================================= */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Assign Homework')
    .addItem('Assign homework…', 'showAssignHomeworkDialog_')
    .addToUi();
}

function showAssignHomeworkDialog_() {
  var students = listStudentsForDialog_();
  var optionsHtml = students.map(function (s) {
    return '<option value="' + s.key + '">' + s.name + ' (' + s.key + ')</option>';
  }).join('');
  if (!optionsHtml) optionsHtml = '<option value="">No students found</option>';
  var templated = ASSIGN_HOMEWORK_HTML_.replace('%%STUDENT_OPTIONS%%', optionsHtml);
  var html = HtmlService.createHtmlOutput(templated)
    .setWidth(420)
    .setHeight(340);
  SpreadsheetApp.getUi().showModalDialog(html, 'Assign homework');
}

// Called from the dialog on load to populate the student dropdown — every
// Students-sheet row that has both a Name and a Key.
function listStudentsForDialog_() {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var nameCol = headers.indexOf('Name');
  var keyCol = headers.indexOf('Key');
  if (nameCol === -1 || keyCol === -1) return [];
  var out = [];
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][nameCol] || '').trim();
    var key = String(data[i][keyCol] || '').trim();
    if (name && key) out.push({ name: name, key: key });
  }
  out.sort(function (a, b) { return a.name.localeCompare(b.name); });
  return out;
}

// Called from the dialog's Assign button. Appends a normal row to the
// Assignments tab — identical to adding one by hand, just driven from the
// form instead of the grid.
function submitAssignmentFromDialog_(key, task) {
  var cleanKey = String(key || '').trim().toUpperCase();
  var cleanTask = String(task || '').trim();
  if (!cleanKey || !cleanTask) throw new Error('Pick a student and enter a task.');
  var sheet = getAssignmentsSheet_();
  sheet.appendRow([new Date(), sheetSafe_(cleanKey), sheetSafe_(cleanTask), false, '']);
  return { ok: true };
}

// Called via a plain fetch() POST from the Assign Homework dialog's
// <script> (not google.script.run — that RPC bridge doesn't reliably
// complete inside this dialog's sandboxed iframe in some browser
// setups, so the dialog talks to the same public web app endpoint
// the student portal already uses). Re-validates the key against the
// roster so the public endpoint can't be used to inject rows for a
// student that doesn't exist.
function handleAssignHomeworkFromDialog(rawKey, rawTask) {
  var key = String(rawKey || '').trim().toUpperCase();
  var task = String(rawTask || '').trim();
  if (!key || !task) return { ok: false, error: 'missing_fields' };
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };
  var aSheet = getAssignmentsSheet_();
  aSheet.appendRow([new Date(), sheetSafe_(key), sheetSafe_(task), false, '']);
  return { ok: true };
}

var ASSIGN_HOMEWORK_HTML_ = '<!DOCTYPE html><html><head><base target="_top">' +
  '<style>' +
  'body{font-family:Arial,sans-serif;font-size:13px;padding:4px 10px 14px;color:#222;}' +
  'label{display:block;font-weight:600;margin:14px 0 5px;}' +
  'select,textarea{width:100%;box-sizing:border-box;padding:8px;font-size:13px;font-family:inherit;border:1px solid #ccc;border-radius:4px;}' +
  'textarea{resize:vertical;min-height:70px;}' +
  'button{margin-top:18px;padding:9px 20px;background:#b23b2e;color:#fff;border:none;border-radius:4px;font-size:13px;cursor:pointer;}' +
  'button:disabled{opacity:0.5;cursor:default;}' +
  '#status{margin-top:10px;font-size:12px;color:#666;min-height:16px;}' +
  '#status.error{color:#b23b2e;}' +
  '</style></head><body>' +
  '<label for="student">Student</label>' +
  '<select id="student">%%STUDENT_OPTIONS%%</select>' +
  '<label for="task">Task</label>' +
  '<textarea id="task" placeholder="e.g. Finish Reading Module 3, pgs 12–20"></textarea>' +
  '<button id="submitBtn" onclick="submitForm()">Assign</button>' +
  '<div id="status"></div>' +
  '<script>' +
  'function submitForm(){' +
  '  var key=document.getElementById("student").value;' +
  '  var task=document.getElementById("task").value.trim();' +
  '  var statusEl=document.getElementById("status");' +
  '  var btn=document.getElementById("submitBtn");' +
  '  if(!key||!task){statusEl.textContent="Pick a student and enter a task.";statusEl.className="error";return;}' +
  '  btn.disabled = true; statusEl.textContent = "Assigning…"; statusEl.className = "";' +
  '  fetch("https://script.google.com/macros/s/AKfycbwsLMGq3lhBEPObcas0k8gVS67NX9y4wXKG6RgzKtlBOT2SXfREK6vBpvvM19w9s1m6/exec",{method:"POST",body:JSON.stringify({action:"assignHomeworkFromDialog",key:key,task:task})})' +
  '    .then(function(r){return r.json();})' +
  '    .then(function(resp){' +
  '      if(resp && resp.ok){' +
  '        statusEl.textContent = "Assigned. Close this window or assign another.";' +
  '        statusEl.className = "";' +
  '        document.getElementById("task").value = "";' +
  '      } else {' +
  '        statusEl.textContent = "Error: " + (resp && resp.error ? resp.error : "unknown");' +
  '        statusEl.className = "error";' +
  '      }' +
  '      btn.disabled = false;' +
  '    })' +
  '    .catch(function(err){' +
  '      statusEl.textContent = "Error: " + err;' +
  '      statusEl.className = "error";' +
  '      btn.disabled = false;' +
  '    });' +
  '}' +
  '</script></body></html>';

/* =========================================================================
   ONE REAL DIAGNOSTIC PER TEST TYPE
   -------------------------------------------------------------------------
   The portal calls this right after a student finishes a diagnostic for
   the first time for a given test type (SAT or ACT) — see index.html's
   finishDiagnostic(). It stamps SATTakenAt/ACTTakenAt so that on any later
   attempt at the SAME test type, handleAuth's satTaken/actTaken flags tell
   the portal to skip emailing Luca and show practice-only copy instead —
   a student can't keep re-submitting the same diagnostic hoping for a
   better score to land in Luca's inbox. Taking the OTHER test type for the
   first time is unaffected and still emails normally.

   Deliberately idempotent (only writes if the cell is currently blank) so
   it's safe to call more than once for the same key/test without losing
   the original completion date. ========================================= */
function handleMarkDiagnosticTaken(rawKey, rawTest) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var test = String(rawTest || '').trim().toUpperCase();
  if (test !== 'SAT' && test !== 'ACT') return { ok: false, error: 'bad_test' };

  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var col = test + 'TakenAt';
  var colIdx = row._headers.indexOf(col);
  if (colIdx === -1) return { ok: false, error: 'missing_column' };

  if (!row[col]) sheet.getRange(row._rowIndex, colIdx + 1).setValue(new Date());
  return { ok: true };
}

/* =========================================================================
   SEND A DIAGNOSTIC RESULT TO LUCA — server-side, key-gated
   -------------------------------------------------------------------------
   Replaces the old browser-side EmailJS send. That approach shipped the
   EmailJS service/template/public keys in the page source, so ANYONE who
   viewed source could call emailjs.send() from a console with a made-up
   name and score — no key, no exam, nothing server-side. That's exactly
   how a stranger sent a fake "100% — PWNED" result: they replayed the
   client email call, they never actually took anything.

   This closes that hole:
     - The request must carry a key that exists in the Students sheet.
       No valid key -> no email. A stranger can't pass this.
     - The student NAME in the email comes from the sheet row, never from
       whatever the browser sent, so it can't be spoofed to "PWNED".
     - The report link is only accepted if it points at our own report
       page, so the email body can't be weaponized into a link elsewhere.
   A person holding a REAL key is a real student, and the worst they can do
   is send their own name with a score they could inflate — a completely
   different risk level from anonymous forgery, and one tied to an identity.
   ========================================================================= */
function handleSubmitDiagnostic(rawKey, rawTest, score, reportLink, reportText, scoreFields) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var test = String(rawTest || '').trim().toUpperCase();
  if (test !== 'SAT' && test !== 'ACT') return { ok: false, error: 'bad_test' };

  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' }; // the gate: unknown key -> nothing is sent

  // Name comes from the roster, not the client. This is what makes a
  // spoofed display name ("PWNED") impossible.
  var name = String(row.Name || '').trim() || '(unnamed student)';
  var safeScore = String(score == null ? '' : score).replace(/[\r\n]+/g, ' ').slice(0, 60);
  // This link is a self-contained base64 blob of the whole diagnostic
  // (every answer plus per-question timing data for every section) — NOT
  // a normal short URL. A full SAT run easily runs past 4000 characters
  // once timing telemetry is included. The old 4000-char cap here was
  // silently truncating it mid-base64, corrupting the payload so
  // report.html couldn't decode it at all ("Couldn't read the report data
  // from this link") — every report saved before this fix was affected.
  // 200000 is generous headroom while still bounding what a spoofed
  // request could shove into a Sheet cell / Drive file.
  var link = String(reportLink || '').slice(0, 200000);
  // Must actually START WITH our real report page's origin+path, not just
  // contain that text anywhere — indexOf(...) === -1 as a "contains" check
  // would let a link like https://evil.example/?x=morettitutoring.com/portal/report.html
  // through, since that string does appear somewhere in it. A prefix check
  // against the real origin closes that.
  var REPORT_PAGE_PREFIX = 'https://morettitutoring.com/portal/report.html';
  if (link && link.indexOf(REPORT_PAGE_PREFIX) !== 0) {
    link = '(report link withheld — did not point at the portal report page)';
  }
  var extra = String(reportText || '').slice(0, 100000);
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/New_York', 'yyyy-MM-dd');

  // ═══ THE FIX ═══ The email used to be the ONLY place a result's score/
  // report ever landed — a send failure (quota, transient Gmail error,
  // network) silently destroyed the only copy, which is exactly what
  // happened to a real student's diagnostic. Now there are two durable,
  // non-email stores written FIRST, before email is even attempted, and
  // the email itself is downgraded to a best-effort "heads up" ping that
  // carries no unique data — losing it costs nothing but convenience.
  //
  //   1. DiagnosticLog tab (this spreadsheet) — always-on backup, works
  //      even if a student's Drive folder is missing/misconfigured.
  //   2. A .txt file saved directly into the student's own Drive folder —
  //      the primary, student-facing record. Contains the full
  //      question-by-question report plus the link to the pretty
  //      formatted version.
  var driveOk = false, driveFileUrl = '';
  try {
    var fileText = name + ' — ' + test + ' Diagnostic — ' + dateStr + '\n' +
                   'Score: ' + (safeScore || '(not recorded)') + '\n' +
                   'Formatted report (open, review, Print / Save as PDF):\n' + link +
                   '\n\n' + '='.repeat(60) + '\n\n' + extra;
    var folderId = extractFolderId_(row.DriveFolderUrl);
    if (folderId) {
      var folder = DriveApp.getFolderById(folderId);
      var fileName = name + ' — ' + test + ' Diagnostic — ' + dateStr + '.txt';
      var file = folder.createFile(fileName, fileText, MimeType.PLAIN_TEXT);
      driveFileUrl = file.getUrl();
      driveOk = true;
    } else {
      console.error('No Drive folder on record for ' + key + ' — could not save diagnostic file.');
    }
  } catch (driveErr) {
    console.error('Failed to save diagnostic file to Drive for ' + key + ': ' + driveErr);
  }

  // Best-effort notification — Luca still gets pinged the moment a result
  // comes in, but the ping itself carries no irreplaceable data, so if
  // this fails the worst case is he finds out by checking the folder or
  // DiagnosticLog instead of his inbox, not that anything is lost.
  var emailError = null;
  try {
    var subject = 'New ' + test + ' Diagnostic — ' + name + (safeScore ? ' — ' + safeScore : '');
    var body = 'Student: ' + name + '\n' +
               'Key: ' + key + '\n' +
               'Test: ' + test + '\n' +
               (safeScore ? 'Score: ' + safeScore + '\n' : '') +
               '\nSaved to her Drive folder:\n' + (driveFileUrl || '(not saved — see DiagnosticLog tab)') +
               (row.DriveFolderUrl ? '\nFolder:\n' + row.DriveFolderUrl : '') +
               '\n\nFormatted report:\n' + link;
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (err) {
    emailError = String(err);
    console.error('MailApp.sendEmail failed for ' + key + ' (' + test + '): ' + emailError);
  }

  // Written LAST so it can record whether the email actually went out —
  // this makes DiagnosticLog self-diagnosing. If email silently fails
  // again, you don't need the Executions log at all: just open the
  // DiagnosticLog tab and read the EmailSent/EmailError columns directly.
  var logOk = false;
  try {
    logDiagnosticResult_(key, name, test, safeScore, link, extra, driveOk, driveFileUrl, !emailError, emailError, 'diagnostic', '', test, scoreFields);
    logOk = true;
  } catch (logErr) {
    console.error('Failed to write DiagnosticLog row for ' + key + ': ' + logErr);
  }

  // ok as long as AT LEAST ONE durable store succeeded — that's the real
  // bar now, not "did the email send."
  return { ok: logOk || driveOk, driveSaved: driveOk, driveFileUrl: driveFileUrl, logSaved: logOk, emailSent: !emailError, emailError: emailError || undefined };
}

// Sibling of handleSubmitDiagnostic above, for full practice-test attempts
// (portal/practice-tests.js, e.g. "SAT Practice Test 2") instead of the
// diagnostic. Deliberately NOT the same function: handleSubmitDiagnostic
// hard-rejects any test value other than 'SAT'/'ACT' (line ~600 above),
// which a practice test title like "SAT Practice Test 2" would fail. This
// version takes a free-text title instead and otherwise mirrors the same
// two-durable-stores-before-email pattern (DiagnosticLog row + a Drive
// .txt file), reusing the same logDiagnosticResult_ helper so both flows
// show up in one place for Luca to review. Rows/files from practice tests
// are distinguishable by the Test column containing the full test title
// ("SAT Practice Test 2") instead of just "SAT"/"ACT".
function handleSubmitPracticeTest(rawKey, rawTitle, score, reportLink, reportText, rawTestId, scoreFields) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var test = String(rawTitle || '').trim().slice(0, 80) || 'Practice Test';
  var testId = String(rawTestId || '').trim().slice(0, 80);

  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var name = String(row.Name || '').trim() || '(unnamed student)';
  var safeScore = String(score == null ? '' : score).replace(/[\r\n]+/g, ' ').slice(0, 60);
  var link = String(reportLink || '').slice(0, 200000);
  var REPORT_PAGE_PREFIX = 'https://morettitutoring.com/portal/report.html';
  if (link && link.indexOf(REPORT_PAGE_PREFIX) !== 0) {
    link = '(report link withheld — did not point at the portal report page)';
  }
  var extra = String(reportText || '').slice(0, 100000);
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/New_York', 'yyyy-MM-dd');

  var driveOk = false, driveFileUrl = '';
  try {
    var fileText = name + ' — ' + test + ' — ' + dateStr + '\n' +
                   'Score: ' + (safeScore || '(not recorded)') + '\n' +
                   'Formatted report (open, review, Print / Save as PDF):\n' + link +
                   '\n\n' + '='.repeat(60) + '\n\n' + extra;
    var folderId = extractFolderId_(row.DriveFolderUrl);
    if (folderId) {
      var folder = DriveApp.getFolderById(folderId);
      var fileName = name + ' — ' + test + ' — ' + dateStr + '.txt';
      var file = folder.createFile(fileName, fileText, MimeType.PLAIN_TEXT);
      driveFileUrl = file.getUrl();
      driveOk = true;
    } else {
      console.error('No Drive folder on record for ' + key + ' — could not save practice test file.');
    }
  } catch (driveErr) {
    console.error('Failed to save practice test file to Drive for ' + key + ': ' + driveErr);
  }

  var emailError = null;
  try {
    var subject = 'New ' + test + ' — ' + name + (safeScore ? ' — ' + safeScore : '');
    var body = 'Student: ' + name + '\n' +
               'Key: ' + key + '\n' +
               'Test: ' + test + '\n' +
               (safeScore ? 'Score: ' + safeScore + '\n' : '') +
               '\nSaved to her Drive folder:\n' + (driveFileUrl || '(not saved — see DiagnosticLog tab)') +
               (row.DriveFolderUrl ? '\nFolder:\n' + row.DriveFolderUrl : '') +
               '\n\nFormatted report:\n' + link;
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (err) {
    emailError = String(err);
    console.error('MailApp.sendEmail failed for ' + key + ' (' + test + '): ' + emailError);
  }

  var logOk = false;
  try {
    logDiagnosticResult_(key, name, test, safeScore, link, extra, driveOk, driveFileUrl, !emailError, emailError, 'practice-test', testId, 'SAT', scoreFields);
    logOk = true;
  } catch (logErr) {
    console.error('Failed to write DiagnosticLog row for ' + key + ': ' + logErr);
  }

  return { ok: logOk || driveOk, driveSaved: driveOk, driveFileUrl: driveFileUrl, logSaved: logOk, emailSent: !emailError, emailError: emailError || undefined };
}

// One row per diagnostic/practice-test attempt, tagged by Kind so this one
// tab can serve both the old "DiagnosticLog" (full report text + Drive/
// email status, written here) and "ScoreHistory" (composite/section
// scores, written by handleSyncScoreHistory below) jobs without forcing
// the two separate client calls that produce them into a single request.
// Auto-created on first use, self-migrates in an existing spreadsheet the
// same way getScoreHistorySheet_ used to. Columns: Kind | Timestamp | Key
// | Name | TestType | Source | TestId | TestTitle | Score | Composite |
// ScaleMin | ScaleMax | RW | Math | WeakestLabel | WeakestCorrect |
// WeakestTotal | ReportLink | AttemptId | Report | DriveSaved |
// DriveFileUrl | EmailSent | EmailError.
var ATTEMPTS_HEADERS_ = ['Kind', 'Timestamp', 'Key', 'Name', 'TestType', 'Source', 'TestId', 'TestTitle',
  'Score', 'Composite', 'ScaleMin', 'ScaleMax', 'RW', 'Math', 'WeakestLabel', 'WeakestCorrect', 'WeakestTotal',
  'ReportLink', 'AttemptId', 'Report', 'DriveSaved', 'DriveFileUrl', 'EmailSent', 'EmailError'];
function getAttemptsSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('Attempts');
  if (!sheet) {
    sheet = ss.insertSheet('Attempts');
    sheet.appendRow(ATTEMPTS_HEADERS_);
  } else {
    var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    ATTEMPTS_HEADERS_.forEach(function (name) {
      if (headers.indexOf(name) === -1) {
        sheet.getRange(1, headers.length + 1).setValue(name);
        headers.push(name);
      }
    });
  }
  return sheet;
}

// Appends one Kind:'log' row to the Attempts sheet so every submitted
// diagnostic has a durable record independent of email delivery, AND
// records whether the email itself succeeded — so a future silent email
// failure is diagnosable straight from the spreadsheet, no Executions log
// required.
// source/testId/testType are what let this 'log' row participate in the
// SAME "Completed" badge / Attempt 1,2,3.../View Results grouping that
// 'score' rows drive on the portal (see practiceTestAttempts()/
// diagnosticAttempts() in index.html) — without them, a real, successful
// submission would still be durably logged here but invisible to that UI,
// since it filters on exactly these three fields.
function logDiagnosticResult_(key, name, test, score, reportLink, reportText, driveSaved, driveFileUrl, emailSent, emailError, source, testId, testType, scoreFields) {
  var sheet = getAttemptsSheet_();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  var out = new Array(headers.length).fill('');
  out[col.Kind] = 'log';
  out[col.Timestamp] = new Date();
  out[col.Key] = sheetSafe_(key);
  out[col.Name] = sheetSafe_(name);
  out[col.TestTitle] = sheetSafe_(test);
  out[col.Score] = sheetSafe_(score);
  out[col.ReportLink] = sheetSafe_(reportLink);
  out[col.Report] = sheetSafe_(reportText);
  out[col.DriveSaved] = !!driveSaved;
  out[col.DriveFileUrl] = sheetSafe_(driveFileUrl || '');
  out[col.EmailSent] = !!emailSent;
  out[col.EmailError] = sheetSafe_(emailError || '');
  out[col.Source] = source || '';
  out[col.TestId] = testId || '';
  out[col.TestType] = testType || '';
  // Carried on this SAME row (instead of only the separate 'score'-Kind
  // row a parallel syncScoreHistory call used to write) so the Home
  // graph/"View Results" menu always has a composite the moment this
  // request succeeds — see scoreEntryForSubmit in index.html for why the
  // old separate call couldn't be relied on alone.
  var sf = (scoreFields && typeof scoreFields === 'object') ? scoreFields : {};
  var composite = Number(sf.composite);
  if (composite) {
    out[col.Composite] = composite;
    out[col.ScaleMin] = Number(sf.scaleMin) || '';
    out[col.ScaleMax] = Number(sf.scaleMax) || '';
    out[col.RW] = Number(sf.rw) || '';
    out[col.Math] = Number(sf.math) || '';
    var weakest = (sf.weakest && typeof sf.weakest === 'object') ? sf.weakest : null;
    out[col.WeakestLabel] = weakest ? sheetSafe_(weakest.label || '') : '';
    out[col.WeakestCorrect] = weakest ? (Number(weakest.correct) || '') : '';
    out[col.WeakestTotal] = weakest ? (Number(weakest.total) || '') : '';
    out[col.AttemptId] = sf.attemptId ? String(sf.attemptId) : '';
  }
  sheet.appendRow(out);
}

/* =========================================================================
   STUDENT PROGRESS SYNC — "My Incorrect Questions" / "Practice My Weak
   Spots", moved server-side
   -------------------------------------------------------------------------
   These two portal tools used to be 100% client-side (localStorage only),
   which meant the data only ever existed in whatever browser/device took
   the test — a student taking a practice test on one device and checking
   their weak spots on another (or Luca checking from his own computer)
   always saw nothing, even though the attempt genuinely happened. Three
   columns on the Students sheet itself — IncorrectQuestionsJSON,
   SkillStatsJSON, ProgressUpdatedAt (auto-created the first time this
   runs, same pattern as AccomTimeMult etc. in handleSaveOnboardingPrefs
   above) — are now the source of truth both tools read from (via action
   'getProgress'), kept current by every diagnostic/practice-test
   completion (action 'syncProgress', called right alongside the existing
   submitDiagnostic/submitPracticeTest send — see index.html's
   syncProgressToBackend()). This used to be its own "Progress" tab
   (one row per student key, same shape); folded into Students since it's
   always been 1:1 with a student row anyway.
     - IncorrectQuestionsJSON: the SAME byKey map the client used to keep
       in localStorage — merged here the identical way (a miss (re)writes
       its entry, a correct answer on a later attempt clears it), so this
       always reflects CURRENT outstanding misses, not full history.
     - SkillStatsJSON: OVERWRITTEN (not merged) with whatever came in on
       THIS submission — "Practice My Weak Spots" is meant to reflect the
       most recently completed diagnostic/practice test, not a lifetime
       aggregate, so each new attempt fully replaces the last one's
       breakdown rather than blending into it.
   ========================================================================= */

// A Google Sheets cell tops out around 50,000 characters. As of the
// client-side slimming in index.html (each miss now stores only
// {key, correct, given, attemptedAt} — full question text/choices/
// explanations are resolved back out of banks.js/practice-tests.js at
// render time via window.resolveQuestionByKey(), not stored here), this
// should essentially never trigger anymore; it's kept as a safety net
// (and to gracefully finish shrinking any pre-existing rows still
// carrying old, unslimmed records). Rather than truncate the JSON string
// itself (which would corrupt it), this drops the OLDEST misses (by
// attemptedAt) one at a time until the serialized map fits — a student's
// most recent misses are the ones "Practice My Weak Spots" and this log
// actually need.
var PROGRESS_CELL_CAP_ = 45000;
function capIncorrectByKey_(byKey) {
  if (JSON.stringify(byKey).length <= PROGRESS_CELL_CAP_) return byKey;
  var oldestFirst = Object.keys(byKey).sort(function (a, b) {
    return String((byKey[a] && byKey[a].attemptedAt) || '').localeCompare(String((byKey[b] && byKey[b].attemptedAt) || ''));
  });
  while (oldestFirst.length && JSON.stringify(byKey).length > PROGRESS_CELL_CAP_) {
    delete byKey[oldestFirst.shift()];
  }
  return byKey;
}

// rawIncorrect: array of records shaped like index.html's incorrectRecords
// (or the slimmed {key, correct:true} form for entries the client already
// knows are correct — see syncProgressToBackend()). rawSkills: this attempt's
// own bySkill-shaped breakdown (already split into domain/skill fields by the
// client — see skillsToBySkill() in index.html), which fully replaces
// whatever was stored before. Saved-question data is intentionally NOT
// touched here — see handleSaveQuestion() below, a separate action so a
// student saving/un-saving a question while reviewing a report can never
// accidentally overwrite SkillStatsJSON (which this handler REPLACES, not
// merges, on every call).
function handleSyncProgress(rawKey, rawIncorrect, rawSkills) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' }; // same gate as the other submit handlers — unknown key writes nothing

  var headers = row._headers;
  ['IncorrectQuestionsJSON', 'SkillStatsJSON', 'ProgressUpdatedAt'].forEach(function (col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col);
      headers.push(col);
    }
  });

  var byKey = {};
  try { byKey = JSON.parse(row.IncorrectQuestionsJSON) || {}; } catch (e) { byKey = {}; }
  (Array.isArray(rawIncorrect) ? rawIncorrect : []).forEach(function (r) {
    if (!r || !r.key) return;
    if (r.correct) delete byKey[r.key];
    else {
      // wrongAttempts accumulates across misses on the SAME question
      // (Mistakes Log shows it as "N wrong attempts") — reset back to 0
      // the moment the entry is deleted above on a correct answer, so a
      // question missed, fixed, then missed again later starts counting
      // fresh rather than carrying a stale streak forward.
      var prevAttempts = (byKey[r.key] && byKey[r.key].wrongAttempts) || 0;
      byKey[r.key] = Object.assign({}, r, { wrongAttempts: prevAttempts + 1 });
    }
  });
  byKey = capIncorrectByKey_(byKey);
  var bySkill = (rawSkills && typeof rawSkills === 'object') ? rawSkills : {};

  var iqCol = headers.indexOf('IncorrectQuestionsJSON');
  var skCol = headers.indexOf('SkillStatsJSON');
  var atCol = headers.indexOf('ProgressUpdatedAt');
  sheet.getRange(row._rowIndex, iqCol + 1).setValue(sheetSafe_(JSON.stringify(byKey)));
  sheet.getRange(row._rowIndex, skCol + 1).setValue(sheetSafe_(JSON.stringify(bySkill)));
  sheet.getRange(row._rowIndex, atCol + 1).setValue(new Date());
  return { ok: true };
}

/* ═══ SAVED & MISTAKES — "SAVE" FROM A REPORT REVIEW ═══ deliberately its
   own action, not folded into syncProgress above: a student can save (or
   un-save) a question at ANY time while reviewing a past report, not only
   right after finishing a test, and syncProgress REPLACES SkillStatsJSON
   wholesale on every call — routing saves through it would risk wiping a
   student's skill breakdown every time they bookmark a question days
   later. rawRecord: {key, remove} to un-save, or {key, given, correct,
   savedAt, testTitle, ...} to save — same slim-record philosophy as
   IncorrectQuestionsJSON (resolved back to full question text/choices at
   render time via window.resolveQuestionByKey(), not stored here). */
function handleSaveQuestion(rawKey, rawRecord) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  if (!rawRecord || !rawRecord.key) return { ok: false, error: 'missing_record' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var headers = row._headers;
  if (headers.indexOf('SavedQuestionsJSON') === -1) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue('SavedQuestionsJSON');
    headers.push('SavedQuestionsJSON');
  }
  var savedByKey = {};
  try { savedByKey = JSON.parse(row.SavedQuestionsJSON) || {}; } catch (e) { savedByKey = {}; }
  if (rawRecord.remove) delete savedByKey[rawRecord.key];
  else savedByKey[rawRecord.key] = rawRecord;
  savedByKey = capIncorrectByKey_(savedByKey); // same 45k-char cell cap, oldest (by savedAt) dropped first

  var svCol = headers.indexOf('SavedQuestionsJSON');
  sheet.getRange(row._rowIndex, svCol + 1).setValue(sheetSafe_(JSON.stringify(savedByKey)));
  return { ok: true };
}

/* ═══ QUESTION BANK — RECORD A MISS ═══ same reasoning as handleSaveQuestion
   just above: its own action rather than routed through syncProgress,
   because syncProgress REPLACES SkillStatsJSON wholesale on every call and
   a Question Bank practice session has no "this attempt's skill breakdown"
   of its own to send — calling syncProgress with an empty/partial one
   would silently wipe the student's real diagnostic/practice-test skill
   breakdown. This ONLY ever touches IncorrectQuestionsJSON, merging in one
   record at a time (rawRecord: {key, given, correct, attemptedAt} — same
   slim-record shape every other miss uses, resolved back to full question
   content at render time via window.resolveQuestionByKey()'s 'qb|' key
   branch, not stored here). A student who later answers the same question
   right also calls this (with correct:true), which deletes rather than
   stores it — same self-clearing behavior IncorrectQuestionsJSON already
   has everywhere else. */
function handleAddIncorrectQuestion(rawKey, rawRecord) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  if (!rawRecord || !rawRecord.key) return { ok: false, error: 'missing_record' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var headers = row._headers;
  if (headers.indexOf('IncorrectQuestionsJSON') === -1) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue('IncorrectQuestionsJSON');
    headers.push('IncorrectQuestionsJSON');
  }
  var byKey = {};
  try { byKey = JSON.parse(row.IncorrectQuestionsJSON) || {}; } catch (e) { byKey = {}; }
  if (rawRecord.correct) delete byKey[rawRecord.key];
  else {
    // Same wrongAttempts accumulation as handleSyncProgress above.
    var prevAttempts = (byKey[rawRecord.key] && byKey[rawRecord.key].wrongAttempts) || 0;
    byKey[rawRecord.key] = Object.assign({}, rawRecord, { wrongAttempts: prevAttempts + 1 });
  }
  byKey = capIncorrectByKey_(byKey);

  var iqCol = headers.indexOf('IncorrectQuestionsJSON');
  sheet.getRange(row._rowIndex, iqCol + 1).setValue(sheetSafe_(JSON.stringify(byKey)));
  return { ok: true };
}

/* ═══ SAVED & MISTAKES — COLLECTIONS ═══ student-defined, self-service
   drill decks (e.g. "Weak Algebra", "Review before test") — a question
   can belong to any number of them, independent of whether it's
   currently saved or an outstanding mistake, so adding a miss to a
   collection doesn't stop it from clearing out of the Mistakes Log once
   it's answered correctly, and a collection entry doesn't vanish either
   way. rawCollections is the client's FULL, already-merged collections
   object ({ [name]: { [key]: {addedAt} } }) — this overwrites
   CollectionsJSON wholesale rather than merging one entry at a time
   (unlike IncorrectQuestionsJSON/SavedQuestionsJSON above). That's safe
   here specifically because a student only ever edits their own
   collections from one device at a time in practice, and the local
   cache the client sends this from is itself already the merge of
   whatever the backend last had plus this device's own edits — see
   fetchPortalProgress()/syncCollectionsToBackend() in index.html. */
function handleUpdateCollections(rawKey, rawCollections) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  if (!rawCollections || typeof rawCollections !== 'object') return { ok: false, error: 'missing_collections' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var headers = row._headers;
  if (headers.indexOf('CollectionsJSON') === -1) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue('CollectionsJSON');
    headers.push('CollectionsJSON');
  }
  var colCol = headers.indexOf('CollectionsJSON');
  sheet.getRange(row._rowIndex, colCol + 1).setValue(sheetSafe_(JSON.stringify(rawCollections)));
  return { ok: true };
}

/* ═══ VOCABULARY PROGRESS ═══ was 100% localStorage (moretti_vocab_progress_
   <key>), so a student's mastered/still-learning words on one device were
   invisible on another. rawProgress is the CLIENT's own already-merged view
   ({stillLearning, seen, termUpdatedAt} — see loadProgress()/mergeVocab
   Progress_() in index.html) — same "client merges, server just overwrites"
   approach as handleUpdateCollections above, safe for the same reason: a
   student only ever studies vocab from one device at a time, and the
   client always merges local+server (via getProgress) before pushing here,
   so an overwrite never silently drops the other device's data. */
function handleSyncVocabProgress(rawKey, rawProgress) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  if (!rawProgress || typeof rawProgress !== 'object') return { ok: false, error: 'missing_progress' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var headers = row._headers;
  if (headers.indexOf('VocabProgressJSON') === -1) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue('VocabProgressJSON');
    headers.push('VocabProgressJSON');
  }
  var payload = {
    stillLearning: (rawProgress.stillLearning && typeof rawProgress.stillLearning === 'object') ? rawProgress.stillLearning : {},
    seen: (rawProgress.seen && typeof rawProgress.seen === 'object') ? rawProgress.seen : {},
    termUpdatedAt: (rawProgress.termUpdatedAt && typeof rawProgress.termUpdatedAt === 'object') ? rawProgress.termUpdatedAt : {}
  };
  var vpCol = headers.indexOf('VocabProgressJSON');
  sheet.getRange(row._rowIndex, vpCol + 1).setValue(sheetSafe_(JSON.stringify(payload)));
  return { ok: true };
}

/* ═══ QUESTION BANK — PER-QUESTION ATTEMPT HISTORY ═══ same story as vocab
   above: the per-skill "solved" tracking (moretti_qb_progress_<key>.
   attempts) that drives each subtopic's mastery % was local-only, so
   Question Bank progress looked wiped every time a student switched
   devices. rawAttempts is the client's own already-merged
   {qid: {correct, attemptedAt}} map — same overwrite-after-client-merge
   approach as VocabProgressJSON. Reuses capIncorrectByKey_ since the shape
   (an object keyed by id, each entry carrying attemptedAt) is identical to
   IncorrectQuestionsJSON. */
function handleSyncQbAttempts(rawKey, rawAttempts) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  if (!rawAttempts || typeof rawAttempts !== 'object') return { ok: false, error: 'missing_attempts' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var headers = row._headers;
  if (headers.indexOf('QbAttemptsJSON') === -1) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue('QbAttemptsJSON');
    headers.push('QbAttemptsJSON');
  }
  var attempts = capIncorrectByKey_(rawAttempts);
  var qaCol = headers.indexOf('QbAttemptsJSON');
  sheet.getRange(row._rowIndex, qaCol + 1).setValue(sheetSafe_(JSON.stringify(attempts)));
  return { ok: true };
}

// Bumped whenever handleGetProgress's response shape changes in a way the
// client needs to know about to trust it fully. Specifically: a client
// talking to an OLDER, not-yet-redeployed Code.gs gets a response that's
// simply missing this field (undefined, not a lower number) — that's the
// signal index.html's fetchPortalProgress() uses to tell "the backend
// legitimately has nothing here" (safe to reconcile away stale local
// incorrectQuestions/savedQuestions entries the server no longer confirms)
// apart from "this deployed backend predates the field entirely" (never
// safe to reconcile against — it would purge real data the backend was
// never asked about). See fetchPortalProgress()'s own comment for the full
// reasoning; bump this again if that response shape changes again.
var PROGRESS_API_VERSION = 2;
// Read-only fetch for the portal tools — deliberately returns ok:true
// with empty objects for a valid key that just has no progress synced yet
// (brand-new student, nothing submitted), rather than an error; only an
// unrecognized key is rejected.
function handleGetProgress(rawKey) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var byKey = {}, bySkill = {}, savedByKey = {}, collections = {}, vocabProgress = null, qbAttempts = {};
  try { byKey = JSON.parse(row.IncorrectQuestionsJSON) || {}; } catch (e) { /* ignore */ }
  try { bySkill = JSON.parse(row.SkillStatsJSON) || {}; } catch (e) { /* ignore */ }
  try { savedByKey = JSON.parse(row.SavedQuestionsJSON) || {}; } catch (e) { /* ignore */ }
  try { collections = JSON.parse(row.CollectionsJSON) || {}; } catch (e) { /* ignore */ }
  try { vocabProgress = JSON.parse(row.VocabProgressJSON) || null; } catch (e) { /* ignore */ }
  try { qbAttempts = JSON.parse(row.QbAttemptsJSON) || {}; } catch (e) { /* ignore */ }
  return { ok: true, apiVersion: PROGRESS_API_VERSION, incorrectQuestions: byKey, skillStats: bySkill, savedQuestions: savedByKey, collections: collections, vocabProgress: vocabProgress, qbAttempts: qbAttempts };
}

/* =========================================================================
   DELETE A TEST RESULT — self-service, student-facing. A student can
   remove one of their own past diagnostic/practice-test attempts from the
   "View Results" menu on the Practice Tests screen (e.g. a run that
   glitched partway through and logged bogus answers) so it stops skewing
   their own incorrect-question bank, saved questions, and score history.
   Scoped entirely by the student's own key — same gate every other
   student-facing action here already uses (findRow_ against `key`), so
   this can only ever touch that one student's own row.
   ========================================================================= */

// The testTag prefix every IncorrectQuestionsJSON/SavedQuestionsJSON key
// carries (see index.html's report renderer: testTag + '|' + sectionKey +
// '|' + moduleName + '|' + moduleIndex) — a practice test's own id
// (row.TestId, e.g. "sat-practice-2"), or 'diag-' + the SAT/ACT type for
// the diagnostic. `row` here is any object with Source/TestId/TestType
// fields, not necessarily a full Attempts-sheet row.
function testTagForAttemptRow_(row) {
  if (row.Source === 'practice-test' && row.TestId) return String(row.TestId);
  if (row.Source === 'diagnostic' && row.TestType) return 'diag-' + String(row.TestType);
  return null;
}

// Deletes everything tied to ONE attempt (identified by testTag — see
// index.html's deleteAttempt(), which computes the same tag from the
// attempt it's deleting): its IncorrectQuestionsJSON/SavedQuestionsJSON
// entries (matched by the testTag prefix every question key carries) and
// its Attempts-sheet rows (both 'log' and 'score' kind — the latter is
// what drives the Home score-progress graph and this same "View Results"
// menu). Does NOT touch SkillStatsJSON — it isn't attempt-tagged
// (handleSyncProgress overwrites it wholesale on every submission, so
// there's no way to tell which attempt it came from), so clearing it here
// could just as easily wipe a good attempt's breakdown as a bad one's.
//
// testTag alone only identifies the TEST, not the attempt — a retake of
// the same practice test (or a second diagnostic of the same type) shares
// one testTag with the first attempt. Without rawAttemptId, "delete this
// one bad attempt" would therefore delete every Attempts-sheet row for
// that test, not just the one clicked (this is exactly what happened to a
// student with two attempts on the same test — see the incident this
// param was added for). rawAttemptId scopes the Attempts-sheet deletion to
// the single matching row when present; IncorrectQuestionsJSON/
// SavedQuestionsJSON still use the testTag prefix only, since those keys
// were never attempt-tagged in the first place (a retake overwrites the
// same question keys rather than appending new ones, so there's nothing
// attempt-specific there to preserve).
function handleDeleteAttempt(rawKey, rawTestTag, rawAttemptId) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  if (!rawTestTag) return { ok: false, error: 'missing_test_tag' };
  var key = String(rawKey).trim().toUpperCase();
  var testTag = String(rawTestTag);
  var attemptId = rawAttemptId ? String(rawAttemptId) : '';

  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var removedIncorrect = 0, removedSaved = 0, removedAttemptRows = 0;
  var prefix = testTag + '|';

  var byKey = {};
  try { byKey = JSON.parse(row.IncorrectQuestionsJSON) || {}; } catch (e) { byKey = {}; }
  Object.keys(byKey).forEach(function (k) {
    if (k.indexOf(prefix) === 0) { delete byKey[k]; removedIncorrect++; }
  });
  var iqCol = row._headers.indexOf('IncorrectQuestionsJSON');
  if (iqCol !== -1) sheet.getRange(row._rowIndex, iqCol + 1).setValue(sheetSafe_(JSON.stringify(byKey)));

  var savedByKey = {};
  try { savedByKey = JSON.parse(row.SavedQuestionsJSON) || {}; } catch (e) { savedByKey = {}; }
  Object.keys(savedByKey).forEach(function (k) {
    if (k.indexOf(prefix) === 0) { delete savedByKey[k]; removedSaved++; }
  });
  var svCol = row._headers.indexOf('SavedQuestionsJSON');
  if (svCol !== -1) sheet.getRange(row._rowIndex, svCol + 1).setValue(sheetSafe_(JSON.stringify(savedByKey)));

  var attemptsSheet = getAttemptsSheet_();
  var data = attemptsSheet.getDataRange().getValues();
  var headers = data[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  // Bottom-up so earlier row indices stay valid as rows are removed.
  for (var i = data.length - 1; i >= 1; i--) {
    var r = data[i];
    if (String(r[col.Key]).trim().toUpperCase() !== key) continue;
    var pseudo = { Source: r[col.Source], TestId: r[col.TestId], TestType: r[col.TestType] };
    if (testTagForAttemptRow_(pseudo) !== testTag) continue;
    // When the attempt being deleted has an AttemptId, only remove the row
    // that actually carries it — leaves any other attempt of the same test
    // (which shares this same testTag) untouched. Rows from before this
    // field existed have no AttemptId to match; those still fall back to
    // the old testTag-only behavior, which is the best available signal
    // for legacy data.
    if (attemptId && String(r[col.AttemptId] || '') !== attemptId) continue;
    attemptsSheet.deleteRow(i + 1);
    removedAttemptRows++;
  }

  return { ok: true, removedIncorrect: removedIncorrect, removedSaved: removedSaved, removedAttemptRows: removedAttemptRows };
}

/* ═══ ADMIN ROSTER ═══ powers admin.html, a standalone page (not linked
   from the student-facing portal) that gives Luca a single at-a-glance
   view across every student instead of opening each one's report/sheet
   row by hand. Read-only, gated by ADMIN_KEY above (see its comment for
   the trust model). Reuses the same per-student building blocks the
   biweekly guardian-summary email already relies on
   (scoreTrendForStudent_/weakestSkillForStudent_ further down this file)
   rather than duplicating that logic a third time. */
function handleGetRoster(rawAdminKey) {
  if (!ADMIN_KEY || rawAdminKey !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };

  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });

  // Most recent Attempts-sheet row per student — the "finished a
  // diagnostic/practice test" half of a last-activity signal.
  // ProgressUpdatedAt (the other half, bumped on question-practice syncs —
  // see handleSyncProgress above) is read straight off the Students row
  // below; vocab/QB-attempt syncs don't currently bump either timestamp,
  // so a student who ONLY does vocab/QB drills will under-report here —
  // a known gap, not a bug, and cheap to close later by having those two
  // sync handlers stamp ProgressUpdatedAt too if this view says it matters.
  var lastAttemptMsByKey = {};
  try {
    var aSheet = getAttemptsSheet_();
    var aData = aSheet.getDataRange().getValues();
    var aHeaders = aData[0];
    var aCol = {};
    aHeaders.forEach(function (h, i) { aCol[h] = i; });
    for (var j = 1; j < aData.length; j++) {
      var ak = String(aData[j][aCol.Key] || '').trim().toUpperCase();
      var ats = aData[j][aCol.Timestamp];
      if (!ak || !ats) continue;
      var atMs = new Date(ats).getTime();
      if (!lastAttemptMsByKey[ak] || atMs > lastAttemptMsByKey[ak]) lastAttemptMsByKey[ak] = atMs;
    }
  } catch (e) { /* Attempts sheet unreadable — last-activity just falls back to ProgressUpdatedAt alone */ }

  // Assignment completion counts per student — same Assignments sheet
  // getAssignments_ reads per-student, aggregated here across everyone in
  // one pass instead of one sheet read per student.
  var assignByKey = {};
  try {
    var asSheet = getAssignmentsSheet_();
    var asData = asSheet.getDataRange().getValues();
    var asHeaders = asData[0];
    var asKeyCol = asHeaders.indexOf('Key');
    var asTaskCol = asHeaders.indexOf('Task');
    var asDoneCol = asHeaders.indexOf('Done');
    for (var m = 1; m < asData.length; m++) {
      var task = String(asData[m][asTaskCol] || '').trim();
      if (!task) continue;
      var mk = String(asData[m][asKeyCol] || '').trim().toUpperCase();
      if (!mk) continue;
      if (!assignByKey[mk]) assignByKey[mk] = { total: 0, done: 0 };
      assignByKey[mk].total++;
      if (truthy_(asData[m][asDoneCol])) assignByKey[mk].done++;
    }
  } catch (e) { /* Assignments sheet unreadable — assignment counts just default to 0/0 below */ }

  var students = [];
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][col.Name] || '').trim();
    var key = String(data[i][col.Key] || '').trim().toUpperCase();
    if (!name || !key) continue;

    var trend = scoreTrendForStudent_(key);
    var latest = trend.length ? trend[trend.length - 1] : null;
    var first = trend.length ? trend[0] : null;
    var weakest = weakestSkillForStudent_(key);
    var assign = assignByKey[key] || { total: 0, done: 0 };

    var progressAtCell = col.ProgressUpdatedAt !== undefined ? data[i][col.ProgressUpdatedAt] : null;
    var progressAtMs = progressAtCell ? new Date(progressAtCell).getTime() : 0;
    var lastActivityMs = Math.max(progressAtMs || 0, lastAttemptMsByKey[key] || 0);

    var grantedAtCell = col.GrantedAt !== undefined ? data[i][col.GrantedAt] : null;

    students.push({
      name: name,
      key: key,
      sat: truthy_(data[i][col.SAT]),
      grantedAt: grantedAtCell ? new Date(grantedAtCell).toISOString() : null,
      lastActivityAt: lastActivityMs ? new Date(lastActivityMs).toISOString() : null,
      composite: latest ? latest.composite : null,
      compositeDelta: (latest && first && trend.length > 1 && typeof latest.composite === 'number' && typeof first.composite === 'number')
        ? latest.composite - first.composite : null,
      testType: latest ? latest.testType : null,
      weakest: weakest, // { label, correct, total } or null
      assignTotal: assign.total,
      assignDone: assign.done
    });
  }
  students.sort(function (a, b) { return a.name.localeCompare(b.name); });
  return { ok: true, students: students };
}

/* =========================================================================
   SCORE HISTORY — a server-side, append-only log of every diagnostic/
   practice-test composite, mirroring what index.html's recordScoreHistory()
   already writes to the browser's own localStorage (moretti_score_history_
   <key>). That local copy is what actually drives the Score Progress chart
   on Home — this exists purely so a composite score trend is available to
   code that can't reach localStorage, i.e. the biweekly guardian-summary
   trigger below (Apps Script triggers run server-side, with no browser in
   the loop). Best-effort from the client's side (see
   syncScoreHistoryToBackend() in index.html) — if this call fails, the
   student's own Score Progress chart is unaffected, only the guardian
   email's trend data would be missing that one point. Writes Kind:'score'
   rows into the shared Attempts sheet (see getAttemptsSheet_ above) —
   this used to be its own "ScoreHistory" tab, folded in alongside the old
   "DiagnosticLog" tab's rows since both are one-row-per-attempt logs.
   ========================================================================= */

// rawEntry mirrors the exact shape index.html's recordComposite() builds
// for its own localStorage write (see recordScoreHistory() there) — sent
// here unchanged rather than reshaped, so the two copies can't drift apart.
function handleSyncScoreHistory(rawKey, rawEntry) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var entry = (rawEntry && typeof rawEntry === 'object') ? rawEntry : {};
  var composite = Number(entry.composite);
  if (!composite) return { ok: false, error: 'missing_composite' }; // nothing useful to log without one

  var weakest = (entry.weakest && typeof entry.weakest === 'object') ? entry.weakest : null;
  var sheet2 = getAttemptsSheet_();
  var headers = sheet2.getRange(1, 1, 1, sheet2.getLastColumn()).getValues()[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  var out = new Array(headers.length).fill('');
  out[col.Kind] = 'score';
  out[col.Timestamp] = new Date();
  out[col.Key] = key;
  out[col.TestType] = (entry.testType === 'ACT' ? 'ACT' : 'SAT');
  out[col.Source] = (entry.source === 'practice-test' ? 'practice-test' : 'diagnostic');
  out[col.TestId] = entry.testId || '';
  out[col.TestTitle] = sheetSafe_(entry.testTitle || '');
  out[col.Composite] = composite;
  out[col.ScaleMin] = Number(entry.scaleMin) || '';
  out[col.ScaleMax] = Number(entry.scaleMax) || '';
  out[col.RW] = Number(entry.rw) || '';
  out[col.Math] = Number(entry.math) || '';
  out[col.WeakestLabel] = weakest ? sheetSafe_(weakest.label || '') : '';
  out[col.WeakestCorrect] = weakest ? (Number(weakest.correct) || '') : '';
  out[col.WeakestTotal] = weakest ? (Number(weakest.total) || '') : '';
  // The relative report.html#d=... link — same one index.html's own
  // "View Results" menu stores locally (see recordComposite() there).
  // Storing it here too is what lets that menu keep working for a
  // student checked from a device other than the one that took the
  // test (or after a cleared cache) — without this, "Completed" still
  // shows (that badge reads satTaken, a separate flag) but the link to
  // reopen the actual report would only ever exist on the one browser
  // that generated it. Blank when the attempt itself was never meant to
  // be link-visible (see linkVisibleToStudent in index.html — a
  // first-ever diagnostic notifies Luca instead of showing the student a
  // link), matching what's stored locally in that case too.
  out[col.ReportLink] = entry.reportLinkRelative ? String(entry.reportLinkRelative) : '';
  // Lets a locally-recorded attempt and its server-synced mirror be
  // recognized as the SAME attempt (see mergedScoreHistory() in
  // index.html) instead of double-counting it once this endpoint's
  // results are merged in alongside the local copy.
  out[col.AttemptId] = entry.attemptId ? String(entry.attemptId) : '';
  sheet2.appendRow(out);
  return { ok: true };
}

// Read side of the sheet above — lets report.html pull a student's real
// composite-score trend live (action: 'getScoreHistory'), rather than
// baking history into the report's own URL (which would make an already-
// long base64 report link grow with every past attempt embedded in it).
// Server-side sheet only — this deliberately does NOT read the
// localStorage copy (it can't; Apps Script has no browser), so a student
// whose sync-to-backend call failed on a given attempt (see
// syncScoreHistoryToBackend's comment — best-effort, silently skipped on
// failure) just has a gap here on that one point. Returns oldest-first,
// capped at MAX_HISTORY_POINTS so a student with many attempts doesn't
// return an ever-growing payload.
function handleGetScoreHistory(rawKey) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var MAX_HISTORY_POINTS = 20;
  var sheet = getAttemptsSheet_();
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  var entries = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    // Both Kinds returned here on purpose — 'score' rows carry the
    // composite/section breakdown this endpoint was originally built for
    // (report.html's trend chart), but 'log' rows (written on every
    // submission regardless of Kind — see logDiagnosticResult_) are what
    // let index.html's own View Results/"Completed" grouping find an
    // attempt that predates the composite-score feature, or one whose
    // syncScoreHistory call happened to fail. A 'log' row with no
    // composite just renders as "Taken" instead of "Scored ###" wherever
    // that number would've shown — never a reason to hide the attempt.
    if (String(row[col.Key] || '').trim().toUpperCase() !== key) continue;
    var ts = row[col.Timestamp];
    entries.push({
      date: (ts instanceof Date) ? ts.toISOString() : String(ts || ''),
      testType: row[col.TestType] || 'SAT',
      source: row[col.Source] || 'diagnostic',
      testId: row[col.TestId] || '',
      testTitle: row[col.TestTitle] || '',
      composite: Number(row[col.Composite]) || null,
      scaleMin: Number(row[col.ScaleMin]) || null,
      scaleMax: Number(row[col.ScaleMax]) || null,
      rw: Number(row[col.RW]) || null,
      math: Number(row[col.Math]) || null,
      weakest: row[col.WeakestLabel] ? { label: row[col.WeakestLabel], correct: Number(row[col.WeakestCorrect]) || 0, total: Number(row[col.WeakestTotal]) || 0 } : null,
      reportLinkRelative: row[col.ReportLink] || '',
      attemptId: row[col.AttemptId] || ''
    });
  }
  if (entries.length > MAX_HISTORY_POINTS) entries = entries.slice(entries.length - MAX_HISTORY_POINTS);
  return { ok: true, entries: entries };
}

// Admin-only, one-off dump used to backfill Composite/RW/Math on 'log' rows
// that predate this session's fix to logDiagnosticResult_ (see its own
// comment) — those rows have a full ReportLink (self-contained #d=...
// payload) but were never scored into the sheet itself. Rather than port
// the whole grading engine (practice-tests.js's question bank + curve
// math) into Apps Script, this just lists every row that NEEDS a backfill
// so a browser session that already has that grading engine loaded
// (report.html, via openTestResults()-style navigation) can read the
// already-correct composite/rw/math straight off each report and hand
// back a small, hand-verified patch — see backfillCompositeFields below,
// which is what actually writes the values this lists. Every row here is
// otherwise durable (Score/Report/ReportLink already saved); this is
// purely "fill in the number that was never computed," not a data-loss
// risk if it's never run.
function handleListBlankComposite() {
  var sheet = getAttemptsSheet_();
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row[col.Kind] !== 'log') continue;
    if (row[col.Composite]) continue; // already has a real value
    var link = String(row[col.ReportLink] || '');
    if (!link || link.indexOf('report.html#d=') === -1) continue; // nothing to recompute from
    var ts = row[col.Timestamp];
    rows.push({
      rowNum: i + 1,
      key: row[col.Key] || '',
      name: row[col.Name] || '',
      date: (ts instanceof Date) ? ts.toISOString() : String(ts || ''),
      testId: row[col.TestId] || '',
      testTitle: row[col.TestTitle] || '',
      testType: row[col.TestType] || '',
      reportLink: link
    });
  }
  return { ok: true, rows: rows };
}

// Writes a batch of {rowNum, composite, scaleMin, scaleMax, rw, math}
// patches (rowNum from handleListBlankComposite above, values read off
// each row's own rendered report.html) directly into the Attempts sheet.
// rowNum is trusted as-is (this is a hand-run admin tool, not a public
// action) but double-checked against Kind==='log' and an empty Composite
// so a stale rowNum from an edited sheet can't clobber a real value.
function handleBackfillCompositeFields(rawPatches) {
  var patches = Array.isArray(rawPatches) ? rawPatches : [];
  var sheet = getAttemptsSheet_();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  var applied = [];
  patches.forEach(function (p) {
    var r = Number(p.rowNum);
    if (!r || r < 2) return;
    var rowVals = sheet.getRange(r, 1, 1, headers.length).getValues()[0];
    if (rowVals[col.Kind] !== 'log' || rowVals[col.Composite]) return;
    sheet.getRange(r, col.Composite + 1).setValue(Number(p.composite));
    sheet.getRange(r, col.ScaleMin + 1).setValue(Number(p.scaleMin));
    sheet.getRange(r, col.ScaleMax + 1).setValue(Number(p.scaleMax));
    sheet.getRange(r, col.RW + 1).setValue(p.rw ? Number(p.rw) : '');
    sheet.getRange(r, col.Math + 1).setValue(p.math ? Number(p.math) : '');
    applied.push(r);
  });
  return { ok: true, appliedRows: applied };
}

/* =========================================================================
   AUTO-CREATE STUDENT FOLDERS
   -------------------------------------------------------------------------
   Runs automatically whenever the Students sheet is edited (see
   setupTrigger below). For any row that has a Name but no DriveFolderUrl
   yet, it creates a real folder in Drive — inside a single parent folder
   named by STUDENT_FOLDERS_PARENT_NAME so they don't scatter across My
   Drive — and writes that folder's URL back into the sheet.

   It only fills in a blank DriveFolderUrl — it never overwrites one that's
   already set, so pasting in an existing folder link still works exactly
   like before, and re-editing an already-set-up row won't create a
   second, duplicate folder.
   ========================================================================= */

function getOrCreateParentFolder_() {
  var existing = DriveApp.getFoldersByName(STUDENT_FOLDERS_PARENT_NAME);
  if (existing.hasNext()) return existing.next();
  return DriveApp.createFolder(STUDENT_FOLDERS_PARENT_NAME);
}

// Creates one student's Drive folder and returns its URL. Same naming
// convention as ensureFoldersForAllStudents_ below, factored out so
// handleAuth (see the "brand-new key, no name yet" comment there) can
// create the folder synchronously on first login instead of waiting on
// the async onStudentsEdit trigger — see that call site for why the
// trigger alone isn't good enough for this case.
function createFolderForStudent_(name, key) {
  var parent = getOrCreateParentFolder_();
  var folder = parent.createFolder(key ? (name + ' — ' + key) : name);
  return folder.getUrl();
}

function ensureFoldersForAllStudents_() {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var nameCol = headers.indexOf('Name');
  var keyCol = headers.indexOf('Key');
  var urlCol = headers.indexOf('DriveFolderUrl');
  if (nameCol === -1 || keyCol === -1 || urlCol === -1) return;

  var parent = null; // only fetched/created if we actually need it
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][nameCol] || '').trim();
    var url = String(data[i][urlCol] || '').trim();
    if (!name || url) continue; // needs a name, and must not already have a folder

    var key = String(data[i][keyCol] || '').trim();
    if (!parent) parent = getOrCreateParentFolder_();
    var folder = parent.createFolder(key ? (name + ' — ' + key) : name);
    sheet.getRange(i + 1, urlCol + 1).setValue(folder.getUrl());
  }
}

// Installable trigger handler — fires on any edit to the spreadsheet.
//
// IMPORTANT: this must NOT react to every edit. handleAuth() (the login
// flow) writes to the GrantedEmail / GrantedAt columns on a student's row
// the first time they log in — that write is itself a sheet edit, and an
// installable onEdit trigger fires for edits made by the script itself,
// not just ones a person types in. If this handler re-scanned on every
// edit, a login would re-trigger ensureFoldersForAllStudents_() every
// time, and if a row's DriveFolderUrl was ever slow to persist or came
// back blank on that pass, it would create ANOTHER folder — a fresh
// folder per login instead of one folder per student, ever.
//
// So this only reacts to edits that touch the Name or Key column — i.e.
// someone actually adding or renaming a student in the sheet — and
// ignores edits to any other column, including the ones the backend
// itself writes during login.
function onStudentsEdit(e) {
  try {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    if (sheet.getName() !== SHEET_TAB_NAME) return;

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nameCol = headers.indexOf('Name') + 1; // 1-based column index, 0 if missing
    var keyCol = headers.indexOf('Key') + 1;
    var editedStart = e.range.getColumn();
    var editedEnd = editedStart + e.range.getNumColumns() - 1;
    var touchesNameOrKey =
      (nameCol > 0 && editedStart <= nameCol && nameCol <= editedEnd) ||
      (keyCol > 0 && editedStart <= keyCol && keyCol <= editedEnd);
    if (!touchesNameOrKey) return;

    ensureFoldersForAllStudents_();
  } catch (err) {
    console.error('onStudentsEdit error: ' + err);
  }
}

// Run this ONCE manually (select it in the function dropdown, click Run,
// authorize when asked). It registers the trigger above so it fires
// automatically from then on — you won't need to run this again unless
// you want to reset it. Safe to run more than once; it clears any
// duplicate trigger from a prior run first.
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onStudentsEdit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onStudentsEdit')
    .forSpreadsheet(SpreadsheetApp.openById(SHEET_ID))
    .onEdit()
    .create();

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onOpen') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onOpen')
    .forSpreadsheet(SpreadsheetApp.openById(SHEET_ID))
    .onOpen()
    .create();
  console.log('Triggers installed: editing the Students sheet auto-creates folders, and opening the sheet now shows the Assign Homework menu.');
}

/* =========================================================================
   WEBSITE LEAD CAPTURE + FOLLOW-UP SEQUENCE
   -------------------------------------------------------------------------
   The public site's reserve-a-seat form (index.html, #reserve-form) POSTs
   straight here (action: 'submitLead') — everything happens server-side
   in handleSubmitLead(): the lead is logged to a "Leads" tab (auto-created
   below, same pattern as the Assignments tab), Luca gets an internal
   notification, and the submitter gets an immediate confirmation email.
   Unlike the diagnostic flow there's no Drive file to save — the sheet
   row IS the durable record, so it's written before either email is
   attempted, and a mail failure never fails the submission itself.

   A daily trigger (sendLeadFollowUps) then sends up to two more touches
   for leads who don't respond:
     - Day 3 after submission: a short "how this actually works" email
       explaining the process/methodology and the 12-Week Program
       guarantee.
     - Day 7 after submission: a final check-in with a real testimonial.
   That's it — 2 follow-up touches, not a long drip campaign. A lead that
   doesn't respond to either just stops there; nothing repeats forever.

   Off-ramp: if Luca books a lead himself (phone, in person, whatever),
   just type STOP into that row's Stage cell in the Leads sheet — the
   trigger skips any row whose Stage is exactly "STOP".

   SETUP: after pasting this into the live Apps Script project and
   deploying a new version, run "setupLeadFollowUpTrigger" once from the
   function dropdown (authorize when asked) to turn on the daily send.
   ========================================================================= */
// Columns grew from 10 to 12 when the site's lead form switched to the
// "reserve a seat" fields (IsUSA, Role). Town is the only column that's
// now write-only history (older rows still have data in it); Subject and
// Message came back into use when the reserve form regained a topic
// dropdown and a message box — Subject holds the chosen topic. Appending
// missing headers, rather than rewriting the row, keeps an already-live
// sheet's existing columns/data untouched.
function getLeadsSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('Leads');
  if (!sheet) {
    sheet = ss.insertSheet('Leads');
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Town', 'Grade', 'Subject', 'Message', 'Stage', 'LastEmailAt', 'IsUSA', 'Role']);
    return sheet;
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  ['IsUSA', 'Role', 'Subject', 'Message'].forEach(function (col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col);
      headers.push(col);
    }
  });
  return sheet;
}

// Builds the sheet row by header NAME rather than a fixed positional
// array — robust to the old/new column layouts above, and to Luca ever
// re-ordering columns by hand in the sheet itself.
//
// rawHoneypot/rawElapsedMs are the two anti-spam signals the reserve form
// (index.html, #reserve-form) sends alongside the real fields — see that
// form's submit handler for the client-side half of this check. Both are
// re-checked HERE, not just client-side, because LEAD_BACKEND_URL is
// public (sitting right there in index.html's source), so a bot can skip
// the page and POST directly to this endpoint, bypassing any check that
// only lives in the browser. A tripped check returns the same {ok:true}
// a real submission gets — never {ok:false} — so a scripted bot has
// nothing to react to and no reason to adapt; it just silently never
// reaches the sheet.
function handleSubmitLead(rawName, rawPhone, rawEmail, rawIsUSA, rawRole, rawGrade, rawTopic, rawMessage, rawHoneypot, rawElapsedMs) {
  if (String(rawHoneypot || '').trim()) return { ok: true };
  var elapsedMs = Number(rawElapsedMs);
  if (!isNaN(elapsedMs) && elapsedMs < 2500) return { ok: true };

  var name = String(rawName || '').trim();
  var email = String(rawEmail || '').trim();
  if (!name || !email) return { ok: false, error: 'missing_name_or_email' };
  var phone = String(rawPhone || '').trim();
  var isUSA = String(rawIsUSA || '').trim();
  var role = String(rawRole || '').trim();
  var grade = String(rawGrade || '').trim();
  var topic = String(rawTopic || '').trim();
  // Free text, so cap it before it reaches a cell — Sheets truncates at
  // 50k chars anyway, and nothing useful arrives past a couple thousand.
  var message = String(rawMessage || '').trim().slice(0, 2000);

  var sheet = getLeadsSheet_();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = new Array(headers.length).fill('');
  function set(col, val) { var i = headers.indexOf(col); if (i !== -1) row[i] = val; }
  set('Timestamp', new Date());
  set('Name', sheetSafe_(name));
  set('Email', sheetSafe_(email));
  set('Phone', sheetSafe_(phone));
  set('Grade', sheetSafe_(grade));
  set('IsUSA', sheetSafe_(isUSA));
  set('Role', sheetSafe_(role));
  set('Subject', sheetSafe_(topic));
  set('Message', sheetSafe_(message));
  // Stage/LastEmailAt left blank — sendLeadFollowUps() below picks up any
  // row whose Stage is still blank.
  sheet.appendRow(row);

  // Best-effort from here on — the lead is already durably logged above,
  // so a mail failure costs convenience, not data (same principle as
  // handleSubmitDiagnostic's "durable store first" pattern).
  try {
    MailApp.sendEmail(NOTIFY_EMAIL, 'New lead — ' + name,
      'Name: ' + name + '\nRole: ' + (role || '(not given)') + '\nPhone: ' + phone + '\nEmail: ' + email +
      '\nFrom the USA: ' + (isUSA || '(not given)') + '\nGrade: ' + (grade || '(not given)') +
      '\nLooking for: ' + (topic || '(not given)') +
      '\n\nMessage:\n' + (message || '(none)') +
      '\n\nReply within 24 hours per the site\'s promise.');
  } catch (err) {
    console.error('Lead notify email failed for ' + email + ': ' + err);
  }
  try {
    sendLeadEmail_(email, name, leadEmailConfirmation_(name));
  } catch (err) {
    console.error('Lead confirmation email failed for ' + email + ': ' + err);
  }

  return { ok: true };
}

function leadEmailConfirmation_(name) {
  var firstName = String(name || '').split(' ')[0] || 'there';
  var text =
    'Hi ' + firstName + ',\n\n' +
    'Thanks for reaching out to Moretti Test Prep & Tutoring — this confirms we\'ve received your message.\n\n' +
    'I\'ll personally follow up within 24 hours to talk through a plan for your student.\n\n' +
    'Need something sooner? Call or text (201) 275-2791 directly.\n\n' +
    'Best,\nLuca Moretti';
  var html =
    '<div style="font-family:Georgia,serif; color:#111; font-size:15px; line-height:1.6; max-width:560px;">' +
    '<p>Hi ' + firstName + ',</p>' +
    '<p>Thanks for reaching out to Moretti Test Prep &amp; Tutoring &mdash; this confirms we\'ve received your message.</p>' +
    '<p>I\'ll personally follow up within <strong>24 hours</strong> to talk through a plan for your student.</p>' +
    '<p>Need something sooner? Call or text <a href="tel:2012752791" style="color:#B0271C; font-weight:bold;">(201) 275-2791</a> directly.</p>' +
    '<p>Best,<br>Luca Moretti</p>' +
    '</div>';
  return { subject: 'We\'ve received your message — Moretti Test Prep & Tutoring', text: text, html: html };
}

// Run daily (see setupLeadFollowUpTrigger). Sends the day-3 email to any
// lead that's 3+ days old and hasn't had one yet, and the day-7 email to
// any lead that's 7+ days old and has only had the day-3 email — one
// pass per lead per day, so nothing double-sends even if this runs a few
// minutes late or the sheet has hundreds of rows.
function sendLeadFollowUps() {
  var sheet = getLeadsSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  var now = new Date();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var stage = String(row[col.Stage] || '').trim();
    if (stage === 'STOP') continue;

    var submitted = row[col.Timestamp];
    if (!(submitted instanceof Date)) continue;
    var daysSince = (now - submitted) / (24 * 60 * 60 * 1000);

    var name = row[col.Name], email = row[col.Email];
    if (!email) continue;

    if (stage === '' && daysSince >= 3) {
      sendLeadEmail_(email, name, leadEmailDay3_(name));
      sheet.getRange(i + 1, col.Stage + 1).setValue('1');
      sheet.getRange(i + 1, col.LastEmailAt + 1).setValue(now);
    } else if (stage === '1' && daysSince >= 7) {
      sendLeadEmail_(email, name, leadEmailDay7_(name));
      sheet.getRange(i + 1, col.Stage + 1).setValue('2');
      sheet.getRange(i + 1, col.LastEmailAt + 1).setValue(now);
    }
  }
}

function sendLeadEmail_(toEmail, name, msg) {
  try {
    MailApp.sendEmail({
      to: toEmail,
      subject: msg.subject,
      body: msg.text,
      htmlBody: msg.html,
      name: 'Luca Moretti — Moretti Test Prep & Tutoring'
    });
  } catch (err) {
    console.error('sendLeadEmail_ failed for ' + toEmail + ': ' + err);
  }
}

function leadEmailDay3_(name) {
  var firstName = String(name || '').split(' ')[0] || 'there';
  var text =
    'Hi ' + firstName + ',\n\n' +
    'Wanted to follow up in case you\'re still looking into SAT/ACT prep for your student.\n\n' +
    'Here\'s how I actually work with students: every plan starts with a real assessment — figuring out exactly which specific gaps are costing points, not just "more practice." From there we build a plan around those gaps specifically, session by session, instead of a generic curriculum.\n\n' +
    'That\'s built into the 12-Week Program: a diagnostic to start, a custom study plan, two more full-length practice tests along the way to track real movement, and a guarantee — if a student completes all twelve sessions and the homework and their score doesn\'t improve, I keep working with them for free until it does.\n\n' +
    'Happy to walk you through what this would look like for your student specifically — no pressure, just a real conversation. Reserve a seat here:\n' +
    'https://morettitutoring.com/#reserve\n\n' +
    'Best,\nLuca';
  var html =
    '<div style="font-family:Georgia,serif; color:#111; font-size:15px; line-height:1.6; max-width:560px;">' +
    '<p>Hi ' + firstName + ',</p>' +
    '<p>Wanted to follow up in case you\'re still looking into SAT/ACT prep for your student.</p>' +
    '<p>Here\'s how I actually work with students: every plan starts with a real assessment &mdash; figuring out exactly which specific gaps are costing points, not just &ldquo;more practice.&rdquo; From there we build a plan around those gaps specifically, session by session, instead of a generic curriculum.</p>' +
    '<p>That\'s built into the <strong>12-Week Program</strong>: a diagnostic to start, a custom study plan, two more full-length practice tests along the way to track real movement, and a guarantee &mdash; if a student completes all twelve sessions and the homework and their score doesn\'t improve, I keep working with them for free until it does.</p>' +
    '<p>Happy to walk you through what this would look like for your student specifically &mdash; no pressure, just a real conversation:</p>' +
    '<p><a href="https://morettitutoring.com/#reserve" style="color:#B0271C; font-weight:bold;">Reserve Your Seat &rarr;</a></p>' +
    '<p>Best,<br>Luca</p>' +
    '</div>';
  return { subject: 'Following up on SAT/ACT prep for your student', text: text, html: html };
}

function leadEmailDay7_(name) {
  var firstName = String(name || '').split(' ')[0] || 'there';
  var text =
    'Hi ' + firstName + ',\n\n' +
    'Just a short final check-in — are you still looking for SAT/ACT prep support this semester?\n\n' +
    '"I highly recommend Luca as a math tutor. He worked with my daughter to prepare for the SAT and made a tremendous impact on both her confidence and performance... she improved her SAT Math score by approximately 200 points, exceeding our expectations." — Michele C.\n\n' +
    'If now isn\'t the right time, no worries at all — feel free to reach back out whenever it is. If you\'d like to talk it through, reserve a seat here:\n' +
    'https://morettitutoring.com/#reserve\n\n' +
    'Best,\nLuca';
  var html =
    '<div style="font-family:Georgia,serif; color:#111; font-size:15px; line-height:1.6; max-width:560px;">' +
    '<p>Hi ' + firstName + ',</p>' +
    '<p>Just a short final check-in &mdash; are you still looking for SAT/ACT prep support this semester?</p>' +
    '<blockquote style="border-left:3px solid #C9A84C; margin:1.2em 0; padding:0.2em 1em; font-style:italic; color:#333;">' +
    '&ldquo;I highly recommend Luca as a math tutor. He worked with my daughter to prepare for the SAT and made a tremendous impact on both her confidence and performance&hellip; she improved her SAT Math score by approximately <strong>200 points</strong>, exceeding our expectations.&rdquo;<br><span style="font-style:normal; font-size:0.85em; color:#666;">&mdash; Michele C.</span>' +
    '</blockquote>' +
    '<p>If now isn\'t the right time, no worries at all &mdash; feel free to reach back out whenever it is. If you\'d like to talk it through, here\'s where to reserve a seat:</p>' +
    '<p><a href="https://morettitutoring.com/#reserve" style="color:#B0271C; font-weight:bold;">Reserve Your Seat &rarr;</a></p>' +
    '<p>Best,<br>Luca</p>' +
    '</div>';
  return { subject: 'Still looking for SAT/ACT prep help?', text: text, html: html };
}

// Run this ONCE manually (select it in the function dropdown, click Run,
// authorize when asked) to turn on the daily lead follow-up send. Safe to
// run more than once; it clears any duplicate trigger from a prior run
// first.
function setupLeadFollowUpTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendLeadFollowUps') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendLeadFollowUps')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  console.log('Trigger installed: sendLeadFollowUps will now run once a day around 9am.');
}

/* =========================================================================
   GUARDIAN BIWEEKLY SUMMARY
   -------------------------------------------------------------------------
   Opt-in per student: fill in GuardianEmail (and optionally GuardianName)
   on that student's row in the Students sheet — both auto-create the
   first time this runs if they don't exist yet, same pattern as
   AccomTimeMult/BaselineType above. A blank GuardianEmail just means that
   student is skipped, nothing else needed.

   Runs daily (see setupGuardianSummaryTrigger) but only actually SENDS to
   a given student once every GUARDIAN_SUMMARY_DAYS days — gated by
   LastGuardianSummaryAt on their row, same "scan daily, gate in code"
   idiom sendLeadFollowUps() uses above, since Apps Script's timeBased()
   builder doesn't have a clean "every 14 days" primitive that survives a
   trigger reinstall.
   ========================================================================= */
var GUARDIAN_SUMMARY_DAYS = 14;
var GUARDIAN_COLS_ = ['GuardianName', 'GuardianEmail', 'LastGuardianSummaryAt'];

function ensureGuardianColumns_(sheet, headers) {
  GUARDIAN_COLS_.forEach(function (col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col);
      headers.push(col);
    }
  });
}

function sendGuardianSummaries() {
  var sheet = getSheet_();
  var headers = sheet.getDataRange().getValues()[0];
  ensureGuardianColumns_(sheet, headers);
  // Re-read after possibly adding columns, so col indexes below line up.
  var data = sheet.getDataRange().getValues();
  headers = data[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  var now = new Date();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var guardianEmail = String(row[col.GuardianEmail] || '').trim();
    if (!guardianEmail) continue;

    var lastSent = row[col.LastGuardianSummaryAt];
    if (lastSent instanceof Date) {
      var daysSince = (now - lastSent) / (24 * 60 * 60 * 1000);
      if (daysSince < GUARDIAN_SUMMARY_DAYS) continue;
    }

    var key = String(row[col.Key] || '').trim().toUpperCase();
    if (!key) continue;
    var studentName = row[col.Name] || 'your student';

    var trend = scoreTrendForStudent_(key);
    if (!trend.length) continue; // nothing to report yet — don't send an empty update

    var weakest = weakestSkillForStudent_(key);
    var guardianName = row[col.GuardianName] || '';
    var msg = guardianSummaryEmail_(studentName, guardianName, trend, weakest);
    sendLeadEmail_(guardianEmail, guardianName || studentName, msg);
    sheet.getRange(i + 1, col.LastGuardianSummaryAt + 1).setValue(now);
  }
}

// Last GUARDIAN_SUMMARY_TREND_MAX entries for this student, oldest first —
// enough to show a real trend in the email without dumping the student's
// entire history every time.
var GUARDIAN_SUMMARY_TREND_MAX = 5;
function scoreTrendForStudent_(key) {
  var sheet = getAttemptsSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][col.Kind] !== 'score') continue;
    if (String(data[i][col.Key] || '').trim().toUpperCase() === key) {
      rows.push({
        date: data[i][col.Timestamp], testTitle: data[i][col.TestTitle] || '',
        testType: data[i][col.TestType], composite: data[i][col.Composite]
      });
    }
  }
  rows.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  return rows.slice(-GUARDIAN_SUMMARY_TREND_MAX);
}

// Mirrors index.html's client-side weakestDomain() — same "at least 3
// questions, lowest correct%, ties favor more questions" logic, run here
// against the SAME SkillStatsJSON column the Students sheet already
// stores (see handleSyncProgress above), aggregated up from skill-level
// to domain-level first since that JSON is keyed "Domain → Skill", not by
// domain alone.
function weakestSkillForStudent_(key) {
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return null;
  var bySkill = null;
  try { bySkill = JSON.parse(row.SkillStatsJSON) || {}; } catch (e) { bySkill = {}; }
  if (!bySkill) return null;

  var byDomain = {};
  Object.keys(bySkill).forEach(function (k) {
    var s = bySkill[k];
    if (!s || !s.domain) return;
    if (!byDomain[s.domain]) byDomain[s.domain] = { correct: 0, total: 0 };
    byDomain[s.domain].correct += Number(s.correct) || 0;
    byDomain[s.domain].total += Number(s.total) || 0;
  });

  var MIN_QUESTIONS = 3;
  var best = null;
  Object.keys(byDomain).forEach(function (name) {
    var d = byDomain[name];
    if (d.total < MIN_QUESTIONS) return;
    var pct = d.correct / d.total;
    if (!best || pct < best.pct || (pct === best.pct && d.total > best.total)) {
      best = { label: name, correct: d.correct, total: d.total, pct: pct };
    }
  });
  return best;
}

function guardianSummaryEmail_(studentName, guardianName, trend, weakest) {
  var studentFirst = String(studentName).split(' ')[0] || 'your student';
  var greetName = guardianName ? String(guardianName).split(' ')[0] : '';
  var latest = trend[trend.length - 1];
  var first = trend[0];
  var trendLine = trend.map(function (e) {
    return (e.testTitle || (e.testType + ' attempt')) + ': ' + e.composite;
  }).join('  →  ');

  var movementText = '';
  if (trend.length > 1 && typeof first.composite === 'number' && typeof latest.composite === 'number') {
    var diff = latest.composite - first.composite;
    if (diff > 0) movementText = studentFirst + '’s composite is up ' + diff + ' points since ' + formatDateShort_(first.date) + '.';
    else if (diff < 0) movementText = studentFirst + '’s composite has moved ' + diff + ' points since ' + formatDateShort_(first.date) + ' — normal test-to-test variation, not a trend to worry about on its own.';
    else movementText = studentFirst + '’s composite has held steady since ' + formatDateShort_(first.date) + '.';
  }

  var weakestText = weakest
    ? studentFirst + '’s current focus area is ' + weakest.label + ' (' + weakest.correct + '/' + weakest.total + ' on the most recent attempt).'
    : '';

  var text =
    'Hi' + (greetName ? ' ' + greetName : '') + ',\n\n' +
    'A quick update on ' + studentFirst + '’s progress:\n\n' +
    'Most recent score: ' + latest.composite + ' (' + (latest.testTitle || latest.testType) + ', ' + formatDateShort_(latest.date) + ')\n' +
    (movementText ? movementText + '\n' : '') +
    (weakestText ? weakestText + '\n' : '') +
    '\nRecent attempts: ' + trendLine + '\n\n' +
    'Happy to talk through the plan anytime — just reply to this email or text (201) 275-2791.\n\n' +
    'Best,\nLuca';

  var html =
    '<div style="font-family:Georgia,serif; color:#111; font-size:15px; line-height:1.6; max-width:560px;">' +
    '<p>Hi' + (greetName ? ' ' + greetName : '') + ',</p>' +
    '<p>A quick update on <strong>' + studentFirst + '</strong>’s progress:</p>' +
    '<div style="background:#f7f4ef; border-left:3px solid #C9A84C; padding:0.9em 1.2em; margin:1em 0;">' +
    '<div style="font-size:1.4em; font-weight:bold; color:#B0271C;">' + latest.composite + '</div>' +
    '<div style="font-size:0.85em; color:#666;">' + escapeHtml_(latest.testTitle || latest.testType) + ' &middot; ' + formatDateShort_(latest.date) + '</div>' +
    '</div>' +
    (movementText ? '<p>' + escapeHtml_(movementText) + '</p>' : '') +
    (weakestText ? '<p>' + escapeHtml_(weakestText) + '</p>' : '') +
    '<p style="font-size:0.85em; color:#666;">Recent attempts: ' + escapeHtml_(trendLine) + '</p>' +
    '<p>Happy to talk through the plan anytime &mdash; just reply to this email or text <a href="tel:2012752791" style="color:#B0271C; font-weight:bold;">(201) 275-2791</a>.</p>' +
    '<p>Best,<br>Luca</p>' +
    '</div>';

  return { subject: studentFirst + '’s Progress Update — Moretti Test Prep & Tutoring', text: text, html: html };
}

function formatDateShort_(d) {
  var date = (d instanceof Date) ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone() || 'America/New_York', 'MMM d');
}

function escapeHtml_(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Run this ONCE manually (select it in the function dropdown, click Run,
// authorize when asked) to turn on the biweekly guardian summary send.
// Safe to run more than once; it clears any duplicate trigger from a
// prior run first. The job itself runs daily and only actually emails a
// given guardian once every GUARDIAN_SUMMARY_DAYS days (see
// sendGuardianSummaries above) — daily is just the scan cadence, not the
// send cadence.
function setupGuardianSummaryTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendGuardianSummaries') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendGuardianSummaries')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
  console.log('Trigger installed: sendGuardianSummaries will now run once a day around 8am (actual guardian emails go out at most once every ' + GUARDIAN_SUMMARY_DAYS + ' days per student).');
}

/* =========================================================================
   NEXT SESSION WIDGET — reads Luca's shared iCloud calendar and hands
   back a student's next upcoming session, matched by first name in the
   event title (e.g. an event titled "Lily — SAT tutoring" matches a
   student named "Lily Corcoran").

   This runs server-side rather than the portal fetching the calendar
   directly from the browser: iCloud's published-calendar host doesn't
   reliably send the CORS headers a cross-origin browser fetch needs, and
   keeping the calendar URL server-side means it's never exposed in the
   page source either.
   ========================================================================= */

// webcal:// is just https:// with a different scheme name — UrlFetchApp
// needs an actual https:// URL.
//
// This URL is a bearer token: anyone who has it can read Luca's full
// calendar. It must NOT live in this source file — this file is committed
// to a public GitHub repo, and anything hardcoded here is exposed to
// everyone, forever (even after being removed in a later commit, since it
// stays in git history). Store it instead in this script's Script
// Properties (Apps Script editor -> Project Settings -> Script Properties
// -> add a property named CALENDAR_ICS_URL with the real URL as the
// value). Because the URL that was previously hardcoded here was already
// committed and pushed, treat it as compromised: go to iCloud Calendar ->
// the calendar's sharing settings -> stop sharing / turn off public
// calendar, then turn it back on to generate a brand-new published URL,
// and put ONLY the new one in Script Properties.
function getCalendarIcsUrl_() {
  var url = PropertiesService.getScriptProperties().getProperty('CALENDAR_ICS_URL');
  if (!url) throw new Error('CALENDAR_ICS_URL is not set in Script Properties.');
  return url;
}

// debugMode adds a `debug` object to the response with exactly what
// happened at each step (HTTP status, name matched against, every event
// summary parsed off the calendar, which ones matched) so this can be
// diagnosed from the portal itself (append ?debug=1 to the portal URL)
// without needing to open the Apps Script execution log.
//
// Key-gated: this used to take a plain `name` string straight from the
// client with no check at all, meaning anyone (no key required) could
// call this endpoint with any name and get back real calendar event
// titles, and with debug:true, EVERY event summary on the calendar —
// i.e. every student's name and session schedule, dumped to a total
// stranger. It now requires a real key, exactly like every other action,
// and the name used to match events comes from that key's roster row —
// never from the client — so a valid key only ever reveals that one
// student's own session, and debug is equally key-gated rather than
// wide open.
function handleNextSession(rawKey, debugMode) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var firstName = String(row.Name || '').trim().split(/\s+/)[0];
  if (!firstName) return { ok: false, error: 'missing_name' };

  try {
    var resp = UrlFetchApp.fetch(getCalendarIcsUrl_(), { muteHttpExceptions: true });
    var httpStatus = resp.getResponseCode();
    Logger.log('handleNextSession: fetched calendar, status=' + httpStatus + ', name="' + row.Name + '", firstName="' + firstName + '"');
    if (httpStatus !== 200) {
      Logger.log('handleNextSession: calendar unreachable, body preview: ' + resp.getContentText().slice(0, 200));
      return debugMode
        ? { ok: false, error: 'calendar_unreachable', debug: { httpStatus: httpStatus, firstName: firstName } }
        : { ok: false, error: 'calendar_unreachable' };
    }
    var events = parseICS_(resp.getContentText());
    var now = new Date();
    // Keep a session showing (with its join link) for a grace window AFTER
    // it starts, instead of flipping to next week the instant the clock
    // hits the start time. A student who joins a few minutes late was
    // losing the link right when they needed it. We look for the next
    // occurrence at or after (now − 20 min), so a session that started up
    // to 20 minutes ago is still treated as the current one; only after
    // that does it roll forward to the next session.
    var GRACE_MS = 20 * 60 * 1000;
    var ref = new Date(now.getTime() - GRACE_MS);
    var escaped = firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var nameRe = new RegExp(escaped, 'i');

    // Recurring weekly/biweekly tutoring sessions are the normal case —
    // their DTSTART anchor is often weeks or months in the past, so
    // without expanding RRULE they'd never show up as "upcoming" even
    // though the student has a session next week. nextOccurrenceOnOrAfter_
    // walks a recurring event forward to the next real occurrence.
    var upcoming = events
      .filter(function (ev) { return nameRe.test(ev.summary); })
      .map(function (ev) {
        var occurrence = nextOccurrenceOnOrAfter_(ev, ref);
        if (!occurrence) return null;
        return { summary: ev.summary, start: occurrence, allDay: ev.allDay };
      })
      .filter(function (ev) { return ev !== null; });
    upcoming.sort(function (a, b) { return a.start.getTime() - b.start.getTime(); });

    Logger.log('handleNextSession: parsed ' + events.length + ' total events, ' + upcoming.length + ' matched "' + firstName + '" and are upcoming. All summaries: ' + JSON.stringify(events.map(function (e) { return e.summary; })));

    var debugInfo = debugMode ? {
      httpStatus: httpStatus,
      firstName: firstName,
      totalEventsParsed: events.length,
      allSummaries: events.map(function (e) { return e.summary; }),
      matchedUpcomingCount: upcoming.length
    } : undefined;

    if (!upcoming.length) return debugMode ? { ok: true, next: null, debug: debugInfo } : { ok: true, next: null };
    var next = upcoming[0];
    var result = {
      ok: true,
      next: { title: next.summary, startIso: next.start.toISOString(), allDay: next.allDay }
    };
    if (debugMode) result.debug = debugInfo;
    return result;
  } catch (err) {
    Logger.log('handleNextSession: error — ' + String(err));
    return { ok: false, error: 'server_error', message: String(err) };
  }
}

// Minimal ICS (iCalendar) parser — just enough to pull SUMMARY, DTSTART,
// and RRULE out of each VEVENT block. Recurring events are expanded to
// their next real occurrence by nextOccurrenceOnOrAfter_ below (weekly/
// biweekly/daily/monthly/yearly; complex multi-day BYDAY patterns are not
// specially handled, but the common single-weekday tutoring cadence is).
function parseICS_(text) {
  // Unfold lines: per the iCal spec, a line starting with a space or tab
  // is a continuation of the previous line, not a new property.
  var rawLines = text.split(/\r\n|\n|\r/);
  var lines = [];
  rawLines.forEach(function (line) {
    if (lines.length && (line.charAt(0) === ' ' || line.charAt(0) === '\t')) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  });

  var events = [];
  var cur = null;
  lines.forEach(function (line) {
    if (line === 'BEGIN:VEVENT') { cur = { summary: '', start: null, allDay: false, rrule: null }; return; }
    if (line === 'END:VEVENT') { if (cur) events.push(cur); cur = null; return; }
    if (!cur) return;
    var idx = line.indexOf(':');
    if (idx === -1) return;
    var key = line.slice(0, idx);
    var value = line.slice(idx + 1);
    if (key === 'SUMMARY') {
      cur.summary = value;
    } else if (key.indexOf('DTSTART') === 0) {
      cur.allDay = key.indexOf('VALUE=DATE') !== -1 && key.indexOf('VALUE=DATE-TIME') === -1;
      cur.start = parseICSDate_(value, cur.allDay);
    } else if (key === 'RRULE') {
      cur.rrule = parseRRule_(value);
    }
  });
  return events;
}

// Parses just the RRULE fields this widget actually needs to step a
// recurring event forward: FREQ, INTERVAL, COUNT, UNTIL. BYDAY is read
// but not used for multi-day-per-week patterns — the common tutoring
// case is one fixed weekday, which DTSTART's own weekday already covers.
function parseRRule_(value) {
  var rule = { freq: null, interval: 1, count: null, until: null };
  value.split(';').forEach(function (part) {
    var kv = part.split('=');
    if (kv.length !== 2) return;
    var k = kv[0].toUpperCase(), v = kv[1];
    if (k === 'FREQ') rule.freq = v.toUpperCase();
    else if (k === 'INTERVAL') rule.interval = Number(v) || 1;
    else if (k === 'COUNT') rule.count = Number(v) || null;
    else if (k === 'UNTIL') rule.until = parseICSDate_(v, v.indexOf('T') === -1);
  });
  return rule;
}

// Given a (possibly recurring) event, returns the next occurrence's start
// Date at or after `now`, or null if the event (and all its recurrences,
// if any) are entirely in the past / never occur on/after now.
function nextOccurrenceOnOrAfter_(ev, now) {
  if (!ev.start) return null;
  if (ev.start.getTime() >= now.getTime()) return ev.start;
  if (!ev.rrule || !ev.rrule.freq) return null; // non-recurring and already past

  var freq = ev.rrule.freq, interval = ev.rrule.interval || 1;
  var stepDays = freq === 'DAILY' ? interval
    : freq === 'WEEKLY' ? interval * 7
    : null; // MONTHLY/YEARLY stepping isn't needed for tutoring cadence; skip

  var cur = new Date(ev.start.getTime());
  var n = 0;
  var maxIterations = 1000; // safety cap
  while (n < maxIterations) {
    if (ev.rrule.until && cur.getTime() > ev.rrule.until.getTime()) return null;
    if (ev.rrule.count && n >= ev.rrule.count) return null;
    if (cur.getTime() >= now.getTime()) return cur;

    if (stepDays) {
      cur = new Date(cur.getTime() + stepDays * 24 * 60 * 60 * 1000);
    } else if (freq === 'MONTHLY') {
      cur = new Date(cur.getFullYear(), cur.getMonth() + interval, cur.getDate(), cur.getHours(), cur.getMinutes(), cur.getSeconds());
    } else if (freq === 'YEARLY') {
      cur = new Date(cur.getFullYear() + interval, cur.getMonth(), cur.getDate(), cur.getHours(), cur.getMinutes(), cur.getSeconds());
    } else {
      return null; // unsupported frequency
    }
    n++;
  }
  return null;
}

function parseICSDate_(value, allDay) {
  // Matches 20260716T183000Z, 20260716T183000, or 20260716 (all-day).
  var m = value.match(/^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  var y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
  if (!m[4]) return new Date(y, mo, d);
  var h = Number(m[5]), mi = Number(m[6]), s = Number(m[7]);
  if (m[8] === 'Z') return new Date(Date.UTC(y, mo, d, h, mi, s));
  return new Date(y, mo, d, h, mi, s); // floating/local time — treated as local
}
