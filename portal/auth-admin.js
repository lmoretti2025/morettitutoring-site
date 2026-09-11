/* =========================================================================
   MORETTI PORTAL ADMIN — THE ACCESS PANEL
   -------------------------------------------------------------------------
   Adds a "Portal access" panel to portal/admin.html with ONE <script> tag
   and no other edit. It builds its own markup, reads the admin key from
   the sessionStorage entry admin.html writes on unlock, and styles itself
   from admin.html's CSS variables. Delete the script tag and admin.html is
   unchanged.

   AN ACTION QUEUE, NOT A SECOND ROSTER. It shows only rows needing action
   (an inquiry with no invite sent, an unclaimed invite, a claim awaiting
   approval), plus a search box for login resets.

   EVERY CHANNEL. Most families call, text or message rather than use the
   form, so the invite is a LINK first: "Copy invite link" returns the
   single-use token to paste anywhere, and "Copy message" the full text.
   A family with no email still gets in; the address arrives verified when
   the student signs in with Google.
   ========================================================================= */

(function () {
  'use strict';

  // backend-url.js, loaded first by every page that includes this file.
  var URL_ = window.APPS_SCRIPT_URL || '';
  var SESSION_KEY = 'moretti_admin_key';   // the entry admin.html writes on unlock
  var POLL_MS = 60000;
  var SOURCES = ['Website', 'Phone call', 'Text message', 'Facebook Messenger', 'Referral', 'In person', 'Other'];
  /* Where a pre-approved student is sent: one plain URL for everyone, since
     rows are matched on the Google address at sign-in. Hardcoded rather
     than built from location so it is always the public address, not a
     test host. */
  var PORTAL_URL = 'https://morettitutoring.com/portal/';

  var root = null, listEl = null, badgeEl = null, tabEl = null;
  var students = [];
  var open = false, query = '', loading = false, showArchived = false;
  /* THE POLL MUST NOT REDRAW OVER A CLICK.

     busy      counts writes in flight. render() rebuilds the list with
               innerHTML, so a poll mid-request would restore the
               pre-action card with live buttons (inviting a duplicate
               click) and lose its success text.
     rosterSeq makes the NEWEST answer win, so an older pre-action
               snapshot can never land after an action's own refresh. */
  var busy = 0, rosterSeq = 0, refreshQueued = false, signedOut = false;
  var loaded = false;        // has any roster answer ever arrived?
  var loadFailed = false;    // did the most recent attempt fail?

  function adminKey() {
    try { return sessionStorage.getItem(SESSION_KEY); } catch (e) { return null; }
  }

  /* Apps Script answers a POST with a redirect to its "echo" host, and that
     hop fails now and then (a 404, or an HTML page instead of JSON) even
     though the script ran. For the one read this panel makes that is just a
     lost answer, so ask again. Writes are never retried: the script already
     ran, and re-sending would create, invite or delete twice. */
  var RETRY_READS = { accessRoster: 'students' };   // value: the field a real answer carries
  function post(payload, attempt) {
    attempt = attempt || 0;
    var field = RETRY_READS[payload.action];
    var canRetry = !!field && attempt < 2;
    function again() {
      return new Promise(function (r) { setTimeout(r, 1500 * (attempt + 1)); })
        .then(function () { return post(payload, attempt + 1); });
    }
    return fetch(URL_, { method: 'POST', body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        // A stalling service has answered a POST with its GET health reply
        // ({ok:true, message}) -- ok, but with no roster in it. Never take
        // that for an empty roster.
        if (field && data && data.ok && !(field in data)) {
          return canRetry ? again() : { ok: false, error: 'lost_answer' };
        }
        return data;
      }, function () {
        return canRetry ? again() : { ok: false, error: 'network' };
      });
  }

  /* An admin session lasts 14 days and also ends if the address is dropped
     from ADMIN_EMAILS. On 'unauthorized', hand off to the Google gate, the
     only thing that can fix it, rather than treating it as an ordinary
     failure. */
  function reGateIfSignedOut(data, userInitiated) {
    if (!data || data.error !== 'unauthorized') return false;
    /* mtaAdminSignOut reloads the page: right after a click, wrong from the
       minute poll, where it could discard a half-filled form. From the poll,
       say so and let Luca reload when ready. */
    if (!userInitiated) {
      loadFailed = true;
      signedOut = true;
      if (open) render();
      return true;
    }
    if (typeof window.mtaAdminSignOut === 'function') { window.mtaAdminSignOut(); return true; }
    return false;
  }

  /* Raw backend codes are not an error message. These are the ones a person
     can actually do something about; anything else falls back to the code,
     which still beats nothing when something genuinely unexpected arrives. */
  var ACTION_ERRORS = {
    no_pending_claim: 'That request was already decided \u2014 refreshing.',
    already_paired: 'They have already signed in, so there is nothing to send \u2014 refreshing.',
    bad_key: 'That row no longer exists \u2014 refreshing.',
    no_recipient: 'No usable email address on this row. Use Copy link instead.',
    mail_failed: 'Google would not send the email. Use Copy link instead.',
    /* Sign-in email only. It carries no credential, but needs the STUDENT's
       address: a parent address is not enough, since the student signs in
       as themselves. */
    no_student_email: "No student email on this row, so there is nothing to sign in as. Send the parent an invite instead.",
    busy_try_again: 'The server was busy with something else. Try that again in a moment.',
    attempts_unreadable: "Could not read this student's test history, so nothing was deleted. Try again shortly.",
    network: 'No answer came back \u2014 it may still have gone through. Refreshing to check.',
    lost_answer: 'No answer came back \u2014 it may still have gone through. Refreshing to check.'
  };
  function actionFailure(data) {
    var code = (data && data.error) || 'unknown error';
    return ACTION_ERRORS[code] || ('Failed: ' + code);
  }
  // Codes meaning the card is stale (the row moved on, or the answer was
  // lost and the write may have landed): replace the card rather than
  // leave a button inviting a duplicate click.
  var STALE_AFTER = /^(no_pending_claim|already_paired|bad_key|network|lost_answer)$/;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function ago(iso) {
    if (!iso) return '';
    var mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.round(hrs / 24) + 'd ago';
  }

  /* navigator.clipboard needs a secure context. The fallback matters: a
     silent failed copy would have Luca paste old clipboard contents into a
     real conversation with a parent. */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; },
                                                      function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  function inviteMessage(link, name) {
    return (name ? 'Hi ' + name + ' — ' : 'Hi — ') +
      "here's the link to set up the student portal:\n\n" + link +
      "\n\nIt needs to be opened by the student on their own device, and signed in with their own " +
      'Google account — that becomes their login and is where I share their notes and practice materials. ' +
      'The link works once and expires in 14 days.\n\n— Luca';
  }

  /* The counterpart to inviteMessage for a pre-approved student: no link,
     no key, nothing that expires, since Google proves who they are. It says
     "your own Google account" rather than naming the address, which may be
     a parent's mistyped guess. Same shape as inviteMessage so either can be
     pasted into a text thread. */
  function signInMessage(name) {
    return (name ? 'Hi ' + name + ' — ' : 'Hi — ') +
      'your student portal is ready:\n\n' + PORTAL_URL +
      "\n\nThere's no password and nothing to set up. Press Student Login and sign in with your own " +
      'Google account — the one on your school or personal email. That becomes your login, and it is ' +
      'where I share your notes, practice tests and score reports.\n\n' +
      'Open it in Safari or Chrome rather than tapping through from inside another app — Google blocks ' +
      "sign-in in those.\n\n— Luca";
  }

  /* ═══ STYLES ═══ scoped under the panel's own ids so nothing here can
     reach admin.html's elements. Colors come from its :root variables,
     with literal fallbacks in case those are renamed. */
  function injectStyles() {
    if (document.getElementById('mta-access-css')) return;
    var css = document.createElement('style');
    css.id = 'mta-access-css';
    css.textContent = [
      '#mta-access{position:fixed;right:18px;bottom:18px;z-index:8000;width:380px;',
      'max-width:calc(100vw - 36px);font-family:var(--hel,sans-serif);font-size:0.82rem;color:var(--text,#111);}',
      '#mta-access .mta-tab{display:flex;align-items:center;gap:8px;width:100%;justify-content:center;',
      'background:var(--text,#111);color:#fff;border:none;border-radius:12px;padding:0.7rem 1rem;',
      'font:inherit;font-weight:600;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,0.18);}',
      '#mta-access .mta-badge{background:var(--red,#B0271C);color:#fff;border-radius:999px;',
      'padding:1px 8px;font-size:0.72rem;font-weight:700;}',
      '#mta-access .mta-body{background:var(--white,#fff);border:1px solid var(--border,rgba(17,17,17,0.12));',
      'border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,0.16);margin-bottom:10px;overflow:hidden;',
      'max-height:min(70vh,620px);display:flex;flex-direction:column;}',
      '#mta-access .mta-head{padding:0.85rem 1rem;border-bottom:1px solid var(--border,rgba(17,17,17,0.12));',
      'display:flex;align-items:center;gap:10px;}',
      '#mta-access .mta-head h3{margin:0;font-size:0.9rem;font-weight:700;flex:1;}',
      '#mta-access .mta-scroll{overflow-y:auto;flex:1;}',
      '#mta-access .mta-sec{padding:0.55rem 1rem 0.2rem;font-size:0.68rem;font-weight:700;letter-spacing:0.08em;',
      'text-transform:uppercase;color:var(--faint,rgba(17,17,17,0.28));}',
      '#mta-access .mta-row{padding:0.7rem 1rem;border-bottom:1px solid rgba(17,17,17,0.06);}',
      '#mta-access .mta-name{font-weight:600;}',
      '#mta-access .mta-sub{color:var(--mid,rgba(17,17,17,0.58));font-size:0.76rem;margin-top:2px;word-break:break-word;}',
      '#mta-access .mta-meta{color:var(--faint,rgba(17,17,17,0.28));font-size:0.72rem;margin-top:3px;}',
      /* The onboarding answers. Sits between the key line and the buttons,
         tinted so it reads as the student's own words rather than as more
         system metadata. */
      '#mta-access .mta-onb{color:var(--mid,rgba(17,17,17,0.55));font-size:0.72rem;',
      'margin-top:5px;line-height:1.5;border-left:2px solid var(--gold,#c9a84c);padding-left:7px;}',
      '#mta-access .mta-onb b{color:var(--text,#111);font-weight:700;}',
      '#mta-access .mta-acts{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;}',
      '#mta-access button.mta-b,#mta-modal button.mta-b{font:inherit;font-size:0.75rem;font-weight:600;',
      'padding:0.4rem 0.75rem;border-radius:999px;border:1px solid var(--border,rgba(17,17,17,0.12));',
      'background:var(--white,#fff);color:var(--mid,rgba(17,17,17,0.58));cursor:pointer;}',
      '#mta-access button.mta-b:hover,#mta-modal button.mta-b:hover{color:var(--text,#111);}',
      '#mta-access button.mta-b.pri,#mta-modal button.mta-b.pri{background:var(--red,#B0271C);',
      'border-color:var(--red,#B0271C);color:#fff;}',
      '#mta-access button.mta-b.warn,#mta-modal button.mta-b.warn{border-color:var(--red,#B0271C);',
      'color:var(--red,#B0271C);}',
      '#mta-access button.mta-b:disabled,#mta-modal button.mta-b:disabled{opacity:0.45;cursor:default;}',
      '#mta-access .mta-status{font-size:0.74rem;color:var(--mid,rgba(17,17,17,0.58));margin-top:6px;}',
      '#mta-access input.mta-in{width:100%;font:inherit;font-size:0.8rem;padding:0.5rem 0.7rem;',
      'border:1px solid var(--border,rgba(17,17,17,0.12));border-radius:8px;background:var(--white,#fff);',
      'color:var(--text,#111);margin-top:6px;}',
      '#mta-access .mta-empty{padding:1rem;color:var(--faint,rgba(17,17,17,0.28));text-align:center;}',
      '#mta-access .mta-pill{display:inline-block;font-size:0.66rem;font-weight:700;letter-spacing:0.04em;',
      'text-transform:uppercase;padding:1px 7px;border-radius:999px;margin-left:6px;vertical-align:1px;}',
      '#mta-access .mta-pill.inq{background:rgba(201,168,76,0.18);color:#8a6f22;}',
      '#mta-access .mta-pill.inv{background:rgba(62,107,140,0.14);color:var(--blue,#3E6B8C);}',
      '#mta-access .mta-pill.act{background:rgba(94,139,111,0.16);color:var(--green,#5E8B6F);}',
      '#mta-access .mta-warnbox{background:rgba(201,168,76,0.14);border-left:3px solid var(--gold,#C9A84C);',
      'padding:7px 9px;margin-top:7px;font-size:0.74rem;line-height:1.4;}',
      '#mta-modal{position:fixed;inset:0;z-index:8500;background:rgba(17,17,17,0.45);display:flex;',
      'align-items:center;justify-content:center;padding:1.5rem;font-family:var(--hel,sans-serif);',
      'color:var(--text,#111);font-size:0.82rem;}',
      '#mta-modal .box{background:var(--white,#fff);border-radius:14px;width:440px;max-width:100%;',
      'max-height:88vh;overflow-y:auto;box-shadow:0 18px 60px rgba(0,0,0,0.28);padding:1.3rem 1.4rem;}',
      '#mta-modal h3{margin:0 0 0.2rem;font-size:1rem;}',
      '#mta-modal .hint{color:var(--mid,rgba(17,17,17,0.58));font-size:0.78rem;line-height:1.45;margin:0 0 0.6rem;}',
      '#mta-modal label{display:block;font-size:0.7rem;font-weight:700;letter-spacing:0.05em;',
      'text-transform:uppercase;color:var(--faint,rgba(17,17,17,0.28));margin:0.8rem 0 0.25rem;}',
      '#mta-modal input,#mta-modal select{width:100%;font:inherit;font-size:0.85rem;padding:0.5rem 0.7rem;',
      'border:1px solid var(--border,rgba(17,17,17,0.12));border-radius:8px;background:var(--white,#fff);',
      'color:var(--text,#111);box-sizing:border-box;}',
      '#mta-modal .chk{display:flex;align-items:flex-start;gap:8px;margin-top:0.9rem;font-size:0.8rem;',
      'line-height:1.4;color:var(--mid,rgba(17,17,17,0.58));}',
      '#mta-modal .chk input{width:auto;margin-top:3px;}',
      '#mta-modal .acts{display:flex;gap:8px;margin-top:1.3rem;justify-content:flex-end;flex-wrap:wrap;}',
      '#mta-modal .err{color:var(--red,#B0271C);font-size:0.78rem;margin-top:0.7rem;min-height:1em;}',
      '#mta-modal .linkbox{background:var(--bg,#f2f2f2);border-radius:8px;padding:0.6rem 0.7rem;',
      'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.7rem;word-break:break-all;',
      'line-height:1.5;margin-top:0.5rem;}',
      '#mta-modal .keybig{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.3rem;',
      'font-weight:700;letter-spacing:0.06em;text-align:center;padding:0.7rem;background:var(--bg,#f2f2f2);',
      'border-radius:8px;margin-top:0.5rem;}',
      /* PRESENCE + LOG. The dot is the one thing on this panel that means
         "right now", so it is the only thing that moves. */
      '.mta-dot{display:inline-block;width:8px;height:8px;border-radius:50%;flex:none;',
      'background:var(--green,#5E8B6F);margin-right:6px;vertical-align:middle;',
      'animation:mtaPulse 2.2s ease-in-out infinite;}',
      '@keyframes mtaPulse{0%{box-shadow:0 0 0 0 rgba(94,139,111,0.5);}',
      '70%{box-shadow:0 0 0 6px rgba(94,139,111,0);}100%{box-shadow:0 0 0 0 rgba(94,139,111,0);}}',
      '@media (prefers-reduced-motion:reduce){.mta-dot{animation:none;}}',
      '#mta-access .mta-live{padding:0.1rem 1rem 0.5rem;}',
      '#mta-access .mta-liverow{display:flex;align-items:center;gap:6px;flex-wrap:wrap;',
      'font-size:0.82rem;padding:0.25rem 0;}',
      '#mta-access .mta-livewhere{font-size:0.72rem;font-weight:700;padding:0.1rem 0.45rem;border-radius:999px;',
      'background:rgba(94,139,111,0.12);color:var(--green,#5E8B6F);}',
      '#mta-access .mta-livesince{font-size:0.72rem;color:var(--faint,rgba(17,17,17,0.4));}',
      '#mta-access .mta-live-none{padding:0.7rem 1rem 0.2rem;font-size:0.78rem;',
      'color:var(--faint,rgba(17,17,17,0.4));}',
      '.mta-linkbtn{background:none;border:0;padding:0;margin-left:0.5rem;font:inherit;font-size:0.72rem;',
      'font-weight:700;letter-spacing:0.04em;color:var(--red,#B0271C);cursor:pointer;text-decoration:underline;',
      'text-transform:none;}',
      '#mta-modal .mta-logwrap{margin-top:0.7rem;max-height:52vh;overflow:auto;',
      'border:1px solid var(--border,rgba(17,17,17,0.12));border-radius:10px;}',
      '#mta-modal .mta-logrow{display:grid;grid-template-columns:6.5rem 1fr;gap:0.6rem;padding:0.5rem 0.7rem;',
      'border-bottom:1px solid var(--border,rgba(17,17,17,0.08));font-size:0.8rem;}',
      '#mta-modal .mta-logrow:last-child{border-bottom:0;}',
      '#mta-modal .mta-logrow.warn{background:rgba(176,39,28,0.05);}',
      '#mta-modal .mta-logtime{color:var(--faint,rgba(17,17,17,0.4));font-size:0.72rem;',
      'white-space:nowrap;padding-top:1px;}',
      '#mta-modal .mta-logwho{font-weight:700;}',
      '#mta-modal .mta-logkey{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.68rem;',
      'font-weight:400;color:var(--faint,rgba(17,17,17,0.4));}',
      '#mta-modal .mta-logwhat{color:var(--mid,rgba(17,17,17,0.58));font-size:0.76rem;}',
      '#mta-modal .mta-logdetail{color:var(--faint,rgba(17,17,17,0.4));}',
      '#mta-modal .mta-empty{padding:1rem;text-align:center;color:var(--faint,rgba(17,17,17,0.4));font-size:0.8rem;}'
    ].join('');
    document.head.appendChild(css);
  }


  /* ═══ WHO IS ON NOW, AND THE SIGN-IN LOG ═══
     Two views of the AuthLog. The strip at the top is live: the portal
     pings once a minute (see the PRESENCE block in auth.gs), so a green
     name has the portal open now, labeled with its screen. The log below is
     durable: every sign-in, claim, approval, reset and visit recorded.

     THE LOG IS A MODAL, THE STRIP IS NOT: a glance should not cost a
     click; a history lookup wants the room. */
  var EVENT_LABELS = {
    online: 'On the site',
    login: 'Signed in',
    invite_claimed: 'Claimed an invite',
    pair_by_email: 'Paired to their Google account',
    pair_preapproved: 'Paired (pre-approved address)',
    claim_pending: 'Asked for access',
    claim_approved: 'Access approved',
    claim_declined: 'Access declined',
    claim_rejected: 'Access refused',
    claim_bad_key: 'Wrong key entered',
    claim_stale: 'Stale claim dropped',
    claim_dropped: 'Claim dropped',
    name_set: 'Set their name',
    auth_reset: 'Login reset',
    invite_sent: 'Invite emailed',
    invite_link_created: 'Invite link made',
    signin_email_sent: 'Sign-in email sent',
    student_created: 'Added to the roster',
    student_deleted: 'Removed from the roster',
    attempts_deleted: 'Test history removed',
    lead_provisioned: 'Inquiry provisioned',
    lead_duplicate: 'Inquiry (already on file)',
    admin_login: 'Admin signed in',
    admin_denied: 'Admin sign-in refused'
  };
  // The ones that are somebody trying to get in and failing, or an account
  // being taken away. Coloured, because they are the rows worth noticing.
  var EVENT_WARN = {
    claim_rejected: 1, claim_bad_key: 1, claim_declined: 1,
    admin_denied: 1, auth_reset: 1, student_deleted: 1
  };

  function eventLabel(e) { return EVENT_LABELS[e] || e.replace(/_/g, ' '); }

  function clockTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var day = '';
    var today = new Date();
    var sameDay = d.toDateString() === today.toDateString();
    var yest = new Date(today.getTime() - 86400000);
    if (sameDay) day = 'Today';
    else if (d.toDateString() === yest.toDateString()) day = 'Yesterday';
    else day = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return day + ' ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  /* Drawn from accessRoster, which now carries presence, so it costs no
     extra request and refreshes on the panel's own poll. */
  function onlineStrip() {
    var on = students.filter(function (s) { return s.online; });
    if (!on.length) {
      return '<div class="mta-live-none">Nobody is on the site right now. ' +
        '<button class="mta-linkbtn" id="mta-log-open">Sign-in log</button></div>';
    }
    return '<div class="mta-sec">On the site now' +
        '<button class="mta-linkbtn" id="mta-log-open">Sign-in log</button></div>' +
      '<div class="mta-live">' + on.map(function (s) {
        return '<div class="mta-liverow">' +
          '<span class="mta-dot"></span>' +
          '<b>' + esc(s.name || s.grantedEmail || s.key) + '</b>' +
          (s.presenceWhere ? '<span class="mta-livewhere">' + esc(s.presenceWhere) + '</span>' : '') +
          (s.presenceSince ? '<span class="mta-livesince">since ' + esc(clockTime(s.presenceSince)) + '</span>' : '') +
          '</div>';
      }).join('') + '</div>';
  }

  var logTimer = null, logFilter = '';
  function stopLogPoll() { if (logTimer) { clearInterval(logTimer); logTimer = null; } }

  function activityLogFlow() {
    logFilter = '';
    // A failure from a previous open must not greet the next one.
    logFailed = false;
    var m = modal(
      '<h3 style="margin:0 0 0.2rem;">Sign-in log</h3>' +
      '<div class="mta-sub" style="margin-bottom:0.6rem;">Every sign-in, visit, claim and reset the portal has recorded, newest first. ' +
      'A visit row grows while the student is on the site and stops when they leave.</div>' +
      '<input class="mta-in" id="mta-log-q" placeholder="Filter by name, key, email or what happened">' +
      '<div class="mta-logwrap" id="mta-log-list"><div class="mta-empty">Loading…</div></div>' +
      '<div class="acts"><button class="mta-b" id="mta-log-close">Close</button></div>');
    // The poll belongs to this modal and must not outlive it -- closeModal
    // removes the node, so anything still ticking would be writing into a
    // detached element forever.
    m.addEventListener('click', function (e) { if (e.target === m) stopLogPoll(); });
    m.querySelector('#mta-log-close').addEventListener('click', function () { stopLogPoll(); closeModal(); });
    m.querySelector('#mta-log-q').addEventListener('input', function (e) {
      logFilter = String(e.target.value || '').toLowerCase();
      renderLog();
    });
    loadLog();
    stopLogPoll();
    logTimer = setInterval(function () {
      if (!document.getElementById('mta-modal')) { stopLogPoll(); return; }
      loadLog();
    }, 30000);
  }

  var logEvents = [], logOnline = [], logFailed = false;
  function loadLog() {
    post({ action: 'authLog', adminKey: adminKey(), limit: 250 }).then(function (data) {
      if (!document.getElementById('mta-log-list')) { stopLogPoll(); return; }
      if (!data || !data.ok) {
        if (reGateIfSignedOut(data, false)) { stopLogPoll(); return; }
        logFailed = true; renderLog(); return;
      }
      logFailed = false;
      logEvents = data.events || [];
      logOnline = data.online || [];
      renderLog();
    });
  }

  function renderLog() {
    var el = document.getElementById('mta-log-list');
    if (!el) return;
    if (logFailed && !logEvents.length) {
      el.innerHTML = '<div class="mta-empty">Could not reach the server just now — it retries every 30 seconds.</div>';
      return;
    }
    var onKeys = {};
    logOnline.forEach(function (o) { onKeys[o.key] = o; });
    var rows = logEvents.filter(function (e) {
      if (!logFilter) return true;
      return (e.name + ' ' + e.key + ' ' + e.email + ' ' + eventLabel(e.event) + ' ' + e.detail)
        .toLowerCase().indexOf(logFilter) !== -1;
    });
    if (!rows.length) {
      el.innerHTML = '<div class="mta-empty">' +
        (logEvents.length ? 'Nothing matches that.' : 'Nothing logged yet.') + '</div>';
      return;
    }
    el.innerHTML = rows.map(function (e) {
      var live = e.event === 'online' && onKeys[e.key];
      return '<div class="mta-logrow' + (EVENT_WARN[e.event] ? ' warn' : '') + '">' +
        '<div class="mta-logtime">' + esc(clockTime(e.at)) + '</div>' +
        '<div>' +
          '<div class="mta-logwho">' +
            (live ? '<span class="mta-dot"></span>' : '') +
            esc(e.name || e.email || e.key || '—') +
            (e.key ? ' <span class="mta-logkey">' + esc(e.key) + '</span>' : '') +
          '</div>' +
          '<div class="mta-logwhat">' + esc(eventLabel(e.event)) +
            (e.detail ? ' · <span class="mta-logdetail">' + esc(e.detail) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ═══ MODAL ═══ */
  function closeModal() {
    var m = document.getElementById('mta-modal');
    if (m) m.remove();
  }
  function modal(innerHtml) {
    closeModal();
    var m = document.createElement('div');
    m.id = 'mta-modal';
    m.innerHTML = '<div class="box">' + innerHtml + '</div>';
    m.addEventListener('click', function (e) { if (e.target === m) closeModal(); });
    document.body.appendChild(m);
    return m;
  }

  /* The intake form, for families who did NOT come through the website
     (a call, a text, a Messenger thread), which is most of them. Only one
     field is required. */
  /* ═══ QUICK ADD ═══ one field (an email or a phone number), returning a
     link to paste into the conversation Luca is already in. Name and email
     arrive at sign-in; grade and goal during onboarding. The full form is
     still there to record more up front. */
  function quickAddFlow() {
    var m = modal(
      '<h3>Quick add</h3>' +
      '<p class="hint">Paste an email address <b>or</b> a phone number &mdash; whichever you have. ' +
      'Everything else (name, grade, what they want help with) arrives by itself when the student ' +
      'signs in.</p>' +
      '<label>Email or phone</label>' +
      '<input id="mta-q-in" placeholder="dana@example.com  or  (201) 555-0100" autofocus>' +
      '<div class="chk"><input type="checkbox" id="mta-q-student">' +
      '<span>That address is the <b>student\u2019s own</b>, not a parent\u2019s &mdash; ' +
      'pre-approves them, so they just sign in with no invite at all.</span></div>' +
      '<div class="err" id="mta-q-err"></div>' +
      '<div class="acts">' +
        '<button class="mta-b" id="mta-q-cancel">Cancel</button>' +
        '<button class="mta-b pri" id="mta-q-go">Add</button>' +
      '</div>' +
      '<div id="mta-q-out"></div>');

    var err = m.querySelector('#mta-q-err');
    var out = m.querySelector('#mta-q-out');
    m.querySelector('#mta-q-cancel').addEventListener('click', function () { closeModal(); refresh(); });
    m.querySelector('#mta-q-in').addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    m.querySelector('#mta-q-go').addEventListener('click', submit);

    function submit() {
      var raw = m.querySelector('#mta-q-in').value.trim();
      var isStudent = m.querySelector('#mta-q-student').checked;
      if (!raw) { err.textContent = 'Paste an email address or a phone number.'; return; }
      var looksEmail = raw.indexOf('@') !== -1;
      if (looksEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
        err.textContent = "That email doesn't look right \u2014 check it.";
        return;
      }
      // Digits only, so "(201) 555-0100" and "201-555-0100" both pass.
      if (!looksEmail && raw.replace(/\D/g, '').length < 7) {
        err.textContent = "That doesn't look like an email address or a phone number.";
        return;
      }
      if (!looksEmail && isStudent) {
        err.textContent = 'A phone number cannot pre-approve anyone \u2014 untick that, or paste ' +
          "the student's email address instead.";
        return;
      }
      err.textContent = '';
      var btn = m.querySelector('#mta-q-go');
      btn.disabled = true; btn.textContent = 'Adding\u2026';

      var student = { source: 'Text message' };
      if (looksEmail && isStudent) student.studentEmail = raw;
      else if (looksEmail) student.guardianEmail = raw;
      else student.phone = raw;

      post({ action: 'createStudent', adminKey: adminKey(), student: student }).then(function (d) {
        btn.disabled = false; btn.textContent = 'Add';
        if (!d || !d.ok) { err.textContent = 'Could not add: ' + ((d && d.error) || 'unknown error'); return; }
        refresh();
        if (looksEmail && isStudent) {
          out.innerHTML = '<p class="hint" style="margin-top:1rem;">Done. <b>' + esc(raw) + '</b> is ' +
            'pre-approved &mdash; they just sign in. Nothing to send.</p>' +
            '<div class="keybig">' + esc(d.key) + '</div>';
          return;
        }
        // Mint a link straight away: he is mid-conversation and the whole
        // point is that he does not have to come back for a second step.
        post({ action: 'sendInvite', adminKey: adminKey(), key: d.key, deliver: 'link' }).then(function (r) {
          if (!r || !r.ok) { err.textContent = 'Row added, but could not make a link: ' +
            ((r && r.error) || 'error') + '. Use Send invite on the row below.'; return; }
          var msg = inviteMessage(r.link, '');
          copyText(msg).then(function (ok) {
            out.innerHTML = '<p class="hint" style="margin-top:1rem;">' +
              (ok ? 'Message copied &mdash; paste it into your text or Messenger thread.'
                  : 'Could not copy automatically &mdash; select the text below.') +
              ' Key <b>' + esc(d.key) + '</b>.</p>' +
              '<div class="linkbox">' + esc(msg).replace(/\n/g, '<br>') + '</div>';
          });
          refresh();
        });
      });
    }
  }

  function newStudentFlow() {
    var m = modal(
      '<h3>New student</h3>' +
      '<p class="hint">For a family who reached you by phone, text or Messenger. ' +
      'Anyone who came through the website already has a row waiting.</p>' +
      '<label>Parent name</label><input id="mta-f-gname" placeholder="Sarah Chen">' +
      '<label>Parent email <span style="text-transform:none;font-weight:400;">— optional</span></label>' +
      '<input id="mta-f-gemail" type="email" placeholder="sarah@example.com">' +
      '<p class="hint" style="margin:0.35rem 0 0;">Leave blank if you do not have it. You will get a link to ' +
      'text or message instead. Note the Friday progress email needs an address, so add one later if you want that.</p>' +
      '<label>Student’s email <span style="text-transform:none;font-weight:400;">— optional</span></label>' +
      '<input id="mta-f-semail" type="email" placeholder="owen@example.com">' +
      '<p class="hint" style="margin:0.35rem 0 0;">If the parent gave you the <b>child’s</b> address, put it ' +
      'here, not above. They can then just sign in — no key, no invite, no approval. Leave blank if you do ' +
      'not have it; it arrives by itself when they sign in.</p>' +
      '<label>Phone <span style="text-transform:none;font-weight:400;">— optional</span></label>' +
      '<input id="mta-f-phone" placeholder="(201) 555-0100">' +
      '<label>Student name <span style="text-transform:none;font-weight:400;">— optional</span></label>' +
      '<input id="mta-f-name" placeholder="Leave blank — the student fills this in when they sign in">' +
      '<label>Grade</label>' +
      '<select id="mta-f-grade"><option value=""></option><option>9th or below</option>' +
      '<option>10th</option><option>11th</option><option>12th</option></select>' +
      '<label>How did they reach you?</label>' +
      '<select id="mta-f-source">' + SOURCES.map(function (x) {
        return '<option' + (x === 'Phone call' ? ' selected' : '') + '>' + esc(x) + '</option>';
      }).join('') + '</select>' +
      '<div class="chk"><input type="checkbox" id="mta-f-subject">' +
      '<span>Subject tutoring only &mdash; hide all the SAT material from them. ' +
      'Leave unticked for SAT prep, which is the default.</span></div>' +
      '<div class="err" id="mta-f-err"></div>' +
      '<div class="acts">' +
        '<button class="mta-b" id="mta-f-cancel">Cancel</button>' +
        '<button class="mta-b pri" id="mta-f-create">Create student</button>' +
      '</div>');

    m.querySelector('#mta-f-cancel').addEventListener('click', closeModal);
    m.querySelector('#mta-f-create').addEventListener('click', function () {
      var btn = m.querySelector('#mta-f-create');
      var err = m.querySelector('#mta-f-err');
      var email = m.querySelector('#mta-f-gemail').value.trim();
      var semail = m.querySelector('#mta-f-semail').value.trim();
      var gname = m.querySelector('#mta-f-gname').value.trim();
      var RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !RE.test(email)) {
        err.textContent = "That parent email doesn't look right \u2014 check it, or leave it blank.";
        return;
      }
      if (semail && !RE.test(semail)) {
        err.textContent = "That student email doesn't look right \u2014 check it, or leave it blank.";
        return;
      }
      // Checked here as well as on the server so Luca is told BEFORE a key
      // is issued rather than after.
      if (semail && email && semail.toLowerCase() === email.toLowerCase()) {
        err.textContent = 'Those are the same address. A shared family mailbox goes in ONE of the two ' +
          'fields \u2014 whichever the portal should belong to.';
        return;
      }
      err.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Creating…';
      post({ action: 'createStudent', adminKey: adminKey(), student: {
        guardianEmail: email,
        studentEmail: semail,
        guardianName: gname,
        phone: m.querySelector('#mta-f-phone').value.trim(),
        name: m.querySelector('#mta-f-name').value.trim(),
        grade: m.querySelector('#mta-f-grade').value,
        source: m.querySelector('#mta-f-source').value,
        subjectOnly: m.querySelector('#mta-f-subject').checked
      } }).then(function (data) {
        btn.disabled = false;
        btn.textContent = 'Create student';
        if (!data || !data.ok) {
          err.textContent = 'Could not create: ' + ((data && data.error) || 'unknown error');
          return;
        }
        refresh();
        deliverFlow(data.key, email, gname, semail);
      });
    });
    m.querySelector('#mta-f-gname').focus();
  }

  /* Handing the invite over. Three ways, because there are three ways this
     conversation is actually happening: an email thread, a text or
     Messenger chat, or a phone call where nothing can be sent at all. */
  function deliverFlow(key, email, gname, studentEmail) {
    /* Pre-approved means no invite: sending one would create a needless
       second credential. */
    if (studentEmail) {
      /* No invite is needed, but the student still has to be told the portal
         exists, so offer the sign-in message instead. */
      var pm = modal(
        '<h3>Ready \u2014 no invite needed</h3>' +
        '<p class="hint">Created, and <b>' + esc(studentEmail) + '</b> is pre-approved. They just open the ' +
        'portal and sign in with that Google account. No key, no invite, no approval \u2014 but they do ' +
        'need telling.</p>' +
        '<div class="keybig">' + esc(key) + '</div>' +
        '<div class="acts" style="justify-content:flex-start;">' +
          '<button class="mta-b pri" id="mta-d-semail">Email them the details</button>' +
          '<button class="mta-b" id="mta-d-scopy">Copy message</button>' +
        '</div>' +
        '<div id="mta-d-sout"></div>' +
        '<div class="err" id="mta-d-serr"></div>' +
        '<p class="hint">That key is only a spare, for if they end up signing in on a different address.</p>' +
        '<div class="acts"><button class="mta-b" id="mta-d-done2">Done</button></div>');
      var sout = pm.querySelector('#mta-d-sout');
      var serr = pm.querySelector('#mta-d-serr');
      pm.querySelector('#mta-d-semail').addEventListener('click', function () {
        var b = pm.querySelector('#mta-d-semail');
        b.disabled = true;
        serr.textContent = '';
        sout.innerHTML = '<p class="hint" style="margin-top:0.8rem;">Sending\u2026</p>';
        post({ action: 'sendStudentSignIn', adminKey: adminKey(), key: key }).then(function (d) {
          b.disabled = false;
          if (!d || !d.ok) {
            sout.innerHTML = '';
            serr.textContent = actionFailure(d);
            return;
          }
          sout.innerHTML = '<p class="hint" style="margin-top:0.8rem;">Sent to <b>' + esc(d.sentTo) +
            '</b>. Nothing in it expires.</p>';
        });
      });
      pm.querySelector('#mta-d-scopy').addEventListener('click', function () {
        var msg = signInMessage('');
        copyText(msg).then(function (ok) {
          sout.innerHTML = '<p class="hint" style="margin-top:0.8rem;">' +
            (ok ? 'Message copied &mdash; paste it straight in.'
                : 'Could not copy automatically &mdash; select the text below.') + '</p>' +
            '<div class="linkbox">' + esc(msg).replace(/\n/g, '<br>') + '</div>';
        });
      });
      pm.querySelector('#mta-d-done2').addEventListener('click', function () { closeModal(); refresh(); });
      return;
    }
    deliverInviteFlow(key, email, gname);
  }

  function deliverInviteFlow(key, email, gname) {
    var m = modal(
      '<h3>Send the invite</h3>' +
      '<p class="hint">Created &mdash; access key below. Nobody can get in until this invite is used, ' +
      'and it works once.</p>' +
      '<div class="keybig">' + esc(key) + '</div>' +
      (email
        ? '<div class="acts" style="justify-content:flex-start;margin-top:1rem;">' +
          '<button class="mta-b pri" id="mta-d-email">Email it to ' + esc(email) + '</button></div>'
        : '<p class="hint" style="margin-top:1rem;">No email on file, so email delivery is off. ' +
          'Copy the link below into your text or Messenger thread.</p>') +
      '<div class="acts" style="justify-content:flex-start;">' +
        '<button class="mta-b" id="mta-d-link">Copy invite link</button>' +
        '<button class="mta-b" id="mta-d-msg">Copy whole message</button>' +
      '</div>' +
      '<div id="mta-d-out"></div>' +
      '<div class="err" id="mta-d-err"></div>' +
      '<div class="acts"><button class="mta-b" id="mta-d-done">Done</button></div>');

    var out = m.querySelector('#mta-d-out');
    var err = m.querySelector('#mta-d-err');
    m.querySelector('#mta-d-done').addEventListener('click', function () { closeModal(); refresh(); });

    function mint(deliver, then) {
      err.textContent = '';
      out.innerHTML = '<p class="hint" style="margin-top:0.8rem;">Working…</p>';
      post({ action: 'sendInvite', adminKey: adminKey(), key: key, deliver: deliver })
        .then(function (d) {
          if (!d || !d.ok) {
            out.innerHTML = '';
            err.textContent = 'Failed: ' + ((d && d.error) || 'unknown error');
            return;
          }
          then(d);
          refresh();
        });
    }

    if (email) {
      m.querySelector('#mta-d-email').addEventListener('click', function () {
        mint('email', function (d) {
          out.innerHTML = '<p class="hint" style="margin-top:0.8rem;">Sent to <b>' + esc(d.sentTo) +
            '</b>. Expires in ' + d.expiresInDays + ' days.</p>';
        });
      });
    }
    // NOTE: each of these mints a FRESH link, which invalidates the previous
    // one (single-use). Copying a link after emailing one kills the emailed
    // link, so say so.
    m.querySelector('#mta-d-link').addEventListener('click', function () {
      mint('link', function (d) {
        copyText(d.link).then(function (ok) {
          out.innerHTML = '<p class="hint" style="margin-top:0.8rem;">' +
            (ok ? 'Copied. ' : 'Could not copy automatically &mdash; select it below. ') +
            'Paste it into your text or Messenger thread. Expires in ' + d.expiresInDays + ' days. ' +
            '<b>Any link you sent before this one no longer works.</b></p>' +
            '<div class="linkbox">' + esc(d.link) + '</div>';
        });
      });
    });
    m.querySelector('#mta-d-msg').addEventListener('click', function () {
      mint('link', function (d) {
        var msg = inviteMessage(d.link, gname ? gname.split(' ')[0] : '');
        copyText(msg).then(function (ok) {
          out.innerHTML = '<p class="hint" style="margin-top:0.8rem;">' +
            (ok ? 'Message copied &mdash; paste it straight in. '
                : 'Could not copy automatically &mdash; select the text below and copy it by hand. ') +
            '<b>Any link you sent before this one no longer works.</b></p>' +
            '<div class="linkbox">' + esc(msg).replace(/\n/g, '<br>') + '</div>';
        });
      });
    });
  }

  /* ═══ PANEL ═══ */
  function ensureRoot() {
    if (root) return root;
    injectStyles();
    root = document.createElement('div');
    root.id = 'mta-access';
    root.innerHTML =
      '<div class="mta-body" id="mta-body" style="display:none;">' +
        '<div class="mta-head">' +
          '<h3>Portal access</h3>' +
          '<button class="mta-b pri" id="mta-quick">+ Quick add</button>' +
          '<button class="mta-b" id="mta-new">Full form</button>' +
          '<button class="mta-b" id="mta-close">Hide</button>' +
        '</div>' +
        '<div class="mta-scroll" id="mta-list"></div>' +
      '</div>' +
      '<button class="mta-tab" id="mta-tab">Portal access <span class="mta-badge" id="mta-badge">0</span></button>';
    document.body.appendChild(root);

    listEl = root.querySelector('#mta-list');
    badgeEl = root.querySelector('#mta-badge');
    tabEl = root.querySelector('#mta-tab');

    tabEl.addEventListener('click', function () {
      open = !open;
      root.querySelector('#mta-body').style.display = open ? 'flex' : 'none';
      // Draw the roster fetched at boot as soon as the panel opens, then
      // refresh; waiting on a fresh fetch leaves it blank through a cold start.
      if (open) { render(); refresh(); }
    });
    root.querySelector('#mta-close').addEventListener('click', function () {
      open = false;
      root.querySelector('#mta-body').style.display = 'none';
    });
    root.querySelector('#mta-new').addEventListener('click', newStudentFlow);
    root.querySelector('#mta-quick').addEventListener('click', quickAddFlow);
    return root;
  }

  /* `apply`, when given, updates the local list to match what the server
     just did, so the panel reflects the change immediately even if the
     follow-up fetch is slow or its answer gets lost on the way back. */
  function act(card, label, payload, done, apply) {
    var btns = card.querySelectorAll('button');
    Array.prototype.forEach.call(btns, function (b) { b.disabled = true; });
    var st = card.querySelector('.mta-status');
    st.textContent = label;
    busy++;
    post(payload).then(function (data) {
      if (data && data.ok) {
        st.textContent = done(data);
        // Release busy INSIDE the timeout, where the card is rebuilt: releasing
        // earlier lets a poll redraw the pre-action card with live buttons.
        setTimeout(function () {
          if (apply) { apply(data); render(); }
          busy--;
          refresh(true);
        }, 1200);
        return;
      }
      busy--;
      if (reGateIfSignedOut(data, true)) return;
      st.textContent = actionFailure(data);
      Array.prototype.forEach.call(btns, function (b) { b.disabled = false; });
      if (data && STALE_AFTER.test(data.error)) refresh();
    });
  }

  /* Delete is two-step when the student has recorded work. The first
     request is refused with the count; the card then offers "Delete anyway",
     and only that second, explicit click sends force:true, which removes
     the Attempts rows along with the roster row. */
  function deleteFlow(card, key, force) {
    var payload = { action: 'deleteStudent', adminKey: adminKey(), key: key };
    if (force) payload.force = true;
    var btns = card.querySelectorAll('button');
    Array.prototype.forEach.call(btns, function (b) { b.disabled = true; });
    var st = card.querySelector('.mta-status');
    st.textContent = 'Deleting\u2026';
    busy++;
    post(payload).then(function (data) {
      if (data && data.ok) {
        st.textContent = data.deletedName ? 'Deleted ' + data.deletedName + '.' : 'Deleted.';
        setTimeout(function () {
          students = students.filter(function (x) { return x.key !== key; });
          render();
          busy--;
          refresh(true);
        }, 1200);
        return;
      }
      busy--;
      if (data && data.error === 'has_recorded_work') {
        var n = data.attempts || 0;
        st.innerHTML = 'This student has ' + n + ' recorded test' + (n === 1 ? '' : 's') + '. ' +
          'Deleting removes those scores too. ' +
          '<button class="mta-b warn" id="mta-del-force">Delete anyway</button> ' +
          '<button class="mta-b" id="mta-del-keep">Keep</button>';
        st.querySelector('#mta-del-force').addEventListener('click', function () {
          if (!window.confirm('Delete ' + key + ' AND their ' + n + ' recorded test' + (n === 1 ? '' : 's') + '?\n\nThis cannot be undone from the panel.')) return;
          deleteFlow(card, key, true);
        });
        st.querySelector('#mta-del-keep').addEventListener('click', function () {
          st.textContent = '';
          Array.prototype.forEach.call(btns, function (b) { b.disabled = false; });
        });
        return;
      }
      if (reGateIfSignedOut(data, true)) return;
      st.textContent = actionFailure(data);
      Array.prototype.forEach.call(btns, function (b) { b.disabled = false; });
    });
  }

  /* Is there actually a login to reset? An inquiry nobody has claimed has
     no pairing and no bound address, so the button would be noise — and a
     destructive-looking button that does nothing is worse than none. */
  function canReset(s) {
    // Anything with an account paired, an address bound, or a claim waiting.
    // A brand-new Inquiry has none of those, so the button would do nothing.
    return s.status === 'Active' || s.status === 'Ready' || !!s.grantedEmail || !!s.pending;
  }

  function card(s, actions, extra) {
    // A row with a claim waiting is technically "Inquiry" (nobody paired
    // yet), but it is the one row actually asking Luca a question.
    var pill = s.archived ? { cls: 'inv', text: 'Archived' }
      : s.pending ? { cls: 'inq', text: 'Wants in' }
      : s.status === 'Active' ? { cls: 'act', text: 'Active' }
      : s.status === 'Invited' ? { cls: 'inv', text: 'Invited' }
      // 'Ready': an address is on file and the student pairs on first sign-in.
      // No action needed, so not 'Inquiry', which means "act on me".
      : s.status === 'Ready' ? { cls: 'act', text: 'Ready' }
      : { cls: 'inq', text: 'Inquiry' };
    return '<div class="mta-row" data-key="' + esc(s.key) + '">' +
        '<div class="mta-name">' + esc(s.name || s.guardianName || '(no name yet)') +
          '<span class="mta-pill ' + pill.cls + '">' + esc(pill.text) + '</span></div>' +
        /* grantedEmail first: the address they sign in with, and on a
           pre-approved row the one "Email the student" goes to, so showing
           the parent's would look misdirected. */
        '<div class="mta-sub">' + esc(s.grantedEmail || s.guardianEmail || s.phone || 'no contact on file') + '</div>' +
        '<div class="mta-meta">key <b>' + esc(s.key) + '</b>' +
          (s.grade ? ' &middot; ' + esc(s.grade) : '') +
          (s.source ? ' &middot; ' + esc(s.source) : '') +
          (s.subjectOnly ? ' &middot; subject only' : '') + '</div>' +
        onboardingLine(s) +
        (extra || '') +
        '<div class="mta-acts">' + actions + '</div>' +
        '<div class="mta-status"></div>' +
      '</div>';
  }

  /* What the student entered during onboarding (already stored in the
     Students sheet; the auth log records sign-in events only). One
     wrap-around line rather than a table, since most fields are blank for
     most rows and empty cells read as missing data. Emits nothing when
     every field is empty. */
  function onboardingLine(s) {
    var bits = [];
    if (s.goal) bits.push('wants <b>' + esc(GOAL_LABELS[s.goal] || s.goal) + '</b>');
    if (s.testDate) bits.push('test ' + esc(shortDate(s.testDate)));
    if (s.targetScore) bits.push('target <b>' + esc(s.targetScore) + '</b>');
    // Baseline is only meaningful as a pair, and it is the one number Luca
    // actually starts planning from.
    if (s.baselineRw || s.baselineMath) {
      var total = (Number(s.baselineRw) || 0) + (Number(s.baselineMath) || 0);
      bits.push('baseline ' + (s.baselineType ? esc(s.baselineType.toUpperCase()) + ' ' : '') +
        esc(String(total)) + ' (' + esc(s.baselineRw || '?') + ' RW / ' + esc(s.baselineMath || '?') + ' M)');
    }
    // 1x is "no accommodation" and is not worth a chip; only a real
    // multiplier changes how a test gets built.
    var acc = [];
    if (s.accomTimeMult && Number(s.accomTimeMult) > 1) acc.push(esc(s.accomTimeMult) + 'x time');
    if (s.accomBreakMult && Number(s.accomBreakMult) > 1) acc.push(esc(s.accomBreakMult) + 'x breaks');
    if (acc.length) bits.push('accommodations: ' + acc.join(', '));
    if (!bits.length) return '';
    return '<div class="mta-onb">' + bits.join(' &middot; ') + '</div>';
  }

  var GOAL_LABELS = {
    sat: 'SAT prep',
    admissions: 'college admissions',
    tutoring: 'general tutoring'
  };

  /* Short date from the roster's ISO string, formatted in UTC on purpose:
     a test date is a calendar day stored as midnight UTC, and a timezone
     behind UTC would show the previous day. */
  function shortDate(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString(undefined,
        { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    } catch (e) { return String(iso); }
  }

  /* No separate studentEmail field is needed. statusFor_ defines 'Ready' as
     "an address is on file, nothing paired yet", and GrantedEmail only ever
     holds the student's address (createStudentRow_ writes only that, and
     handleCreateStudent rejects the guardian's), so a 'Ready' row's
     grantedEmail is the student's own. 'Active' is excluded: they have
     already signed in. */
  function studentEmailOf(s) {
    return (s && s.status === 'Ready' && s.grantedEmail) ? s.grantedEmail : '';
  }

  /* WITH THE STUDENT'S OWN ADDRESS, "SEND" CHANGES MEANING. They are
     pre-approved, so an invite would be a needless, expiring second
     credential. The button becomes "Email the student", a separate action
     carrying no token (see the sendInvite note in the dispatcher); Copy
     message returns the same words for a text thread.

     Without a student address: a parent email gets the one-click invite,
     and a row with neither gets the ask-for-an-address variant (a blind
     send would just return "no_recipient"). */
  function inviteButtons(s, label) {
    if (studentEmailOf(s)) {
      return '<button class="mta-b pri" data-act="signin-email">Email the student</button>' +
        '<button class="mta-b" data-act="signin-copy">Copy message</button>';
    }
    return (s.guardianEmail
        ? '<button class="mta-b pri" data-act="invite">' + label + '</button>'
        : '<button class="mta-b" data-act="invite-to">' + label + ' to\u2026</button>') +
      '<button class="mta-b' + (s.guardianEmail ? '' : ' pri') + '" data-act="link">Copy link</button>';
  }

  function render() {
    /* Two jobs. The QUEUE (Needs you / Invited) is strictly things to act on;
       'Ready' and 'Active' resolve without Luca, so they are absent. Every
       other row gets its own quieter section below, so the panel can still
       confirm a row exists. */
    // Nothing to draw yet: say which of the two reasons it is, rather than
    // an empty white box.
    if (!students.length && !loaded) {
      listEl.innerHTML = '<div class="mta-empty">' +
        (loading || !loadFailed ? 'Loading\u2026' : 'Could not reach the server just now \u2014 it will try again shortly.') +
        '</div>';
      return;
    }
    var needs = [], waiting = [], settled = [];
    students.forEach(function (s) {
      if (s.archived && !showArchived) return;
      if (s.pending || s.status === 'Inquiry') needs.push(s);
      else if (s.status === 'Invited') waiting.push(s);
      else settled.push(s);                       // Ready + Active
    });

    var html = '';
    if (loadFailed) {
      html += '<div class="mta-empty" style="padding:0.6rem 1rem;">' +
        (signedOut
          ? 'Your admin sign-in has expired \u2014 reload the page to sign in again. Nothing here will update until you do.'
          : 'Could not refresh just now \u2014 showing the last list. It retries every minute.') +
        '</div>';
    }
    html += onlineStrip();
    html += '<div class="mta-sec">Needs you</div>';
    if (!needs.length) html += '<div class="mta-empty">Nothing waiting.</div>';
    needs.forEach(function (s) {
      if (s.pending) {
        html += card(s,
          '<button class="mta-b pri" data-act="approve">Approve</button>' +
          '<button class="mta-b warn" data-act="decline">Decline</button>',
          '<div class="mta-warnbox">Wants in as <b>' + esc(s.pending.googleName || '—') + '</b> ' +
          '&lt;' + esc(s.pending.email) + '&gt;' +
          (s.pending.requestedAt ? ' &middot; ' + esc(ago(s.pending.requestedAt)) : '') +
          '<br>Approve only if that is the student this key is for.</div>');
      } else {
        html += card(s, inviteButtons(s, 'Send invite') +
          (s.archived
            ? '<button class="mta-b" data-act="unarchive">Restore</button>'
            : '<button class="mta-b" data-act="archive">Dismiss</button>') +
          '<button class="mta-b warn" data-act="delete">Delete</button>' +
          (canReset(s) ? '<button class="mta-b warn" data-act="reset">Reset login</button>' : ''));
      }
    });

    if (waiting.length) {
      html += '<div class="mta-sec">Invited &mdash; not claimed yet</div>';
      waiting.forEach(function (s) {
        // An unclaimed invite is the commonest dead lead. Dismiss archives it
        // and keeps the row; Delete removes it (refused-then-confirm if any
        // recorded work exists).
        html += card(s, inviteButtons(s, 'Re-send') +
          (s.archived
            ? '<button class="mta-b" data-act="unarchive">Restore</button>'
            : '<button class="mta-b" data-act="archive">Dismiss</button>') +
          '<button class="mta-b warn" data-act="delete">Delete</button>' +
          (canReset(s) ? '<button class="mta-b warn" data-act="reset">Reset login</button>' : ''),
          '<div class="mta-meta">sent ' + esc(ago(s.inviteSentAt)) +
          ' &middot; a new link replaces the old one</div>');
      });
    }

    if (settled.length) {
      html += '<div class="mta-sec">Set up &mdash; nothing needed</div>';
      settled.forEach(function (s) {
        /* 'Ready': an address is on file and the student pairs on first
           sign-in. inviteButtons() gives a student address the sign-in email
           and a parent-only row the invite. */
        html += card(s,
          (s.status === 'Ready' ? inviteButtons(s, 'Send invite') : '') +
          (canReset(s) ? '<button class="mta-b warn" data-act="reset">Reset login</button>' : ''),
          s.status === 'Ready'
            ? '<div class="mta-meta">Pre-approved &mdash; they can sign in whenever. ' +
              (studentEmailOf(s) ? 'The button just tells them so.' : 'No invite needed.') + '</div>'
            : '<div class="mta-meta">Signed in' + (s.grantedAt ? ' ' + esc(ago(s.grantedAt)) : '') + '</div>');
      });
    }

    var archivedCount = students.filter(function (s) { return s.archived; }).length;
    if (archivedCount) {
      html += '<div style="padding:0.6rem 1rem 0.2rem;">' +
        '<button class="mta-b" id="mta-arch-toggle">' +
        (showArchived ? 'Hide' : 'Show') + ' ' + archivedCount + ' dismissed</button></div>';
    }

    html += '<div class="mta-sec">Find a student</div>' +
      '<div style="padding:0 1rem 0.8rem;">' +
        '<input class="mta-in" id="mta-q" placeholder="Name, key, email or phone" value="' + esc(query) + '">' +
      '</div>';
    if (query) {
      var q = query.toLowerCase();
      var hits = students.filter(function (s) {
        return [s.name, s.key, s.grantedEmail, s.guardianEmail, s.guardianName, s.phone]
          .join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 8);
      if (!hits.length) html += '<div class="mta-empty">No match.</div>';
      hits.forEach(function (s) {
        html += card(s,
          (s.status === 'Active' ? '' : inviteButtons(s, 'Send invite')) +
          (canReset(s) ? '<button class="mta-b warn" data-act="reset">Reset login</button>' : ''));
      });
    }

    listEl.innerHTML = html;

    var logBtn = listEl.querySelector('#mta-log-open');
    if (logBtn) logBtn.addEventListener('click', activityLogFlow);

    var tog = listEl.querySelector('#mta-arch-toggle');
    if (tog) tog.addEventListener('click', function () { showArchived = !showArchived; render(); });

    var qEl = listEl.querySelector('#mta-q');
    if (qEl) {
      qEl.addEventListener('input', function () { query = qEl.value; render(); });
      if (query) { qEl.focus(); qEl.setSelectionRange(query.length, query.length); }
    }

    Array.prototype.forEach.call(listEl.querySelectorAll('[data-act]'), function (b) {
      b.addEventListener('click', function () {
        var c = b.closest('[data-key]');
        var key = c.getAttribute('data-key');
        var s = students.filter(function (x) { return x.key === key; })[0] || {};
        var a = b.getAttribute('data-act');
        if (a === 'signin-email') {
          /* DELIBERATELY NOT sendInvite: that mints a fresh single-use nonce,
             which kills any link already in a family's inbox (see
             deliverInviteFlow and setup.html). This email carries no
             credential, so it has its own backend action. The address shown
             comes back from the server, so it is what was actually used. */
          act(c, 'Sending…', { action: 'sendStudentSignIn', adminKey: adminKey(), key: key },
            function (d) { return 'Sign-in details emailed to ' + d.sentTo + '. Nothing expires.'; });
        } else if (a === 'signin-copy') {
          // No server call: there is nothing to mint, so the message can be
          // built here and pasted into whatever thread is already open.
          copyText(signInMessage((s.name || '').split(' ')[0])).then(function (ok) {
            c.querySelector('.mta-status').textContent = ok
              ? 'Message copied — paste it into your text or Messenger thread.'
              : 'Could not copy automatically — open the student email action instead.';
          });
        } else if (a === 'invite') {
          act(c, 'Sending…', { action: 'sendInvite', adminKey: adminKey(), key: key, deliver: 'email' },
            function (d) { return 'Invite emailed to ' + d.sentTo + '.'; });
        } else if (a === 'invite-to') {
          var to = window.prompt(
            'Email the invite for ' + key + ' to which address?\n\n' +
            'This row has no email on file. The address is used for this one send and is not saved to the row.', '');
          if (to == null) return;
          to = to.trim().toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            c.querySelector('.mta-status').textContent = "That doesn't look like an email address.";
            return;
          }
          act(c, 'Sending…', { action: 'sendInvite', adminKey: adminKey(), key: key, deliver: 'email', to: to },
            function (d) { return 'Invite emailed to ' + d.sentTo + '.'; });
        } else if (a === 'link') {
          act(c, 'Making a link…', { action: 'sendInvite', adminKey: adminKey(), key: key, deliver: 'link' },
            function (d) {
              copyText(inviteMessage(d.link, (s.guardianName || '').split(' ')[0]));
              return 'Message copied — paste it into your text or Messenger thread. Any earlier link is now dead.';
            });
        } else if (a === 'approve') {
          act(c, 'Approving…', { action: 'decideClaim', adminKey: adminKey(), key: key, decision: 'approve' },
            function () { return 'Approved — they are being let in now.'; });
        } else if (a === 'decline') {
          act(c, 'Declining…', { action: 'decideClaim', adminKey: adminKey(), key: key, decision: 'decline' },
            function () { return 'Declined. Nothing was granted.'; });
        } else if (a === 'delete') {
          /* Blunter than the reset confirmation: this removes the row. The server
             refuses if the student has recorded work, so promise only "test
             rows and dead leads". */
          if (!window.confirm(
                'Permanently delete ' + key + '?\n\n' +
                'This removes the roster row entirely. It is refused if the student has any ' +
                'recorded tests or scores \u2014 use Dismiss for those instead.\n\n' +
                'Their Drive folder is NOT deleted; you can remove it yourself if you want it gone.')) return;
          deleteFlow(c, key, false);
        } else if (a === 'archive' || a === 'unarchive') {
          act(c, a === 'archive' ? 'Dismissing\u2026' : 'Restoring\u2026',
            { action: 'setStudentArchived', adminKey: adminKey(), key: key, archived: a === 'archive' },
            function () { return a === 'archive' ? 'Dismissed.' : 'Restored.'; },
            function () { if (s.key) s.archived = (a === 'archive'); });
        } else if (a === 'reset') {
          if (!window.confirm(
                'Reset the login for ' + key + '?\n\n' +
                'This unlinks their Google account, signs them out everywhere, and revokes that ' +
                "address's access to their files folder. If that sign-in supplied the name on the row " +
                'or went through the intro questions, those are cleared too, so the right person is asked ' +
                'again. Scores, reports and the folder itself are untouched. You can send a fresh invite afterwards.')) return;
          act(c, 'Resetting…', { action: 'resetStudentAuth', adminKey: adminKey(), key: key },
            function (d) {
              var bits = [];
              if (d.revokedEmail) bits.push(d.revokedEmail + ' no longer has access');
              if (d.nameCleared) bits.push('their name taken off the row');
              if (d.onboardingCleared) bits.push('intro answers cleared');
              return 'Reset' + (bits.length ? ' — ' + bits.join(', ') + '.' : '.');
            });
        }
      });
    });
  }

  /* The gate script restores a stored session into sessionStorage on boot,
     BEFORE the page unlocks, so "a token exists" is the wrong test. Ask
     whether a gate is still on screen instead. */
  function gateIsUp() {
    /* Stay clear of BOTH gates: the Google one and admin.html's password
       gate (#gate), which has no z-index, so this fixed z-index 8000 panel
       would float over it. Visibility is measured, not inferred: #gate is
       hidden by script, and #mta-admin-gate is position:fixed (offsetParent
       is null even when visible). */
    var ids = ['mta-admin-gate', 'gate'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (!el) continue;
      if (getComputedStyle(el).display === 'none') continue;
      if (el.getBoundingClientRect().height > 0) return true;
    }
    return false;
  }

  function refresh(force) {
    if (gateIsUp()) { if (root) root.style.display = 'none'; return; }
    var k = adminKey();
    // admin.html gates itself behind the admin key; until that gate is
    // passed there is nothing to ask for and nothing worth showing.
    if (!k) { if (root) root.style.display = 'none'; return; }
    if (root) root.style.display = '';
    // A forced refresh (one that follows a write) is never dropped; it just
    // supersedes whatever is in flight.
    if (loading && !force) { refreshQueued = true; return; }
    var seq = ++rosterSeq;
    loading = true;
    post({ action: 'accessRoster', adminKey: k }).then(function (data) {
      // Superseded by a newer request (typically an action's own refresh), so
      // this older snapshot must not land. Return BEFORE clearing `loading`,
      // which belongs to the request still running.
      if (seq !== rosterSeq) return;
      loading = false;
      if (!data || !data.ok) {
        if (reGateIfSignedOut(data, false)) return;
        loadFailed = true;
        if (open && !busy) render();
        return;
      }
      loaded = true;
      loadFailed = false;
      students = data.students || [];
      var n = students.filter(function (s) {
        return !s.archived && (s.pending || s.status === 'Inquiry');
      }).length;
      badgeEl.textContent = n;
      badgeEl.style.display = n ? '' : 'none';
      tabEl.style.opacity = n ? '1' : '0.75';
      if (open && !busy) render();
      // A refresh that arrived while this one was in flight: this answer is
      // already drawn, so the queued one is a follow-up, not a replacement.
      if (refreshQueued) { refreshQueued = false; refresh(true); }
    });
  }

  /* Kept on window as well: the console is the fastest path for a one-off,
     and it keeps the pipeline operable if the panel is ever hidden by a
     layout change. */
  window.mtaNewStudent = function (guardianEmail, opts) {
    opts = opts || {}; opts.guardianEmail = guardianEmail;
    return post({ action: 'createStudent', adminKey: adminKey(), student: opts })
      .then(function (d) { refresh(); return d; });
  };
  window.mtaSendInvite = function (key, to) {
    return post({ action: 'sendInvite', adminKey: adminKey(), key: key, to: to, deliver: 'email' })
      .then(function (d) { refresh(); return d; });
  };
  window.mtaInviteLink = function (key) {
    return post({ action: 'sendInvite', adminKey: adminKey(), key: key, deliver: 'link' })
      .then(function (d) { refresh(); return d && d.link; });
  };
  window.mtaResetStudentAuth = function (key) {
    return post({ action: 'resetStudentAuth', adminKey: adminKey(), key: key })
      .then(function (d) { refresh(); return d; });
  };
  window.mtaRefreshAccess = refresh;

  /* Show or hide the tab to match the gates, without a network call. A
     MutationObserver sees each gate transition (#gate hidden by a style
     change, the Google gate appended and shown) the moment it happens,
     rather than waiting on refresh() through a slow cold start. The first
     time the page is unlocked, fetch the queue. */
  var wasShown = false;
  function syncVisibility() {
    if (!root) return;
    var show = !gateIsUp() && !!adminKey();
    root.style.display = show ? '' : 'none';
    if (show && !wasShown) { wasShown = true; refresh(); }
    if (!show) wasShown = false;
  }

  function boot() {
    ensureRoot();
    if (root) root.style.display = 'none';   // hidden until proven unlocked
    syncVisibility();
    try {
      new MutationObserver(syncVisibility).observe(document.documentElement, {
        attributes: true, attributeFilter: ['style', 'class'], childList: true, subtree: true
      });
    } catch (e) {}
    /* Belt and braces: cheap (no network), and it covers a browser without
       MutationObserver or a gate hidden some way the observer misses. */
    setInterval(syncVisibility, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(refresh, POLL_MS);
})();
