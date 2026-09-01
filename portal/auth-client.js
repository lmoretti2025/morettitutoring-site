/* =========================================================================
   MORETTI STUDENT PORTAL — SIGN-IN (front end)
   -------------------------------------------------------------------------
   THIS IS A SEPARATE FILE ON PURPOSE. It is designed to be dropped into
   portal/index.html with a single <script> tag and TWO small edits, rather
   than woven through the 18,000-line page — see portal/AUTH_INTEGRATION.md.

   WHAT IT REPLACES. The portal used to authenticate by having the student
   type an access key, which the backend looked up and answered with that
   student's entire record. The key was therefore a password: unexpiring,
   unrevocable, and readable off a screenshot or a shoulder. This file
   makes a verified Google identity the credential instead, and demotes the
   key to a ONE-TIME CLAIM CODE that pairs an account to a roster row and
   then never works again.

   WHAT IT OWNS.
     - A full-screen sign-in surface, injected at runtime. It deliberately
       renders no markup into index.html's own HTML: it builds its own
       container and fills it using index.html's EXISTING classes (.panel,
       .kicker, .panel-hed, .key-input, .key-btn, .key-error, .key-help),
       so it matches the portal exactly without shipping a second stylesheet
       or touching a single existing element.
     - The signed session token: stored in localStorage, sent on every
       backend call, and traded for a fresh one on each page load.
     - The pending-approval wait, including the poll that lets a student
       straight in the moment Luca taps approve.

   THE fetch() WRAPPER. Roughly two dozen call sites in index.html post to
   the Apps Script backend, some through postToBackend() and some through
   bare fetch(). Every one of them now has to carry the session token.
   Rather than edit ~12 call sites (and rely on nobody ever forgetting the
   13th — a forgotten one is a broken feature, silently), this file wraps
   window.fetch once and attaches the token to any POST aimed at the
   backend. It is a deliberate, narrow interception: same-origin-irrelevant,
   backend-URL-only, POST-only, JSON-body-only, and it never touches a
   request that already carries a session or an adminKey.
   ========================================================================= */

