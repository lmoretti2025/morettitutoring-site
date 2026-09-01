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
        SAT-only — the old separate TestPrep/ACT columns and the whole
        ACT diagnostic were retired; SAT alone does the job TestPrep
        used to. The ACTTakenAt column, if your sheet still has one, is
        now unused and safe to delete.)
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
        via the Kind column), used by the weekly guardian summary email
        (see below) and by report.html's live Score Progress chart.
        Nothing to set up here either; see handleSyncScoreHistory() and
        logDiagnosticResult_() below.
        GuardianName / GuardianEmail are two more optional columns on
        Students — fill these in by hand for any student whose
        parent/guardian should get the weekly Friday progress email
        (latest score + trend + current weak spot + what we're doing
        about it). Students can also add a parent themselves during
        onboarding or in Settings. Leave GuardianEmail blank and that
        student is simply skipped — nothing breaks, nothing sends. Both
        auto-create the first time the summary job runs if they don't
        exist yet. See "GUARDIAN WEEKLY SUMMARY" below for the send rules
        and how the email itself is built.
     2. Paste this file into a new Apps Script project (script.google.com).
     3. Set SHEET_ID below to that Sheet's ID (from its URL).
     4. Deploy > New deployment > Web app.
          Execute as: Me
          Who has access: Anyone
     5. Copy the deployment URL into APPS_SCRIPT_URL in portal/index.html.
     6. Select "setupTrigger" in the function dropdown and click Run once
        (authorize when asked). This turns on the auto-folder feature.
     6b. Services (+) in the left sidebar > Gmail API > Add. This turns on
        one-thread-per-family for the LEAD flow: an inquiry and both
        follow-up nudges land in a single Gmail conversation, and the
        nudges learn to skip anyone waiting on YOUR reply. Skipping this
        step is safe — mail still sends, just unthreaded. Run
        "testFamilyThread" after adding it to confirm. The weekly progress
        emails deliberately do NOT thread; they are one fresh dated email
        per week (see "GUARDIAN WEEKLY SUMMARY" below).
     7. (Optional) Select "setupGuardianSummaryTrigger" and click Run once
        to turn on the weekly Friday guardian summary email. Only needed
        once, ever — skip this entirely if you'd rather not offer it yet.
        Run "previewGuardianSummaries" first to see exactly who would be
        emailed this week without actually sending anything.
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

/* ═══ BACKEND VERSION ═══ bumped whenever this file gains something the
   front-end depends on. The pages fetch it and say plainly when the
   deployment they're talking to is older than the code they shipped
   with — which has been the actual cause of every "it says saved but
   nothing happens" so far: editing Code.gs here changes nothing until
   Apps Script is redeployed (Deploy → Manage deployments → edit → New
   version), and until then the old code answers every request, happily
   ignoring fields it has never heard of.
   Bump this AND add the capability name when you add a feature. */
var BACKEND_VERSION = 5;
var BACKEND_CAPABILITIES = [
  'calendar',        // getAssignmentsCalendar / getAdminCalendar / getStudentDetail
  'dueDates',        // DueDate column + dueDay
  'notes',           // per-assignment description
  'series'           // repeating assignments sharing a SeriesId
];
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
      out = handleGetAssignmentsCalendar(body.key, body.start, body.end);
    } else if (body.action === 'assignHomeworkFromDialog') {
      out = handleAssignHomeworkFromDialog(body.key, body.task, body.dueDate);
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
      out = handleCreateAdminAssignment(body.adminKey, body.key, body.task, body.dueDates, body.notes);
    } else if (body.action === 'updateAdminAssignment') {
      out = handleUpdateAdminAssignment(body.adminKey, body.key, body.row, body.patch, body.scope);
    } else if (body.action === 'deleteAdminAssignment') {
      out = handleDeleteAdminAssignment(body.adminKey, body.key, body.row, body.scope);
    } else if (body.action === 'version') {
      out = { ok: true, version: BACKEND_VERSION, capabilities: BACKEND_CAPABILITIES };
    } else if (body.action === 'getAdminCalendar') {
      out = handleGetAdminCalendar(body.adminKey, body.key, body.start, body.end);
    } else if (body.action === 'getStudentDetail') {
      out = handleGetStudentDetail(body.adminKey, body.key);
    } else if (body.action === 'getAttemptReport') {
      out = handleGetAttemptReport(body.adminKey, body.key, body.row);
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

/* ═══ DATE CELLS ═══ every date on these sheets is hand-editable, and a
   cell holding text a person typed ("TBD", "asap", "9/5 or 9/6") parses
   to an Invalid Date. Invalid Dates are quietly poisonous: every
   comparison against them is false (so a range filter passes them
   THROUGH rather than skipping them) and .toISOString() then throws
   RangeError. One such cell in the Assignments sheet's DueDate column
   used to be enough to blow up getAssignments_ — i.e. break login and
   the homework checklist for that student — and to make every dated
   assignment vanish from the admin calendar, since the throw landed in a
   catch that treats the whole sheet as unreadable. Everything that reads
   a date cell goes through here instead: unparseable reads as "no date",
   which is exactly how a blank cell already behaves.
   ═══════════════════════════════════════════════════════════════════ */
/* A testing-accommodation multiplier as read back off the Students sheet.
   handleSaveOnboardingPrefs only ever writes the numbers 1, 1.5 or 2 — but
   if that column is (or ever gets) formatted as a TIME in Sheets, the cell
   comes back as a Date instead: 1.5 reads as 1899-12-31 12:00, because
   Sheets counts days from 1899-12-30. The client then does
   Number(thatDate) → NaN, and NaN flows straight into every module's time
   limit (index.html multiplies each section's minutes by it), so an
   accommodated student's exam timer breaks outright while Settings shows
   them as having no accommodations at all. Recovered here, where the
   script's own timezone makes the day arithmetic exact. */
function accomMultiplier_(v) {
  if (v == null || v === '') return null;
  // Object.prototype.toString rather than instanceof: the latter is false
  // for a Date that came from another JS realm, and this value arrives
  // from the Sheets bridge.
  var isDate = Object.prototype.toString.call(v) === '[object Date]';
  var n = Number(v);
  if (!isDate && isFinite(n) && n > 0) return n;
  var d = isDate ? v : new Date(v);
  if (isNaN(d.getTime())) return null;
  var days = (d.getTime() - new Date(1899, 11, 30).getTime()) / 86400000;
  days = Math.round(days * 4) / 4; // the only values that exist are 1, 1.5, 2
  return (days >= 0.5 && days <= 4) ? days : null;
}

function toDateOrNull_(v) {
  if (!v && v !== 0) return null;
  var d = (v instanceof Date) ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function isoOrNull_(v) {
  var d = toDateOrNull_(v);
  return d ? d.toISOString() : null;
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
// The program is SAT-only — the old separate TestPrep (master on/off) and
// which-test columns collapsed into this one SAT checkbox, which
// does both jobs at once: unchecked means subject-tutoring-only (never
// sees the SAT Diagnostic/Resources cards), checked means test prep. The
// ACT program is retired and its client-side UI has been deleted, so
// there's no showAct flag to send any more.
function testPrepFlags_(row) {
  var showSat = truthy_(row.SAT);
  return {
    testPrep: showSat,
    showSat: showSat
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
      return { ok: true, name: row.Name, needsEmail: true, satTaken: !!row.SATTakenAt, testPrep: flags0.testPrep, showSat: flags0.showSat };
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
    testPrep: flags.testPrep,
    showSat: flags.showSat,
    grantedAt: isoOrNull_(grantedAtValue),
    testDate: isoOrNull_(row.TestDate),
    // Set once, during the first-login onboarding sequence (see
    // handleSaveOnboardingPrefs_ below) and read back on every login after
    // that — this is what makes "permanent for their account" actually
    // true, instead of resetting to standard timing before every attempt.
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
   GuardianEmail are read by the weekly guardian summary send — see
   "GUARDIAN WEEKLY SUMMARY" further down — which is why clearing
   GuardianEmail here has to be a real unsubscribe, not just a blanked
   form field.
   ========================================================================= */
function handleSaveOnboardingPrefs(rawKey, rawTestDate, rawAccomTimeMult, rawAccomBreakMult, rawBaselineType, rawBaselineRw, rawBaselineMath, rawGuardianName, rawGuardianEmail, rawTargetScore) {
  var key = String(rawKey || '').trim().toUpperCase();
  if (!key) return { ok: false, error: 'missing_key' };

  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var headers = row._headers;
  ['AccomTimeMult', 'AccomBreakMult', 'BaselineType', 'BaselineRW', 'BaselineMath', 'GuardianName', 'GuardianEmail', 'LastGuardianSummaryAt', 'TargetScore'].forEach(function (col) {
    if (headers.indexOf(col) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col);
      headers.push(col);
    }
  });
  // Trimmed lookup, matching ensureGuardianColumns_ and the guardian job —
  // a header typed with a stray space should still resolve rather than
  // silently write nothing.
  function setCol(col, val) {
    var i = -1;
    for (var h = 0; h < headers.length; h++) {
      if (String(headers[h]).trim() === col) { i = h; break; }
    }
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

  // Optional, but UNLIKE everything else on this screen these two have to
  // tell "not sent" apart from "sent as empty". The Settings pane's "No
  // contact" card posts guardianEmail:null on purpose, and that is a
  // student removing their parent from the weekly summary send — so an
  // empty value has to actually clear the cell instead of leaving the old
  // address sitting there still receiving mail. (That was the bug: this
  // only ever wrote truthy values, so the UI reported the contact removed
  // while the sheet kept it forever.) undefined — the key absent from the
  // request entirely — still means "leave whatever's on the sheet alone",
  // which is what stops a future caller that doesn't know about these
  // columns from wiping them.
  // Name is written even without an email (harmless either way); the
  // email itself gets a basic format check — same regex handleAuth uses
  // for the student's own email — before being trusted onto the sheet.
  var guardianName = String(rawGuardianName == null ? '' : rawGuardianName).trim();
  var guardianEmail = String(rawGuardianEmail == null ? '' : rawGuardianEmail).trim().toLowerCase();
  if (rawGuardianName !== undefined) setCol('GuardianName', guardianName ? sheetSafe_(guardianName) : '');
  if (rawGuardianEmail !== undefined) {
    if (!guardianEmail) {
      // Unsubscribed. Clear the send stamp along with the address so that
      // if the same parent is added back later they aren't sitting behind
      // a stale "already emailed" timestamp from before the removal.
      setCol('GuardianEmail', '');
      setCol('LastGuardianSummaryAt', '');
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail)) {
      setCol('GuardianEmail', guardianEmail);
    }
  }

  // Target score — the goal the score-bridge chart on report.html measures
  // distance against. Loosely validated (the SAT's own 400-1600, with the
  // floor left at 1 so a target saved under the old ACT-era 1-36 range
  // still round-trips rather than being silently dropped) rather than
  // tightly, same "never trust the client, but don't need to re-derive its
  // own form logic here" spirit as the rest of this function.
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
    sheet.appendRow(ASSIGNMENT_COLUMNS_.slice());
  }
  return sheet;
}

/* Notes is the assignment's sub-description — the paragraph a student
   reads when they open it, as opposed to Task which is the one-line
   title. SeriesId ties together the rows a single "repeat this every
   day until…" created, so the whole run can later be edited or deleted
   as one thing instead of thirty separate rows. Both are added to an
   existing sheet automatically, the same way DueDate was. */
var ASSIGNMENT_COLUMNS_ = ['Timestamp', 'Key', 'Task', 'Done', 'DoneAt', 'DueDate', 'Notes', 'SeriesId'];

// Adds the DueDate column to an existing Assignments sheet that predates
// it (same lazy-migration pattern as IncorrectQuestionsJSON etc. on the
// Students sheet) — called by every admin-scheduler handler below before
// it reads or writes DueDate, so this never has to be a one-time manual
// step in the spreadsheet itself.
// Kept under its original name because six call sites read as "make sure
// the schema is current" — it now tops up every optional column, not just
// DueDate. Safe to call on a sheet from any era of this file.
function ensureAssignmentDueDateColumn_(sheet, headers) {
  ASSIGNMENT_COLUMNS_.forEach(function (name) {
    if (headers.indexOf(name) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(name);
      headers.push(name);
    }
  });
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
  var notesCol = headers.indexOf('Notes');
  var seriesCol = headers.indexOf('SeriesId');
  if (keyCol === -1 || taskCol === -1) return [];

  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][keyCol]).trim().toUpperCase() !== key) continue;
    var task = String(data[i][taskCol] || '').trim();
    if (!task) continue;
    out.push({
      row: i + 1, // 1-based sheet row — sent back by the client on toggle
      task: task,
      notes: notesCol !== -1 ? String(data[i][notesCol] || '') : '',
      done: truthy_(data[i][doneCol]),
      assignedAt: tsCol !== -1 ? isoOrNull_(data[i][tsCol]) : null,
      dueDate: dueCol !== -1 ? isoOrNull_(data[i][dueCol]) : null
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
    // Cached read (see fetchCalendarText_) — this runs on every student
    // page load, and previously did its own full iCloud fetch each time.
    var icsText = fetchCalendarText_();
    if (!icsText) return null;
    var events = parseICS_(icsText);
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
  if (ev.cancelled) return null;
  if (ev.start.getTime() > now.getTime()) return null; // hasn't happened yet
  if (!ev.rrule || !ev.rrule.freq) return isExcludedOccurrence_(ev, ev.start) ? null : ev.start; // non-recurring, already occurred

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
    // A cancelled week never happened, so it can't be what expires a
    // student's assignments either (see assignmentExpiryCutoff_).
    if (!isExcludedOccurrence_(ev, cur)) last = cur;

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
function handleGetAssignmentsCalendar(rawKey, rawStart, rawEnd) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var studentsSheet = getSheet_();
  var studentRow = findRow_(studentsSheet, key);
  if (!studentRow) return { ok: false, error: 'bad_key' };

  var sheet = getAssignmentsSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = ensureAssignmentDueDateColumn_(sheet, data[0]);
  var keyCol = headers.indexOf('Key');
  var taskCol = headers.indexOf('Task');
  var doneCol = headers.indexOf('Done');
  var tsCol = headers.indexOf('Timestamp');
  var dueCol = headers.indexOf('DueDate');
  var notesCol = headers.indexOf('Notes');
  var seriesCol = headers.indexOf('SeriesId');

  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][keyCol]).trim().toUpperCase() !== key) continue;
    var task = String(data[i][taskCol] || '').trim();
    if (!task) continue;
    out.push({
      row: i + 1,
      task: task,
      notes: notesCol !== -1 ? String(data[i][notesCol] || '') : '',
      seriesId: seriesCol !== -1 ? String(data[i][seriesCol] || '') : '',
      done: truthy_(data[i][doneCol]),
      assignedAt: tsCol !== -1 ? isoOrNull_(data[i][tsCol]) : null,
      dueDate: dueCol !== -1 ? isoOrNull_(data[i][dueCol]) : null,
      dueDay: dueCol !== -1 && toDateOrNull_(data[i][dueCol]) ? dueDayString_(toDateOrNull_(data[i][dueCol])) : null
    });
  }

  /* Their own tutoring sessions, on the same grid as the homework — the
     point of a calendar for a student is seeing "this is due, and that's
     when we meet about it" in one place. Matched by first name against
     the event title exactly like handleNextSession does for the Home
     card, and filtered to THIS student before anything is returned: a key
     only ever reveals its own owner's sessions, never a roster of
     everyone else's. An unreadable calendar degrades to an empty session
     list plus a flag, never an error — the homework half of this screen
     has nothing to do with the calendar being reachable.
     ================================================================= */
  var sessions = [];
  var calendarError = null;
  var now = new Date();
  var rangeStart = parseRangeDate_(rawStart, new Date(now.getFullYear(), now.getMonth() - 1, 1));
  var rangeEnd = parseRangeDate_(rawEnd, new Date(now.getFullYear(), now.getMonth() + 3, 1));
  if (rangeEnd.getTime() <= rangeStart.getTime()) rangeEnd = new Date(rangeStart.getTime() + 31 * 86400000);
  if (rangeEnd.getTime() - rangeStart.getTime() > ADMIN_CALENDAR_MAX_DAYS_ * 86400000) {
    rangeEnd = new Date(rangeStart.getTime() + ADMIN_CALENDAR_MAX_DAYS_ * 86400000);
  }
  var firstName = String(studentRow.Name || '').trim().split(/\s+/)[0];
  var rawSessions = sessionsForRange_(rangeStart, rangeEnd);
  if (rawSessions === null) {
    calendarError = 'calendar_unavailable';
  } else if (firstName) {
    var escaped = firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var nameRe = new RegExp(escaped, 'i');
    rawSessions.forEach(function (ev) {
      if (!nameRe.test(ev.title)) return;
      sessions.push({ title: ev.title, startIso: ev.startIso, endIso: ev.endIso, allDay: ev.allDay });
    });
  }

  return { ok: true, assignments: out, sessions: sessions, calendarError: calendarError };
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
  var notesCol = headers.indexOf('Notes');
  var seriesCol = headers.indexOf('SeriesId');

  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][keyCol]).trim().toUpperCase() !== key) continue;
    var task = String(data[i][taskCol] || '').trim();
    if (!task) continue;
    out.push({
      row: i + 1,
      task: task,
      notes: notesCol !== -1 ? String(data[i][notesCol] || '') : '',
      seriesId: seriesCol !== -1 ? String(data[i][seriesCol] || '') : '',
      done: truthy_(data[i][doneCol]),
      assignedAt: tsCol !== -1 ? isoOrNull_(data[i][tsCol]) : null,
      dueDate: dueCol !== -1 ? isoOrNull_(data[i][dueCol]) : null
    });
  }
  return { ok: true, assignments: out };
}

