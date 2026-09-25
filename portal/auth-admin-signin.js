/* =========================================================================
   MORETTI PORTAL — ADMIN SIGN-IN GATE
   -------------------------------------------------------------------------
   Google sign-in for portal/admin.html and portal/math-review.html,
   restricted to ADMIN_EMAILS in auth.gs.

   ONE <script> TAG, NO OTHER EDIT. Both pages send
   sessionStorage['moretti_admin_key'] as `adminKey`. This file puts a
   signed ADMIN SESSION TOKEN there; the backend verifies it and
   substitutes the real ADMIN_KEY before any handler runs (authGuard_ in
   auth.gs). The browser never holds the actual secret.

   LOAD IT FIRST, before each page's own script, so the token is in place
   when their auto-continue boot code runs.

   IF SIGN-IN FAILS, fix GOOGLE_CLIENT_ID or ADMIN_EMAILS in auth.gs at
   script.google.com and redeploy (needs the script owner's account).
   There is deliberately no password fallback.
   ========================================================================= */

(function () {
  'use strict';

  var CLIENT_ID = '742313412130-kck7ihjd9el1kolac0hnmep3h1b2vbrh.apps.googleusercontent.com';  // same id as auth.gs
  // backend-url.js, loaded first by every page that includes this file.
  var URL_ = window.APPS_SCRIPT_URL || '';

  var STORE = 'moretti_admin_session';   // ours, for this tab only (see below)
  var PAGE_KEY = 'moretti_admin_key';    // the entry admin.html already reads
  var GSI_SRC = 'https://accounts.google.com/gsi/client';

  /* ── SYNCHRONOUS, BEFORE ANYTHING ELSE ──────────────────────────────
     Mirror any stored session into the host page's entry now, before its
     own script runs, or the page shows its gate needlessly. An expired
     token just fails the page's first call and drops back to this gate. */
  /* SIGN IN ONCE (Luca, 2026-09-25: "make the admin sign in a one-time
     thing"). The session is kept in localStorage, so a new tab, a restart
     or a new day opens straight in, until it runs out (ADMIN_SESSION_TTL_DAYS
     in auth.gs) or Sign out is pressed. It was sessionStorage for safety
     against script injected elsewhere on the site; the site loads no
     third-party script on its pages, and the token only works for an
     address still on ADMIN_EMAILS, so taking an address off that list
     ends every session it holds. */
  var stored = null;
  try { stored = localStorage.getItem(STORE) || sessionStorage.getItem(STORE); } catch (e) {}
  // The token's own expiry, read locally: an expired one goes straight to
  // the gate instead of costing a request to find out.
  function expiresAt(tok) {
    try {
      var body = String(tok || '').split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
      while (body.length % 4) body += '=';
      return Number(JSON.parse(atob(body)).x || 0) * 1000;
    } catch (e) { return 0; }
  }
  if (stored && expiresAt(stored) < Date.now() + 60000) stored = null;
  if (stored) {
    try { localStorage.setItem(STORE, stored); } catch (e) {}
    try { sessionStorage.setItem(STORE, stored); } catch (e) {}
    try { sessionStorage.setItem(PAGE_KEY, stored); } catch (e) {}
  }

  function clearSession() {
    try { localStorage.removeItem(STORE); } catch (e) {}
    try { sessionStorage.removeItem(STORE); } catch (e) {}
    try { sessionStorage.removeItem(PAGE_KEY); } catch (e) {}
    try { if (window.mtaAdminForgetKept) window.mtaAdminForgetKept(); } catch (e) {}
  }

  /* Apps Script's redirect to its echo host intermittently answers a 404 or
     HTML even though the script ran (see auth-admin.js). Both actions here
     only establish or check a session, so repeating them is safe. */
  // Value is the field a genuine answer carries, same convention as
  // auth-admin.js: adminGoogleAuth returns { ok, session, email, name },
  // and accessRoster (used here only to test a stored session) returns
  // { ok, students }.
  var RETRY_ACTIONS = { adminGoogleAuth: 'session', accessRoster: 'students' };
  var POST_TIMEOUT_MS = 20000;
  var POST_MAX_ATTEMPTS = 3;

  function post(payload, attempt) {
    attempt = attempt || 0;
    var field = RETRY_ACTIONS[payload && payload.action];
    var canRetry = !!field && attempt < (POST_MAX_ATTEMPTS - 1);
    function again() {
      var wait = 700 * Math.pow(2, attempt) + Math.floor(Math.random() * 400);
      return new Promise(function (r) { setTimeout(r, wait); })
        .then(function () { return post(payload, attempt + 1); });
    }
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, POST_TIMEOUT_MS);
    var opts = { method: 'POST', body: JSON.stringify(payload) };
    if (ctrl) opts.signal = ctrl.signal;
    return fetch(URL_, opts)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        clearTimeout(timer);
        // The GET health reply again ({ok:true, message}) -- never mistake
        // it for a successful sign-in.
        if (field && data && data.ok === true && !(field in data)) {
          return canRetry ? again() : { ok: false, error: 'network' };
        }
        return data;
      }, function () {
        clearTimeout(timer);
        return canRetry ? again() : { ok: false, error: 'network' };
      });
  }

  var host = null;

  function ensureHost() {
    if (host) return host;
    host = document.createElement('div');
    host.id = 'mta-admin-gate';
    host.setAttribute('style',
      'position:fixed;inset:0;z-index:9500;display:none;align-items:center;justify-content:center;' +
      'background:#f2f2f2;padding:2rem;font-family:var(--hel,-apple-system,Segoe UI,Roboto,sans-serif);' +
      'color:var(--text,#111);');
    host.innerHTML =
      '<div style="max-width:400px;width:100%;text-align:center;">' +
        '<div style="font-size:0.7rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;' +
          'color:rgba(17,17,17,0.28);margin-bottom:0.6rem;">Moretti Test Prep</div>' +
        '<h1 style="font-size:1.35rem;margin:0 0 0.5rem;">Admin</h1>' +
        '<p style="color:rgba(17,17,17,0.58);font-size:0.85rem;line-height:1.5;margin:0 0 1.6rem;">' +
          'Sign in with your Google account.</p>' +
        '<div id="mta-ag-btn" style="display:flex;justify-content:center;"></div>' +
        '<p id="mta-ag-err" style="color:#B0271C;font-size:0.82rem;line-height:1.5;margin-top:1.2rem;' +
          'display:none;"></p>' +
      '</div>';
    (document.body || document.documentElement).appendChild(host);
    return host;
  }

  function say(msg, isError) {
    var el = ensureHost().querySelector('#mta-ag-err');
    el.textContent = msg || '';
    el.style.color = isError === false ? 'rgba(17,17,17,0.58)' : '#B0271C';
    el.style.display = msg ? 'block' : 'none';
  }

  function showGate() {
    ensureHost().style.display = 'flex';
    loadGsi().then(function () {
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: onCredential,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      var target = host.querySelector('#mta-ag-btn');
      target.innerHTML = '';
      google.accounts.id.renderButton(target, {
        theme: 'filled_black', size: 'large', text: 'signin_with',
        shape: 'rectangular', width: 280
      });
    }).catch(function () {
      say("Google's sign-in script could not load — an ad blocker or a network filter is the usual cause.");
    });
  }

  function loadGsi() {
    return new Promise(function (resolve, reject) {
      if (window.google && google.accounts && google.accounts.id) return resolve();
      var s = document.createElement('script');
      s.src = GSI_SRC; s.async = true; s.defer = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('gsi_blocked')); };
      document.head.appendChild(s);
    });
  }

  function onCredential(response) {
    var idToken = response && response.credential;
    if (!idToken) { say('Google sign-in did not complete. Try again.'); return; }
    say('Checking…', false);
    post({ action: 'adminGoogleAuth', idToken: idToken }).then(function (data) {
      if (!data || !data.ok) {
        if (data && data.error === 'not_an_admin') {
          say('That Google account is not on the admin list. Add its address to ADMIN_EMAILS ' +
              'in auth.gs (script.google.com) and redeploy.');
        } else if (data && data.error === 'network') {
          say("Couldn't reach the server. Check your connection and try again.");
        } else {
          say('Sign-in failed: ' + ((data && data.error) || 'unknown error'));
        }
        return;
      }
      try { localStorage.setItem(STORE, data.session); } catch (e) {}
      try { sessionStorage.setItem(STORE, data.session); } catch (e) {}
      try { sessionStorage.setItem(PAGE_KEY, data.session); } catch (e) {}
      // Reload rather than driving the host page's unlock: its boot code
      // already handles a present credential, and a clean re-run is more
      // robust than reaching into its internals.
      window.location.reload();
    });
  }

  /* No check on the way in: it used to be a whole roster read, just to
     learn the session was fine, racing the page's own roster read for
     Google's time. The page's first request already answers it, and a
     session the backend refuses sends the page to mtaAdminSignOut. */
  function start() {
    ensureHost();
    if (!stored) showGate();
  }

  window.mtaAdminSignOut = function () { clearSession(); window.location.reload(); };
  window.mtaAdminSession = function () { try { return localStorage.getItem(STORE) || sessionStorage.getItem(STORE); } catch (e) { return null; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
