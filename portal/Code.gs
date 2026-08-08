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
          Key | Name | DriveFolderUrl | GrantedEmail | GrantedAt | SATTakenAt | ACTTakenAt | TestPrep | SAT | ACT | TestDate
        (CollegePrepFolderUrl is NOT part of the live sheet — the code
        still checks for it and simply no-ops if the column is missing,
        but don't add it unless you actually want a second Drive folder
        per student.)
        (SATTakenAt/ACTTakenAt track the one-real-diagnostic-per-test-type
        feature — leave both blank for everyone; they get stamped
        automatically the first time each student finishes that test's
        diagnostic. A blank cell means "never taken."
        TestPrep controls whether a student sees the SAT/ACT Diagnostics
        and SAT/ACT Resources cards on the portal home screen AT ALL — a
        student who's only doing subject tutoring, not test prep, should
        have this left blank/unchecked so those two cards just don't show
        up for them; "Your Files" always shows either way. Use an actual
        checkbox column (Insert > Checkbox) or just type TRUE/yes in the
        cell — either is read as "on".
        SAT / ACT are two more checkbox columns that say WHICH test(s) a
        test-prep student is actually working on — check SAT for an SAT
        student, ACT for an ACT student, both if genuinely undecided
        between the two. This controls which test's diagnostic button and
        resources (vocab list, etc. — SAT-specific tools) the student
        sees; an ACT-only student never sees SAT-only material and vice
        versa. If TestPrep is checked but neither SAT nor ACT is checked
        (e.g. an existing row from before these columns existed), both
        show by default — nothing breaks for students you haven't
        re-flagged yet.
        TestDate is the student's actual SAT/ACT test date — type it in as
        a real date (Insert > Date, or just type e.g. 3/14/2027). When
        it's set, the portal home screen shows a countdown/progress bar
        running from the day the student first logged into the portal
        (GrantedAt) to this date, with the days-remaining count and your
        target logo at the finish line. Leave it blank for a student and
        the bar just doesn't show — no error, nothing broken.)
        A tab named "Assignments" holds the homework checklist shown on
        each student's portal home screen — it's created automatically the
        first time it's needed, with headers Timestamp | Key | Task | Done
        | DoneAt. To assign something, just add a row yourself (Key, Task
        text, today's date in Timestamp, leave Done unchecked). See
        getAssignments_() below for details.
        A tab named "Progress" is also created automatically the first
        time a student finishes a diagnostic or practice test — it's what
        makes the portal's "My Incorrect Questions" and "Practice My Weak
        Spots" tools work from any device instead of just the one that
        took the test. Nothing to set up or maintain here; see
        handleSyncProgress()/handleGetProgress() below for details.
     2. Paste this file into a new Apps Script project (script.google.com).
     3. Set SHEET_ID below to that Sheet's ID (from its URL).
     4. Deploy > New deployment > Web app.
          Execute as: Me
          Who has access: Anyone
     5. Copy the deployment URL into APPS_SCRIPT_URL in portal/index.html.
     6. Select "setupTrigger" in the function dropdown and click Run once
        (authorize when asked). This turns on the auto-folder feature.
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
      out = handleSubmitDiagnostic(body.key, body.test, body.score, body.reportLink, body.report);
    } else if (body.action === 'toggleAssignment') {
      out = handleToggleAssignment(body.key, body.row, !!body.done);
    } else if (body.action === 'getAssignments') {
      out = handleGetAssignments(body.key);
    } else if (body.action === 'assignHomeworkFromDialog') {
      out = handleAssignHomeworkFromDialog(body.key, body.task);
    } else if (body.action === 'submitPracticeTest') {
      out = handleSubmitPracticeTest(body.key, body.test, body.score, body.reportLink, body.report);
    } else if (body.action === 'submitLead') {
      out = handleSubmitLead(body.name, body.phone, body.email, body.isUSA, body.role, body.grade);
    } else if (body.action === 'syncProgress') {
      out = handleSyncProgress(body.key, body.incorrect, body.skills);
    } else if (body.action === 'getProgress') {
      out = handleGetProgress(body.key);
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
// TestPrep) and returns a real boolean. A checkbox column already comes
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
function grantFolderAccess_(url, email) {
  var id = extractFolderId_(url);
  if (!id || !email) return;
  try {
    DriveApp.getFolderById(id).addViewer(email);
  } catch (err) {
    // logged to Apps Script's execution log for debugging
    console.error('Could not grant access to folder ' + id + ' for ' + email + ': ' + err);
  }
}

// Works out which test(s) a student should see the diagnostic/resources
// UI for. testPrep is the master on/off switch (subject-only tutoring
// students have it off and never see either). Within test-prep students,
// the SAT/ACT columns say which test(s) — if neither is checked (most
// commonly: an older row from before these columns existed), both show,
// so nothing silently disappears for students who haven't been re-flagged.
function testPrepFlags_(row) {
  var testPrepOn = truthy_(row.TestPrep);
  var sat = truthy_(row.SAT);
  var act = truthy_(row.ACT);
  var neitherSpecified = !sat && !act;
  return {
    testPrep: testPrepOn,
    showSat: testPrepOn && (sat || neitherSpecified),
    showAct: testPrepOn && (act || neitherSpecified)
  };
}

function handleAuth(rawKey, rawEmail, rawName) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';
  var name = rawName ? String(rawName).trim() : '';

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
      return { ok: true, name: row.Name, needsEmail: true, satTaken: !!row.SATTakenAt, actTaken: !!row.ACTTakenAt, testPrep: flags0.testPrep, showSat: flags0.showSat, showAct: flags0.showAct };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'bad_email' };
    }
    grantFolderAccess_(row.DriveFolderUrl, email);
    grantFolderAccess_(row.CollegePrepFolderUrl, email);
    var emailCol = row._headers.indexOf('GrantedEmail');
    var atCol = row._headers.indexOf('GrantedAt');
    grantedAtValue = new Date();
    if (emailCol !== -1) sheet.getRange(row._rowIndex, emailCol + 1).setValue(sheetSafe_(email));
    if (atCol !== -1) sheet.getRange(row._rowIndex, atCol + 1).setValue(grantedAtValue);
  } else if (email && email !== grantedEmail) {
    // Someone's submitting a different email for a key that's already
    // bound to someone else — refuse rather than silently re-sharing.
    return { ok: false, error: 'email_mismatch' };
  }

  var flags = testPrepFlags_(row);
  return {
    ok: true,
    name: row.Name,
    needsEmail: false,
    driveFolderUrl: row.DriveFolderUrl || '',
    collegePrepFolderUrl: row.CollegePrepFolderUrl || '',
    satTaken: !!row.SATTakenAt,
    actTaken: !!row.ACTTakenAt,
    testPrep: flags.testPrep,
    showSat: flags.showSat,
    showAct: flags.showAct,
    grantedAt: grantedAtValue ? new Date(grantedAtValue).toISOString() : null,
    testDate: row.TestDate ? new Date(row.TestDate).toISOString() : null,
    tests: [],
    assignments: getAssignments_(key, row.Name)
  };
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
    sheet.appendRow(['Timestamp', 'Key', 'Task', 'Done', 'DoneAt']);
  }
  return sheet;
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
      assignedAt: (tsCol !== -1 && data[i][tsCol]) ? new Date(data[i][tsCol]).toISOString() : null
    });
  }

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
function handleSubmitDiagnostic(rawKey, rawTest, score, reportLink, reportText) {
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
    logDiagnosticResult_(key, name, test, safeScore, link, extra, driveOk, driveFileUrl, !emailError, emailError);
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
function handleSubmitPracticeTest(rawKey, rawTitle, score, reportLink, reportText) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var test = String(rawTitle || '').trim().slice(0, 80) || 'Practice Test';

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
    logDiagnosticResult_(key, name, test, safeScore, link, extra, driveOk, driveFileUrl, !emailError, emailError);
    logOk = true;
  } catch (logErr) {
    console.error('Failed to write DiagnosticLog row for ' + key + ': ' + logErr);
  }

  return { ok: logOk || driveOk, driveSaved: driveOk, driveFileUrl: driveFileUrl, logSaved: logOk, emailSent: !emailError, emailError: emailError || undefined };
}