// rawDueDates: array of "YYYY-MM-DD" strings — one row is appended per
// date, so a drag-selected range in the calendar (the "repeat this task
// on several days" convenience) becomes several independently
// completable/deletable rows rather than one recurring entry.
// A repeating assignment ("10 minutes of vocabulary, every day until the
// test") is stored as one ROW PER DAY rather than as a rule expanded at
// read time. That's what makes each day's instance independently
// tickable — which is the entire point of a daily habit on a calendar —
// and it keeps every existing read path working unchanged. The rows a
// single repeat creates all carry the same SeriesId, so they can still be
// edited or dropped as one series later (see the `scope` parameter on
// update/delete below).
var MAX_ASSIGNMENT_OCCURRENCES_ = 200;

function newSeriesId_() {
  return 's' + new Date().getTime().toString(36) + Math.random().toString(36).slice(2, 8);
}

function handleCreateAdminAssignment(rawAdminKey, rawKey, rawTask, rawDueDates, rawNotes) {
  if (!ADMIN_KEY || rawAdminKey !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var key = String(rawKey || '').trim().toUpperCase();
  var task = String(rawTask || '').trim();
  var notes = String(rawNotes || '').trim();
  var dates = Array.isArray(rawDueDates) ? rawDueDates : [];
  if (!key || !task || !dates.length) return { ok: false, error: 'missing_fields' };
  // A runaway "repeat daily until 2040" would otherwise write thousands of
  // rows; the client caps this too, this is the backstop.
  if (dates.length > MAX_ASSIGNMENT_OCCURRENCES_) return { ok: false, error: 'too_many_occurrences' };

  var studentsSheet = getSheet_();
  if (!findRow_(studentsSheet, key)) return { ok: false, error: 'bad_key' };

  var sheet = getAssignmentsSheet_();
  var headers = ensureAssignmentDueDateColumn_(sheet, sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
  var seriesId = dates.length > 1 ? newSeriesId_() : '';
  var notesCol = headers.indexOf('Notes');
  var seriesCol = headers.indexOf('SeriesId');
  var rows = [];
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
    if (notesCol !== -1) row[notesCol] = sheetSafe_(notes);
    if (seriesCol !== -1) row[seriesCol] = seriesId;
    rows.push(row);
  });
  if (!rows.length) return { ok: false, error: 'no_valid_dates' };
  // One write for the whole series instead of an appendRow per day — a
  // 90-day repeat was 90 separate round trips to the sheet.
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  return { ok: true, created: rows.length, seriesId: seriesId };
}

// patch: { task?, dueDate? ("YYYY-MM-DD" or null to clear), done? } — only
// the keys present are written, so a drag-to-reschedule (dueDate alone)
// doesn't touch task/done, and the edit popover's Save doesn't touch
// fields the admin didn't change.
// rawScope 'series' applies the task/notes edit to every row sharing this
// one's SeriesId — "actually, make it 15 minutes of vocab, not 10" should
// be one edit, not thirty. dueDate and done are deliberately NEVER
// series-wide: they're what makes each occurrence its own thing.
function handleUpdateAdminAssignment(rawAdminKey, rawKey, rawRow, rawPatch, rawScope) {
  if (!ADMIN_KEY || rawAdminKey !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var key = String(rawKey || '').trim().toUpperCase();
  var row = Number(rawRow);
  var patch = (rawPatch && typeof rawPatch === 'object') ? rawPatch : {};
  if (!key || !row || row < 2) return { ok: false, error: 'bad_row' };

  var sheet = getAssignmentsSheet_();
  if (row > sheet.getLastRow()) return { ok: false, error: 'bad_row' };
  var headers = ensureAssignmentDueDateColumn_(sheet, sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
  var keyCol = headers.indexOf('Key');
  var notesCol = headers.indexOf('Notes');
  var seriesCol = headers.indexOf('SeriesId');

  var rowKey = String(sheet.getRange(row, keyCol + 1).getValue()).trim().toUpperCase();
  if (rowKey !== key) return { ok: false, error: 'key_mismatch' };

  // Which rows this edit touches: just this one, or the whole series.
  var targetRows = [row];
  if (String(rawScope || '') === 'series' && seriesCol !== -1) {
    var seriesId = String(sheet.getRange(row, seriesCol + 1).getValue() || '').trim();
    if (seriesId) targetRows = rowsInSeries_(sheet, headers, key, seriesId);
  }

  if (typeof patch.task === 'string' && patch.task.trim()) {
    var taskCol = headers.indexOf('Task') + 1;
    targetRows.forEach(function (r) { sheet.getRange(r, taskCol).setValue(sheetSafe_(patch.task.trim())); });
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'notes') && notesCol !== -1) {
    targetRows.forEach(function (r) { sheet.getRange(r, notesCol + 1).setValue(sheetSafe_(String(patch.notes || '').trim())); });
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
  return { ok: true, updated: targetRows.length };
}

// Every row belonging to one repeat, for one student. Scoped by key as
// well as SeriesId so a stale id can never reach another student's rows.
function rowsInSeries_(sheet, headers, key, seriesId) {
  var keyCol = headers.indexOf('Key');
  var seriesCol = headers.indexOf('SeriesId');
  if (keyCol === -1 || seriesCol === -1 || !seriesId) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lo = Math.min(keyCol, seriesCol), hi = Math.max(keyCol, seriesCol);
  var block = sheet.getRange(2, lo + 1, lastRow - 1, hi - lo + 1).getValues();
  var out = [];
  for (var i = 0; i < block.length; i++) {
    if (String(block[i][keyCol - lo] || '').trim().toUpperCase() !== key) continue;
    if (String(block[i][seriesCol - lo] || '').trim() !== seriesId) continue;
    out.push(i + 2);
  }
  return out;
}

function handleDeleteAdminAssignment(rawAdminKey, rawKey, rawRow, rawScope) {
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

  var seriesCol = headers.indexOf('SeriesId');
  if (String(rawScope || '') === 'series' && seriesCol !== -1) {
    var seriesId = String(sheet.getRange(row, seriesCol + 1).getValue() || '').trim();
    var rows = seriesId ? rowsInSeries_(sheet, headers, key, seriesId) : [];
    if (rows.length > 1) {
      // Bottom-up: deleting a row shifts every row below it up by one.
      rows.sort(function (a, b) { return b - a; }).forEach(function (r) { sheet.deleteRow(r); });
      return { ok: true, deleted: rows.length };
    }
  }

  sheet.deleteRow(row);
  return { ok: true, deleted: 1 };
}

/* ═══ ADMIN CALENDAR ═══ the sessions half of admin.html's scheduler.
   Homework has always been assignable to a date; what was missing is the
   thing those dates are actually planned AROUND — the tutoring sessions
   themselves. This returns both for a date window in one call: every
   session from the published calendar (see sessionsForRange_) and every
   dated assignment, either for one student (rawKey) or for the whole
   roster (rawKey omitted — the all-students month view).

   Sessions are matched to students the same way handleNextSession does
   it, by first name against the event title, since that's the only link
   between an iCloud event and a roster row. A title that matches two
   students (two Alexes) comes back with both in `matched` rather than
   guessing one; a title that matches nobody comes back with an empty
   `matched` and is still shown, greyed, so a session that ISN'T a
   student — a consult, a block of personal time — doesn't silently
   vanish from a calendar Luca is using to plan.
   ═══════════════════════════════════════════════════════════════════ */
var ADMIN_CALENDAR_MAX_DAYS_ = 200;

// Accepts "YYYY-MM-DD" (local midnight, what FullCalendar's activeStart/
// activeEnd serialize to) or a full ISO instant; falls back rather than
// throwing on anything unparseable.
function parseRangeDate_(v, fallback) {
  if (!v) return fallback;
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v));
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  var d = new Date(String(v));
  return isNaN(d.getTime()) ? fallback : d;
}

// Reads ONLY the Key and Name columns, rather than the whole Students
// sheet the way findRow_/handleGetRoster do. Every calendar navigation
// calls this, and the same sheet also carries the per-student progress
// JSON blobs — up to 45k characters per cell (see PROGRESS_CELL_CAP_) —
// so a full getDataRange() here would drag megabytes across for two
// short strings per student.
function rosterNamesForMatching_() {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var keyIdx = headers.indexOf('Key');
  var nameIdx = headers.indexOf('Name');
  if (keyIdx === -1 || nameIdx === -1) return [];
  var lo = Math.min(keyIdx, nameIdx);
  var hi = Math.max(keyIdx, nameIdx);
  var block = sheet.getRange(2, lo + 1, lastRow - 1, hi - lo + 1).getValues();
  var out = [];
  for (var i = 0; i < block.length; i++) {
    var name = String(block[i][nameIdx - lo] || '').trim();
    var key = String(block[i][keyIdx - lo] || '').trim().toUpperCase();
    if (!name || !key) continue;
    var firstName = name.split(/\s+/)[0];
    var escaped = firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out.push({ key: key, name: name, firstName: firstName, re: new RegExp(escaped, 'i') });
  }
  return out;
}

// A due date is stored as a Date at midnight in the SCRIPT's timezone.
// Sending only an ISO instant makes the client re-derive the day in the
// BROWSER's timezone, which lands on the wrong day whenever the two
// differ (an 8pm-Eastern midnight is already tomorrow in UTC). Date
// methods here run in the script's timezone, so this hands back the exact
// day that was stored and the client never has to do the maths.
function dueDayString_(d) {
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}

