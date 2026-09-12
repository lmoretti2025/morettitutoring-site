/* =========================================================================
   BEHAVIOUR SIGNALS: THE STATISTICS
   -------------------------------------------------------------------------
   Turns what the test engine records beyond the final answer (a log of
   every visit, crossed-out choices, calculator and reference-sheet use;
   see sigPayloadFields in index.html) into per-question facts, a compact
   per-attempt summary, a pooled ledger across attempts, and gated verdicts.

   Design, definitions and the reasoning behind every threshold:
   SIGNALS_SPEC.md in the repo root. Nothing in the report or on screen
   reads this yet (Phase 0 is capture only); index.html uses it at submit
   time to store the summary on the attempt, so parent emails and the admin
   page can read it later.

   ONE FILE, THREE PLACES. Plain ES5 with no DOM, so the same file runs in
   the browser (window.MorettiSignals), in Node (require, for the tests and
   the analytics-sim harness) and in Apps Script (paste as signals.gs, where
   MorettiSignals is a global). Keep it that way: no fetch, no document, no
   ES modules. Change it here and copy it, never fork it.
   ========================================================================= */
var MorettiSignals = (function () {
  'use strict';

  var DEFAULTS = {
    glanceSec: 1.5,         // a visit shorter than this is passing through, not a revisit (refit from real data)
    desmosActiveSec: 3,     // focus inside Desmos for at least this long counts as using it (refit from real data)
    lateSec: 60,            // a change in a module's last minute
    /* Prior on the share of correctness-flipping changes that help.
       0.60 is the computer-based figure (USMLE Step 2 CK logs); the 0.73
       paper-and-erasure figure first used here overstates it for a
       screen test and sent "changes help" to 10% of students whose changes
       are neutral. Strength 2: strength 6 made "hurt" nearly unreachable
       (SIGNALS_SPEC.md 3.1).
       Gates chosen from the EXACT binomial error rates conditional on the
       number of changes on record (6, 8, 10, 12, 15, 20): at 0.99/0.975 a
       neutral student (p = 0.5) is told either verdict at most 2.1% of the
       time at every count, where 0.95/0.90 reached 11%. The cost is power:
       "hurt" fires for 12-42% of students whose changes truly go wrong 70%
       of the time (6-20 changes), which the tutor-only lean states cover.
       Refit mu and kappa from real students once 30+ have changes on
       record. */
    changePrior: { mu: 0.60, kappa: 2 },
    gateHelp: 0.99,         // posterior P(p > 0.5) needed to say changes help
    gateHurt: 0.975,        // posterior P(p < 0.5) needed to say changes hurt
    minFlips: 6,            // ...and at least this many correctness-flipping changes
    leanProb: 0.75,         // tutor-only "leaning" state...
    leanMinFlips: 3,        // ...never on one or two changes
    ledgerDays: 90
  };
  function opt(o, k) { return (o && o[k] !== undefined) ? o[k] : DEFAULTS[k]; }

  /* -- small helpers --------------------------------------------------- */
  function hexAt(str, i) {
    if (typeof str !== 'string' || i >= str.length) return 0;
    var v = parseInt(str.charAt(i), 16);
    return isNaN(v) ? 0 : v;
  }
  function popcount4(m) { return (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1); }
  function num(x) { return (typeof x === 'number' && isFinite(x)) ? x : 0; }
  // A logged visit-end answer as an answer value: MC -1 and grid-in '' are blank.
  function logAnswer(q, code) {
    if (!q) return null;
    if (q.type === 'fr') {
      if (typeof code !== 'string' || code === '') return null;
      return { raw: code, value: frValue(code) };
    }
    return (typeof code === 'number' && code >= 0 && code <= 3) ? code : null;
  }
  /* A stable key for a question, for per-item tags such as Desmos
     favourability. The diagnostic and most practice-test items carry no
     id, so this is the question's own qid when it has one, otherwise a
     32-bit FNV-1a hash of its exact text. Editing a question's text
     changes its key, which is right: a reworded question needs its tags
     looked at again. */
  function itemKey(q) {
    if (!q) return '';
    if (q.qid) return String(q.qid);
    var s = String(q.text || ''), h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return 'h' + ('0000000' + h.toString(16)).slice(-8);
  }
  // A grid-in's numeric value, reading "a/b" fractions; NaN if unreadable.
  function frValue(s) {
    var m = /^\s*(-?)(\d*\.?\d*)\s*\/\s*(\d*\.?\d*)\s*$/.exec(String(s));
    if (m) { var nu = parseFloat(m[2]), de = parseFloat(m[3]); return de ? (m[1] ? -1 : 1) * nu / de : NaN; }
    return parseFloat(s);
  }
  // Two answers are the same if they are the same choice, or grid-ins with
  // the same value: rewriting 0.75 as 3/4 is not changing an answer.
  function sameAnswer(a, b) {
    if (a === null || b === null) return a === b;
    if (typeof a === 'object' || typeof b === 'object') {
      if (!a || !b) return false;
      if (String(a.raw) === String(b.raw)) return true;
      var x = frValue(a.raw), y = frValue(b.raw);
      return isFinite(x) && isFinite(y) && Math.abs(x - y) < 1e-9;
    }
    return a === b;
  }
  // A crossed-out mask string is usable only if it has one hex digit per
  // question; anything else is treated as not recorded rather than as "no
  // crossing-out", which would silently read as k = 4.
  function maskOk(str, n) { return typeof str === 'string' && str.length === n && /^[0-9a-f]*$/.test(str); }

  /* -- one section's questions ----------------------------------------
     sec:       a payload section ({k, a, m, sv, el, eu, vl, rv, co, cf, rf, tl, ...})
     questions: the section's questions in the same order as sec.a
                (Module 1 followed by the Module 2 variant that was served)
     cfg:       grade(q, answer) -> bool          required
                module1Length                     questions in Module 1 (default: all)
                moduleSec: [s1, s2]               allotted seconds per module (default: tl split evenly)
     Returns { recorded:false } for a section captured before signals existed. */
  function decodeSection(sec, questions, cfg) {
    if (!sec || (sec.sv !== 1 && sec.sv !== 2) || !Array.isArray(sec.vl) || !questions || !cfg || typeof cfg.grade !== 'function') {
      return { recorded: false };
    }
    var n = questions.length;
    // A two-module section records one review time per module; without
    // Module 1's length its visits can't be told apart, and every Module 2
    // time would be compared with Module 1's review start. Refuse rather
    // than mis-attribute.
    if (Array.isArray(sec.rv) && sec.rv.length === 2 && !(cfg.module1Length > 0 && cfg.module1Length < n)) {
      return { recorded: false, reason: 'module1Length is required for a two-module section' };
    }
    var m1 = (cfg.module1Length > 0 && cfg.module1Length < n) ? cfg.module1Length : n;
    var nMods = m1 < n ? 2 : 1;
    var moduleSec = cfg.moduleSec || (sec.tl > 0 ? (nMods === 2 ? [sec.tl * 30, sec.tl * 30] : [sec.tl * 60]) : []);
    var glance = opt(cfg, 'glanceSec'), late = opt(cfg, 'lateSec'), active = opt(cfg, 'desmosActiveSec');
    var modOf = function (q) { return q < m1 ? 0 : 1; };
    var masksOk = maskOk(sec.el, n) && maskOk(sec.eu, n);

    var visits = [], seen = {};
    for (var i = 0; i < n; i++) visits.push([]);
    sec.vl.forEach(function (v, order) {
      if (!Array.isArray(v) || typeof v[0] !== 'number' || v[0] % 1 !== 0 || v[0] < 0 || v[0] >= n) return;
      var id = v[0] + ':' + v[1] + ':' + v[2];
      if (seen[id]) return; // an exact duplicate entry is one visit, not a revisit
      seen[id] = true;
      visits[v[0]].push({ t0: num(v[1]), dur: num(v[2]), end: v[3], sw: num(v[4]), order: order });
    });

    // Where each module's review phase starts: the first arrival on the
    // review page, else the end of the first real (not passing-through)
    // look at the module's last question, else never. Never before every
    // question in the module has been seen: the review page is reachable
    // from the navigator on any question, and a trip there from question 1
    // counted every later first-pass answer as a review change and faked a
    // review pass (audit 2026-09-12). Capture version 2 records the first
    // arrival AFTER everything was seen; for version 1 this check is what
    // throws out an early arrival.
    var reviewStart = [];
    for (var m = 0; m < nMods; m++) {
      var lo = m === 0 ? 0 : m1, hi = m === 0 ? m1 : n, allSeenAt = 0;
      for (var qq = lo; qq < hi; qq++) {
        var fv = visits[qq][0];
        allSeenAt = fv ? Math.max(allSeenAt, fv.t0 + fv.dur) : Infinity;
      }
      var rvm = Array.isArray(sec.rv) ? sec.rv[m] : null;
      if (typeof rvm === 'number' && rvm >= allSeenAt) { reviewStart.push(rvm); continue; }
      var lastQ = m === 0 ? m1 - 1 : n - 1;
      var fl = (visits[lastQ] || []).filter(function (v) { return v.dur >= glance; })[0];
      reviewStart.push(fl ? Math.max(fl.t0 + fl.dur, allSeenAt) : Infinity);
    }

    var rows = [];
    for (var q = 0; q < n; q++) {
      var Q = questions[q] || {};
      var mod = modOf(q);
      var vs = visits[q];
      var final = sec.a ? sec.a[q] : null;
      if (final === undefined) final = null;
      var finalOk = final !== null && cfg.grade(Q, final);
      var flagged = !!(sec.m && sec.m[q]);
      var endT = function (v) { return v.t0 + v.dur; };

      // Answer changes are differences between successive visit-end answers
      // (blank visits in between don't reset the comparison).
      var changes = [], prev = null, initial = null, answeredAt = null, switches = 0;
      // The answer standing when review began: the last visit-end answer of
      // any visit that started before it (blank if none).
      var standing = null, visitedBeforeReview = false;
      vs.forEach(function (v) {
        if (v.t0 < reviewStart[mod]) { visitedBeforeReview = true; standing = logAnswer(Q, v.end); }
      });
      vs.forEach(function (v) {
        switches += v.sw;
        var a = logAnswer(Q, v.end);
        if (a === null) return;
        if (initial === null) { initial = a; answeredAt = v; }
        if (prev !== null && !sameAnswer(prev, a)) {
          var fromOk = cfg.grade(Q, prev), toOk = cfg.grade(Q, a);
          changes.push({
            from: prev, to: a,
            kind: fromOk ? (toOk ? 'RR' : 'RW') : (toOk ? 'WR' : 'WW'),
            phase: v.t0 >= reviewStart[mod] ? 'review' : 'first',
            late: moduleSec[mod] > 0 ? (endT(v) >= moduleSec[mod] - late) : false,
            flagged: flagged
          });
        }
        prev = a;
      });

      var real = vs.filter(function (v) { return v.dur >= glance; });
      // Time on real return visits (every real look after the first).
      var revisitSec = real.slice(1).reduce(function (s2, v) { return s2 + v.dur; }, 0);
      // A skip is any first look that ended blank, however short: pressing
      // Next straight away is the most deliberate skip there is.
      var skipFirst = !!(vs[0] && logAnswer(Q, vs[0].end) === null);
      var isMc = Q.type !== 'fr';
      var keyBit = (isMc && typeof Q.correct === 'number') ? (1 << Q.correct) : 0;
      var elFinal = masksOk ? hexAt(sec.el, q) : 0, elEver = masksOk ? (hexAt(sec.eu, q) | elFinal) : 0;
      // The engine un-crosses a choice when it is picked, so a final mask
      // that crosses out the final answer is impossible: distrust it.
      var maskUsable = masksOk && isMc && !(typeof final === 'number' && (elFinal & (1 << final)));
      if (!maskUsable) { elFinal = 0; elEver = 0; }
      var cf = sec.cf && sec.cf[q];
      var rf = sec.rf && sec.rf[q];

      rows.push({
        q: q, module: mod, type: isMc ? 'mc' : 'fr', skill: Q.skill || Q.domain || null,
        difficulty: Q.difficulty || null,
        final: final, finalOk: finalOk, initial: initial,
        initialOk: initial !== null && cfg.grade(Q, initial),
        flagged: flagged,
        visits: vs.length, realVisits: real.length, revisits: Math.max(0, real.length - 1), revisitSec: revisitSec,
        timeSec: vs.reduce(function (s, v) { return s + v.dur; }, 0),
        changes: changes, switches: switches,
        skipFirst: skipFirst,
        skipThenAnswer: skipFirst && final !== null,
        answeredInReview: !!(answeredAt && answeredAt.t0 >= reviewStart[mod]),
        visitedBeforeReview: visitedBeforeReview,
        standingOk: standing !== null && cfg.grade(Q, standing),
        blankAtReview: visitedBeforeReview && standing === null,
        masks: maskUsable,
        elFinal: elFinal, elEver: elEver,
        k: maskUsable ? 4 - popcount4(elFinal) : null,
        keyOutFinal: !!(keyBit && (elFinal & keyBit)),
        keyOutEver: !!(keyBit && (elEver & keyBit)),
        calcOpenSec: num(sec.co && sec.co[q]),
        calcActiveSec: Array.isArray(cf) ? num(cf[0]) : 0,
        calcEntries: Array.isArray(cf) ? num(cf[1]) : 0,
        calcActive: Array.isArray(cf) && num(cf[0]) >= active,
        refOpens: Array.isArray(rf) ? num(rf[0]) : 0,
        refSec: Array.isArray(rf) ? num(rf[1]) : 0
      });
    }

    var modules = [];
    for (var mm = 0; mm < nMods; mm++) {
      var inMod = rows.filter(function (r) { return r.module === mm; });
      var rs = reviewStart[mm];
      var reviewSec = 0, reviewFlaggedSec = 0;
      sec.vl.forEach(function (v) {
        if (!Array.isArray(v) || modOf(v[0]) !== mm || num(v[1]) < rs) return;
        reviewSec += num(v[2]);
        if (sec.m && sec.m[v[0]]) reviewFlaggedSec += num(v[2]);
      });
      // Exactly what the review phase was worth: questions right at the end
      // minus questions right when it began (blank counts as wrong), i.e.
      // the score had the student submitted on reaching the review page.
      // Counting change events instead double-counts a question that was
      // answered and then corrected within the review.
      // Unknown (null), not zero, when the module never reached a review.
      var gain = null;
      if (isFinite(rs)) { gain = 0; inMod.forEach(function (r) { gain += (r.finalOk ? 1 : 0) - (r.standingOk ? 1 : 0); }); }
      var rpm = Array.isArray(sec.rp) ? sec.rp[mm] : null, sbm = Array.isArray(sec.sb) ? sec.sb[mm] : null;
      modules.push({
        module: mm, questions: inMod.length,
        reviewReached: Array.isArray(sec.rv) && typeof sec.rv[mm] === 'number',
        reviewStartSec: isFinite(rs) ? rs : null,
        reserveSec: (isFinite(rs) && moduleSec[mm] > 0) ? Math.max(0, moduleSec[mm] - rs) : null,
        reviewSec: reviewSec,
        reviewFlaggedShare: reviewSec > 0 ? reviewFlaggedSec / reviewSec : null,
        reviewGain: gain,
        // Capture v2: seconds on the review page itself, and when the module
        // was submitted (so the time left on the clock at submit).
        reviewPageSec: typeof rpm === 'number' ? rpm : null,
        submitSec: typeof sbm === 'number' ? sbm : null,
        submitReserveSec: (typeof sbm === 'number' && moduleSec[mm] > 0) ? Math.max(0, moduleSec[mm] - sbm) : null,
        // Skips as the review phase found them: seen, and still blank.
        skips: inMod.filter(function (r) { return r.blankAtReview; }).length,
        skipAnswered: inMod.filter(function (r) { return r.blankAtReview && r.final !== null; }).length,
        skipRight: inMod.filter(function (r) { return r.blankAtReview && r.finalOk; }).length
      });
    }
    return { recorded: true, sectionKey: sec.k, rows: rows, modules: modules };
  }

  /* -- the elimination-aware guessing correction -----------------------
     Knowledge-or-guess model: an unknown question is guessed uniformly
     among the k choices not crossed out. With the key among them, a guess
     is right with probability 1/k and wrong with (k-1)/k, so each wrong
     answer is evidence of 1/(k-1) expected lucky right answers. With no
     crossing-out k = 4 and this is exactly the report's wrong/3. A wrong
     answer with the key crossed out wasn't a guess among choices that
     included the right one, so it contributes nothing.
     Grid-ins and blanks are excluded, as in the report. */
  function guessingLift(rows) {
    var old = 0, elim = 0;
    rows.forEach(function (r) {
      if (r.type !== 'mc' || r.final === null || r.finalOk) return;
      old += 1 / 3;
      if (r.keyOutFinal) return;
      var k = (r.k >= 2 && r.k <= 4) ? r.k : 4;
      elim += 1 / (k - 1);
    });
    return { old: old, elim: elim };
  }

  /* -- reference-sheet items (SIGNALS_SPEC.md 3.4) ----------------------
     The digital SAT's reference sheet gives the sphere, cone, pyramid and
     cylinder formulas and the two special right triangles. A miss on one
     of those items with the sheet never opened is a retrieval gap, not a
     content gap. Deliberately narrow: Pythagoras, circle area and
     rectangle area are known cold, so a miss there says nothing about
     the sheet. Measured on the bank: 13 unique items (2026-09-12). */
  var RS_SOLIDS = /sphere|hemisphere|\bcone|pyramid|cylind/;
  var RS_SPECIAL = /\b(30|45|60)\s*(\u00b0|degrees?)|30-60-90|45-45-90/;
  function refSheetItem(q) {
    if (!q || q.domain !== 'Geometry and Trigonometry') return false;
    var t = String(q.text || '').replace(/&deg;/g, '\u00b0').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').toLowerCase();
    return RS_SOLIDS.test(t) || (/triangle/.test(t) && RS_SPECIAL.test(t));
  }

  /* -- one attempt -> the compact summary stored as SignalsJSON ---------
     parts: [{ sec, questions, module1Length, moduleSec }]
     cfg:   grade(q, answer)                         required
            scoreSection(sectionKey, correct[], module1Length) -> scaled score   optional; enables dPts
            dz(q) -> 0|1|2                            optional; Desmos-favourability tag (portal/desmos-tags.js)
            rs(q) -> boolean                          optional; reference-sheet item, default refSheetItem
   Per part, budgetSec(q) -> seconds | null (optional): the question's time
   target (time-budgets.js, scaled for extended time). Enables Desmos
   over-use and the "over budget without Desmos" half of the coaching gate.
     Returns null if no section carries signals. */
  function summarizeAttempt(parts, cfg) {
    var decoded = [];
    (parts || []).forEach(function (p) {
      var d = decodeSection(p.sec, p.questions, {
        grade: cfg.grade, module1Length: p.module1Length, moduleSec: p.moduleSec,
        glanceSec: opt(cfg, 'glanceSec'), lateSec: opt(cfg, 'lateSec'), desmosActiveSec: opt(cfg, 'desmosActiveSec')
      });
      if (d.recorded) decoded.push({ d: d, p: p });
    });
    if (!decoded.length) return null;

    var chg = { h: 0, r: 0, ww: 0, rr: 0, sw: 0, unfl: { h: 0, r: 0 }, rev: { h: 0, r: 0 }, late: { h: 0, r: 0 }, dPts: null };
    var lift = { old: 0, elim: 0 };
    var out = {
      v: 1, chg: chg, lift: lift,
      keyOut: 0, keyOutBySkill: {}, near: 0, blindMedHard: 0,
      elim: { mc: 0, used: 0 },
      rev: [], calc: { mathQ: 0, active: 0, openOnly: 0, fav: null, favActive: null, favMissNoUse: null, untagged: null,
                       favSlowNoUse: null, candidates: null, overUse: null },
      // rsQ: reference-sheet items seen; rsMissNoRef: of those, missed with
      // the sheet never opened on them (a retrieval gap).
      ref: { opens: 0, rsQ: 0, rsMissNoRef: 0 },
      // Return trips to a question after its first real look, split by
      // whether the question was flagged (the report's reopened-answers
      // flag reads the same split), and questions switched 3+ times within
      // a look (the wavering signal).
      revisit: { q: 0, flagged: 0, unflagged: 0, sec: 0, secUnflagged: 0 },
      waverQ: 0
    };
    var dPts = 0, dPtsOk = typeof cfg.scoreSection === 'function';

    decoded.forEach(function (x) {
      var d = x.d, p = x.p, rows = d.rows;
      rows.forEach(function (r) {
        r.changes.forEach(function (c) {
          if (c.kind === 'WR') chg.h++; else if (c.kind === 'RW') chg.r++; else if (c.kind === 'WW') chg.ww++; else chg.rr++;
          var bump = function (o) { if (c.kind === 'WR') o.h++; else if (c.kind === 'RW') o.r++; };
          // A change is by construction on a return visit, so this is
          // "changed on a revisit to a question that was never flagged".
          if (!c.flagged) bump(chg.unfl);
          if (c.phase === 'review') bump(chg.rev);
          if (c.late) bump(chg.late);
        });
        chg.sw += r.switches;
        if (r.type === 'mc') {
          if (r.visits > 0) { out.elim.mc++; if (r.elEver) out.elim.used++; }
          // Answered and wrong with the key crossed out at some point. A
          // blank isn't counted: nothing was chosen instead of the key.
          if (r.final !== null && !r.finalOk && r.keyOutEver) {
            out.keyOut++;
            if (r.skill) out.keyOutBySkill[r.skill] = (out.keyOutBySkill[r.skill] || 0) + 1;
          }
          if (r.final !== null && !r.finalOk) {
            if (r.k === 2 && !r.keyOutFinal) out.near++;
            if (r.k === 4 && (r.difficulty === 'medium' || r.difficulty === 'hard')) out.blindMedHard++;
          }
        }
        out.ref.opens += r.refOpens;
        var isRs = typeof cfg.rs === 'function' ? !!cfg.rs(p.questions[r.q]) : refSheetItem(p.questions[r.q]);
        if (isRs && r.visits > 0) {
          out.ref.rsQ++;
          if (!r.finalOk && r.refOpens === 0) out.ref.rsMissNoRef++;
        }
        if (r.revisits > 0) {
          out.revisit.q++;
          if (r.flagged) out.revisit.flagged++; else { out.revisit.unflagged++; out.revisit.secUnflagged += r.revisitSec; }
          out.revisit.sec += r.revisitSec;
        }
        if (r.switches >= 3) out.waverQ++;
      });
      var gl = guessingLift(rows);
      lift.old += gl.old; lift.elim += gl.elim;

      if (d.sectionKey === 'math') {
        out.calc.mathQ += rows.length;
        rows.forEach(function (r) {
          if (r.calcActive) out.calc.active++;
          else if (r.calcOpenSec > 0) out.calc.openOnly++;
        });
        if (typeof cfg.dz === 'function') {
          if (out.calc.fav === null) { out.calc.fav = 0; out.calc.favActive = 0; out.calc.favMissNoUse = 0; out.calc.untagged = 0; }
          var budgetOk = typeof p.budgetSec === 'function';
          if (budgetOk && out.calc.overUse === null) { out.calc.overUse = 0; out.calc.favSlowNoUse = 0; }
          rows.forEach(function (r, i) {
            var tag = cfg.dz(p.questions[i]);
            // A question whose text changed gets a new key and no tag; count
            // it rather than let it drop out of the Desmos figures unseen.
            if (typeof tag !== 'number') { out.calc.untagged++; return; }
            if (r.visits === 0) return;
            var budget = budgetOk ? p.budgetSec(p.questions[i]) : null;
            var over = typeof budget === 'number' && budget > 0 && r.timeSec > budget;
            // Over-use: active Desmos on a no-help question that also ran
            // over its time target (3.4). Using it and staying on time is fine.
            if (tag === 0 && r.calcActive && over) out.calc.overUse++;
            if (tag !== 2) return;
            out.calc.fav++;
            if (r.calcActive) out.calc.favActive++;
            else if (!r.finalOk) out.calc.favMissNoUse++;
            else if (over) out.calc.favSlowNoUse++;
          });
          // The coaching gate counts fast-route questions missed OR over
          // their target without active Desmos (3.4); the parent fact stays
          // on misses alone.
          out.calc.candidates = out.calc.favMissNoUse + (out.calc.favSlowNoUse || 0);
        }
      }

      d.modules.forEach(function (m) {
        out.rev.push({
          sec: d.sectionKey, m: m.module,
          reached: m.reviewReached,
          reserve: m.reserveSec === null ? null : Math.round(m.reserveSec),
          mins: Math.round(m.reviewSec / 6) / 10,
          gain: m.reviewGain,
          page: m.reviewPageSec === null ? null : Math.round(m.reviewPageSec),
          submitReserve: m.submitReserveSec === null ? null : Math.round(m.submitReserveSec),
          flaggedShare: m.reviewFlaggedShare === null ? null : Math.round(m.reviewFlaggedShare * 100) / 100,
          skips: m.skips, skipAns: m.skipAnswered, skipRight: m.skipRight
        });
      });

      if (dPtsOk) {
        var finalC = rows.map(function (r) { return r.finalOk; });
        var initC = rows.map(function (r) { return r.initial === null ? r.finalOk : r.initialOk; });
        var sf = cfg.scoreSection(d.sectionKey, finalC, p.module1Length || rows.length);
        var si = cfg.scoreSection(d.sectionKey, initC, p.module1Length || rows.length);
        if (typeof sf === 'number' && typeof si === 'number') dPts += sf - si; else dPtsOk = false;
      }
    });
    chg.dPts = dPtsOk ? dPts : null;
    out.revisit.sec = Math.round(out.revisit.sec);
    out.revisit.secUnflagged = Math.round(out.revisit.secUnflagged);
    lift.old = Math.round(lift.old * 100) / 100;
    lift.elim = Math.round(lift.elim * 100) / 100;
    return out;
  }

  /* -- pooling attempts -----------------------------------------------
     entries: [{ at, signals, testId?, mode? }] (testId/mode from the same
     Attempts row). `signals` is the summary object or its JSON
     text (the SignalsJSON cell is text). `at` is a Date, epoch ms (or
     seconds), or an ISO-8601 string; anything else is dropped, never
     guessed at ("12/09/2026" means different days in different places).
     Sums the counts over the last `days` (default 90), all attempts
     weighted equally. L.dropped counts what could not be read. */
  function sumLedger(entries, nowMs, days) {
    days = (typeof days === 'number' && days >= 0) ? days : DEFAULTS.ledgerDays;
    var now = nowMs || Date.now(), since = now - days * 86400000;
    var L = { attempts: 0, dropped: 0, chg: { h: 0, r: 0, ww: 0, sw: 0, unfl: { h: 0, r: 0 }, rev: { h: 0, r: 0 }, late: { h: 0, r: 0 } },
              near: 0, keyOut: 0, blindMedHard: 0, elim: { mc: 0, used: 0 },
              calc: { mathQ: 0, active: 0, fav: 0, favActive: 0, favMissNoUse: 0, favSlowNoUse: 0, candidates: 0, overUse: 0 },
              ref: { rsQ: 0, rsMissNoRef: 0 } };
    var when = function (at) {
      if (at instanceof Date) return at.getTime();
      if (typeof at === 'number' && isFinite(at)) return at < 1e11 ? at * 1000 : at;
      if (typeof at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(at)) return Date.parse(at);
      return NaN;
    };
    (entries || []).forEach(function (e) {
      if (!e) return;
      var s = e.signals;
      if (typeof s === 'string') { try { s = JSON.parse(s); } catch (err) { s = null; } }
      var t = when(e.at);
      if (!s || s.v !== 1 || isNaN(t)) { if (e.signals) L.dropped++; return; }
      // Capture ran but the summary could not be made or kept: counted, not pooled.
      if (s.err) { L.errored = (L.errored || 0) + 1; return; }
      if (!(t >= since && t <= now + 86400000)) return;
      var c = s.chg || {};
      L.attempts++;
      L.chg.h += num(c.h); L.chg.r += num(c.r); L.chg.ww += num(c.ww); L.chg.sw += num(c.sw);
      ['unfl', 'rev', 'late'].forEach(function (k) { if (c[k]) { L.chg[k].h += num(c[k].h); L.chg[k].r += num(c[k].r); } });
      L.near += num(s.near); L.keyOut += num(s.keyOut);
      // On the hardest test every question is medium or hard, so its blind
      // guesses would swamp this count; it stays out (as it does from every
      // score comparison). Callers comparing an early and a late window
      // (changeImproved) should also build both windows without it.
      if (e.testId !== HARDEST_TEST_ID) L.blindMedHard += num(s.blindMedHard);
      else L.hardest = (L.hardest || 0) + 1;
      if (s.elim) { L.elim.mc += num(s.elim.mc); L.elim.used += num(s.elim.used); }
      if (s.calc) {
        L.calc.mathQ += num(s.calc.mathQ); L.calc.active += num(s.calc.active);
        L.calc.fav += num(s.calc.fav); L.calc.favActive += num(s.calc.favActive); L.calc.favMissNoUse += num(s.calc.favMissNoUse);
        L.calc.favSlowNoUse += num(s.calc.favSlowNoUse); L.calc.candidates += num(s.calc.candidates); L.calc.overUse += num(s.calc.overUse);
      }
      if (s.ref) { L.ref.rsQ += num(s.ref.rsQ); L.ref.rsMissNoRef += num(s.ref.rsMissNoRef); }
    });
    return L;
  }

  /* -- Beta machinery ----------------------------------------------- */
  function lgamma(x) { // Lanczos, g = 7
    var c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
             -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1;
    var a = c[0], t = x + 7.5;
    for (var i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  function betacf(x, a, b) { // continued fraction (modified Lentz)
    var FPMIN = 1e-300, qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    var h = d;
    for (var m = 1; m <= 300; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      var del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 3e-15) break;
    }
    return h;
  }
  // Regularized incomplete beta I_x(a, b): the Beta(a, b) CDF at x.
  function betaCdf(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return (x < (a + 1) / (a + b + 2)) ? bt * betacf(x, a, b) / a : 1 - bt * betacf(1 - x, b, a) / b;
  }
  function betaQuantile(p, a, b) {
    var lo = 0, hi = 1;
    for (var i = 0; i < 60; i++) { var mid = (lo + hi) / 2; if (betaCdf(mid, a, b) < p) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  // Wilson score interval for k successes in n (default 95%).
  function wilson(k, n, z) {
    z = z || 1.959964;
    if (!(n > 0)) return { lo: 0, hi: 1, p: null };
    var p = k / n, z2 = z * z, den = 1 + z2 / n;
    var mid = (p + z2 / (2 * n)) / den, half = z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / den;
    return { lo: Math.max(0, mid - half), hi: Math.min(1, mid + half), p: p };
  }

  /* -- do this student's answer changes help? -------------------------
     h = changes wrong->right, r = right->wrong (pooled). Each such change
     helps with unknown probability p; prior Beta with mean mu and
     strength kappa. A verdict needs the posterior probability on one side
     of 0.5 to reach its gate AND at least minFlips changes, so a parent is
     never told a child's instincts betray them on a handful of data
     points. Negative or missing counts are treated as zero. */
  function changeVerdict(h, r, cfg) {
    h = Math.max(0, num(h)); r = Math.max(0, num(r));
    var prior = opt(cfg, 'changePrior');
    var a = prior.mu * prior.kappa + h, b = (1 - prior.mu) * prior.kappa + r;
    var pHurt = betaCdf(0.5, a, b), pHelp = 1 - pHurt, flips = h + r;
    var lean = opt(cfg, 'leanProb'), minF = opt(cfg, 'minFlips'), leanMin = opt(cfg, 'leanMinFlips');
    var state = 'silent';
    if (flips >= minF && pHelp >= opt(cfg, 'gateHelp')) state = 'help';
    else if (flips >= minF && pHurt >= opt(cfg, 'gateHurt')) state = 'hurt';
    else if (flips >= leanMin && pHelp >= lean) state = 'lean-help';
    else if (flips >= leanMin && pHurt >= lean) state = 'lean-hurt';
    return {
      state: state, h: h, r: r, flips: flips,
      mean: a / (a + b), pHelp: pHelp, pHurt: pHurt,
      ci80: [betaQuantile(0.10, a, b), betaQuantile(0.90, a, b)]
    };
  }

  /* P(p2 > p1) for independent Beta(a1, b1) and Beta(a2, b2): the
     integral of the first density times the second's upper tail, by
     Simpson's rule on the CDF grid. Used to say a rate has improved only
     when the evidence says so, not because a raw count went up. */
  function probGreater(a1, b1, a2, b2) {
    var N = 400, s = 0, prevF = 0;
    for (var i = 1; i <= N; i++) {
      var x = i / N, F = betaCdf(x, a1, b1);
      var mid = (i - 0.5) / N;
      s += (F - prevF) * (1 - betaCdf(mid, a2, b2));
      prevF = F;
    }
    return s;
  }
  // Did the helping rate of answer changes rise from an earlier window of
  // attempts to a later one? Same prior for both; needs minFlips in each.
  function changeImproved(early, late, cfg) {
    var prior = opt(cfg, 'changePrior'), minF = opt(cfg, 'minFlips');
    var e = { h: Math.max(0, num(early && early.h)), r: Math.max(0, num(early && early.r)) };
    var l = { h: Math.max(0, num(late && late.h)), r: Math.max(0, num(late && late.r)) };
    if (e.h + e.r < minF || l.h + l.r < minF) return { improved: false, p: null };
    var p = probGreater(prior.mu * prior.kappa + e.h, (1 - prior.mu) * prior.kappa + e.r,
                        prior.mu * prior.kappa + l.h, (1 - prior.mu) * prior.kappa + l.r);
    return { improved: p >= opt(cfg, 'gateHurt'), p: p };
  }

  /* -- what a parent may be told --------------------------------------
     Gated, structured facts; the wording lives in the email templates.
     Only facts whose gates pass are returned (SIGNALS_SPEC.md section 5):
     nothing here says "not enough data". Frequency limits (once every
     three weeks per habit) are the sender's job, since only it knows what
     went out before.
     cfg.earlierLedger (optional): the same ledger for an earlier window,
       which enables the "changes improved" fact.
     cfg.desmosTagsReviewed: must be true for the Desmos fact; the tags
       stay drafts until the review page's precision clears 90%.
     "of" in the change facts counts changes that affected the score
     (wrong->right or right->wrong), which is what the sentence must say. */
  function parentFacts(ledger, last, cfg) {
    var facts = [];
    if (ledger && ledger.chg) {
      var v = changeVerdict(ledger.chg.h, ledger.chg.r, cfg);
      if (v.state === 'help') facts.push({ id: 'changes-help', fixed: v.h, of: v.flips });
      if (v.state === 'hurt') facts.push({ id: 'changes-hurt', broke: v.r, of: v.flips });
      if (cfg && cfg.earlierLedger && cfg.earlierLedger.chg) {
        var imp = changeImproved(cfg.earlierLedger.chg, ledger.chg, cfg);
        if (imp.improved) facts.push({ id: 'changes-improved', p: imp.p });
      }
    }
    if (last) {
      if (num(last.near) >= 4) facts.push({ id: 'near-misses', count: last.near });
      var ko = last.keyOutBySkill || {};
      Object.keys(ko).forEach(function (skill) { if (ko[skill] >= 2) facts.push({ id: 'key-out', skill: skill, count: ko[skill] }); });
      // One review-pass fact per attempt, and only when the review gained
      // something: the module where it gained the most.
      var best = null;
      (last.rev || []).forEach(function (m) {
        if (m.reached && m.reserve !== null && m.gain > 0 && (!best || m.gain > best.gain)) best = m;
      });
      if (best) facts.push({ id: 'review-pass', sec: best.sec, module: best.m, reserveSec: best.reserve, gain: best.gain });
      if (cfg && cfg.desmosTagsReviewed === true && last.calc && num(last.calc.favMissNoUse) >= 4) {
        facts.push({ id: 'desmos', used: last.calc.favActive, of: last.calc.fav });
      }
    }
    return facts;
  }

  /* === HOW MUCH A SCORE MOVES ON ITS OWN ===
     Moved here from portal/index.html (2026-09-12) so the portal's progress
     chart and the family emails (emails.gs) judge score changes the same way.
     Test-retest SD of one section score by level, in scaled points, from
     simulation on the real forms, routing and curves (stats audit,
     2026-09-12): sampling error plus ordinary day-to-day variation. Largest
     mid-scale, where one question is worth the most. */
  var SECTION_SEM_TABLE = [[200, 30], [386, 45], [483, 57], [608, 60], [702, 43], [750, 30], [800, 22]];
  function sectionSem(level) {
    var t = SECTION_SEM_TABLE;
    if (!(level > t[0][0])) return t[0][1];
    for (var i = 1; i < t.length; i++) {
      if (level <= t[i][0]) return t[i - 1][1] + (t[i][1] - t[i - 1][1]) * (level - t[i - 1][0]) / (t[i][0] - t[i - 1][0]);
    }
    return t[t.length - 1][1];
  }
  // e: { composite, rw?, math? }; missing sections are split evenly.
  function compositeSem(e) {
    var rw = (typeof e.rw === 'number') ? e.rw : e.composite / 2;
    var m = (typeof e.math === 'number') ? e.math : e.composite / 2;
    return Math.sqrt(Math.pow(sectionSem(rw), 2) + Math.pow(sectionSem(m), 2));
  }
  /* The hardest practice test (id sat-practice-11, shown as Practice Test 12
     since 2026-09-12): every question on it is hard and the same student
     scores roughly 87 points lower on it, so it stays out of every trend,
     drop, improvement or target comparison. */
  var HARDEST_TEST_ID = 'sat-practice-11';
  // entries: { composite, rw?, math?, testId?, mode? }. Section-only sittings
  // and the hardest test are not comparable to full tests.
  function isTrendComparable(e) {
    // The self-reported baseline (PSAT or an outside SAT, typed in) is a
    // starting point to show, not a test to average in.
    return !!e && typeof e.composite === 'number' && isFinite(e.composite) && e.testId !== HARDEST_TEST_ID &&
      e.mode !== 'section' && e.source !== 'baseline';
  }
  function levelOf(list) {
    var avg = function (f) { return list.reduce(function (s, e) { return s + f(e); }, 0) / list.length; };
    var level = { composite: avg(function (e) { return e.composite; }) };
    var haveSections = list.every(function (e) { return typeof e.rw === 'number' && typeof e.math === 'number'; });
    if (haveSections) { level.rw = avg(function (e) { return e.rw; }); level.math = avg(function (e) { return e.math; }); }
    return level;
  }
  /* Has the composite really changed? Entries oldest first. The average of
     the first k comparable full tests against the average of the last k
     (k = up to 3, and no more than half of them), called a change only past
     1.645 standard errors of that difference: a gain that big turns up by
     chance about 1 time in 20. Two single sittings differ by chance by
     75-140 points (SD), so one pair rarely certifies a realistic gain;
     pooling tests is what makes one visible. The error is read at the
     student's AVERAGE level across these tests (evaluated per score it gave
     13-14% false changes against 10% nominal) and rounded up to the next 10.
     Returns null with fewer than two comparable tests. */
  function scoreChange(entries) {
    var usable = (entries || []).filter(isTrendComparable);
    if (usable.length < 2) return null;
    var k = Math.max(1, Math.min(3, Math.floor(usable.length / 2)));
    var first = usable.slice(0, k), latest = usable.slice(usable.length - k);
    var mean = function (a) { return a.reduce(function (s, e) { return s + e.composite; }, 0) / a.length; };
    var delta = Math.round(mean(latest) - mean(first));
    var sdDiff = compositeSem(levelOf(usable)) * Math.sqrt(2 / k);
    var threshold = Math.ceil(1.645 * sdDiff / 10) * 10;
    return { delta: delta, threshold: threshold, k: k, n: usable.length, real: Math.abs(delta) >= threshold };
  }
  /* One test against the one before it (the emails' "score drop" and
     "personal best" moments). Same noise model, k = 1, so the threshold is
     about 190-200 points mid-scale and about 100 near 1500: a single-test
     swing smaller than that is ordinary variation and should not be
     reported as news (the old 50-point drop flag fired for about a third of
     students who had not changed). Returns null if either test is not
     comparable. */
  function pairChange(prev, latest) {
    if (!isTrendComparable(prev) || !isTrendComparable(latest)) return null;
    var delta = Math.round(latest.composite - prev.composite);
    var threshold = Math.ceil(1.645 * Math.SQRT2 * compositeSem(levelOf([prev, latest])) / 10) * 10;
    return { delta: delta, threshold: threshold, real: Math.abs(delta) >= threshold };
  }

  return {
    DEFAULTS: DEFAULTS,
    itemKey: itemKey,
    decodeSection: decodeSection,
    guessingLift: guessingLift,
    summarizeAttempt: summarizeAttempt,
    sumLedger: sumLedger,
    changeVerdict: changeVerdict,
    changeImproved: changeImproved,
    probGreater: probGreater,
    parentFacts: parentFacts,
    refSheetItem: refSheetItem,
    frValue: frValue,
    wilson: wilson,
    betaCdf: betaCdf,
    betaQuantile: betaQuantile,
    SECTION_SEM_TABLE: SECTION_SEM_TABLE,
    sectionSem: sectionSem,
    compositeSem: compositeSem,
    HARDEST_TEST_ID: HARDEST_TEST_ID,
    isTrendComparable: isTrendComparable,
    scoreChange: scoreChange,
    pairChange: pairChange
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = MorettiSignals;
if (typeof window !== 'undefined') window.MorettiSignals = MorettiSignals;
