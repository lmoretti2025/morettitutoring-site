/* =========================================================================
   CURRICULUM (Luca, 2026-09-27): the full math and English courses in the
   portal, under Learn. Shaped after Khan Academy's lesson pages: a course
   panel on the left (unit, lesson, its steps), the video leading the main
   column, notes under it as the supplement, and after every video a check:
   questions that must each be answered correctly before the next part opens.

   Data:    curriculum-data.js     window.CURRICULUM (generated from Luca's
                                   course files by Business/curriculum/
                                   build_portal_curriculum.js; never by hand)
            curriculum-videos.js   window.CURRICULUM_VIDEOS, part -> video
            question-bank(-math).js the questions themselves, by qid
   Entry:   window.curriculumModuleInit(), from navigateTo('curriculum') in
            index.html, rendering into #cu-root on #screen-curriculum.
   Progress: this device (localStorage, per student key) and the backend
            (curriculumGet / curriculumSync), merged part by part, so a
            student keeps their place across devices and Luca can see it.
   ========================================================================= */
(function () {
  'use strict';

  var DATA_SRC = 'curriculum-data.js?v=20260929a';
  var VIDEO_SRC = 'curriculum-videos.js?v=20260927a';

  /* ---------- small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = resolve;
      document.head.appendChild(s);
    });
  }
  function studentKey() { try { return window.getPortalStudentKey ? window.getPortalStudentKey() : ''; } catch (e) { return ''; } }
  function pl(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  var LETTERS = ['A', 'B', 'C', 'D', 'E'];

  /* ---------- styles (scoped to the screen) ---------- */
  var CSS = [
    '#cu-root{--cu-line:rgba(17,17,17,.10);--cu-soft:#f6f5f3;--cu-good:#2E8A5E;--cu-bad:#C8372B;font-family:var(--hel,Poppins,sans-serif);color:var(--text,#111)}',
    '#cu-root *{box-sizing:border-box}',
    '#cu-root .cu-wrap{max-width:1180px;margin:0 auto;padding:1.6rem clamp(1rem,3vw,2rem) 6rem}',
    '#cu-root .cu-kicker{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--red,#B0271C);font-weight:600}',
    '#cu-root h1{font-family:var(--display,Georgia,serif);font-size:clamp(1.7rem,3.2vw,2.3rem);font-weight:700;margin:.35rem 0 .2rem;line-height:1.15}',
    '#cu-root h2{font-family:var(--display,Georgia,serif);font-weight:700}',
    '#cu-root .cu-sub{color:var(--mid);font-size:.92rem;font-weight:300}',
    '#cu-root .cu-tabs{display:inline-flex;background:#e9e7e3;border-radius:999px;padding:4px;margin:1.1rem 0 1.4rem}',
    '#cu-root .cu-tabs button{border:0;background:transparent;font:500 .88rem var(--hel,Poppins,sans-serif);color:var(--mid);padding:.5rem 1.2rem;border-radius:999px;cursor:pointer}',
    '#cu-root .cu-tabs button[aria-pressed="true"]{background:#fff;color:var(--text,#111);box-shadow:0 1px 4px rgba(17,17,17,.12)}',
    '#cu-root .cu-overall{display:flex;align-items:center;gap:14px;margin:0 0 1.4rem;font-size:.85rem;color:var(--mid)}',
    '#cu-root .cu-bar{flex:1;max-width:360px;height:8px;border-radius:8px;background:#e6e3de;overflow:hidden}',
    '#cu-root .cu-bar i{display:block;height:100%;background:var(--red,#B0271C);border-radius:8px;transition:width .6s var(--ease,ease)}',
    '#cu-root .cu-resume{display:flex;align-items:center;justify-content:space-between;gap:1rem;background:#fff;border-radius:14px;box-shadow:var(--shadow);padding:1rem 1.2rem;margin:0 0 1.6rem;border-left:4px solid var(--red,#B0271C)}',
    '#cu-root .cu-resume b{display:block;font-weight:600}#cu-root .cu-resume span{font-size:.85rem;color:var(--mid)}',
    '#cu-root .cu-btn{display:inline-flex;align-items:center;gap:.5rem;border:0;border-radius:999px;background:var(--red,#B0271C);color:#fff;font:600 .85rem var(--hel,Poppins,sans-serif);padding:.75rem 1.3rem;cursor:pointer;white-space:nowrap;transition:transform .15s,box-shadow .15s}',
    '#cu-root .cu-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(176,39,28,.22)}',
    '#cu-root .cu-btn[disabled]{opacity:.45;cursor:default;transform:none;box-shadow:none}',
    '#cu-root .cu-btn.ghost{background:#fff;color:var(--text,#111);box-shadow:inset 0 0 0 1px var(--cu-line)}',
    '#cu-root .cu-units{display:grid;gap:1.1rem}',
    'html:has(#screen-curriculum.active){scrollbar-gutter:stable}',
    '#cu-root .cu-top{display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;flex-wrap:wrap;margin-bottom:1.1rem;min-height:3.6rem}',
    '#cu-root .cu-toph{font-family:var(--display,Georgia,serif);font-size:1.25rem;font-weight:700;margin-top:.2rem}',
    '#cu-root .cu-top .cu-tabs{margin:0}',
    '#cu-root .cu-body{transition:opacity .16s ease}#cu-root .cu-body.cu-fading{opacity:0}',
    '#cu-root .cu-in{animation:cuIn .5s var(--ease,ease) both;animation-delay:calc(var(--d,0) * 60ms)}',
    '@keyframes cuIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
    '#cu-root .cu-hero{display:grid;grid-template-columns:1fr;gap:1rem;align-items:center;border-radius:20px;padding:1.6rem 1.8rem;margin-bottom:1.2rem;overflow:hidden;position:relative;box-shadow:var(--shadow)}',
    '#cu-root .cu-hero-math{background:linear-gradient(135deg,#fff 0%,#fbf1ef 60%,#f6e4e1 100%)}',
    '#cu-root .cu-hero-english{background:linear-gradient(135deg,#fff 0%,#eff2fb 60%,#e3e8f7 100%)}',
    '#cu-root .cu-hero h1{margin:0 0 .3rem;font-size:clamp(1.8rem,3.4vw,2.5rem)}',
    '#cu-root .cu-hero .cu-sub{max-width:32em}',
    '#cu-root .cu-stats{display:flex;align-items:center;gap:1.4rem;margin-top:1.1rem;flex-wrap:wrap}',
    '#cu-root .cu-bigring{position:relative;width:84px;height:84px}#cu-root .cu-bigring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--display,Georgia,serif);font-size:1.25rem}',
    '#cu-root .cu-ringfill{transition:stroke-dasharray .8s var(--ease,ease)}',
    '#cu-root .cu-stat b{display:block;font-family:var(--display,Georgia,serif);font-size:1.5rem;line-height:1}#cu-root .cu-stat span{font-size:.75rem;color:var(--mid);text-transform:uppercase;letter-spacing:.08em}',
    '#cu-root .cu-resume-ic{width:40px;height:40px;border-radius:50%;background:var(--red,#B0271C);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.9rem;flex:none}',
    '#cu-root .cu-resume>div{flex:1}',
    '#cu-root .cu-unit-t{flex:1}#cu-root .cu-unum{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--mid);font-weight:600}',
    '#cu-root .cu-unit-p{display:flex;align-items:center;gap:8px;font-size:.8rem;color:var(--mid);white-space:nowrap}',
    '#cu-root .cu-mbar{width:70px;height:6px;border-radius:6px;background:#e6e3de;overflow:hidden}#cu-root .cu-mbar i{display:block;height:100%;background:var(--cu-good);border-radius:6px}',
    '#cu-root .cu-ring{flex:none}#cu-root .cu-ring.done{border-radius:50%;background:var(--cu-good);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700}',
    '#cu-root .cu-go{font-size:.8rem;font-weight:600;color:var(--red,#B0271C);opacity:.0;transform:translateX(-4px);transition:opacity .2s,transform .2s;white-space:nowrap}',
    '#cu-root .cu-lesson:hover .cu-go,#cu-root .cu-lesson:focus-visible .cu-go{opacity:1;transform:none}',
    '@media(hover:none){#cu-root .cu-go{opacity:1;transform:none}}',
    '@media(max-width:520px){#cu-root .cu-stats{gap:.9rem}#cu-root .cu-bigring{transform:scale(.82);margin:-7px}#cu-root .cu-stat b{font-size:1.25rem}}',
    '@media(max-width:760px){#cu-root .cu-hero{padding:1.3rem}}',
    '@media(prefers-reduced-motion:reduce){#cu-root .cu-notes-fold{transition:none}#cu-root .cu-in{animation:none}#cu-root .cu-body{transition:none}}',
    '#cu-root .cu-unit{background:#fff;border-radius:16px;box-shadow:var(--shadow);overflow:hidden}',
    '#cu-root .cu-unit-h{display:flex;align-items:center;gap:.9rem;padding:1rem 1.2rem .9rem;border-bottom:1px solid var(--cu-line)}',
    '#cu-root .cu-unit-h h2{font-size:1.15rem;margin:.1rem 0 0}',
    '#cu-root .cu-lesson{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.8rem;width:100%;text-align:left;border:0;background:#fff;padding:.8rem 1.2rem;cursor:pointer;border-bottom:1px solid var(--cu-line);font-family:inherit;color:inherit}',
    '#cu-root .cu-lesson:last-child{border-bottom:0}#cu-root .cu-lesson:hover{background:var(--cu-soft)}',
    '#cu-root .cu-num{font-family:var(--display,Georgia,serif);font-weight:700;color:var(--mid);font-size:.95rem;margin-right:.2rem}',
    // A calculator unit (calc in the course files, set by hand per lesson): the deck's Desmos green.
    '#cu-root .cu-calc{display:inline-block;vertical-align:2px;margin-left:.45rem;padding:1px 7px;border-radius:999px;background:rgba(13,122,95,.1);color:#0d7a5f;font-size:.66rem;font-weight:600;letter-spacing:.02em;white-space:nowrap}',
    '#cu-root .cu-lt{font-size:.95rem;font-weight:500}#cu-root .cu-lt small{display:block;font-size:.78rem;color:var(--mid);font-weight:300;margin-top:2px}',
    '#cu-root .cu-dots{display:flex;gap:4px;align-items:center}',
    '#cu-root .cu-dots i{width:9px;height:9px;border-radius:50%;background:#e2dfda}#cu-root .cu-dots i.on{background:var(--cu-good)}',
    '#cu-root .cu-done-tag{font-size:.72rem;font-weight:600;color:var(--cu-good);letter-spacing:.06em;text-transform:uppercase}',
    /* lesson layout */
    '#cu-root .cu-lesson-wrap{display:grid;grid-template-columns:300px 1fr;gap:1.4rem;align-items:start}',
    '#cu-root .cu-panel{position:sticky;top:1rem;background:#fff;border-radius:16px;box-shadow:var(--shadow);overflow:hidden;max-height:calc(100vh - 2rem);display:flex;flex-direction:column}',
    '#cu-root .cu-panel-h{padding:.9rem 1rem .7rem;border-bottom:1px solid var(--cu-line)}',
    '#cu-root .cu-back{border:0;background:none;font:500 .8rem var(--hel,Poppins,sans-serif);color:var(--mid);cursor:pointer;padding:0;margin-bottom:.5rem}',
    '#cu-root .cu-back:hover{color:var(--text,#111)}',
    '#cu-root .cu-crumb{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--red,#B0271C);font-weight:600}',
    '#cu-root .cu-ltitle{display:flex;align-items:center;gap:.4rem;margin-top:.25rem}',
    '#cu-root .cu-ltitle b{flex:1;font-size:.95rem;font-weight:600;line-height:1.3}',
    '#cu-root .cu-arrow{width:28px;height:28px;border-radius:50%;border:1px solid var(--cu-line);background:#fff;cursor:pointer;color:var(--text,#111);flex:none}',
    '#cu-root .cu-arrow[disabled]{opacity:.3;cursor:default}',
    '#cu-root .cu-steps{overflow-y:auto;padding:.3rem 0}',
    '#cu-root .cu-step{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:.6rem;width:100%;border:0;background:none;text-align:left;padding:.62rem 1rem;font:400 .86rem var(--hel,Poppins,sans-serif);color:var(--text,#111);cursor:pointer;border-left:3px solid transparent}',
    '#cu-root .cu-step:hover{background:var(--cu-soft)}',
    '#cu-root .cu-step.on{background:#fbf3f2;border-left-color:var(--red,#B0271C);font-weight:500}',
    '#cu-root .cu-step.locked{color:#a8a39c;cursor:not-allowed}#cu-root .cu-step.locked:hover{background:none}',
    '#cu-root .cu-step .ic{width:26px;height:26px;border-radius:7px;border:1px solid var(--cu-line);display:flex;align-items:center;justify-content:center;font-size:.72rem;color:var(--mid)}',
    '#cu-root .cu-step.done .ic{background:var(--cu-good);border-color:var(--cu-good);color:#fff}',
    '#cu-root .cu-step .st{font-size:.72rem;color:var(--mid)}',
    '#cu-root .cu-main{min-width:0}',
    '#cu-root .cu-mhead{text-align:center;margin-bottom:1rem}#cu-root .cu-mhead h1{font-size:clamp(1.4rem,2.6vw,1.9rem)}',
    '#cu-root .cu-video{position:relative;width:100%;aspect-ratio:16/9;background:#12284c;border-radius:14px;overflow:hidden;box-shadow:var(--shadow)}',
    '#cu-root .cu-video iframe,#cu-root .cu-video video{position:absolute;inset:0;width:100%;height:100%;border:0}',
    '#cu-root .cu-soon{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff;padding:1.5rem}',
    '#cu-root .cu-soon .play{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1rem}',
    '#cu-root .cu-soon b{font-family:var(--display,Georgia,serif);font-size:1.3rem}#cu-root .cu-soon span{opacity:.75;font-size:.88rem;margin-top:.4rem;max-width:30em}',
    '#cu-root .cu-notes{background:#fff;border-radius:14px;box-shadow:var(--shadow);margin-top:1.2rem}',
    '#cu-root .cu-notes-h{display:flex;justify-content:space-between;align-items:center;width:100%;border:0;background:none;padding:1rem 1.2rem;font:600 .95rem var(--hel,Poppins,sans-serif);cursor:pointer;color:inherit}',
    '#cu-root .cu-notes-h span{font-size:.8rem;color:var(--mid);font-weight:400}',
    '#cu-root .cu-notes-fold{display:grid;grid-template-rows:1fr;transition:grid-template-rows .35s var(--ease,ease)}',
    '#cu-root .cu-notes-fold.closed{grid-template-rows:0fr}#cu-root .cu-notes-in{overflow:hidden;min-height:0}',
    '#cu-root .cu-notes-fold.closed .cu-notes-b{visibility:hidden;transition:visibility 0s .35s}',
    '#cu-root .cu-notes-b{padding:0 1.4rem 1.2rem;font-size:.95rem;line-height:1.65;color:#2b2724}',
    '#cu-root .cu-notes-b h3{font-family:var(--display,Georgia,serif);font-size:1.12rem;margin:1.2rem 0 .4rem;color:var(--text,#111)}',
    '#cu-root .cu-notes-b ul,#cu-root .cu-notes-b ol{padding-left:1.3rem;margin:.4rem 0 .8rem}#cu-root .cu-notes-b li{margin:.3rem 0}',
    '#cu-root .cu-notes-b li.sub{margin-left:1.2rem;list-style:circle}',
    '#cu-root .cu-notes-b blockquote{margin:.6rem 0;padding:.6rem .9rem;background:var(--cu-soft);border-left:3px solid var(--gold,#C9A84C);border-radius:6px;font-family:var(--display,Georgia,serif)}',
    '#cu-root .cu-notes-b table{border-collapse:collapse;margin:.6rem 0;font-size:.88rem;width:100%}',
    '#cu-root .cu-notes-b th,#cu-root .cu-notes-b td{border:1px solid var(--cu-line);padding:.4rem .55rem;text-align:left;vertical-align:top}',
    '#cu-root .cu-notes-b th{background:var(--cu-soft);font-weight:600}',
    '#cu-root .cu-notes-b figure{margin:.8rem 0;text-align:center}#cu-root .cu-notes-b figure img{max-width:100%;border-radius:8px}',
    '#cu-root .cu-notes-b figcaption{font-size:.8rem;color:var(--mid);margin-top:.3rem}',
    '#cu-root .cu-formula{background:var(--cu-soft);border-radius:8px;padding:.55rem .8rem;font-family:var(--display,Georgia,serif);margin:.4rem 0}',
    '#cu-root .cu-code,#cu-root .cu-notes-b code{background:var(--cu-soft);border-radius:4px;padding:0 .3em;font-size:.9em}',
    /* the check */
    '#cu-root .cu-card{background:#fff;border-radius:16px;box-shadow:var(--shadow);padding:1.4rem 1.5rem}',
    '#cu-root .cu-qhead{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem;font-size:.8rem;color:var(--mid)}',
    '#cu-root .cu-qtext{font-size:1rem;line-height:1.65}#cu-root .cu-qtext img{max-width:100%;height:auto}',
    '#cu-root .cu-choices{display:grid;gap:.6rem;margin-top:1.1rem}',
    '#cu-root .cu-choice{display:grid;grid-template-columns:34px 1fr;align-items:center;gap:.8rem;width:100%;text-align:left;background:#fff;border:1.5px solid var(--cu-line);border-radius:12px;padding:.7rem .9rem;font:400 .95rem var(--hel,Poppins,sans-serif);color:inherit;cursor:pointer;transition:border-color .15s,background .15s}',
    '#cu-root .cu-choice:hover{border-color:rgba(17,17,17,.35)}',
    '#cu-root .cu-choice .lt{width:30px;height:30px;border-radius:50%;border:1.5px solid rgba(17,17,17,.3);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:.82rem}',
    '#cu-root .cu-choice.sel{border-color:#3457d5;background:#f3f5fd}#cu-root .cu-choice.sel .lt{background:#3457d5;border-color:#3457d5;color:#fff}',
    '#cu-root .cu-choice.right{border-color:var(--cu-good);background:#eef7f2}#cu-root .cu-choice.right .lt{background:var(--cu-good);border-color:var(--cu-good);color:#fff}',
    '#cu-root .cu-choice.wrong{border-color:var(--cu-bad);background:#fcefee}#cu-root .cu-choice.wrong .lt{background:var(--cu-bad);border-color:var(--cu-bad);color:#fff}',
    '#cu-root .cu-choice[disabled]{cursor:default}',
    '#cu-root .cu-fr{margin-top:1.1rem;display:flex;gap:.6rem;align-items:center}',
    '#cu-root .cu-fr input{font:500 1.05rem var(--hel,Poppins,sans-serif);padding:.65rem .8rem;border:1.5px solid var(--cu-line);border-radius:10px;width:12rem}',
    '#cu-root .cu-fr input:focus{outline:none;border-color:#3457d5}',
    '#cu-root .cu-fb{margin-top:1rem;padding:.8rem 1rem;border-radius:12px;font-size:.92rem;line-height:1.55}',
    '#cu-root .cu-fb.ok{background:#eef7f2;color:#1f5e40}#cu-root .cu-fb.no{background:#fcefee;color:#8a2a22}',
    '#cu-root .cu-fb .ex{margin-top:.6rem;color:#2b2724;background:#fff;border-radius:8px;padding:.7rem .85rem;font-family:var(--display,Georgia,serif);font-size:.93rem}',
    '#cu-root .cu-fb a{color:inherit;font-weight:600}',
    '#cu-root .cu-calc{margin-top:1rem}#cu-root .cu-calc .dx-calc-frame,#cu-root .cu-calc iframe{width:100%;height:420px;border:1px solid var(--cu-line);border-radius:12px}',
    '#cu-root .cu-mini{border:0;background:none;color:#3457d5;font:500 .82rem var(--hel,Poppins,sans-serif);cursor:pointer;padding:0}',
    '#cu-root .cu-complete{text-align:center;padding:2.2rem 1.5rem}',
    '#cu-root .cu-complete .tick{width:64px;height:64px;border-radius:50%;background:#eef7f2;color:var(--cu-good);font-size:1.8rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}',
    /* the bottom bar, as on Khan's pages */
    '#cu-root .cu-bottom{position:sticky;bottom:0;margin-top:1.2rem;background:rgba(255,255,255,.96);backdrop-filter:blur(6px);border-radius:14px;box-shadow:0 -2px 16px rgba(17,17,17,.07);padding:.75rem 1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;z-index:3}',
    '#cu-root .cu-qdots{display:flex;gap:6px;flex-wrap:wrap}',
    '#cu-root .cu-streak-wrap{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
    '#cu-root .cu-streak{display:flex;gap:4px}#cu-root .cu-streak i{width:20px;height:9px;border-radius:5px;background:#e2dfda;transition:background .3s}',
    '#cu-root .cu-streak i.on{background:var(--cu-good)}#cu-root .cu-streak-wrap .lbl b{color:var(--text,#111)}',
    '#cu-root .cu-qdots i{width:12px;height:12px;border-radius:50%;border:1.5px solid rgba(17,17,17,.3)}',
    '#cu-root .cu-qdots i.ok{background:var(--cu-good);border-color:var(--cu-good)}#cu-root .cu-qdots i.cur{border-color:#3457d5;box-shadow:0 0 0 2px rgba(52,87,213,.2)}',
    '#cu-root .cu-bottom .lbl{font-size:.82rem;color:var(--mid)}',
    '#cu-root .cu-state{padding:3rem 1rem;text-align:center;color:var(--mid)}',
    '@media(max-width:900px){#cu-root .cu-lesson-wrap{grid-template-columns:1fr}#cu-root .cu-panel{position:static;max-height:none}#cu-root .cu-steps{max-height:260px}}',
    '@media(max-width:520px){#cu-root .cu-go{display:none}#cu-root .cu-unit-p .cu-mbar{display:none}#cu-root .cu-card{padding:1.1rem}#cu-root .cu-resume{flex-direction:column;align-items:flex-start}}'
  ].join('');
  function injectCss() {
    if (document.getElementById('cu-css')) return;
    var st = document.createElement('style'); st.id = 'cu-css'; st.textContent = CSS; document.head.appendChild(st);
  }

  /* ---------- data ---------- */
  var ready = null;
  function ensureData() {
    if (ready) return ready;
    ready = Promise.all([
      window.CURRICULUM ? null : loadScript(DATA_SRC),
      window.CURRICULUM_VIDEOS ? null : loadScript(VIDEO_SRC)
    ]);
    return ready;
  }
  function courses() { return (window.CURRICULUM && window.CURRICULUM.courses) || []; }
  function course(id) { return courses().filter(function (c) { return c.id === id; })[0] || courses()[0]; }
  function allLessons(c) { return c.domains.reduce(function (a, d) { return a.concat(d.lessons.map(function (l) { return { l: l, d: d }; })); }, []); }
  function findLesson(id) {
    var hit = null;
    courses().forEach(function (c) { allLessons(c).forEach(function (x) { if (x.l.id === id) hit = { c: c, d: x.d, l: x.l }; }); });
    return hit;
  }
  function bankReady(c) {
    var p = c.bank === 'math' ? window.__questionBankMathReady : window.__questionBankReady;
    return p || Promise.resolve();
  }
  var qIndex = {};
  function question(qid) {
    if (qIndex[qid]) return qIndex[qid];
    [window.QUESTION_BANK_MATH, window.QUESTION_BANK].forEach(function (b) {
      if (!b) return;
      var arr = Array.isArray(b) ? b : Object.keys(b).reduce(function (a, k) { return a.concat(b[k]); }, []);
      arr.forEach(function (q) { if (q && q.qid && !qIndex[q.qid]) qIndex[q.qid] = q; });
    });
    return qIndex[qid] || null;
  }

  /* A part's video: CURRICULUM_VIDEOS[lessonId][partIndex], as "youtube:ID",
     "vimeo:ID", a YouTube or Vimeo link, or a direct .mp4 link. */
  function videoFor(lessonId, i) {
    var list = (window.CURRICULUM_VIDEOS || {})[lessonId];
    var v = list && list[i];
    if (!v) return null;
    v = String(v).trim();
    var m;
    if ((m = /^youtube:([\w-]{6,})$/.exec(v)) || (m = /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{6,})/.exec(v)))
      return '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(m[1]) + '?rel=0&modestbranding=1" title="Lesson video" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    if ((m = /^vimeo:(\d+)$/.exec(v)) || (m = /vimeo\.com\/(?:video\/)?(\d+)/.exec(v)))
      return '<iframe src="https://player.vimeo.com/video/' + esc(m[1]) + '" title="Lesson video" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>';
    if (/^https:\/\/\S+\.(mp4|webm|mov)(\?\S*)?$/i.test(v)) return '<video src="' + esc(v) + '" controls playsinline preload="metadata"></video>';
    return null;
  }

  /* ---------- progress ---------- */
  var prog = null, progKey = '';
  function pkey(lessonId, i) { return lessonId + '#' + i; }
  function loadProgress() {
    var k = studentKey();
    if (prog && progKey === k) return prog;
    progKey = k;
    prog = { v: 1, parts: {}, last: null };
    try { var raw = JSON.parse(localStorage.getItem('moretti_curriculum_' + k) || 'null'); if (raw && raw.parts) prog = raw; } catch (e) {}
    return prog;
  }
  function saveProgress() {
    try { localStorage.setItem('moretti_curriculum_' + progKey, JSON.stringify(prog)); } catch (e) {}
    queueSync();
  }
  function isDone(lessonId, i) { return !!(prog.parts[pkey(lessonId, i)] && prog.parts[pkey(lessonId, i)].done); }
  function markDone(lessonId, i) {
    var k = pkey(lessonId, i);
    prog.parts[k] = { done: new Date().toISOString() };
    saveProgress();
  }
  function unlocked(l, i) { return i === 0 || isDone(l.id, i - 1); }
  function lessonDoneCount(l) { var n = 0; l.parts.forEach(function (p, i) { if (isDone(l.id, i)) n++; }); return n; }

  /* The backend copy: merged part by part (a part done anywhere is done), so
     nothing is ever lost between devices. Optional: without the actions the
     device copy simply stands. */
  var syncTimer = null, pulled = false;
  // A plain-string POST (a CORS simple request); auth-client.js adds the student's session to it.
  function post(body) { return fetch(window.APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
  function pullProgress() {
    if (pulled || !progKey) return Promise.resolve();
    pulled = true;
    return post({ action: 'curriculumGet', key: progKey }).then(function (d) {
      if (!d || !d.ok || !d.progress || !d.progress.parts) return;
      var changed = false;
      Object.keys(d.progress.parts).forEach(function (k) {
        if (!prog.parts[k] && d.progress.parts[k] && d.progress.parts[k].done) { prog.parts[k] = d.progress.parts[k]; changed = true; }
      });
      if (!prog.last && d.progress.last) { prog.last = d.progress.last; changed = true; }
      if (changed) { try { localStorage.setItem('moretti_curriculum_' + progKey, JSON.stringify(prog)); } catch (e) {} rerender(); }
    }).catch(function () {});
  }
  function queueSync() {
    if (!progKey) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { post({ action: 'curriculumSync', key: progKey, progress: prog }).catch(function () {}); }, 1500);
  }

  /* ---------- view state ---------- */
  var root = null;
  var view = { name: 'home', course: 'math', lessonId: null, part: 0, step: 'video' };
  var check = null;       // the check in progress: { lessonId, part, queue, done:{}, tries:{}, current, answered }

  function rerender() {
    if (!root) return;
    if (view.name === 'lesson') renderLesson(); else renderHome();
  }
  function remember() {
    prog.last = { course: view.course, lessonId: view.lessonId, part: view.part, step: view.step };
    try { localStorage.setItem('moretti_curriculum_' + progKey, JSON.stringify(prog)); } catch (e) {}
  }

  /* ---------- home: the course, unit by unit ---------- */
  // A small progress ring: filled share of a lesson's parts, a tick when all are done.
  function ring(done, total, size) {
    size = size || 30;
    var r = size / 2 - 3, C = 2 * Math.PI * r, f = total ? done / total : 0;
    if (total && done === total) return '<span class="cu-ring done" style="width:' + size + 'px;height:' + size + 'px">&#10003;</span>';
    return '<svg class="cu-ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#e6e3de" stroke-width="3"/>' +
      (done ? '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--cu-good)" stroke-width="3" stroke-linecap="round" stroke-dasharray="' + (C * f).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>' : '') + '</svg>';
  }

  /* ---------- home: the course, unit by unit ----------
     The header and the course tabs are drawn once and never move; switching
     course crossfades only what is below them, keeping its height while it
     swaps, so nothing on the page jumps (Luca, 2026-09-27). */
  function renderHome() {
    var c = course(view.course);
    view.course = c.id;
    root.innerHTML = '<div class="cu-wrap">' +
      '<div class="cu-top"><div><div class="cu-kicker">Curriculum</div><div class="cu-toph">Learn it, then prove it</div></div>' +
      '<div class="cu-tabs" role="group" aria-label="Course">' + courses().map(function (x) {
        return '<button type="button" data-course="' + x.id + '" aria-pressed="' + (x.id === c.id) + '">' + esc(x.title) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="cu-body" id="cu-body">' + homeBody(c) + '</div></div>';
  }
  function homeBody(c) {
    var lessons = allLessons(c);
    var total = 0, done = 0;
    lessons.forEach(function (x) { total += x.l.parts.length; done += lessonDoneCount(x.l); });
    var pct = total ? Math.round(100 * done / total) : 0;
    var last = prog.last && findLesson(prog.last.lessonId);
    var resume = '';
    if (last && last.c.id === c.id) {
      resume = '<div class="cu-resume cu-in" style="--d:1"><span class="cu-resume-ic">&#9654;</span><div><b>Pick up where you left off</b><span>' + esc(last.l.num + ' ' + last.l.title) + ', part ' + (prog.last.part + 1) + ' of ' + last.l.parts.length + '</span></div>' +
        '<button type="button" class="cu-btn" data-resume>Continue &rarr;</button></div>';
    }
    var R = 34, CIRC = 2 * Math.PI * R;
    return '<section class="cu-hero cu-hero-' + c.id + ' cu-in" style="--d:0">' +
        '<div class="cu-hero-text"><h1>' + esc(c.id === 'math' ? 'SAT Math' : 'SAT Reading & Writing') + '</h1>' +
        '<div class="cu-stats"><div class="cu-bigring"><svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="' + R + '" fill="none" stroke="rgba(17,17,17,.08)" stroke-width="7"/>' +
          (done ? '<circle class="cu-ringfill" cx="42" cy="42" r="' + R + '" fill="none" stroke="var(--red,#B0271C)" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + Math.max(1, CIRC * pct / 100).toFixed(1) + ' ' + CIRC.toFixed(1) + '" transform="rotate(-90 42 42)"/>' : '') + '</svg><b>' + pct + '%</b></div>' +
          '<div class="cu-stat"><b>' + lessons.length + '</b><span>lessons</span></div><div class="cu-stat"><b>' + total + '</b><span>parts</span></div><div class="cu-stat"><b>' + done + '</b><span>done</span></div></div></div>' +
        '</section>' +
      resume +
      '<div class="cu-units">' + c.domains.map(function (d, di) {
        var dDone = d.lessons.filter(function (l) { return lessonDoneCount(l) === l.parts.length; }).length;
        return '<section class="cu-unit cu-in" style="--d:' + (di + 2) + '"><div class="cu-unit-h">' +
          '<div class="cu-unit-t"><span class="cu-unum">Unit ' + (di + 1) + '</span><h2>' + esc(d.name) + '</h2></div>' +
          '<span class="cu-unit-p"><span class="cu-mbar"><i style="width:' + Math.round(100 * dDone / d.lessons.length) + '%"></i></span>' + dDone + '/' + d.lessons.length + '</span></div>' +
          d.lessons.map(function (l) {
            var n = lessonDoneCount(l);
            return '<button type="button" class="cu-lesson" data-lesson="' + esc(l.id) + '">' + ring(n, l.parts.length) +
              '<span class="cu-lt"><span class="cu-num">' + esc(l.num) + '</span> ' + esc(l.title) + calcBadge(l) + '<small>' + pl(l.parts.length, 'part') + (n && n < l.parts.length ? ' &middot; ' + n + ' done' : '') + '</small></span>' +
              '<span class="cu-go">' + (n === l.parts.length ? 'Review' : n ? 'Continue' : 'Start') + ' &rsaquo;</span></button>';
          }).join('') + '</section>';
      }).join('') + '</div>';
  }
  function calcBadge(l) { return l.calc ? '<span class="cu-calc">Calculator</span>' : ''; }
  function switchCourse(id) {
    if (id === view.course) return;
    view.course = id;
    $$('.cu-tabs button', root).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-course') === id)); });
    var body = $('#cu-body', root);
    if (!body) return renderHome();
    body.style.minHeight = body.offsetHeight + 'px';          // hold the space while it swaps
    body.classList.add('cu-fading');
    setTimeout(function () {
      body.innerHTML = homeBody(course(id));
      body.classList.remove('cu-fading');
      requestAnimationFrame(function () { body.style.minHeight = ''; });
    }, 160);
  }

  /* ---------- a lesson ---------- */
  function openLesson(id, part, step) {
    var hit = findLesson(id);
    if (!hit) return;
    view.name = 'lesson'; view.course = hit.c.id; view.lessonId = id;
    // Never past what is unlocked.
    var p = typeof part === 'number' ? part : firstOpenPart(hit.l);
    while (p > 0 && !unlocked(hit.l, p)) p--;
    view.part = p; view.step = step || 'video';
    check = null;
    remember();
    // Its questions start downloading now, while the video plays.
    try { bankReady(hit.c); } catch (e) {}
    renderLesson();
    try { root.scrollIntoView({ block: 'start' }); window.scrollTo(0, 0); } catch (e) {}
  }
  function firstOpenPart(l) {
    for (var i = 0; i < l.parts.length; i++) if (!isDone(l.id, i)) return i;
    return 0;
  }

  function renderLesson() {
    var hit = findLesson(view.lessonId);
    if (!hit) { view.name = 'home'; return renderHome(); }
    var c = hit.c, d = hit.d, l = hit.l;
    var list = allLessons(c), at = -1;
    list.forEach(function (x, i) { if (x.l.id === l.id) at = i; });
    var prev = list[at - 1], next = list[at + 1];
    var steps = stepsHtml(l);
    root.innerHTML = '<div class="cu-wrap"><div class="cu-lesson-wrap">' +
      '<aside class="cu-panel"><div class="cu-panel-h"><button type="button" class="cu-back" data-home>&larr; All ' + esc(c.title) + ' lessons</button>' +
        '<div class="cu-crumb">' + esc(c.title + ' \u203a ' + d.name) + '</div>' +
        '<div class="cu-ltitle"><button type="button" class="cu-arrow" data-lesson-go="' + (prev ? esc(prev.l.id) : '') + '"' + (prev ? '' : ' disabled') + ' aria-label="Previous lesson">&lsaquo;</button>' +
        '<b>' + esc(l.num + ' ' + l.title) + calcBadge(l) + '</b>' +
        '<button type="button" class="cu-arrow" data-lesson-go="' + (next ? esc(next.l.id) : '') + '"' + (next ? '' : ' disabled') + ' aria-label="Next lesson">&rsaquo;</button></div></div>' +
        '<div class="cu-steps">' + steps + '</div></aside>' +
      '<main class="cu-main" id="cu-main"></main></div></div>';
    if (view.step === 'check' && l.parts[view.part].qids.length) renderCheck(c, l); else renderVideo(c, l);
  }

  // The lesson's steps for the panel: each part's video, then its check. Locked until the part before is done.
  function stepsHtml(l) {
    var out = '';
    l.parts.forEach(function (p, i) {
      var open = unlocked(l, i), done = isDone(l.id, i);
      var lock = open ? '' : ' aria-disabled="true"';
      out += '<button type="button" class="cu-step' + (view.part === i && view.step === 'video' ? ' on' : '') + (open ? '' : ' locked') + (done ? ' done' : '') + '" data-step="video" data-part="' + i + '"' + lock + '>' +
        '<span class="ic">' + (done ? '&#10003;' : '&#9654;') + '</span><span>' + esc(partTitle(l, i)) + '</span><span class="st">' + (open ? '' : '&#128274;') + '</span></button>';
      if (p.qids.length) {
        out += '<button type="button" class="cu-step' + (view.part === i && view.step === 'check' ? ' on' : '') + (open ? '' : ' locked') + (done ? ' done' : '') + '" data-step="check" data-part="' + i + '"' + lock + '>' +
          '<span class="ic">' + (done ? '&#10003;' : '&#9998;') + '</span><span>Check: ' + STREAK_TO_PASS + ' in a row</span><span class="st">' + (open ? '' : '&#128274;') + '</span></button>';
      }
    });
    return out;
  }
  /* A part is named after its last page: the one right before its check,
     which is what the questions test (Luca, 2026-09-27: Part 1 of Linear
     Equations is Definition, What do we need to create a line?, and
     Slope-Intercept Form; it was showing only "Definition"). */
  function partPages(l, i) { return (l.parts[i].notes || []).map(function (n) { return n.title; }).filter(Boolean); }
  function partTitle(l, i) {
    var t = partPages(l, i);
    var name = t.length ? t[t.length - 1] : '';
    return l.parts.length > 1 ? 'Part ' + (i + 1) + (name ? ': ' + name : '') : l.title;   // one part: the lesson itself
  }


  function notesHtml(p) {
    return (p.notes || []).map(function (n) {
      if (n.rows) {   // a math deck page
        return (n.title ? '<h3>' + esc(n.title) + '</h3>' : '') +
          (n.lead ? '<p>' + n.lead + '</p>' : '') + (n.formula ? '<div class="cu-formula">' + n.formula + '</div>' : '') +
          (n.listhead ? '<p><b>' + n.listhead + '</b></p>' : '') +
          (n.rows.length ? '<ul>' + n.rows.map(function (r) { return '<li' + (r.sub ? ' class="sub"' : '') + '>' + r.html + '</li>'; }).join('') + '</ul>' : '');
      }
      return (n.title ? '<h3>' + esc(n.title) + '</h3>' : '') + (n.html || '');
    }).join('');
  }

  function renderVideo(c, l) {
    var p = l.parts[view.part], i = view.part;
    var vid = videoFor(l.id, i);
    var hasCheck = p.qids.length > 0, done = isDone(l.id, i);
    var nextOpen = i + 1 < l.parts.length;
    var bar;
    if (hasCheck) bar = '<span class="lbl">Up next: get ' + STREAK_TO_PASS + ' right in a row</span><button type="button" class="cu-btn" data-go-check>Start the check &rarr;</button>';
    else bar = '<span class="lbl">' + (done ? 'Watched' : 'No questions for this part') + '</span><button type="button" class="cu-btn" data-watched>' + (nextOpen ? 'Next part &rarr;' : 'Finish the lesson &rarr;') + '</button>';
    $('#cu-main', root).innerHTML =
      '<div class="cu-mhead"><div class="cu-kicker">' + esc(l.num + ' ' + l.title) + '</div><h1>' + esc(partTitle(l, i)) + '</h1>' +
        (partPages(l, i).length > 1 ? '<div class="cu-sub">Covers: ' + partPages(l, i).map(esc).join(' &middot; ') + '</div>' : '') + '</div>' +
      '<div class="cu-video">' + (vid || '<div class="cu-soon"><div class="play">&#9654;</div><b>Video coming soon</b><span>This lesson\u2019s video is being recorded. The notes below cover the same material for now.</span></div>') + '</div>' +
      '<section class="cu-notes"><button type="button" class="cu-notes-h" data-notes aria-expanded="' + (!vid) + '">Notes <span>' + (vid ? 'Show' : 'Hide') + '</span></button>' +
      '<div class="cu-notes-fold' + (vid ? ' closed' : '') + '"><div class="cu-notes-in"><div class="cu-notes-b">' + (notesHtml(p) || '<p>No notes for this part.</p>') + '</div></div></div></section>' +
      '<div class="cu-bottom">' + bar + '</div>';
  }

  /* ---------- the check: 8 right in a row (Luca, 2026-09-27) ----------
     A part is passed with STREAK_TO_PASS correct answers in a row. Any miss
     resets the streak to 0, shows the answer and why, and the check carries
     on with questions the student has not seen yet: each part's pool (~30
     questions, growing) is worked through least recently seen first, never
     the same question twice in a row, so a reset means new questions rather
     than memorised ones. What was seen, and when, is kept per part on the
     device, so the rotation continues across visits. */
  var STREAK_TO_PASS = 8;
  function startCheck(c, l) {
    var p = l.parts[view.part];
    var pool = p.qids.filter(function (q) { return !!question(q); });
    check = { lessonId: l.id, part: view.part, pool: pool, streak: 0, asked: {}, n: 0, current: null, answered: false, pick: null };
    nextQuestion(l);
  }
  function seenMap(l) {
    prog.seen = prog.seen || {};
    var k = pkey(l.id, check.part);
    return (prog.seen[k] = prog.seen[k] || {});
  }
  function nextQuestion(l) {
    var seen = seenMap(l), last = check.current;
    var fresh = check.pool.filter(function (id) { return !check.asked[id] && id !== last; });
    if (!fresh.length) {                              // the whole pool has come round: start a new cycle
      check.asked = {};
      fresh = check.pool.filter(function (id) { return id !== last; });
      if (!fresh.length) fresh = check.pool.slice();  // a pool of one
    }
    // Least recently seen first (never seen = oldest), ties broken at random.
    fresh.sort(function (a, b) { return ((seen[a] || 0) - (seen[b] || 0)) || (Math.random() - 0.5); });
    check.current = fresh[0];
    check.asked[check.current] = true;
    check.n++;
    seen[check.current] = Date.now();
    try { localStorage.setItem('moretti_curriculum_' + progKey, JSON.stringify(prog)); } catch (e) {}
  }
  function renderCheck(c, l) {
    var main = $('#cu-main', root);
    main.innerHTML = '<div class="cu-state">Loading the questions&hellip;</div>';
    bankReady(c).then(function () {
      if (view.name !== 'lesson' || view.lessonId !== l.id || view.step !== 'check') return;
      if (!check || check.lessonId !== l.id || check.part !== view.part) startCheck(c, l);
      drawQuestion(c, l);
    });
  }
  function streakHtml() {
    var segs = '';
    for (var i = 0; i < STREAK_TO_PASS; i++) segs += '<i class="' + (i < check.streak ? 'on' : '') + '"></i>';
    return '<div class="cu-streak" role="img" aria-label="' + check.streak + ' in a row of ' + STREAK_TO_PASS + ' needed">' + segs + '</div>' +
      '<span class="lbl"><b>' + check.streak + '</b> in a row &middot; ' + STREAK_TO_PASS + ' to pass</span>';
  }
  function drawQuestion(c, l) {
    var main = $('#cu-main', root);
    if (!check.pool.length || !check.current) {
      main.innerHTML = '<div class="cu-card cu-state">These questions could not be loaded. Check your connection and try again.</div>';
      return;
    }
    var q = question(check.current);
    var body;
    if (q.type === 'fr') {
      body = '<div class="cu-fr"><input type="text" inputmode="decimal" autocomplete="off" aria-label="Your answer" id="cu-fr" placeholder="Your answer"></div>';
    } else {
      body = '<div class="cu-choices">' + (q.choices || []).map(function (ch, k) {
        return '<button type="button" class="cu-choice" data-choice="' + k + '"><span class="lt">' + LETTERS[k] + '</span><span>' + ch + '</span></button>';
      }).join('') + '</div>';
    }
    var isMath = c.bank === 'math';
    main.innerHTML =
      '<div class="cu-mhead"><div class="cu-kicker">' + esc(l.num + ' ' + l.title) + '</div><h1>Check your understanding</h1>' +
        '<div class="cu-sub">Get ' + STREAK_TO_PASS + ' right in a row to unlock the next part. A miss starts the count over, with new questions.</div></div>' +
      '<div class="cu-card"><div class="cu-qhead"><span>Question ' + check.n + '</span>' +
        (isMath ? '<button type="button" class="cu-mini" data-calc>Calculator</button>' : '') + '</div>' +
        '<div class="cu-qtext">' + q.text + '</div>' + body + '<div id="cu-fb"></div><div class="cu-calc" id="cu-calc" hidden></div></div>' +
      '<div class="cu-bottom"><div class="cu-streak-wrap">' + streakHtml() + '</div>' +
        '<button type="button" class="cu-btn" id="cu-go" data-check-go disabled>Check</button></div>';
    var fr = $('#cu-fr', main);
    if (fr) {
      fr.addEventListener('input', function () { $('#cu-go', main).disabled = !fr.value.trim(); });
      fr.addEventListener('keydown', function (e) { if (e.key === 'Enter' && fr.value.trim()) submitAnswer(c, l); });
      setTimeout(function () { try { fr.focus(); } catch (e) {} }, 50);
    }
  }
  function grade(q) {
    if (q.type === 'fr') {
      var raw = ($('#cu-fr', root) || {}).value || '';
      var keys = [q.answerValue != null ? q.answerValue : q.answer].concat((window.FR_ALTERNATES || {})[q.qid] || []);
      return { ok: window.gridInCorrect ? !!window.gridInCorrect(raw, keys) : String(raw).trim() === String(keys[0]).trim(), given: raw };
    }
    return { ok: check.pick === q.correct, given: check.pick };
  }
  function submitAnswer(c, l) {
    var main = $('#cu-main', root), q = question(check.current), fb = $('#cu-fb', main), go = $('#cu-go', main);
    if (check.answered) {           // Next
      check.answered = false; check.pick = null;
      if (check.streak >= STREAK_TO_PASS) return drawComplete(c, l);
      nextQuestion(l);
      return drawQuestion(c, l);
    }
    var g = grade(q);
    check.answered = true;
    if (g.ok) {
      check.streak++;
      markChoices(q, true);
      var passed = check.streak >= STREAK_TO_PASS;
      fb.innerHTML = '<div class="cu-fb ok"><b>Correct!</b> ' + (passed ? STREAK_TO_PASS + ' in a row. That\u2019s the part.' : check.streak + ' in a row.') + '</div>';
      go.textContent = passed ? 'Finish' : 'Next question'; go.disabled = false;
    } else {
      var had = check.streak;
      check.streak = 0;
      markChoices(q, false);
      var answer = q.type === 'fr' ? '<p>The answer is <b>' + esc(q.answerValue != null ? q.answerValue : q.answer) + '</b>.</p>' : '';
      fb.innerHTML = '<div class="cu-fb no"><b>Not quite.</b> ' + (had ? 'Your streak of ' + had + ' starts over' : 'The count starts over') +
        ', with new questions. Stuck? <a href="#" data-rewatch>Rewatch the video</a> or check the notes.' +
        '<div class="ex">' + answer + (q.explanation || '') + '</div></div>';
      go.textContent = 'Next question'; go.disabled = false;
    }
    var w = $('.cu-streak-wrap', main); if (w) w.innerHTML = streakHtml();
  }
  function markChoices(q, ok) {
    if (q.type === 'fr') { var fr = $('#cu-fr', root); if (fr) fr.disabled = true; return; }
    $$('.cu-choice', root).forEach(function (b) {
      var k = Number(b.getAttribute('data-choice'));
      b.disabled = true;
      b.classList.remove('sel');
      if (k === q.correct) b.classList.add('right');
      else if (k === check.pick && !ok) b.classList.add('wrong');
    });
  }
  function drawComplete(c, l) {
    var i = check.part;
    markDone(l.id, i);
    var nextPart = i + 1 < l.parts.length;
    var list = allLessons(c), at = -1;
    list.forEach(function (x, j) { if (x.l.id === l.id) at = j; });
    var nextLesson = list[at + 1];
    $('#cu-main', root).innerHTML =
      '<div class="cu-card cu-complete"><div class="tick">&#10003;</div><h2 style="margin:0 0 .4rem">' + (nextPart ? 'Part ' + (i + 1) + ' complete' : 'Lesson complete') + '</h2>' +
      '<p class="cu-sub">' + (nextPart ? STREAK_TO_PASS + ' right in a row. The next part is unlocked.' : STREAK_TO_PASS + ' right in a row. You finished ' + esc(l.num + ' ' + l.title) + '.') + '</p>' +
      '<div style="margin-top:1.3rem;display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap">' +
      (nextPart ? '<button type="button" class="cu-btn" data-open-part="' + (i + 1) + '">Up next: part ' + (i + 2) + ' &rarr;</button>'
        : nextLesson ? '<button type="button" class="cu-btn" data-lesson-go="' + esc(nextLesson.l.id) + '">Up next: ' + esc(nextLesson.l.num + ' ' + nextLesson.l.title) + ' &rarr;</button>' : '') +
      '<button type="button" class="cu-btn ghost" data-home>All lessons</button></div></div>';
    check = null;
    // The panel's ticks and locks follow, without touching the main column.
    var steps = root.querySelector('.cu-steps');
    if (steps) steps.innerHTML = stepsHtml(l);
  }

  /* ---------- clicks ---------- */
  function onClick(e) {
    var t = e.target;
    var b;
    if ((b = t.closest('[data-course]'))) return switchCourse(b.getAttribute('data-course'));
    if ((b = t.closest('[data-resume]'))) { var L = prog.last; return openLesson(L.lessonId, L.part, L.step); }
    if ((b = t.closest('[data-lesson]'))) return openLesson(b.getAttribute('data-lesson'));
    if ((b = t.closest('[data-lesson-go]'))) { var id = b.getAttribute('data-lesson-go'); if (id) openLesson(id); return; }
    if ((b = t.closest('[data-home]'))) { view.name = 'home'; check = null; renderHome(); try { window.scrollTo(0, 0); } catch (err) {} return; }
    var hit = view.lessonId && findLesson(view.lessonId);
    if (!hit) return;
    if ((b = t.closest('.cu-step'))) {
      var part = Number(b.getAttribute('data-part'));
      if (!unlocked(hit.l, part)) return;
      view.part = part; view.step = b.getAttribute('data-step');
      if (!(check && check.part === part && check.lessonId === hit.l.id)) check = null;
      remember(); return renderLesson();
    }
    if ((b = t.closest('[data-open-part]'))) { view.part = Number(b.getAttribute('data-open-part')); view.step = 'video'; remember(); return renderLesson(); }
    if (t.closest('[data-go-check]')) { view.step = 'check'; remember(); return renderLesson(); }
    if (t.closest('[data-watched]')) {
      markDone(hit.l.id, view.part);
      if (view.part + 1 < hit.l.parts.length) { view.part++; view.step = 'video'; remember(); return renderLesson(); }
      var list = allLessons(hit.c), at = -1;
      list.forEach(function (x, j) { if (x.l.id === hit.l.id) at = j; });
      return list[at + 1] ? openLesson(list[at + 1].l.id) : (view.name = 'home', renderHome());
    }
    if ((b = t.closest('[data-notes]'))) {
      /* Folds open and shut (a height animation), with the Notes header held
         where it is on screen, so the page never jumps under the student
         (Luca, 2026-09-27). */
      var fold = b.nextElementSibling, open = fold.classList.contains('closed');
      var before = b.getBoundingClientRect().top;
      // The page keeps its height while on this part, or a page scrolled near
      // its end would have to scroll up when the notes shut.
      var main = $('#cu-main', root);
      if (!open && main) main.style.minHeight = main.offsetHeight + 'px';
      fold.classList.toggle('closed', !open);
      b.setAttribute('aria-expanded', String(open)); b.querySelector('span').textContent = open ? 'Hide' : 'Show';
      var start = performance.now();
      (function hold(now) {
        var drift = b.getBoundingClientRect().top - before;
        if (Math.abs(drift) > 0.5) window.scrollBy(0, drift);
        if (now - start < 420) requestAnimationFrame(hold);
      })(start);
      return;
    }
    if (t.closest('[data-rewatch]')) { e.preventDefault(); view.step = 'video'; return renderLesson(); }
    if (t.closest('[data-calc]')) {
      var box = $('#cu-calc', root);
      if (box.hasAttribute('hidden')) { box.removeAttribute('hidden'); if (window.ensureDesmosCalculator) window.ensureDesmosCalculator(box); }
      else box.setAttribute('hidden', '');
      return;
    }
    if (check && (b = t.closest('.cu-choice')) && !b.disabled) {
      check.pick = Number(b.getAttribute('data-choice'));
      $$('.cu-choice', root).forEach(function (x) { x.classList.toggle('sel', x === b); });
      $('#cu-go', root).disabled = false;
      return;
    }
    if (check && t.closest('[data-check-go]')) return submitAnswer(hit.c, hit.l);
  }

  /* ---------- entry ---------- */
  window.curriculumModuleInit = function () {
    root = document.getElementById('cu-root');
    if (!root) return;
    injectCss();
    if (!root.__wired) { root.addEventListener('click', onClick); root.__wired = true; }
    if (!window.CURRICULUM) root.innerHTML = '<div class="cu-state">Loading the curriculum&hellip;</div>';
    ensureData().then(function () {
      if (!courses().length) { root.innerHTML = '<div class="cu-state">The curriculum could not be loaded. Check your connection and try again.</div>'; return; }
      loadProgress();
      rerender();
      pullProgress();
    });
  };
})();