function handleGetAdminCalendar(rawAdminKey, rawKey, rawStart, rawEnd) {
  if (!ADMIN_KEY || rawAdminKey !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var key = String(rawKey || '').trim().toUpperCase();

  var now = new Date();
  var rangeStart = parseRangeDate_(rawStart, new Date(now.getFullYear(), now.getMonth() - 1, 1));
  var rangeEnd = parseRangeDate_(rawEnd, new Date(now.getFullYear(), now.getMonth() + 2, 1));
  if (rangeEnd.getTime() <= rangeStart.getTime()) rangeEnd = new Date(rangeStart.getTime() + 31 * 86400000);
  // A hostile-or-typo'd range ("expand a decade of weekly sessions") is
  // clamped rather than refused — the client still gets the window it can
  // actually draw.
  if (rangeEnd.getTime() - rangeStart.getTime() > ADMIN_CALENDAR_MAX_DAYS_ * 86400000) {
    rangeEnd = new Date(rangeStart.getTime() + ADMIN_CALENDAR_MAX_DAYS_ * 86400000);
  }

  var students = rosterNamesForMatching_();
  var nameByKey = {};
  students.forEach(function (s) { nameByKey[s.key] = s.name; });
  if (key && !nameByKey[key]) return { ok: false, error: 'bad_key' };

  var sessions = [];
  var calendarError = null;
  var raw = sessionsForRange_(rangeStart, rangeEnd);
  if (raw === null) {
    calendarError = 'calendar_unavailable';
  } else {
    raw.forEach(function (ev) {
      var matched = students.filter(function (st) { return st.re.test(ev.title); });
      // Single-student view: only that student's own sessions.
      if (key && !matched.some(function (m) { return m.key === key; })) return;
      sessions.push({
        title: ev.title,
        startIso: ev.startIso,
        endIso: ev.endIso,
        allDay: ev.allDay,
        matched: matched.map(function (m) { return { key: m.key, name: m.name }; })
      });
    });
  }

  var assignments = [];
  try {
    var asSheet = getAssignmentsSheet_();
    var asData = asSheet.getDataRange().getValues();
    var asHeaders = ensureAssignmentDueDateColumn_(asSheet, asData[0]);
    var keyCol = asHeaders.indexOf('Key');
    var taskCol = asHeaders.indexOf('Task');
    var doneCol = asHeaders.indexOf('Done');
    var tsCol = asHeaders.indexOf('Timestamp');
    var dueCol = asHeaders.indexOf('DueDate');
    var notesCol = asHeaders.indexOf('Notes');
    var seriesCol = asHeaders.indexOf('SeriesId');
    for (var i = 1; i < asData.length; i++) {
      var rowKey = String(asData[i][keyCol] || '').trim().toUpperCase();
      if (!rowKey) continue;
      if (key && rowKey !== key) continue;
      var task = String(asData[i][taskCol] || '').trim();
      if (!task) continue;
      var due = (dueCol !== -1) ? toDateOrNull_(asData[i][dueCol]) : null;
      if (due) {
        if (due.getTime() < rangeStart.getTime() || due.getTime() >= rangeEnd.getTime()) continue;
      } else if (!key) {
        // Undated rows have no day to sit on. The single-student view
        // still gets them (it lists them beside the calendar so they
        // aren't invisible); the all-students view would just be noise.
        continue;
      }
      assignments.push({
        row: i + 1,
        key: rowKey,
        studentName: nameByKey[rowKey] || '',
        task: task,
        notes: notesCol !== -1 ? String(asData[i][notesCol] || '') : '',
        seriesId: seriesCol !== -1 ? String(asData[i][seriesCol] || '') : '',
        done: truthy_(asData[i][doneCol]),
        assignedAt: tsCol !== -1 ? isoOrNull_(asData[i][tsCol]) : null,
        dueDate: due ? due.toISOString() : null,
        dueDay: due ? dueDayString_(due) : null // the day to draw it on — see dueDayString_
      });
    }
  } catch (e) { /* Assignments sheet unreadable — sessions still render */ }

  return {
    ok: true,
    rangeStart: rangeStart.toISOString(),
    rangeEnd: rangeEnd.toISOString(),
    sessions: sessions,
    assignments: assignments,
    students: students.map(function (s) { return { key: s.key, name: s.name }; }),
    calendarError: calendarError
  };
}

/* ═══ ADMIN STUDENT DETAIL ═══ everything admin.html's per-student page
   shows above the scheduler: the roster row's own fields, every
   diagnostic/practice-test attempt that student has logged, and their
   current skill breakdown.

   Attempts come out of the shared Attempts sheet, where ONE attempt can
   be up to two rows — a 'log' row (written by logDiagnosticResult_ on
   submission) and a 'score' row (written by handleSyncScoreHistory) —
   so rows are merged back into one attempt per submission here, the same
   way index.html's own View Results grouping does it client-side.
   Deliberately does NOT include ReportLink: that field carries the
   entire base64 report payload (tens of KB per attempt, capped only by
   the 50k Sheets cell limit), so a student with a dozen attempts would
   make this a multi-megabyte response for data the page only needs when
   a specific report is actually opened. handleGetAttemptReport below
   fetches exactly one on demand.
   ═══════════════════════════════════════════════════════════════════ */
var ADMIN_DETAIL_MAX_ATTEMPTS_ = 60;

// Every Attempts data row, as an array of arrays, with the columns named
// in skipNames left blank instead of read. Two columns on this sheet are
// enormous — Report (an entire report's plain text) and ReportLink (the
// whole base64 report payload, capped only by the 50k Sheets cell limit)
// — and between them they're most of the sheet's bytes. Skipping the ones
// a given caller doesn't need is the difference between a fast read and
// hauling the full archive across. Blank placeholders are left in place
// so every column index still lines up with `headers`.
function readAttemptRows_(sheet, headers, skipNames) {
  var lastRow = sheet.getLastRow();
  var lastCol = headers.length;
  if (lastRow < 2 || lastCol < 1) return [];
  var n = lastRow - 1;
  var skip = {};
  (skipNames || []).forEach(function (name) {
    var idx = headers.indexOf(name);
    if (idx !== -1) skip[idx] = true;
  });

  var out = [];
  for (var i = 0; i < n; i++) out.push(new Array(lastCol).fill(''));

  // One getValues() per run of consecutive columns we DO want.
  var c = 0;
  while (c < lastCol) {
    if (skip[c]) { c++; continue; }
    var start = c;
    while (c < lastCol && !skip[c]) c++;
    var block = sheet.getRange(2, start + 1, n, c - start).getValues();
    for (var r = 0; r < n; r++) {
      for (var j = 0; j < c - start; j++) out[r][start + j] = block[r][j];
    }
  }
  return out;
}

function handleGetStudentDetail(rawAdminKey, rawKey) {
  if (!ADMIN_KEY || rawAdminKey !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var key = String(rawKey || '').trim().toUpperCase();
  if (!key) return { ok: false, error: 'missing_key' };

  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var flags = testPrepFlags_(row);
  var student = {
    key: key,
    name: row.Name || '',
    driveFolderUrl: row.DriveFolderUrl || '',
    grantedEmail: row.GrantedEmail || '',
    grantedAt: isoOrNull_(row.GrantedAt),
    testDate: isoOrNull_(row.TestDate),
    targetScore: Number(row.TargetScore) || null,
    baselineType: row.BaselineType || null,
    baselineRw: Number(row.BaselineRW) || null,
    baselineMath: Number(row.BaselineMath) || null,
    accomTimeMult: accomMultiplier_(row.AccomTimeMult),
    accomBreakMult: accomMultiplier_(row.AccomBreakMult),
    guardianName: row.GuardianName || '',
    guardianEmail: row.GuardianEmail || '',
    satTaken: !!row.SATTakenAt,
    showSat: flags.showSat,
    progressUpdatedAt: isoOrNull_(row.ProgressUpdatedAt)
  };

  // ── attempts ──────────────────────────────────────────────────────
  var attempts = [];
  try {
    var aSheet = getAttemptsSheet_();
    var aHeaders = aSheet.getRange(1, 1, 1, aSheet.getLastColumn()).getValues()[0];
    // ReportLink is kept: its length is how we tell which row of an
    // attempt carries the openable payload (it's never returned — see
    // handleGetAttemptReport).
    var aData = readAttemptRows_(aSheet, aHeaders, ['Report']);
    var c = {};
    aHeaders.forEach(function (h, i) { c[h] = i; });

    var byGroup = {};
    var order = [];
    for (var i = 0; i < aData.length; i++) {
      var r = aData[i];
      var sheetRow = i + 2; // aData starts at the first data row, not the header
      if (String(r[c.Key] || '').trim().toUpperCase() !== key) continue;
      var ts = toDateOrNull_(r[c.Timestamp]);
      var attemptId = String(r[c.AttemptId] || '').trim();
      var source = String(r[c.Source] || '');
      var testId = String(r[c.TestId] || '');
      var testType = String(r[c.TestType] || '');
      // attemptId is the real identity when it's there. Rows that predate
      // it (or whose score row never synced) fall back to
      // source|testId|type plus the minute they landed — two rows for the
      // same submission are written seconds apart, two genuinely separate
      // attempts at the same test never are.
      var groupId = attemptId ||
        (source + '|' + testId + '|' + testType + '|' + (ts ? Math.floor(ts.getTime() / 60000) : 'x' + sheetRow));
      if (!byGroup[groupId]) {
        byGroup[groupId] = {
          attemptId: attemptId || null,
          at: null, source: '', testType: '', testId: '', testTitle: '',
          composite: null, rw: null, math: null, scaleMin: null, scaleMax: null,
          weakest: null, score: '', reportRow: null, reportChars: 0,
          driveFileUrl: '', emailSent: null, emailError: ''
        };
        order.push(groupId);
      }
      var g = byGroup[groupId];
      if (ts && (!g.at || ts.getTime() < new Date(g.at).getTime())) g.at = ts.toISOString();
      if (!g.attemptId && attemptId) g.attemptId = attemptId;
      if (!g.source && source) g.source = source;
      if (!g.testType && testType) g.testType = testType;
      if (!g.testId && testId) g.testId = testId;
      if (!g.testTitle && r[c.TestTitle]) g.testTitle = String(r[c.TestTitle]);
      if (!g.score && r[c.Score] !== '' && r[c.Score] != null) g.score = String(r[c.Score]);
      if (g.composite == null && Number(r[c.Composite])) {
        g.composite = Number(r[c.Composite]);
        g.rw = Number(r[c.RW]) || null;
        g.math = Number(r[c.Math]) || null;
        g.scaleMin = Number(r[c.ScaleMin]) || null;
        g.scaleMax = Number(r[c.ScaleMax]) || null;
      }
      if (!g.weakest && r[c.WeakestLabel]) {
        g.weakest = {
          label: String(r[c.WeakestLabel]),
          correct: Number(r[c.WeakestCorrect]) || 0,
          total: Number(r[c.WeakestTotal]) || 0
        };
      }
      var link = String(r[c.ReportLink] || '');
      // Longest wins: a truncated/blank link on one row of the pair
      // shouldn't shadow the complete one on the other.
      if (link.length > g.reportChars) { g.reportChars = link.length; g.reportRow = sheetRow; }
      if (!g.driveFileUrl && r[c.DriveFileUrl]) g.driveFileUrl = String(r[c.DriveFileUrl]);
      if (g.emailSent == null && r[c.EmailSent] !== '' && r[c.EmailSent] != null) g.emailSent = truthy_(r[c.EmailSent]);
      if (!g.emailError && r[c.EmailError]) g.emailError = String(r[c.EmailError]);
    }

    attempts = order.map(function (id) {
      var g = byGroup[id];
      return {
        attemptId: g.attemptId,
        at: g.at,
        source: g.source || 'diagnostic',
        testType: g.testType || 'SAT',
        testId: g.testId,
        testTitle: g.testTitle,
        composite: g.composite,
        rw: g.rw,
        math: g.math,
        scaleMin: g.scaleMin,
        scaleMax: g.scaleMax,
        weakest: g.weakest,
        score: g.score,
        hasReport: !!g.reportRow,
        reportRow: g.reportRow,
        driveFileUrl: g.driveFileUrl,
        emailSent: g.emailSent,
        emailError: g.emailError
      };
    });
    attempts.sort(function (a, b) { return String(b.at || '').localeCompare(String(a.at || '')); });
    if (attempts.length > ADMIN_DETAIL_MAX_ATTEMPTS_) attempts = attempts.slice(0, ADMIN_DETAIL_MAX_ATTEMPTS_);
  } catch (e) { /* Attempts sheet unreadable — the page still renders the roster row */ }

  // ── skills + outstanding misses ───────────────────────────────────
  // Same SkillStatsJSON the student's own "Practice My Weak Spots" reads
  // (this student's MOST RECENT attempt's breakdown, not a lifetime
  // aggregate — see handleSyncProgress), flattened and sorted weakest
  // first so the page can show what to actually assign next.
  var skills = [];
  var incorrectCount = 0;
  var savedCount = 0;
  try {
    var bySkill = JSON.parse(row.SkillStatsJSON) || {};
    Object.keys(bySkill).forEach(function (k) {
      var v = bySkill[k] || {};
      var total = Number(v.total) || 0;
      if (!total) return;
      var correct = Number(v.correct) || 0;
      skills.push({
        label: v.label || v.skill || k,
        domain: v.domain || '',
        section: v.section || '',
        correct: correct,
        total: total,
        pct: Math.round((correct / total) * 100)
      });
    });
    skills.sort(function (a, b) { return a.pct - b.pct || b.total - a.total; });
  } catch (e) { /* no/!invalid skill stats — just an empty breakdown */ }
  try { incorrectCount = Object.keys(JSON.parse(row.IncorrectQuestionsJSON) || {}).length; } catch (e) { /* ignore */ }
  try { savedCount = Object.keys(JSON.parse(row.SavedQuestionsJSON) || {}).length; } catch (e) { /* ignore */ }

  return {
    ok: true,
    student: student,
    attempts: attempts,
    skills: skills,
    incorrectCount: incorrectCount,
    savedCount: savedCount
  };
}

// One attempt's report payload, fetched only when Luca actually opens it
// (see the size note on handleGetStudentDetail). `row` is the reportRow
// that detail call handed back; its own Key cell is re-checked here so a
// stale row number can't read a different student's report.
function handleGetAttemptReport(rawAdminKey, rawKey, rawRow) {
  if (!ADMIN_KEY || rawAdminKey !== ADMIN_KEY) return { ok: false, error: 'unauthorized' };
  var key = String(rawKey || '').trim().toUpperCase();
  var row = Number(rawRow);
  if (!key || !row || row < 2) return { ok: false, error: 'bad_row' };

  var sheet = getAttemptsSheet_();
  if (row > sheet.getLastRow()) return { ok: false, error: 'bad_row' };
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var c = {};
  headers.forEach(function (h, i) { c[h] = i; });
  var values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (String(values[c.Key] || '').trim().toUpperCase() !== key) return { ok: false, error: 'key_mismatch' };

  return {
    ok: true,
    reportLink: String(values[c.ReportLink] || ''),
    driveFileUrl: String(values[c.DriveFileUrl] || ''),
    at: isoOrNull_(values[c.Timestamp])
  };
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
// Appends one assignment row, addressed BY COLUMN NAME rather than by
// position. The two callers used to append a fixed 5-element array, which
// silently wrote the wrong columns if the sheet's were ever reordered and
// had no way to set DueDate at all — so anything assigned from the Sheet
// landed undated, and only the admin scheduler could put work on a day.
// rawDueDate is optional ("YYYY-MM-DD"); blank still means undated, which
// the student's calendar shows under "No date set".
function appendAssignmentRow_(key, task, rawDueDate) {
  var sheet = getAssignmentsSheet_();
  var headers = ensureAssignmentDueDateColumn_(sheet, sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]);
  var row = new Array(headers.length).fill('');
  function put(name, value) {
    var i = headers.indexOf(name);
    if (i !== -1) row[i] = value;
  }
  put('Timestamp', new Date());
  put('Key', sheetSafe_(key));
  put('Task', sheetSafe_(task));
  put('Done', false);
  put('DoneAt', '');
  var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(rawDueDate || ''));
  put('DueDate', parts ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])) : '');
  sheet.appendRow(row);
}

