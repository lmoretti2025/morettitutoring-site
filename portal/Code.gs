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
          Key | Name | DriveFolderUrl | CollegePrepFolderUrl | GrantedEmail | GrantedAt | SATTakenAt | ACTTakenAt
        (SATTakenAt/ACTTakenAt track the one-real-diagnostic-per-test-type
        feature — leave both blank for everyone; they get stamped
        automatically the first time each student finishes that test's
        diagnostic. A blank cell means "never taken.")
     2. Paste this file into a new Apps Script project (script.google.com).
     3. Set SHEET_ID below to that Sheet's ID (from its URL).
     4. Deploy > New deployment > Web app.
          Execute as: Me
          Who has access: Anyone
     5. Copy the deployment URL into APPS_SCRIPT_URL in portal/index.html.
     6. Select "setupTrigger" in the function dropdown and click Run once
        (authorize when asked). This turns on the auto-folder feature.
   ========================================================================= */

var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';
var SHEET_TAB_NAME = 'Students';
var STUDENT_FOLDERS_PARENT_NAME = 'Moretti Portal — Student Folders';

function doPost(e) {
  var out;
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'auth') {
      out = handleAuth(body.key, body.email);
    } else if (body.action === 'nextSession') {
      out = handleNextSession(body.name, !!body.debug);
    } else if (body.action === 'markDiagnosticTaken') {
      out = handleMarkDiagnosticTaken(body.key, body.test);
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

function handleAuth(rawKey, rawEmail) {
  if (!rawKey) return { ok: false, error: 'missing_key' };
  var key = String(rawKey).trim().toUpperCase();
  var email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

  var sheet = getSheet_();
  var row = findRow_(sheet, key);
  if (!row) return { ok: false, error: 'bad_key' };

  var grantedEmail = row.GrantedEmail ? String(row.GrantedEmail).trim().toLowerCase() : '';

  if (!grantedEmail) {
    // First time this key has ever been used.
    if (!email) {
      return { ok: true, name: row.Name, needsEmail: true, satTaken: !!row.SATTakenAt, actTaken: !!row.ACTTakenAt };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'bad_email' };
    }
    grantFolderAccess_(row.DriveFolderUrl, email);
    grantFolderAccess_(row.CollegePrepFolderUrl, email);
    var emailCol = row._headers.indexOf('GrantedEmail');
    var atCol = row._headers.indexOf('GrantedAt');
    if (emailCol !== -1) sheet.getRange(row._rowIndex, emailCol + 1).setValue(email);
    if (atCol !== -1) sheet.getRange(row._rowIndex, atCol + 1).setValue(new Date());
  } else if (email && email !== grantedEmail) {
    // Someone's submitting a different email for a key that's already
    // bound to someone else — refuse rather than silently re-sharing.
    return { ok: false, error: 'email_mismatch' };
  }

  return {
    ok: true,
    name: row.Name,
    needsEmail: false,
    driveFolderUrl: row.DriveFolderUrl || '',
    collegePrepFolderUrl: row.CollegePrepFolderUrl || '',
    satTaken: !!row.SATTakenAt,
    actTaken: !!row.ACTTakenAt,
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
var CALENDAR_ICS_URL = 'https://p172-caldav.icloud.com/published/2/ODExODY2MDE0NTgxMTg2NueGXoXKSW70-PWkPnqJPMohqzUItIudqwCkF6twJ-BXC1z9zr2f6PGDPEaNfvS15tsp_IDWWX_CrRjXMPwG8TU';

// debugMode adds a `debug` object to the response with exactly what
// happened at each step (HTTP status, name matched against, every event
// summary parsed off the calendar, which ones matched) so this can be
// diagnosed from the portal itself (append ?debug=1 to the portal URL)
// without needing to open the Apps Script execution log.
function handleNextSession(rawName, debugMode) {
  if (!rawName) return { ok: false, error: 'missing_name' };
  var firstName = String(rawName).trim().split(/\s+/)[0];
  if (!firstName) return { ok: false, error: 'missing_name' };

  try {
    var resp = UrlFetchApp.fetch(CALENDAR_ICS_URL, { muteHttpExceptions: true });
    var httpStatus = resp.getResponseCode();
    Logger.log('handleNextSession: fetched calendar, status=' + httpStatus + ', name="' + rawName + '", firstName="' + firstName + '"');
    if (httpStatus !== 200) {
      Logger.log('handleNextSession: calendar unreachable, body preview: ' + resp.getContentText().slice(0, 200));
      return debugMode
        ? { ok: false, error: 'calendar_unreachable', debug: { httpStatus: httpStatus, firstName: firstName } }
        : { ok: false, error: 'calendar_unreachable' };
    }
    var events = parseICS_(resp.getContentText());
    var now = new Date();
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
        var occurrence = nextOccurrenceOnOrAfter_(ev, now);
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