window.MorettiAuth = (function () {
  'use strict';

  /* ═══ SET THIS — the same OAuth Web client ID as auth.gs ═══
     Not a secret: it ships in this file and is visible in page source by
     design. What makes it safe is that the BACKEND checks every ID token
     was issued for this exact client id (verifyGoogleIdToken_ in auth.gs),
     so a token minted for some other site cannot be replayed here. */
  var CLIENT_ID = 'PASTE_YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com';

  var STORE = 'moretti_session';
  var GSI_SRC = 'https://accounts.google.com/gsi/client';
  var POLL_MS = 4000;
  var CONTACT = 'text Luca at (201) 275-2791';

  var session = null;
  var idToken = null;      // held only for the duration of a sign-in attempt
  var onStudent = null;
  var pollTimer = null;
  var wasPending = false;  // so a claim that gets DECLINED reads as declined, not as "enter a key"
  var nameAsked = false;   // one ask only — see the needsName branch in handle()
  var host = null;
  var invite = null;       // the ?invite= token, if this visit came from an invite email

  function backendUrl() { return window.APPS_SCRIPT_URL || ''; }

  /* Pulls ?invite=… out of the URL and immediately removes it from the
     address bar. Scrubbing matters: the token is single-use but live until
     claimed, and leaving it in the URL puts it into browser history, into
     any bookmark the student makes, and into the Referer header of every
     outbound link they click from the portal. replaceState keeps them on
     the same page with no reload. */
  function takeInviteFromUrl() {
    var m = /[?&]invite=([^&#]+)/.exec(window.location.search || '');
    if (!m) return null;
    var token = decodeURIComponent(m[1]);
    try {
      var clean = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, clean);
    } catch (e) { /* history blocked — the token stays visible, nothing else breaks */ }
    return token;
  }

  // The signed-in address is server-supplied, but it originates in a Google
  // profile, so it is not markup to be trusted into innerHTML unescaped.
  function escapeText(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function readStore() {
    try { return localStorage.getItem(STORE) || null; } catch (e) { return null; }
  }
  function writeStore(v) {
    try { if (v) localStorage.setItem(STORE, v); else localStorage.removeItem(STORE); } catch (e) {}
  }

  /* ═══ THE ONE PLACE EVERY BACKEND CALL PICKS UP ITS SESSION ═══
     See the file header for why this is a wrapper and not ~12 edits.
     Everything about it is scoped as tightly as it can be while still
     catching every call: only POSTs, only to the backend URL, only bodies
     that parse as JSON carrying an `action`, and never a request that has
     already got its own credentials (adminKey — admin.html and
     math-review.html authenticate as Luca, not as a student). */
  function installFetchWrapper() {
    if (typeof window.fetch !== 'function' || window.__mtaFetchWrapped) return;
    var original = window.fetch;
    window.fetch = function (input, init) {
      try {
        var url = (typeof input === 'string') ? input : (input && input.url);
        var base = backendUrl();
        if (session && base && url && String(url).indexOf(base) === 0 &&
            init && init.body && typeof init.body === 'string' &&
            String(init.method || '').toUpperCase() === 'POST') {
          var payload = JSON.parse(init.body);
          if (payload && payload.action && !payload.adminKey && !payload.session) {
            payload.session = session;
            // Copied, never mutated in place: callers reuse their init
            // objects (markDiagnosticTaken's retry does exactly that), and
            // rewriting one out from under a caller is the kind of bug
            // that only shows up on the retry path.
            var next = {};
            for (var k in init) if (Object.prototype.hasOwnProperty.call(init, k)) next[k] = init[k];
            next.body = JSON.stringify(payload);
            init = next;
          }
        }
      } catch (e) { /* not our request, or not JSON — pass it through untouched */ }
      return original.call(this, input, init);
    };
    window.__mtaFetchWrapped = true;
  }

  function post(payload) {
    return fetch(backendUrl(), { method: 'POST', body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: 'network' }; });
  }

  /* ═══ THE SIGN-IN SURFACE ═══ built, not marked up — see the file header.
     One container, three panes, only one visible at a time. */
  function ensureHost() {
    if (host) return host;
    host = document.createElement('div');
    host.id = 'mta-auth';
    host.setAttribute('style',
      'position:fixed;inset:0;z-index:9000;display:flex;align-items:center;' +
      'justify-content:center;padding:2rem 1.5rem;background:#fff;overflow-y:auto;');
    host.innerHTML =
      '<div class="panel" style="text-align:center;">' +
        '<div class="kicker">Student Portal</div>' +

        '<div id="mta-who" style="display:none;">' +
          '<h1 class="panel-hed">Before you sign in</h1>' +
          '<p class="panel-sub">This link sets up the <b>student&rsquo;s</b> portal account. ' +
            'Whoever signs in here becomes the account &mdash; and it is the address their notes, ' +
            'slide decks and score reports get shared to.</p>' +
          '<button class="key-btn" id="mta-who-student">I&rsquo;m the student &mdash; continue</button>' +
          '<p class="key-help"><a href="#" id="mta-who-parent">I&rsquo;m a parent</a></p>' +
          '<div id="mta-who-forward" style="display:none;">' +
            '<p class="panel-sub" style="margin-top:1.2rem;">No problem &mdash; forward this email to your ' +
            'child and have them open the link on their own device, signed in to their own Google account. ' +
            'Nothing else is needed from you.</p>' +
            '<p class="key-help">Setting it up together on their device right now? ' +
            '<a href="#" id="mta-who-anyway">Continue anyway</a></p>' +
          '</div>' +
        '</div>' +

        '<div id="mta-signin">' +
          '<h1 class="panel-hed">Sign in</h1>' +
          '<p class="panel-sub">This is the <b>student&rsquo;s</b> portal &mdash; sign in with the ' +
            'student&rsquo;s own Google account, not a parent&rsquo;s.</p>' +
          '<div id="mta-gbtn" style="display:flex;justify-content:center;margin:1.5rem 0 0;"></div>' +
          '<p class="key-error" id="mta-signin-error"></p>' +
          '<p class="key-help">No Google account on your email address? You can make one on the address you already use &mdash; ' +
            'go to <a href="https://accounts.google.com/signup" target="_blank" rel="noopener">accounts.google.com/signup</a> ' +
            'and choose &ldquo;Use your existing email.&rdquo;</p>' +
        '</div>' +

        '<div id="mta-key" style="display:none;">' +
          '<h1 class="panel-hed">Enter your access key</h1>' +
          '<p class="panel-sub" id="mta-key-sub"></p>' +
          '<input type="text" class="key-input" id="mta-key-input" placeholder="ACCESS KEY" autocomplete="off" autocapitalize="characters">' +
          '<p class="key-error" id="mta-key-error"></p>' +
          '<button class="key-btn" id="mta-key-submit">Continue</button>' +
          '<p class="key-help">Don’t have a key yet? Call or ' + CONTACT + ' to get set up. ' +
            '<a href="#" id="mta-key-switch">Use a different Google account</a></p>' +
        '</div>' +

        '<div id="mta-name" style="display:none;">' +
          '<h1 class="panel-hed">What&rsquo;s your name?</h1>' +
          '<p class="panel-sub" id="mta-name-sub"></p>' +
          '<input type="text" class="key-input" id="mta-name-input" placeholder="Full name" ' +
            'autocomplete="name" style="text-transform:none;">' +
          '<p class="key-error" id="mta-name-error"></p>' +
          '<button class="key-btn" id="mta-name-submit">Continue</button>' +
        '</div>' +

        '<div id="mta-pending" style="display:none;">' +
          '<h1 class="panel-hed">Waiting on Luca</h1>' +
          '<p class="panel-sub" id="mta-pending-sub"></p>' +
          '<div id="mta-pending-dots" style="margin:1.5rem 0;font-size:1.5rem;letter-spacing:.3em;opacity:.4;">&bull;&bull;&bull;</div>' +
          '<p class="key-help">Leave this page open &mdash; it lets you in by itself the moment he approves. ' +
            'In a hurry? ' + CONTACT.charAt(0).toUpperCase() + CONTACT.slice(1) + '. ' +
            '<a href="#" id="mta-pending-switch">Start over</a></p>' +
        '</div>' +

      '</div>';
    document.body.appendChild(host);

    host.querySelector('#mta-who-student').addEventListener('click', function () { renderSignIn(); });
    host.querySelector('#mta-who-parent').addEventListener('click', function (e) {
      e.preventDefault();
      host.querySelector('#mta-who-forward').style.display = 'block';
      host.querySelector('#mta-who-student').style.display = 'none';
      e.target.style.display = 'none';
    });
    host.querySelector('#mta-who-anyway').addEventListener('click', function (e) {
      e.preventDefault(); renderSignIn();
    });
    host.querySelector('#mta-name-submit').addEventListener('click', submitName);
    host.querySelector('#mta-name-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitName();
    });
    host.querySelector('#mta-key-submit').addEventListener('click', submitKey);
    host.querySelector('#mta-key-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitKey();
    });
    host.querySelector('#mta-key-switch').addEventListener('click', function (e) {
      e.preventDefault(); restart();
    });
    host.querySelector('#mta-pending-switch').addEventListener('click', function (e) {
      e.preventDefault(); restart();
    });
    return host;
  }

  function pane(which) {
    ensureHost();
    ['who', 'signin', 'key', 'name', 'pending'].forEach(function (p) {
      host.querySelector('#mta-' + p).style.display = (p === which) ? 'block' : 'none';
    });
    host.style.display = 'flex';
  }

  function hide() {
    stopPoll();
    if (host) host.style.display = 'none';
  }

  function err(id, msg) {
    var el = host.querySelector(id);
    el.textContent = msg || '';
    el.style.color = '';           // back to the .key-error red
    el.style.display = msg ? 'block' : 'none';
  }

  // Same element, different meaning — "Checking…" is not a failure, and
  // rendering it in the error colour makes a working sign-in look broken.
  function status(id, msg) {
    var el = host.querySelector(id);
    el.textContent = msg || '';
    el.style.color = 'rgba(17,17,17,0.6)';
    el.style.display = msg ? 'block' : 'none';
  }

  /* Deliberately vague about WHY a key failed, with one exception. Telling
     a stranger apart from a student is the whole job here, and "that key
     exists but belongs to someone else" is a useful oracle for anyone
     guessing keys. The exception is email_mismatch, where the person
     almost certainly IS the right student signed in on the wrong Google
     account, and a vague error would just strand them. */
  function keyErrorMessage(code) {
    switch (code) {
      case 'email_mismatch':
        return 'This key is registered to a different email address. Sign in with that Google account, or ' + CONTACT + '.';
      case 'key_already_claimed':
        return 'This key has already been set up on another Google account. If that was not you, ' + CONTACT + '.';
      case 'claim_pending_other':
        return 'There is already a request waiting on this key. If that was not you, ' + CONTACT + '.';
      case 'invite_expired':
        return 'That invite link has expired or been replaced by a newer one. ' +
               'Ask Luca to send a fresh one, or enter your access key below.';
      case 'invite_used':
        return 'That invite has already been used to set up an account. If that was not you, ' + CONTACT + '.';
      case 'bad_token':
        return 'Your sign-in expired while you were typing. Reload the page and sign in again.';
      case 'busy_try_again':
        return 'The server is still finishing your last attempt — wait a moment and try again.';
      case 'network':
        return "Couldn't reach the server. Check your connection and try again, or " + CONTACT + '.';
      default:
        return "That key wasn't recognized. Double-check it, or " + CONTACT + '.';
    }
  }

  /* ═══ WHERE EVERY BACKEND AUTH ANSWER LANDS ═══ one place, so the three
     entry points (fresh sign-in, key claim, approval poll) cannot drift
     into behaving differently from one another. */
  function handle(data) {
    if (!data || !data.ok) {
      err('#mta-signin-error', keyErrorMessage(data && data.error));
      pane('signin');
      return;
    }
    if (data.pending) {
      wasPending = true;
      host.querySelector('#mta-pending-sub').textContent =
        'Your request is with Luca now. He gets it on his phone and usually approves within a few minutes — ' +
        'nothing on your account is visible to anyone until he does.';
      pane('pending');
      startPoll();
      return;
    }
    if (data.needsKey) {
      if (wasPending) {
        // The pending row was cleared while we were polling: declined.
        wasPending = false;
        pane('key');
        err('#mta-key-error', 'That request was not approved. ' +
          CONTACT.charAt(0).toUpperCase() + CONTACT.slice(1) + ' if you think that is a mistake.');
        return;
      }
      // Naming the account they are about to bind, right next to the key
      // box, is the last chance to catch a parent signing in as themselves
      // on a key meant for their child — the moment it is claimed, undoing
      // it needs Luca to reset the row.
      host.querySelector('#mta-key-sub').innerHTML =
        'Signed in as <b>' + escapeText(data.email || 'your Google account') + '</b>. ' +
        'One time only: enter the access key to link <i>this</i> account to the student&rsquo;s file. ' +
        '<b>Not the student?</b> <a href="#" id="mta-key-wrong">Switch account</a> first &mdash; ' +
        'the portal belongs to whoever signs in here.';
      var wrong = host.querySelector('#mta-key-wrong');
      if (wrong) wrong.addEventListener('click', function (e) { e.preventDefault(); restart(); });
      pane('key');
      err('#mta-key-error', '');
      host.querySelector('#mta-key-input').focus();
      return;
    }
    // A full student payload — we are in. The `key` check is not
    // ceremony: an { ok:true } answer that is none of the three cases
    // above means the backend and this file disagree about the protocol
    // (an old deployment answering a new client, most likely), and
    // handing that to the portal as a logged-in student would fail
    // somewhere much less obvious than here.
    if (!data.key || !data.session) {
      err('#mta-signin-error',
        'The portal reached the server but got an answer it did not understand. ' +
        'This usually means the backend needs redeploying — ' + CONTACT + '.');
      pane('signin');
      return;
    }
    session = data.session;
    writeStore(session);
    idToken = null;
    wasPending = false;

    /* The last surviving piece of the old name/email capture beat. Email
       now comes from the verified Google account, and so does the name
       WHEN Google has a usable one — this only fires when the roster cell
       is genuinely blank (see needsName in auth.gs). It runs here, before
       the handoff, because everything downstream — settle()'s greeting,
       the onboarding welcome, the guardian emails — assumes a real name. */
    if (data.needsName && !nameAsked) {
      nameAsked = true;
      host.querySelector('#mta-name-sub').textContent =
        'First and last, as you would write it on a test registration.';
      pane('name');
      err('#mta-name-error', '');
      host.querySelector('#mta-name-input').focus();
      return;
    }
    // If it STILL comes back needing a name after one round trip, the write
    // is failing somewhere we cannot see from here. Let them into the
    // portal rather than trapping them on a form that never accepts an
    // answer; a blank name is cosmetic, a locked-out student is not.

    hide();
    if (onStudent) onStudent(data);
  }

  function startPoll() {
    stopPoll();
    pollTimer = setInterval(function () {
      if (!idToken) { stopPoll(); return; }
      post({ action: 'claimStatus', idToken: idToken }).then(function (data) {
        // A network blip mid-wait is not an answer — keep waiting rather
        // than throwing the student back to a sign-in screen.
        if (!data || (!data.ok && data.error === 'network')) return;
        if (data.ok && data.pending) return;
        handle(data);
      });
    }, POLL_MS);
  }
  function stopPoll() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  function submitKey() {
    var input = host.querySelector('#mta-key-input');
    var btn = host.querySelector('#mta-key-submit');
    var key = input.value.trim().toUpperCase();
    if (!key) { err('#mta-key-error', keyErrorMessage()); return; }
    if (!idToken) {
      err('#mta-key-error', keyErrorMessage('bad_token'));
      return;
    }
    err('#mta-key-error', '');
    btn.disabled = true;
    btn.textContent = 'Checking…';
    post({ action: 'claimKey', idToken: idToken, key: key }).then(function (data) {
      btn.disabled = false;
      btn.textContent = 'Continue';
      if (!data || !data.ok) {
        err('#mta-key-error', keyErrorMessage(data && data.error));
        return;
      }
      handle(data);
    });
  }

  function submitName() {
    var input = host.querySelector('#mta-name-input');
    var btn = host.querySelector('#mta-name-submit');
    var name = input.value.trim().replace(/\s+/g, ' ');
    if (!name || name.indexOf(' ') === -1) {
      err('#mta-name-error', 'Please enter your full first and last name to continue.');
      return;
    }
    err('#mta-name-error', '');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    post({ action: 'setName', session: session, name: name }).then(function (data) {
      btn.disabled = false;
      btn.textContent = 'Continue';
      if (!data || !data.ok) {
        err('#mta-name-error', data && data.error === 'bad_name'
          ? 'Please enter your full first and last name to continue.'
          : keyErrorMessage(data && data.error));
        return;
      }
      handle(data);
    });
  }

  function restart() {
    stopPoll();
    idToken = null;
    session = null;
    wasPending = false;
    writeStore(null);
    try {
      if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    } catch (e) {}
    invite = null;
    host.querySelector('#mta-key-input').value = '';
    host.querySelector('#mta-name-input').value = '';
    nameAsked = false;
    err('#mta-key-error', '');
    err('#mta-name-error', '');
    err('#mta-signin-error', '');
    pane('signin');
  }

  /* ═══ GOOGLE IDENTITY SERVICES ═══ */
  function loadGsi() {
    return new Promise(function (resolve, reject) {
      if (window.google && google.accounts && google.accounts.id) return resolve();
      var s = document.createElement('script');
      s.src = GSI_SRC;
      s.async = true;
      s.defer = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('gsi_blocked')); };
      document.head.appendChild(s);
    });
  }

  function onCredential(response) {
    idToken = response && response.credential;
    if (!idToken) { err('#mta-signin-error', 'Google sign-in did not complete. Try again.'); return; }
    status('#mta-signin-error', 'Checking…');
    // An invite is a one-shot: if the claim fails (expired, superseded,
    // already used) we drop it and fall back to the ordinary sign-in, so
    // the student is never stuck on a dead link with no way forward.
    if (invite) {
      var used = invite;
      post({ action: 'claimInvite', idToken: idToken, invite: used }).then(function (data) {
        if (data && !data.ok && /^invite_/.test(data.error || '')) {
          invite = null;
          err('#mta-signin-error', keyErrorMessage(data.error));
          post({ action: 'googleAuth', idToken: idToken }).then(handle);
          return;
        }
        handle(data);
      });
      return;
    }
    post({ action: 'googleAuth', idToken: idToken }).then(handle);
  }

  function renderSignIn() {
    pane('signin');
    return loadGsi().then(function () {
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: onCredential,
        // No One Tap auto-select: this portal keeps its own session, and a
        // silent re-login on a shared family device is exactly the thing
        // this whole change exists to stop being automatic.
        auto_select: false,
        cancel_on_tap_outside: true
      });
      var target = host.querySelector('#mta-gbtn');
      target.innerHTML = '';
      google.accounts.id.renderButton(target, {
        theme: 'outline', size: 'large', text: 'signin_with',
        shape: 'rectangular', logo_alignment: 'left', width: 280
      });
    }).catch(function () {
      err('#mta-signin-error',
        "Google's sign-in script could not load — an ad blocker, a content blocker or a school network filter is the usual cause. " +
        'Try another browser or turn the blocker off for this site, or ' + CONTACT + '.');
    });
  }

  /* ═══ ENTRY POINT ═══ called once by index.html instead of showing the
     old key screen. Resumes an existing session silently when there is
     one, so a returning student never sees a login at all. */
  function start(opts) {
    onStudent = (opts && opts.onStudent) || function () {};
    installFetchWrapper();
    ensureHost();

    invite = takeInviteFromUrl();
    // An invite arriving on a device that is ALREADY signed in as someone
    // else is the shared-family-laptop case. Resuming the old session would
    // silently swallow the invite; the who-pane lets the new student take
    // over the tab instead.
    if (invite) {
      session = null;
      pane('who');
      return Promise.resolve();
    }

    var stored = readStore();
    if (!stored) return renderSignIn();

    session = stored;
    return post({ action: 'resume', session: stored }).then(function (data) {
      if (data && data.ok && data.key) { handle(data); return; }
      // Expired, revoked, or unpaired in admin. Not an error worth showing
      // — it is simply time to sign in again.
      session = null;
      writeStore(null);
      return renderSignIn();
    });
  }

  function signOut() {
    session = null;
    writeStore(null);
    try {
      if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    } catch (e) {}
  }

  installFetchWrapper();

  return {
    start: start,
    signOut: signOut,
    session: function () { return session; },
    isSignedIn: function () { return !!session; }
  };
})();