function submitAssignmentFromDialog_(key, task, dueDate) {
  var cleanKey = String(key || '').trim().toUpperCase();
  var cleanTask = String(task || '').trim();
  if (!cleanKey || !cleanTask) throw new Error('Pick a student and enter a task.');
  appendAssignmentRow_(cleanKey, cleanTask, dueDate);
  return { ok: true };
}

// Called via a plain fetch() POST from the Assign Homework dialog's
// <script> (not google.script.run — that RPC bridge doesn't reliably
// complete inside this dialog's sandboxed iframe in some browser
// setups, so the dialog talks to the same public web app endpoint
// the student portal already uses). Re-validates the key against the
// roster so the public endpoint can't be used to inject rows for a
// student that doesn't exist.
function handleAssignHomeworkFromDialog(rawKey, rawTask, rawDueDate) {
  var key = String(rawKey || '').trim().toUpperCase();
  var task = String(rawTask || '').trim();
  if (!key || !task) return { ok: false, error: 'missing_fields' };
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };
  appendAssignmentRow_(key, task, rawDueDate);
  return { ok: true };
}

var ASSIGN_HOMEWORK_HTML_ = '<!DOCTYPE html><html><head><base target="_top">' +
  '<style>' +
  'body{font-family:Arial,sans-serif;font-size:13px;padding:4px 10px 14px;color:#222;}' +
  'label{display:block;font-weight:600;margin:14px 0 5px;}' +
  'select,textarea,input[type=date]{width:100%;box-sizing:border-box;padding:8px;font-size:13px;font-family:inherit;border:1px solid #ccc;border-radius:4px;}' +
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
  '<label for="due">Due date <span style="font-weight:400;color:#888;">(optional — leave blank and it shows under &ldquo;No date set&rdquo;)</span></label>' +
  '<input type="date" id="due">' +
  '<button id="submitBtn" onclick="submitForm()">Assign</button>' +
  '<div id="status"></div>' +
  '<script>' +
  'function submitForm(){' +
  '  var key=document.getElementById("student").value;' +
  '  var task=document.getElementById("task").value.trim();' +
  '  var due=document.getElementById("due").value;' +
  '  var statusEl=document.getElementById("status");' +
  '  var btn=document.getElementById("submitBtn");' +
  '  if(!key||!task){statusEl.textContent="Pick a student and enter a task.";statusEl.className="error";return;}' +
  '  btn.disabled = true; statusEl.textContent = "Assigning…"; statusEl.className = "";' +
  '  fetch("https://script.google.com/macros/s/AKfycbwsLMGq3lhBEPObcas0k8gVS67NX9y4wXKG6RgzKtlBOT2SXfREK6vBpvvM19w9s1m6/exec",{method:"POST",body:JSON.stringify({action:"assignHomeworkFromDialog",key:key,task:task,dueDate:due})})' +
  '    .then(function(r){return r.json();})' +
  '    .then(function(resp){' +
  '      if(resp && resp.ok){' +
  '        statusEl.textContent = "Assigned. Close this window or assign another.";' +
  '        statusEl.className = "";' +
  '        document.getElementById("task").value = "";' +
  '        document.getElementById("due").value = "";' +
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
   ONE REAL DIAGNOSTIC
   -------------------------------------------------------------------------
   The portal calls this right after a student finishes the diagnostic for
   the first time — see index.html's finishDiagnostic(). It stamps
   SATTakenAt so that on any later attempt, handleAuth's satTaken flag
   tells the portal to skip emailing Luca and show practice-only copy
   instead — a student can't keep re-submitting the same diagnostic hoping
   for a better score to land in Luca's inbox.

   Deliberately idempotent (only writes if the cell is currently blank) so
   it's safe to call more than once for the same key/test without losing
   the original completion date. ========================================= */
