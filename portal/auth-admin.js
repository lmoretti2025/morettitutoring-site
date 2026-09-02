/* =========================================================================
   MORETTI PORTAL ADMIN — THE ACCESS PANEL
   -------------------------------------------------------------------------
   Adds a "Portal access" panel to portal/admin.html with ONE <script> tag
   and no other edit to that file. It builds its own markup, reads the admin
   key from the same sessionStorage entry admin.html already writes on
   unlock, and styles itself from admin.html's own CSS variables so it does
   not read as bolted on.

   WHY IT INJECTS RATHER THAN SHIPPING MARKUP. admin.html is a live file
   with other work happening in it. Everything here is additive and
   removable — delete the script tag and admin.html is exactly as it was.
   If it earns a permanent home later, this markup moves into that file.

   WHY IT IS AN ACTION QUEUE, NOT A SECOND ROSTER. admin.html already lists
   every student. Duplicating that would be noise. This shows only rows
   where there is something to DO — an inquiry with no invite sent, an
   invite not yet claimed, a claim waiting on approval — plus a search box
   so any student can be found for a login reset.

   EVERY CHANNEL, NOT JUST THE WEBSITE FORM. Most families do not arrive
   through a form. They call, they text, they message on Facebook. So the
   invite is a LINK first and an email second: "Copy invite link" hands
   back the same single-use token to paste into whatever conversation is
   already open, and "Copy message" hands back the whole thing written out.
   A family who never gives an email at all still gets in — theirs arrives
   by itself, verified, when the student signs in with Google.
   ========================================================================= */

