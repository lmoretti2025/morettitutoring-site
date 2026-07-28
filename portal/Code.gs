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
var NOTIFY_EMAIL = 'lmoretti2001@gmail.com';

function doPost(e) {
  var out;
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'auth') {
      out = handleAuth(body.key, body.email);
    } else if (body.action === 'nextSession') {
      out = handleNextSession(body.key, !!body.debug);
    } else if (body.action === 'markDiagnosticTaken') {
      out = handleMarkDiagnosticTaken(body.key, body.test);
    } else if (body.action === 'submitDiagnostic') {
      out = handleSubmitDiagnostic(body.key, body.test, body.score, body.reportLink, body.report);
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

function handleAuth(rawKey, rawEmail) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

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
    if (emailCol !== -1) sheet.getRange(row._rowIndex, emailCol + 1).setValue(email);
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
    tests: []
  };
}

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
  log.appendRow([new Date(), key, name, test, score, reportLink, reportText, !!driveSaved, driveFileUrl || '', !!emailSent, emailError || '']);
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
  console.log('Trigger installed. Editing the Students sheet will now auto-create folders.');
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