function handleMarkDiagnosticTaken(rawKey, rawTest) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var test = String(rawTest || '').trim().toUpperCase();
  if (test !== 'SAT') return { ok: false, error: 'bad_test' };

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
  if (test !== 'SAT') return { ok: false, error: 'bad_test' };

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
// hard-rejects any test value other than 'SAT' (line ~600 above),
// which a practice test title like "SAT Practice Test 2" would fail. This
// version takes a free-text title instead and otherwise mirrors the same
// two-durable-stores-before-email pattern (DiagnosticLog row + a Drive
// .txt file), reusing the same logDiagnosticResult_ helper so both flows
// show up in one place for Luca to review. Rows/files from practice tests
// are distinguishable by the Test column containing the full test title
// ("SAT Practice Test 2") instead of just "SAT".
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
  'ReportLink', 'AttemptId', 'Interrupted', 'AwayMinutes', 'Report', 'DriveSaved', 'DriveFileUrl', 'EmailSent', 'EmailError'];
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
    // Test integrity: whether this attempt ran straight through, or was
    // interrupted (closed and reopened, or left unattended until a
    // section's clock expired). Recorded on the row so a score taken under
    // non-standard conditions is visible in the roster without opening the
    // report. Blank rather than FALSE when the client didn't report either
    // way — an attempt from before this was tracked cannot claim to have
    // been clean.
    if (col.Interrupted !== undefined && sf.interrupted !== undefined) {
      out[col.Interrupted] = sf.interrupted ? 'YES' : '';
      out[col.AwayMinutes] = sf.awayMs ? Math.round(Number(sf.awayMs) / 60000) : '';
    }
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
// (row.TestId, e.g. "sat-practice-2"), or 'diag-SAT' for the
// diagnostic. `row` here is any object with Source/TestId/TestType
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
   weekly guardian-summary email already relies on
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
  // Score rows, bucketed by student in the SAME pass — this used to be a
  // separate scoreTrendForStudent_() call per student, each one re-reading
  // the entire Attempts sheet (so a 20-student roster did 20 full reads of
  // the biggest sheet in the file, on the very first screen of the admin
  // page). Report/ReportLink are skipped outright: nothing here shows
  // either, and together they're most of the sheet's bytes.
  var trendRowsByKey = {};
  try {
    var aSheet = getAttemptsSheet_();
    var aHeaders = aSheet.getRange(1, 1, 1, aSheet.getLastColumn()).getValues()[0];
    var aData = readAttemptRows_(aSheet, aHeaders, ['Report', 'ReportLink']);
    var aCol = {};
    aHeaders.forEach(function (h, i) { aCol[h] = i; });
    for (var j = 0; j < aData.length; j++) {
      var ak = String(aData[j][aCol.Key] || '').trim().toUpperCase();
      var ats = aData[j][aCol.Timestamp];
      if (!ak || !ats) continue;
      var atDate = toDateOrNull_(ats);
      if (!atDate) continue;
      var atMs = atDate.getTime();
      if (!lastAttemptMsByKey[ak] || atMs > lastAttemptMsByKey[ak]) lastAttemptMsByKey[ak] = atMs;
      if (aData[j][aCol.Kind] !== 'score') continue;
      if (!trendRowsByKey[ak]) trendRowsByKey[ak] = [];
      trendRowsByKey[ak].push({
        date: ats, testTitle: aData[j][aCol.TestTitle] || '',
        testType: aData[j][aCol.TestType], composite: aData[j][aCol.Composite]
      });
    }
    // Same ordering and same "last N" window scoreTrendForStudent_ applies.
    Object.keys(trendRowsByKey).forEach(function (k) {
      trendRowsByKey[k].sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
      trendRowsByKey[k] = trendRowsByKey[k].slice(-GUARDIAN_SUMMARY_TREND_MAX);
    });
  } catch (e) { /* Attempts sheet unreadable — last-activity falls back to ProgressUpdatedAt, and every trend is simply empty */ }

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

    var trend = trendRowsByKey[key] || [];
    var latest = trend.length ? trend[trend.length - 1] : null;
    var first = trend.length ? trend[0] : null;
    // Read off the Students row already in hand — weakestSkillForStudent_
    // would re-read the whole sheet to find the row we're standing on.
    var weakest = col.SkillStatsJSON !== undefined ? weakestFromSkillStats_(data[i][col.SkillStatsJSON]) : null;
    var assign = assignByKey[key] || { total: 0, done: 0 };

    var progressAt = col.ProgressUpdatedAt !== undefined ? toDateOrNull_(data[i][col.ProgressUpdatedAt]) : null;
    var lastActivityMs = Math.max(progressAt ? progressAt.getTime() : 0, lastAttemptMsByKey[key] || 0);

    var grantedAtCell = col.GrantedAt !== undefined ? data[i][col.GrantedAt] : null;

    students.push({
      name: name,
      key: key,
      sat: truthy_(data[i][col.SAT]),
      grantedAt: isoOrNull_(grantedAtCell),
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
   code that can't reach localStorage, i.e. the weekly guardian-summary
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
  // Anything that isn't a recognized type is stored as SAT — the only
  // program that exists now. Retired ACT rows already in this sheet keep
  // whatever they were written with; this only governs new writes.
  out[col.TestType] = 'SAT';
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
  if (col.Interrupted !== undefined && entry.interrupted !== undefined) {
    out[col.Interrupted] = entry.interrupted ? 'YES' : '';
    out[col.AwayMinutes] = entry.awayMs ? Math.round(Number(entry.awayMs) / 60000) : '';
  }
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
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Town', 'Grade', 'Subject', 'Message', 'Stage', 'LastEmailAt', 'IsUSA', 'Role', 'ThreadId']);
    return sheet;
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  // ThreadId is the family's one Gmail conversation — see "ONE THREAD PER
  // FAMILY" below. Auto-creates on an already-live sheet like the rest.
  ['IsUSA', 'Role', 'Subject', 'Message', 'ThreadId'].forEach(function (col) {
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
    // This is the message that CREATES the family's thread — the first
    // one the lead is actually a participant in. Everything afterwards
    // (nudges, and later the weekly progress updates) replies into it.
    var seeded = sendFamilyEmail_('', email, leadEmailConfirmation_(name));
    if (seeded.threadId) {
      var tCol = headers.indexOf('ThreadId');
      if (tCol !== -1) sheet.getRange(sheet.getLastRow(), tCol + 1).setValue(seeded.threadId);
    }
  } catch (err) {
    console.error('Lead confirmation email failed for ' + email + ': ' + err);
  }

  return { ok: true };
}

function leadEmailConfirmation_(name) {
  name = String(name || '').trim() || 'your student';
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
  // NOT "We've received your message" any more: this subject becomes the
  // permanent header of the family's whole thread (Gmail shows the first
  // message's subject on every reply), so it names the family instead of
  // describing one moment in the relationship.
  return { subject: 'Moretti Test Prep — ' + name, text: text, html: html };
}

// Run daily (see setupLeadFollowUpTrigger). Sends the day-3 email to any
// lead that's 3+ days old and hasn't had one yet, and the day-7 email to
// any lead that's 7+ days old and has only had the day-3 email — one
// pass per lead per day, so nothing double-sends even if this runs a few
// minutes late or the sheet has hundreds of rows.
// Days of silence before each nudge, measured from the LAST message in
// the family's thread — not from the form submission. That's the whole
// point: if Luca answered an inquiry by hand on day 5, the clock restarts
// from his reply, so the nudge goes to people who didn't answer HIM.
var LEAD_NUDGE_1_DAYS = 3;
var LEAD_NUDGE_2_DAYS = 4;

function sendLeadFollowUps() {
  var sheet = getLeadsSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  var now = new Date();
  var DAY = 24 * 60 * 60 * 1000;
  var sent = 0, waiting = 0, quiet = 0;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var stage = String(row[col.Stage] || '').trim();
    if (stage === 'STOP') continue;
    if (stage !== '' && stage !== '1') continue; // '2' = both nudges already sent

    var name = row[col.Name], email = row[col.Email];
    if (!email) continue;

    var threadId = col.ThreadId === undefined ? '' : String(row[col.ThreadId] || '').trim();
    var state = threadState_(threadId);

    // ═══ The rule Luca asked for ═══ never nudge someone who is waiting
    // on HIM. If the last message in the thread came from the lead, the
    // ball is in his court and an automated "still interested?" would be
    // both wrong and slightly insulting. Skip, and pick them up again
    // only once he has replied and they've gone quiet.
    if (state && !state.lastFromUs) { waiting++; continue; }

    // Silence measured from our last message when we can see the thread,
    // and from the form submission when we can't (no thread yet, or the
    // advanced Gmail service isn't enabled).
    var since;
    if (state) {
      since = (now - state.lastAt) / DAY;
    } else {
      var submitted = row[col.Timestamp];
      if (!(submitted instanceof Date)) continue;
      // Preserves the original day-3 / day-7 schedule for old rows that
      // never got a ThreadId.
      since = (now - submitted) / DAY - (stage === '1' ? LEAD_NUDGE_1_DAYS : 0);
    }

    var due = (stage === '' ? LEAD_NUDGE_1_DAYS : LEAD_NUDGE_2_DAYS);
    if (since < due) { quiet++; continue; }

    var msg = (stage === '' ? leadEmailDay3_(name) : leadEmailDay7_(name));
    var res = sendFamilyEmail_(threadId, email, msg);
    if (!res.ok) continue; // failed — retry on tomorrow's run rather than advancing the stage

    sheet.getRange(i + 1, col.Stage + 1).setValue(stage === '' ? '1' : '2');
    sheet.getRange(i + 1, col.LastEmailAt + 1).setValue(now);
    if (col.ThreadId !== undefined && res.threadId && res.threadId !== threadId) {
      sheet.getRange(i + 1, col.ThreadId + 1).setValue(res.threadId);
    }
    sent++;
  }

  console.log('Lead follow-ups — sent: ' + sent + ', skipped (awaiting Luca): ' + waiting + ', skipped (too soon): ' + quiet);
}

/* =========================================================================
   ONE THREAD PER FAMILY
   -------------------------------------------------------------------------
   The inquiry confirmation and every follow-up nudge go into a SINGLE
   Gmail thread per family, so Luca opens one conversation instead of
   hunting through a dozen unrelated ones, and anything he types by hand
   in that thread becomes part of the same history.

   Scope: this is the SALES conversation. The weekly progress emails
   pointedly do not use it — a recurring report is not a conversation, and
   threading twelve weeks of them buries the newest one. See "GUARDIAN
   WEEKLY SUMMARY" further down for that reasoning.

   Why this can't use MailApp: MailApp.sendEmail() cannot set In-Reply-To
   or References, the headers mail clients actually thread on, so every
   message it sends is structurally a brand-new conversation. GmailApp's
   thread.reply() sets them, but replies to the SENDER of the thread's
   last message — which is Luca himself whenever the last message was one
   of ours, so it would mail him his own follow-up. The advanced Gmail
   service is the only option that sets the headers AND lets us name the
   recipient explicitly.

   ONE-TIME SETUP: in the Apps Script editor, Services (+) > Gmail API >
   Add. Without it every call below throws and the code falls back to
   unthreaded MailApp sends, so nothing is ever lost — mail just stops
   threading until the service is added.
   ========================================================================= */

var SENDER_NAME_ = 'Luca Moretti — Moretti Test Prep & Tutoring';

function senderAddress_() {
  try {
    var addr = Session.getEffectiveUser().getEmail();
    if (addr) return addr;
  } catch (e) { /* fall through */ }
  return NOTIFY_EMAIL;
}

// Long base64 lines are legal but some strict clients choke on them.
function wrapBase64_(b64) {
  return String(b64).replace(/(.{76})/g, '$1\r\n');
}

// Subjects here carry em dashes and curly quotes, which aren't legal raw
// in a header — RFC 2047 encode the whole thing rather than trying to
// detect which ones need it.
function encodeSubject_(subject) {
  return '=?UTF-8?B?' + Utilities.base64Encode(subject, Utilities.Charset.UTF_8) + '?=';
}

function buildRawMessage_(to, subject, text, html, inReplyTo, references) {
  var b = 'bnd' + Utilities.getUuid().replace(/-/g, '');
  var L = [];
  L.push('From: ' + encodeSubject_(SENDER_NAME_) + ' <' + senderAddress_() + '>');
  L.push('To: ' + to);
  L.push('Subject: ' + encodeSubject_(subject));
  if (inReplyTo) {
    L.push('In-Reply-To: ' + inReplyTo);
    L.push('References: ' + (references || inReplyTo));
  }
  L.push('MIME-Version: 1.0');
  L.push('Content-Type: multipart/alternative; boundary="' + b + '"');
  L.push('');
  L.push('--' + b);
  L.push('Content-Type: text/plain; charset="UTF-8"');
  L.push('Content-Transfer-Encoding: base64');
  L.push('');
  L.push(wrapBase64_(Utilities.base64Encode(text, Utilities.Charset.UTF_8)));
  L.push('--' + b);
  L.push('Content-Type: text/html; charset="UTF-8"');
  L.push('Content-Transfer-Encoding: base64');
  L.push('');
  L.push(wrapBase64_(Utilities.base64Encode(html, Utilities.Charset.UTF_8)));
  L.push('--' + b + '--');
  return L.join('\r\n');
}

// Sends into threadId when we have one, otherwise starts a fresh thread.
// ALWAYS returns the thread id the message actually landed in, so the
// caller can write it back to the sheet and every later email finds its
// way to the same conversation.
// Returns { ok: bool, threadId: string, threaded: bool }.
function sendFamilyEmail_(threadId, toEmail, msg) {
  var subject = msg.subject, inReplyTo = '', references = '', threaded = false;

  if (threadId) {
    try {
      var thread = GmailApp.getThreadById(threadId);
      if (thread) {
        var msgs = thread.getMessages();
        var last = msgs[msgs.length - 1];
        inReplyTo = last.getHeader('Message-ID') || '';
        references = last.getHeader('References') || '';
        references = (references ? references + ' ' : '') + inReplyTo;
        // Gmail splits a thread whose subject doesn't match, so the
        // thread's own subject wins over whatever the template built.
        var base = thread.getFirstMessageSubject() || msg.subject;
        subject = /^re:/i.test(base) ? base : 'Re: ' + base;
        threaded = true;
      } else {
        threadId = ''; // thread was deleted — start a new one, don't drop the mail
      }
    } catch (err) {
      console.error('Could not read thread ' + threadId + ': ' + err);
      threadId = '';
    }
  }

  try {
    var res = Gmail.Users.Messages.send({
      raw: Utilities.base64EncodeWebSafe(buildRawMessage_(toEmail, subject, msg.text, msg.html, inReplyTo, references), Utilities.Charset.UTF_8),
      threadId: threadId || undefined
    }, 'me');
    return { ok: true, threadId: (res && res.threadId) || threadId || '', threaded: threaded };
  } catch (err) {
    // Almost always "Gmail is not defined" — the advanced service hasn't
    // been added yet. Fall back to an unthreaded send so the family still
    // hears from us; threading resumes on its own once the service is on.
    console.error('Threaded send failed for ' + toEmail + ' (' + err + ') — falling back to MailApp.');
    return { ok: sendLeadEmail_(toEmail, '', msg), threadId: threadId || '', threaded: false };
  }
}

// Who spoke last in this thread, and when. This is what lets the drip
// tell "they never wrote back" apart from "they replied and are waiting
// on Luca" — an automated "still interested?" sent to someone whose
// email is sitting unanswered in his own inbox is the worst message the
// system could possibly send.
// Returns null when there's no readable thread, which callers treat as
// "fall back to timestamps".
function threadState_(threadId) {
  if (!threadId) return null;
  try {
    var thread = GmailApp.getThreadById(threadId);
    if (!thread) return null;
    var msgs = thread.getMessages();
    if (!msgs.length) return null;
    var last = msgs[msgs.length - 1];
    var ours = senderAddress_().toLowerCase();
    return {
      lastFromUs: String(last.getFrom() || '').toLowerCase().indexOf(ours) !== -1,
      lastAt: last.getDate(),
      messageCount: msgs.length
    };
  } catch (err) {
    console.error('Could not read thread state for ' + threadId + ': ' + err);
    return null;
  }
}

// Unthreaded fallback, and the only sender left that doesn't need the
// advanced Gmail service. Returns true only if MailApp accepted the
// message. The lead drip callers above ignore the return — a missed follow-up self-corrects
// on the next daily run — but sendGuardianSummaries below DOES check it,
// because it must never stamp a "sent" timestamp for an email that never
// actually left.
function sendLeadEmail_(toEmail, name, msg) {
  try {
    MailApp.sendEmail({
      to: toEmail,
      subject: msg.subject,
      body: msg.text,
      htmlBody: msg.html,
      name: 'Luca Moretti — Moretti Test Prep & Tutoring'
    });
    return true;
  } catch (err) {
    console.error('sendLeadEmail_ failed for ' + toEmail + ': ' + err);
    return false;
  }
}

function leadEmailDay3_(name) {
  var firstName = String(name || '').split(' ')[0] || 'there';
  var text =
    'Hi ' + firstName + ',\n\n' +
    'Wanted to follow up in case you\'re still looking into SAT prep for your student.\n\n' +
    'Here\'s how I actually work with students: every plan starts with a real assessment — figuring out exactly which specific gaps are costing points, not just "more practice." From there we build a plan around those gaps specifically, session by session, instead of a generic curriculum.\n\n' +
    'That\'s built into the 12-Week Program: a diagnostic to start, a custom study plan, two more full-length practice tests along the way to track real movement, and a guarantee — if a student completes all twelve sessions and the homework and their score doesn\'t improve, I keep working with them for free until it does.\n\n' +
    'Happy to walk you through what this would look like for your student specifically — no pressure, just a real conversation. Reserve a seat here:\n' +
    'https://morettitutoring.com/#reserve\n\n' +
    'Best,\nLuca';
  var html =
    '<div style="font-family:Georgia,serif; color:#111; font-size:15px; line-height:1.6; max-width:560px;">' +
    '<p>Hi ' + firstName + ',</p>' +
    '<p>Wanted to follow up in case you\'re still looking into SAT prep for your student.</p>' +
    '<p>Here\'s how I actually work with students: every plan starts with a real assessment &mdash; figuring out exactly which specific gaps are costing points, not just &ldquo;more practice.&rdquo; From there we build a plan around those gaps specifically, session by session, instead of a generic curriculum.</p>' +
    '<p>That\'s built into the <strong>12-Week Program</strong>: a diagnostic to start, a custom study plan, two more full-length practice tests along the way to track real movement, and a guarantee &mdash; if a student completes all twelve sessions and the homework and their score doesn\'t improve, I keep working with them for free until it does.</p>' +
    '<p>Happy to walk you through what this would look like for your student specifically &mdash; no pressure, just a real conversation:</p>' +
    '<p><a href="https://morettitutoring.com/#reserve" style="color:#B0271C; font-weight:bold;">Reserve Your Seat &rarr;</a></p>' +
    '<p>Best,<br>Luca</p>' +
    '</div>';
  return { subject: 'Following up on SAT prep for your student', text: text, html: html };
}

function leadEmailDay7_(name) {
  var firstName = String(name || '').split(' ')[0] || 'there';
  var text =
    'Hi ' + firstName + ',\n\n' +
    'Just a short final check-in — are you still looking for SAT prep support this semester?\n\n' +
    '"I highly recommend Luca as a math tutor. He worked with my daughter to prepare for the SAT and made a tremendous impact on both her confidence and performance... she improved her SAT Math score by approximately 200 points, exceeding our expectations." — Michele C.\n\n' +
    'If now isn\'t the right time, no worries at all — feel free to reach back out whenever it is. If you\'d like to talk it through, reserve a seat here:\n' +
    'https://morettitutoring.com/#reserve\n\n' +
    'Best,\nLuca';
  var html =
    '<div style="font-family:Georgia,serif; color:#111; font-size:15px; line-height:1.6; max-width:560px;">' +
    '<p>Hi ' + firstName + ',</p>' +
    '<p>Just a short final check-in &mdash; are you still looking for SAT prep support this semester?</p>' +
    '<blockquote style="border-left:3px solid #C9A84C; margin:1.2em 0; padding:0.2em 1em; font-style:italic; color:#333;">' +
    '&ldquo;I highly recommend Luca as a math tutor. He worked with my daughter to prepare for the SAT and made a tremendous impact on both her confidence and performance&hellip; she improved her SAT Math score by approximately <strong>200 points</strong>, exceeding our expectations.&rdquo;<br><span style="font-style:normal; font-size:0.85em; color:#666;">&mdash; Michele C.</span>' +
    '</blockquote>' +
    '<p>If now isn\'t the right time, no worries at all &mdash; feel free to reach back out whenever it is. If you\'d like to talk it through, here\'s where to reserve a seat:</p>' +
    '<p><a href="https://morettitutoring.com/#reserve" style="color:#B0271C; font-weight:bold;">Reserve Your Seat &rarr;</a></p>' +
    '<p>Best,<br>Luca</p>' +
    '</div>';
  return { subject: 'Still looking for SAT prep help?', text: text, html: html };
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
   GUARDIAN WEEKLY SUMMARY
   -------------------------------------------------------------------------
   Opt-in per student: fill in GuardianEmail (and optionally GuardianName)
   on that student's row in the Students sheet, or let the student add a
   parent themselves during onboarding or in Settings (both write those
   same two columns, via handleSaveOnboardingPrefs above). Both columns
   auto-create the first time this runs if they don't exist yet, same
   pattern as AccomTimeMult/BaselineType. A blank GuardianEmail means that
   student is skipped entirely, and CLEARING it later is a real
   unsubscribe — it wipes LastGuardianSummaryAt along with the address.

   Sends every FRIDAY morning (see setupGuardianSummaryTrigger), and ONLY
   for students who finished a PRACTICE TEST within the last
   GUARDIAN_ACTIVITY_WINDOW_DAYS days. Diagnostics never trigger or appear
   in one of these — Luca writes to a parent himself about a diagnostic,
   and an automated summary landing next to that would duplicate or
   contradict it. See isDiagnosticRow_ below. A student who hasn't tested inside
   that window produces no email at all — their parent hears nothing,
   rather than getting a recycled update about a score they were already
   told about. That activity gate is the entire suppression rule; there is
   deliberately no separate per-guardian cooldown stacked on top of it.

   So the practical rhythm is: a parent hears from us the Friday after
   their student tests, and stays quiet otherwise. Two separate gates get
   that result, and both matter. The activity window above stops a stale
   score from being reported months later. GUARDIAN_SKIP_REPEAT_SCORES
   stops the SAME score being reported twice — without it, the window (14
   days) being wider than the cadence (7 days) means one test would
   headline two consecutive Fridays. Set it to false if you'd rather have
   the steady weekly touchpoint and don't mind a repeat.

   NOT THREADED, on purpose — the one place that deliberately breaks the
   one-thread-per-family rule the lead flow follows. Threading is right
   for a conversation and wrong for a recurring report: by week twelve a
   parent would be opening an update buried under eleven quoted copies of
   the previous ones, which is how a report stops being read. So each
   Friday email starts its own conversation, and its subject carries the
   date — because Gmail groups by subject + participants even with no
   In-Reply-To header, a fixed weekly subject would quietly re-thread them
   on the parent's side no matter what we did at send time. A parent's
   reply then lands anchored to the week it is actually about.
   ========================================================================= */

// How recently a student must have tested for their parent to hear from
// us at all. This is the rule that keeps quiet students' parents quiet.
var GUARDIAN_ACTIVITY_WINDOW_DAYS = 14;

// true:  (current) only email when a NEW score has landed since the last
//        one went out, so every email a parent opens has something in it
//        they haven't already been told.
// false: email every Friday throughout the activity window, which lets a
//        single score headline two consecutive weeks.
var GUARDIAN_SKIP_REPEAT_SCORES = true;

var GUARDIAN_COLS_ = ['GuardianName', 'GuardianEmail', 'LastGuardianSummaryAt'];

// Matches on the TRIMMED header name. A header typed with a trailing
// space ("GuardianEmail ") used to miss indexOf, get a second column
// appended next to it, and then the code would read the new empty column
// while hand-entered values sat in the original — a student with a
// guardian right there in the sheet reading as "no guardian email on
// record". See diagnoseGuardianColumns() below.
function ensureGuardianColumns_(sheet, headers) {
  var have = {};
  headers.forEach(function (h, i) { have[String(h).trim()] = i; });
  GUARDIAN_COLS_.forEach(function (col) {
    if (have[col] === undefined) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col);
      have[col] = headers.length;
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
  // Trimmed, so a header with a stray space still resolves.
  headers.forEach(function (h, i) { col[String(h).trim()] = i; });
  var now = new Date();
  var tz = Session.getScriptTimeZone() || 'America/New_York';
  var windowMs = GUARDIAN_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  var sent = 0, skipped = 0, failed = 0;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var guardianEmail = String(row[col.GuardianEmail] || '').trim();
    if (!guardianEmail) continue; // no parent on record, or unsubscribed

    var key = String(row[col.Key] || '').trim().toUpperCase();
    if (!key) continue;
    var studentName = row[col.Name] || 'your student';
    var guardianName = row[col.GuardianName] || '';

    var trend = scoreTrendForStudent_(key);
    if (!trend.length) { skipped++; continue; } // never tested — nothing to report

    // ═══ THE suppression rule ═══ no diagnostic or practice test inside
    // the activity window means this parent gets nothing this week. Not a
    // shortened email, not a "no activity this week" note — no send at
    // all. A parent should never receive an update built on a stale score.
    var latest = trend[trend.length - 1];
    var latestDate = (latest.date instanceof Date) ? latest.date : new Date(latest.date);
    if (isNaN(latestDate.getTime()) || (now - latestDate) > windowMs) { skipped++; continue; }

    var lastSent = row[col.LastGuardianSummaryAt];
    if (lastSent instanceof Date) {
      // Same-DAY guard only — a manual re-run from the editor, or a double
      // trigger fire, must not put two copies in a parent's inbox in one
      // morning. This is not a cadence gate; the weekly trigger is.
      if (Utilities.formatDate(lastSent, tz, 'yyyy-MM-dd') === Utilities.formatDate(now, tz, 'yyyy-MM-dd')) { skipped++; continue; }
      // Nothing new since the last email — stay quiet rather than send a
      // parent the same headline score a second time.
      if (GUARDIAN_SKIP_REPEAT_SCORES && latestDate <= lastSent) { skipped++; continue; }
    }

    var weakest = weakestSkillForStudent_(key);
    var msg = guardianSummaryEmail_(studentName, guardianName, trend, weakest, now);

    // Stamp ONLY on a real send. This used to stamp unconditionally, so a
    // bounce or a MailApp quota hit silently cost that parent the whole
    // window, with nothing on the sheet to show why they went dark. A
    // failure now simply retries next Friday and shows up in the log line
    // at the bottom of this function.
    // Deliberately NOT threaded — passing '' starts a fresh conversation
    // every week. See the section header for why progress mail is the one
    // thing that must not join the family thread.
    if (sendFamilyEmail_('', guardianEmail, msg).ok) {
      sheet.getRange(i + 1, col.LastGuardianSummaryAt + 1).setValue(now);
      sent++;
    } else {
      failed++;
    }
  }

  console.log('Guardian weekly summaries — sent: ' + sent + ', skipped: ' + skipped + ', failed: ' + failed);
}

// Last GUARDIAN_SUMMARY_TREND_MAX entries for this student, oldest first —
// enough to show a real trend in the email without dumping the student's
// entire history every time.
var GUARDIAN_SUMMARY_TREND_MAX = 5;
// Diagnostics are deliberately EXCLUDED from the guardian email — Luca
// writes to a parent personally about a diagnostic, and an automated
// summary arriving alongside that would either duplicate it or contradict
// it. Only full practice tests feed the weekly update.
//
// A diagnostic is tagged Source:'diagnostic' with an empty TestId and a
// bare "SAT" title (see handleSubmitDiagnostic); a practice test
// carries a real TestId and a full title like "SAT Practice Test 2".
// Older rows predating the Source column are identified by that same
// shape, so nothing slips through on a blank.
function isDiagnosticRow_(source, testId, testTitle) {
  var src = String(source || '').trim().toLowerCase();
  if (src === 'diagnostic') return true;
  if (src === 'practice-test') return false;
  if (String(testId || '').trim()) return false; // has a test id -> a real practice test
  var title = String(testTitle || '').trim();
  return /^(sat|act)$/i.test(title) || /diagnostic/i.test(title);
}

function scoreTrendForStudent_(key) {
  var sheet = getAttemptsSheet_();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var col = {};
  headers.forEach(function (h, i) { col[String(h).trim()] = i; });

  // Two row Kinds can describe the same attempt. 'score' rows are written
  // by handleSyncScoreHistory, a SEPARATE best-effort call from the client
  // after a test is submitted; 'log' rows are written by the submit itself
  // and carry a Composite too (see logDiagnosticResult_). When that second
  // call fails — it has before, which is why handleBackfillCompositeFields
  // exists — the attempt is on record with a real score but no 'score'
  // row, and a parent would silently never hear about a test their child
  // actually sat. So 'score' rows win, and a 'log' row is folded in only
  // where no 'score' row already describes that same attempt.
  var scoreRows = [], logRows = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][col.Key] || '').trim().toUpperCase() !== key) continue;
    var kind = data[i][col.Kind];
    if (kind !== 'score' && kind !== 'log') continue;
    // Luca handles diagnostics by hand — see isDiagnosticRow_ above.
    if (isDiagnosticRow_(data[i][col.Source], data[i][col.TestId], data[i][col.TestTitle])) continue;
    var composite = Number(data[i][col.Composite]);
    if (!composite) continue; // a log row with no composite tells a parent nothing
    var entry = {
      date: data[i][col.Timestamp],
      testTitle: data[i][col.TestTitle] || '',
      testType: data[i][col.TestType],
      testId: data[i][col.TestId] || '',
      composite: composite
    };
    (kind === 'score' ? scoreRows : logRows).push(entry);
  }

  function sig(e) { return (e.testId || e.testTitle) + '|' + e.composite; }
  var seen = {};
  scoreRows.forEach(function (e) { seen[sig(e)] = true; });
  logRows.forEach(function (e) {
    if (seen[sig(e)]) return;
    seen[sig(e)] = true;
    scoreRows.push(e);
  });

  scoreRows.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  return scoreRows.slice(-GUARDIAN_SUMMARY_TREND_MAX);
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
  return weakestFromSkillStats_(row.SkillStatsJSON);
}