// Appends one row to a "DiagnosticLog" tab (auto-created on first use, left
// alone after that) so every submitted diagnostic has a durable record
// independent of email delivery, AND records whether the email itself
// succeeded — so a future silent email failure is diagnosable straight
// from the spreadsheet, no Executions log required. Columns: Timestamp |
// Key | Name | Test | Score | ReportLink | Report | DriveSaved |
// DriveFileUrl | EmailSent | EmailError.
function logDiagnosticResult_(key, name, test, score, reportLink, reportText, driveSaved, driveFileUrl, emailSent, emailError) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var log = ss.getSheetByName('DiagnosticLog');
  if (!log) {
    log = ss.insertSheet('DiagnosticLog');
    log.appendRow(['Timestamp', 'Key', 'Name', 'Test', 'Score', 'ReportLink', 'Report', 'DriveSaved', 'DriveFileUrl', 'EmailSent', 'EmailError']);
  }
  log.appendRow([new Date(), sheetSafe_(key), sheetSafe_(name), sheetSafe_(test), sheetSafe_(score), sheetSafe_(reportLink), sheetSafe_(reportText), !!driveSaved, sheetSafe_(driveFileUrl || ''), !!emailSent, sheetSafe_(emailError || '')]);
}

/* =========================================================================
   STUDENT PROGRESS SYNC — "My Incorrect Questions" / "Practice My Weak
   Spots", moved server-side
   -------------------------------------------------------------------------
   These two portal tools used to be 100% client-side (localStorage only),
   which meant the data only ever existed in whatever browser/device took
   the test — a student taking a practice test on one device and checking
   their weak spots on another (or Luca checking from his own computer)
   always saw nothing, even though the attempt genuinely happened. This
   "Progress" tab (auto-created on first use, one row per student key) is
   now the source of truth both tools read from (via action 'getProgress'),
   kept current by every diagnostic/practice-test completion (action
   'syncProgress', called right alongside the existing submitDiagnostic/
   submitPracticeTest send — see index.html's syncProgressToBackend()).

   Columns: Key | IncorrectQuestionsJSON | SkillStatsJSON | UpdatedAt.
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
function getProgressSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('Progress');
  if (!sheet) {
    sheet = ss.insertSheet('Progress');
    sheet.appendRow(['Key', 'IncorrectQuestionsJSON', 'SkillStatsJSON', 'UpdatedAt']);
  }
  return sheet;
}

// A Google Sheets cell tops out around 50,000 characters — IncorrectQuestionsJSON
// carries full question text/choices/explanations per miss, which can add up
// over enough outstanding misses. Rather than truncate the JSON string itself
// (which would corrupt it), this drops the OLDEST misses (by attemptedAt) one
// at a time until the serialized map fits — a student's most recent misses are
// the ones "Practice My Weak Spots" and this log actually need.
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
// whatever was stored before.
function handleSyncProgress(rawKey, rawIncorrect, rawSkills) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' }; // same gate as the other submit handlers — unknown key writes nothing

  var pSheet = getProgressSheet_();
  var pData = pSheet.getDataRange().getValues();
  var pHeaders = pData[0];
  var keyCol = pHeaders.indexOf('Key');
  var iqCol = pHeaders.indexOf('IncorrectQuestionsJSON');
  var skCol = pHeaders.indexOf('SkillStatsJSON');
  var atCol = pHeaders.indexOf('UpdatedAt');

  var rowIndex = -1, byKey = {};
  for (var i = 1; i < pData.length; i++) {
    if (String(pData[i][keyCol]).trim().toUpperCase() === key) {
      rowIndex = i + 1;
      try { byKey = JSON.parse(pData[i][iqCol]) || {}; } catch (e) { byKey = {}; }
      break;
    }
  }

  (Array.isArray(rawIncorrect) ? rawIncorrect : []).forEach(function (r) {
    if (!r || !r.key) return;
    if (r.correct) delete byKey[r.key];
    else byKey[r.key] = r;
  });
  byKey = capIncorrectByKey_(byKey);
  var bySkill = (rawSkills && typeof rawSkills === 'object') ? rawSkills : {};

  var iqJson = sheetSafe_(JSON.stringify(byKey));
  var skJson = sheetSafe_(JSON.stringify(bySkill));
  if (rowIndex === -1) {
    pSheet.appendRow([key, iqJson, skJson, new Date()]);
  } else {
    pSheet.getRange(rowIndex, iqCol + 1).setValue(iqJson);
    pSheet.getRange(rowIndex, skCol + 1).setValue(skJson);
    pSheet.getRange(rowIndex, atCol + 1).setValue(new Date());
  }
  return { ok: true };
}

// Read-only fetch for the two portal tools — deliberately returns ok:true
// with empty objects for a valid key that just has no Progress row yet
// (brand-new student, nothing submitted), rather than an error; only an
// unrecognized key is rejected.
function handleGetProgress(rawKey) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var pSheet = getProgressSheet_();
  var pData = pSheet.getDataRange().getValues();
  var pHeaders = pData[0];
  var keyCol = pHeaders.indexOf('Key');
  var iqCol = pHeaders.indexOf('IncorrectQuestionsJSON');
  var skCol = pHeaders.indexOf('SkillStatsJSON');
  for (var i = 1; i < pData.length; i++) {
    if (String(pData[i][keyCol]).trim().toUpperCase() === key) {
      var byKey = {}, bySkill = {};
      try { byKey = JSON.parse(pData[i][iqCol]) || {}; } catch (e) { /* ignore */ }
      try { bySkill = JSON.parse(pData[i][skCol]) || {}; } catch (e) { /* ignore */ }
      return { ok: true, incorrectQuestions: byKey, skillStats: bySkill };
    }
  }
  return { ok: true, incorrectQuestions: {}, skillStats: {} };
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
// "reserve a seat" fields (IsUSA, Role) — Town/Subject/Message stay as
// columns (older rows still have data in them) but no longer get written
// to by new submissions. Appending the two new headers, rather than
// rewriting the row, keeps an already-live sheet's existing columns/data
// untouched.
function getLeadsSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('Leads');
  if (!sheet) {
    sheet = ss.insertSheet('Leads');
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Town', 'Grade', 'Subject', 'Message', 'Stage', 'LastEmailAt', 'IsUSA', 'Role']);
    return sheet;
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  ['IsUSA', 'Role'].forEach(function (col) {
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
function handleSubmitLead(rawName, rawPhone, rawEmail, rawIsUSA, rawRole, rawGrade) {
  var name = String(rawName || '').trim();
  var email = String(rawEmail || '').trim();
  if (!name || !email) return { ok: false, error: 'missing_name_or_email' };
  var phone = String(rawPhone || '').trim();
  var isUSA = String(rawIsUSA || '').trim();
  var role = String(rawRole || '').trim();
  var grade = String(rawGrade || '').trim();

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
