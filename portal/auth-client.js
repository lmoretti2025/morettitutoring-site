/* =========================================================================
   MORETTI STUDENT PORTAL — SIGN-IN (front end)
   -------------------------------------------------------------------------
   A separate file on purpose: it drops into portal/index.html with one
   <script> tag and two small edits (see portal/AUTH_INTEGRATION.md).

   A verified Google identity is the credential. The access key is only a
   ONE-TIME CLAIM CODE that pairs an account to a roster row.

   WHAT IT OWNS.
     - A full-screen sign-in surface, injected at runtime and built from
       index.html's EXISTING classes (.panel, .kicker, .panel-hed, .key-input,
       .key-btn, .key-error, .key-help), so it needs no second stylesheet
       and touches no existing element.
     - The session token: stored in localStorage, sent on every backend
       call, and traded for a fresh one on each page load.
     - The pending-approval wait, including the poll that lets a student in
       as soon as Luca approves.

   THE fetch() WRAPPER. Many call sites in index.html post to the backend,
   some via postToBackend() and some via bare fetch(), and all need the
   session token. Rather than edit each one (a missed one breaks silently),
   this wraps window.fetch once. It is narrow: backend URL only, POST only,
   JSON body only, and it never touches a request that already carries a
   session or an adminKey.
   ========================================================================= */