// The domain-level "weakest area" calc, split out of the function above so
// handleGetRoster can run it against a Students row it has ALREADY read
// rather than paying for a whole extra sheet read per student (which is
// what weakestSkillForStudent_ -> findRow_ does). Same inputs, same
// output — the guardian summary still calls the wrapper.
function weakestFromSkillStats_(skillStatsJson) {
  var bySkill = null;
  try { bySkill = JSON.parse(skillStatsJson) || {}; } catch (e) { bySkill = {}; }
  if (!bySkill) return null;

  // Keyed on the NORMALIZED domain name so the two spellings of the same
  // domain add up as one, and labelled with the canonical wording.
  var byDomain = {};
  Object.keys(bySkill).forEach(function (k) {
    var s = bySkill[k];
    if (!s || !s.domain) return;
    var dk = normalizeDomainKey_(s.domain);
    if (!dk) return;
    if (!byDomain[dk]) byDomain[dk] = { label: canonicalDomainLabel_(s.domain), correct: 0, total: 0 };
    byDomain[dk].correct += Number(s.correct) || 0;
    byDomain[dk].total += Number(s.total) || 0;
  });

  var MIN_QUESTIONS = 3;
  var best = null;
  Object.keys(byDomain).forEach(function (dk) {
    var d = byDomain[dk];
    if (d.total < MIN_QUESTIONS) return;
    var pct = d.correct / d.total;
    if (!best || pct < best.pct || (pct === best.pct && d.total > best.total)) {
      best = { label: d.label, correct: d.correct, total: d.total, pct: pct };
    }
  });
  return best;
}

