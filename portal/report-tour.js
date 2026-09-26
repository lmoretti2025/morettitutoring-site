/* =========================================================================
   THE REPORT WALKTHROUGH (Luca, 2026-09-26: "guide students through the
   report like it's an intro Apple product ... break down the complex
   statistics in a way that makes sense to them").
   -------------------------------------------------------------------------
   One idea per screen, then "See the numbers" on each screen for the full
   evidence behind it. Loaded by report.html and by the portal's native
   report (index.html renderNativeReport); both call
       MTReportTour.mount({ ...the report's own computed values... })
   at the end of their render, with the SAME variable names, so the numbers
   here are the report's numbers: the causes are the diagnosis card's
   buckets, the path is the score bridge's bars, the focus areas are the
   plan's areas, the clock screen is the report's own clock buckets. Two
   small calculations of its own, both stated where they happen: whether the
   two section scores differ by more than one test can tell (sectionSem), and
   the path's "if these were all fixed" sum.

   A screen with nothing to say is left out (no clock screen when the clock
   cost nothing, no path when there is no composite). The walkthrough opens
   by itself the first time an attempt's report is opened on a device, and
   from the "Walk me through it" button after that. Never in print.
   ========================================================================= */
(function () {
  'use strict';
  if (window.MTReportTour) return;

  var CSS = [
    '#mtt{--bg:#F2F2F2;--card:#fff;--ink:#111;--mid:rgba(17,17,17,.62);--faint:rgba(17,17,17,.44);--line:rgba(17,17,17,.10);--track:rgba(17,17,17,.08);',
    '--brand:#B0271C;--content:#C8372B;--clock:#2F6DB5;--slow:#A67C1F;--good:#2E8A5E;--serif:"Caladea",Georgia,serif;--sans:"Poppins","Helvetica Neue",Arial,sans-serif;--ease:cubic-bezier(.2,.8,.2,1);',
    'position:fixed;inset:0;z-index:2147483000;background:var(--bg);color:var(--ink);font-family:var(--sans);font-weight:300;-webkit-font-smoothing:antialiased;',
    'opacity:0;transition:opacity .45s var(--ease);-webkit-tap-highlight-color:transparent;line-height:1.5;text-align:left}',
    '#mtt.on{opacity:1}#mtt *{box-sizing:border-box;margin:0;padding:0}',
    '#mtt .t-bar{position:absolute;top:0;left:0;right:0;z-index:5;padding:max(14px,env(safe-area-inset-top)) 16px 10px;background:linear-gradient(var(--bg) 70%,rgba(242,242,242,0))}',
    '#mtt .t-prog{display:flex;gap:5px;max-width:720px;margin:0 auto}',
    '#mtt .t-prog i{flex:1;height:3px;border-radius:3px;background:var(--track);overflow:hidden;position:relative}',
    '#mtt .t-prog i:after{content:"";position:absolute;inset:0;background:var(--brand);transform:scaleX(0);transform-origin:left;transition:transform .5s var(--ease)}',
    '#mtt .t-prog i.done:after{transform:scaleX(1)}',
    '#mtt .t-top{display:flex;justify-content:space-between;align-items:center;max-width:720px;margin:12px auto 0;font-size:12px;color:var(--faint)}',
    '#mtt .t-top b{font-weight:500;color:var(--ink)}',
    '#mtt .t-skip{background:none;border:0;color:var(--mid);font:inherit;font-size:12px;cursor:pointer;padding:6px 0}#mtt .t-skip:hover{color:var(--ink)}',
    '#mtt .t-stage{position:absolute;inset:0}',
    '#mtt .t-scr{position:absolute;inset:0;display:flex;padding:100px 16px 110px;opacity:0;pointer-events:none;transition:opacity .6s var(--ease);overflow-y:auto}',
    '#mtt .t-scr.on{opacity:1;pointer-events:auto}',
    '#mtt .t-in{width:100%;max-width:640px;margin:auto}',
    '#mtt .t-eye{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--brand);font-weight:500;margin-bottom:16px}',
    '#mtt h1,#mtt h2{font-family:var(--serif);font-weight:700;letter-spacing:-.01em;line-height:1.08;color:var(--ink)}',
    '#mtt h1{font-size:clamp(38px,8.6vw,68px)}#mtt h2{font-size:clamp(28px,6.2vw,46px)}',
    '#mtt .t-say{font-size:clamp(16px,3.8vw,19px);line-height:1.6;color:var(--mid);margin-top:20px;max-width:34em}',
    '#mtt .t-say strong{color:var(--ink);font-weight:500}',
    '#mtt .t-small{font-size:12px;color:var(--faint);margin-top:16px;line-height:1.5}',
    '#mtt .r{opacity:0;transform:translateY(18px);transition:opacity .8s var(--ease),transform .8s var(--ease)}',
    '#mtt .t-scr.on .r{opacity:1;transform:none}',
    '#mtt .t-scr.on .r:nth-child(2){transition-delay:.12s}#mtt .t-scr.on .r:nth-child(3){transition-delay:.5s}',
    '#mtt .t-scr.on .r:nth-child(4){transition-delay:.9s}#mtt .t-scr.on .r:nth-child(5){transition-delay:1.3s}',
    '#mtt .t-scr.on .r:nth-child(6){transition-delay:1.7s}#mtt .t-scr.on .r:nth-child(7){transition-delay:2s}',
    '#mtt .t-btn{display:inline-flex;align-items:center;gap:10px;margin-top:30px;background:var(--brand);color:#fff;border:0;border-radius:999px;padding:15px 26px;font:500 15px var(--sans);cursor:pointer;transition:transform .2s var(--ease),box-shadow .2s}',
    '#mtt .t-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(176,39,28,.22)}',
    '#mtt .t-btn.ghost{background:var(--card);color:var(--ink);border:1px solid var(--line)}',
    '#mtt .t-more{display:inline-flex;align-items:center;gap:8px;margin-top:26px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:10px 18px;font:500 13px var(--sans);color:var(--ink);cursor:pointer;transition:border-color .2s,transform .2s var(--ease)}',
    '#mtt .t-more:hover{border-color:var(--ink);transform:translateY(-1px)}#mtt .t-more:before{content:"+";font-size:16px;line-height:1;color:var(--brand)}',
    '#mtt .t-track{height:8px;border-radius:8px;background:var(--track);overflow:hidden;position:relative}',
    '#mtt .t-fill{height:100%;border-radius:8px;background:var(--ink);width:0;transition:width 1.4s var(--ease) .7s}',
    '#mtt .t-hero{font-family:var(--serif);font-weight:700;font-size:clamp(84px,25vw,160px);line-height:.9;letter-spacing:-.03em;font-variant-numeric:tabular-nums}',
    '#mtt .t-halves{display:grid;gap:18px;margin-top:28px}',
    '#mtt .t-ht{display:flex;justify-content:space-between;font-size:14px;color:var(--mid);margin-bottom:8px}#mtt .t-ht b{color:var(--ink);font-weight:500;font-variant-numeric:tabular-nums}',
    '#mtt .t-dots{display:grid;grid-template-columns:repeat(auto-fill,16px);gap:6px;margin-top:28px}',
    '#mtt .t-dot{width:16px;height:16px;border-radius:50%;background:rgba(17,17,17,.18);transition:background .6s var(--ease),border-radius .6s var(--ease)}',
    '#mtt .t-dots.split .t-dot.content{background:var(--content)}#mtt .t-dots.split .t-dot.clock{background:var(--clock);border-radius:4px}',
    '#mtt .t-key{display:grid;gap:12px;margin-top:24px}',
    '#mtt .t-key div{display:flex;align-items:baseline;gap:12px;font-size:15px;color:var(--mid);opacity:0;transition:opacity .6s var(--ease)}',
    '#mtt .t-key div b{font-family:var(--serif);font-size:30px;font-weight:700;color:var(--ink);min-width:1.6em;font-variant-numeric:tabular-nums}',
    '#mtt .t-sw{width:12px;height:12px;flex:none;align-self:center;display:inline-block}',
    '#mtt .t-sw.content{background:var(--content);border-radius:50%}#mtt .t-sw.clock{background:var(--clock);border-radius:3px}#mtt .t-sw.slow{border:2.5px solid var(--slow);border-radius:50%}',
    '#mtt .t-dots.split~.t-key div{opacity:1}#mtt .t-dots.split~.t-key div:nth-child(2){transition-delay:.3s}#mtt .t-dots.split~.t-key div:nth-child(3){transition-delay:.6s}',
    '#mtt .t-rows{display:grid;gap:22px;margin-top:30px}',
    '#mtt .t-rt{display:flex;justify-content:space-between;gap:12px;font-size:15px;margin-bottom:9px}',
    '#mtt .t-rt span{font-weight:400}#mtt .t-rt em{font-style:normal;color:var(--mid);font-variant-numeric:tabular-nums;white-space:nowrap}',
    '#mtt .t-row .t-fill.good{background:var(--good)}#mtt .t-row .t-fill.gap{background:var(--content)}',
    '#mtt .t-row .t-note{font-size:13px;color:var(--faint);margin-top:7px}',
    '#mtt .t-row .t-fill{transition-delay:calc(.7s + var(--i,0) * .18s)}',
    '#mtt .t-clock{margin-top:28px;background:var(--card);border-radius:18px;padding:20px 18px 16px}',
    '#mtt .t-cbars{display:flex;align-items:flex-end;gap:3px;height:150px;border-bottom:1px solid var(--line)}',
    '#mtt .t-cb{flex:1;border-radius:3px 3px 0 0;background:rgba(17,17,17,.2);height:0;transition:height .9s var(--ease);position:relative;min-width:2px}',
    '#mtt .t-cb.long{background:var(--slow)}#mtt .t-cb.rushed{background:var(--clock)}#mtt .t-cb.blank{background:none;border:1.5px dashed var(--clock);border-bottom:0}',
    '#mtt .t-cb:hover:after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;background:var(--ink);color:#fff;font-size:12px;padding:5px 9px;border-radius:6px;z-index:2}',
    '#mtt .t-axis{display:flex;justify-content:space-between;font-size:12px;color:var(--faint);margin-top:8px}',
    '#mtt .t-legend{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:13px;color:var(--mid);margin-top:14px}',
    '#mtt .t-legend i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:7px;vertical-align:-1px}',
    '#mtt .t-habits{display:grid;gap:10px;margin-top:28px}',
    '#mtt .t-habit{display:grid;grid-template-columns:36px 1fr;gap:12px;align-items:start;background:var(--card);border-radius:16px;padding:16px 18px;opacity:0;transform:translateY(12px);transition:opacity .6s var(--ease),transform .6s var(--ease)}',
    '#mtt .t-scr.on .t-habit{opacity:1;transform:none;transition-delay:calc(.6s + var(--i) * .25s)}',
    '#mtt .t-habit .n{font-family:var(--serif);font-size:24px;font-weight:700;line-height:1.1;color:var(--content)}#mtt .t-habit.ok .n{color:var(--good)}',
    '#mtt .t-habit h3{font-size:15px;font-weight:500}#mtt .t-habit p{font-size:13.5px;color:var(--mid);margin-top:3px;line-height:1.5}',
    '#mtt .t-tag{display:inline-block;font-size:10.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:20px;margin-left:6px;vertical-align:1px}',
    '#mtt .t-tag.watch{background:rgba(200,55,43,.1);color:var(--content)}#mtt .t-tag.fine{background:rgba(46,138,94,.12);color:var(--good)}',
    '#mtt .t-path{margin-top:28px;display:grid;gap:10px}',
    '#mtt .t-step{display:grid;grid-template-columns:1fr auto;align-items:center;gap:14px;padding:16px 18px;background:var(--card);border-radius:14px;opacity:0;transform:translateX(-14px);transition:opacity .6s var(--ease),transform .6s var(--ease)}',
    '#mtt .t-scr.on .t-step{opacity:1;transform:none;transition-delay:calc(.8s + var(--i) * .45s)}',
    '#mtt .t-step span{font-size:15px}#mtt .t-step small{display:block;font-size:12px;color:var(--faint);margin-top:2px}',
    '#mtt .t-step b{font-family:var(--serif);font-size:24px;color:var(--good);font-variant-numeric:tabular-nums}',
    '#mtt .t-meter{margin-top:24px}',
    '#mtt .t-mt{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;color:var(--mid);margin-bottom:9px}',
    '#mtt .t-mt b{font-family:var(--serif);font-size:26px;color:var(--ink);font-weight:700;font-variant-numeric:tabular-nums}',
    '#mtt .t-meter .t-track{height:12px;overflow:visible}',
    '#mtt .t-meter .t-fill{background:linear-gradient(90deg,#6E6E6E,var(--good));transition:width 2.2s var(--ease) .8s}',
    '#mtt .t-target{position:absolute;top:-6px;bottom:-6px;width:2px;background:var(--ink);border-radius:2px}',
    '#mtt .t-target span{position:absolute;top:20px;left:50%;transform:translateX(-50%);font-size:11px;color:var(--mid);white-space:nowrap}',
    '#mtt .t-plan{margin-top:28px;display:grid;gap:12px;counter-reset:n}',
    '#mtt .t-task{display:grid;grid-template-columns:auto 1fr;gap:16px;padding:20px;border-radius:16px;background:var(--card)}',
    '#mtt .t-task:before{counter-increment:n;content:counter(n);font-family:var(--serif);font-size:34px;font-weight:700;line-height:1;color:var(--brand)}',
    '#mtt .t-task h3{font-size:16px;font-weight:500}#mtt .t-task p{font-size:14px;color:var(--mid);margin-top:4px;line-height:1.55}',
    '#mtt .t-nav{position:absolute;left:0;right:0;bottom:0;z-index:5;padding:14px 16px max(18px,env(safe-area-inset-bottom));background:linear-gradient(rgba(242,242,242,0),var(--bg) 40%)}',
    '#mtt .t-nav-in{max-width:720px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}',
    '#mtt .t-arrow{width:52px;height:52px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:20px;cursor:pointer;transition:opacity .3s,transform .2s var(--ease)}',
    '#mtt .t-arrow:hover{transform:translateY(-1px)}#mtt .t-arrow[disabled]{opacity:0;pointer-events:none}',
    '#mtt .t-arrow.next{background:var(--brand);color:#fff;border-color:var(--brand)}',
    '#mtt .t-hint{font-size:12px;color:var(--faint);transition:opacity .4s}',
    '#mtt .t-sheet{position:absolute;inset:0;z-index:20;background:rgba(17,17,17,0);pointer-events:none;transition:background .35s var(--ease)}',
    '#mtt .t-sheet.open{background:rgba(17,17,17,.32);pointer-events:auto}',
    '#mtt .t-card{position:absolute;left:0;right:0;bottom:0;max-width:760px;margin:0 auto;max-height:88%;display:flex;flex-direction:column;background:var(--card);border-radius:22px 22px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.12);transform:translateY(102%);transition:transform .45s var(--ease)}',
    '#mtt .t-sheet.open .t-card{transform:none}',
    '#mtt .t-sh{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px 20px 12px;border-bottom:1px solid var(--line)}',
    '#mtt .t-sh h3{font-family:var(--serif);font-size:24px;font-weight:700}',
    '#mtt .t-sh small{display:block;font-family:var(--sans);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--brand);font-weight:500;margin-bottom:2px}',
    '#mtt .t-x{width:36px;height:36px;flex:none;border-radius:50%;border:0;background:var(--bg);font-size:18px;cursor:pointer;color:var(--ink)}',
    '#mtt .t-sb{overflow-y:auto;padding:8px 20px max(28px,env(safe-area-inset-bottom));font-size:14px;line-height:1.55}',
    '#mtt .t-sb h4{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);font-weight:500;margin:22px 0 10px}',
    '#mtt .t-sb p{color:var(--mid);margin:8px 0}#mtt .t-sb p b{color:var(--ink);font-weight:500}',
    '#mtt .t-tbl{width:100%!important;max-width:none!important;border-collapse:collapse;font-variant-numeric:tabular-nums;table-layout:auto;margin:0}',
    '#mtt .t-tbl th{text-align:left;font-size:11.5px;font-weight:500;color:var(--faint);padding:6px 8px 6px 0;border-bottom:1px solid var(--line)}',
    '#mtt .t-tbl td{padding:9px 8px 9px 0;border-bottom:1px solid var(--line);vertical-align:middle}',
    '#mtt .t-tbl .num{text-align:right;white-space:nowrap}#mtt .t-tbl td.bar{width:30%}',
    '#mtt .t-mini{height:6px;border-radius:6px;background:var(--track);overflow:hidden}',
    '#mtt .t-mini i{display:block;height:100%;border-radius:6px;background:var(--ink)}',
    '#mtt .t-mini i.good{background:var(--good)}#mtt .t-mini i.gap{background:var(--content)}',
    '#mtt .t-dom td{font-size:11.5px;font-weight:500;color:var(--faint);letter-spacing:.04em;padding-top:16px;border-bottom:0}',
    '#mtt .t-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '#mtt .t-stat{background:var(--bg);border-radius:14px;padding:14px}',
    '#mtt .t-stat b{display:block;font-family:var(--serif);font-size:26px;font-weight:700;font-variant-numeric:tabular-nums}#mtt .t-stat span{font-size:12.5px;color:var(--mid)}',
    '@media (max-width:420px){#mtt .t-tbl td.bar{width:22%}}',
    '@media (prefers-reduced-motion:reduce){#mtt *,#mtt *:before,#mtt *:after{transition-duration:.01ms!important;transition-delay:0s!important}}',
    '@media print{#mtt,.mtt-launch{display:none!important}}',
    '.mtt-launch{display:flex;align-items:center;gap:14px;width:100%;margin:18px 0 4px;padding:14px 18px;border:0;border-radius:12px;background:#B0271C;color:#fff;cursor:pointer;',
    'font-family:"Poppins","Helvetica Neue",Arial,sans-serif;text-align:left;transition:transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s}',
    '.mtt-launch:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(176,39,28,.25)}',
    '.mtt-launch .mtt-play{width:34px;height:34px;flex:none;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:13px}',
    '.mtt-launch b{display:block;font-size:14px;font-weight:600}.mtt-launch span{display:block;font-size:12px;opacity:.82;font-weight:300}'
  ].join('');

  /* ---------- small helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = String(html || ''); return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
  function pl(n, w, ws) { return n + ' ' + (n === 1 ? w : (ws || w + 's')); }
  function pct(c, t) { return t ? Math.round(100 * c / t) : 0; }
  function numWord(n) { return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n); }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function mmss(ms) { var s = Math.round((ms || 0) / 1000); return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }
  function secs(ms) { var s = Math.round((ms || 0) / 1000); return s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60) + 's' : s + 's'; }
  function median(a) { a = a.filter(function (x) { return x > 0; }).sort(function (x, y) { return x - y; }); if (!a.length) return 0; var m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }
  function secName(key, label) { return key === 'math' ? 'Math' : key === 'reading-writing' ? 'Reading & Writing' : (label || 'This section'); }
  function bar(p, cls) { return '<div class="t-mini"><i class="' + (cls || '') + '" style="width:' + Math.max(0, Math.min(100, p)) + '%"></i></div>'; }
  // The bridge's rollup bars read "Other \u2014 Algebra (3 skills)"; said without the dash.
  function cleanLabel(l, keepCount) {
    l = String(l || '');
    var n = /\((\d+) skills?\)\s*$/.exec(l);
    l = l.replace(/\s*\(\d+ skills?\)\s*$/, '');
    var o = /^Other\s*[\u2014\u2013-]+\s*(.+)$/.exec(l);
    if (o) l = 'the rest of ' + o[1] + (keepCount && n ? ' (' + n[1] + ' skills)' : '');
    return l;
  }
  function storage() { try { return window.localStorage; } catch (e) { return null; } }

  /* ---------- the model: every screen from the report's own values ---------- */
  // How the clock took its questions, in words, from the report's own counts.
  function clockWhy(pace) {
    var bits = [];
    if (pace.ranOut) bits.push('rushed as time ran out');
    if (pace.blank) bits.push('never reached');
    if (pace.tooFast) bits.push('answered too fast to have read');
    return bits.length ? bits.join(', ') : 'rushed, or never reached';
  }
  function build(R) {
    var data = R.data || {};
    var M = { first: String(data.n || '').trim().split(/\s+/)[0] || 'there', isDiag: !data.pt, screens: [] };
    M.title = data.ptTitle || 'SAT Diagnostic';
    M.when = R.dateStr || data.dt || '';
    var dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(M.when);
    if (dm) M.when = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][+dm[2] - 1] + ' ' + (+dm[3]);
    M.attemptId = String(data.ts || data.dt || '') + '|' + String(data.pt || 'diag') + '|' + String(data.n || '');
    var sections = R.sections || [];
    var single = R.composite == null;
    var totalQ = R.totalQ || 0, totalC = R.totalC || 0;
    var missed = Math.max(0, totalQ - totalC);
    var P = R.planInputs || {};
    var B = P.buckets || null;

    // ---- hello
    M.screens.push({ name: 'hello', html:
      '<p class="t-eye r">' + esc(M.title) + (M.when ? ' &middot; ' + esc(M.when) : '') + '</p>' +
      '<h1 class="r">Hi ' + esc(M.first) + '.<br>Here\u2019s what your test is telling us.</h1>' +
      '<p class="t-say r">A few short screens: what happened, and what to do about it. Tap <strong>See the numbers</strong> on any screen for the full detail behind it.</p>' +
      '<div class="r"><button type="button" class="t-btn" data-go="next">Show me &rarr;</button></div>' });

    // ---- score
    var rw = R.rwScaled, ma = R.mathScaled;
    var headline = single ? (rw || ma) : R.composite;
    if (headline) {
      var halves = '', say;
      if (!single) {
        halves = '<div class="t-halves r">' +
          '<div><div class="t-ht"><span>Reading &amp; Writing</span><b>' + rw + '</b></div><div class="t-track"><div class="t-fill" data-w="' + (100 * rw / 800).toFixed(1) + '"></div></div></div>' +
          '<div><div class="t-ht"><span>Math</span><b>' + ma + '</b></div><div class="t-track"><div class="t-fill" data-w="' + (100 * ma / 800).toFixed(1) + '"></div></div></div></div>';
        /* A gap between the sections is only called a difference when it beats
           one test's noise: each section's error is about 45 to 60 points
           (MorettiSignals.sectionSem), so the gap's is near 80, and 1.645 of it
           (about 130 mid-scale) is the bar. Which section holds the cheaper
           points is the "Where the points are" screen's job, not this one's. */
        var gap = Math.abs(rw - ma), MS = window.MorettiSignals;
        var semOf = function (v) { try { return MS && MS.sectionSem ? Number(MS.sectionSem(v)) || 55 : 55; } catch (e) { return 55; } };
        var se = Math.sqrt(Math.pow(semOf(rw), 2) + Math.pow(semOf(ma), 2));
        say = gap >= 1.645 * se
          ? (rw > ma ? 'Reading &amp; Writing' : 'Math') + ' is <strong>ahead by ' + gap + '</strong>, more than one test\u2019s ordinary noise.'
          : 'Your two sections are <strong>close</strong>: within what one test can tell apart.';
      } else {
        var sKey = sections[0] && sections[0].key;
        halves = '<p class="t-say r" style="margin-top:14px">' + esc(secName(sKey)) + ' only, on the 200 to 800 scale.</p>';
        say = 'This sitting was one section, so there\u2019s no 400 to 1600 total. It\u2019s a clean read of <strong>' + esc(secName(sKey)) + '</strong> on its own.';
      }
      var modRows = (R.displaySections || []).map(function (d) {
        return '<tr><td>' + esc(d.label) + '</td><td class="num">' + d.c + ' / ' + d.t + '</td><td class="bar">' + bar(pct(d.c, d.t)) + '</td></tr>';
      }).join('');
      var routed = sections.filter(function (s) { return s.variant; }).map(function (s) {
        return secName(s.key, s.label) + ': ' + (/easier/i.test(s.variant) ? 'the easier second module' : 'the harder second module');
      });
      // The range, in the report's own words (report.html plain layer): a number beside the probability.
      var band = R.reportBand && R.reportBand.lo != null && R.reportBand.hi != null && R.reportBand.hi > R.reportBand.lo ? R.reportBand : null;
      var bandLine = band ? '<p class="t-say r" style="margin-top:12px">Your real level is most likely between <strong>' + band.lo + '</strong> and <strong>' + band.hi + '</strong> (about 4 chances in 5).</p>' : '';
      /* The all-hard test (audit 6): the report says the same student scores
         about 87 points lower on it; the walkthrough says so too. */
      var hardestId = (window.MorettiSignals && window.MorettiSignals.HARDEST_TEST_ID) || 'sat-practice-11';
      if (data.pt === hardestId) bandLine += '<p class="t-say r">Every question on this test is hard, so the same student scores about <strong>87 points lower</strong> on it than on the others. Compare it only with itself.</p>';
      M.screens.push({ name: 'score', count: headline, html:
        '<p class="t-eye r">Your score</p><div class="t-hero r" data-count="' + headline + '" data-from="' + (single ? 200 : 400) + '">' + (single ? 200 : 400) + '</div>' + bandLine + halves +
        '<p class="t-say r">' + say + '</p><div class="r"><button type="button" class="t-more" data-sheet="score">See the numbers</button></div>',
        sheet: { eye: 'Your score', title: 'The full score', html:
          '<div class="t-grid2"><div class="t-stat"><b>' + totalC + ' / ' + totalQ + '</b><span>questions right</span></div>' +
          '<div class="t-stat"><b>' + headline + '</b><span>of ' + (single ? 800 : 1600) + '</span></div></div>' +
          (band ? '<p>One test is one sample. Your real level is most likely between <b>' + band.lo + '</b> and <b>' + band.hi + '</b> (about 4 chances in 5), so a later test landing anywhere in that range is ordinary, not a change.</p>' : '') +
          (modRows ? '<h4>By module</h4><table class="t-tbl"><tr><th>Module</th><th class="num">Right</th><th></th></tr>' + modRows + '</table>' : '') +
          (routed.length ? '<p><b>How the SAT adapts.</b> Do well enough on the first module of a section and the second one gets harder, and harder questions are worth more. ' +
            esc(routed.join('. ')) + '.' + (routed.some(function (x) { return /easier/.test(x); }) ? ' The easier module caps how high that section can go, so reaching the harder one is a goal of its own.' : '') + '</p>' : '') +
          (!single ? '<h4>Section scores</h4><table class="t-tbl"><tr><td>Reading &amp; Writing</td><td class="num">' + rw + '</td><td class="bar">' + bar(100 * rw / 800) + '</td></tr>' +
            '<tr><td>Math</td><td class="num">' + ma + '</td><td class="bar">' + bar(100 * ma / 800) + '</td></tr></table>' : '') }
      });
    }

    // ---- where the points went (every miss is content or clock: the diagnosis card's buckets)
    var causes = P.causes;
    if (causes && missed > 0) {
      var nC = causes.content, nK = causes.clock, nM = causes.method;
      var dots = '';
      for (var i = 0; i < nC + nK && i < 98; i++) dots += '<span class="t-dot ' + (i < nC ? 'content' : 'clock') + '"></span>';
      var share = nK / (nC + nK || 1);
      var sayMiss = nK === 0 ? 'Every miss was a real attempt, so the points are in <strong>what to review next</strong>, not in the clock.'
        : share >= 0.25 ? 'So ' + (share >= 0.5 ? 'most' : 'a good share') + ' of your misses <strong>aren\u2019t about what you know</strong>. They\u2019re about time, which better pacing can win back without learning anything new.'
        : 'Most misses are <strong>content to review</strong>, with a few lost to the clock.';
      var bySec = '';
      if (B) {
        bySec = sections.map(function (s) {
          var f = function (k) { return B[k].filter(function (e) { return e.sec && e.sec.key === s.key; }).length; };
          return '<tr><td>' + esc(secName(s.key, s.label)) + '</td><td class="num">' + f('content') + '</td><td class="num">' + f('clock') + '</td><td class="num">' + f('method') + '</td></tr>';
        }).join('');
      }
      var pace = P.pace || {};
      M.screens.push({ name: 'misses', dots: true, html:
        '<p class="t-eye r">Where the points went</p><h2 class="r">You missed ' + pl(missed, 'question') + '.' + (nK && nC ? ' They weren\u2019t all the same kind of miss.' : '') + '</h2>' +
        '<div class="r"><div class="t-dots" role="img" aria-label="' + nC + ' missed after real work, ' + nK + ' lost to the clock">' + dots + '</div><div class="t-key">' +
        (nC ? '<div><span class="t-sw content"></span><b>' + nC + '</b>missed after real work: content to review.</div>' : '') +
        (nK ? '<div><span class="t-sw clock"></span><b>' + nK + '</b>' + (nK === 1 ? 'was' : 'were') + ' lost to the clock: ' + clockWhy(P.pace || {}) + '.</div>' : '') +
        (nM ? '<div><span class="t-sw slow"></span><b>' + nM + '</b>more you got right, but so slowly it cost you later.</div>' : '') +
        '</div></div><p class="t-say r">' + sayMiss + '</p><div class="r"><button type="button" class="t-more" data-sheet="misses">See the numbers</button></div>',
        sheet: { eye: 'Where the points went', title: 'Every miss, sorted', html:
          (bySec ? '<h4>By section</h4><table class="t-tbl"><tr><th>Section</th><th class="num">After real work</th><th class="num">Clock</th><th class="num">Slow but right</th></tr>' + bySec +
            '<tr><td><b>Total</b></td><td class="num"><b>' + nC + '</b></td><td class="num"><b>' + nK + '</b></td><td class="num"><b>' + nM + '</b></td></tr></table>' : '') +
          '<h4>What each kind means</h4>' +
          '<p><b>Missed after real work.</b> You read it and still missed it. Some are gaps to relearn and some may be slips; either way it\u2019s content to review, and the next screens say where.</p>' +
          (nK ? '<p><b>Lost to the clock.</b> ' + [pace.ranOut ? pl(pace.ranOut, 'rushed as time ran out', 'rushed as time ran out') : '', pace.blank ? pace.blank + ' never reached' : '',
            pace.tooFast ? pace.tooFast + ' answered too fast to have read' : ''].filter(String).join(', ') + '. Better pacing gets these back without learning anything new.</p>' : '') +
          (nM ? '<p><b>Slow but right.</b> Right answers that took well over their time while the clock was short. They count, but they cost time the later questions needed' +
            (P.methodSkills && P.methodSkills.length ? ', mostly in <b>' + P.methodSkills.map(esc).join('</b> and <b>') + '</b>' : '') + '.</p>' : '') }
      });
    }

    // ---- skills: strengths, then the all-skills sheet
    var skills = R.skills || {};
    var names = Object.keys(skills);
    var DOM_ORDER = [];
    sections.forEach(function (s) { Object.keys(s.domains || {}).forEach(function (d) { DOM_ORDER.push([s.key, d]); }); });
    function allSkillsHtml() {
      /* Counts only. A skill's 3 to 9 questions on one test are too few to call it
         a strength or a weakness (a student at 65% everywhere shows 25% somewhere
         by chance), so nothing here is labeled; the focus areas are the report's. */
      var h = '<p>Every skill on the test, grouped the way the SAT groups them. A few questions per skill is too few to judge a skill on its own, so read these as a record, not a verdict.</p><table class="t-tbl">';
      DOM_ORDER.forEach(function (sd) {
        var list = names.filter(function (n) { return skills[n].dom === sd[1]; });
        if (!list.length) return;
        h += '<tr class="t-dom"><td colspan="3">' + esc(secName(sd[0]) + ': ' + sd[1]) + '</td></tr>';
        list.sort(function (a, b) { return skills[b].t - skills[a].t; }).forEach(function (n) {
          var s = skills[n], p = pct(s.c, s.t);
          h += '<tr><td>' + esc(n) + '</td><td class="num">' + s.c + ' / ' + s.t + '</td><td class="bar">' + bar(p) + '</td></tr>';
        });
      });
      return h + '</table>';
    }
    /* ONE real strength, by the report's own rule (report.html plain layer,
       "Going well"): the best area with at least 8 questions and 85% right.
       None clears it: answering every question is the strength, if true. */
    var best = null, DX = R.domainBucketsDx || {};
    Object.keys(DX).forEach(function (d) {
      var b = DX[d], right = b.mastered + b.skimmed + b.inefficient, p = b.total ? right / b.total : 0;
      if (b.total >= 8 && p >= 0.85 && (!best || p > best.p || (p === best.p && b.total > best.n))) best = { name: d, right: right, n: b.total, p: p };
    });
    var allAnswered = totalQ && !R.skipped;
    if (best || allAnswered) {
      M.screens.push({ name: 'strengths', html:
        '<p class="t-eye r">Going well</p><h2 class="r">' + (best ? esc(best.name) + ' is already working.' : 'You answered every question.') + '</h2>' +
        (best ? '<div class="t-rows r"><div class="t-row"><div class="t-rt"><span>' + esc(best.name) + '</span><em>' + best.right + ' of ' + best.n + ' right</em></div>' +
          '<div class="t-track"><div class="t-fill good" data-w="' + pct(best.right, best.n) + '"></div></div></div></div>' : '') +
        '<p class="t-say r">' + (best ? 'A strong result on ' + best.n + ' questions. <strong>Keeping it sharp</strong> is enough for now.'
          : 'All ' + totalQ + ' of them, none left blank' + (P.causes && !P.causes.clock && !P.causes.method ? ', and the clock was not a problem, so <strong>the work is the material</strong>, not speed.' : '.')) + '</p>' +
        '<div class="r"><button type="button" class="t-more" data-sheet="strengths">See every skill</button></div>',
        sheet: { eye: 'Going well', title: 'Every skill on the test', html: allSkillsHtml() } });
    }

    // ---- gaps: the plan's own focus areas (the ones the report stands behind)
    /* Content gaps only (severity 3): the pacing (2) and slow-but-right (1)
       rows belong to the clock screen. "Confident" only where the report is:
       z at or past its CLEAR_GAP_Z (2.8), or decided by the older gate (z
       null); a lead under that is the strongest lead, not a verdict. */
    var CLEAR_Z = 2.8;
    var clearArea = function (a) { return a.z == null || a.z >= CLEAR_Z; };
    var areas = (P.areas || []).filter(function (a) { return a && a.name && a.severity === 3 && !(a.lead === 0); });
    var seen = {};
    areas = areas.filter(function (a) { if (seen[a.name]) return false; seen[a.name] = 1; return true; }).slice(0, 3);
    var domains = R.domains || {};
    function acc(name) { return skills[name] || domains[name] || null; }
    var missRows = P.contentRows || [];
    function diffOfMisses(name) {
      var d = { easy: 0, medium: 0, hard: 0 };
      missRows.forEach(function (r) {
        var inIt = r.sk === name || (skills[r.sk] && skills[r.sk].dom === name);
        if (inIt && d[r.diff] != null) d[r.diff]++;
      });
      return d;
    }
    if (areas.length) {
      /* Ranked the report's way, by points at stake, so each row says how many
         were MISSED (the red share of the bar), not an accuracy that can look
         like a strength: a big area can be 10 of 13 right and still hold the
         most points. */
      var gapRows = areas.map(function (a, i) {
        var s = acc(a.name), d = diffOfMisses(a.name);
        // The misses after real work (the plan's lead count), the same count
        // the difficulty table sums; clock misses belong to the clock screen.
        var miss = typeof a.lead === 'number' ? a.lead : (s ? s.t - s.c : 0);
        var most = ['hard', 'medium', 'easy'].sort(function (x, y) { return d[y] - d[x]; })[0];
        var note = d[most] ? 'Most of the misses here were ' + most + ' questions.' : '';
        var tops = (a.topSkills || []).map(function (t) { return typeof t === 'string' ? t : (t && (t.name || t.skill)) || ''; }).filter(function (n) { return n && n !== a.name; }).slice(0, 2);
        if (tops.length) note = 'Mostly ' + tops.join(' and ') + '. ' + note;
        return '<div class="t-row" style="--i:' + i + '"><div class="t-rt"><span>' + esc(a.name) + '</span><em>' + (s ? miss + ' missed after real work, of ' + s.t : '') + '</em></div>' +
          '<div class="t-track"><div class="t-fill gap" data-w="' + (s ? pct(miss, s.t) : 30) + '"></div></div>' + (note ? '<p class="t-note">' + esc(note) + '</p>' : '') + '</div>';
      }).join('');
      var diffTot = { easy: { c: 0, t: 0 }, medium: { c: 0, t: 0 }, hard: { c: 0, t: 0 } };
      sections.forEach(function (s) { ['easy', 'medium', 'hard'].forEach(function (k) { if (s.diff && s.diff[k]) { diffTot[k].c += s.diff[k].c; diffTot[k].t += s.diff[k].t; } }); });
      var diffHtml = ['easy', 'medium', 'hard'].filter(function (k) { return diffTot[k].t; }).map(function (k) {
        return '<tr><td>' + cap(k) + '</td><td class="num">' + diffTot[k].c + ' / ' + diffTot[k].t + '</td><td class="bar">' + bar(pct(diffTot[k].c, diffTot[k].t)) + '</td></tr>';
      }).join('');
      var worstLevel = ['easy', 'medium', 'hard'].filter(function (k) { return diffTot[k].t; }).sort(function (x, y) { return (diffTot[y].t - diffTot[y].c) - (diffTot[x].t - diffTot[x].c); })[0];
      var missTbl = areas.map(function (a) { var d = diffOfMisses(a.name); return '<tr><td>' + esc(a.name) + '</td><td class="num">' + d.easy + '</td><td class="num">' + d.medium + '</td><td class="num">' + d.hard + '</td></tr>'; }).join('');
      M.screens.push({ name: 'gaps', html:
        '<p class="t-eye r">Where the points are</p><h2 class="r">' + (areas.length === 1 ? 'This is where the most points are.' : 'These ' + numWord(areas.length) + ' areas hold the most points.') + '</h2>' +
        '<div class="t-rows r">' + gapRows + '</div>' +
        '<p class="t-say r">These show up on every SAT, so <strong>each one you fix pays off every time</strong>.</p><div class="r"><button type="button" class="t-more" data-sheet="gaps">See the numbers</button></div>',
        sheet: { eye: 'Where the points are', title: 'Why ' + (areas.length === 1 ? 'this one' : 'these'), html:
          (diffHtml ? '<h4>By difficulty</h4><table class="t-tbl"><tr><th>Level</th><th class="num">Right</th><th></th></tr>' + diffHtml + '</table>' +
            (worstLevel ? '<p>The most points were lost on <b>' + worstLevel + '</b> questions.</p>' : '') : '') +
          '<h4>Misses by difficulty</h4><table class="t-tbl"><tr><th>Area</th><th class="num">Easy</th><th class="num">Medium</th><th class="num">Hard</th></tr>' + missTbl + '</table>' +
          '<p><b>Why ' + (areas.length === 1 ? 'this one' : 'these') + '.</b> ' + areas.map(function (a) {
            return esc(a.name) + (clearArea(a) ? ': the misses were real attempts rather than the clock, and clear enough that the report is confident it\u2019s worth the time.'
              : ': the strongest lead on this test, worth checking first. One test can\u2019t settle it yet.');
          }).join(' ') + '</p>' +
          (names.length ? '<h4>Every skill</h4>' + allSkillsHtml() : '') }
      });
    }

    // ---- the clock
    if (B && sections.length) {
      var pace2 = P.pace || {}, clockN = B.clock.length, methodN = B.method.length;
      var byMod = {};
      B.clock.forEach(function (e) { var k = e.sec.key + '|' + (e.r.moduleIndex || 0); byMod[k] = (byMod[k] || 0) + 1; });
      B.method.forEach(function (e) { var k = e.sec.key + '|' + (e.r.moduleIndex || 0); byMod[k] = (byMod[k] || 0) + 0.5; });
      var modKey = Object.keys(byMod).sort(function (a, b) { return byMod[b] - byMod[a]; })[0];
      // Shown only when the report's own counts say the clock cost something:
      // anything rushed or unreached, right answers over time while it was
      // short, or two or more answers too fast to have been read (audit 6).
      var clockMatters = ((pace2.blank || 0) + (pace2.ranOut || 0)) > 0 || methodN > 0 || (pace2.tooFast || 0) >= 2;
      if (modKey && clockMatters) {
        var mk = modKey.split('|'), sec = sections.filter(function (s) { return s.key === mk[0]; })[0], mi = Number(mk[1]);
        var rows = sec ? sec.rows.filter(function (r) { return (r.moduleIndex || 0) === mi; }) : [];
        var inB = function (k) { var s = {}; B[k].forEach(function (e) { if (e.sec.key === mk[0]) s[e.r.n] = e.why; }); return s; };
        var clockSet = inB('clock'), methodSet = inB('method');
        var times = rows.map(function (r) { return r.timeMs || 0; });
        var maxT = Math.max.apply(null, times.concat([60000]));
        var bars = rows.map(function (r, j) {
          // The report's own buckets only (audit 6): a "stuck" rule of its own
          // here disagreed with the report's clock verdict on the same page.
          var why = clockSet[r.n], kind = why === 'never reached' ? 'blank' : why ? 'rushed' : methodSet[r.n] ? 'long' : '';
          var h = kind === 'blank' ? 40 : Math.max(3, Math.round(100 * (r.timeMs || 0) / maxT));
          return '<div class="t-cb ' + kind + '" data-h="' + h + '" data-tip="Q' + (j + 1) + ': ' + (kind === 'blank' ? 'never reached' : secs(r.timeMs)) + '"></div>';
        }).join('');
        var modName = secName(sec && sec.key, sec && sec.label) + (sec && sec.hasModules ? (mi ? ', second module' : ', first module') : '');
        var ranLate = (pace2.blank || 0) + (pace2.ranOut || 0);
        var head = ranLate ? modName + ': the clock caught up with you.'
          : methodN ? 'A few right answers took so long they cost time.'
          : 'A few answers came too fast to have read the question.';
        var sayClock = ranLate ? 'By the end, ' + pl(ranLate, 'question was', 'questions were') + ' rushed or left blank. The fix is a skill, not speed: <strong>know when to move on</strong>.'
           : methodN ? cap(pl(methodN, 'right answer', 'right answers')) + ' ran far over time while the clock was short. The fix is a skill, not speed: <strong>know when to move on</strong>.'
           : cap(pl(pace2.tooFast, 'answer', 'answers')) + ' took only seconds, <strong>less than it takes to read the question</strong>. Reading those through is the fix.';
        var modTbl = (R.displaySections || []).map(function (d) {
          var rr = d.rows || [], blank = rr.filter(function (r) { return r.skipped; }).length;
          var used = d.timeTotal || 0, allot = (d.timeAllottedMin || 0) * 60000;
          return '<tr><td>' + esc(d.label) + '</td><td class="num">' + (used ? mmss(used) + (allot ? ' of ' + Math.round(allot / 60000) : '') : '') + '</td><td class="num">' + (rr.length && used ? Math.round(used / 1000 / rr.length) + 's' : '') + '</td><td class="num">' + blank + '</td></tr>';
        }).join('');
        M.screens.push({ name: 'clock', bars: true, html:
          '<p class="t-eye r">How you used the clock</p><h2 class="r">' + esc(head) + '</h2>' +
          '<div class="t-clock r"><div class="t-cbars" role="img" aria-label="Time per question in ' + esc(modName) + '">' + bars + '</div>' +
          '<div class="t-axis"><span>Question 1</span><span>Question ' + rows.length + '</span></div>' +
          '<div class="t-legend"><span><i style="background:var(--slow)"></i>Right, but far over time</span><span><i style="background:var(--clock)"></i>Rushed or too fast</span><span><i style="border:1.5px dashed var(--clock)"></i>Never reached</span></div></div>' +
          '<p class="t-say r">' + sayClock + '</p><div class="r"><button type="button" class="t-more" data-sheet="clock">See every module</button></div>',
          sheet: { eye: 'How you used the clock', title: 'Every module', html:
            (modTbl ? '<table class="t-tbl"><tr><th>Module</th><th class="num">Time used</th><th class="num">Per question</th><th class="num">Blank</th></tr>' + modTbl + '</table>' : '') +
            '<h4>What the clock cost</h4><table class="t-tbl">' +
            '<tr><td>Rushed as time ran out</td><td class="num">' + (pace2.ranOut || 0) + '</td></tr>' +
            '<tr><td>Never reached</td><td class="num">' + (pace2.blank || 0) + '</td></tr>' +
            '<tr><td>Answered too fast to have read it</td><td class="num">' + (pace2.tooFast || 0) + '</td></tr>' +
            '<tr><td>Right, but far over time while it was short</td><td class="num">' + methodN + '</td></tr></table>' +
            '<p>Hover or tap a bar on the chart to see how long each question took.</p>' }
        });
      }
    }

    // ---- habits: the report's own behavior flags, plus the integrity read
    var flags = (R.behaviorFlags || []).map(function (h) {
      var m = /^\s*<strong>([\s\S]*?)<\/strong>([\s\S]*)$/.exec(String(h));
      var title = plain(m ? m[1] : h).replace(/[:.]\s*$/, ''), body = plain(m ? m[2] : '');
      body = cap(body.replace(/^[,;:\s]+/, ''));
      var sentences = body.match(/[^.!?]+[.!?]+(\s|$)/g) || [body];
      return { title: title, body: body, short: sentences.slice(0, 2).join('').trim(), neutral: /probably guesses|Quick right answers/i.test(title) };
    }).filter(function (f) { return f.title; });
    var iv = data.iv;
    var setAside = false, clean = Array.isArray(iv) && iv.length === 0;
    if (Array.isArray(iv) && iv.length) {
      var reopened = 0, ranOut = 0, awayMs = 0;
      iv.forEach(function (x) { if (x.k === 'reopened') reopened++; else if (x.k === 'ranout') ranOut++; else awayMs += Number(x.ms) || 0; });
      setAside = reopened > 0 || ranOut > 0 || awayMs > 10 * 60000;
    }
    if (flags.length || clean || setAside) {
      var cards = flags.slice(0, 4).map(function (f, i) {
        return '<div class="t-habit" style="--i:' + i + '"><div class="n">' + (f.neutral ? 'i' : '!') + '</div><div><h3>' + esc(f.title) + (f.neutral ? '' : ' <span class="t-tag watch">Watch</span>') + '</h3><p>' + esc(f.short) + '</p></div></div>';
      }).join('');
      if (clean) cards += '<div class="t-habit ok" style="--i:' + Math.min(flags.length, 4) + '"><div class="n">&#10003;</div><div><h3>Focused the whole way <span class="t-tag fine">Good</span></h3><p>No long breaks: this is a clean read.</p></div></div>';
      if (setAside) cards += '<div class="t-habit" style="--i:' + Math.min(flags.length, 4) + '"><div class="n">!</div><div><h3>This sitting was interrupted</h3><p>It was closed and reopened, ran out, or had long time away, so read the score as a rough guide rather than a clean measure.</p></div></div>';
      M.screens.push({ name: 'habits', html:
        '<p class="t-eye r">How you worked the test</p><h2 class="r">' + (flags.length ? 'A few habits worth knowing about.' : 'How you worked the test.') + '</h2><div class="t-habits">' + cards + '</div>' +
        (flags.length ? '<div class="r" style="transition-delay:1.6s"><button type="button" class="t-more" data-sheet="habits">See the details</button></div>' : ''),
        sheet: flags.length ? { eye: 'How you worked the test', title: 'The habits, in detail', html: flags.map(function (f) { return '<h4>' + esc(f.title) + '</h4><p>' + esc(f.body) + '</p>'; }).join('') } : null });
    }

    // ---- the path: the score bridge's own bars
    // To the nearest 10, as the report's own bridge labels them: +131 here
    // beside +130 there read as two different estimates (review 2026-09-26).
    var pts10 = function (p) { return Math.round(p / 10) * 10; };
    var items = (R.shownItems || []).filter(function (it) { return it && it.points > 0; });
    var start = R.currentComposite;
    if (!single && start != null && items.length) {
      var top = items.slice().sort(function (a, b) { return b.points - a.points; }).slice(0, 4);
      var gain = top.reduce(function (a, it) { return a + it.points; }, 0);
      var end = Math.min(1600, Math.round((start + gain) / 10) * 10);
      // Only a target the student set (audit 6): the report's own default
      // (score + 150) is a chart line, not the student's goal.
      var target = Number(R.data && R.data.targetScore) || 0;
      var lo = Math.max(400, Math.floor((start - 60) / 50) * 50), hi = Math.min(1600, Math.ceil((Math.max(end, target) + 40) / 50) * 50);
      var at = function (v) { return (100 * (v - lo) / (hi - lo)).toFixed(1); };
      var ceiling = R.reachable;
      M.screens.push({ name: 'path', html:
        '<p class="t-eye r">Your path</p><h2 class="r">The points on the table.</h2><div class="t-path">' +
        top.map(function (it, i) {
          var lbl = it.filterType === 'clock' ? 'Reach the questions you ran out of time for' : 'Fix ' + cleanLabel(it.label);
          return '<div class="t-step" style="--i:' + i + '"><span>' + esc(lbl) + (it.filterType === 'clock' ? '<small>' + esc(it.label) + '</small>' : '') + '</span><b>+' + pts10(it.points) + '</b></div>';
        }).join('') + '</div>' +
        '<div class="t-meter r"><div class="t-mt"><span>If these were all fixed: about</span><b data-count="' + end + '" data-from="' + start + '" data-delay="' + (900 + top.length * 450) + '">' + start + '</b></div>' +
        '<div class="t-track"><div class="t-fill" data-w="' + at(end) + '"></div>' + (target && target >= lo && target <= hi ? '<div class="t-target" style="left:' + at(target) + '%"><span>Target ' + target + '</span></div>' : '') + '</div></div>' +
        '<p class="t-small r" style="margin-top:28px">Estimates from this one test. Real gains come from the work.</p>' +
        '<div class="r"><button type="button" class="t-more" data-sheet="path">See every point on the table</button></div>',
        sheet: { eye: 'Your path', title: 'Every point on the table', html:
          '<p>If every miss on this test were fixed, the score would be about <b>' + (ceiling || end) + '</b>. Here\u2019s where those points sit, biggest first:</p>' +
          '<table class="t-tbl"><tr><th>Fix</th><th class="num">Points</th></tr>' +
          items.slice().sort(function (a, b) { return b.points - a.points; }).map(function (it) { return '<tr><td>' + esc(cleanLabel(it.label, true)) + '</td><td class="num">+' + pts10(it.points) + '</td></tr>'; }).join('') +
          (function () {
            // What the chart folds into one line, so the rows add up to the total (audit 6).
            var shown = items.reduce(function (a, it) { return a + it.points; }, 0);
            var rest = ceiling != null ? Math.round(ceiling - start - shown) : 0;
            return rest >= 5 ? '<tr><td>Everything else, spread thin</td><td class="num">+' + rest + '</td></tr>' : '';
          })() + '</table>' +
          (target ? '<p>Your target is <b>' + target + '</b>. ' + (end >= target ? 'If those were all fixed, that would reach it.' : 'If those were all fixed, that would be about ' + end + ', and the rest of the list closes the gap.') + '</p>' : '') +
          '<p>These are estimates from one test that assume each miss is fixed; points for a single question aren\u2019t fixed on the SAT, and the scoring curve makes the first few fixes at a low score worth less than they look here.</p>' }
      });
    }

    // ---- the plan: three things, from the same areas and the clock
    var tasks = [];
    if (P.prereq && P.prereq.name) tasks.push({ h: P.prereq.name, p: P.prereq.kind === 'prereq' ? 'This one comes first: ' + P.prereq.blocks + ' builds on it.' : 'The cheapest points on the test. Start here.' });
    areas.forEach(function (a) {
      if (tasks.length < 3 && !tasks.some(function (t) { return t.h === a.name; })) {
        tasks.push({ h: a.name, p: clearArea(a) ? 'Relearn it from the ground up, then practice until it holds under time.'
                                                : 'The strongest lead on this test. Worth checking first, before planning around it.' });
      }
    });
    /* No single content area separated, but many content misses spread across
       the test: the report's own advice (its empty "What to relearn" card and
       plain layer) is the foundation domains of each section. Without this a
       weak, spread-out student's only task read "Read before answering". */
    var attempted = Math.max(1, totalQ - (R.skipped || 0));
    if (!areas.length && P.causes && P.causes.content / attempted >= 0.15) {
      tasks.push({ h: 'Core material across the board', p: 'The misses are spread over most areas, so start with the foundations: Standard English Conventions in Reading & Writing, and Algebra in Math.' });
    }
    var paceLost = (P.pace && (P.pace.blank + P.pace.ranOut)) || 0;
    if (paceLost >= 2) tasks.splice(Math.min(1, tasks.length), 0, { h: 'Know when to move on', p: 'If a question passes about twice its target time, mark it and move on. Come back if there\u2019s time.' });
    else if (P.pace && P.pace.tooFast >= 2) tasks.splice(Math.min(1, tasks.length), 0, { h: 'Read before answering', p: 'Read every question before answering. Some answers came faster than the question can be read.' });
    tasks = tasks.slice(0, 3);
    if (tasks.length) {
      var weekly = P.weeklyText ? '<p>About <b>' + esc(P.weeklyText) + ' hour' + (P.weekly === 1 ? '' : 's') + ' a week</b> of practice for now' +
        (P.mode === 'tests' ? ', mostly full practice tests' : P.mode === 'pace' ? ', mostly timed practice' : '') + '. The full report\u2019s <b>Your next four weeks</b> section splits it up week by week.</p>' : '';
      M.screens.push({ name: 'plan', html:
        '<p class="t-eye r">Your ' + numWord(tasks.length) + ' thing' + (tasks.length === 1 ? '' : 's') + '</p><h2 class="r">Start here.</h2><div class="t-plan r">' +
        tasks.map(function (t) { return '<div class="t-task"><div><h3>' + esc(t.h) + '</h3><p>' + esc(t.p) + '</p></div></div>'; }).join('') + '</div>' +
        (weekly ? '<div class="r"><button type="button" class="t-more" data-sheet="plan">How much practice</button></div>' : '') +
        '<div class="r"><button type="button" class="t-btn ghost" data-go="close">See the full report &rarr;</button></div>',
        sheet: weekly ? { eye: 'The plan', title: 'How much practice', html: weekly } : null });
    } else {
      M.screens.push({ name: 'plan', html: '<p class="t-eye r">That\u2019s the story</p><h2 class="r">The full report has every detail.</h2>' +
        '<div class="r"><button type="button" class="t-btn" data-go="close">See the full report &rarr;</button></div>' });
    }
    return M;
  }

  /* ---------- the player ---------- */
  var root = null, cur = -1, timers = [], model = null, lastFocus = null;
  function later(fn, ms) { timers.push(setTimeout(fn, reduced() ? 0 : ms)); }
  function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function injectCss() {
    if (document.getElementById('mtt-css')) return;
    var st = document.createElement('style'); st.id = 'mtt-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  function countUp(el) {
    var to = +el.getAttribute('data-count'), from = +(el.getAttribute('data-from') || 0), delay = +(el.getAttribute('data-delay') || 350);
    el.textContent = from;
    if (reduced()) { el.textContent = to; return; }
    later(function () {
      var t0 = performance.now();
      (function tick(t) {
        var p = Math.min(1, (t - t0) / 1500), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (to - from) * e);
        if (p < 1 && root) requestAnimationFrame(tick);
      })(t0);
    }, delay);
  }
  function enter(el) {
    Array.prototype.forEach.call(el.querySelectorAll('[data-count]'), countUp);
    Array.prototype.forEach.call(el.querySelectorAll('.t-fill[data-w]'), function (f) { f.style.width = f.getAttribute('data-w') + '%'; });
    var d = el.querySelector('.t-dots'); if (d) later(function () { d.classList.add('split'); }, 1100);
    Array.prototype.forEach.call(el.querySelectorAll('.t-cb'), function (b, i) { later(function () { b.style.height = b.getAttribute('data-h') + '%'; }, 500 + i * 40); });
  }
  function leave(el) {
    Array.prototype.forEach.call(el.querySelectorAll('.t-fill[data-w]'), function (f) { f.style.width = '0'; });
    var d = el.querySelector('.t-dots'); if (d) d.classList.remove('split');
    Array.prototype.forEach.call(el.querySelectorAll('.t-cb'), function (b) { b.style.height = '0'; });
  }
  function go(n) {
    var scr = root.querySelectorAll('.t-scr');
    if (n < 0 || n >= scr.length || n === cur) return;
    timers.forEach(clearTimeout); timers = [];
    if (cur >= 0) { scr[cur].classList.remove('on'); leave(scr[cur]); }
    cur = n; scr[n].classList.add('on'); scr[n].scrollTop = 0; enter(scr[n]);
    // Only the screen on show is reachable by Tab or a screen reader (audit 6).
    Array.prototype.forEach.call(scr, function (x, i) {
      if (i === n) { x.removeAttribute('inert'); x.removeAttribute('aria-hidden'); }
      else { x.setAttribute('inert', ''); x.setAttribute('aria-hidden', 'true'); }
    });
    Array.prototype.forEach.call(root.querySelectorAll('.t-prog i'), function (p, i) { p.classList.toggle('done', i <= n); });
    root.querySelector('.t-prev').disabled = n === 0;
    root.querySelector('.t-next').disabled = n === scr.length - 1;
    if (n > 0) root.querySelector('.t-hint').style.opacity = 0;
  }
  function openSheet(name) {
    var s = model.screens.filter(function (x) { return x.sheet && x.name === name; })[0];
    if (!s) return;
    root.querySelector('.t-sh h3').innerHTML = '<small>' + esc(s.sheet.eye) + '</small>' + esc(s.sheet.title);
    var body = root.querySelector('.t-sb'); body.innerHTML = s.sheet.html; body.scrollTop = 0;
    sheetReturn = document.activeElement;
    root.querySelector('.t-sheet').classList.add('open');
    root.querySelector('.t-x').focus();
  }
  var sheetReturn = null;
  function closeSheet() {
    if (!root) return;
    root.querySelector('.t-sheet').classList.remove('open');
    // Focus goes back to the button that opened it (audit 6).
    if (sheetReturn && sheetReturn.focus && root.contains(sheetReturn)) try { sheetReturn.focus(); } catch (e) {}
    sheetReturn = null;
  }
  function sheetOpen() { return root && root.querySelector('.t-sheet').classList.contains('open'); }
  function onKey(e) {
    if (!root) return;
    if (sheetOpen() && e.key === 'Escape') { closeSheet(); return; }
    if (sheetOpen() && e.key !== 'Tab') return;
    if (e.key === 'Escape') return close();
    // Space pages forward only when no button has focus, so it can still press
    // a focused "See the numbers" (audit 6).
    var onButton = document.activeElement && /^(BUTTON|A)$/.test(document.activeElement.tagName) && root.contains(document.activeElement);
    if (e.key === 'ArrowRight' || (e.key === ' ' && !onButton)) { e.preventDefault(); go(cur + 1); }
    if (e.key === 'Tab') {
      // Keep Tab inside the walkthrough (or its open sheet): nothing behind it is reachable.
      var box = sheetOpen() ? root.querySelector('.t-card') : root;
      var f = Array.prototype.filter.call(box.querySelectorAll('button, a[href]'), function (x) { return !x.disabled && !x.closest('[inert]') && x.offsetParent !== null; });
      if (f.length) {
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    }
    if (e.key === 'ArrowLeft') go(cur - 1);
  }
  function close() {
    if (!root) return;
    var r = root; root = null; cur = -1; timers.forEach(clearTimeout); timers = [];
    r.classList.remove('on');
    document.removeEventListener('keydown', onKey);
    document.documentElement.style.overflow = '';
    setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 450);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }
  function open(M) {
    if (root || !M || !M.screens.length) return;
    model = M; injectCss(); lastFocus = document.activeElement;
    root = document.createElement('div'); root.id = 'mtt';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Report walkthrough');
    root.innerHTML =
      '<div class="t-bar"><div class="t-prog">' + M.screens.map(function () { return '<i></i>'; }).join('') + '</div>' +
      '<div class="t-top"><span><b>' + esc(M.first) + '\u2019s ' + (M.isDiag ? 'diagnostic' : 'practice test') + '</b></span><button type="button" class="t-skip" data-go="close">Skip to full report</button></div></div>' +
      '<div class="t-stage">' + M.screens.map(function (s) { return '<section class="t-scr" data-name="' + s.name + '"><div class="t-in">' + s.html + '</div></section>'; }).join('') + '</div>' +
      '<div class="t-nav"><div class="t-nav-in"><button type="button" class="t-arrow t-prev" aria-label="Back">&larr;</button><span class="t-hint">Tap, swipe or use arrow keys</span>' +
      '<button type="button" class="t-arrow next t-next" aria-label="Next">&rarr;</button></div></div>' +
      '<div class="t-sheet"><div class="t-card" role="dialog" aria-modal="true"><div class="t-sh"><h3></h3><button type="button" class="t-x" aria-label="Close">&times;</button></div><div class="t-sb"></div></div></div>';
    document.body.appendChild(root);
    document.documentElement.style.overflow = 'hidden';
    root.addEventListener('click', function (e) {
      var t = e.target;
      var g = t.closest('[data-go]'); if (g) { var v = g.getAttribute('data-go'); if (v === 'close') close(); else go(cur + 1); return; }
      var sh = t.closest('[data-sheet]'); if (sh) return openSheet(sh.getAttribute('data-sheet'));
      if (t.closest('.t-x')) return closeSheet();
      if (t.classList.contains('t-sheet')) return closeSheet();
      if (t.closest('.t-prev')) return go(cur - 1);
      if (t.closest('.t-next')) return go(cur + 1);
      if (t.closest('.t-sheet, button, a, .t-clock, .t-habit, .t-step, .t-task, .t-bar')) return;
      if (window.getSelection && String(window.getSelection())) return;
      go(cur + (e.clientX > window.innerWidth * 0.3 ? 1 : -1));
    });
    var sx = null, sy = null, stage = root.querySelector('.t-stage');
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
    });
    var hy = null, head = root.querySelector('.t-sh');
    head.addEventListener('touchstart', function (e) { hy = e.touches[0].clientY; }, { passive: true });
    head.addEventListener('touchend', function (e) { if (hy !== null && e.changedTouches[0].clientY - hy > 60) closeSheet(); hy = null; });
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(function () {
      if (!root) return;
      root.classList.add('on'); go(0);
      // Focus moves into the walkthrough on open (audit 6: Tab reached the page behind it).
      var nxt = root.querySelector('.t-scr.on button') || root.querySelector('.t-next');
      if (nxt) try { nxt.focus(); } catch (e) {}
    });
  }

  /* ---------- mounting on a report ---------- */
  function mount(R, opts) {
    opts = opts || {};
    try {
      if (!R || !R.data || !(R.sections && R.sections.length)) return;
      var M = build(R);
      if (M.screens.length < 3) return;
      injectCss();
      // The button, above the one-minute summary (or at the top of the report).
      var anchor = opts.anchor || document.getElementById('plain-summary');
      var scope = opts.scope || document;
      var old = scope.querySelector && scope.querySelector('.mtt-launch');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      if (!opts.noButton && anchor && anchor.parentNode) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'mtt-launch';
        b.innerHTML = '<span class="mtt-play" aria-hidden="true">&#9654;</span><span><b>Walk me through it</b><span>' + (M.screens.length - 1) + ' short screens: what happened, and what to do about it</span></span>';
        b.addEventListener('click', function () { open(build(R)); });
        anchor.parentNode.insertBefore(b, anchor);
      }
      // By itself once per attempt per device; never when printing or embedded for show.
      // Not by itself inside Luca's admin viewer (audit 6: it greeted him as the student).
      var inAdmin = false;
      try { inAdmin = window.parent !== window && /admin/i.test(window.parent.location.pathname); } catch (e) { inAdmin = false; }
      if (opts.autoOpen !== false && !inAdmin) {
        var st = storage(), key = 'mtt_seen:' + M.attemptId, seen = false;
        try { seen = !!(st && st.getItem(key)); } catch (e) {}
        if (!seen) {
          try { if (st) st.setItem(key, String(Date.now())); } catch (e) {}
          setTimeout(function () { open(M); }, opts.delay || 500);
        }
      }
    } catch (e) { if (window.console) console.warn('report walkthrough:', e); }
  }

  window.MTReportTour = { mount: mount, build: build, open: open, close: close };
})();