window.MorettiAuth = (function () {
  'use strict';

  /* ═══ SET THIS — the same OAuth Web client ID as auth.gs ═══
     Not a secret; it is public by design. The backend checks every ID token
     was issued for this client id (verifyGoogleIdToken_ in auth.gs), so a
     token minted for another site cannot be replayed here. */
  var CLIENT_ID = '742313412130-kck7ihjd9el1kolac0hnmep3h1b2vbrh.apps.googleusercontent.com';

  var STORE = 'moretti_session';
  var GSI_SRC = 'https://accounts.google.com/gsi/client';
  var POLL_MS = 4000;
  var CONTACT = 'text Luca at (201) 275-2791';
  var GSI_TIMEOUT_MS = 12000;

  /* Google Identity Services refuses to run in embedded browsers (links
     tapped inside Gmail, Instagram, WhatsApp, Messenger): Google answers
     `disallowed_useragent`, sign-in never opens, and no request reaches the
     server.

     ADVISORY, NEVER BLOCKING. User-agent sniffing is wrong both ways (iOS
     SFSafariViewController has no Safari token yet signs in fine), so this
     only adds a note; the Google button stays underneath it. */
  function inAppBrowserName() {
    var ua = navigator.userAgent || '';
    if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'Facebook';
    if (/Instagram/i.test(ua)) return 'Instagram';
    if (/Messenger/i.test(ua)) return 'Messenger';
    if (/WhatsApp/i.test(ua)) return 'WhatsApp';
    if (/Snapchat/i.test(ua)) return 'Snapchat';
    if (/TikTok|musical_ly/i.test(ua)) return 'TikTok';
    if (/\bLine\//i.test(ua)) return 'LINE';
    if (/GSA\//.test(ua)) return 'the Google app';
    if (/;\s*wv\)/.test(ua)) return 'an in-app browser';          // Android WebView
    if (/(iPhone|iPod|iPad)/.test(ua) && /AppleWebKit/.test(ua)
        && !/Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)) return 'an in-app browser';
    return null;
  }

  /* The key an invite token is for, read WITHOUT verifying it -- the server
     still checks the signature on every call. Used only to decide whether a
     session already on this device belongs to the same student the link is
     for, so nothing security-relevant rests on it. */
  function inviteKeyOf(token) {
    try {
      var body = String(token).split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
      while (body.length % 4) body += '=';
      var p = JSON.parse(decodeURIComponent(escape(atob(body))));
      return String(p.k || '').toUpperCase() || null;
    } catch (e) { return null; }
  }

  var session = null;
  var idToken = null;      // held only for the duration of a sign-in attempt
  var onStudent = null;
  /* Used when the fast path ALREADY painted from cache and the resume
     returns something different: hands the fresh payload to the portal
     instead of re-entering it via onStudent. See the paint-first block in
     start(). */
  var onRefresh = null;
  var pollTimer = null;
  var wasPending = false;  // so a claim that gets DECLINED reads as declined, not as "enter a key"
  var nameAsked = false;   // one ask only — see the needsName branch in handle()
  /* ═══ MODAL MODE ═══ set by the marketing site (index.html) before this
     file loads:  window.MORETTI_AUTH_MODE = 'modal'.

     Same flow, different frame. On the portal this file paints an opaque
     surface, wraps fetch, and hides the red nav until a student is in. On
     the home page it is a dialog over a working public page, where all
     three would be wrong (the wrapper would catch the lead form's POSTs).
     So each is gated on this; panes, backend calls and session are the
     same. */
  var MODAL = false;
  try { MODAL = (window.MORETTI_AUTH_MODE === 'modal'); } catch (e) {}

  /* Every animation below is skipped when the device asks for less motion.
     Read once: this is a preference, not a state to poll. */
  var REDUCE = false;
  try {
    REDUCE = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var host = null;
  var invite = null;       // the ?invite= token, if this visit came from an invite email
  var resumedStudent = null; // a live session already on this device, when it belongs to the invited student

  function backendUrl() { return window.APPS_SCRIPT_URL || ''; }

  /* Pulls ?invite=… from the URL and removes it from the address bar. The
     token is live until claimed, and leaving it in the URL leaks it into
     history, bookmarks and Referer headers. replaceState avoids a reload. */
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

  /* index.html's own sessionStorage snapshot. Named here because a dead
     session has to clear BOTH: that snapshot is what makes index.html skip
     MorettiAuth.start() after a refresh, so leaving it behind would restore
     the student into a portal whose every request is refused. */
  /* "Stay signed in" is the student's per-device, opt-in choice. It turns on
     One Tap auto-select, the only way back in without a chooser once the
     30-day session lapses or in another browser.

     Off by default (see renderSignIn) because a silent re-login on a shared
     family laptop is what this login system exists to prevent. */
  var pendingStayData = null;
  var STAY = 'moretti_stay_signed_in';
  var STAY_SNOOZE = 'moretti_stay_snooze';
  function staySignedIn() {
    try { return localStorage.getItem(STAY) === '1'; } catch (e) { return false; }
  }
  function shouldOfferStay() {
    try {
      if (localStorage.getItem(STAY)) return false;         // already answered
      var until = Number(localStorage.getItem(STAY_SNOOZE) || 0);
      return !(until && Date.now() < until);
    } catch (e) { return false; }
  }

  /* ═══ LAST-KNOWN STUDENT ═══
     restoreState() in index.html only survives a same-tab refresh. This
     keeps the same payload where it outlives the tab, so the portal paints
     immediately and the resume round trip (~1.2s warm, 5-6s cold) becomes a
     background check instead of a gate. Deliberately WITHOUT the session
     token, which already lives under STORE. */
  var STUDENT_CACHE = 'moretti_last_student';
  // Well inside the session's own 30-day life, so the cache can never be
  // the reason a student is let in.
  var STUDENT_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

  function writeStudentCache(data) {
    try {
      if (!data || !data.key) return;
      var copy = {}, k;
      for (k in data) if (Object.prototype.hasOwnProperty.call(data, k) && k !== 'session') copy[k] = data[k];
      copy.__cachedAt = Date.now();
      localStorage.setItem(STUDENT_CACHE, JSON.stringify(copy));
      /* Every path that ends with a real student (sign-in, resume,
         paint-from-cache) passes here, so this is the heartbeat's hook. If a
         private-mode failure above skips it, the boot check at the foot of
         this file starts the heartbeat instead. */
      startHeartbeat();
    } catch (e) { /* private browsing — the slow path still works */ }
  }
  function readStudentCache() {
    try {
      var raw = localStorage.getItem(STUDENT_CACHE);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.key) return null;
      if (!d.__cachedAt || (Date.now() - d.__cachedAt) > STUDENT_CACHE_MAX_AGE_MS) return null;
      return d;
    } catch (e) { return null; }
  }
  function clearStudentCache() {
    try { localStorage.removeItem(STUDENT_CACHE); } catch (e) {}
  }

  var PORTAL_STATE = 'moretti_portal_state';
  var SIGNED_OUT = 'mta_signed_out';

  /* THE BACKEND SAYS THIS SESSION IS OVER (`session_revoked`, e.g. after
     Reset login). Refreshing alone cannot recover: the portal restores from
     sessionStorage and skips start(). One reload with both stores cleared
     returns the student to the sign-in screen with a reason. */
  var sessionDead = false;
  function onSessionDead() {
    if (sessionDead) return;
    sessionDead = true;
    stopHeartbeat();
    session = null;
    writeStore(null);
    clearStudentCache();
    try { sessionStorage.removeItem(PORTAL_STATE); } catch (e) {}
    try { sessionStorage.setItem(SIGNED_OUT, 'revoked'); } catch (e) {}
    try { window.location.reload(); } catch (e) {}
  }

  /* ═══ PRESENCE HEARTBEAT ═══
     While its tab is visible, the portal pings once a minute. The backend
     turns that into the online dot in admin.html and one AuthLog row per
     visit (see the PRESENCE block in auth.gs). Nothing else fires once a
     student is in, so without it there is no "on it now" signal.

     WHAT IT IS NOT:
       Not credentialled by the fetch wrapper: the session is attached here,
       so a failed ping can never reload the page mid-exam. Revocation is
       still handled explicitly, below.
       Not sent by a hidden tab: a forgotten background tab is not a
       student using the site.
       Not sent in modal mode on the home page, where there is no portal. */
  var PING_MS = 60000;
  var pingTimer = null;
  var lastPingAt = 0;
  var activity = '';         // set by the portal's own screen switcher

  /* What the log will say they were doing. The portal passes a screen id
     through setActivity(); anything else falls back to the page, which is
     what the smaller portal pages (vocab, math review, a report) get. */
  var SCREEN_LABELS = {
    'screen-menu': 'Home',
    'screen-onboard': 'Getting set up',
    'screen-settings': 'Settings',
    'screen-calendar': 'Calendar',
    'screen-resources': 'Resources',
    'screen-sat-resources': 'SAT resources',
    'screen-incorrect-questions': 'Incorrect questions',
    'screen-challenge-questions': 'Challenge questions',
    'screen-question-bank': 'Question bank',
    'screen-practice-tests': 'Practice tests',
    'screen-vocab': 'Vocab',
    'screen-test-overview': 'Test overview',
    'screen-intro': 'Starting a test',
    'dx-screen': 'Taking a test',
    'dx-module-over-screen': 'Between modules',
    'dx-break-screen': 'On a break',
    'screen-done': 'Finished a test'
  };
  function pageLabel() {
    var path = '';
    try { path = String(window.location.pathname || ''); } catch (e) {}
    var file = path.split('/').pop();
    if (!file || file === 'index.html') return 'The portal';
    return file.replace(/\.html?$/, '').replace(/[-_]/g, ' ')
               .replace(/^./, function (c) { return c.toUpperCase(); });
  }
  function whereLabel() {
    if (activity && SCREEN_LABELS[activity]) return SCREEN_LABELS[activity];
    if (activity) return activity;
    return pageLabel();
  }

  function ping(force) {
    var tok = session || readStore();
    if (!tok || sessionDead || MODAL) return;
    try { if (document.hidden && !force) return; } catch (e) {}
    var now = Date.now();
    // A visibility change and the timer landing together must not send two.
    if (!force && (now - lastPingAt) < (PING_MS - 5000)) return;
    lastPingAt = now;
    post({ action: 'ping', session: tok, where: whereLabel() }).then(function (data) {
      /* The one thing a ping acts on. An idle tab makes no requests for the
         fetch wrapper to catch, so this gives "Reset login" a worst case of
         one minute. 'network' is ignored: a lost hop is not a revocation. */
      if (data && data.ok === false &&
          (data.error === 'unauthorized' || data.error === 'session_revoked')) {
        stopHeartbeat();
        onSessionDead();
      }
    }, function () { /* offline; the next beat tries again */ });
  }

  var heartbeatOn = false, visibilityBound = false;
  function startHeartbeat() {
    if (heartbeatOn || MODAL) return;
    heartbeatOn = true;
    pingTimer = setInterval(function () { ping(false); }, PING_MS);
    if (!visibilityBound) {
      visibilityBound = true;
      try {
        // Coming back to the tab is itself the news -- send at once rather
        // than leaving them offline for up to a minute after they return.
        document.addEventListener('visibilitychange', function () {
          if (!document.hidden) ping(true);
        });
      } catch (e) {}
    }
    ping(true);
  }
  function stopHeartbeat() {
    heartbeatOn = false;
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
  }

  /* ═══ THE ONE PLACE EVERY BACKEND CALL PICKS UP ITS SESSION ═══
     See the file header for why this is a wrapper. Scoped tightly: POSTs to
     the backend URL only, JSON bodies with an `action` only, and never a
     request with its own credentials (adminKey: admin.html and
     math-review.html authenticate as Luca). */
  function installFetchWrapper() {
    if (typeof window.fetch !== 'function' || window.__mtaFetchWrapped) return;
    var original = window.fetch;
    window.fetch = function (input, init) {
      var credentialled = false;
      try {
        var url = (typeof input === 'string') ? input : (input && input.url);
        var base = backendUrl();
        /* Fall back to the STORED token: `session` is only set by
           handle()/start(), and index.html skips start() when restoreState()
           restores the student after a same-tab refresh (which mobile
           browsers do on their own). Without this, those requests go out
           with no session and come back `unauthorized`. */
        var tok = session || readStore();
        if (tok && base && url && String(url).indexOf(base) === 0 &&
            init && init.body && typeof init.body === 'string' &&
            String(init.method || '').toUpperCase() === 'POST') {
          var payload = JSON.parse(init.body);
          if (payload && payload.action && !payload.adminKey && !payload.session) {
            payload.session = tok;
            // Copied, never mutated: callers reuse their init objects (e.g.
            // markDiagnosticTaken's retry).
            var next = {};
            for (var k in init) if (Object.prototype.hasOwnProperty.call(init, k)) next[k] = init[k];
            next.body = JSON.stringify(payload);
            init = next;
            credentialled = true;
          }
        }
      } catch (e) { /* not our request, or not JSON — pass it through untouched */ }
      var out = original.call(this, input, init);
      /* Only for calls we credentialled: read a COPY so the caller still gets
         an untouched, unread body. Any failure here is ignored -- this is a
         safety net, never the reason a request breaks. */
      if (credentialled) {
        try {
          out.then(function (r) {
            try {
              r.clone().json().then(function (d) {
                if (d && d.ok === false &&
                    (d.error === 'session_revoked' || d.error === 'unauthorized')) onSessionDead();
              }, function () {});
            } catch (e) {}
            return r;
          }, function () {});
        } catch (e) {}
      }
      return out;
    };
    window.__mtaFetchWrapped = true;
  }

  /* Apps Script answers a POST with a redirect to its "echo" host, and that
     hop sometimes fails (a 404, or HTML instead of JSON) even though the
     script ran. Measured: ~1.2s warm, 5-6s cold, occasionally lost.

     Retried: `resume` and `googleAuth`. Both are safe to repeat: resume only
     reads, and googleAuth's write path is idempotent and lock-guarded
     (ensureFolderAndGrant_ only writes cells that are still empty).

     NOT retried: claimInvite, which consumes a single-use nonce. Its caller
     recovers from a lost claim by falling through to googleAuth. */
  var RETRY_ACTIONS = { resume: true, googleAuth: true };

  /* Does this reply answer the question? A whitelist of documented shapes,
     NOT "has a key": googleAuth answers a new student with { ok:true,
     pending:true } or { ok:true, needsKey:true }, and retrying those as lost
     answers would fail a first-time student with a network error. */
  function isAuthAnswer(data) {
    if (!data || data.ok !== true) return false;
    return ('key' in data) || data.pending === true || data.needsKey === true || data.needsEmail === true;
  }
  var POST_TIMEOUT_MS = 20000;
  var POST_MAX_ATTEMPTS = 3;

  function post(payload, attempt) {
    attempt = attempt || 0;
    var field = RETRY_ACTIONS[payload && payload.action];
    var canRetry = !!field && attempt < (POST_MAX_ATTEMPTS - 1);
    function again() {
      // Backoff with jitter: a cold start needs a moment, and three clients
      // retrying in lockstep is its own small stampede.
      var wait = 700 * Math.pow(2, attempt) + Math.floor(Math.random() * 400);
      return new Promise(function (r) { setTimeout(r, wait); })
        .then(function () { return post(payload, attempt + 1); });
    }
    /* Without a timeout, a hop that never answers leaves the promise
       pending for the browser's multi-minute default. */
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, POST_TIMEOUT_MS);
    var opts = { method: 'POST', body: JSON.stringify(payload) };
    if (ctrl) opts.signal = ctrl.signal;
    return fetch(backendUrl(), opts)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        clearTimeout(timer);
        // A stalling deployment answering a POST with its GET health reply
        // ({ok:true, message}) -- an answer, but not the one we asked for.
        if (field && data && data.ok === true && !isAuthAnswer(data)) {
          return canRetry ? again() : { ok: false, error: 'network' };
        }
        return data;
      }, function () {
        clearTimeout(timer);
        return canRetry ? again() : { ok: false, error: 'network' };
      });
  }

  /* ═══ PRE-FLIGHT RESUME ═══
     Fires the resume round trip (~1.2s warm, 5-6s cold) as soon as this
     file runs, overlapping it with index.html's download and parse instead
     of waiting for start(). backend-url.js loads before this file, so the
     URL is known. Skipped when there is no saved session. */
  var preflightResume = null, preflightToken = null;
  try {
    var preTok = readStore();
    if (preTok && backendUrl()) {
      preflightToken = preTok;
      preflightResume = post({ action: 'resume', session: preTok });
    }
  } catch (e) { preflightResume = null; preflightToken = null; }

  // The in-flight pre-flight if it was for this exact token, otherwise a
  // fresh request. Consumed once: a second caller must ask again rather
  // than re-read an answer that is by then old.
  function resumeRequest(token) {
    if (preflightResume && preflightToken === token) {
      var p = preflightResume;
      preflightResume = null; preflightToken = null;
      return p;
    }
    return post({ action: 'resume', session: token });
  }

  /* The card chrome, the ONLY CSS this file ships: a muted outer shell
     holding a white inner panel. Everything inside uses index.html's own
     classes (see the file header). Scoped to #mta-auth. */
  function injectCardStyles() {
    if (document.getElementById('mta-auth-css')) return;
    var st = document.createElement('style');
    st.id = 'mta-auth-css';
    st.textContent =
      '#mta-auth .panel{max-width:420px;}' +
      '#mta-auth .mta-card{background:#eae6e0;border:1px solid var(--border,rgba(17,17,17,0.12));' +
        'border-radius:28px;padding:8px;box-shadow:0 18px 44px rgba(17,17,17,0.08);}' +
      '#mta-auth .mta-card-inner{background:var(--white,#fff);border-radius:22px;' +
        'padding:2.25rem 1.6rem 1.9rem;box-shadow:0 2px 4px rgba(17,17,17,0.10);}' +
      '#mta-auth .mta-card-foot{padding:0.95rem 1rem 0.55rem;text-align:center;' +
        'font-size:0.74rem;line-height:1.7;color:var(--faint,rgba(17,17,17,0.28));}' +
      '#mta-auth .kicker{margin-bottom:0.9rem;}' +
      '#mta-auth .panel-sub{margin-bottom:1.5rem;}' +
      '#mta-auth .key-help{margin-top:1.1rem;}' +
      '#mta-auth .key-btn{border-radius:10px;}' +
      '#mta-auth .key-input{border-radius:10px;}' +
      '@media (max-width:420px){#mta-auth .mta-card-inner{padding:1.9rem 1.1rem 1.5rem;}}' +

      /* MODAL ONLY. The home page lacks index.html's classes, so the dialog
         brings its own, scoped to .mta-modal so the portal's are never
         overridden. */
      /* index-v2.html's modal easing (--ease for the backdrop, --springy for
         the card), so the dialog moves like the rest of the redesign. */
      '#mta-auth.mta-modal{backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);' +
        'animation:mta-fade .35s cubic-bezier(.22,1,.36,1) both;}' +
      '@keyframes mta-fade{from{opacity:0;}to{opacity:1;}}' +
      '#mta-auth.mta-modal .mta-card{animation:mta-rise .5s cubic-bezier(.16,1.2,.3,1) both;}' +
      '@keyframes mta-rise{from{opacity:0;transform:translateY(20px) scale(.97);}' +
        'to{opacity:1;transform:none;}}' +
      // One pane replacing another inside the card (see pane()).
      '@keyframes mta-pane-in{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}' +
      // Closing: the reverse, short enough not to be in the way.
      '#mta-auth.mta-modal.mta-closing{animation:mta-fade .18s ease-in reverse both;}' +
      '#mta-auth.mta-modal.mta-closing .mta-card{animation:mta-rise .18s ease-in reverse both;}' +
      '#mta-auth.mta-modal .mta-card-inner{position:relative;}' +
      '#mta-auth.mta-modal .mta-close{position:absolute;top:0.5rem;right:0.6rem;width:32px;height:32px;' +
        'border:none;background:none;font-size:1.5rem;line-height:1;cursor:pointer;' +
        'color:rgba(17,17,17,0.35);padding:0;}' +
      '#mta-auth.mta-modal .mta-close:hover{color:rgba(17,17,17,0.7);}' +
      '#mta-auth.mta-modal .panel{font-family:var(--hel,\'Poppins\',Helvetica,Arial,sans-serif);}' +
      '#mta-auth.mta-modal .kicker{display:flex;align-items:center;justify-content:center;gap:0.45rem;' +
        'font-size:0.58rem;font-weight:600;letter-spacing:0.24em;text-transform:uppercase;' +
        'color:var(--red,#B0271C);}' +
      '#mta-auth.mta-modal .kicker::before{content:\'\\25C6\';font-size:0.4rem;}' +
      '#mta-auth.mta-modal .panel-hed{font-family:var(--display,Georgia,serif);font-weight:700;' +
        'font-size:clamp(1.5rem,3vw,2rem);line-height:1.3;color:var(--text,#111);margin:0 0 0.75rem;}' +
      '#mta-auth.mta-modal .panel-sub{font-size:0.88rem;line-height:1.75;' +
        'color:var(--mid,rgba(17,17,17,0.58));margin:0 0 1.5rem;}' +
      '#mta-auth.mta-modal .key-input{width:100%;font-family:inherit;font-size:1rem;letter-spacing:0.06em;' +
        'text-align:center;text-transform:uppercase;padding:1.05rem 1.2rem;border-radius:10px;' +
        'border:1px solid var(--border,rgba(17,17,17,0.12));background:#fff;color:var(--text,#111);' +
        'margin-bottom:1rem;}' +
      '#mta-auth.mta-modal .key-input:focus{outline:none;border-color:var(--red,#B0271C);}' +
      '#mta-auth.mta-modal .key-btn{display:block;width:100%;background:var(--red,#B0271C);color:#fff;' +
        'font-family:inherit;font-size:0.78rem;font-weight:700;letter-spacing:0.14em;' +
        'text-transform:uppercase;padding:1.05rem;border:none;border-radius:10px;cursor:pointer;}' +
      '#mta-auth.mta-modal .key-btn:hover{opacity:0.86;}' +
      '#mta-auth.mta-modal .mta-stay-secondary{background:transparent;color:var(--mid,rgba(17,17,17,0.58));' +
        'border:1px solid var(--border,rgba(17,17,17,0.12));}' +
      '#mta-auth.mta-modal .mta-stay-row{display:flex;gap:0.7rem;}' +
      '#mta-auth.mta-modal .mta-stay-list{list-style:none;margin:0 0 1.6rem;padding:0;text-align:left;' +
        'display:flex;flex-direction:column;gap:0.6rem;font-size:0.86rem;' +
        'color:var(--mid,rgba(17,17,17,0.58));}' +
      '#mta-auth.mta-modal .key-error{display:none;font-size:0.78rem;color:var(--red,#B0271C);' +
        'margin:0 0 1rem;line-height:1.6;}' +
      '#mta-auth.mta-modal .key-help{font-size:0.75rem;line-height:1.7;' +
        'color:var(--faint,rgba(17,17,17,0.28));}' +
      '#mta-auth.mta-modal .key-help a,#mta-auth.mta-modal .panel-sub a{color:var(--red,#B0271C);}' +

      /* Nothing above is load-bearing: every pane is already in its final
         position before its animation runs, so removing the motion removes
         only the motion. */
      '@media (prefers-reduced-motion:reduce){' +
        '#mta-auth .mta-card,#mta-auth.mta-modal,#mta-auth.mta-modal .mta-card,' +
        '#mta-auth .mta-card-inner>div{animation:none!important;transition:none!important;}}';
    document.head.appendChild(st);
  }

  /* ═══ THE SIGN-IN SURFACE ═══ built, not marked up — see the file header.
     One container, three panes, only one visible at a time. */
  function ensureHost() {
    if (host) return host;
    host = document.createElement('div');
    host.id = 'mta-auth';
    host.setAttribute('style',
      'position:fixed;inset:0;z-index:9000;display:flex;align-items:center;' +
      'justify-content:center;padding:2rem 1.25rem;overflow-y:auto;background:' +
      (MODAL ? 'rgba(17,17,17,0.55)' : 'var(--bg,#f2f2f2)') + ';');
    if (MODAL) {
      host.className = 'mta-modal';
      host.setAttribute('role', 'dialog');
      host.setAttribute('aria-modal', 'true');
      host.setAttribute('aria-label', 'Student sign-in');
    }
    injectCardStyles();
    host.innerHTML =
      '<div class="panel" style="text-align:center;">' +
       '<div class="mta-card">' +
        '<div class="mta-card-inner">' +
        (MODAL ? '<button type="button" id="mta-close" class="mta-close" ' +
          'aria-label="Close sign-in">&times;</button>' : '') +
        '<div class="kicker">Student Portal</div>' +

        /* An invite link opened on a device already signed in AS THE SAME
           STUDENT, the common case since the invite is often the only URL
           the family kept. Reuse the session rather than forcing a fresh
           Google sign-in, which may be blocked (see inAppBrowserName). */
        '<div id="mta-continue" style="display:none;">' +
          '<h1 class="panel-hed">You&rsquo;re already set up</h1>' +
          '<p class="panel-sub">This device is signed in as <b id="mta-continue-who"></b>. ' +
            'That invite link was one-time and has already been used &mdash; you don&rsquo;t need it again.</p>' +
          '<button class="key-btn" id="mta-continue-go">Continue to the portal</button>' +
          '<p class="key-help" style="margin-top:1rem;">From now on just open ' +
            '<b>morettitutoring.com/portal</b> &mdash; worth bookmarking.</p>' +
          '<p class="key-help"><a href="#" id="mta-continue-other">This isn&rsquo;t me &mdash; sign in as someone else</a></p>' +
        '</div>' +

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

        /* Offered once, AFTER a student is already in, so it is never
           standing between them and the portal on a first visit. */
        '<div id="mta-stay" style="display:none;">' +
          '<h1 class="panel-hed">Stay signed in on this device?</h1>' +
          '<p class="panel-sub">Next time you open the portal it will just open, instead of asking you to sign in again.</p>' +
          '<ul class="mta-stay-list">' +
            '<li>Only on this device.</li>' +
            '<li>You can sign out whenever you want.</li>' +
            '<li>Say no if this is a shared or family computer.</li>' +
          '</ul>' +
          '<div class="mta-stay-row">' +
            '<button class="key-btn" id="mta-stay-yes" type="button">Stay signed in</button>' +
            '<button class="key-btn mta-stay-secondary" id="mta-stay-no" type="button">Not now</button>' +
          '</div>' +
          '<p class="key-help"><a href="#" id="mta-stay-never">Don\'t ask again</a></p>' +
        '</div>' +

        '</div>' +
        /* Outside the white card, on the muted band -- the one line that is
           true on every pane, so it never has to be repeated inside them. */
        '<div class="mta-card-foot">Stuck? ' +
          CONTACT.charAt(0).toUpperCase() + CONTACT.slice(1) + '.</div>' +
       '</div>' +
      '</div>';
    document.body.appendChild(host);

    /* Answering any of the three hands the student straight on to the
       portal -- the offer never costs them a second click to get in. */
    function answerStay(choice) {
      try {
        if (choice === 'yes') localStorage.setItem(STAY, '1');
        else if (choice === 'never') localStorage.setItem(STAY, '0');
        else localStorage.setItem(STAY_SNOOZE, String(Date.now() + 30 * 24 * 3600 * 1000));
      } catch (e) {}
      var data = pendingStayData;
      pendingStayData = null;
      // Second handoff into the portal, bypassing handle()'s tail, so the
      // cache must be written here too or the next visit loses the fast path.
      writeStudentCache(data);
      hide();
      if (data) onStudent(data);
    }
    host.querySelector('#mta-stay-yes').addEventListener('click', function () { answerStay('yes'); });
    host.querySelector('#mta-stay-no').addEventListener('click', function () { answerStay('later'); });
    host.querySelector('#mta-stay-never').addEventListener('click', function (e) { e.preventDefault(); answerStay('never'); });

    host.querySelector('#mta-continue-go').addEventListener('click', function () {
      if (resumedStudent) { invite = null; handle(resumedStudent); }
    });
    host.querySelector('#mta-continue-other').addEventListener('click', function (e) {
      e.preventDefault();
      // Genuinely a different person on a shared device: drop the resumed
      // session and fall back to the original who-are-you flow.
      resumedStudent = null; session = null; writeStore(null);
      pane('who');
    });
    /* A dialog over a working page has to be leaveable -- the close button,
       the backdrop and Escape all mean the same thing. On the portal there
       is nothing behind it to go back to, so none of this is wired up. */
    if (MODAL) {
      host.querySelector('#mta-close').addEventListener('click', closeModal);
      host.addEventListener('click', function (e) { if (e.target === host) closeModal(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && host && host.style.display !== 'none') closeModal();
        else trapFocus(e);
      });
    }

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

  /* ═══ ONE PANE TO THE NEXT ═══ the panes share one card, and a plain
     display swap makes it snap to the new height. So: measure, swap,
     measure, and animate the height while the incoming pane fades up. Pure
     decoration: the synchronous display swap still decides what is on
     screen. Skipped under prefers-reduced-motion. */
  var paneAnim = null;
  function pane(which) {
    ensureHost();
    var card = host.querySelector('.mta-card-inner');
    var from = (!REDUCE && host.style.display !== 'none' && card) ? card.offsetHeight : 0;

    ['continue', 'who', 'signin', 'key', 'name', 'pending', 'stay'].forEach(function (p) {
      host.querySelector('#mta-' + p).style.display = (p === which) ? 'block' : 'none';
    });
    host.style.display = 'flex';

    if (from) {
      if (paneAnim) { clearTimeout(paneAnim); paneAnim = null; }
      card.style.height = 'auto';
      var to = card.offsetHeight;
      if (to !== from) {
        card.style.overflow = 'hidden';
        card.style.height = from + 'px';
        card.getBoundingClientRect();                 // commit the start height
        card.style.transition = 'height .38s cubic-bezier(.16,1,.3,1)';
        card.style.height = to + 'px';
      }
      /* Cleared on a timer, not transitionend: a transition may never fire
         (identical heights, an interrupted swap), and the card must not stay
         pinned to a stale height while its content can still change. */
      paneAnim = setTimeout(function () {
        card.style.transition = ''; card.style.height = ''; card.style.overflow = '';
        paneAnim = null;
      }, 420);
      var el = host.querySelector('#mta-' + which);
      el.style.animation = 'none';
      el.getBoundingClientRect();
      el.style.animation = 'mta-pane-in .34s cubic-bezier(.16,1,.3,1) both';
    }
  }

  /* Close the dialog: stop the 4s backend poll and remove the scroll
     lock. The session is untouched; closing means "not now", not sign
     out. */
  function closeModal() {
    stopPoll();
    if (REDUCE || !host) { hide(); return; }
    /* Let it fall away rather than blink out. hide() is still what actually
       ends it -- the class only buys the 180ms of animation before it. */
    host.classList.add('mta-closing');
    setTimeout(function () {
      if (host) host.classList.remove('mta-closing');
      hide();
    }, 180);
  }

  /* ═══ THE HOME-PAGE ENTRY POINT ═══ opens the same sign-in as a dialog.
     Not start(), which is the portal's boot sequence; here the caller's
     onStudent sends the student to the portal. */
  var returnFocusTo = null;
  function openSignIn(opts) {
    onStudent = (opts && opts.onStudent) || function () {};
    ensureHost();
    invite = takeInviteFromUrl();
    try { document.documentElement.style.overflow = 'hidden'; } catch (e) {}
    /* Whatever was clicked to open this gets the focus back when it closes,
       so a keyboard visitor is returned to the link they were on rather than
       to the top of the page. */
    try { returnFocusTo = document.activeElement; } catch (e) { returnFocusTo = null; }
    var p = Promise.resolve(renderSignIn());
    try { host.querySelector('#mta-close').focus(); } catch (e) {}
    return p;
  }

  // Tab must not walk out of a modal dialog into the page behind it.
  function trapFocus(e) {
    if (e.key !== 'Tab' || !host || host.style.display === 'none') return;
    var f = host.querySelectorAll('a[href], button:not([disabled]), input, iframe, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function hide() {
    stopPoll();
    if (host) host.style.display = 'none';
    if (MODAL) {
      try { document.documentElement.style.overflow = ''; } catch (e) {}
      try { if (returnFocusTo && returnFocusTo.focus) returnFocusTo.focus(); } catch (e) {}
      returnFocusTo = null;
    }
    // Handing off to the portal: give the page its chrome back and let
    // index.html's own onboarding take over hiding it if it wants to.
    document.documentElement.classList.remove('mta-auth-pending');
  }

  function err(id, msg) {
    // ensureHost() rather than trusting `host`: a null host would throw
    // inside the handler that exists to report a failure.
    var el = ensureHost().querySelector(id);
    el.textContent = msg || '';
    el.style.color = '';           // back to the .key-error red
    el.style.display = msg ? 'block' : 'none';
  }

  // Same element, different meaning — "Checking…" is not a failure, and
  // rendering it in the error colour makes a working sign-in look broken.
  function status(id, msg) {
    var el = ensureHost().querySelector(id);
    el.textContent = msg || '';
    el.style.color = 'rgba(17,17,17,0.6)';
    el.style.display = msg ? 'block' : 'none';
  }

  /* Deliberately vague about WHY a key failed: "that key belongs to someone
     else" is a useful oracle for anyone guessing keys. The exception is
     email_mismatch, where the person is almost certainly the right student
     on the wrong Google account. */
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
      // Raised by the request guard when the pairing behind a token is gone
      // (a Reset login, or the row re-issued to someone else). Retrying is
      // hopeless; signing in again is not.
      case 'session_revoked':
      case 'unauthorized':
        return 'Your sign-in is no longer valid \u2014 reload the page and sign in again, or ' + CONTACT + '.';
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
      // Name the account about to be bound next to the key box: the last
      // chance to catch a parent claiming a child's key as themselves, since
      // undoing a claim needs Luca to reset the row.
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
    // A full student payload: we are in. An { ok:true } answer that fits none
    // of the cases above means the backend and this file disagree on the
    // protocol (likely an old deployment), so fail visibly here.
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

    /* Name capture, only when the roster cell is blank (see needsName in
       auth.gs); email and usually name come from Google. Runs before the
       handoff because settle()'s greeting, the onboarding welcome and the
       guardian emails assume a real name. */
    /* ...unless the portal is about to run its onboarding sequence, which
       opens with this question (#onb-name in index.html); needsName passes
       through so it asks once. A student who needs a name but is NOT
       onboarding is still asked here. */
    if (data.needsName && !nameAsked && !data.needsOnboarding) {
      nameAsked = true;
      host.querySelector('#mta-name-sub').textContent =
        'First and last, as you would write it on a test registration.';
      pane('name');
      err('#mta-name-error', '');
      host.querySelector('#mta-name-input').focus();
      return;
    }
    // If it STILL needs a name after one round trip, the write is failing
    // somewhere unseen. Let them in anyway: a blank name is cosmetic, a
    // locked-out student is not.

    /* Ask once, and only past a student's first visit: a new student has the
       onboarding sequence ahead of them, so they are asked on a later login. */
    if (shouldOfferStay() && !data.needsOnboarding && !data.needsName) {
      pendingStayData = data;
      pane('stay');
      return;
    }

    writeStudentCache(data);
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
  /* The timeout covers what onerror misses: a filtered network or captive
     portal can leave the request hanging, which would otherwise leave a
     blank panel forever. */
  function loadGsi() {
    return new Promise(function (resolve, reject) {
      if (window.google && google.accounts && google.accounts.id) return resolve();
      var settled = false;
      function finish(fn, arg) { if (settled) return; settled = true; clearTimeout(timer); fn(arg); }
      var timer = setTimeout(function () { finish(reject, new Error('gsi_timeout')); }, GSI_TIMEOUT_MS);
      var s = document.createElement('script');
      s.src = GSI_SRC;
      s.async = true;
      s.defer = true;
      s.onload = function () { finish(resolve); };
      s.onerror = function () { finish(reject, new Error('gsi_blocked')); };
      document.head.appendChild(s);
    });
  }

  /* Everything we can tell a student whose sign-in cannot start. Named
     rather than inlined because three different failures end here: the
     script being blocked, the script hanging, and the button rendering
     empty inside an embedded browser. */
  function signInUnavailableHelp() {
    var app = inAppBrowserName();
    if (app) {
      return 'Google will not allow sign-in inside ' + app + '. Open this page in Safari or Chrome instead: ' +
        'press and hold the link and choose "Open in Browser", or type ' +
        'morettitutoring.com/portal into your browser yourself.';
    }
    return "Google's sign-in could not start \u2014 an ad blocker, a content blocker or a school network filter is " +
      'the usual cause, and tapping a link from inside an app (Gmail, Instagram, WhatsApp) does it too. ' +
      'Try opening morettitutoring.com/portal in Safari or Chrome, or ' + CONTACT + '.';
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
        /* Only ever true because the student asked for it on this device.
           With it on, prompt() below signs a returning student straight in
           instead of showing the account chooser. */
        // Auto-select only when the student opted into "stay signed in": a
        // silent re-login on a shared family device must not be the default.
        auto_select: staySignedIn(),
        cancel_on_tap_outside: true
      });
      if (staySignedIn()) {
        // Best effort: if One Tap cannot show (blocked, no Google session,
        // FedCM off) the button below is still sitting there.
        try { google.accounts.id.prompt(); } catch (e) {}
      }
      var target = host.querySelector('#mta-gbtn');
      target.innerHTML = '';
      google.accounts.id.renderButton(target, {
        theme: 'outline', size: 'large', text: 'signin_with',
        shape: 'pill', logo_alignment: 'left', width: 300
      });
      /* Say it BEFORE they try, when we can already tell: the button will
         render here and simply do nothing when tapped. */
      if (inAppBrowserName()) err('#mta-signin-error', signInUnavailableHelp());
      /* Also check afterwards, for embedded browsers no user-agent test
         catches, where renderButton quietly produces an empty div. Speaks
         only if nothing rendered and nothing has been said. */
      setTimeout(function () {
        var t = host && host.querySelector('#mta-gbtn');
        if (!t || t.querySelector('iframe, div[role="button"]')) return;
        var slot = host.querySelector('#mta-signin-error');
        if (slot && slot.textContent.trim()) return;
        err('#mta-signin-error', signInUnavailableHelp());
      }, 3500);
    }).catch(function () {
      err('#mta-signin-error', signInUnavailableHelp());
    });
  }

  /* ═══ ENTRY POINT ═══ called once by index.html. Resumes an existing
     session silently when there is one, so a returning student never sees
     a login. */
  function start(opts) {
    onStudent = (opts && opts.onStudent) || function () {};
    onRefresh = (opts && opts.onRefresh) || null;
    installFetchWrapper();
    ensureHost();

    invite = takeInviteFromUrl();
    /* An invite on a device signed in as someone ELSE is the shared-laptop
       case: the who-pane lets the new student take over. On a device signed
       in as the invite's own student, it is just a return visit through the
       only URL they kept. So resume first, and fall back to the who-pane
       only if the session belongs to someone else. */
    if (invite) {
      var storedForInvite = readStore();
      var wantKey = inviteKeyOf(invite);
      if (storedForInvite && wantKey) {
        return resumeRequest(storedForInvite).then(function (data) {
          if (data && data.ok && data.key && String(data.key).toUpperCase() === wantKey) {
            resumedStudent = data;
            session = storedForInvite;
            host.querySelector('#mta-continue-who').textContent =
              data.name || data.email || 'this student';
            pane('continue');
            return;
          }
          // Someone else's session, or resume failed (including a network
          // failure, so the invite still works on a flaky connection).
          session = null;
          pane('who');
        });
      }
      session = null;
      pane('who');
      return Promise.resolve();
    }

    /* Set by onSessionDead just before the reload that brought us here. */
    var signedOutReason = null;
    try {
      signedOutReason = sessionStorage.getItem(SIGNED_OUT);
      if (signedOutReason) sessionStorage.removeItem(SIGNED_OUT);
    } catch (e) {}

    var stored = readStore();
    if (!stored) {
      return Promise.resolve(renderSignIn()).then(function () {
        if (signedOutReason === 'revoked') {
          err('#mta-signin-error',
            'Your access to this portal was reset. Sign in again, or ' + CONTACT + ' if you think that is a mistake.');
        }
      });
    }

    session = stored;

    /* PAINT FIRST, CHECK AFTER. With a session token and a recent payload,
       draw the portal now and let the resume run behind it as a check.

       Excluded, since each needs the server's answer first:
         - needsOnboarding: stale cache could replay or skip the intro.
         - needsName: a form the server has to accept.
         - shouldOfferStay(): a one-time question the fast path would skip.
       Nothing new is trusted: every request carries the session token, and
       the fetch wrapper tears it down once the backend says revoked. */
    var cached = readStudentCache();
    var paintedFromCache = false;
    if (cached && !cached.needsOnboarding && !cached.needsName && !shouldOfferStay()) {
      paintedFromCache = true;
      hide();
      if (onStudent) onStudent(cached);
    } else {
      // The sign-in pane is visible by default with an empty button slot until
      // renderSignIn runs, so during a slow resume say what is happening.
      status('#mta-signin-error', 'Signing you in\u2026');
    }

    return resumeRequest(stored).then(function (data) {
      if (data && data.ok && data.key) {
        /* Already painted: refresh the cache and hand the payload to
           onRefresh, not handle(), which would re-enter the portal and reset
           the open screen. The portal re-applies its gating in place (see
           applyStudentRefresh() in index.html). */
        if (paintedFromCache) {
          writeStudentCache(data);
          if (onRefresh) { try { onRefresh(data); } catch (e) {} }
          return;
        }
        handle(data);
        return;
      }
      /* Painted from cache and no answer came: leave them there. Every
         request carries the session, and the fetch wrapper catches a truly
         dead one on the first. */
      if (paintedFromCache && data && data.error === 'network') return;
      /* Painted from cache and the server says no. The cache is wrong and
         has to go before the reload, or the next load paints it again. */
      if (paintedFromCache) { clearStudentCache(); onSessionDead(); return; }

      /* COULD NOT ASK IS NOT A NO. post() turns any failed fetch into
         {error:'network'}; only a real server answer clears the stored
         token, so a wifi blip or cold-start timeout keeps the login. */
      if (data && data.error === 'network') {
        return Promise.resolve(renderSignIn()).then(function () {
          err('#mta-signin-error', keyErrorMessage('network'));
        });
      }
      // Expired, revoked, or unpaired in admin: just time to sign in again.
      // Clear the status line so the panel stops saying it is signing in.
      status('#mta-signin-error', '');
      session = null;
      writeStore(null);
      return renderSignIn();
    });
  }

  function signOut() {
    session = null;
    writeStore(null);
    clearStudentCache();
    /* Signing out is the student saying stop, so it clears the standing
       "stay signed in" choice too -- otherwise One Tap would put them
       straight back in and the sign-out would look broken. */
    try { localStorage.removeItem(STAY); localStorage.removeItem(STAY_SNOOZE); } catch (e) {}
    try {
      if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    } catch (e) {}
  }

  /* ═══ NO LOGGED-IN CHROME BEFORE SIGN-IN ═══
     index.html's markup paints long before MorettiAuth.start() runs at the
     end of the file, so anything visible in it flashes first. This file
     loads BEFORE that markup, so a style rule injected here lands in time. */
  (function hideNavUntilSignedIn() {
    if (MODAL) return;   // #main-nav on the home page is that site's own nav
    try {
      var st = document.createElement('style');
      st.id = 'mta-hide-nav-until-signed-in';
      /* #main-nav is the red bar, which would otherwise flash at a student
         not yet signed in. Hidden via a class on <html> rather than a bare
         rule, because hide() must bring it back and onboarding later toggles
         its own .nav-hidden on the same element. */
      st.textContent = 'html.mta-auth-pending #main-nav{display:none !important;}';
      document.documentElement.classList.add('mta-auth-pending');
      (document.head || document.documentElement).appendChild(st);
    } catch (e) { /* if this fails the overlay still covers it, just later */ }
  })();

  /* Not in modal mode: the home page's only backend call is the lead form,
     which must not get a session, nor trip onSessionDead() and reload the
     page mid-form. */
  if (!MODAL) installFetchWrapper();

  /* THE HEARTBEAT'S SECOND WAY IN. When restoreState() restores a student
     from the same-tab snapshot, start() never runs (see refresh() below) and
     writeStudentCache() is skipped. A stored session on a portal page is
     enough to start; an invalid one gets a single unauthorized answer and
     is handled there. */
  try { if (!MODAL && readStore()) startHeartbeat(); } catch (e) {}

  return {
    start: start,
    openSignIn: openSignIn,
    /* "Is there a session on this device?" -- asked by the home page to
       decide between opening the dialog and just going to the portal, which
       will resume that session by itself. Reads the store, not the in-memory
       `session`, because on the home page start() never ran. */
    hasSession: function () { return !!readStore(); },
    /* ASK THE SERVER WHO THIS STUDENT IS NOW, WITHOUT SIGNING THEM IN AGAIN.
       index.html skips start() when restoreState() restores from the
       same-tab snapshot (so a refresh mid-exam does not restart the
       handoff), so nothing else checks that snapshot for the life of the tab.

       No panes, no handoff: it resumes, refreshes the cache, and resolves
       with the payload for the caller to diff. A dead or unreachable
       session resolves null rather than rejecting; the fetch wrapper handles
       real revocation on the next request. */
    refresh: function () {
      var stored = readStore();
      if (!stored) return Promise.resolve(null);
      if (!session) session = stored;
      return resumeRequest(stored).then(function (data) {
        if (data && data.ok && data.key) { writeStudentCache(data); return data; }
        return null;
      }, function () { return null; });
    },
    signOut: signOut,
    session: function () { return session; },
    isSignedIn: function () { return !!session; },
    /* For the portal's own name step (#onb-name). The session lives here,
       so the write goes through here. Resolves to the usual student
       payload. */
    setName: function (name) {
      return post({ action: 'setName', session: session, name: name });
    },
    /* Called by the portal's screen switcher (show() in index.html) so the
       admin panel can show the current screen. Purely a label; it grants
       nothing. A page that never calls it reports its own filename. A
       change of screen pings early rather than waiting up to a minute. */
    setActivity: function (id) {
      var next = String(id || '');
      if (next === activity) return;
      activity = next;
      /* Forced, so it does not wait out the minute -- but not so forced
         that clicking through five screens sends five pings. */
      if (heartbeatOn && (Date.now() - lastPingAt) > 5000) ping(true);
    },
    /* "Is this student on the site right now" is answered by the heartbeat;
       exposed so a page that restores a student some other way can start
       it, and so it can be checked from the console. */
    startPresence: startHeartbeat
  };
})();