// What we're actually DOING about the weak domain, in one sentence a
// parent can read without knowing the test. Keyed to the eight College
// Board SAT domains the question bank tags against (see index.html's
// domain labels). A domain that isn't in this map — College Board
// relabels one every few years — falls through to the generic line
// rather than asserting a strategy that may not fit.
// The data files now spell every domain and skill one way: "and" is
// always written out, never "&". They did NOT always: practice tests 5-9
// used both
// spellings of the same domain WITHIN one test, which split it into two
// buckets, so a student's real accuracy was computed from partial data
// and could fall under MIN_QUESTIONS in both halves and vanish from the
// weak-spot calc entirely. The data is fixed, but this normalizer stays
// as the safety net — the next test added by hand could spell it either
// way, and this makes that harmless instead of silently wrong.
function normalizeDomainKey_(label) {
  return String(label == null ? '' : label)
    .replace(/&/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

var GUARDIAN_STRATEGY_NOTES_ = {
  'Information and Ideas': 'evidence questions — locating the one line that actually proves the answer, instead of picking the choice that merely sounds reasonable',
  'Craft and Structure': 'vocabulary-in-context and author\u2019s-purpose questions, where the trap is a word\u2019s everyday meaning rather than the one the passage needs',
  'Expression of Ideas': 'transitions and rhetorical synthesis — pinning down the logical relationship between two sentences before looking at a single answer choice',
  'Standard English Conventions': 'punctuation, agreement, and modifiers — the most teachable material on the whole test, because it\u2019s a finite set of rules rather than a skill that has to be grown',
  'Algebra': 'linear equations, inequalities, and systems — these appear early and often, which makes them the cheapest points available on the test',
  'Advanced Math': 'quadratics, polynomials, and nonlinear systems, where recognizing what kind of problem it is matters more than the algebra that follows',
  'Problem-Solving and Data Analysis': 'ratios, percentages, and reading data displays — questions that punish a careless glance at a chart far more than they punish weak math',
  'Geometry and Trigonometry': 'circles, triangles, and right-triangle trig, where most lost points come from a formula not being recalled quickly enough rather than not being understood'
};

// Above this accuracy in their WEAKEST domain, a student doesn't have a
// content gap anywhere on the test — so telling their parent we're going
// to drill that domain is both wrong and faintly alarming. What actually
// separates these students from a top score is time: getting through the
// routine questions cleanly enough to leave real minutes for the two or
// three genuinely hard ones. Tune this if the line lands in the wrong
// place for your roster.
var GUARDIAN_PACING_THRESHOLD_ = 0.75;

function guardianIsPacingCase_(weakest) {
  return !!(weakest && weakest.total > 0 && (weakest.correct / weakest.total) >= GUARDIAN_PACING_THRESHOLD_);
}

// The "what we're doing about it" paragraph. Two different jobs depending
// on which side of the threshold the student is on.
// Both spellings collapse to one entry here, keyed normalized. The value
// is the official College Board wording, which is what a parent sees no
// matter which variant their student's questions happened to be tagged
// with.
var GUARDIAN_DOMAIN_LOOKUP_ = (function () {
  var byKey = {};
  Object.keys(GUARDIAN_STRATEGY_NOTES_).forEach(function (official) {
    byKey[normalizeDomainKey_(official)] = { label: official, focus: GUARDIAN_STRATEGY_NOTES_[official] };
  });
  return byKey;
})();

// Falls back to whatever the data said for a domain we don't recognize,
// so an unknown label still reads correctly in the email.
function canonicalDomainLabel_(label) {
  var hit = GUARDIAN_DOMAIN_LOOKUP_[normalizeDomainKey_(label)];
  return hit ? hit.label : String(label == null ? '' : label);
}

function guardianStrategyNote_(label, isPacingCase) {
  if (isPacingCase) {
    return 'At this level the remaining points come from strategy rather than content. The work now is efficiency: answering the routine questions faster and more accurately, so there are real minutes left at the end of each module for the two or three genuinely hard ones — instead of meeting them with the clock already running out.';
  }
  var hit = GUARDIAN_DOMAIN_LOOKUP_[normalizeDomainKey_(label)];
  if (!hit) return 'Upcoming sessions are built around that area specifically — targeted practice on those exact question types, not more practice in general.';
  return 'Upcoming sessions are built around ' + hit.focus + '. The plan is targeted practice on those specific question types, not more volume in general.';
}

function guardianSummaryEmail_(studentName, guardianName, trend, weakest, sentAt) {
  var studentFirst = String(studentName).split(' ')[0] || 'your student';
  var greetName = guardianName ? String(guardianName).split(' ')[0] : '';
  var latest = trend[trend.length - 1];
  var first = trend[0];
  var trendLine = trend.map(function (e) {
    return (e.testTitle || (e.testType + ' attempt')) + ': ' + e.composite;
  }).join('  \u2192  ');

  var movementText = '';
  if (trend.length > 1 && typeof first.composite === 'number' && typeof latest.composite === 'number') {
    var diff = latest.composite - first.composite;
    var mag = Math.abs(diff);
    // "1 points" reads as a bug to a parent, and a bare minus sign ("moved
    // -90 points") reads worse than just saying it plainly.
    var pts = mag + (mag === 1 ? ' point' : ' points');
    var since = ' since ' + formatDateShort_(first.date);
    if (diff > 0) movementText = studentFirst + '\u2019s composite is up ' + pts + since + '.';
    else if (diff < 0) movementText = studentFirst + '\u2019s composite is down ' + pts + since + ' — normal test-to-test variation, not a trend to worry about on its own.';
    else movementText = studentFirst + '\u2019s composite has held steady' + since + '.';
  }

  // A student whose weakest domain is still strong shouldn't be told they
  // have a "focus area" — that reads as a problem where there isn't one.
  var isPacing = guardianIsPacingCase_(weakest);
  // Canonicalized here as well as in the aggregation, so the parent never
  // sees a raw "Craft & Structure" variant no matter which caller built
  // this weakest object.
  var domainLabel = weakest ? canonicalDomainLabel_(weakest.label) : '';
  var weakestText = weakest
    ? (isPacing
        ? domainLabel + ' was ' + studentFirst + '\u2019s lowest area on the most recent attempt (' + weakest.correct + '/' + weakest.total + ') — strong enough that it isn\u2019t a content gap.'
        : studentFirst + '\u2019s current focus area is ' + domainLabel + ' (' + weakest.correct + '/' + weakest.total + ' on the most recent attempt).')
    : '';
  // Only ever paired with a real weak domain — a strategy paragraph with
  // nothing concrete to point at reads like filler.
  var strategyText = weakest ? guardianStrategyNote_(weakest.label, isPacing) : '';

  var text =
    'Hi' + (greetName ? ' ' + greetName : ' there') + ',\n\n' +
    'A quick update on ' + studentFirst + '\u2019s progress:\n\n' +
    'Most recent score: ' + latest.composite + ' (' + (latest.testTitle || latest.testType) + ', ' + formatDateShort_(latest.date) + ')\n' +
    (movementText ? movementText + '\n' : '') +
    '\nRecent attempts: ' + trendLine + '\n' +
    (weakestText ? '\n' + (isPacing ? 'WHERE THE NEXT POINTS ARE' : 'THIS WEEK\u2019S FOCUS') + '\n' + weakestText + '\n' : '') +
    (strategyText ? strategyText + '\n' : '') +
    '\nHappy to talk through the plan anytime — just reply to this email or text (201) 275-2791.\n\n' +
    'Best,\nLuca';

  var html =
    '<div style="font-family:Georgia,serif; color:#111; font-size:15px; line-height:1.6; max-width:560px;">' +
    '<p>Hi' + (greetName ? ' ' + escapeHtml_(greetName) : ' there') + ',</p>' +
    '<p>A quick update on <strong>' + escapeHtml_(studentFirst) + '</strong>\u2019s progress:</p>' +
    '<div style="background:#f7f4ef; border-left:3px solid #C9A84C; padding:0.9em 1.2em; margin:1em 0;">' +
    '<div style="font-size:1.4em; font-weight:bold; color:#B0271C;">' + latest.composite + '</div>' +
    '<div style="font-size:0.85em; color:#666;">' + escapeHtml_(latest.testTitle || latest.testType) + ' &middot; ' + formatDateShort_(latest.date) + '</div>' +
    '</div>' +
    (movementText ? '<p>' + escapeHtml_(movementText) + '</p>' : '') +
    '<p style="font-size:0.85em; color:#666;">Recent attempts: ' + escapeHtml_(trendLine) + '</p>' +
    (weakestText
      ? '<div style="border-top:1px solid #e5e0d8; margin:1.5em 0 0; padding-top:1.2em;">' +
        '<div style="font-family:Helvetica,Arial,sans-serif; font-size:0.68em; font-weight:bold; letter-spacing:0.12em; text-transform:uppercase; color:#999; margin-bottom:0.6em;">' + (isPacing ? 'Where The Next Points Are' : 'This Week\u2019s Focus') + '</div>' +
        '<p style="margin:0 0 0.8em;">' + escapeHtml_(weakestText) + '</p>' +
        (strategyText ? '<p style="margin:0; color:#444;">' + escapeHtml_(strategyText) + '</p>' : '') +
        '</div>'
      : '') +
    '<p style="margin-top:1.5em;">Happy to talk through the plan anytime &mdash; just reply to this email or text <a href="tel:2012752791" style="color:#B0271C; font-weight:bold;">(201) 275-2791</a>.</p>' +
    '<p>Best,<br>Luca</p>' +
    '</div>';

  // The date is what keeps each week a SEPARATE email in the parent's
  // inbox. Gmail groups messages by subject + participants even when no
  // In-Reply-To/References headers are present, so a fixed weekly subject
  // would collapse the whole term into one thread on their side — week 12
  // arriving under eleven quoted copies of itself is how an update stops
  // being read. Varying the subject is the only thing that prevents it.
  // Plain text in BOTH parts too — a subject is never HTML, so an entity
  // here would show up literally as "&amp;".
  var stamp = formatDateShort_(sentAt || new Date());
  return { subject: studentFirst + '\u2019s Progress Update' + (stamp ? ' — ' + stamp : ''), text: text, html: html };
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
// authorize when asked) to turn on the weekly guardian summary send.
// Safe to run more than once; it clears any duplicate trigger from a
// prior run first — including the old DAILY trigger, if this project
// still has one installed from the previous biweekly design.
function setupGuardianSummaryTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendGuardianSummaries') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendGuardianSummaries')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(8)
    .create();
  console.log('Trigger installed: sendGuardianSummaries now runs every Friday around 8am. Parents only hear from it for students who tested within the last ' + GUARDIAN_ACTIVITY_WINDOW_DAYS + ' days.');
}

// DRY RUN — select this in the function dropdown and click Run to see
// exactly who would be emailed this Friday and who gets skipped (and
// why), without sending anything at all. Read the result in the execution
// log. Worth running before setupGuardianSummaryTrigger the first time.
function previewGuardianSummaries() {
  var sheet = getSheet_();
  var headers = sheet.getDataRange().getValues()[0];
  ensureGuardianColumns_(sheet, headers);
  var data = sheet.getDataRange().getValues();
  headers = data[0];
  var col = {};
  headers.forEach(function (h, i) { col[String(h).trim()] = i; });
  var now = new Date();
  var tz = Session.getScriptTimeZone() || 'America/New_York';
  var windowMs = GUARDIAN_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  var lines = [];

  // Counted rather than listed — the sheet carries hundreds of blank
  // trailing rows, and one line each blew past the Apps Script log limit
  // and truncated the SEND lines, which are the only ones worth reading.
  var blank = 0, noGuardian = 0, noScores = 0;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var key = String(row[col.Key] || '').trim().toUpperCase();
    var name = String(row[col.Name] || '').trim();
    if (!key && !name) { blank++; continue; }   // empty trailing row
    if (!name) name = '(unnamed)';

    var guardianEmail = String(row[col.GuardianEmail] || '').trim();
    if (!guardianEmail) { noGuardian++; continue; }
    if (!key) { lines.push('SKIP  ' + name + ' — has a guardian email but no student Key'); continue; }

    var trend = scoreTrendForStudent_(key);
    if (!trend.length) { noScores++; continue; } // no PRACTICE-TEST scores

    var latest = trend[trend.length - 1];
    var latestDate = (latest.date instanceof Date) ? latest.date : new Date(latest.date);
    if (isNaN(latestDate.getTime())) { lines.push('SKIP  ' + name + ' — unreadable date on latest score'); continue; }
    var days = Math.floor((now - latestDate) / (24 * 60 * 60 * 1000));
    if ((now - latestDate) > windowMs) {
      lines.push('SKIP  ' + name + ' — last test was ' + days + ' days ago (window is ' + GUARDIAN_ACTIVITY_WINDOW_DAYS + ')');
      continue;
    }

    // Same LastGuardianSummaryAt gates the real send applies. Without
    // these the preview drifts optimistic the moment the first emails go
    // out — reporting SEND for a parent who would actually be skipped,
    // which is exactly when you'd be leaning on it.
    var lastSent = row[col.LastGuardianSummaryAt];
    if (lastSent instanceof Date) {
      if (Utilities.formatDate(lastSent, tz, 'yyyy-MM-dd') === Utilities.formatDate(now, tz, 'yyyy-MM-dd')) {
        lines.push('SKIP  ' + name + ' — already emailed today');
        continue;
      }
      if (GUARDIAN_SKIP_REPEAT_SCORES && latestDate <= lastSent) {
        lines.push('SKIP  ' + name + ' — no new score since the last email (' +
                   Utilities.formatDate(lastSent, tz, 'MMM d') + ')');
        continue;
      }
    }

    var weakest = weakestSkillForStudent_(key);
    lines.push('SEND  ' + name + ' \u2192 ' + guardianEmail + ' — ' + latest.composite +
               ' from ' + days + ' day(s) ago, focus: ' + (weakest ? weakest.label : '(none identified yet)'));
  }

  // Summary first so it survives even if the list below gets truncated.
  console.log(
    'Guardian weekly summary preview — NOTHING SENT.\n' +
    'Would send: ' + lines.filter(function (l) { return l.indexOf('SEND') === 0; }).length +
    '   |   skipped: ' + noGuardian + ' no guardian email, ' + noScores + ' no practice-test scores yet, ' +
    lines.filter(function (l) { return l.indexOf('SKIP') === 0; }).length + ' other' +
    '   |   ' + blank + ' blank rows ignored\n\n' +
    (lines.join('\n') || '(nothing actionable — no student is currently due an email)'));
}




// ═══ RUN THIS IF A STUDENT READS AS "no scores logged yet" BUT HAS
// ACTUALLY TAKEN TESTS ═══
// Read-only. Dumps every Attempts row for each student who has a guardian
// email, so you can see whether their attempts landed as 'score' rows,
// 'log' rows, or not at all — and whether a composite was recorded.
function diagnoseStudentAttempts() {
  var students = getSheet_();
  var sData = students.getDataRange().getValues();
  var sCol = {};
  sData[0].forEach(function (h, i) { sCol[String(h).trim()] = i; });

  var attempts = getAttemptsSheet_();
  var aData = attempts.getDataRange().getValues();
  var aCol = {};
  aData[0].forEach(function (h, i) { aCol[String(h).trim()] = i; });

  var out = [];
  for (var i = 1; i < sData.length; i++) {
    var name = String(sData[i][sCol.Name] || '').trim();
    var key = String(sData[i][sCol.Key] || '').trim().toUpperCase();
    var gEmail = String(sData[i][sCol.GuardianEmail] || '').trim();
    if (!gEmail || !key) continue;

    out.push('');
    out.push(name + '  (key ' + key + ', guardian ' + gEmail + ')');
    var found = 0;
    for (var j = 1; j < aData.length; j++) {
      if (String(aData[j][aCol.Key] || '').trim().toUpperCase() !== key) continue;
      found++;
      var comp = aData[j][aCol.Composite];
      out.push('    ' + String(aData[j][aCol.Kind] || '?') +
               '  ' + Utilities.formatDate(new Date(aData[j][aCol.Timestamp]), Session.getScriptTimeZone() || 'America/New_York', 'yyyy-MM-dd') +
               '  "' + String(aData[j][aCol.TestTitle] || '') + '"' +
               '  composite=' + (comp === '' || comp == null ? '(BLANK)' : comp));
    }
    if (!found) out.push('    (no rows at all in the Attempts sheet — this student has never submitted a test)');
    else out.push('    -> trend the email would use: ' + scoreTrendForStudent_(key).length + ' entr(ies)');
  }

  console.log('ATTEMPTS BY STUDENT (guardian-enabled only):' + (out.join('\n') || ' none'));
}

