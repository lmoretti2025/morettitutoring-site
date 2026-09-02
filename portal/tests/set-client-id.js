#!/usr/bin/env node
/*
 * Sets the OAuth client ID in every file that needs it, and points every
 * client file at one deployment URL.
 *
 * Both values live in more than one file, and a half-applied change fails
 * in a way that reads like a different bug entirely: a stale client id
 * gives Google's "400: the server cannot process the request because it is
 * malformed", and a stale deployment URL means the page you are testing and
 * the page your students use are talking to different backends. Doing it in
 * one command removes the chance of getting three files right and one
 * wrong.
 *
 *   node portal/tests/set-client-id.js <client-id>
 *   node portal/tests/set-client-id.js --url <exec-url>
 *   node portal/tests/set-client-id.js <client-id> --url <exec-url>
 *   node portal/tests/set-client-id.js --check
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..');
const ID_FILES  = ['auth.gs', 'auth-client.js', 'auth-admin-signin.js'];
const URL_FILES = ['index.html', 'math-review.html', 'auth-admin.js', 'auth-admin-signin.js'];
const ID_RE  = /((?:GOOGLE_)?CLIENT_ID\s*=\s*')([^']*)(')/;
const URL_RE = /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/g;

const args = process.argv.slice(2);
const check = args.includes('--check');
const urlIdx = args.indexOf('--url');
const newUrl = urlIdx !== -1 ? args[urlIdx + 1] : null;
const newId = args.find(a => a.endsWith('.apps.googleusercontent.com'));

function read(f) { return fs.readFileSync(path.join(DIR, f), 'utf8'); }
function write(f, s) { fs.writeFileSync(path.join(DIR, f), s); }

function report() {
  console.log('\nOAuth client ID');
  let placeholders = 0;
  const ids = new Set();
  for (const f of ID_FILES) {
    const m = ID_RE.exec(read(f));
    const v = m ? m[2] : '(not found)';
    const bad = v.indexOf('PASTE_YOUR') === 0;
    if (bad) placeholders++; else ids.add(v);
    console.log('  ' + (bad ? '\x1b[31m✗\x1b[0m' : '\x1b[32m✓\x1b[0m') + ' ' + f.padEnd(21) +
      (bad ? 'STILL A PLACEHOLDER' : v.slice(0, 34) + '…'));
  }
  if (placeholders) {
    console.log('\n  \x1b[33mThis is what causes Google\'s "400 … malformed" on sign-in.\x1b[0m');
    console.log('  Google is being handed a client id that is not a client id.');
  } else if (ids.size > 1) {
    console.log('\n  \x1b[31mThe files disagree about the client id.\x1b[0m They must all match.');
  }

  console.log('\nDeployment URL');
  const urls = new Map();
  for (const f of URL_FILES) {
    let txt;
    try { txt = read(f); } catch (e) { continue; }
    const m = txt.match(URL_RE);
    if (m) urls.set(f, [...new Set(m)]);
  }
  const distinct = new Set([].concat(...[...urls.values()]));
  urls.forEach((u, f) => console.log('  ' + (distinct.size === 1 ? '\x1b[32m✓\x1b[0m' : '\x1b[33m!\x1b[0m') +
    ' ' + f.padEnd(21) + u.map(x => x.slice(38, 62) + '…').join(', ')));
  if (distinct.size > 1) {
    console.log('\n  \x1b[31mThese must all be the same deployment.\x1b[0m');
  }
  console.log('');
  return placeholders === 0 && ids.size <= 1 && distinct.size <= 1;
}

if (check || (!newId && !newUrl)) {
  const ok = report();
  if (!newId && !newUrl && !check) {
    console.log('Usage: node portal/tests/set-client-id.js <client-id> [--url <exec-url>]\n');
  }
  process.exit(ok ? 0 : 1);
}

if (newId) {
  if (!/^[0-9]+-[A-Za-z0-9_]+\.apps\.googleusercontent\.com$/.test(newId)) {
    console.error('\nThat does not look like a Google OAuth client id.');
    console.error('It should look like  1234567890-abc123def456.apps.googleusercontent.com\n');
    process.exit(2);
  }
  for (const f of ID_FILES) {
    const s = read(f);
    if (!ID_RE.test(s)) { console.error('Could not find the client id line in ' + f); process.exit(2); }
    write(f, s.replace(ID_RE, (_, a, __, c) => a + newId + c));
    console.log('set client id in ' + f);
  }
}

if (newUrl) {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(newUrl)) {
    console.error('\nThat does not look like an Apps Script Web app /exec URL.\n');
    process.exit(2);
  }
  for (const f of URL_FILES) {
    let s;
    try { s = read(f); } catch (e) { continue; }
    if (!URL_RE.test(s)) continue;
    write(f, s.replace(URL_RE, newUrl));
    console.log('set deployment url in ' + f);
  }
}

console.log('');
const ok = report();
console.log(ok ? '\x1b[32mAll set. Now run: node portal/tests/verify-deployment.js\x1b[0m\n'
               : '\x1b[31mStill inconsistent — see above.\x1b[0m\n');
process.exit(ok ? 0 : 1);
