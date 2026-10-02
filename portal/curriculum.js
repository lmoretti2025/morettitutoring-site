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

  var DATA_SRC = 'curriculum-data.js?v=20261002l';
  var VIDEO_SRC = 'curriculum-videos.js?v=20261002c';

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
    // A fixed width (Luca, 2026-09-30): the screen sized itself to its content, so switching course or opening Suggested order moved everything.
    '#cu-root{width:100%;align-self:stretch}',
    '#cu-root .cu-wrap{width:100%;max-width:1100px;margin:0 auto;padding:1.6rem clamp(1rem,3vw,2rem) 6rem}',
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
    '#cu-root .cu-gate{display:flex;align-items:center;gap:1rem;background:#fff;border-radius:14px;box-shadow:var(--shadow);padding:1rem 1.2rem;margin:0 0 1.6rem;border-left:4px solid var(--red,#B0271C)}',
    '#cu-root .cu-gate>div{flex:1;min-width:0}#cu-root .cu-gate b{display:block;font-size:.98rem;font-weight:600}#cu-root .cu-gate span{font-size:.84rem;color:var(--mid);font-weight:300}',
    '#cu-root .cu-gate-ic{flex:none;width:36px;height:36px;border-radius:50%;background:rgba(176,39,28,.1);color:var(--red,#B0271C);display:flex;align-items:center;justify-content:center}',
    '#cu-root .cu-gate.nudge{animation:cuNudge .5s}@keyframes cuNudge{0%,100%{transform:none}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}',
    '#cu-root .cu-lesson.cu-locked{cursor:default}#cu-root .cu-lesson.cu-locked .cu-lt,#cu-root .cu-lesson.cu-locked .cu-go{opacity:.45}',
    '#cu-root .cu-lockring{display:inline-flex;align-items:center;justify-content:center;color:var(--mid);background:rgba(17,17,17,.05);border-radius:50%;flex:none}',
    '#cu-root .cu-gchip.locked{opacity:.45;cursor:default}#cu-root .cu-gchip.locked:hover{border-color:rgba(17,17,17,.14);color:inherit}',
    '#cu-root .cu-watch{font-size:.82rem;color:var(--mid);margin:.6rem 0 0}#cu-root .cu-watch b{color:var(--text,#111);font-weight:600}#cu-root .cu-watch.ok b{color:var(--cu-good)}',
    '@media(max-width:520px){#cu-root .cu-gate{flex-direction:column;align-items:flex-start}}',
    '#cu-root .cu-guide{background:#fff;border-radius:14px;box-shadow:var(--shadow);margin:0 0 1.6rem;overflow:hidden}',
    '#cu-root .cu-guide>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.95rem 1.2rem}',
    '#cu-root .cu-guide>summary::-webkit-details-marker{display:none}',
    '#cu-root .cu-guide>summary b{font-size:.95rem;font-weight:600}#cu-root .cu-guide>summary small{display:block;font-size:.78rem;color:var(--mid);font-weight:300;margin-top:2px}',
    '#cu-root .cu-guide-tog{width:.55rem;height:.55rem;border-right:1.5px solid var(--mid);border-bottom:1.5px solid var(--mid);transform:rotate(45deg);transition:transform .2s;flex:none;margin-right:.2rem}',
    '#cu-root .cu-guide[open] .cu-guide-tog{transform:rotate(-135deg)}',
    '#cu-root .cu-guide-body{padding:0 1.2rem 1.1rem;border-top:1px solid rgba(17,17,17,.06)}',
    '#cu-root .cu-guide-lead{font-size:.86rem;color:var(--mid);margin:.9rem 0 .6rem}',
    '#cu-root .cu-guide ol{margin:0;padding:0 0 0 1.2rem}#cu-root .cu-guide li{padding:.55rem 0 .55rem .2rem;border-bottom:1px solid rgba(17,17,17,.05)}#cu-root .cu-guide li:last-child{border-bottom:0}',
    '#cu-root .cu-guide li p{font-size:.84rem;margin:.35rem 0 0;line-height:1.5}',
    '#cu-root .cu-gchips{display:flex;flex-wrap:wrap;gap:.3rem}',
    '#cu-root .cu-gchip{font:inherit;font-size:.74rem;font-weight:600;padding:2px 9px;border-radius:999px;border:1px solid rgba(17,17,17,.14);background:#fff;color:inherit;cursor:pointer}',
    '#cu-root .cu-gchip:hover{border-color:var(--red,#B0271C);color:var(--red,#B0271C)}',
    '#cu-root .cu-gchip.done{background:rgba(46,125,80,.1);border-color:transparent;color:var(--cu-good)}',
    '#cu-root .cu-resume{display:flex;align-items:center;justify-content:space-between;gap:1rem;background:#fff;border-radius:14px;box-shadow:var(--shadow);padding:1rem 1.2rem;margin:0 0 1.6rem;border-left:4px solid var(--red,#B0271C)}',
    '#cu-root .cu-resume b{display:block;font-weight:600}#cu-root .cu-resume span{font-size:.85rem;color:var(--mid)}',
    '#cu-root .cu-btn{display:inline-flex;align-items:center;gap:.5rem;border:0;border-radius:999px;background:var(--red,#B0271C);color:#fff;font:600 .85rem var(--hel,Poppins,sans-serif);padding:.75rem 1.3rem;cursor:pointer;white-space:nowrap;transition:transform .15s,box-shadow .15s}',
    '#cu-root .cu-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(176,39,28,.22)}',
    '#cu-root .cu-btn[disabled]{opacity:.45;cursor:default;transform:none;box-shadow:none}',
    '#cu-root .cu-btn.ghost{background:#fff;color:var(--text,#111);box-shadow:inset 0 0 0 1px var(--cu-line)}',
    '#cu-root .cu-units{display:grid;gap:1.1rem}',
    'html:has(#screen-curriculum.active){scrollbar-gutter:stable}',
    '#cu-root .cu-top{display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1.1rem;min-height:3rem}',
    '#cu-root .cu-toph{font-family:var(--display,Georgia,serif);font-size:1.5rem;font-weight:700}',
    '#cu-root .cu-top .cu-tabs{margin:0}',
    '#cu-root .cu-body{transition:opacity .16s ease}#cu-root .cu-body.cu-fading{opacity:0}',
    '#cu-root .cu-in{animation:cuIn .5s var(--ease,ease) both;animation-delay:calc(var(--d,0) * 60ms)}',
    '@keyframes cuIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
    '#cu-root .cu-hero{border-radius:18px;padding:1.15rem 1.6rem;margin-bottom:1.2rem;overflow:hidden;position:relative;box-shadow:var(--shadow)}',
    '#cu-root .cu-hero-text{display:flex;align-items:center;justify-content:space-between;gap:.8rem 2rem;flex-wrap:wrap}',
    '#cu-root .cu-hero-math{background:linear-gradient(135deg,#fff 0%,#fbf1ef 60%,#f6e4e1 100%)}',
    '#cu-root .cu-hero-english{background:linear-gradient(135deg,#fff 0%,#eff2fb 60%,#e3e8f7 100%)}',
    '#cu-root .cu-hero h1{margin:0;font-size:clamp(1.6rem,3vw,2.1rem)}',
    '#cu-root .cu-hero .cu-sub{max-width:32em}',
    '#cu-root .cu-stats{display:flex;align-items:center;gap:1.4rem;flex-wrap:wrap}',
    '#cu-root .cu-bigring{zoom:.76}',
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
    '#cu-root .cu-calcb{display:inline-block;vertical-align:2px;margin-left:.45rem;padding:1px 7px;border-radius:999px;background:rgba(13,122,95,.1);color:#0d7a5f;font-size:.66rem;font-weight:600;letter-spacing:.02em;white-space:nowrap}',
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
    '#cu-root .cu-ptabs{display:flex;gap:4px;padding:.5rem .8rem;border-bottom:1px solid var(--cu-line)}',
    '#cu-root .cu-ptabs button{flex:1;border:0;background:transparent;font:500 .8rem var(--hel,Poppins,sans-serif);color:var(--mid);padding:.4rem;border-radius:999px;cursor:pointer}',
    '#cu-root .cu-ptabs button[aria-pressed="true"]{background:var(--cu-soft);color:var(--text,#111)}',
    '#cu-root .cu-pnotes{display:none;flex:1 1 auto;min-height:0;overflow-y:auto;padding:.4rem 1.1rem 1.2rem;font-size:.85rem;line-height:1.6}',
    '#cu-root .cu-pnotes h3{font-size:1rem;margin:.9rem 0 .3rem}',
    '#cu-root .cu-panel.show-notes .cu-steps{display:none}#cu-root .cu-panel.show-notes .cu-pnotes{display:block}',
    '@media(max-width:900px){#cu-root .cu-pnotes{max-height:320px}}',
    '#cu-root .cu-step{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:.6rem;width:100%;border:0;background:none;text-align:left;padding:.62rem 1rem;font:400 .86rem var(--hel,Poppins,sans-serif);color:var(--text,#111);cursor:pointer;border-left:3px solid transparent}',
    '#cu-root .cu-step:hover{background:var(--cu-soft)}',
    '#cu-root .cu-step.on{background:#fbf3f2;border-left-color:var(--red,#B0271C);font-weight:500}',
    '#cu-root .cu-step.locked{color:#a8a39c;cursor:not-allowed}#cu-root .cu-step.locked:hover{background:none}',
    '#cu-root .cu-step .ic{width:26px;height:26px;border-radius:7px;border:1px solid var(--cu-line);display:flex;align-items:center;justify-content:center;font-size:.72rem;color:var(--mid)}',
    '#cu-root .cu-step.done .ic{background:var(--cu-good);border-color:var(--cu-good);color:#fff}',
    '#cu-root .cu-step .st{font-size:.72rem;color:var(--mid)}',
    '#cu-root .cu-main{min-width:0}',
    '#cu-root .cu-mhead{margin-bottom:1rem}#cu-root .cu-mhead h1{font-size:clamp(1.4rem,2.6vw,1.9rem);margin:.15rem 0 .3rem}',
    '#cu-root .cu-nov{display:flex;align-items:center;gap:.9rem;background:#12284c;color:#fff;border-radius:14px;padding:.9rem 1.1rem;box-shadow:var(--shadow)}',
    '#cu-root .cu-nov .play{flex:none;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:.85rem}',
    '#cu-root .cu-nov b{display:block;font-weight:600;font-size:.95rem}#cu-root .cu-nov span span,#cu-root .cu-nov div span{font-size:.84rem;opacity:.75;font-weight:300}',
    '#cu-root .cu-step.sub{padding-top:.34rem;padding-bottom:.5rem;font-size:.8rem;color:var(--mid)}#cu-root .cu-step.sub small{font-size:.74rem;opacity:.8;margin-left:.2rem}',
    '#cu-root .cu-step.sub .ic{width:14px;height:14px;border-radius:50%;margin-left:6px;font-size:.55rem}',
    '#cu-root .cu-step .st svg{display:block;opacity:.55}',
    '#cu-root .cu-video{position:relative;width:100%;aspect-ratio:16/9;background:#12284c;border-radius:14px;overflow:hidden;box-shadow:var(--shadow)}',
    '#cu-root .cu-video iframe,#cu-root .cu-video video{position:absolute;inset:0;width:100%;height:100%;border:0}',
    '#cu-root .cu-r2{position:absolute;inset:0}#cu-root .cu-soon a{color:#fff}',
    '#cu-root .cu-r2 .cu-soon .play{animation:cuLoad 1.3s ease-in-out infinite}@keyframes cuLoad{0%,100%{opacity:.55;transform:scale(.96)}50%{opacity:1;transform:none}}',
    '@media(prefers-reduced-motion:reduce){#cu-root .cu-r2 .cu-soon .play{animation:none}}',
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
    '#cu-root .cu-notes-b li.sub.deep{margin-left:2.4rem;list-style:square}',
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
    '#cu-root .cu-crow{display:grid;grid-template-columns:1fr;gap:.5rem;align-items:center}',
    '#cu-root .cu-choices.elim .cu-crow{grid-template-columns:1fr 54px}',
    '#cu-root .cu-x{display:none;width:34px;height:34px;border-radius:50%;border:1.5px solid rgba(17,17,17,.3);background:#fff;color:inherit;font:600 .78rem var(--hel,Poppins,sans-serif);cursor:pointer;align-items:center;justify-content:center;position:relative;padding:0}',
    '#cu-root .cu-x::after{content:"";position:absolute;left:4px;right:4px;top:50%;border-top:1.5px solid currentColor}',
    '#cu-root .cu-x:hover{border-color:rgba(17,17,17,.6)}',
    '#cu-root .cu-choices.elim .cu-x{display:flex}',
    '#cu-root .cu-crow.out .cu-choice{opacity:.45}#cu-root .cu-crow.out .cu-choice>span:last-child{text-decoration:line-through}',
    '#cu-root .cu-x{justify-self:center}#cu-root .cu-crow.out .cu-x{width:54px;border-radius:999px;font-size:.72rem;font-weight:500}#cu-root .cu-crow.out .cu-x::after{display:none}',
    '#cu-root .cu-qtools{display:flex;gap:1.1rem;align-items:center}',
    '#cu-root .cu-abc{border:1.5px solid var(--cu-line);background:#fff;border-radius:6px;padding:.15rem .45rem;font:600 .74rem var(--hel,Poppins,sans-serif);color:inherit;cursor:pointer;text-decoration:line-through}',
    '#cu-root .cu-abc[aria-pressed="true"]{background:#3457d5;border-color:#3457d5;color:#fff}',
    '#cu-root .cu-fr{margin-top:1.1rem;display:flex;gap:.6rem;align-items:center}',
    '#cu-root .cu-fr input{font:500 1.05rem var(--hel,Poppins,sans-serif);padding:.65rem .8rem;border:1.5px solid var(--cu-line);border-radius:10px;width:12rem}',
    '#cu-root .cu-fr input:focus{outline:none;border-color:#3457d5}',
    '#cu-root .cu-fb{margin-top:1rem;padding:.8rem 1rem;border-radius:12px;font-size:.92rem;line-height:1.55}',
    '#cu-root .cu-fb.ok{background:#eef7f2;color:#1f5e40}#cu-root .cu-fb.no{background:#fcefee;color:#8a2a22}',
    '#cu-root .cu-fb .ex{margin-top:.6rem;color:#2b2724;background:#fff;border-radius:8px;padding:.7rem .85rem;font-family:var(--display,Georgia,serif);font-size:.93rem}',
    '#cu-root .cu-fb a{color:inherit;font-weight:600}',
    '#cu-calc-pop{position:fixed;right:24px;bottom:24px;width:440px;height:540px;min-width:300px;min-height:320px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);z-index:9000;background:#fff;border-radius:14px;box-shadow:0 18px 50px rgba(17,17,17,.28),0 0 0 1px rgba(17,17,17,.08);display:flex;flex-direction:column;overflow:hidden;resize:both}',
    '#cu-calc-pop[hidden]{display:none}',
    '#cu-calc-pop .cu-pop-bar{flex:none;display:flex;align-items:center;justify-content:space-between;padding:.5rem .7rem .5rem 1rem;background:#12284c;color:#fff;cursor:move;user-select:none;touch-action:none;font:600 .85rem var(--hel,Poppins,sans-serif)}',
    '#cu-calc-pop .cu-pop-x{border:0;background:rgba(255,255,255,.14);color:#fff;width:28px;height:28px;border-radius:50%;font-size:1.1rem;line-height:1;cursor:pointer}',
    '#cu-calc-pop .cu-pop-body{flex:1;min-height:0;position:relative}#cu-calc-pop .cu-pop-body iframe,#cu-calc-pop .cu-pop-body .dx-calc-frame{position:absolute;inset:0;width:100%;height:100%;border:0}',
    '@media(max-width:600px){#cu-calc-pop{left:8px!important;right:8px!important;top:auto!important;bottom:8px!important;width:auto;height:60vh;resize:none}}',
    '#cu-root .cu-mini{border:0;background:none;color:#3457d5;font:500 .82rem var(--hel,Poppins,sans-serif);cursor:pointer;padding:0}',
    '#cu-root .cu-complete{text-align:center;padding:2.2rem 1.5rem}',
    '#cu-root .cu-complete .tick{width:64px;height:64px;border-radius:50%;background:#eef7f2;color:var(--cu-good);font-size:1.8rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}',
    /* the bottom bar, as on Khan's pages */
    '#cu-root .cu-bottom{position:sticky;bottom:0;margin-top:1.2rem;background:rgba(255,255,255,.96);backdrop-filter:blur(6px);border-radius:14px;box-shadow:0 -2px 16px rgba(17,17,17,.07);padding:.75rem 1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;z-index:3}',
    '#cu-root .cu-qdots{display:flex;gap:6px;flex-wrap:wrap}',
    '#cu-root .cu-streak-wrap{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
    '#cu-root .cu-streak{display:flex;gap:4px}#cu-root .cu-streak i{width:20px;height:9px;border-radius:5px;background:#e2dfda;transition:background .3s}',
    '#cu-root .cu-streak i.miss{background:var(--cu-bad)}#cu-root .cu-streak i.on{background:var(--cu-good)}#cu-root .cu-streak-wrap .lbl b{color:var(--text,#111)}',
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
  // The play triangle, drawn: the text character sits off-centre in its circle.
  function playSvg(px) { return '<svg width="' + px + '" height="' + px + '" viewBox="0 0 24 24" aria-hidden="true" style="display:block"><path d="M8.5 5.2v13.6L19.5 12z" fill="currentColor"/></svg>'; }
  var PLAY_SVG = playSvg(26), PLAY_SVG_SM = playSvg(18), PLAY_SVG_XS = playSvg(12);

  /* Lesson titles read in title case (Luca, 2026-09-30) without touching his
     text in the course files. Never lowercases a whole title: a word that
     already has a capital inside it, or is all capitals (SAT, II), is left
     alone; small words stay small unless they open the title or follow a
     colon. Done once, when the course is first read. */
  var TITLE_MINOR = { a: 1, an: 1, and: 1, as: 1, at: 1, but: 1, by: 1, 'for': 1, from: 1, 'in': 1, nor: 1, of: 1, on: 1, or: 1, the: 1, to: 1, vs: 1, 'with': 1 };
  function titleCase(str) {
    var toks = String(str || '').split(/(\s+)/);
    return toks.map(function (tok, i) {
      if (/^\s+$/.test(tok)) return tok;
      var prev = toks[i - 2] || '';
      var opens = i === 0 || /[:\u2014-]$/.test(prev);
      if (/[A-Z]/.test(tok.slice(1)) || /^[A-Z]+[^a-z]*$/.test(tok)) return tok;
      var bare = tok.replace(/[^A-Za-z-]/g, '').toLowerCase();
      if (!opens && TITLE_MINOR[bare] === 1) return tok.toLowerCase();
      return tok.replace(/[A-Za-z][a-z]*/g, function (w) { return w.charAt(0).toUpperCase() + w.slice(1); });
    }).join('');
  }
  var titled = false;
  function courses() {
    var list = (window.CURRICULUM && window.CURRICULUM.courses) || [];
    if (!titled && list.length) {
      titled = true;
      list.forEach(function (c) { c.domains.forEach(function (d) { d.lessons.forEach(function (l) { l.title = titleCase(l.title); }); }); });
    }
    return list;
  }
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

  /* A part's video: CURRICULUM_VIDEOS[lessonId][partIndex], as "r2:KEY"
     (a private course video, see r2Mount), "youtube:ID", "vimeo:ID", a
     YouTube or Vimeo link, or a direct .mp4 link. */
  // '2:05' or '125' as seconds; '' when not given.
  function secsOf(t) {
    if (!t) return '';
    var n = String(t).split(':').reduce(function (a, x) { return a * 60 + Number(x || 0); }, 0);
    return isFinite(n) && n >= 0 ? String(Math.round(n * 10) / 10) : '';
  }
  function videoFor(lessonId, i) {
    var list = (window.CURRICULUM_VIDEOS || {})[lessonId];
    var v = list && list[i];
    if (!v) return null;
    v = String(v).trim();
    var m;
    /* One video can carry a whole lesson (Luca records a lesson in one take):
       'r2:m2.1-1.mp4@2:05-4:40' plays that part's stretch of it, from 2:05,
       stopping at 4:40 (either end may be left off). 'part:1' means the part
       is covered in Part 1's video, until its times are known. */
    if ((m = /^part:(\d{1,2})$/.exec(v)))
      return 'PART:' + (Number(m[1]) - 1);
    if ((m = /^r2:([me]\d{1,2}\.\d{1,2}-\d{1,2}\.mp4)(?:@([\d:.]*)(?:-([\d:.]*))?)?$/.exec(v)))
      return '<div class="cu-r2" data-r2="' + esc(m[1]) + '" data-from="' + secsOf(m[2]) + '" data-to="' + secsOf(m[3]) + '"><div class="cu-soon"><div class="play">' + PLAY_SVG + '</div><b>Loading the video&hellip;</b></div></div>';
    if ((m = /^youtube:([\w-]{6,})$/.exec(v)) || (m = /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{6,})/.exec(v)))
      return '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(m[1]) + '?rel=0&modestbranding=1" title="Lesson video" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    if ((m = /^vimeo:(\d+)$/.exec(v)) || (m = /vimeo\.com\/(?:video\/)?(\d+)/.exec(v)))
      return '<iframe src="https://player.vimeo.com/video/' + esc(m[1]) + '" title="Lesson video" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>';
    if (/^https:\/\/\S+\.(mp4|webm|mov)(\?\S*)?$/i.test(v)) return '<video src="' + esc(v) + '" controls playsinline preload="metadata"></video>';
    return null;
  }

  /* PRIVATE COURSE VIDEOS (Luca, 2026-09-30). The files sit in a private
     bucket behind videos.morettitutoring.com, which plays one only with a
     signed link that runs out after two hours. The backend (Code.gs
     videoToken) signs it for this signed-in student alone, so a link passed
     on stops working that evening. A link is reused while it has 10 minutes
     left; one that runs out mid-video is renewed and picks up at the same
     second. */
  /* A FAST START (Luca, 2026-09-30). Asking the backend for a link is the
     slow step, a few seconds through Apps Script, so it is done ahead: for
     the lesson a student is most likely to open as soon as the course page
     draws, and for any lesson the pointer goes down on. A link lasts two
     hours, so it is kept for the tab (sessionStorage) and a second visit
     starts at once. One request per video at a time. */
  var r2Links = {}, r2Asking = {}, r2Loaded = '';
  function r2Store() { try { sessionStorage.setItem('moretti_cu_r2_' + progKey, JSON.stringify(r2Links)); } catch (e) {} }
  function r2Link(key, fresh) {
    if (r2Loaded !== progKey) {
      r2Loaded = progKey; r2Links = {};
      try { r2Links = JSON.parse(sessionStorage.getItem('moretti_cu_r2_' + progKey) || '{}') || {}; } catch (e) { r2Links = {}; }
    }
    var hit = r2Links[key];
    if (!fresh && hit && hit.e * 1000 - Date.now() > 10 * 60000) return Promise.resolve(hit);
    if (r2Asking[key]) return r2Asking[key];
    var ask = post({ action: 'videoToken', key: progKey, video: key }).then(function (d) {
      delete r2Asking[key];
      if (!d || !d.ok || !d.url) throw new Error((d && d.error) || 'no_link');
      r2Links[key] = d; r2Store();
      return d;
    }, function (err) { delete r2Asking[key]; throw err; });
    return (r2Asking[key] = ask);
  }
  function r2KeyOf(lessonId, i) {
    var v = ((window.CURRICULUM_VIDEOS || {})[lessonId] || [])[i];
    var m = /^r2:([me]\d{1,2}\.\d{1,2}-\d{1,2}\.mp4)(?:@[\d:.\-]*)?$/.exec(String(v || '').trim());
    return m ? m[1] : '';
  }
  var r2Hinted = false;
  function r2Warm(lessonId, i) {
    var key = lessonId && r2KeyOf(lessonId, i || 0);
    if (!key || !progKey) return;
    if (!r2Hinted) {          // the connection to the video host, opened early too
      r2Hinted = true;
      try { var ln = document.createElement('link'); ln.rel = 'preconnect'; ln.href = 'https://videos.morettitutoring.com'; document.head.appendChild(ln); } catch (e) {}
    }
    r2Link(key).catch(function () {});
  }
  function r2Mount() {
    var box = $('.cu-r2', root);
    if (!box) return;
    var key = box.getAttribute('data-r2');
    var fail = function (err) {
      if (!box.isConnected) return;
      var why = String(err && err.message);
      // not_configured: the signing key is not in Apps Script yet, so the video is not out yet.
      var msg = why === 'not_entitled'
        ? '<b>Videos open with your sessions</b><span>This lesson\u2019s notes are below in the meantime.</span>'
        : '<b>The video didn\u2019t load</b><span><a href="#" data-r2-retry>Try again</a></span>';
      if (why === 'not_configured') {                 // not out yet: the same line as a part with no video
        var frame = box.closest('.cu-video');
        if (frame) { frame.outerHTML = NO_VIDEO; var nb = $('[data-notes]', root); if (nb && nb.getAttribute('aria-expanded') === 'false') nb.click(); }
        return;
      }
      box.innerHTML = '<div class="cu-soon"><div class="play">' + PLAY_SVG + '</div>' + msg + '</div>';
    };
    r2Link(key).then(function (d) {
      if (!box.isConnected) return;
      var v = document.createElement('video');
      v.controls = true; v.playsInline = true; v.preload = 'auto';   // starts filling its buffer at once
      v.setAttribute('controlsList', 'nodownload');
      v.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      var renewed = false;
      v.addEventListener('error', function () {
        // Most likely the link ran out mid-video: one fresh link, same second.
        if (renewed) return fail(new Error('play'));
        renewed = true;
        var at = v.currentTime || 0, playing = !v.paused;
        r2Link(key, true).then(function (n) {
          v.src = n.url + (at > 1 ? '#t=' + at.toFixed(1) : '');   // a media fragment: starts at that second
          if (playing) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        }, fail);
      });
      // A part's stretch of a lesson video: a media fragment starts it there and pauses it at the end.
      var from = box.getAttribute('data-from'), to = box.getAttribute('data-to');
      v.src = d.url + ((from || to) ? '#t=' + (from || '0') + (to ? ',' + to : '') : '');
      // Also held in code: starts at the part's first second, pauses at its last.
      var fromS = Number(from) || 0, toS = Number(to) || 0;
      if (fromS) v.addEventListener('loadedmetadata', function () { if (v.currentTime < fromS - 1) { try { v.currentTime = fromS; } catch (e) {} } }, { once: true });
      if (toS) v.addEventListener('timeupdate', function () { if (!v.paused && v.currentTime >= toS && v.currentTime < toS + 2) v.pause(); });
      box.innerHTML = '';
      box.appendChild(v);
      watchTrack(v, key, box);
    }, fail);
  }
  /* SECONDS ACTUALLY WATCHED. Each second of the video counts once, and only
     when playback ran into it: a step of up to 2 seconds between two ticks
     while playing. A drag along the bar is a jump, so it marks nothing, and
     so does replaying a minute already seen. The marks stay on the device
     (one character a second); the count and the length go to the backend
     with the rest of the progress, which decides when 90% is reached. */
  function watchTrack(v, key, box) {
    var store = 'moretti_cu_watch_' + progKey + '_' + key;
    var marks = [], n = 0, last = null, savedAt = 0, syncedAt = 0;
    try { marks = (localStorage.getItem(store) || '').split('').map(function (c) { return c === '1' ? 1 : 0; }); } catch (e) { marks = []; }
    marks.forEach(function (m) { n += m; });
    var gating = !!(gate && gate.on && !gate.bypass && key === gate.video);
    var note = null;
    if (gating) {
      var frame = box.closest('.cu-video');
      note = document.createElement('p');
      note.className = 'cu-watch';
      if (frame && frame.parentNode) frame.parentNode.insertBefore(note, frame.nextSibling);
    }
    var share = (gate && gate.share) || 0.9;
    function length() { return isFinite(v.duration) && v.duration > 0 ? Math.floor(v.duration) : 0; }
    function paint() {
      if (!note) return;
      var d = length(), rec = videoRec(key);
      if (rec && rec.done) { note.className = 'cu-watch ok'; note.innerHTML = '<b>Watched.</b> The rest of Math is unlocked.'; return; }
      note.innerHTML = '<b>' + (d ? Math.min(99, Math.round(100 * n / d)) : 0) + '% watched.</b> The rest of Math unlocks at ' + Math.round(share * 100) + '%.';
    }
    function record(now) {
      var d = length();
      if (!d) return;
      var had = videoRec(key) || {};
      var rec = { w: Math.max(Math.min(n, d), had.w || 0), d: d };
      if (had.done) rec.done = had.done;
      else if (rec.w >= share * d) { rec.done = new Date().toISOString(); now = true; }
      prog.videos = prog.videos || {};
      prog.videos[key] = rec;
      try {
        localStorage.setItem(store, marks.map(function (m) { return m ? '1' : '0'; }).join(''));
        localStorage.setItem('moretti_curriculum_' + progKey, JSON.stringify(prog));
      } catch (e) {}
      if (now || n - syncedAt >= 20) { syncedAt = n; queueSync(); }
      paint();
    }
    v.addEventListener('timeupdate', function () {
      var t = v.currentTime;
      if (v.seeking || v.paused || last == null) { last = t; return; }
      var step = t - last;
      last = t;
      if (!(step > 0 && step <= 2)) return;       // a jump, or a rewind: nothing watched
      var sec = Math.floor(t);
      if (!marks[sec]) { for (var i = marks.length; i <= sec; i++) if (marks[i] == null) marks[i] = 0; marks[sec] = 1; n++; }
      if (n - savedAt >= 5) { savedAt = n; record(false); }
    });
    ['seeking', 'seeked', 'play'].forEach(function (ev) { v.addEventListener(ev, function () { last = null; }); });
    ['pause', 'ended'].forEach(function (ev) { v.addEventListener(ev, function () { last = null; savedAt = n; record(true); }); });
    v.addEventListener('loadedmetadata', paint);
    paint();
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
    loadGate();
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

  /* THE MATH GATE, AND READING & WRITING NOT OUT YET (Luca, 2026-09-30).
     The rest of Math opens once lesson 1.1's video has been watched: 90% of
     it, counted in seconds actually played (watchTrack), so dragging the bar
     to the end opens nothing. The backend says which video gates the course,
     whether the gate is on (only while that video can be played at all) and
     whether this is one of Luca's own accounts, which pass everything. Until
     it has answered on this device, nothing is locked. Reading & Writing is
     closed to everyone but Luca until its videos exist. */
  var GATE_LESSON = 'm1.1';
  var gate = null;
  function loadGate() {
    gate = null;
    try { gate = JSON.parse(localStorage.getItem('moretti_cu_gate_' + progKey) || 'null'); } catch (e) {}
  }
  function bypass() { return !!(gate && gate.bypass); }
  function videoRec(key) { return (prog.videos && prog.videos[key]) || null; }
  function gateWatched() { var r = gate && videoRec(gate.video); return !!(r && r.done); }
  function gateShare() { var r = gate && videoRec(gate.video); return r && r.d ? Math.min(1, r.w / r.d) : 0; }
  function mathLocked() { return !!(gate && gate.on && !gate.bypass && !gateWatched()); }
  function courseSoon(c) { return c.id === 'english' && !bypass(); }
  function lessonLocked(c, l) { return courseSoon(c) || (c.id === 'math' && l.id !== GATE_LESSON && mathLocked()); }

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
      var changed = false, partsChanged = false;
      if (d.gate && JSON.stringify(d.gate) !== JSON.stringify(gate)) {
        gate = d.gate; changed = true;
        try { localStorage.setItem('moretti_cu_gate_' + progKey, JSON.stringify(gate)); } catch (e) {}
      }
      Object.keys(d.progress.videos || {}).forEach(function (k) {
        var theirs = d.progress.videos[k], mine = videoRec(k) || {};
        if (!theirs || ((theirs.w || 0) <= (mine.w || 0) && (!theirs.done || mine.done))) return;
        prog.videos = prog.videos || {};
        prog.videos[k] = { w: Math.max(theirs.w || 0, mine.w || 0), d: theirs.d || mine.d, done: mine.done || theirs.done };
        if (!prog.videos[k].done) delete prog.videos[k].done;
        changed = true;
      });
      Object.keys(d.progress.parts).forEach(function (k) {
        if (!prog.parts[k] && d.progress.parts[k] && d.progress.parts[k].done) { prog.parts[k] = d.progress.parts[k]; changed = true; partsChanged = true; }
      });
      if (!prog.last && d.progress.last) { prog.last = d.progress.last; changed = true; }
      if (!changed) return;
      try { localStorage.setItem('moretti_curriculum_' + progKey, JSON.stringify(prog)); } catch (e) {}
      // An open lesson is redrawn only when it must be: a redraw restarts its video.
      var open = view.name === 'lesson' && findLesson(view.lessonId);
      if (open && lessonLocked(open.c, open.l)) { view.name = 'home'; renderHome(); }
      else if (!open || partsChanged) rerender();
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
  /* WHERE THEY ARE, FOR THE ADMIN PAGE (Luca, 2026-10-02). The presence
     heartbeat (auth-client.js) asks for this on the curriculum screen and
     reports "Curriculum - <this>": the green dot shows it live, and the
     visit log sums the minutes under it, so the week's time breaks down by
     lesson, part, video and check. Kept short and stable (no question
     number), because every distinct label is its own line in that log. */
  function whereNow() {
    var short = function (t, n) { t = String(t || '').replace(/&/g, 'and').replace(/[^\w .,'\/-]/g, ' ').replace(/\s+/g, ' ').trim(); if (t.length <= n) return t; t = t.slice(0, n + 1); t = t.slice(0, t.lastIndexOf(' ') > 0 ? t.lastIndexOf(' ') : n); return t.replace(/(\s+(and|or|of|the|a|to|in))+$/i, '').replace(/[ ,.-]+$/, ''); };
    if (view.name === 'lesson') {
      var hit = findLesson(view.lessonId);
      if (hit) return short(hit.l.num + ' ' + hit.l.title, 30) + ' - Part ' + (view.part + 1) + ' ' + (view.step === 'check' ? 'check' : 'video');
    }
    var c = courses().filter(function (x) { return x.id === view.course; })[0];
    return short((c ? c.title : 'Course') + ' lessons', 30);
  }
  window.curriculumWhere = function () { try { return root ? whereNow() : ''; } catch (e) { return ''; } };
  var whereSent = '';
  function whereChanged() {
    var w = window.curriculumWhere();
    if (w === whereSent) return;
    whereSent = w;
    try { if (window.MorettiAuth && MorettiAuth.refreshWhere) MorettiAuth.refreshWhere(); } catch (e) {}
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
    calcPop(false);
    whereChanged();
    var c = course(view.course);
    view.course = c.id;
    root.innerHTML = '<div class="cu-wrap">' +
      '<div class="cu-top"><div class="cu-toph">Curriculum</div>' +
      '<div class="cu-tabs" role="group" aria-label="Course">' + courses().map(function (x) {
        return '<button type="button" data-course="' + x.id + '" aria-pressed="' + (x.id === c.id) + '">' + esc(x.title) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="cu-body" id="cu-body">' + homeBody(c) + '</div></div>';
    warmLikely(c);
  }
  // The video most likely to be opened next from this page: its link is asked for now.
  function warmLikely(c) {
    if (courseSoon(c)) return;
    if (c.id === 'math' && mathLocked()) return r2Warm(GATE_LESSON, 0);
    var last = prog.last && findLesson(prog.last.lessonId);
    if (last && last.c.id === c.id) return r2Warm(last.l.id, prog.last.part || 0);
    var next = allLessons(c).filter(function (x) { return lessonDoneCount(x.l) < x.l.parts.length; })[0];
    if (next) r2Warm(next.l.id, firstOpenPart(next.l));
  }
  function homeBody(c) {
    var lessons = allLessons(c);
    var total = 0, done = 0;
    lessons.forEach(function (x) { total += x.l.parts.length; done += lessonDoneCount(x.l); });
    var pct = total ? Math.round(100 * done / total) : 0;
    var R = 34, CIRC = 2 * Math.PI * R;
    if (courseSoon(c)) {
      return heroHtml(c) +
        '<div class="cu-gate cu-in" style="--d:1"><span class="cu-gate-ic">' + LOCK_SVG + '</span><div><b>Coming soon</b>' +
        '<span>The Reading &amp; Writing lessons are being recorded. Math is open now, and the Question Bank has every Reading &amp; Writing skill in the meantime.</span></div>' +
        '<button type="button" class="cu-btn" data-course="math">Go to Math &rarr;</button></div>';
    }
    var locked = c.id === 'math' && mathLocked();
    var gateCard = '';
    if (locked) {
      var gl = findLesson(GATE_LESSON), share = Math.round(100 * gateShare());
      gateCard = '<div class="cu-gate cu-in" style="--d:1"><span class="cu-gate-ic">' + LOCK_SVG + '</span><div><b>Watch ' + esc(gl ? gl.l.num : '1.1') + ' to unlock the rest of Math</b>' +
        '<span>It covers the approach and strategy the rest of the course builds on.' + (share ? ' You have watched ' + share + '% so far.' : '') + '</span></div>' +
        '<button type="button" class="cu-btn" data-lesson="' + GATE_LESSON + '">' + (share ? 'Keep watching' : 'Watch ' + esc(gl ? gl.l.num : '1.1')) + ' &rarr;</button></div>';
    }
    var last = prog.last && findLesson(prog.last.lessonId);
    var resume = '';
    if (last && last.c.id === c.id && !lessonLocked(last.c, last.l) && !locked) {
      resume = '<div class="cu-resume cu-in" style="--d:1"><span class="cu-resume-ic">' + PLAY_SVG_SM + '</span><div><b>Pick up where you left off</b><span>' + esc(last.l.num + ' ' + last.l.title) + ', part ' + (prog.last.part + 1) + ' of ' + last.l.parts.length + '</span></div>' +
        '<button type="button" class="cu-btn" data-resume>Continue &rarr;</button></div>';
    }
    return heroHtml(c) +
      gateCard + resume + guideHtml(c) +
      '<div class="cu-units">' + c.domains.map(function (d, di) {
        var dDone = d.lessons.filter(function (l) { return lessonDoneCount(l) === l.parts.length; }).length;
        return '<section class="cu-unit cu-in" style="--d:' + (di + 2) + '"><div class="cu-unit-h">' +
          '<div class="cu-unit-t"><span class="cu-unum">Unit ' + (di + 1) + '</span><h2>' + esc(d.name) + '</h2></div>' +
          '<span class="cu-unit-p"><span class="cu-mbar"><i style="width:' + Math.round(100 * dDone / d.lessons.length) + '%"></i></span>' + dDone + '/' + d.lessons.length + '</span></div>' +
          d.lessons.map(function (l) {
            var n = lessonDoneCount(l);
            if (lessonLocked(c, l)) {
              return '<button type="button" class="cu-lesson cu-locked" data-locked title="Watch 1.1 to unlock the rest of Math"><span class="cu-ring cu-lockring" style="width:30px;height:30px">' + LOCK_SVG + '</span>' +
                '<span class="cu-lt"><span class="cu-num">' + esc(l.num) + '</span> ' + esc(l.title) + calcBadge(l) + '<small>' + pl(l.parts.length, 'part') + '</small></span>' +
                '</button>';
            }
            return '<button type="button" class="cu-lesson" data-lesson="' + esc(l.id) + '">' + ring(n, l.parts.length) +
              '<span class="cu-lt"><span class="cu-num">' + esc(l.num) + '</span> ' + esc(l.title) + calcBadge(l) + '<small>' + pl(l.parts.length, 'part') + (n && n < l.parts.length ? ' &middot; ' + n + ' done' : '') + '</small></span>' +
              '<span class="cu-go">' + (n === l.parts.length ? 'Review' : n ? 'Continue' : 'Start') + ' &rsaquo;</span></button>';
          }).join('') + '</section>';
      }).join('') + '</div>';
  }
  var LOCK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  // The course's header card: its name, and lessons, parts and done. The same on both courses, so switching does not change its size.
  function heroHtml(c) {
    var lessons = allLessons(c), total = 0, done = 0;
    lessons.forEach(function (x) { total += x.l.parts.length; done += lessonDoneCount(x.l); });
    var pct = total ? Math.round(100 * done / total) : 0;
    var R = 34, CIRC = 2 * Math.PI * R;
    return '<section class="cu-hero cu-hero-' + c.id + ' cu-in" style="--d:0">' +
        '<div class="cu-hero-text"><h1>' + esc(c.id === 'math' ? 'SAT Math' : 'SAT Reading & Writing') + '</h1>' +
        '<div class="cu-stats"><div class="cu-bigring"><svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="' + R + '" fill="none" stroke="rgba(17,17,17,.08)" stroke-width="7"/>' +
          (done ? '<circle class="cu-ringfill" cx="42" cy="42" r="' + R + '" fill="none" stroke="var(--red,#B0271C)" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + Math.max(1, CIRC * pct / 100).toFixed(1) + ' ' + CIRC.toFixed(1) + '" transform="rotate(-90 42 42)"/>' : '') + '</svg><b>' + pct + '%</b></div>' +
          '<div class="cu-stat"><b>' + lessons.length + '</b><span>lessons</span></div><div class="cu-stat"><b>' + total + '</b><span>parts</span></div><div class="cu-stat"><b>' + done + '</b><span>done</span></div></div></div>' +
        '</section>';
  }
  function calcBadge(l) { return l.calc ? '<span class="cu-calcb">Calculator</span>' : ''; }
  /* SUGGESTED ORDER (course guide in the course files, Luca 2026-09-29):
     advice beside the course, folded by default. The units below stay in
     course order and nothing is gated on it. Lessons inside each step are
     in course order on purpose (prerequisites). */
  function guideHtml(c) {
    var g = c.guide;
    if (!g || !g.steps || !g.steps.length) return '';
    var open = false;
    try { open = localStorage.getItem('moretti_cu_guide_open') === '1'; } catch (e) {}
    return '<details class="cu-guide cu-in" style="--d:1"' + (open ? ' open' : '') + '><summary><span><b>' + esc(g.title || 'Suggested order') + '</b>' +
        (g.audience ? '<small>' + esc(g.audience) + '</small>' : '') + '</span><span class="cu-guide-tog" aria-hidden="true"></span></summary>' +
      '<div class="cu-guide-body">' + (g.lead ? '<p class="cu-guide-lead">' + esc(g.lead) + '</p>' : '') +
      '<ol>' + g.steps.map(function (st) {
        var chips = (st.lessons || []).map(function (id) {
          var hit = findLesson(id);
          if (!hit) return '';
          var fin = lessonDoneCount(hit.l) === hit.l.parts.length;
          if (lessonLocked(hit.c, hit.l)) return '<button type="button" class="cu-gchip locked" data-locked title="' + esc(hit.l.num + ' ' + hit.l.title) + ' (watch 1.1 to unlock)">' + esc(hit.l.num) + '</button>';
          return '<button type="button" class="cu-gchip' + (fin ? ' done' : '') + '" data-lesson="' + esc(id) + '" title="' + esc(hit.l.num + ' ' + hit.l.title) + '">' + esc(hit.l.num) + '</button>';
        }).join('');
        return '<li><div class="cu-gchips">' + chips + '</div><p>' + esc(st.text || '') + '</p></li>';
      }).join('') + '</ol></div></details>';
  }
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
    // A locked lesson leads to the one that opens it; a course not out yet, back to its page.
    if (courseSoon(hit.c)) { view.name = 'home'; view.course = hit.c.id; return renderHome(); }
    if (lessonLocked(hit.c, hit.l)) { if (id === GATE_LESSON) return; return openLesson(GATE_LESSON); }
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
    if (!hit || lessonLocked(hit.c, hit.l)) { view.name = 'home'; return renderHome(); }
    whereChanged();
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
    if (view.step === 'check' && checkIds(l.parts[view.part]).length) renderCheck(c, l); else renderVideo(c, l);
  }

  // The lesson's steps for the panel: each part's video, then its check. Locked until the part before is done.
  function stepsHtml(l) {
    var out = '';
    l.parts.forEach(function (p, i) {
      var open = unlocked(l, i), done = isDone(l.id, i);
      var lock = open ? '' : ' aria-disabled="true"';
      out += '<button type="button" class="cu-step' + (view.part === i && view.step === 'video' ? ' on' : '') + (open ? '' : ' locked') + (done ? ' done' : '') + '" data-step="video" data-part="' + i + '"' + lock + '>' +
        '<span class="ic">' + (done ? '&#10003;' : PLAY_SVG_XS) + '</span><span>' + esc(partTitle(l, i)) + '</span><span class="st">' + (open ? '' : LOCK_SVG) + '</span></button>';
      if (checkIds(p).length) {
        out += '<button type="button" class="cu-step sub' + (view.part === i && view.step === 'check' ? ' on' : '') + (open ? '' : ' locked') + (done ? ' done' : '') + '" data-step="check" data-part="' + i + '"' + lock + '>' +
          '<span class="ic">' + (done ? '&#10003;' : '') + '</span><span>Check <small>' + pl(checkCount(p, l), 'question') + '</small></span><span class="st"></span></button>';
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
    // The part's own title from the course files; before those carried one, its last note's heading.
    var t = partPages(l, i);
    var name = String(l.parts[i].title || (t.length ? t[t.length - 1] : '')).replace(/\*\*/g, '');   // the deck's bold marks are not text
    return l.parts.length > 1 ? 'Part ' + (i + 1) + (name ? ': ' + name : '') : l.title;   // one part: the lesson itself
  }


  function notesHtml(p) {
    return (p.notes || []).map(function (n) {
      if (n.rows) {   // a math deck page
        return (n.title ? '<h3>' + esc(n.title) + '</h3>' : '') +
          (n.lead ? '<p>' + n.lead + '</p>' : '') + (n.formula ? '<div class="cu-formula">' + n.formula + '</div>' : '') +
          (n.listhead ? '<p><b>' + n.listhead + '</b></p>' : '') +
          (n.rows.length ? '<ul>' + n.rows.map(function (r) { return '<li' + (r.sub ? ' class="sub' + (r.deep ? ' deep' : '') + '"' : '') + '>' + r.html + '</li>'; }).join('') + '</ul>' : '');
      }
      return (n.title ? '<h3>' + esc(n.title) + '</h3>' : '') + (n.html || '');
    }).join('');
  }

  // No video yet: a line saying so, not an empty player.
  var NO_VIDEO = '<div class="cu-nov"><span class="play">' + PLAY_SVG + '</span><div><b>Video coming soon</b><span>The notes below cover the same material for now.</span></div></div>';
  function renderVideo(c, l) {
    calcPop(false);
    marginNotes(null);
    var p = l.parts[view.part], i = view.part;
    var vid = videoFor(l.id, i), inPart = null;
    if (vid && vid.indexOf('PART:') === 0) { inPart = Number(vid.slice(5)); vid = null; }
    var hasCheck = checkIds(p).length > 0, done = isDone(l.id, i);
    var nextOpen = i + 1 < l.parts.length;
    var bar;
    if (hasCheck) bar = '<span class="lbl">Up next: ' + pl(checkCount(p, l), 'question') + ' on this part</span><button type="button" class="cu-btn" data-go-check>Start the check &rarr;</button>';
    else bar = '<span class="lbl">' + (done ? 'Watched' : 'No questions for this part') + '</span><button type="button" class="cu-btn" data-watched>' + (nextOpen ? 'Next part &rarr;' : 'Finish the lesson &rarr;') + '</button>';
    $('#cu-main', root).innerHTML =
      // One part: the heading is the lesson itself, so the line above it names the unit instead of repeating it.
      '<div class="cu-mhead"><div class="cu-kicker">' + esc(l.parts.length > 1 ? l.num + ' ' + l.title : c.title + ' \u00b7 ' + ((findLesson(l.id) || {}).d || {}).name) + '</div><h1>' + esc(l.parts.length > 1 ? partTitle(l, i) : l.num + ' ' + l.title) + '</h1></div>' +
      (vid ? '<div class="cu-video">' + vid + '</div>'
        : inPart !== null && inPart !== i ? '<div class="cu-nov"><span class="play">' + PLAY_SVG + '</span><div><b>This part is in the lesson video</b><span>It is all one video, in Part ' + (inPart + 1) + '. The notes below cover this part.</span></div>' +
            '<button type="button" class="cu-btn ghost" data-open-part="' + inPart + '" style="margin-left:auto">Watch it &rarr;</button></div>'
        : NO_VIDEO) +
      '<section class="cu-notes"><button type="button" class="cu-notes-h" data-notes aria-expanded="' + (!vid) + '">Notes <span>' + (vid ? 'Show' : 'Hide') + '</span></button>' +
      '<div class="cu-notes-fold' + (vid ? ' closed' : '') + '"><div class="cu-notes-in"><div class="cu-notes-b">' + (notesHtml(p) || '<p>No notes for this part.</p>') + '</div></div></div></section>' +
      '<div class="cu-bottom">' + bar + '</div>';
    r2Mount();
  }

  /* ---------- the check: 8 questions (Luca, 2026-10-02) ----------
     Each part ends with CHECK_LEN questions (fewer when the part has fewer,
     never one twice), each answered with the right answer and why. The part
     is done once they are all answered; the score is shown, not required
     (it was 8 right in a row until 2026-10-02, which the short Algebra lists
     made impossible to pass). The questions come from the part's own check
     list (checkQids) when it has one, else the list the deck practises
     (qids), so the two can be sized apart. Least recently seen first, kept
     per part on the device, so a second go brings different questions. */
  var CHECK_LEN = 8;
  /* Parts whose check asks every question in its pool, not CHECK_LEN of them
     (Luca, 2026-10-02). Keyed by lesson id and part title. */
  var ASK_ALL = { 'm2.1|Slope-Intercept Form': true };
  function checkLen(l, p, n) { return ASK_ALL[l.id + '|' + p.title] ? n : Math.min(CHECK_LEN, n); }
  /* The check draws from the part's own pool, never from the questions
     worked in the slides. A part with no pool yet falls back to its own. */
  function checkIds(p) { return (p.checkQids && p.checkQids.length) ? p.checkQids : (p.qids || []); }
  function checkCount(p, l) { return l ? checkLen(l, p, checkIds(p).length) : Math.min(CHECK_LEN, checkIds(p).length); }
  function startCheck(c, l) {
    var p = l.parts[view.part];
    var pool = checkIds(p).filter(function (q) { return !!question(q); });
    check = { lessonId: l.id, part: view.part, pool: pool, len: checkLen(l, p, pool.length), results: [], asked: {}, n: 0, current: null, answered: false, pick: null };
    nextQuestion(l);
  }
  function seenMap(l) {
    prog.seen = prog.seen || {};
    var k = pkey(l.id, check.part);
    return (prog.seen[k] = prog.seen[k] || {});
  }
  function nextQuestion(l) {
    var seen = seenMap(l), last = check.current;
    var fresh = check.pool.filter(function (id) { return !check.asked[id]; });   // never one twice in a check
    if (!fresh.length) return;
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
      /* Back from the video (Rewatch, the Parts tab) with the last question
         already answered: that one is counted, so carry on to the next rather
         than redraw it looking unanswered (2026-10-02). */
      if (check.answered) {
        check.answered = false; check.pick = null;
        if (check.results.length >= check.len) return drawComplete(c, l);
        nextQuestion(l);
      }
      drawQuestion(c, l);
    });
  }
  /* NOTES IN THE MARGIN (Luca, 2026-10-02): during a check, the side panel
     shows the part's notes beside the question, with a tab back to the list
     of parts. On the video the notes are under it, so the panel is the list. */
  function marginNotes(l, i) {
    var panel = $('.cu-panel', root);
    if (!panel) return;
    var tabs = $('.cu-ptabs', panel), box = $('.cu-pnotes', panel);
    if (!l) { if (tabs) tabs.remove(); if (box) box.remove(); panel.classList.remove('show-notes'); return; }
    if (!tabs) {
      tabs = document.createElement('div');
      tabs.className = 'cu-ptabs';
      tabs.innerHTML = '<button type="button" data-ptab="notes" aria-pressed="true">Notes</button><button type="button" data-ptab="steps" aria-pressed="false">Parts</button>';
      $('.cu-panel-h', panel).after(tabs);
      tabs.addEventListener('click', function (e) {
        var b = e.target.closest('[data-ptab]'); if (!b) return;
        var notes = b.getAttribute('data-ptab') === 'notes';
        panel.classList.toggle('show-notes', notes);
        $$('[data-ptab]', tabs).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    }
    if (!box || box.getAttribute('data-for') !== l.id + '#' + i) {
      if (box) box.remove();
      box = document.createElement('div');
      box.className = 'cu-pnotes cu-notes-b';
      box.setAttribute('data-for', l.id + '#' + i);
      box.innerHTML = notesHtml(l.parts[i]) || '<p>No notes for this part.</p>';
      $('.cu-steps', panel).after(box);
      panel.classList.add('show-notes');
      $$('[data-ptab]', tabs).forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-ptab') === 'notes')); });
    }
  }
  // One mark per question: green right, red missed, grey still to come.
  function streakHtml() {
    var segs = '', right = 0;
    for (var i = 0; i < check.len; i++) {
      var r = check.results[i];
      if (r) right++;
      segs += '<i class="' + (r === true ? 'on' : r === false ? 'miss' : '') + '"></i>';
    }
    return '<div class="cu-streak" role="img" aria-label="' + check.results.length + ' of ' + check.len + ' answered, ' + right + ' right">' + segs + '</div>' +
      '<span class="lbl">Question <b>' + Math.min(check.n, check.len) + '</b> of ' + check.len + '</span>';
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
      body = '<div class="cu-fr"><input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Your answer" id="cu-fr" placeholder="Your answer"></div>';
    } else {
      body = '<div class="cu-choices">' + (q.choices || []).map(function (ch, k) {
        return '<div class="cu-crow"><button type="button" class="cu-choice" data-choice="' + k + '"><span class="lt">' + LETTERS[k] + '</span><span>' + ch + '</span></button>' +
          '<button type="button" class="cu-x" data-elim="' + k + '" aria-label="Rule out ' + LETTERS[k] + '" title="Rule out ' + LETTERS[k] + '">' + LETTERS[k] + '</button></div>';
      }).join('') + '</div>';
    }
    var isMath = c.bank === 'math', isMc = q.type !== 'fr';
    check.out = {};
    check.shownAt = Date.now();
    main.innerHTML =
      '<div class="cu-mhead"><div class="cu-kicker">' + esc(l.num + ' ' + l.title) + '</div><h1>Check your understanding</h1>' +
        '<div class="cu-sub">' + pl(check.len, 'question') + ' on this part. Each one shows the answer and why, and the next part opens when you finish.</div></div>' +
      '<div class="cu-card"><div class="cu-qhead"><span>Question ' + check.n + '</span><span class="cu-qtools">' +
        (isMc ? '<button type="button" class="cu-abc" data-abc aria-pressed="' + elimOn + '" title="Answer eliminator">ABC</button>' : '') +
        (isMath ? '<button type="button" class="cu-mini" data-calc>Calculator</button>' : '') + '</span></div>' +
        '<div class="cu-qtext">' + q.text + '</div>' + body + '<div id="cu-fb"></div></div>' +
      '<div class="cu-bottom"><div class="cu-streak-wrap">' + streakHtml() + '</div>' +
        '<button type="button" class="cu-btn" id="cu-go" data-check-go disabled>Check</button></div>';
    marginNotes(l, check.part);
    if (isMc && elimOn) $('.cu-choices', main).classList.add('elim');
    var fr = $('#cu-fr', main);
    if (fr) {
      if (window.gridInGuard) window.gridInGuard(fr);
      fr.addEventListener('input', function () { $('#cu-go', main).disabled = !/\d/.test(fr.value); });
      fr.addEventListener('keydown', function (e) { if (e.key === 'Enter' && /\d/.test(fr.value)) submitAnswer(c, l); });
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
      if (check.results.length >= check.len) return drawComplete(c, l);
      nextQuestion(l);
      return drawQuestion(c, l);
    }
    var g = grade(q);
    check.answered = true;
    check.results.push(!!g.ok);
    logAnswer(c, l, q, g);
    var last = check.results.length >= check.len;
    if (g.ok) {
      markChoices(q, true);
      fb.innerHTML = '<div class="cu-fb ok"><b>Correct!</b></div>';
    } else {
      markChoices(q, false);
      var answer = q.type === 'fr' ? '<p>The answer is <b>' + esc(q.answerValue != null ? q.answerValue : q.answer) + '</b>.</p>' : '';
      fb.innerHTML = '<div class="cu-fb no"><b>Not quite.</b> Stuck? <a href="#" data-rewatch>Rewatch the video</a> or check the notes.' +
        '<div class="ex">' + answer + (q.explanation || '') + '</div></div>';
    }
    go.textContent = last ? 'Finish' : 'Next question'; go.disabled = false;
    var w = $('.cu-streak-wrap', main); if (w) w.innerHTML = streakHtml();
  }
  /* EVERY CHECK ANSWER GOES TO THE PRACTICE LOG (Luca, 2026-10-02), bank
     'cu', through the portal's outbox (index.html queuePracticeEvent), so
     the admin page's session prep can show what was answered this week,
     part by part. Skill is the part ("2.1 Linear Equations - Standard
     Form") and ItemKey its id ("m2.1|1"), which is what groups them. */
  function logAnswer(c, l, q, g) {
    if (!window.queuePracticeEvent || !q || !q.qid) return;
    var given = q.type === 'fr' ? String(g.given || '').slice(0, 40) : (typeof g.given === 'number' ? g.given : null);
    try {
      window.queuePracticeEvent({ b: 'cu', s: c.bank === 'math' ? 'math' : 'rw', q: String(q.qid),
        sk: (l.num + ' ' + l.title + (l.parts.length > 1 ? ' - ' + partTitle(l, check.part) : '')).slice(0, 90), d: String(q.difficulty || '').toLowerCase(),
        c: g.ok ? 1 : 0, ms: check.shownAt ? Math.max(0, Date.now() - check.shownAt) : 0, g: given, k: l.id + '|' + check.part });
    } catch (e) {}
    /* And into Saved & Mistakes, as the Question Bank question it is (these
       are bank questions): a miss lands in the Mistakes Log, a right answer
       clears an old miss of the same question (2026-10-02). */
    try {
      if (window.recordQuestionBankMistake) window.recordQuestionBankMistake({
        key: 'qb|' + (c.bank === 'math' ? 'math' : 'rw') + '|' + q.qid, given: given, correct: !!g.ok, attemptedAt: new Date().toISOString() });
    } catch (e) {}
  }
  function markChoices(q, ok) {
    if (q.type === 'fr') { var fr = $('#cu-fr', root); if (fr) fr.disabled = true; return; }
    var ch = $('.cu-choices', root); if (ch) ch.classList.remove('elim');
    $$('.cu-choice', root).forEach(function (b) {
      var k = Number(b.getAttribute('data-choice'));
      b.disabled = true;
      b.classList.remove('sel');
      b.parentNode.classList.remove('out');
      if (k === q.correct) b.classList.add('right');
      else if (k === check.pick && !ok) b.classList.add('wrong');
    });
  }
  function drawComplete(c, l) {
    calcPop(false);
    var i = check.part;
    var right = check.results.filter(Boolean).length, missed = check.results.length - right;
    var score = right + ' of ' + check.results.length;
    markDone(l.id, i);
    var nextPart = i + 1 < l.parts.length;
    var list = allLessons(c), at = -1;
    list.forEach(function (x, j) { if (x.l.id === l.id) at = j; });
    var nextLesson = list[at + 1];
    $('#cu-main', root).innerHTML =
      '<div class="cu-card cu-complete"><div class="tick">&#10003;</div><h2 style="margin:0 0 .4rem">' + (nextPart ? 'Part ' + (i + 1) + ' complete' : 'Lesson complete') + '</h2>' +
      '<p class="cu-sub">' + score + ' right. ' + (nextPart ? 'The next part is unlocked.' : 'You finished ' + esc(l.num + ' ' + l.title) + '.') +
        (missed ? ' The notes and the video are there for the ones you missed.' : '') + '</p>' +
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
    if ((b = t.closest('[data-locked]'))) {
      var gc = $('.cu-gate', root);
      if (gc) { try { gc.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (x) {} gc.classList.remove('nudge'); void gc.offsetWidth; gc.classList.add('nudge'); }
      return;
    }
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
    if ((b = t.closest('[data-r2-retry]'))) { e.preventDefault(); var box = b.closest('.cu-r2'); if (box) { delete r2Links[box.getAttribute('data-r2')]; r2Store(); box.innerHTML = '<div class="cu-soon"><div class="play">' + PLAY_SVG + '</div><b>Loading the video&hellip;</b></div>'; r2Mount(); } return; }
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
    if (t.closest('[data-calc]')) { calcPop(true); return; }
    if (check && t.closest('[data-abc]')) {
      elimOn = !elimOn;
      t.closest('[data-abc]').setAttribute('aria-pressed', String(elimOn));
      var cs = $('.cu-choices', root); if (cs && !check.answered) cs.classList.toggle('elim', elimOn);
      return;
    }
    if (check && (b = t.closest('[data-elim]')) && !check.answered) {
      var k = Number(b.getAttribute('data-elim')), row = b.parentNode;
      check.out[k] = !check.out[k];
      row.classList.toggle('out', check.out[k]);
      b.setAttribute('aria-label', (check.out[k] ? 'Bring back ' : 'Rule out ') + LETTERS[k]);
      b.textContent = check.out[k] ? 'Undo' : LETTERS[k];
      if (check.out[k] && check.pick === k) {
        check.pick = null; row.querySelector('.cu-choice').classList.remove('sel'); $('#cu-go', root).disabled = true;
      }
      return;
    }
    if (check && (b = t.closest('.cu-choice')) && !b.disabled) {
      var kk = Number(b.getAttribute('data-choice'));
      if (check.out[kk]) { check.out[kk] = false; var r = b.parentNode, xb = r.querySelector('.cu-x'); r.classList.remove('out'); xb.textContent = LETTERS[kk]; xb.setAttribute('aria-label', 'Rule out ' + LETTERS[kk]); }
      check.pick = Number(b.getAttribute('data-choice'));
      $$('.cu-choice', root).forEach(function (x) { x.classList.toggle('sel', x === b); });
      $('#cu-go', root).disabled = false;
      return;
    }
    if (check && t.closest('[data-check-go]')) return submitAnswer(hit.c, hit.l);
  }

  /* THE CALCULATOR, A POP-OUT (Luca, 2026-10-02): a window over the page,
     not a panel under the question. Dragged by its bar, resized from its
     corner, closed with x. One for the whole check, so the graphs stay put
     from question to question; it closes when the check is left. */
  var calcEl = null;
  /* The answer eliminator stays on or off across questions, like Bluebook's. */
  var elimOn = false;
  window.curriculumCalcClose = function () { if (calcEl) calcEl.hidden = true; };
  function calcPop(toggle) {
    if (!calcEl) {
      if (!toggle) return;
      calcEl = document.createElement('div');
      calcEl.id = 'cu-calc-pop';
      calcEl.setAttribute('role', 'dialog');
      calcEl.setAttribute('aria-label', 'Calculator');
      calcEl.innerHTML = '<div class="cu-pop-bar"><b>Calculator</b><button type="button" class="cu-pop-x" aria-label="Close the calculator">&times;</button></div><div class="cu-pop-body"></div>';
      document.body.appendChild(calcEl);
      calcEl.querySelector('.cu-pop-x').addEventListener('click', function () { calcEl.hidden = true; });
      var bar = calcEl.querySelector('.cu-pop-bar'), drag = null;
      bar.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.cu-pop-x')) return;
        var r = calcEl.getBoundingClientRect();
        drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
        bar.setPointerCapture(e.pointerId);
      });
      bar.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var x = Math.max(0, Math.min(window.innerWidth - 120, e.clientX - drag.dx));
        var y = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - drag.dy));
        calcEl.style.left = x + 'px'; calcEl.style.top = y + 'px'; calcEl.style.right = 'auto'; calcEl.style.bottom = 'auto';
      });
      bar.addEventListener('pointerup', function () { drag = null; });
      if (window.ensureDesmosCalculator) window.ensureDesmosCalculator(calcEl.querySelector('.cu-pop-body'));
      return;
    }
    calcEl.hidden = toggle ? !calcEl.hidden : true;
  }

  /* ---------- the home screen's Curriculum tile ----------
     Where the student is, in a line: the course they last worked in (Math
     while Reading & Writing is not out), what comes next there, and how
     many parts are done. Called with what this device knows, then again
     when the backend's copy has been merged in. */
  function homeSummary() {
    var last = prog.last && findLesson(prog.last.lessonId);
    var c = last && !courseSoon(last.c) ? last.c : course('math');
    if (courseSoon(c)) c = course('math');
    var lessons = allLessons(c), total = 0, done = 0;
    lessons.forEach(function (x) { total += x.l.parts.length; done += lessonDoneCount(x.l); });
    var name = c.id === 'math' ? 'Math' : 'Reading & Writing';
    var body;
    if (c.id === 'math' && mathLocked()) {
      var g = findLesson(GATE_LESSON);
      body = name + ': start with ' + (g ? g.l.num + ' ' + g.l.title : '1.1') + '. Watching it opens the rest.';
    } else {
      var next = last && last.c.id === c.id && lessonDoneCount(last.l) < last.l.parts.length ? last.l
        : (lessons.filter(function (x) { return lessonDoneCount(x.l) < x.l.parts.length; })[0] || {}).l;
      if (!next) body = name + ': every lesson done. Open any of them to review.';
      else {
        var at = firstOpenPart(next);
        body = name + (done ? ': up next, ' : ': start with ') + next.num + ' ' + next.title +
          (next.parts.length > 1 ? ', part ' + (at + 1) + ' of ' + next.parts.length : '') + '.';
      }
    }
    return { course: c.id, body: body, badge: done ? done + ' of ' + total + ' parts' : '' };
  }
  window.curriculumHomeSummary = function (cb) {
    ensureData().then(function () {
      if (!courses().length) return;
      loadProgress();
      cb(homeSummary());
      return pullProgress().then(function () { cb(homeSummary()); });
    }).catch(function () {});
  };

  /* ---------- entry ---------- */
  window.curriculumModuleInit = function () {
    root = document.getElementById('cu-root');
    if (!root) return;
    injectCss();
    if (!root.__wired) {
      root.addEventListener('click', onClick);
      // The pointer going down on a lesson is a second or so ahead of its video being asked for.
      var warmFrom = function (e) {
        var b = e.target.closest && e.target.closest('[data-lesson],[data-lesson-go],[data-resume]');
        if (!b) return;
        var id = b.getAttribute('data-lesson') || b.getAttribute('data-lesson-go') || (prog.last && prog.last.lessonId);
        var hit = id && findLesson(id);
        if (hit && !lessonLocked(hit.c, hit.l)) r2Warm(hit.l.id, b.hasAttribute('data-resume') ? (prog.last.part || 0) : firstOpenPart(hit.l));
      };
      root.addEventListener('pointerdown', warmFrom);
      root.addEventListener('mouseover', warmFrom);
      // toggle does not bubble: caught on the way down.
      root.addEventListener('toggle', function (e) {
        if (e.target.classList && e.target.classList.contains('cu-guide')) { try { localStorage.setItem('moretti_cu_guide_open', e.target.open ? '1' : '0'); } catch (x) {} }
      }, true);
      root.__wired = true;
    }
    if (!window.CURRICULUM) root.innerHTML = '<div class="cu-state">Loading the curriculum&hellip;</div>';
    ensureData().then(function () {
      if (!courses().length) { root.innerHTML = '<div class="cu-state">The curriculum could not be loaded. Check your connection and try again.</div>'; return; }
      loadProgress();
      rerender();
      pullProgress();
    });
  };
})();