// ═══ RUN THIS IF THE PREVIEW SAYS "no guardian email on record" FOR A
// STUDENT WHO CLEARLY HAS ONE IN THE SHEET ═══
// Read-only; sends nothing, writes nothing. It prints the real header row
// with its exact cell contents (quoted, so stray spaces are visible), flags
// any duplicated or near-duplicated header, and then dumps every
// guardian-ish cell for each named student. The usual cause of a "missing"
// guardian is TWO columns with the same name: the portal writes into one
// (by header lookup) while hand-typed values sit in the other.
function diagnoseGuardianColumns() {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  if (!data.length) { console.log('Students sheet is empty.'); return; }
  var headers = data[0];
  var out = [];

  out.push('HEADER ROW (' + headers.length + ' columns) — quoted so stray spaces show:');
  var seen = {}, dupes = [];
  headers.forEach(function (h, i) {
    var raw = String(h);
    var norm = raw.trim().toLowerCase();
    if (norm && seen[norm] !== undefined) dupes.push('"' + raw + '" appears at column ' + (seen[norm] + 1) + ' AND ' + (i + 1));
    else if (norm) seen[norm] = i;
    if (norm.indexOf('guardian') !== -1 || norm.indexOf('parent') !== -1 || raw !== raw.trim()) {
      out.push('   col ' + (i + 1) + ': "' + raw + '"' + (raw !== raw.trim() ? '   <-- HAS STRAY WHITESPACE' : ''));
    }
  });

  if (dupes.length) {
    out.push('');
    out.push('*** DUPLICATE HEADERS — this is almost certainly the problem ***');
    dupes.forEach(function (d) { out.push('   ' + d); });
    out.push('   Fix: copy any values out of the duplicate into the original,');
    out.push('   then delete the duplicate column and re-run the preview.');
  }

  // Which columns the CODE is actually reading.
  var col = {};
  headers.forEach(function (h, i) { col[String(h).trim()] = i; });
  out.push('');
  out.push('The code reads GuardianName from column ' +
           (col.GuardianName === undefined ? '(NOT FOUND)' : col.GuardianName + 1) +
           ' and GuardianEmail from column ' +
           (col.GuardianEmail === undefined ? '(NOT FOUND)' : col.GuardianEmail + 1) + '.');

  out.push('');
  out.push('PER-STUDENT — every column whose header mentions guardian/parent:');
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][col.Name] || '').trim();
    var key = String(data[i][col.Key] || '').trim();
    if (!name && !key) continue;
    var cells = [];
    headers.forEach(function (h, c) {
      var norm = String(h).trim().toLowerCase();
      if (norm.indexOf('guardian') !== -1 || norm.indexOf('parent') !== -1) {
        cells.push(String(h).trim() + '="' + String(data[i][c] || '') + '"');
      }
    });
    out.push('   ' + (name || '(unnamed)') + ':  ' + (cells.join('   ') || '(no guardian columns)'));
  }

  console.log(out.join('\n'));
}

// End-to-end check of the threading setup WITHOUT touching a real family:
// sends one message to Luca himself, then replies into it. Two messages
// in one thread in his own inbox means everything works. If the advanced
// Gmail service isn't enabled yet, the log says so plainly.
function testFamilyThread() {
  var me = senderAddress_();
  var first = sendFamilyEmail_('', me, {
    subject: 'Moretti Test Prep — threading test',
    text: 'Message 1 of 2. If message 2 lands underneath this one in the same conversation, threading works.',
    html: '<p>Message 1 of 2. If message 2 lands underneath this one in the same conversation, threading works.</p>'
  });
  if (!first.threadId) {
    console.log('FAILED — no thread id came back. Add the Gmail API under Services (+) in this editor, then run this again.');
    return;
  }
  var second = sendFamilyEmail_(first.threadId, me, {
    subject: '(ignored — the thread subject wins)',
    text: 'Message 2 of 2. This should be threaded under message 1.',
    html: '<p>Message 2 of 2. This should be threaded under message 1.</p>'
  });
  console.log('Sent to ' + me + '. Thread: ' + first.threadId +
              '\nSecond message threaded: ' + (second.threaded ? 'YES — setup is correct' : 'NO — check that the Gmail API service is added'));
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

/* ═══ SHARED CALENDAR READ ═══ one fetch of the published .ics, cached
   for a few minutes and reused by everything that needs it. The admin
   calendar (see handleGetAdminCalendar) re-reads the calendar on every
   month the admin pages through, and assignmentExpiryCutoff_ reads it on
   every single student page load — without this each of those was its own
   full round trip to iCloud. Returns null (never throws) when the
   calendar isn't configured or is unreachable, so every caller degrades
   to "no session data" instead of failing outright.
   ═══════════════════════════════════════════════════════════════════ */
var CALENDAR_CACHE_KEY_ = 'moretti_ics_text';
var CALENDAR_CACHE_TTL_S_ = 300;
var CALENDAR_CACHE_MAX_CHARS_ = 90000; // Apps Script caps one cache entry at 100KB

function fetchCalendarText_() {
  var cache = null;
  try { cache = CacheService.getScriptCache(); } catch (e) { /* cache unavailable — just fetch */ }
  if (cache) {
    var hit = cache.get(CALENDAR_CACHE_KEY_);
    if (hit) return hit;
  }
  try {
    var resp = UrlFetchApp.fetch(getCalendarIcsUrl_(), { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return null;
    var text = resp.getContentText();
    // A calendar bigger than the cache entry limit simply isn't cached —
    // still correct, just one fetch per call like before.
    if (cache && text.length <= CALENDAR_CACHE_MAX_CHARS_) {
      try { cache.put(CALENDAR_CACHE_KEY_, text, CALENDAR_CACHE_TTL_S_); } catch (e) { /* ignore */ }
    }
    return text;
  } catch (err) {
    return null;
  }
}

// Every occurrence of one (possibly recurring) event that overlaps
// [rangeStart, rangeEnd) — the range version of
// nextOccurrenceOnOrAfter_/mostRecentOccurrenceOnOrBefore_, which answer
// "the one before/after now." An event's DTEND is carried through as a
// duration so a session drawn on a week view occupies its real block of
// time; an event with no DTEND comes back with end: null and is drawn as
// a point/all-day chip by the client.
var OCCURRENCE_SCAN_CAP_ = 2000;
function occurrencesInRange_(ev, rangeStart, rangeEnd) {
  if (!ev.start || ev.cancelled) return [];
  var durationMs = (ev.end && ev.end.getTime() > ev.start.getTime()) ? ev.end.getTime() - ev.start.getTime() : 0;
  var out = [];

  function consider(d) {
    var startMs = d.getTime();
    var endMs = startMs + durationMs;
    if (startMs >= rangeEnd.getTime()) return;
    // An event that started before the window but runs into it still
    // belongs on screen; a zero-duration one has to start inside it.
    if ((durationMs ? endMs : startMs) < rangeStart.getTime()) return;
    if (isExcludedOccurrence_(ev, d)) return;
    out.push({ start: new Date(startMs), end: durationMs ? new Date(endMs) : null });
  }

  if (!ev.rrule || !ev.rrule.freq) { consider(ev.start); return out; }

  var freq = ev.rrule.freq, interval = ev.rrule.interval || 1;
  var stepDays = freq === 'DAILY' ? interval : freq === 'WEEKLY' ? interval * 7 : null;
  var cur = new Date(ev.start.getTime());
  var n = 0;
  while (n < OCCURRENCE_SCAN_CAP_) {
    if (ev.rrule.until && cur.getTime() > ev.rrule.until.getTime()) break;
    if (ev.rrule.count && n >= ev.rrule.count) break;
    if (cur.getTime() >= rangeEnd.getTime()) break;
    consider(cur);

    if (stepDays) {
      cur = new Date(cur.getTime() + stepDays * 24 * 60 * 60 * 1000);
    } else if (freq === 'MONTHLY') {
      cur = new Date(cur.getFullYear(), cur.getMonth() + interval, cur.getDate(), cur.getHours(), cur.getMinutes(), cur.getSeconds());
    } else if (freq === 'YEARLY') {
      cur = new Date(cur.getFullYear() + interval, cur.getMonth(), cur.getDate(), cur.getHours(), cur.getMinutes(), cur.getSeconds());
    } else {
      break; // unsupported frequency — same limit nextOccurrenceOnOrAfter_ has
    }
    n++;
  }
  return out;
}

// Every session on the calendar between two instants, flattened and
// sorted. Returns null (not []) when the calendar can't be read at all,
// so a caller can tell "no sessions this month" apart from "the calendar
// is down" and say so in the UI instead of showing a convincing but
// wrong empty week.
var SESSIONS_RANGE_CAP_ = 600;
function sessionsForRange_(rangeStart, rangeEnd) {
  var text = fetchCalendarText_();
  if (!text) return null;
  var events;
  try { events = parseICS_(text); } catch (e) { return null; }
  var out = [];
  events.forEach(function (ev) {
    if (out.length >= SESSIONS_RANGE_CAP_) return;
    occurrencesInRange_(ev, rangeStart, rangeEnd).forEach(function (occ) {
      if (out.length >= SESSIONS_RANGE_CAP_) return;
      out.push({
        title: ev.summary,
        startIso: occ.start.toISOString(),
        endIso: occ.end ? occ.end.toISOString() : null,
        allDay: !!ev.allDay
      });
    });
  });
  out.sort(function (a, b) { return a.startIso.localeCompare(b.startIso); });
  return out;
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
    if (line === 'BEGIN:VEVENT') { cur = { summary: '', start: null, end: null, allDay: false, rrule: null, exdates: [], cancelled: false }; return; }
    if (line === 'END:VEVENT') { if (cur) events.push(cur); cur = null; return; }
    if (!cur) return;
    var idx = line.indexOf(':');
    if (idx === -1) return;
    var key = line.slice(0, idx);
    var value = line.slice(idx + 1);
    if (key === 'SUMMARY') {
      cur.summary = unescapeICSText_(value);
    } else if (key.indexOf('DTSTART') === 0) {
      cur.allDay = key.indexOf('VALUE=DATE') !== -1 && key.indexOf('VALUE=DATE-TIME') === -1;
      cur.start = parseICSDate_(value, cur.allDay);
    } else if (key.indexOf('DTEND') === 0) {
      // Only read for its DURATION relative to DTSTART (see
      // occurrencesInRange_) — the admin calendar draws real time blocks
      // for a session, not just a dot on a day, so "4:00" vs "4:00-5:30"
      // is the difference between a usable week view and a useless one.
      cur.end = parseICSDate_(value, key.indexOf('VALUE=DATE') !== -1 && key.indexOf('VALUE=DATE-TIME') === -1);
    } else if (key.indexOf('EXDATE') === 0) {
      // A single cancelled week of a recurring session. Without this, a
      // session Luca already called off still shows on the admin calendar
      // (and still expires assignments via assignmentExpiryCutoff_) as if
      // it had happened.
      value.split(',').forEach(function (v) {
        var d = parseICSDate_(v.trim(), v.indexOf('T') === -1);
        if (d) cur.exdates.push(d.getTime());
      });
    } else if (key === 'STATUS') {
      cur.cancelled = String(value).toUpperCase() === 'CANCELLED';
    } else if (key === 'RRULE') {
      cur.rrule = parseRRule_(value);
    }
  });
  return events;
}

// ICS escapes commas, semicolons, backslashes and newlines inside text
// values (SUMMARY especially — "Luca, Nikolas \u2014 SAT" arrives as
// "Luca\, Nikolas..."). Un-escaping here means the name-matching regexes
// and everything the admin calendar displays see the real title.
function unescapeICSText_(value) {
  return String(value == null ? '' : value)
    .replace(/\\[nN]/g, ' ')
    .replace(/\\([,;\\])/g, '$1')
    .trim();
}

// True if this occurrence was individually cancelled via EXDATE. Compared
// loosely (exact instant OR same calendar day) because an EXDATE is often
// published in UTC while the occurrence we generated is floating/local —
// a strict === would silently never match and quietly do nothing.
function isExcludedOccurrence_(ev, date) {
  if (!ev.exdates || !ev.exdates.length) return false;
  var t = date.getTime();
  for (var i = 0; i < ev.exdates.length; i++) {
    var ex = new Date(ev.exdates[i]);
    if (ex.getTime() === t) return true;
    if (ex.getFullYear() === date.getFullYear() && ex.getMonth() === date.getMonth() && ex.getDate() === date.getDate()) return true;
  }
  return false;
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
  if (ev.cancelled) return null;
  if (ev.start.getTime() >= now.getTime() && !isExcludedOccurrence_(ev, ev.start)) return ev.start;
  if (!ev.rrule || !ev.rrule.freq) return null; // non-recurring and already past (or cancelled outright)

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
    // An EXDATE'd week is skipped rather than returned — "next session"
    // should be the next one that's actually happening.
    if (cur.getTime() >= now.getTime() && !isExcludedOccurrence_(ev, cur)) return cur;

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