(function () {
  'use strict';

  var URL_ = 'https://script.google.com/macros/s/AKfycbwsLMGq3lhBEPObcas0k8gVS67NX9y4wXKG6RgzKtlBOT2SXfREK6vBpvvM19w9s1m6/exec';
  var SESSION_KEY = 'moretti_admin_key';   // the entry admin.html writes on unlock
  var POLL_MS = 60000;
  var SOURCES = ['Website', 'Phone call', 'Text message', 'Facebook Messenger', 'Referral', 'In person', 'Other'];

  var root = null, listEl = null, badgeEl = null, tabEl = null;
  var students = [];
  var open = false, query = '', loading = false;

  function adminKey() {
    try { return sessionStorage.getItem(SESSION_KEY); } catch (e) { return null; }
  }

  function post(payload) {
    return fetch(URL_, { method: 'POST', body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: 'network' }; });
  }

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

  /* navigator.clipboard needs a secure context. admin.html is served over
     https so it is available in practice, but a fallback matters here more
     than usual: the whole point of "copy link" is that Luca is mid-message
     to a parent, and silently copying nothing would have him paste the
     previous clipboard contents into a real conversation. */
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

  /* ═══ STYLES ═══ scoped under the panel's own ids so nothing here can
     reach admin.html's elements. Colours come from its :root variables,
     with literal fallbacks so this still looks deliberate if those are
     ever renamed. */
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
      'border-radius:8px;margin-top:0.5rem;}'
    ].join('');
    document.head.appendChild(css);
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

  /* The intake form. This is the path for every family who did NOT come
     through the website — a phone call, a text, a Messenger thread — which
     in this business is most of them. Only one field is required, because
     at the moment Luca fills this in he has just put the phone down and
     that is genuinely all he reliably has. */
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
    /* Pre-approved means there is nothing to send. Saying so plainly is the
       point: otherwise Luca dutifully sends an invite the student never
       needed, and a second credential exists for no reason. */
    if (studentEmail) {
      var pm = modal(
        '<h3>Ready \u2014 nothing to send</h3>' +
        '<p class="hint">Created, and <b>' + esc(studentEmail) + '</b> is pre-approved. They just open the ' +
        'portal and sign in with that Google account. No key, no invite, no approval.</p>' +
        '<div class="keybig">' + esc(key) + '</div>' +
        '<p class="hint">That key is only a spare, for if they end up signing in on a different address.</p>' +
        '<div class="acts"><button class="mta-b pri" id="mta-d-done2">Done</button></div>');
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
    // NOTE: each of these mints a FRESH link, which invalidates the one
    // before it. That is the single-use guarantee doing its job, but it
    // means copying a link after emailing one silently kills the emailed
    // one — so say so rather than letting Luca find out from a parent.
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
          '<button class="mta-b pri" id="mta-new">+ New student</button>' +
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
      if (open) refresh();
    });
    root.querySelector('#mta-close').addEventListener('click', function () {
      open = false;
      root.querySelector('#mta-body').style.display = 'none';
    });
    root.querySelector('#mta-new').addEventListener('click', newStudentFlow);
    return root;
  }

  function act(card, label, payload, done) {
    var btns = card.querySelectorAll('button');
    Array.prototype.forEach.call(btns, function (b) { b.disabled = true; });
    var st = card.querySelector('.mta-status');
    st.textContent = label;
    post(payload).then(function (data) {
      if (data && data.ok) {
        st.textContent = done(data);
        setTimeout(refresh, 1200);
      } else {
        st.textContent = 'Failed: ' + ((data && data.error) || 'unknown error');
        Array.prototype.forEach.call(btns, function (b) { b.disabled = false; });
      }
    });
  }

  /* Is there actually a login to reset? An inquiry nobody has claimed has
     no pairing and no bound address, so the button would be noise — and a
     destructive-looking button that does nothing is worse than none. */
  function canReset(s) {
    return s.status === 'Active' || !!s.grantedEmail;
  }

  function card(s, actions, extra) {
    // A row with a claim waiting is technically still "Inquiry" — nobody is
    // paired yet — but labelling it that way buries the one thing on this
    // panel that is actually asking Luca a question.
    var pill = s.archived ? { cls: 'inv', text: 'Archived' }
      : s.pending ? { cls: 'inq', text: 'Wants in' }
      : s.status === 'Active' ? { cls: 'act', text: 'Active' }
      : s.status === 'Invited' ? { cls: 'inv', text: 'Invited' }
      // 'Ready' means an address is on file and the student pairs by
      // themselves on first sign-in — no action, so it must not be
      // mislabelled 'Inquiry', which is the one word on this panel that
      // means "do something about me".
      : s.status === 'Ready' ? { cls: 'act', text: 'Ready' }
      : { cls: 'inq', text: 'Inquiry' };
    return '<div class="mta-row" data-key="' + esc(s.key) + '">' +
        '<div class="mta-name">' + esc(s.name || s.guardianName || '(no name yet)') +
          '<span class="mta-pill ' + pill.cls + '">' + esc(pill.text) + '</span></div>' +
        '<div class="mta-sub">' + esc(s.grantedEmail || s.guardianEmail || s.phone || 'no contact on file') + '</div>' +
        '<div class="mta-meta">key <b>' + esc(s.key) + '</b>' +
          (s.grade ? ' &middot; ' + esc(s.grade) : '') +
          (s.source ? ' &middot; ' + esc(s.source) : '') +
          (s.subjectOnly ? ' &middot; subject only' : '') + '</div>' +
        (extra || '') +
        '<div class="mta-acts">' + actions + '</div>' +
        '<div class="mta-status"></div>' +
      '</div>';
  }

  // A row with no email can only be delivered as a link, so do not offer a
  // button that is guaranteed to come back "no_recipient".
  function inviteButtons(s, label) {
    return (s.guardianEmail ? '<button class="mta-b pri" data-act="invite">' + label + '</button>' : '') +
      '<button class="mta-b' + (s.guardianEmail ? '' : ' pri') + '" data-act="link">Copy link</button>';
  }

  function render() {
    var needs = [], waiting = [];
    students.forEach(function (s) {
      // Archived students are retired; they belong in admin.html's roster
      // history, never in a queue of things to do.
      if (s.archived) return;
      if (s.pending || s.status === 'Inquiry') needs.push(s);
      else if (s.status === 'Invited') waiting.push(s);
      // 'Ready' is deliberately absent from both: an address is on file, so
      // the student pairs by themselves the moment they sign in. Nothing
      // for Luca to do, so nothing shown. Still reachable via search.
    });

    var html = '<div class="mta-sec">Needs you</div>';
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
          (canReset(s) ? '<button class="mta-b warn" data-act="reset">Reset login</button>' : ''));
      }
    });

    if (waiting.length) {
      html += '<div class="mta-sec">Invited &mdash; not claimed yet</div>';
      waiting.forEach(function (s) {
        html += card(s, inviteButtons(s, 'Re-send') +
          (canReset(s) ? '<button class="mta-b warn" data-act="reset">Reset login</button>' : ''),
          '<div class="mta-meta">sent ' + esc(ago(s.inviteSentAt)) +
          ' &middot; a new link replaces the old one</div>');
      });
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
        if (a === 'invite') {
          act(c, 'Sending…', { action: 'sendInvite', adminKey: adminKey(), key: key, deliver: 'email' },
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
        } else if (a === 'reset') {
          if (!window.confirm(
                'Reset the login for ' + key + '?\n\n' +
                'This unlinks their Google account, signs them out everywhere, and revokes that ' +
                "address's access to their files folder. Their scores, reports and the folder itself " +
                'are untouched. You can send a fresh invite afterwards.')) return;
          act(c, 'Resetting…', { action: 'resetStudentAuth', adminKey: adminKey(), key: key },
            function (d) { return 'Reset' + (d.revokedEmail ? ' — ' + d.revokedEmail + ' no longer has access.' : '.'); });
        }
      });
    });
  }

  function refresh() {
    var k = adminKey();
    // admin.html gates itself behind the admin key; until that gate is
    // passed there is nothing to ask for and nothing worth showing.
    if (!k) { if (root) root.style.display = 'none'; return; }
    if (root) root.style.display = '';
    if (loading) return;
    loading = true;
    post({ action: 'accessRoster', adminKey: k }).then(function (data) {
      loading = false;
      if (!data || !data.ok) return;
      students = data.students || [];
      var n = students.filter(function (s) {
        return !s.archived && (s.pending || s.status === 'Inquiry');
      }).length;
      badgeEl.textContent = n;
      badgeEl.style.display = n ? '' : 'none';
      tabEl.style.opacity = n ? '1' : '0.75';
      if (open) render();
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

  function boot() { ensureRoot(); refresh(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(refresh, POLL_MS);
})();
