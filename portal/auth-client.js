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
  var CLIENT_ID = '742313412130-kck7ihjd9el1kolac0hnmep3h1b2vbrh.apps.googleusercontent.com';

  var STORE = 'moretti_session';
  var GSI_SRC = 'https://accounts.google.com/gsi/client';
  var POLL_MS = 4000;
  var CONTACT = 'text Luca at (201) 275-2791';
  var GSI_TIMEOUT_MS = 12000;

  /* Google Identity Services refuses to run inside an embedded browser --
     the viewer you get when a link is tapped from inside Gmail, Instagram,
     WhatsApp or Messenger. Google answers `disallowed_useragent`, the
     sign-in never opens, and the page simply sits there. Nothing in this
     flow could say so, and "the link isn't opening and says it is not
     responding" is precisely what that looks like from the other side --
     with not one request reaching the server to leave a trace.

     ADVISORY, NEVER BLOCKING. User-agent sniffing is wrong in both
     directions (iOS SFSafariViewController carries no Safari token yet
     signs in perfectly well), so this only ever ADDS a note; the Google
     button stays exactly where it was underneath it. */
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
  var pollTimer = null;
  var wasPending = false;  // so a claim that gets DECLINED reads as declined, not as "enter a key"
  var nameAsked = false;   // one ask only — see the needsName branch in handle()
  var host = null;
  var invite = null;       // the ?invite= token, if this visit came from an invite email
  var resumedStudent = null; // a live session already on this device, when it belongs to the invited student

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

  /* index.html's own sessionStorage snapshot. Named here because a dead
     session has to clear BOTH: that snapshot is what makes index.html skip
     MorettiAuth.start() after a refresh, so leaving it behind would restore
     the student into a portal whose every request is refused. */
  /* "Stay signed in" is the student's own per-device choice. It turns on
     Google's One Tap auto-select, which is what actually stops a returning
     student being dropped on the sign-in screen: the session token already
     survives 30 days, but the moment it lapses -- or they open the portal in
     another browser -- the only way back in without a chooser is One Tap.

     Deliberately opt-in and deliberately per-device. Auto-select was off by
     design here (see renderSignIn) because a silent re-login on a shared
     family laptop is exactly the failure this login system was built to
     prevent. Asking makes it the student's decision rather than a default
     that quietly signs a parent's browser into a child's portal. */
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
     index.html's restoreState() already puts a student straight back after
     a SAME-TAB refresh, from sessionStorage. Close the tab and that is
     gone, while the 30-day session token in localStorage survives -- so
     reopening the portal meant staring at a sign-in panel for the length of
     one Apps Script round trip (~1.2s warm, 5-6s cold) to be told what the
     browser already knew.

     This is the same payload, kept where it outlives the tab, so the portal
     can paint immediately and the round trip becomes a background check
     instead of a gate. Deliberately WITHOUT the session token: that already
     lives under STORE, and one copy of a credential is enough. */
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

  /* THE BACKEND HAS TOLD US THIS SESSION IS OVER. Since the request guard
     started re-checking the pairing on every action (which is what makes
     Reset login immediate), a revoked student sitting in an open tab got
     `session_revoked` from every call -- and nothing anywhere handled it.
     No message, no sign-in prompt, and refreshing did not help: the portal
     restores itself from sessionStorage, skips start(), and fails silently
     again. The tab was unrecoverable without closing it.

     One reload, with both stores cleared, puts them back at the sign-in
     screen with a reason -- which is the honest outcome whether they were
     reset by mistake or were the wrong person all along. */
  var sessionDead = false;
  function onSessionDead() {
    if (sessionDead) return;
    sessionDead = true;
    session = null;
    writeStore(null);
    clearStudentCache();
    try { sessionStorage.removeItem(PORTAL_STATE); } catch (e) {}
    try { sessionStorage.setItem(SIGNED_OUT, 'revoked'); } catch (e) {}
    try { window.location.reload(); } catch (e) {}
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
      var credentialled = false;
      try {
        var url = (typeof input === 'string') ? input : (input && input.url);
        var base = backendUrl();
        /* THE STORED TOKEN, NOT JUST THE IN-MEMORY ONE. `session` is only
           assigned by handle()/start(), and index.html skips start()
           entirely when restoreState() has already put the student back
           after a same-tab refresh -- which is routine, and which mobile
           browsers do on their own to a backgrounded tab. Reading only the
           variable meant every request after such a refresh went out with
           no session at all and came back `unauthorized`: assignments,
           progress, and a finished diagnostic that then never reached
           Luca. The store is the durable copy; fall back to it. */
        var tok = session || readStore();
        if (tok && base && url && String(url).indexOf(base) === 0 &&
            init && init.body && typeof init.body === 'string' &&
            String(init.method || '').toUpperCase() === 'POST') {
          var payload = JSON.parse(init.body);
          if (payload && payload.action && !payload.adminKey && !payload.session) {
            payload.session = tok;
            // Copied, never mutated in place: callers reuse their init
            // objects (markDiagnosticTaken's retry does exactly that), and
            // rewriting one out from under a caller is the kind of bug
            // that only shows up on the retry path.
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
     second hop fails now and then -- a 404, or an HTML page where JSON
     should be -- even though the script itself ran fine. auth-admin.js has
     documented and handled this for its roster read since it was written;
     the two SIGN-IN paths never got the same treatment, so a single lost
     hop was the difference between a student being logged in and being told
     "Couldn't reach the server". Measured against the live backend: ~1.2s
     warm, 5-6s cold, and the occasional outright lost answer.

     Retried: `resume` and `googleAuth`. Both are safe to repeat -- resume
     only reads, and googleAuth's write path is explicitly idempotent and
     lock-guarded (ensureFolderAndGrant_ is gated on the cells it writes
     still being empty, which is why a returning student never re-triggers
     the Drive share email).

     NOT retried: claimInvite, which mints and consumes a single-use nonce.
     Same rule auth-admin.js states -- writes are never retried, the script
     already ran. Its own caller already recovers from a lost claim by
     falling through to googleAuth. */
  var RETRY_ACTIONS = { resume: true, googleAuth: true };

  /* Does this reply actually answer the question we asked? Deliberately a
     whitelist of the shapes the backend documents, NOT "does it carry a
     key" -- googleAuth answers a brand-new student with { ok:true,
     pending:true } or { ok:true, needsKey:true }, and neither has a key in
     it. Treating those as lost answers would retry a perfectly good reply
     three times and then fail the student with a network error, which is
     the precise flow a first-time student is in. */
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
    /* No timeout at all before this: a hop that never answers left the
       promise pending for the browser's own multi-minute default, which is
       the "it just sits there for a minute" half of the complaint. */
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
     The resume round-trip used to begin only once index.html (1.4MB) had
     finished parsing and called start(). Measured against the live backend
     that round-trip is ~1.2s warm and 5-6s cold, and every millisecond of
     it was spent AFTER the page was otherwise ready -- pure dead time on
     the critical path, serialized behind work it has nothing to do with.

     Firing it here, the moment this file runs, overlaps it with the rest of
     the download and parse instead. backend-url.js is loaded before this
     file, so the URL is already known. Costs nothing when there is no saved
     session: a student signing in for the first time skips it entirely. */
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

        /* An invite link opened on a device already signed in AS THE SAME
           STUDENT. That is the common case once the invite has been used:
           the only URL the family kept is the invite, so every trip back to
           the portal comes through it. Forcing a fresh Google sign-in there
           threw away a perfectly good session -- and if Google happened to
           be blocked (see inAppBrowserName) it stranded them on a page that
           could not work, with their own valid session sitting unused in
           localStorage a few lines away. */
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
      // Second handoff into the portal, and it bypasses handle()'s tail --
      // so the cache has to be written here too, or a student who answered
      // this prompt would never get the fast path on their next visit.
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
    ['continue', 'who', 'signin', 'key', 'name', 'pending', 'stay'].forEach(function (p) {
      host.querySelector('#mta-' + p).style.display = (p === which) ? 'block' : 'none';
    });
    host.style.display = 'flex';
  }

  function hide() {
    stopPoll();
    if (host) host.style.display = 'none';
    // Handing off to the portal: give the page its chrome back and let
    // index.html's own onboarding take over hiding it if it wants to.
    document.documentElement.classList.remove('mta-auth-pending');
  }

  function err(id, msg) {
    // ensureHost() rather than trusting `host` to be set: every current
    // caller reaches here after start() has built it, but a null host would
    // throw inside the very handler that exists to REPORT a failure — which
    // turns a recoverable error into a blank screen.
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
    /* ...unless the portal is about to run its own dark onboarding act,
       which now opens WITH this question (see #onb-name in index.html).
       Asking here as well would ask twice, and the first ask would be the
       ugly one: a white overlay panel in front of the dark sequence it is
       introducing. needsName is passed through untouched in that case, so
       the portal knows to show its beat. A student who needs a name but
       is NOT onboarding (a blank cell on an already-settled row) still
       gets asked here — that path has no dark act to hand off to. */
    if (data.needsName && !nameAsked && !data.needsOnboarding) {
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

    /* Ask once, and only for a student who is past their first visit --
       a brand-new student has the name beat and the whole intro sequence
       ahead of them, and a dialog stacked in front of that is noise. They
       get asked on a later login instead. */
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
  /* onerror alone was not enough. It fires when the request FAILS, but a
     filtered network or a captive portal can leave the request hanging
     instead, and then this promise never settled at all: no button, no
     error, no explanation -- a blank panel forever. The timeout turns that
     into something a student can act on. */
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
        // No One Tap auto-select: this portal keeps its own session, and a
        // silent re-login on a shared family device is exactly the thing
        // this whole change exists to stop being automatic.
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
        shape: 'rectangular', logo_alignment: 'left', width: 280
      });
      /* Say it BEFORE they try, when we can already tell: the button will
         render here and simply do nothing when tapped. */
      if (inAppBrowserName()) err('#mta-signin-error', signInUnavailableHelp());
      /* And say it after, for the embedded browsers no user-agent test
         catches: the script loads, initialize() succeeds, and renderButton
         quietly produces an empty div. Only speaks up if nothing rendered
         and nothing has been said already. */
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

  /* ═══ ENTRY POINT ═══ called once by index.html instead of showing the
     old key screen. Resumes an existing session silently when there is
     one, so a returning student never sees a login at all. */
  function start(opts) {
    onStudent = (opts && opts.onStudent) || function () {};
    installFetchWrapper();
    ensureHost();

    invite = takeInviteFromUrl();
    /* An invite arriving on a device ALREADY signed in as someone else is
       the shared-family-laptop case: resuming the old session would
       silently swallow the invite, so the who-pane lets the new student
       take the tab over.

       But the same link arriving on a device signed in as THE STUDENT IT IS
       FOR is not that -- it is just a student coming back through the only
       URL they kept. That used to be treated identically, throwing away a
       working session and demanding a fresh Google sign-in; when Google was
       blocked (an in-app browser) it stranded them completely, with their
       own valid session sitting unused in localStorage. So: resume first,
       and only fall back to the who-pane if the session turns out to belong
       to somebody else. */
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
          // Someone else's session, or it could not be resumed -- original
          // behaviour. A network failure lands here too, which is right:
          // the invite still needs to work on a flaky connection.
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

    /* PAINT FIRST, CHECK AFTER. With a session token and a recent payload
       for it, everything needed to draw the portal is already on the
       device -- so draw it, and let the resume round trip run behind it as
       a check rather than a gate. The student is looking at their own home
       screen while the 1.2-6s happens.

       Three cases are deliberately excluded, because each one needs the
       server's answer BEFORE anything is drawn:
         - needsOnboarding: the dark intro sequence runs once, and running
           it off stale cache could replay or skip it.
         - needsName: a form whose answer the server has to accept.
         - shouldOfferStay(): a one-time question. Skipping it via the fast
           path every time would mean it is never asked at all.
       Nothing is trusted here that was not already trusted: the session
       token is what grants access, every subsequent request carries it,
       and the fetch wrapper tears the session down the moment the backend
       says it is revoked. */
    var cached = readStudentCache();
    var paintedFromCache = false;
    if (cached && !cached.needsOnboarding && !cached.needsName && !shouldOfferStay()) {
      paintedFromCache = true;
      hide();
      if (onStudent) onStudent(cached);
    } else {
      // The sign-in pane is the default-visible one and its button slot is
      // empty until renderSignIn runs, so a slow resume (Apps Script cold
      // starts run into several seconds) showed a "Sign in" panel with
      // nothing to click. Say what is happening instead.
      status('#mta-signin-error', 'Signing you in\u2026');
    }

    return resumeRequest(stored).then(function (data) {
      if (data && data.ok && data.key) {
        /* Already painted: refresh the cache for next time and stay out of
           the way. Handing this to handle() would re-run the whole handoff
           -- re-entering the portal underneath a student who is already
           reading it, and resetting whatever screen they had opened. */
        if (paintedFromCache) { writeStudentCache(data); return; }
        handle(data);
        return;
      }
      /* Painted from cache and the answer never came. Leave them where they
         are: the session is untouched, every request the portal makes
         carries it, and a genuinely dead session is caught by the fetch
         wrapper on the first one. Throwing up a sign-in panel over a portal
         they are already using would be the worse call. */
      if (paintedFromCache && data && data.error === 'network') return;
      /* Painted from cache and the server says no. The cache is wrong and
         has to go before the reload, or the next load paints it again. */
      if (paintedFromCache) { clearStudentCache(); onSessionDead(); return; }

      /* COULD NOT ASK IS NOT A NO. post() turns any failed fetch into
         {error:'network'}, and this used to treat that exactly like a
         revoked session -- so one blip on a school wifi, or an Apps Script
         cold start that times out, permanently deleted a perfectly good
         login and made the student sign in from scratch. Only a real
         answer from the server clears the stored token. */
      if (data && data.error === 'network') {
        return Promise.resolve(renderSignIn()).then(function () {
          err('#mta-signin-error', keyErrorMessage('network'));
        });
      }
      // Expired, revoked, or unpaired in admin. Not an error worth showing
      // — it is simply time to sign in again. The status line must go, or
      // the panel sits there claiming it is still signing them in.
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
     index.html's markup is parsed and painted long before
     MorettiAuth.start() runs at the end of a 19,000-line file, so anything
     marked visible in that static markup flashes on screen first. This file
     is loaded BEFORE that markup, so a style rule injected here lands in
     time. (It used to suppress the retired key-entry panel too; that markup
     has since been deleted outright.) */
  (function hideNavUntilSignedIn() {
    try {
      var st = document.createElement('style');
      st.id = 'mta-hide-nav-until-signed-in';
      /* #main-nav is the red bar. On a cold load it paints and sits there
         until the overlay covers it -- which reads as the portal flashing
         its logged-in chrome at someone who has not signed in yet. Hidden
         by a class on
         <html> rather than a bare rule, because it has to come BACK the
         moment a student is handed to the portal (see hide()), and the
         onboarding sequence toggles its own .nav-hidden on the same element
         afterwards. */
      st.textContent = 'html.mta-auth-pending #main-nav{display:none !important;}';
      document.documentElement.classList.add('mta-auth-pending');
      (document.head || document.documentElement).appendChild(st);
    } catch (e) { /* if this fails the overlay still covers it, just later */ }
  })();

  installFetchWrapper();

  return {
    start: start,
    signOut: signOut,
    session: function () { return session; },
    isSignedIn: function () { return !!session; },
    /* Exposed for the portal's own name beat (#onb-name), which took over
       this question from the overlay above. The session lives in here, so
       the write has to go through here too rather than the portal
       assembling its own request. Resolves to the same student payload
       every other call in this file returns. */
    setName: function (name) {
      return post({ action: 'setName', session: session, name: name });
    }
  };
})();
