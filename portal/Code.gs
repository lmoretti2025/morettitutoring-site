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

   SETUP — see the deployment guide for full steps. Short version:
     1. Create a Google Sheet with a tab named "Students" and headers:
          Key | Name | DriveFolderUrl | CollegePrepFolderUrl | GrantedEmail | GrantedAt
     2. Paste this file into a new Apps Script project (script.google.com).
     3. Set SHEET_ID below to that Sheet's ID (from its URL).
     4. Deploy > New deployment > Web app.
          Execute as: Me
          Who has access: Anyone
     5. Copy the deployment URL into APPS_SCRIPT_URL in portal/index.html.
   ========================================================================= */

var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';
var SHEET_TAB_NAME = 'Students';

function doPost(e) {
  var out;
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'auth') {
      out = handleAuth(body.key, body.email);
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
      return { ok: true, name: row.Name, needsEmail: true };
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
    tests: []
  };
}
