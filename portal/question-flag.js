/* =====================================================================
   QUESTION FLAGS (2026-09-22)
   A "Report issue" button on every question the portal shows (named that,
   with a warning icon, so it can't be mistaken for Bluebook's Mark for
   Review, which is the student's own bookmark): practice tests,
   diagnostics, Question Bank, Challenge, Rush, the Mistakes/Saved runner
   and the question review popup. The student picks what looks wrong, can
   add a note, and the flag lands on the Flagged tab of the spreadsheet for
   Luca to check and fix (handleFlagQuestion in prep.gs).

   Each screen calls window.portalFlag.attach(container, ctx) whenever it
   paints a question:
     container  the header element the button goes in
     ctx        { qkey, where, text }
                qkey   the question's stable id (the same key the portal
                       uses to save it), so Luca can find it
                where  what the student was doing ("Practice Test 4 -
                       Math Module 2 - Q12"), shown on the sheet
                text   the question (HTML is fine; it is reduced to text)

   The request goes through the portal's fetch wrapper (auth-client.js),
   which attaches the student's session, so the backend knows who sent it.
   A report already sent from this device shows as "Reported" and is not
   sent twice.
   ===================================================================== */
(function () {
  'use strict';

  var REASONS = [
    ['answer', 'The answer key looks wrong'],
    ['typo', 'Typo or formatting problem'],
    ['image', 'Missing or broken image/graph'],
    ['explain', 'Explanation is wrong or unclear'],
    ['other', 'Something else']
  ];

  var CSS = '' +
    '.qf-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;' +
      'background:none;border:1px solid transparent;border-radius:50%;color:var(--mid,#8a8a8a);padding:0;cursor:pointer;' +
      'transition:color .2s,border-color .2s,background .2s;flex-shrink:0}' +
    '.qf-btn:hover,.qf-btn:focus-visible{color:#b0271c;border-color:#e6c3bf;background:#fff}' +
    '.qf-btn[aria-pressed="true"]{color:#b0271c;background:#fbeeed;border-color:#e6c3bf;cursor:default}' +
    '.qf-btn svg{width:15px;height:15px}' +
    /* The icon alone is the button, so the words appear on hover/focus. */
    '.qf-btn::after{content:attr(data-tip);position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);white-space:nowrap;' +
      'background:#1a1a1a;color:#fff;font:600 .66rem/1.2 var(--hel,Helvetica,Arial,sans-serif);letter-spacing:.02em;' +
      'padding:.35rem .55rem;border-radius:5px;opacity:0;pointer-events:none;transition:opacity .15s;z-index:20}' +
    '.qf-btn:hover::after,.qf-btn:focus-visible::after{opacity:1}' +
    '.qf-overlay{position:fixed;inset:0;z-index:100000;background:rgba(15,15,15,.45);display:flex;align-items:center;' +
      'justify-content:center;padding:16px}' +
    '.qf-overlay[hidden]{display:none}' +
    '.qf-box{background:#fff;color:#1a1a1a;width:100%;max-width:420px;border-radius:10px;padding:1.3rem 1.3rem 1.1rem;' +
      'box-shadow:0 20px 50px rgba(0,0,0,.25);font-family:var(--hel,Helvetica,Arial,sans-serif)}' +
    '.qf-box h2{font-size:1.02rem;margin:0 0 .25rem;font-weight:700}' +
    '.qf-box p{font-size:.8rem;color:#666;margin:0 0 .9rem;line-height:1.4}' +
    '.qf-opts{display:flex;flex-direction:column;gap:.4rem;margin-bottom:.8rem}' +
    '.qf-opt{display:flex;align-items:center;gap:.55rem;border:1px solid #ddd;border-radius:7px;padding:.55rem .7rem;' +
      'font-size:.84rem;cursor:pointer}' +
    '.qf-opt:has(input:checked){border-color:#b0271c;background:#fbeeed}' +
    '.qf-note{width:100%;box-sizing:border-box;min-height:70px;border:1px solid #ddd;border-radius:7px;padding:.55rem .65rem;' +
      'font:inherit;font-size:.84rem;resize:vertical}' +
    '.qf-actions{display:flex;justify-content:flex-end;gap:.5rem;margin-top:.9rem}' +
    '.qf-actions button{font:inherit;font-size:.82rem;font-weight:600;border-radius:7px;padding:.5rem .95rem;cursor:pointer}' +
    '.qf-cancel{background:#fff;border:1px solid #ccc;color:#333}' +
    '.qf-send{background:#b0271c;border:1px solid #b0271c;color:#fff}' +
    '.qf-send[disabled]{opacity:.5;cursor:default}' +
    '.qf-msg{font-size:.78rem;margin-top:.6rem;min-height:1em}' +
    '.qf-msg.err{color:#b0271c}';

  /* A warning triangle, not a flag: "Mark for Review" (the student's own
     bookmark, as in Bluebook) sits right beside this button, and two flags
     read as the same thing (Luca, 2026-09-22). This one is "something is
     wrong with the question", so it says so. */
  var FLAG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>' +
    '<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

  var styled = false;
  function addStyle() {
    if (styled) return;
    styled = true;
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function studentKey() {
    try { return (window.getPortalStudentKey && window.getPortalStudentKey()) || ''; } catch (e) { return ''; }
  }
  function storeKey() { return 'moretti_flagged_qs_' + (studentKey() || 'anon'); }
  function readFlagged() {
    try { return JSON.parse(localStorage.getItem(storeKey()) || '{}') || {}; } catch (e) { return {}; }
  }
  function markFlagged(id) {
    try {
      var m = readFlagged();
      m[id] = Date.now();
      localStorage.setItem(storeKey(), JSON.stringify(m));
    } catch (e) { /* private mode: the button just won't remember */ }
  }
  function idFor(ctx) {
    return ctx.qkey || ('t:' + plain(ctx.text).slice(0, 80));
  }

  function plain(html) {
    if (!html) return '';
    var d = document.createElement('div');
    d.innerHTML = String(html);
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }

  /* ── the dialog, built once ─────────────────────────────────────────── */
  var overlay, box, sendBtn, noteEl, msgEl, activeCtx, activeBtn;
  function buildDialog() {
    if (overlay) return;
    addStyle();
    overlay = document.createElement('div');
    overlay.className = 'qf-overlay';
    overlay.hidden = true;
    var opts = REASONS.map(function (r) {
      return '<label class="qf-opt"><input type="radio" name="qf-reason" value="' + r[0] + '"> ' + r[1] + '</label>';
    }).join('');
    overlay.innerHTML =
      '<div class="qf-box" role="dialog" aria-modal="true" aria-labelledby="qf-title">' +
        '<h2 id="qf-title">Report a problem with this question</h2>' +
        '<p>This goes to Luca, not into your test. Tell him what looks wrong and he\'ll check it and fix it. ' +
        '(To come back to a question yourself, use Mark for Review.)</p>' +
        '<div class="qf-opts">' + opts + '</div>' +
        '<textarea class="qf-note" maxlength="600" placeholder="Anything else? (optional)"></textarea>' +
        '<div class="qf-msg" aria-live="polite"></div>' +
        '<div class="qf-actions"><button type="button" class="qf-cancel">Cancel</button>' +
        '<button type="button" class="qf-send" disabled>Send report</button></div>' +
      '</div>';
    document.body.appendChild(overlay);
    box = overlay.querySelector('.qf-box');
    sendBtn = overlay.querySelector('.qf-send');
    noteEl = overlay.querySelector('.qf-note');
    msgEl = overlay.querySelector('.qf-msg');

    // Keys typed here must not reach the test's own shortcuts underneath.
    box.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Escape') close();
    });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.qf-cancel').addEventListener('click', close);
    overlay.addEventListener('change', function () { sendBtn.disabled = !selectedReason(); });
    sendBtn.addEventListener('click', send);
  }
  function selectedReason() {
    var r = overlay.querySelector('input[name="qf-reason"]:checked');
    return r ? r.value : '';
  }
  function open(ctx, btn) {
    buildDialog();
    activeCtx = ctx;
    activeBtn = btn;
    Array.prototype.forEach.call(overlay.querySelectorAll('input[name="qf-reason"]'), function (i) { i.checked = false; });
    noteEl.value = '';
    msgEl.textContent = '';
    msgEl.className = 'qf-msg';
    sendBtn.disabled = true;
    sendBtn.textContent = 'Send report';
    overlay.hidden = false;
    var first = overlay.querySelector('input[name="qf-reason"]');
    if (first) first.focus();
  }
  function close() {
    if (overlay) overlay.hidden = true;
    activeCtx = null;
    activeBtn = null;
  }

  function send() {
    var reason = selectedReason();
    if (!reason || !activeCtx) return;
    var ctx = activeCtx, btn = activeBtn;
    var url = window.APPS_SCRIPT_URL;
    if (!url) { showErr(); return; }
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    var payload = {
      action: 'flagQuestion',
      flag: {
        reason: reason,
        note: noteEl.value.trim().slice(0, 600),
        qkey: String(ctx.qkey || '').slice(0, 120),
        where: String(ctx.where || '').slice(0, 120),
        text: plain(ctx.text).slice(0, 400)
      }
    };
    var tries = 0;
    (function attempt() {
      tries++;
      fetch(url, { method: 'POST', body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.ok) {
            markFlagged(idFor(ctx));
            if (btn) paint(btn, true);
            close();
            return;
          }
          if (d && d.error === 'too_many') { showErr('That\'s a lot of reports for one day. Try again tomorrow, or text Luca.'); return; }
          throw new Error((d && d.error) || 'failed');
        })
        .catch(function () {
          if (tries < 3) { setTimeout(attempt, 900 * tries); return; }
          showErr();
        });
    })();
  }
  function showErr(text) {
    if (!msgEl) return;
    msgEl.textContent = text || 'Couldn\'t send that. Check your connection and try again.';
    msgEl.className = 'qf-msg err';
    sendBtn.disabled = !selectedReason();
    sendBtn.textContent = 'Send report';
  }

  function paint(btn, on) {
    // Icon only (Luca, 2026-09-22); the words live in the tooltip and label.
    btn.innerHTML = FLAG_SVG;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    var tip = on ? 'Reported to Luca' : 'Report a problem with this question';
    btn.setAttribute('data-tip', tip);
    btn.setAttribute('aria-label', tip);
  }

  /* One button per container, rewired to the current question on every
     paint. Placed before the ABC toggle when there is one, so that stays
     at the far right as in Bluebook. */
  function attach(container, ctx) {
    if (!container || !ctx) return null;
    addStyle();
    var btn = container.querySelector(':scope > .qf-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qf-btn';
      var abc = container.querySelector(':scope > .dx-abc-btn');
      if (abc) container.insertBefore(btn, abc);
      else container.appendChild(btn);
    }
    var already = !!readFlagged()[idFor(ctx)];
    paint(btn, already);
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (btn.getAttribute('aria-pressed') === 'true') return;
      open(ctx, btn);
    };
    return btn;
  }

  window.portalFlag = { attach: attach };
})();
