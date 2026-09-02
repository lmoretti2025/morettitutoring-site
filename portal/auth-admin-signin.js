/* =========================================================================
   MORETTI PORTAL — ADMIN SIGN-IN GATE
   -------------------------------------------------------------------------
   Replaces the typed admin password on portal/admin.html (and
   portal/math-review.html) with Google sign-in restricted to the addresses
   in ADMIN_EMAILS in auth.gs.

   ONE <script> TAG, NO OTHER EDIT. Both pages read their credential from
   sessionStorage['moretti_admin_key'] and send it as `adminKey` on every
   request. So this file puts a signed ADMIN SESSION TOKEN in that entry;
   the backend verifies it and substitutes the real ADMIN_KEY before any
   handler sees the request (see authGuard_ in auth.gs). Every existing call
   on those pages authenticates unchanged, and the browser never holds the
   actual secret.

   LOAD IT FIRST — before each page's own script — so the token is already
   in sessionStorage when their "auto-continue if this browser already
   unlocked" boot code runs. That is what makes a returning admin land
   straight on the roster instead of on a gate.

   IF SIGN-IN EVER FAILS, the way back in is auth.gs at script.google.com:
   fix GOOGLE_CLIENT_ID or ADMIN_EMAILS and redeploy. That needs the Google
   account that owns the script, so it is not a weaker door. There is no
   password fallback over HTTP on purpose — one would keep alive exactly
   the credential this removes.
   ========================================================================= */

(function () {
  'use strict';

  var CLIENT_ID = '742313412130-kck7ihjd9el1kolac0hnmep3h1b2vbrh.apps.googleusercontent.com';  // same id as auth.gs
  // backend-url.js, loaded first by every page that includes this file.
  var URL_ = window.APPS_SCRIPT_URL || '';

  var STORE = 'moretti_admin_session';   // ours, survives a tab close
  var PAGE_KEY = 'moretti_admin_key';    // the entry admin.html already reads
  var GSI_SRC = 'https://accounts.google.com/gsi/client';

  /* ── SYNCHRONOUS, BEFORE ANYTHING ELSE ──────────────────────────────
     Mirror any stored session into the entry the host page reads, right
     now, while its own script has not run yet. Miss this window and the
     page shows its gate and the admin re-authenticates for nothing. The
     token is verified a moment later; an expired one just fails the
     page's own first call and drops it back to this gate. */
  var stored = null;
  try { stored = localStorage.getItem(STORE); } catch (e) {}
  if (stored) {
    try { sessionStorage.setItem(PAGE_KEY, stored); } catch (e) {}
  }

  function clearSession() {
    try { localStorage.removeItem(STORE); } catch (e) {}
    try { sessionStorage.removeItem(PAGE_KEY); } catch (e) {}
  }

  function post(payload) {
    return fetch(URL_, { method: 'POST', body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: 'network' }; });
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
      try { sessionStorage.setItem(PAGE_KEY, data.session); } catch (e) {}
      // Reload rather than trying to drive the host page's own unlock: its
      // boot code already does exactly the right thing when the credential
      // is present, and re-running it from a clean state is far more
      // robust than reaching into its internals from out here.
      window.location.reload();
    });
  }

  /* Verify whatever we mirrored in. Runs alongside the host page's own
     first request, so a good session costs nothing visible; a bad one
     replaces the page with the gate rather than leaving the admin looking
     at that page's "wrong admin key" error, which would now be misleading
     — there is no key to get wrong. */
  function start() {
    ensureHost();
    if (!stored) { showGate(); return; }
    post({ action: 'accessRoster', adminKey: stored }).then(function (data) {
      if (data && data.ok) return;                          // signed in, nothing to do
      // ONLY an actual auth failure signs someone out. A network blip, a
      // sheet error, a cold-start timeout — none of those mean the session
      // is bad, and treating them as if they were would throw Luca back to
      // the gate, where signing in again cannot fix a broken sheet. That is
      // a loop, and it looks exactly like being locked out of his own admin.
      if (!data || data.error !== 'unauthorized') return;
      clearSession();
      showGate();
    });
  }

  window.mtaAdminSignOut = function () { clearSession(); window.location.reload(); };
  window.mtaAdminSession = function () { try { return localStorage.getItem(STORE); } catch (e) { return null; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
