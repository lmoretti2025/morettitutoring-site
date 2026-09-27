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

   Since 2026-09-26 it also holds the SHARED STATISTICS (content evidence
   across tests and practice, trends, repeated-look control, targets and
   the tutor-only analyses), below the score rules at the end of the file.

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
       That 2.1% is for ONE look. The Friday email and session prep re-read
       the pooled record after every test (stats build 2026-09-26,
       sim-E-looks.js, 3,000 neutral students x 10 weekly tests at 1-2.5
       unflagged score-changing changes a test): "second-guessing" reached a
       neutral student on at least one of ten looks 2.4-4.6% of the time,
       and 1.5-2.8% once a parent fact must hold on two consecutive reads
       (behaviorHighlights' twoReads, now the default). Students whose
       changes truly help only 30% of the time hear it 14-46% of the time.
       Refit mu and kappa from real students once 30+ have changes on
       record. */
    changePrior: { mu: 0.60, kappa: 2 },
    gateHelp: 0.99,         // posterior P(p > 0.5) needed to say changes help
    gateHurt: 0.975,        // posterior P(p < 0.5) needed to say changes hurt
    minFlips: 6,            // ...and at least this many correctness-flipping changes
    /* Tutor-only "leaning" state. Was 0.75 on 3+ flips, which showed a
       neutral student (p = 0.5) a lean on 67-71% of looks (either kind,
       either side); at 0.9 on 8+ flips it is 11-26% of looks, rising with
       the number of changes on record (stats build 2026-09-26,
       sim-E-looks.js). Still a hint for Luca, never a parent fact. */
    leanProb: 0.9,
    leanMinFlips: 8,
    /* The review pass (behaviorHighlights 'review-pass'): gated like the
       answer changes. Each question the review changed from wrong to right
       (up) or right to wrong (down) is one event; the posterior P(a review
       change helps > 0.5) under changePrior must reach gateReview on at
       least reviewMinEvents events. Blanks filled in during the review are
       counted apart and never enter the gate. A review whose changes are
       neutral (p = 0.5) was named on at least one of ten weekly looks
       3.5-3.7% of the time, 1.9-2.0% on two reads; one that fixes 80% of
       what it changes, 53-85% (two reads, 1.5-3 events a test). */
    gateReview: 0.99,
    reviewMinEvents: 6,
    twoReads: true,         // behaviorHighlights: parent facts must hold without the latest test too
    ledgerDays: 90,
    minAttempts: 3,         // behaviorHighlights: tests pooled before any pattern is named
    nearMinPooled: 8        // ...and near misses (down to two choices) across them
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
     looked at again.
     The portal's own permanent ids ("mt" + 6 hex, added to every test and
     challenge item on 2026-09-26) are ignored here, so the Desmos tags,
     keyed by text hash before those ids existed, keep matching. */
  function itemKey(q) {
    if (!q) return '';
    if (q.qid && !/^mt[0-9a-f]{6}$/.test(q.qid)) return String(q.qid);
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
      // Times are stored to 0.1 s, so a review arrival the same millisecond
      // as the last first look can round just below it: v2 records rv only
      // after everything was seen (trusted as is), v1 gets 0.2 s of slack.
      if (typeof rvm === 'number' && (sec.sv >= 2 || rvm + 0.2 >= allSeenAt)) { reviewStart.push(rvm); continue; }
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
      var changes = [], prev = null, initial = null, answeredAt = null, switches = 0, maxSwitches = 0;
      // The answer standing when review began: the last visit-end answer of
      // any visit that started before it (blank if none).
      var standing = null, visitedBeforeReview = false;
      vs.forEach(function (v) {
        if (v.t0 < reviewStart[mod]) { visitedBeforeReview = true; standing = logAnswer(Q, v.end); }
      });
      vs.forEach(function (v) {
        switches += v.sw;
        if (v.sw > maxSwitches) maxSwitches = v.sw;
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
        changes: changes, switches: switches, maxSwitches: maxSwitches,
        skipFirst: skipFirst,
        skipThenAnswer: skipFirst && final !== null,
        answeredInReview: !!(answeredAt && answeredAt.t0 >= reviewStart[mod]),
        visitedBeforeReview: visitedBeforeReview,
        standingOk: standing !== null && cfg.grade(Q, standing),
        standingBlank: standing === null,
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
      var gain = null, up = null, down = null, fill = null, fillRight = null;
      if (isFinite(rs)) {
        gain = 0; up = 0; down = 0; fill = 0; fillRight = 0;
        inMod.forEach(function (r) {
          gain += (r.finalOk ? 1 : 0) - (r.standingOk ? 1 : 0);
          /* The same gain split by what the review did: an answer standing
             wrong made right (up), one standing right made wrong or blank
             (down), and a blank filled in (fill; fillRight of them right).
             gain = up + fillRight - down. A filled blank is a guess as often
             as a correction, so it is counted apart (stats build 2026-09-26). */
          if (r.standingBlank) { if (r.final !== null) { fill++; if (r.finalOk) fillRight++; } }
          else if (!r.standingOk && r.finalOk) up++;
          else if (r.standingOk && !r.finalOk) down++;
        });
      }
      var rpm = Array.isArray(sec.rp) ? sec.rp[mm] : null, sbm = Array.isArray(sec.sb) ? sec.sb[mm] : null;
      modules.push({
        module: mm, questions: inMod.length,
        reviewReached: Array.isArray(sec.rv) && typeof sec.rv[mm] === 'number',
        reviewStartSec: isFinite(rs) ? rs : null,
        reserveSec: (isFinite(rs) && moduleSec[mm] > 0) ? Math.max(0, moduleSec[mm] - rs) : null,
        reviewSec: reviewSec,
        reviewFlaggedShare: reviewSec > 0 ? reviewFlaggedSec / reviewSec : null,
        reviewGain: gain,
        reviewUp: up, reviewDown: down, reviewFill: fill, reviewFillRight: fillRight,
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
     Grid-ins and blanks are excluded, as in the report.

     CAPPED PER CROSSING-OUT LEVEL (stats build, 2026-09-26). The uniform
     guess is the weak point: a student who narrows to the key and one
     trap and then picks the trap most of the time piles up k = 2 wrong
     answers, each read as a whole lucky right answer, when the right
     answers at k = 2 that could have been lucky are few. Lucky right
     answers at a level can never exceed the right answers at that level,
     so lucky_k = min(wrong_k / (k - 1), right_k), summed over k = 2..4
     (k = 1 leaves nothing to guess between: no luck either way).
     Simulated (stats build 2026-09-26, sim-E-lift.js: 20,000 attempts
     of 80 multiple-choice questions per case, 30/50/70% of questions
     known). Narrowing every unknown question to the key and one trap and
     picking the trap 80% of the time (truth 5-11 lucky answers): uncapped
     +14 to +34 too high, capped +1.2 to +2.8 when known answers are rarely
     narrowed to two (5%), but still +6 to +12 when a quarter of them are
     (the cap cannot tell a known k = 2 answer from a lucky one). Honest
     elimination -0.9 to 0.0 (uncapped -0.05 to 0.0), random crossing
     including the key -0.45 to 0.0, no crossing at all within 0.03: the
     cap costs almost nothing where the model holds.
     Returns { old, elim, uncapped }: elim is the capped figure the report
     uses; uncapped is the previous one, for comparison. */
  function guessingLift(rows) {
    var old = 0, uncapped = 0, wrongK = [0, 0, 0, 0, 0], rightK = [0, 0, 0, 0, 0];
    rows.forEach(function (r) {
      if (r.type !== 'mc' || r.final === null) return;
      var k = (r.k >= 1 && r.k <= 4) ? r.k : 4;
      if (r.finalOk) { rightK[k]++; return; }
      old += 1 / 3;
      if (r.keyOutFinal || k < 2) return;
      wrongK[k]++;
      uncapped += 1 / (k - 1);
    });
    var elim = 0;
    for (var k = 2; k <= 4; k++) elim += Math.min(wrongK[k] / (k - 1), rightK[k]);
    return { old: old, elim: elim, uncapped: uncapped };
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
      keyOut: 0, keyOutBySkill: {}, near: 0, nearBySkill: {}, blindMedHard: 0,
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
            if (r.k === 2 && !r.keyOutFinal) {
              out.near++;
              if (r.skill) out.nearBySkill[r.skill] = (out.nearBySkill[r.skill] || 0) + 1;
            }
            if (r.k === 4 && (r.difficulty === 'medium' || r.difficulty === 'hard')) out.blindMedHard++;
          }
        }
        out.ref.opens += r.refOpens;
        var isRs = typeof cfg.rs === 'function' ? !!cfg.rs(p.questions[r.q]) : refSheetItem(p.questions[r.q]);
        /* A real look (not a glance) and a wrong ANSWER: a blank or a 0.3 s
           glance at the buzzer is a pacing fact, not a retrieval gap. The
           sheet left open from an earlier question counts as open (rf keeps
           its seconds even with no new open). */
        if (isRs && r.realVisits > 0) {
          out.ref.rsQ++;
          if (r.final !== null && !r.finalOk && r.refOpens === 0 && r.refSec === 0) out.ref.rsMissNoRef++;
        }
        if (r.revisits > 0) {
          out.revisit.q++;
          if (r.flagged) out.revisit.flagged++; else { out.revisit.unflagged++; out.revisit.secUnflagged += r.revisitSec; }
          out.revisit.sec += r.revisitSec;
        }
        // Wavering is 3+ switches within ONE look (spec 3.1), not summed across looks.
        if (r.maxSwitches >= 3) out.waverQ++;
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
            // A real look, not a glance at the buzzer (same reason as rsQ).
            if (r.realVisits === 0) return;
            var budget = budgetOk ? p.budgetSec(p.questions[i]) : null;
            var over = typeof budget === 'number' && budget > 0 && r.timeSec > budget;
            // Over-use: active Desmos on a no-help question that also ran
            // over its time target (3.4). Using it and staying on time is fine.
            if (tag === 0 && r.calcActive && over) out.calc.overUse++;
            if (tag !== 2) return;
            out.calc.fav++;
            if (r.calcActive) out.calc.favActive++;
            else if (r.final !== null && !r.finalOk) out.calc.favMissNoUse++;
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
          up: m.reviewUp, down: m.reviewDown, fill: m.reviewFill, fillRight: m.reviewFillRight,
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
              ref: { rsQ: 0, rsMissNoRef: 0 },
              // split: tests whose summary records the review's up/down/fill
              // split (summaries from 2026-09-26 on); up..fillRight sum those.
              rev: { tests: 0, gained: 0, gain: 0, split: 0, up: 0, down: 0, fill: 0, fillRight: 0 } };
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
      if (!(t >= since && t <= now + 86400000)) return;
      // Capture ran but the summary could not be made or kept: counted, not pooled.
      if (s.err) { L.errored = (L.errored || 0) + 1; return; }
      var c = s.chg || {};
      L.attempts++;
      L.chg.h += num(c.h); L.chg.r += num(c.r); L.chg.ww += num(c.ww); L.chg.sw += num(c.sw);
      ['unfl', 'rev', 'late'].forEach(function (k) { if (c[k]) { L.chg[k].h += num(c[k].h); L.chg[k].r += num(c[k].r); } });
      /* The hardest test (every question medium or hard) stays out of every
         MISS-based pool: near misses, key-out misses, blind guesses, Desmos
         and reference-sheet misses would all read as habits there. Answer
         changes and elimination use still pool (each is its own event).
         Callers comparing an early and a late window (changeImproved)
         should build both windows without it too. */
      var hardest = e.testId === HARDEST_TEST_ID;
      if (hardest) L.hardest = (L.hardest || 0) + 1;
      if (!hardest) { L.near += num(s.near); L.keyOut += num(s.keyOut); L.blindMedHard += num(s.blindMedHard); }
      if (s.elim) { L.elim.mc += num(s.elim.mc); L.elim.used += num(s.elim.used); }
      if (s.calc) {
        L.calc.mathQ += num(s.calc.mathQ); L.calc.active += num(s.calc.active);
        if (!hardest) {
          L.calc.fav += num(s.calc.fav); L.calc.favActive += num(s.calc.favActive); L.calc.favMissNoUse += num(s.calc.favMissNoUse);
          L.calc.favSlowNoUse += num(s.calc.favSlowNoUse); L.calc.candidates += num(s.calc.candidates); L.calc.overUse += num(s.calc.overUse);
        }
      }
      if (s.ref && !hardest) { L.ref.rsQ += num(s.ref.rsQ); L.ref.rsMissNoRef += num(s.ref.rsMissNoRef); }
      // The review pass: questions it won or lost on each test that reached one.
      if (Array.isArray(s.rev)) {
        var reached = s.rev.filter(function (m) { return m && m.reached && typeof m.gain === 'number'; });
        if (reached.length) {
          var g = reached.reduce(function (t, m) { return t + m.gain; }, 0);
          L.rev.tests++; L.rev.gain += g; if (g > 0) L.rev.gained++;
          if (reached.every(function (m) { return typeof m.up === 'number' && typeof m.down === 'number'; })) {
            L.rev.split++;
            reached.forEach(function (m) { L.rev.up += m.up; L.rev.down += m.down; L.rev.fill += num(m.fill); L.rev.fillRight += num(m.fillRight); });
          }
        }
      }
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

  /* -- what answer changes say, by why the student went back -----------
     One pooled verdict per kind of change, since the two mean different
     things (Luca, 2026-09-16):
       flagged    The student marked the question as unsure and came back.
                  Fixes are the review working as designed. Breaks mean the
                  doubt was right but the topic is not there yet.
       unflagged  A check through answers already settled. Fixes are good
                  catches, but each one is a wrong answer the student was sure
                  enough not to flag: confidence running ahead of accuracy,
                  so the skill still needs work and unsure questions need
                  flagging. Breaks are second-guessing.
     chg: a summary's or ledger's chg object {h, r, unfl: {h, r}}. Every
     change is on a return visit, so flagged = all changes minus unflagged.
     Each kind gets changeVerdict's gates on its own counts, so a reading
     needs several tests pooled (minFlips flips of that kind). Readings are
     the gated facts, most urgent first; the wording lives with the reader. */
  function changeReading(chg, cfg) {
    chg = chg || {};
    // The unflagged counts are part of the totals; never more than them (the summary is client-computed).
    var hU = Math.min(Math.max(0, num(chg.unfl && chg.unfl.h)), Math.max(0, num(chg.h)));
    var rU = Math.min(Math.max(0, num(chg.unfl && chg.unfl.r)), Math.max(0, num(chg.r)));
    var hF = Math.max(0, num(chg.h) - hU), rF = Math.max(0, num(chg.r) - rU);
    var flagged = changeVerdict(hF, rF, cfg), unflagged = changeVerdict(hU, rU, cfg);
    var readings = [];
    if (unflagged.state === 'hurt') readings.push({ id: 'second-guessing', broke: rU, fixed: hU, of: unflagged.flips });
    if (flagged.state === 'hurt') readings.push({ id: 'flagged-breaks', broke: rF, fixed: hF, of: flagged.flips });
    if (unflagged.state === 'help') readings.push({ id: 'check-catches', fixed: hU, broke: rU, of: unflagged.flips });
    if (flagged.state === 'help') readings.push({ id: 'flag-return-works', fixed: hF, broke: rF, of: flagged.flips });
    return { flagged: flagged, unflagged: unflagged, readings: readings };
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
     (wrong->right or right->wrong), which is what the sentence must say.
     cfg.prevLedger (optional, stats build 2026-09-26): the same ledger
       without the latest test. When given, a pooled answer-change fact is
       kept only if it also comes out of prevLedger (two consecutive reads,
       see heldOnTwoReads); facts about the latest test are unaffected. */
  function parentFacts(ledger, last, cfg) {
    var facts = [];
    var prevIds = null;
    if (cfg && cfg.prevLedger) {
      var pc = {};
      Object.keys(cfg).forEach(function (k) { if (k !== 'prevLedger' && k !== 'earlierLedger') pc[k] = cfg[k]; });
      prevIds = {};
      parentFacts(cfg.prevLedger, null, pc).forEach(function (f) { prevIds[f.id] = true; });
    }
    var pooled = function (f) { if (!prevIds || prevIds[f.id]) facts.push(f); };
    // Facts about the latest attempt are not drawn from the hardest test
    // (cfg.lastTestId): its misses would read as habits.
    if (cfg && cfg.lastTestId === HARDEST_TEST_ID) last = null;
    if (ledger && ledger.chg) {
      /* By why the student went back (changeReading). The combined verdict
         speaks only when neither kind has enough on its own to say anything. */
      var rd = changeReading(ledger.chg, cfg);
      // The same routing as behaviorHighlights: only second-guessing is parent-facing.
      rd.readings.forEach(function (x) { if (x.id === 'second-guessing') pooled(x); });
      if (!rd.readings.length) {
        var v = changeVerdict(ledger.chg.h, ledger.chg.r, cfg);
        if (v.state === 'help') pooled({ id: 'changes-help', fixed: v.h, of: v.flips });
        if (v.state === 'hurt') pooled({ id: 'changes-hurt', broke: v.r, of: v.flips });
      }
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
      // Where the summary records the split, the gain is the answers the
      // review changed (up - down); blanks filled in are not a review win.
      var best = null, gainOf = function (m) { return (typeof m.up === 'number' && typeof m.down === 'number') ? m.up - m.down : m.gain; };
      (last.rev || []).forEach(function (m) {
        if (m.reached && m.reserve !== null && gainOf(m) > 0 && (!best || gainOf(m) > gainOf(best))) best = m;
      });
      if (best) facts.push({ id: 'review-pass', sec: best.sec, module: best.m, reserveSec: best.reserve, gain: gainOf(best) });
      if (cfg && cfg.desmosTagsReviewed === true && last.calc && num(last.calc.favMissNoUse) >= 4) {
        facts.push({ id: 'desmos', used: last.calc.favActive, of: last.calc.fav });
      }
    }
    return facts;
  }

  /* -- the patterns worth naming, pooled across tests -----------------
     For Luca's session prep and, once he has checked it against real
     students, one line of the Friday parent email. Nothing here is about a
     single test: every fact pools the last `days` (default 90) and needs
     minAttempts tests on record, so one bad morning never becomes a habit.
     entries: as sumLedger ([{ at, signals, testId }]).
     cfg: nowMs, days, desmosTagsReviewed (must be true for the calculator
          fact), plus changeVerdict's gates.
     Returns { attempts, ledger, reading, facts, tutor, pick }:
       facts  what a parent may be told, most urgent first:
              second-guessing   unflagged changes going right to wrong
              check-catches     unflagged fixes: good catches, but the student
                                felt sure of wrong answers (confidence ahead
                                of accuracy)
              near-misses       misses down to two choices, pooled
              desmos            the calculator skipped where graphing is the
                                fastest route, with misses there
              review-pass       the review pass winning questions back
       tutor  gated readings kept for Luca (flag-and-return working, flagged
              changes going wrong), the "leaning" states under the gates,
              and parent facts still waiting on a second read (pending: true)
       pending  ids of those facts (cfg.twoReads = false turns the
              two-read rule off; see the end of this function)
       pick   facts[0], the one a Friday email would use
     review-pass is now { id, gain, tests, fixed, broke, of, filled,
       filledOf, pHelp }: gain = fixed - broke, answers the review changed;
       blanks filled in are filled (right) of filledOf, never in gain. */
  function behaviorHighlights(entries, cfg) {
    var L = sumLedger(entries, cfg && cfg.nowMs, cfg && cfg.days);
    var rd = changeReading(L.chg, cfg);
    var out = { attempts: L.attempts, ledger: L, reading: rd, facts: [], tutor: [], pick: null };
    var minA = opt(cfg, 'minAttempts');
    if (L.attempts < minA) return out;
    rd.readings.forEach(function (x) {
      /* Only second-guessing may reach a parent. Check-through catches stay with
         Luca (audit 2026-09-16): a student who never flags has every good catch
         counted as unflagged, so the reading can't be told apart from a habit. */
      (x.id === 'second-guessing' ? out.facts : out.tutor).push(x);
    });
    // Miss-based pools leave out the hardest test (sumLedger), so count the rest.
    var tests = L.attempts - (L.hardest || 0);
    if (tests >= minA && L.near >= opt(cfg, 'nearMinPooled')) out.facts.push({ id: 'near-misses', count: L.near, tests: tests });
    var c = L.calc;
    if (cfg && cfg.desmosTagsReviewed === true && tests >= minA && c.fav >= 12 && c.favMissNoUse >= 4 && c.favActive * 2 <= c.fav) {
      out.facts.push({ id: 'desmos', used: c.favActive, of: c.fav, missed: c.favMissNoUse, tests: tests });
    }
    /* The review pass, gated like the answer changes (stats build
       2026-09-26; it used to need only +3 net and half the tests up, which
       a review that changes answers at random reached on noise). Events are
       the questions the review turned wrong->right (up) or right->wrong
       (down); blanks filled in are a guess as often as a fix and are
       reported apart (filled of filledOf), never in the gate or the gain.
       Only summaries that record the split count (summaries saved from
       2026-09-26 on), so older tests leave this silent. */
    var rv = L.rev, rvEvents = rv.up + rv.down;
    if (rv.split >= minA && rvEvents >= opt(cfg, 'reviewMinEvents')) {
      var rp = opt(cfg, 'changePrior');
      var rvHelp = 1 - betaCdf(0.5, rp.mu * rp.kappa + rv.up, (1 - rp.mu) * rp.kappa + rv.down);
      if (rvHelp >= opt(cfg, 'gateReview')) {
        out.facts.push({ id: 'review-pass', gain: rv.up - rv.down, tests: rv.split, fixed: rv.up, broke: rv.down, of: rvEvents,
                         filled: rv.fillRight, filledOf: rv.fill, pHelp: rvHelp });
      }
    }
    [['flagged', rd.flagged], ['unflagged', rd.unflagged]].forEach(function (k) {
      if (k[1].state === 'lean-help' || k[1].state === 'lean-hurt') out.tutor.push({ id: 'lean', kind: k[0], state: k[1].state, fixed: k[1].h, broke: k[1].r });
    });
    /* Two consecutive reads (heldOnTwoReads, stats build 2026-09-26): the
       Friday email and session prep re-read this after every test, so a
       parent fact must also come out of the same history WITHOUT its
       latest test. One that does not yet is kept for Luca in tutor with
       pending: true (and its id in out.pending), and reaches facts the
       next time it holds. cfg.twoReads = false turns this off. */
    out.pending = [];
    if (opt(cfg, 'twoReads') && out.facts.length) {
      var sorted = byTime((entries || []).filter(function (e) { return e && e.signals; }));
      var prevCfg = {};
      if (cfg) Object.keys(cfg).forEach(function (k2) { prevCfg[k2] = cfg[k2]; });
      prevCfg.twoReads = false;
      var prev = sorted.length > 1 ? behaviorHighlights(sorted.slice(0, sorted.length - 1), prevCfg) : null;
      var held = {};
      if (prev) prev.facts.forEach(function (f) { held[f.id] = true; });
      var kept = [];
      out.facts.forEach(function (f) {
        if (held[f.id]) { kept.push(f); return; }
        var t = {};
        Object.keys(f).forEach(function (k2) { t[k2] = f[k2]; });
        t.pending = true;
        out.tutor.push(t);
        out.pending.push(f.id);
      });
      out.facts = kept;
    }
    out.pick = out.facts[0] || null;
    return out;
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
  /* The hardest practice test (id sat-practice-11, shown as Practice Test 13
     since 2026-09-26; Test 12 from 2026-09-12): every question on it is hard and the same student
     scores roughly 87 points lower on it, so it stays out of every trend,
     drop, improvement or target comparison. */
  var HARDEST_TEST_ID = 'sat-practice-11';
  /* -- interrupted sittings (2026-09-26) ------------------------------
     An entry's `interrupted` is one of:
       false / absent   not interrupted
       true             LEGACY: the sheet's 'YES' from before 2026-09-26,
                        which did not say what happened: treated as a real
                        interruption
       'ranout'         the clock ran out while the student was away
       'reopened'       the test was closed and reopened part-way
       'away'           the tab was hidden or the clock's ticks had a gap;
                        awayMin says for how many minutes
     A test is left out of every trend (and the report / emails show their
     "interrupted" banner) when it is 'ranout', 'reopened', legacy true, or
     more than INTERRUPT_AWAY_MIN minutes away. A short 'away' (a glance at
     another tab) stays comparable. interruptionKind(e) says which kind,
     isInterruptedForTrend(e) applies the rule, so every page shows the
     banner under the SAME rule the trend uses. */
  /* LEGACY WITH A KNOWN TIME AWAY (owner's decision, 2026-09-26, audit 4):
     a legacy flag (true / 'YES') whose awayMin is KNOWN and at most
     INTERRUPT_AWAY_MIN is a short 'away' and stays comparable; a legacy
     flag with no awayMin, or more than 10 minutes, stays set aside.
     RAW MILLISECONDS: when an entry carries awayMs (the unrounded time
     away), every rule here uses awayMs > INTERRUPT_AWAY_MS instead of the
     rounded awayMin, so every consumer that has it compares the same number
     (awayMin 10 can be 10.4 minutes rounded down). */
  var INTERRUPT_AWAY_MIN = 10;
  var INTERRUPT_AWAY_MS = INTERRUPT_AWAY_MIN * 60000;
  function isLegacyFlag(v) { return v === true || v === 'YES' || v === 'yes' || v === 'Yes' || v === 'TRUE' || v === 'true'; }
  // Raw milliseconds away, or null when the entry does not carry them.
  function awayMsOf(e) {
    if (!e || e.awayMs === null || e.awayMs === undefined || e.awayMs === '') return null;
    var m = Number(e.awayMs);
    return isFinite(m) && m >= 0 ? m : null;
  }
  // Is the time away KNOWN (awayMs, or a readable awayMin, 0 included)?
  function awayKnown(e) {
    if (awayMsOf(e) !== null) return true;
    if (!e || e.awayMin === null || e.awayMin === undefined || e.awayMin === '') return false;
    var m = Number(e.awayMin);
    return isFinite(m) && m >= 0;
  }
  // Away for longer than the rule allows: awayMs when present, else awayMin.
  function awayTooLong(e) {
    var ms = awayMsOf(e);
    return ms !== null ? ms > INTERRUPT_AWAY_MS : awayMinOf(e) > INTERRUPT_AWAY_MIN;
  }
  function interruptionKind(e) {
    if (!e) return null;
    var v = e.interrupted;
    if (v === 'ranout' || v === 'reopened' || v === 'away') return v;
    if (isLegacyFlag(v)) return (awayKnown(e) && !awayTooLong(e)) ? 'away' : 'legacy';
    var ms = awayMsOf(e);
    if (ms !== null ? ms > 0 : awayMinOf(e) > 0) return 'away';
    return null;
  }
  // Minutes away as a number (a sheet may hand it over as text); 0 if none.
  function awayMinOf(e) {
    if (!e || e.awayMin === null || e.awayMin === undefined || e.awayMin === '') return 0;
    var m = Number(e.awayMin);
    return isFinite(m) && m > 0 ? m : 0;
  }
  function isInterruptedForTrend(e) {
    var k = interruptionKind(e);
    if (k === 'ranout' || k === 'reopened' || k === 'legacy') return true;
    return awayTooLong(e);
  }
  // entries: { composite, rw?, math?, testId?, mode? }. Section-only sittings
  // and the hardest test are not comparable to full tests.
  function isTrendComparable(e) {
    if (!e) return false;
    // The self-reported baseline (PSAT or an outside SAT, typed in) is a
    // starting point to show, not a test to average in.
    // An interrupted sitting (isInterruptedForTrend) measures the
    // interruption, not the student.
    return typeof e.composite === 'number' && isFinite(e.composite) && e.testId !== HARDEST_TEST_ID &&
      e.mode !== 'section' && e.source !== 'baseline' && !isInterruptedForTrend(e);
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

  /* === WHERE THE STUDENT IS NOW ===
     Luca's decision (2026-09-12): the portal's Score Progress chart shows a
     "current level" band, the student's POOLED level after every comparable
     test so far. It is not a report's single-test range (one sitting's
     score +/- its own noise), which stays exactly as it is: that range says
     what one test measured, this band says what all of them together say
     about the student today.

     A local linear trend Kalman filter: the state is [level, gain per week].
     Each test is the true level plus test noise (compositeSem at the
     predicted level); between tests the level drifts (SD 10 points per
     sqrt(week)) and the weekly gain itself drifts (SD 3 per sqrt(week)),
     so older tests count for less and a steady gain is followed rather
     than averaged away. The gain starts at 0 with SD 25 points a week.
     Two tests on the same day are one moment: no drift between them.

     The band is the central 80% (+/-1.2816 SD), rounded OUTWARD to tens,
     so the printed range never claims more precision than the filter has.
     Simulation (2026-09-12; students U(900,1450), gain N(9,7) a week, a
     test every 1-3 weeks for 12 weeks, test noise from compositeSem): before
     rounding the band covers the true level 79-83% of the time at every
     number of tests, 192 points wide after one test and 120-130 after four
     or more; rounded outward it covers 81-86% and is about 10 points wider.
     Misses are mostly a true level ABOVE the band: the filter lags a
     student who is improving.

     RETUNED (stats build, 2026-09-26): the gain's prior SD 15 -> 25 and its
     drift 2 -> 3. With 15/2 the band lagged a fast improver: at +30 a week
     it covered the true level only 65-72% (unrounded; 69-76% rounded)
     from the third test on. With 25/3 that is 77-80% (80-83% rounded);
     the standard population N(9,7) a week stays 79-83% (81-86%), flat and
     falling students 79-84% (81-87%); the rounded band is 6-13 points
     wider from the second test on (8,000 students per scenario, a test
     every 1-3 weeks for 12 weeks, levels kept inside the scale).
     opts (optional): { slope0SD, slopeDriftSD, driftSD } override these,
     for simulation only.

     entries: score-history entries ({ composite, rw?, math?, date, testId?,
     mode?, source?, interrupted?, awayMin? }). Only comparable full tests
     (isTrendComparable) with a readable date are used, in date order (ties
     keep their input order). date is an ISO-8601 string, a Date or epoch
     ms; anything else is left out rather than guessed at.
     Returns null with no usable test, else { n, points: [{ i, date, level,
     lo, hi }], now: { level, lo, hi } }; points are oldest first, i is the
     entry's index in `entries`, and now is the state after the latest test. */
  var LEVEL_Z80 = 1.2816;            // central 80%: "4 chances in 5"
  var LEVEL_DRIFT_SD = 10;           // level drift, points per sqrt(week)
  var LEVEL_SLOPE_DRIFT_SD = 3;      // weekly-gain drift, points/week per sqrt(week) (was 2; stats build 2026-09-26)
  var LEVEL_SLOPE0_SD = 25;          // prior SD of the weekly gain (was 15; stats build 2026-09-26)
  function currentLevel(entries, opts) {
    var st = levelState(entries, opts);
    if (!st) return null;
    var points = st.trace.map(function (t) {
      var b = bandOf(t.x0, t.p00);
      return { i: t.u.i, date: t.u.e.date, level: b.level, lo: b.lo, hi: b.hi };
    });
    var last = points[points.length - 1];
    return { n: points.length, points: points, now: { level: last.level, lo: last.lo, hi: last.hi } };
  }

  /* === SHARED STATISTICS: CONTENT EVIDENCE ACROSS TESTS AND PRACTICE ===
     (stats build, 2026-09-26.) Everything below is pure: arrays in,
     numbers out, no dates read from the clock unless passed in. Every gate
     was set by simulation on the real forms (portal/banks.js and
     portal/practice-tests.js, Module 2 routed exactly as index.html routes
     it: raw Module 1 score strictly above 15 R&W / 12 Math serves Harder),
     with students drawn from the population the report assumes and with
     the model deliberately misspecified (items vary around their tagged
     difficulty, SD 0.35 logits, fixed per item; multiple-choice guessing
     floor 0.15), so the error rates quoted are not flattered by the
     simulation sharing the analysis's own model. Scripts and full tables:
     the stats-build scratch harness (sim-*.js). */

  /* -- the Rasch machinery, copied exactly from report.html's
     irtContentTest (difficulty offsets calibrated on real attempts,
     analytics-sim README) ----------------------------------------------- */
  var IRT_OFFSETS = { easy: 0.71, medium: 0, hard: -0.29 };
  var IRT_POP_MU = 1.20, IRT_POP_SD = 1.22, IRT_SECTION_SD = 0.61, IRT_MIN_EXCESS = 1.5;
  var Z80 = 1.2816;
  function sigm(x) { return 1 / (1 + Math.exp(-x)); }
  function irtOff(d) { return IRT_OFFSETS[d] || 0; }
  /* MAP ability for items [{ o: offset, y: 0|1 }] under a N(mu, 1/tau) prior.
     STEP CONTROL (2026-09-26): the log-posterior is concave, but a plain
     Newton step from the prior mean overshoots when the answers sit far from
     it (60 easy practice first tries at 20% right went 1.2 -> -4.3 -> +1.9
     ... and ended at theta 19, labelling every skill weak). Each step is now
     capped at 1 logit, which cannot overshoot a concave maximum by more than
     the cap and converges in a few more iterations. */
  var MAP_MAX_STEP = 1;
  function mapTheta(its, mu, tau) {
    var th = mu;
    for (var iter = 0; iter < 100; iter++) {
      var gr = -(th - mu) * tau, h = -tau;
      for (var i = 0; i < its.length; i++) { var p = sigm(th + its[i].o); gr += its[i].y - p; h -= p * (1 - p); }
      var step = gr / h;
      if (step > MAP_MAX_STEP) step = MAP_MAX_STEP; else if (step < -MAP_MAX_STEP) step = -MAP_MAX_STEP;
      th -= step;
      if (Math.abs(step) < 1e-7) break;
    }
    return th;
  }
  /* One attempt's overall ability (logits): MAP under the population
     prior, from its answered questions that were not too fast to read.
     For trapPull's ability-matched null: each roster wrong answer carries
     its answerer's ability on that test (prep.gs), and the student's own is
     the mean over their tests. null when nothing usable. (2026-09-26) */
  function attemptAbility(items) {
    var its = [];
    (items || []).forEach(function (it) {
      if (!it || it.blank || it.tooFast || (it.ok !== true && it.ok !== false)) return;
      its.push({ o: irtOff(it.diff), y: it.ok ? 1 : 0 });
    });
    return its.length ? mapTheta(its, IRT_POP_MU, 1 / (IRT_POP_SD * IRT_POP_SD)) : null;
  }
  function secKeyOf(s) {
    if (s === 'reading-writing' || s === 'rw' || s === 'readingWriting') return 'reading-writing';
    if (s === 'math') return 'math';
    return null;
  }
  function msOf(at) {
    if (at instanceof Date) return at.getTime();
    if (typeof at === 'number' && isFinite(at)) return at < 1e11 ? at * 1000 : at;
    if (typeof at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(at)) return Date.parse(at);
    return NaN;
  }
  // Oldest first by `at`; unreadable dates keep their input order at the end.
  function byTime(list, atKey) {
    atKey = atKey || 'at';
    return list.map(function (x, i) { var t = msOf(x && x[atKey]); return { x: x, i: i, t: isNaN(t) ? Infinity : t }; })
      .sort(function (a, b) { return (a.t - b.t) || (a.i - b.i); }).map(function (w) { return w.x; });
  }

  /* -- one attempt's residuals per unit --------------------------------
     The report's difficulty-aware content test for ONE attempt: overall
     ability MAP under N(1.20, 1.22^2), each section MAP around it (prior
     SD 0.61); per unit S = sum(p - y), W = sum p(1 - p), and the null
     variance corrected for estimating the section's ability from the same
     answers, V = W - W^2 / (W_section + tau). Blanks and answers too fast
     to have been read are left out. null with fewer than minItems usable
     answers (the report's 20). */
  // The offset for one domain on one form: the form's own key when the
  // roster has it, else the roster-wide domain term ('*|' + domain), else 0.
  // Offsets from before 2026-09-26 (no '*|' keys) read exactly as they did.
  function offsetFor(offs, testId, dom) {
    if (!offs) return 0;
    var v = testId ? offs[testId + '|' + dom] : undefined;
    if (typeof v === 'number' && isFinite(v)) return v;
    return num(offs['*|' + dom]);
  }
  function attemptResiduals(items, grain, minItems, formOffsets, testId) {
    var offs = (formOffsets && typeof formOffsets === 'object') ? formOffsets : null;
    var inf = (items || []).filter(function (it) {
      return it && !it.blank && !it.tooFast && secKeyOf(it.sec) && (it.ok === true || it.ok === false || it.ok === 1 || it.ok === 0);
    }).map(function (it) {
      // A form x domain offset (formDomainOffsets) is extra difficulty in
      // logits: it lowers every item's offset in that domain on that form.
      var fo = offs ? offsetFor(offs, testId, it.dom || '') : 0;
      return { sec: secKeyOf(it.sec), unit: grain === 'skill' ? (it.skill || it.dom) : (it.dom || it.skill), dom: it.dom || it.skill, o: irtOff(it.diff) - fo, y: it.ok ? 1 : 0 };
    }).filter(function (it) { return !!it.unit; });
    if (inf.length < (minItems || 20)) return null;
    var popTau = 1 / (IRT_POP_SD * IRT_POP_SD), secTau = 1 / (IRT_SECTION_SD * IRT_SECTION_SD);
    var overall = mapTheta(inf, IRT_POP_MU, popTau);
    var theta = {}, wTot = {};
    ['reading-writing', 'math'].forEach(function (g) {
      var its = inf.filter(function (it) { return it.sec === g; });
      if (!its.length) return;
      var th = mapTheta(its, overall, secTau);
      theta[g] = th;
      wTot[g] = its.reduce(function (a, it) { var p = sigm(th + it.o); return a + p * (1 - p); }, 0) + secTau;
    });
    var units = {};
    inf.forEach(function (it) {
      var p = sigm(theta[it.sec] + it.o);
      var u = units[it.unit] || (units[it.unit] = { sec: it.sec, dom: it.dom, n: 0, obs: 0, exp: 0, S: 0, W: 0 });
      u.n++; u.obs += it.y; u.exp += p; u.S += p - it.y; u.W += p * (1 - p);
    });
    Object.keys(units).forEach(function (k) {
      var u = units[k];
      u.V = Math.max(1e-9, u.W - u.W * u.W / wTot[u.sec]);
    });
    return { theta: theta, overall: overall, units: units, n: inf.length };
  }

  /* -- A. CONTENT EVIDENCE ACROSS TESTS: skillEvidence -----------------
     attempts: [{ id?, testId?, at, items: [{ sec: 'reading-writing'|'math',
       dom, skill, diff: 'easy'|'medium'|'hard', ok, blank, tooFast }] }].
     The report's test generalised to several attempts: ability is
     estimated PER ATTEMPT (students improve between tests, and pooling
     answers under one ability would read the early tests as gaps), and
     each unit's S and V are summed across attempts. The hardest test
     (testId or id sat-practice-11) is left out unless opts.includeHardest.
     opts: grain 'domain' (default) | 'skill'; zLead, zClear, minExcess,
       minItems override the calibrated gates; formOffsets (from
       formDomainOffsets, keyed testId + '|' + domain, and since audit 4
       '*|' + domain for the roster-wide term used when the form has no
       key) adds each form's domain difficulty to its items (2026-09-26).
     Returns { grain, attempts, zLead, zClear, units: { name: { unit, sec,
       dom (the unit's domain), n, obs, exp, S, V, W, z, lo, hi, gap, gapSE, lead, clear,
       perAttempt: [{ k, id, at, n, obs, exp, S, V, W }] } }, leads: [names,
       strongest first], top: name|null }.
       S    questions missed beyond what the student's ability predicts
            (obs right vs exp right); lo/hi its central 80% interval.
       gap  S / W, the shift in logits that would explain S; gapSE its SE.
       lead z > zLead and S >= 1.5: worth naming, hedged, to the tutor.
       clear lead and z >= zClear: firm enough to plan around.
     The gates (stats build 2026-09-26) are set so a student with NO gap
     anywhere is shown any lead about 10% of the time and any clear gap at
     most 5%, at 1, 3 and 6 attempts.

     Measured (sim-A-calib.js, 20,000 no-gap students per cell, real forms
     and routing, misspecified truth as above):
       domain (8 units)  lead 2.24 / clear 2.8, the report's own gates:
                         any lead 10.3 / 10.3 / 11.1% at 1 / 3 / 6 attempts
                         (11.2% at 8); any clear 2.5 / 2.5 / 2.7%.
       skill (~29 units, many with 1-3 questions a test): at the domain
                         gates any lead was 25-41%, so lead 2.95 / clear
                         3.35: any lead 7.8 / 10.7 / 10.4%, any clear
                         3.6 / 4.6 / 4.1% (sim-A-power.js, 6,000 each).
     Power (sim-A-power.js, 6,000 students per cell; gap planted in one
     unit, share of students whose planted unit is a lead / is clear):
       domain gap 0.8 logits  1 test 9 / 3%,  3 tests 24 / 11%, 6 tests 42 / 26%
       domain gap 1.6 logits  1 test 32 / 16%, 3 tests 71 / 56%, 6 tests 89 / 82%
       skill gap 1.0 logits   1 test 2 / 1%,  3 tests 6 / 3%,  6 tests 13 / 8%
       skill gap 1.6 logits   1 test 5 / 3%,  3 tests 19 / 13%, 6 tests 38 / 28%
     (skills drawn from the 28 that appear on 8+ forms). When a top unit
     is named it is the planted one 61-99% of the time (domain) and
     24-87% (skill), rising with tests and gap size. Replication: the top
     named unit is still a lead once the next test is pooled in 50-99%
     (domain, gap 0.8-1.6) and 39-91% (skill); on the next test ALONE it
     is a lead only 2-36%, so one new test never confirms or clears a unit
     by itself. For a no-gap student a named top unit survives the next
     pooled test 31-65% of the time: survival is not proof.

     RECALIBRATED WITH FORM x DOMAIN OFFSETS (2026-09-26, after the audit;
     fix3-stats/roster.js + sweep.js). Rosters of 10 / 20 / 40 students, each
     a diagnostic then a practice test a week for 10 weeks, 30% of them
     with a planted domain gap (1.0 or 1.6 logits); offsets re-estimated
     every week from the whole roster (formDomainOffsets, the student
     included) and passed as opts.formOffsets. Models: the author's (item
     SD 0.35, guess 0.15), and the auditor's harsher truth (item SD 0.7,
     discrimination SD 0.3, guess 0.25, slips 3%) with a fixed form x
     domain effect SD 0 / 0.3 / 0.5 and with end-of-module rushing. 3,000-
     4,000 students per model x roster (2,100-2,800 without a gap).
     Domain lead 2.24 -> 2.35, clear 2.8 kept: with offsets the worst any-
     lead over every model, roster size and 1 / 3 / 6 / 10 tests is 9.3%
     (was 11.9% at 2.24) and the worst any-clear 3.1%.
       roster 20, offsets on (off):     any lead, worst of 1/3/6/10 tests   any clear
         author                          8.6% (9.8%)                        2.9% (3.1%)
         harsh, no form effect           7.7% (9.6%)                        1.9% (3.0%)
         harsh, form effect SD 0.3       8.0% (12.4%)                       2.4% (5.0%)
         harsh, form effect SD 0.5       7.8% (15.4%)                       2.4% (6.4%)
       (rosters 10 and 40 within 1.5 points of these). So the offsets bring
       a form effect of SD 0.5 back to the no-effect rates, and with no form
       effect they do no harm (author model power unchanged: 76.5 vs 76.6%).
       Power at 10 tests (planted domain a lead / clear): author gap 1.0
       76 / 64%, 1.6 94 / 93%; harsh 57 / 46%, 86 / 82%.
     The offsets must come from the WHOLE roster (student included): with
     each student left out of their own offsets these gates give a worst
     lead 11.2% and clear 3.8% (harsh, form SD 0.5); about 2.5 / 3.0 would
     be needed there. Without offsets at all the harsh form-effect rates
     above apply. The skill gates were already inside 10 / 5% with offsets
     (lead 7.4-10.0%, clear 2.9-4.6% over the same grid) and are kept.
     RE-CHECKED WITH THE HIERARCHICAL OFFSETS (audit 4, 2026-09-26;
     fix4-stats/lead-check.js, no-gap students, one look at 2 / 4 / 7 / 11
     tests, roster 20, 716-1,200 per model and roster kind): any domain
     lead 5.0-10.9%, any clear 1.0-3.4% across author / harsh / harshdom /
     dgp4 (one-tier offsets 5.8-10.8% / 1.3-3.9%), so 2.35 / 2.8 stay.
     WITHOUT offsets the audit-4 world (shared domain bias) reaches 26-29%
     lead and 13-15% clear by the eleventh test: skillEvidence has no
     fallback of its own (focusOf does, see there), so a page reading it
     with no offsets should say so. */
  var SKILL_EVIDENCE_GATES = {
    domain: { lead: 2.35, clear: 2.8 },   // lead was 2.24 (the report's single-test flag); recalibrated 2026-09-26, see below
    skill: { lead: 2.95, clear: 3.35 }
  };
  function skillEvidence(attempts, opts) {
    opts = opts || {};
    var grain = opts.grain === 'skill' ? 'skill' : 'domain';
    var gates = SKILL_EVIDENCE_GATES[grain];
    var zLead = typeof opts.zLead === 'number' ? opts.zLead : gates.lead;
    var zClear = typeof opts.zClear === 'number' ? opts.zClear : gates.clear;
    var minEx = typeof opts.minExcess === 'number' ? opts.minExcess : IRT_MIN_EXCESS;
    var list = byTime((attempts || []).filter(function (a) {
      return a && Array.isArray(a.items) && (opts.includeHardest || (a.testId !== HARDEST_TEST_ID && a.id !== HARDEST_TEST_ID));
    }));
    var units = {}, used = 0;
    list.forEach(function (a) {
      var r = attemptResiduals(a.items, grain, opts.minItems, opts.formOffsets, a.testId || a.id);
      if (!r) return;
      used++;
      Object.keys(r.units).forEach(function (k) {
        var x = r.units[k];
        var u = units[k] || (units[k] = { unit: k, sec: x.sec, dom: x.dom, n: 0, obs: 0, exp: 0, S: 0, V: 0, W: 0, perAttempt: [] });
        u.n += x.n; u.obs += x.obs; u.exp += x.exp; u.S += x.S; u.V += x.V; u.W += x.W;
        u.perAttempt.push({ k: used - 1, id: a.testId || a.id || null, at: a.at, n: x.n, obs: x.obs, exp: x.exp, S: x.S, V: x.V, W: x.W });
      });
    });
    var leads = [];
    Object.keys(units).forEach(function (k) {
      var u = units[k], sd = Math.sqrt(u.V);
      u.z = u.S / sd;
      u.lo = u.S - Z80 * sd; u.hi = u.S + Z80 * sd;
      u.gap = u.W > 0 ? u.S / u.W : 0;
      u.gapSE = u.W > 0 ? sd / u.W : null;
      u.lead = u.z > zLead && u.S >= minEx;
      u.clear = u.lead && u.z >= zClear;
      if (u.lead) leads.push(k);
    });
    leads.sort(function (a, b) { return units[b].z - units[a].z; });
    return { grain: grain, attempts: used, zLead: zLead, zClear: zClear, units: units, leads: leads, top: leads[0] || null };
  }

  /* -- THE PER-QUESTION RECORD AS ITEMS: itemsFromQStats ----------------
     One converter for every caller (portal Home, admin, the emails), so
     they all read a test the same way. qs is an attempt's QStats:
     { s: [section keys], k: ['Domain -> Skill' (a U+2192 arrow)],
       q: [[section, skill, difficulty 0-2, result 1 right / 0 wrong /
       2 blank, seconds, qid?, given?]] }.
     budgetSeconds(sec, dom, skill, diff), optional: the question's target
     time. When given, an answer under TOO_FAST_REL of it is tooFast (the
     report's reading floor, report.html TOO_FAST_BUDGET_REL) and is left
     out of the content test as the report leaves it out. Without it (Apps
     Script has no time budgets) nothing is tooFast.
     Tuple index 7 (2026-09-26), when present: the tooFast flag (1/0)
     written at scoring time with the student's accommodation multiplier.
     It wins over budgetSeconds, so Apps Script and the browser agree and
     extended-time students are judged against their own clock.
     Returns items for skillEvidence, or null when qs has no record. */
  var TOO_FAST_REL = 0.15;
  var QS_DIFF = ['easy', 'medium', 'hard'];
  /* trailingRush(rows): the end-of-module rush (audit 5, 2026-09-26). A
     student who races the last questions of a module answers them in 4-12
     seconds, often just over the 0.15 too-fast line, and those misses land
     on whatever the module ends with (Expression of Ideas in R&W), which
     was then named as a content gap: the simulated rusher had it named in
     5 of 7 runs. Direct evidence only: counting back from the end of each
     module, the unbroken run of answers each under RUSH_REL (0.35) of its
     budget, blanks passed over; the run counts when it holds 3+ answers,
     and then every answer in it is pace (right ones too, so the rule does
     not lean either way). An answer at a normal pace ends the run.
     THE CLOCK GATE (audit 7, 2026-09-26): a run counts only if its first
     answer started after RUSH_CLOCK_SHARE (85%) of the module's clock. With
     no gate the rule fired on fast, accurate finishers and on extended-time
     students using standard time (fast on the end-of-module Conventions
     questions 17% of R&W modules; double time used as single 15%), each
     dropping about 4 answers, 64% of them right. Gated: 0-1% in every
     model, with real rushes kept (9.8% -> 9.6% of R&W modules).
     audit7-stats/rushfp.js, 1,500 sittings per type.
     rows: [{ mod, blank, ms, budgetMs, moduleMs?, startMs? }] in test
     order. moduleMs is the module's clock; startMs when the answer's first
     look began, from the module's start. Without startMs the start is the
     time spent on the module's earlier questions (their ms), which is the
     first pass for a student working in order. Without moduleMs there is
     no gate. Returns an array of booleans, one per row. */
  var RUSH_REL = 0.35, RUSH_MIN_RUN = 3, RUSH_CLOCK_SHARE = 0.85;
  function trailingRush(rows) {
    var out = [], i, byMod = {};
    rows = rows || [];
    for (i = 0; i < rows.length; i++) {
      out.push(false);
      var m = rows[i] ? String(rows[i].mod) : '';
      (byMod[m] = byMod[m] || []).push(i);
    }
    Object.keys(byMod).forEach(function (m) {
      var idx = byMod[m], run = [];
      for (var k = idx.length - 1; k >= 0; k--) {
        var r = rows[idx[k]];
        if (!r || r.blank) continue;
        if (r.ms > 0 && r.budgetMs > 0 && r.ms < RUSH_REL * r.budgetMs) run.push(idx[k]);
        else break;
      }
      if (run.length < RUSH_MIN_RUN) return;
      var firstIdx = run[run.length - 1], first = rows[firstIdx];
      var clock = first && first.moduleMs > 0 ? first.moduleMs : 0;
      if (clock) {
        var start = (first && typeof first.startMs === 'number' && first.startMs >= 0) ? first.startMs : null;
        if (start === null) {
          start = 0;
          for (var q = 0; q < idx.length && idx[q] !== firstIdx; q++) {
            var e = rows[idx[q]];
            if (e && !e.blank && e.ms > 0) start += e.ms;
          }
        }
        if (start < RUSH_CLOCK_SHARE * clock) return;
      }
      run.forEach(function (j) { out[j] = true; });
    });
    return out;
  }
  function itemsFromQStats(qs, budgetSeconds) {
    if (!qs || !qs.q || !qs.q.length || !qs.s || !qs.k) return null;
    var out = [];
    for (var i = 0; i < qs.q.length; i++) {
      var r = qs.q[i];
      if (!r || r.length < 4) continue;
      var sec = String(qs.s[r[0]] || ''), sk = String(qs.k[r[1]] || '');
      var cut = sk.indexOf(' \u2192 ');
      var dom = cut >= 0 ? sk.slice(0, cut) : sk, skill = cut >= 0 ? sk.slice(cut + 3) : sk;
      var diff = QS_DIFF[r[2]] || 'medium', secs = Number(r[4]) || 0;
      var tooFast = false;
      if (r.length > 7 && (r[7] === 1 || r[7] === 0 || r[7] === true || r[7] === false)) {
        // Stored at scoring time with the student's time multiplier (2026-09-26).
        tooFast = r[3] !== 2 && (r[7] === 1 || r[7] === true);
      } else if (budgetSeconds && secs > 0 && r[3] !== 2) {
        var b = budgetSeconds(sec, dom, skill, diff);
        if (b > 0 && secs < TOO_FAST_REL * b) tooFast = true;
      }
      out.push({ sec: sec, dom: dom, skill: skill, diff: diff, ok: r[3] === 1, blank: r[3] === 2, tooFast: tooFast,
                 seconds: secs, qid: r.length > 5 ? r[5] : null, given: r.length > 6 ? r[6] : null });
    }
    return out.length ? out : null;
  }

  /* -- C. WHAT KEEPS COMING BACK, AND WHAT GOT FIXED: skillTrend --------
     From the per-attempt residuals of skillEvidence (same attempts, opts).
       keepsComingBack  the pooled deficit clears the lead gate AND the
                        unit ran below expectation (S > 0) on at least two
                        attempts, so one bad sitting cannot carry it.
       fixed            the deficit pooled over every attempt BEFORE the
                        latest cleared the lead gate, the unit had at least
                        4 usable questions on the latest attempt, and the
                        latest gap (S/W, logits) is smaller than the earlier
                        pooled gap by more than 1.645 standard errors of the
                        difference.
     Measured (sim-C-trend.js, 8,000 students per cell, real forms):
       no gap, 3 tests, domain (8 units): any "fixed" 4.5%, any "keeps
         coming back" 9.5% (4 tests 3.0 / 9.7%, 6 tests 2.5 / 10.6%);
         skill grain 3.1 / 4.1% (6 tests 1.3 / 4.7%).
       a real domain gap of 1.6 logits that stays: named "keeps coming
         back" 70 / 80 / 87% at 3 / 4 / 6 tests; wrongly "fixed" 5%.
       fixed on the latest test (gap 1.6 -> 0): named "fixed" 32 / 37 /
         40% at 3 / 4 / 6 tests (50-55% of those whose earlier deficit had
         been a lead); skill grain 5 / 7 / 9%. One test is a small sample of
         a unit, so "fixed" is rare by design; the pooled lead fading over
         later tests is the slower, surer sign.
     (Those figures are at the old domain lead gate 2.24. At 2.35, 2026-09-
     26, with no form offsets, the audit's a1-null.js, 2,100 no-gap
     students a cell: author model "keeps coming back" 6.8 / 8.3 / 9.4% at
     3 / 6 / 10 tests, "fixed" 3.6 / 2.0 / 1.6%; harsh model 9.3 / 11.8 /
     11.4% and 4.5 / 3.3 / 2.4%. Pass opts.formOffsets as for
     skillEvidence.)
     A deficit attempt is one with S >= 1 (TREND_DEFICIT_S): with S > 0 the
     second condition removed almost nothing (10.5% at 3 tests).
     TWO READS (audit 4, 2026-09-26; opts.twoReads, default true): both
     claims count only if they also hold on the history without the latest
     attempt (heldOnTwoReads' rule, same attempts less the newest), because
     every page re-reads them after every test. Family-wise over 10 weekly
     looks, no-gap students, hierarchical offsets (fix4-stats/focus-run.js,
     roster 20; n 1,200 author / harsh / harshdom, 1,055 dgp4; mixed
     rosters with 30% planted gaps n 716-844 in brackets):
                     keeps coming back          fixed
                     one read -> two reads      one read -> two reads
       skill grain   14.8-18.3 -> 6.8-9.9%      11.8-12.5 -> 0.2-1.0%
                     [17.2-20.3 -> 8.7-10.7%]   [10.2-13.3 -> 0.4-1.1%]
       domain grain  21.8-24.5 -> 12.1-14.4%    16.3-17.5 -> 0.7-1.1%
     (audit 4 measured 20% / 12% at skill grain before). A planted 1.0-1.6
     logit domain gap: its skills "keep coming back" 54-66% -> 44-57%,
     the domain 83-89% -> 77-85%. The skill-grain rate is still near 10%:
     pages that show skill-level trend claims should pass them through
     trendWithinFocus (below), which brings "keeps coming back" to 2.4-4.5%
     (mixed rosters 2.5-4.0%) and "fixed" to 0.0-0.1%.
     Returns { attempts, twoReads, units: { name: { sec, dom, lead,
       keepsComingBack, fixed, keepsComingBackNow, fixedNow (the full read
       alone), deficitAttempts, attempts, early: { n, S, V, W, gap, se, lead }
       | null, latest: { n, S, V, W, gap, se } | null, change, changeSE } },
       keepsComingBack: [names], fixed: [names], oneRead: { keepsComingBack,
       fixed } (the full read alone) }. twoReads: false gives the single
       read (no oneRead, no *Now fields). */
  var TREND_FIX_Z = 1.645, TREND_FIX_MIN_ITEMS = 4, TREND_MIN_DEFICIT_ATTEMPTS = 2, TREND_DEFICIT_S = 1.0;
  function skillTrend(attempts, opts) {
    opts = opts || {};
    if (opts.twoReads !== false) {
      // Both claims must also hold on the history without its latest
      // attempt (the same list skillEvidence would use, less the newest).
      var o1 = {}; Object.keys(opts).forEach(function (k) { o1[k] = opts[k]; });
      o1.twoReads = false;
      var usable = byTime((attempts || []).filter(function (a) {
        return a && Array.isArray(a.items) && (opts.includeHardest || (a.testId !== HARDEST_TEST_ID && a.id !== HARDEST_TEST_ID));
      }));
      var now = skillTrend(usable, o1);
      var before = usable.length ? skillTrend(usable.slice(0, usable.length - 1), o1) : null;
      var kcbPrev = {}, fixPrev = {};
      if (before) {
        before.keepsComingBack.forEach(function (k) { kcbPrev[k] = true; });
        before.fixed.forEach(function (k) { fixPrev[k] = true; });
      }
      now.twoReads = true;
      now.oneRead = { keepsComingBack: now.keepsComingBack, fixed: now.fixed };
      now.keepsComingBack = now.keepsComingBack.filter(function (k) { return kcbPrev[k]; });
      now.fixed = now.fixed.filter(function (k) { return fixPrev[k]; });
      Object.keys(now.units).forEach(function (k) {
        var u = now.units[k];
        u.keepsComingBackNow = u.keepsComingBack; u.fixedNow = u.fixed;
        u.keepsComingBack = !!(u.keepsComingBack && kcbPrev[k]);
        u.fixed = !!(u.fixed && fixPrev[k]);
      });
      return now;
    }
    var ev = skillEvidence(attempts, opts);
    var minEx = typeof opts.minExcess === 'number' ? opts.minExcess : IRT_MIN_EXCESS;
    // The latest USED attempt (attempts are taken oldest first).
    var latestK = ev.attempts - 1;
    var out = { attempts: ev.attempts, units: {}, keepsComingBack: [], fixed: [], twoReads: false };
    Object.keys(ev.units).forEach(function (k) {
      var u = ev.units[k];
      var deficit = u.perAttempt.filter(function (p) { return p.S >= TREND_DEFICIT_S; }).length;
      var early = null, latest = null;
      if (ev.attempts >= 2) {
        var e = { n: 0, S: 0, V: 0, W: 0 };
        u.perAttempt.forEach(function (p) {
          if (p.k === latestK) latest = { n: p.n, S: p.S, V: p.V, W: p.W };
          else { e.n += p.n; e.S += p.S; e.V += p.V; e.W += p.W; }
        });
        if (e.n > 0) {
          e.gap = e.W > 0 ? e.S / e.W : 0; e.se = e.W > 0 ? Math.sqrt(e.V) / e.W : Infinity;
          e.lead = (e.S / Math.sqrt(e.V)) > ev.zLead && e.S >= minEx;
          early = e;
        }
        if (latest) { latest.gap = latest.W > 0 ? latest.S / latest.W : 0; latest.se = latest.W > 0 ? Math.sqrt(latest.V) / latest.W : Infinity; }
      }
      var change = (early && latest) ? early.gap - latest.gap : null;
      var changeSE = (early && latest) ? Math.sqrt(early.se * early.se + latest.se * latest.se) : null;
      var fixed = !!(early && latest && early.lead && latest.n >= TREND_FIX_MIN_ITEMS && isFinite(changeSE) && change > TREND_FIX_Z * changeSE);
      var kcb = u.lead && deficit >= TREND_MIN_DEFICIT_ATTEMPTS;
      out.units[k] = { sec: u.sec, dom: u.dom, lead: u.lead, keepsComingBack: kcb, fixed: fixed, deficitAttempts: deficit, attempts: u.perAttempt.length,
                       early: early, latest: latest, change: change, changeSE: changeSE };
      if (kcb) out.keepsComingBack.push(k);
      if (fixed) out.fixed.push(k);
    });
    return out;
  }

  /* -- WHICH TESTS COUNT AS CONTENT EVIDENCE: evidenceAttempts -----------
     (2026-09-26, audit: the email, Home, the report and admin each built
     their own list and named different things for the same student 29-65%
     of the time.) ONE list for every consumer.
     entries: score-history-like objects { attemptId|id, testId, source
       ('diagnostic'|'practice-test'|'diagnostic-retake'|...), mode,
       testType, date|at, qStats, interrupted?, awayMin?, heldBack?,
       retake? }.
     Kept: full SAT sittings with a per-question record (qStats), the
       diagnostic included. Left out: section-only sittings (mode
       'section'), non-SAT tests (testType set and not 'SAT'), diagnostic
       retakes (source 'diagnostic-retake' or retake: true: the same
       questions again), entries with heldBack: true (not yet the
       student's), and the hardest test unless opts.includeHardest. The
       same attemptId twice (local and server copies) counts once.
     opts.budgetSeconds: passed to itemsFromQStats for records without the
       stored tooFast flag.
     Returns [{ id, attemptId, testId, source, at, items, interrupted }],
     oldest first, ready for skillEvidence / skillTrend / focusOf. testId
     is the entry's, or 'diagnostic' for a diagnostic without one (the
     form-offset key). */
  function evidenceAttempts(entries, opts) {
    opts = opts || {};
    var seen = {}, out = [];
    (entries || []).forEach(function (e) {
      if (!e || !e.qStats || e.mode === 'section') return;
      if (e.testType && String(e.testType).toUpperCase() !== 'SAT') return;
      if (e.source === 'diagnostic-retake' || e.retake === true || e.heldBack === true || e.source === 'baseline') return;
      var tid = e.testId || (e.source === 'diagnostic' ? 'diagnostic' : '');
      if (tid === HARDEST_TEST_ID && !opts.includeHardest) return;
      var aid = e.attemptId || e.id || '';
      if (aid) { if (seen[aid]) return; seen[aid] = true; }
      var items = itemsFromQStats(e.qStats, opts.budgetSeconds);
      if (!items) return;
      out.push({ id: aid || tid, attemptId: aid, testId: tid, source: e.source || null, at: e.date !== undefined ? e.date : e.at,
                 items: items, interrupted: interruptionKind(e) });
    });
    return byTime(out);
  }

  /* -- FORM x DOMAIN OFFSETS: formDomainOffsets -------------------------
     (2026-09-26, audit: a domain that runs harder on one form than its
     tags say reads as a gap for everyone who sits that form, pushing the
     domain lead to 12-19% and piling false flags onto particular forms.)
     rosterAttempts: attempts of the WHOLE roster in skillEvidence's shape
       ({ testId, items, studentId? }; evidenceAttempts output works).
     Per attempt, the domain residuals of the content test (ability
     estimated per attempt, so residuals within a section are relative);
     per key testId + '|' + domain, the raw offset is sum S / sum W (logits
     of extra difficulty; S = misses beyond expectation) with sampling
     variance sum V / (sum W)^2. Empirical-Bayes shrinkage toward 0: the
     spread of true offsets tau^2 is estimated across keys by the method
     of moments (mean of raw^2 minus sampling variance, floored at
     FORM_OFFSET_TAU2_MIN), and each key's offset is raw x tau^2 / (tau^2 +
     its variance): with few takers it is close to 0.
     opts.exclude(attempt) -> true leaves an attempt out (use it to leave
       the student being judged out of their own offsets).
     opts.minTakers (default 2): keys with fewer attempts get no offset.
     Returns { key: offset } (positive = that domain ran harder on that
     form). Pass as opts.formOffsets to skillEvidence / skillTrend /
     focusOf. The hardest test is kept (it has its own key).

     HIERARCHICAL (audit 4, 2026-09-26). A domain that runs harder than its
     tags say on EVERY form (a shared per-domain bias: the tag spacing, the
     domain's item mix) was not absorbed: each form's offset was shrunk
     toward 0, the student's own form often had too few takers to carry
     one, and a form nobody else had taken got nothing. Now two tiers:
       '*|' + domain      the roster-wide domain term: sum S / sum W over
                          every attempt (the all-hard test left out),
                          shrunk toward 0 the same empirical-Bayes way
                          across domains;
       testId + '|' + d   that term plus the form's own deviation from it,
                          shrunk toward the domain term (not toward 0).
     skillEvidence / skillTrend / focusOf use the form's key when present,
     else the domain term, so a form with no takers still gets the
     domain-wide correction. Offsets stored before this change have no
     '*|' keys and read exactly as they did. opts.hierarchical = false
     gives the old one-tier map (simulation only). What the domain term
     means for a real gap: a weakness EVERY student on the roster shares is
     read as the domain running hard, so the gap named is "weaker here than
     the roster", not "weaker than the tags say".
     Measured (fix4-stats/focus-run.js + score-focus.js; roster 20, a
     diagnostic then a practice test a week, offsets re-estimated every
     look from the whole roster; 1,200 no-gap students per model, 1,046
     for dgp4; models: author = item SD 0.35, guess 0.15; harsh = item SD
     0.7, a SD 0.3, form x domain SD 0.3, guess 0.25, slips 3%; harshdom =
     harsh plus a shared per-domain bias SD 0.2; dgp4 = audit 4's 3PL with
     tag spacing not the analysis's, shared domain bias SD 0.2, form x
     domain SD 0.15, missing and interrupted sittings). Any named domain
     over 10 looks at focusOf's gate, old one-tier -> hierarchical:
     author 4.9 -> 3.8%, harsh 3.1 -> 2.7%, harshdom 4.8 -> 3.8%, dgp4
     5.9 -> 3.6% (at the old 2.8 gate; focusOf's own table has the gate
     now used). With NO offsets at all the same students see 5.3 / 7.3 /
     13.2 / 15.8%. */
  var FORM_OFFSET_TAU2_MIN = 0.0025;   // a floor of SD 0.05 logits, so one quiet roster never switches the offsets off
  // Empirical-Bayes shrinkage of raw estimates { raw, se2 } toward `centre`
  // (a function of the entry): tau^2 by the method of moments, floored.
  function ebShrink(list, centre) {
    if (!list.length) return;
    var m = 0;
    list.forEach(function (x) { var d = x.raw - centre(x); m += d * d - x.se2; });
    var tau2 = Math.max(FORM_OFFSET_TAU2_MIN, m / list.length);
    list.forEach(function (x) { var c = centre(x); x.est = c + (x.raw - c) * tau2 / (tau2 + x.se2); });
    return tau2;
  }
  function formDomainOffsets(rosterAttempts, opts) {
    opts = opts || {};
    var minT = typeof opts.minTakers === 'number' ? opts.minTakers : 2;
    var hier = opts.hierarchical !== false;
    var acc = {}, dom = {};
    (rosterAttempts || []).forEach(function (a) {
      if (!a || !Array.isArray(a.items) || !(a.testId || a.id)) return;
      if (typeof opts.exclude === 'function' && opts.exclude(a)) return;
      var r = attemptResiduals(a.items, 'domain');
      if (!r) return;
      var tid = a.testId || a.id;
      Object.keys(r.units).forEach(function (d) {
        var u = r.units[d], k = tid + '|' + d;
        var x = acc[k] || (acc[k] = { S: 0, W: 0, V: 0, n: 0, d: d });
        x.S += u.S; x.W += u.W; x.V += u.V; x.n++;
        // The all-hard test keeps its own keys but stays out of the
        // domain-wide term (nothing on it is easy or medium).
        if (tid === HARDEST_TEST_ID) return;
        var y = dom[d] || (dom[d] = { S: 0, W: 0, V: 0, n: 0 });
        y.S += u.S; y.W += u.W; y.V += u.V; y.n++;
      });
    });
    var out = {};
    var est = function (x) { x.raw = x.S / x.W; x.se2 = x.V / (x.W * x.W); return x; };
    // Tier 1: one offset per domain for the whole roster, shrunk toward 0.
    var md = {};
    if (hier) {
      var dl = Object.keys(dom).filter(function (d) { return dom[d].n >= minT && dom[d].W > 0; })
        .map(function (d) { var x = est(dom[d]); x.d = d; return x; });
      ebShrink(dl, function () { return 0; });
      dl.forEach(function (x) { md[x.d] = x.est; out['*|' + x.d] = x.est; });
    }
    // Tier 2: each form's deviation from its domain's term, shrunk toward
    // that term (toward 0 with hierarchical: false, the pre-audit-4 rule).
    var kl = Object.keys(acc).filter(function (k) { return acc[k].n >= minT && acc[k].W > 0; })
      .map(function (k) { var x = est(acc[k]); x.k = k; return x; });
    ebShrink(kl, function (x) { return md[x.d] || 0; });
    kl.forEach(function (x) { out[x.k] = x.est; });
    return out;
  }

  /* -- ONE VERDICT FOR EVERY CONSUMER: focusOf ---------------------------
     (2026-09-26.) The email's "current focus", Home's weak skill per
     section, the report's cross-test line and admin all read THIS.
     attempts: evidenceAttempts output (oldest first). opts.formOffsets
       (formDomainOffsets), opts.includeHardest, opts.twoReads (default
       true; false only for simulation), opts.domainClear (default 2.9),
       opts.skillLead (default 3.35), opts.noOffsetsPenalty (default 0.6).
     Per section:
       domain  named when it CLEARS at domain grain (z >= the domain clear
               gate, S >= 1.5) on the full history AND on the history
               without its latest test (two reads); the highest z of those.
       skill   with a domain named: the skill inside it with the largest
               excess S (> 0), even if that skill alone clears nothing.
               With no domain named: a skill only if it passes the SKILL
               LEAD gate on both reads (the highest z of those).
     Returns { tests, bySection: { 'reading-writing': S, math: S }, top,
       offsets: 'roster'|'form-only'|'none', gates: { domainClear, skillLead } }
       S = { domain: name|null, domainZ, skill: name|null, skillZ,
             detail: { n, obs, S } | null }  (detail of the skill if named,
             else of the domain; obs = questions right, S = missed beyond
             expectation)
       top = { section, domain, z, skill } for the named domain with the
             largest z across sections (the parent email's line), or null.
     One test can never name anything (there is no second read).
     (The fix3 table that stood here, 4.1-4.4% domain / 17.6-20.9% skill,
     was at skill lead 2.95 with one-tier offsets; superseded below.)

     RECALIBRATED AFTER AUDIT 4 (2026-09-26). Gates: domain clear 2.9
     (FOCUS_DOMAIN_CLEAR; was the skillEvidence clear gate 2.8), skill lead
     3.35 (FOCUS_SKILL_LEAD, what every consumer already passes). Offsets:
     the hierarchical formDomainOffsets. The real focusOf, family-wise over
     10 weekly looks (fix4-stats/focus-direct4.js; roster 20, offsets
     re-estimated every look; models as formDomainOffsets' note):
                        no-gap roster                 30% of roster with a gap
                        any domain   any skill        any domain   any skill
       author            3.7%        10.6% (n 1200)   2.8%         9.1% (n 860)
       harsh             2.7%         9.0% (n 1200)   3.0%         9.3% (n 860)
       harshdom          3.0%         8.7% (n 1200)   2.8%        10.2% (n 860)
       dgp4              4.2%         9.7% (n 1047)   3.6%        10.3% (n 726)
     dgp4 at roster 5 / 10 / 40: 2.1 / 2.9 / 3.3% domain, 7.5 / 8.5 / 8.2%
     skill (n 1039-1070). Before (one-tier offsets, clear 2.8, skill 3.35;
     score-focus.js on the same records): domain 4.9 / 3.1 / 4.8 / 5.9%,
     skill 12.8 / 10.2 / 10.8 / 11.6%. So the domain target (about 4%) is
     met in every model; the skill line is about 10% (8.7-10.6%), not
     under it: 3.5 would give 5.7-10.0% (mixed rosters), at a cost to
     skill naming inside real gaps; left at 3.35.
     Power, planted domain named in its section by the tenth look (about
     170 students per cell, so +/- 4 points): gap 1.0 logit author 58%,
     harsh 36%, harshdom 38%, dgp4 48%; gap 1.6: 90 / 75 / 77 / 92%.
     Before: 60 / 38 / 40 / 56% and 88 / 78 / 79 / 93% (the 2.9 gate costs
     2-8 points at gap 1.0, nothing measurable at 1.6).
     NO OFFSETS YET (the first days after deploy, or a caller with none):
     with no roster-wide domain term in opts.formOffsets (undefined, or a
     map from before 2026-09-26 without '*|' keys), both gates are raised
     by FOCUS_NO_OFFSETS_PENALTY (0.6: domain 3.5, skill 3.95;
     opts.noOffsetsPenalty overrides). Without it a no-gap student saw a
     named domain 3.9 / 5.8 / 10.9 / 12.7% (author / harsh / harshdom /
     dgp4, clear 2.9) and a skill 12.5 / 13.3 / 18.4 / 20.1%. With it
     (focus-direct4.js): domain 0.8 / 0.8 / 3.5 / 4.6%, skill 2.8 / 2.2 /
     5.3 / 6.7% (no-gap rosters; mixed 0.6 / 0.8 / 2.1 / 4.5%); power at
     gap 1.0 falls to 48 / 27 / 28 / 38%, at 1.6 to 87 / 68 / 70 / 87%.
     res.offsets says which applied ('roster' | 'form-only' | 'none') and
     res.gates the gates used. */
  var FOCUS_DOMAIN_CLEAR = 2.9;        // 2026-09-26: any named domain 2.7-4.2% over 10 looks, 4 models (n 726-1,200 each); was 2.8; table above
  var FOCUS_SKILL_LEAD = 3.35;         // what every consumer passes (HOME_SKILL_LEAD, FOCUS_SKILL_LEAD_); any named skill 8.7-10.6% (same n); was 2.95
  var FOCUS_NO_OFFSETS_PENALTY = 0.6;  // 2026-09-26: with no domain-wide term, domain 0.6-4.6% / skill 2.0-6.7% (without it up to 12.7 / 20.1%); table above
  // Do these offsets carry the roster-wide domain term (formDomainOffsets since audit 4)?
  function hasDomainTerm(fo) {
    if (!fo || typeof fo !== 'object') return false;
    for (var k in fo) if (Object.prototype.hasOwnProperty.call(fo, k) && k.indexOf('*|') === 0) return true;
    return false;
  }
  function focusOf(attempts, opts) {
    opts = opts || {};
    var list = byTime((attempts || []).filter(function (a) { return a && Array.isArray(a.items); }));
    var base = { formOffsets: opts.formOffsets, includeHardest: opts.includeHardest };
    var offsetsMode = hasDomainTerm(opts.formOffsets) ? 'roster' : (opts.formOffsets && typeof opts.formOffsets === 'object' && Object.keys(opts.formOffsets).length ? 'form-only' : 'none');
    var pen = offsetsMode === 'roster' ? 0 : (typeof opts.noOffsetsPenalty === 'number' ? opts.noOffsetsPenalty : FOCUS_NO_OFFSETS_PENALTY);
    var dGate = (typeof opts.domainClear === 'number' ? opts.domainClear : FOCUS_DOMAIN_CLEAR) + pen;
    var sGate = (typeof opts.skillLead === 'number' ? opts.skillLead : FOCUS_SKILL_LEAD) + pen;
    var read = function (atts) {
      var d = skillEvidence(atts, { grain: 'domain', formOffsets: base.formOffsets, includeHardest: base.includeHardest, zLead: Math.min(dGate, SKILL_EVIDENCE_GATES.domain.lead), zClear: dGate });
      var sk = skillEvidence(atts, { grain: 'skill', formOffsets: base.formOffsets, includeHardest: base.includeHardest, zLead: sGate });
      return { d: d, s: sk };
    };
    var full = read(list);
    var twoReads = opts.twoReads !== false;
    var prev = (twoReads && list.length) ? read(list.slice(0, list.length - 1)) : null;
    var res = { tests: full.d.attempts, bySection: {}, top: null, offsets: offsetsMode, gates: { domainClear: dGate, skillLead: sGate } };
    ['reading-writing', 'math'].forEach(function (sec) {
      var S = { domain: null, domainZ: null, skill: null, skillZ: null, detail: null };
      var clearIn = function (r, k) { var u = r && r.d.units[k]; return !!(u && u.sec === sec && u.clear); };
      var doms = Object.keys(full.d.units).filter(function (k) { return clearIn(full, k) && (!twoReads || clearIn(prev, k)); })
        .sort(function (a, b) { return full.d.units[b].z - full.d.units[a].z; });
      if (doms.length) {
        var du = full.d.units[doms[0]];
        S.domain = doms[0]; S.domainZ = du.z;
        var best = null;
        Object.keys(full.s.units).forEach(function (k) {
          var u = full.s.units[k];
          if (u.sec !== sec || u.dom !== S.domain || !(u.S > 0)) return;
          if (!best || u.S > best.S) best = u;
        });
        if (best) { S.skill = best.unit; S.skillZ = best.z; S.detail = { n: best.n, obs: best.obs, S: best.S }; }
        else S.detail = { n: du.n, obs: du.obs, S: du.S };
      } else {
        var leadIn = function (r, k) { var u = r && r.s.units[k]; return !!(u && u.sec === sec && u.lead); };
        var sks = Object.keys(full.s.units).filter(function (k) { return leadIn(full, k) && (!twoReads || leadIn(prev, k)); })
          .sort(function (a, b) { return full.s.units[b].z - full.s.units[a].z; });
        if (sks.length) { var su = full.s.units[sks[0]]; S.skill = sks[0]; S.skillZ = su.z; S.detail = { n: su.n, obs: su.obs, S: su.S }; }
      }
      res.bySection[sec] = S;
      if (S.domain && (!res.top || S.domainZ > res.top.z)) res.top = { section: sec, domain: S.domain, z: S.domainZ, skill: S.skill };
    });
    return res;
  }

  /* -- trendWithinFocus(trend, focus) (2026-09-26, audit 4) ---------------
     skillTrend's claims kept only where focusOf backs them: a unit stays in
     keepsComingBack / fixed only when focusOf names something in the unit's
     section AND the unit is the named domain, the named skill, or a skill
     inside the named domain. So a page never says a skill "keeps coming
     back" in a section where the focus line says nothing stands out.
     trend: skillTrend output (any grain); focus: focusOf output for the SAME
     attempts and offsets. Returns a shallow copy of trend with filtered
     keepsComingBack / fixed and suppressed: { keepsComingBack, fixed } (what
     was dropped). Measured with skillTrend's table: skill-grain "keeps
     coming back" 2.4-4.5% of no-gap students over 10 looks, "fixed"
     0.0-0.1%; a planted gap's skills still 40-53%. */
  function trendWithinFocus(trend, focus) {
    if (!trend) return trend;
    var out = {}, drop = { keepsComingBack: [], fixed: [] };
    Object.keys(trend).forEach(function (k) { out[k] = trend[k]; });
    // Is this unit what focusOf names in its section (the named domain, the
    // named skill, or a skill inside the named domain)?
    var inFocus = function (name) {
      var u = trend.units && trend.units[name];
      var f = u && focus && focus.bySection ? focus.bySection[u.sec] : null;
      if (!f || !(f.domain || f.skill)) return false;
      return name === f.domain || name === f.skill || (!!f.domain && u.dom === f.domain);
    };
    /* "Keeps coming back" only INSIDE the named focus; "fixed" only OUTSIDE
       it. Audit 5 (2026-09-26): with both kept inside, a skill weak on five
       tests and strong on the last three was named "below your level" on
       Home and "you have fixed this" beside it in 64 of 200 runs. "Fixed"
       already needs two reads (0.2-1.1% of no-change students over ten
       looks), so it needs no focus to back it, only no focus against it. */
    out.keepsComingBack = (trend.keepsComingBack || []).filter(function (n) { if (inFocus(n)) return true; drop.keepsComingBack.push(n); return false; });
    out.fixed = (trend.fixed || []).filter(function (n) { if (!inFocus(n)) return true; drop.fixed.push(n); return false; });
    out.suppressed = drop;
    return out;
  }

  /* -- H. POOLED PACING HABITS: pacingHabits (2026-09-26, audit 7) --------
     The report judges pace one test at a time; this asks whether the same
     pacing problem comes back test after test. Read from the per-question
     record: [8] the module (0/1) and [9] a pace code written at scoring time
     (2 in an end-of-module rush, trailingRush, however fast; 1 too fast to
     have read it elsewhere, under 0.15x the question's standard-time
     budget; 3 a time sink, 1.5x budget or more of total time; 0 an ordinary
     pace; null blank or untimed). Records saved before these fields carry
     no module or code: they count toward neither habit (audit 7: counted
     in the denominator, three old tests hid a real habit on four new ones).
     Which sittings: any timed sitting with a record (full tests, the
     diagnostic, a section on its own), never the hardest test (it runs
     every student short by design), a diagnostic retake, or a sitting set
     aside as interrupted. The last `last` (default 8) of them.
     Habits, each on two reads (with and without the newest sitting):
       runs-short  one module (say Math, Module 2) ends with 2+ questions
                   never answered, or in an end-of-module rush, on more
                   sittings than chance: hits significantly above 1 in 4
                   (one-sided binomial, p < .05; 3 of 3, 4 of 4, 4 of 5, 4
                   of 6, 5 of 7, 5 of 8). With the time sinks earlier in
                   those same modules, where the time went, and their area.
                   Audit 7 (audit7-stats/pace2.js, 1,500 students per model,
                   12 weekly looks): a module that truly runs short under 1
                   time in 3 was flagged 0.8-17.3% under the old 2/3 share
                   (86% of flags at the fourth test, where "3 of 4 now, 2 of
                   3 before" is just "3 of 4"). This code with the clock-gated
                   rush (audit7-stats/ship-verify.js, 800 students per
                   model): 0.0-0.8%, and a module short half the time or
                   more is caught 62-86% (was 58-82%).
       too-fast    6+ answers under the reading floor in a sitting (scaled
                   to the sitting's length), on 2/3 of 3+ sittings, AND the
                   pooled fast answers less accurate than the student's
                   other answers (one-sided z >= 1.645). The count alone was
                   a speed detector: fast students whose fast answers land
                   were flagged 9-16%, double time used as single 60%. This
                   code, same run: 0.0-1.3% in most models, 2.0-3.0% in the
                   harshest two; skimming 5 / 8 / 12% of answers caught 47 /
                   97.5 / 99.9%. The real
                   calibration agrees: 33% right under 0.08x, 65-79% at an
                   ordinary pace.
     Time sinks are not a habit of their own: at a median 0.66x budget with
     real spread, 13-15% of anyone's answers pass 1.5x, so a count bar would
     name nearly everyone. They matter when the module then runs short.
     Returns { tests, withModules, withCodes, need, habits, pending }. */
  var PACE_MIN_TESTS = 3, PACE_SHARE = 2 / 3, PACE_END_BLANKS = 2, PACE_FAST_PER_TEST = 6, PACE_FULL_TEST_Q = 98;
  var PACE_BASE_SHORT = 0.25, PACE_ALPHA = 0.05, PACE_FAST_Z = 1.645;
  function qsOf(x) {
    if (!x) return null;
    if (typeof x === 'string') { try { x = JSON.parse(x); } catch (e) { return null; } }
    return (x && x.q && x.q.length && x.s && x.k) ? x : null;
  }
  function splitKey(sk) {
    sk = String(sk || '');
    var cut = sk.indexOf(' \u2192 ');
    return cut >= 0 ? { dom: sk.slice(0, cut), skill: sk.slice(cut + 3) } : { dom: sk, skill: sk };
  }
  // The fewest hits of n that are significantly more than PACE_BASE_SHORT
  // (one-sided binomial tail under PACE_ALPHA).
  function paceHitsNeeded(n) {
    var p = PACE_BASE_SHORT, tail = 0;
    var pmf = function (k) {
      var c = 1;
      for (var j = 1; j <= k; j++) c = c * (n - k + j) / j;
      return c * Math.pow(p, k) * Math.pow(1 - p, n - k);
    };
    for (var h = n; h >= 0; h--) {
      tail += pmf(h);
      if (tail >= PACE_ALPHA) return h + 1;
    }
    return 0;
  }
  function paceEligible(e) {
    if (!e || e.testId === HARDEST_TEST_ID || e.source === 'diagnostic-retake') return false;
    if (isInterruptedForTrend(e)) return false;
    return !!qsOf(e.qStats);
  }
  function paceSitting(e) {
    var qs = qsOf(e.qStats), mods = {}, hasMod = false, hasCode = false;
    var fast = 0, fastOk = 0, otherN = 0, otherOk = 0, answered = 0;
    qs.q.forEach(function (r) {
      if (!r || r.length < 4) return;
      var mod = (r.length > 8 && (r[8] === 0 || r[8] === 1)) ? r[8] : null;
      var code = (r.length > 9 && typeof r[9] === 'number') ? r[9] : null;
      var blank = r[3] === 2;
      if (mod !== null) hasMod = true;
      if (code !== null) hasCode = true;
      if (!blank) {
        answered++;
        if (code === 1) { fast++; if (r[3] === 1) fastOk++; }
        else if (code === 0 || code === 3) { otherN++; if (r[3] === 1) otherOk++; }
      }
      if (mod === null) return;
      var mk = (secKeyOf(String(qs.s[r[0]] || '')) || 'other') + '|' + mod;
      (mods[mk] = mods[mk] || []).push({ blank: blank, rush: code === 2, sink: !blank && code === 3, dom: splitKey(qs.k[r[1]]).dom });
    });
    var ends = {};
    Object.keys(mods).forEach(function (mk) {
      var rows = mods[mk], blanks = 0, rush = 0, sinkN = 0, sinkDomM = {}, k = rows.length - 1;
      while (k >= 0 && rows[k].blank) { blanks++; k--; }
      rows.forEach(function (x) {
        if (x.rush) rush++;
        if (x.sink) { sinkN++; sinkDomM[x.dom] = (sinkDomM[x.dom] || 0) + 1; }
      });
      ends[mk] = { blanks: blanks, rush: rush, sinks: sinkN, sinkDom: sinkDomM, short: blanks >= PACE_END_BLANKS || rush >= 3 };
    });
    return { at: msOf(e.at || e.date), hasMod: hasMod, hasCode: hasCode, fast: fast, fastOk: fastOk, otherN: otherN, otherOk: otherOk,
             answered: answered, questions: qs.q.length, ends: ends };
  }
  function paceRead(S) {
    var out = [], mks = {};
    S.forEach(function (x) { Object.keys(x.ends).forEach(function (mk) { mks[mk] = true; }); });
    Object.keys(mks).sort().forEach(function (mk) {
      var have = S.filter(function (x) { return x.ends[mk]; });
      var hit = have.filter(function (x) { return x.ends[mk].short; });
      if (have.length < PACE_MIN_TESTS || hit.length < paceHitsNeeded(have.length)) return;
      var p = mk.split('|'), dom = {};
      hit.forEach(function (x) { Object.keys(x.ends[mk].sinkDom).forEach(function (d) { dom[d] = (dom[d] || 0) + x.ends[mk].sinkDom[d]; }); });
      var top = Object.keys(dom).sort(function (a, b) { return dom[b] - dom[a] || (a < b ? -1 : 1); })[0] || null;
      out.push({ id: 'runs-short', key: 'runs-short|' + mk, sec: p[0], module: Number(p[1]) + 1, hit: hit.length, of: have.length,
                 blanks: hit.reduce(function (a, x) { return a + x.ends[mk].blanks; }, 0),
                 rushed: hit.reduce(function (a, x) { return a + x.ends[mk].rush; }, 0),
                 sinks: hit.reduce(function (a, x) { return a + x.ends[mk].sinks; }, 0), sinksWhere: top, sinksWhereN: top ? dom[top] : 0 });
    });
    // Too fast: only sittings that carry pace codes can show it.
    var coded = S.filter(function (x) { return x.hasCode && x.answered > 0; });
    var fastHit = coded.filter(function (x) {
      return x.fast >= Math.max(3, Math.ceil(PACE_FAST_PER_TEST * x.questions / PACE_FULL_TEST_Q));
    });
    if (coded.length >= PACE_MIN_TESTS && fastHit.length >= PACE_SHARE * coded.length) {
      var fN = 0, fOk = 0, oN = 0, oOk = 0;
      coded.forEach(function (x) { fN += x.fast; fOk += x.fastOk; oN += x.otherN; oOk += x.otherOk; });
      var pF = fN ? fOk / fN : 0, pO = oN ? oOk / oN : 0, pAll = (fN + oN) ? (fOk + oOk) / (fN + oN) : 0;
      var se = Math.sqrt(pAll * (1 - pAll) * ((fN ? 1 / fN : 0) + (oN ? 1 / oN : 0)));
      var z = se > 0 ? (pO - pF) / se : 0;
      if (fN && oN && z >= PACE_FAST_Z) {
        out.push({ id: 'too-fast', key: 'too-fast', hit: fastHit.length, of: coded.length, answers: fN,
                   fastRight: fOk, otherRight: oOk, other: oN });
      }
    }
    return out;
  }
  function pacingHabits(entries, cfg) {
    var last = (cfg && cfg.last > 0) ? cfg.last : 8;
    var all = byTime((entries || []).filter(paceEligible).map(paceSitting).filter(function (x) { return isFinite(x.at); }));
    var S = all.slice(-last), before = all.slice(-last - 1, -1);
    var now = paceRead(S);
    var twoReads = !(cfg && cfg.twoReads === false);
    var prevKeys = {};
    if (twoReads) paceRead(before).forEach(function (h) { prevKeys[h.key] = true; });
    var habits = [], pending = [];
    now.forEach(function (h) { (!twoReads || prevKeys[h.key] ? habits : pending).push(h); });
    return { tests: S.length, withModules: S.filter(function (x) { return x.hasMod; }).length,
             withCodes: S.filter(function (x) { return x.hasCode; }).length, need: PACE_MIN_TESTS,
             habits: habits, pending: pending };
  }

  /* -- I. HOW THE MISSES HAPPEN, AREA BY AREA: missProfile (2026-09-26) ---
     Counts, not verdicts: for every missed question on the last `last`
     (default 8, as pacingHabits) sittings that count as content evidence
     (the same exclusions as pacingHabits, and no section-only sittings),
     how it was missed, per area and per skill:
       blank     never answered
       fast      answered too fast to have read it (pace code 1, or [7])
       rush      in an end-of-module rush (pace code 2)
       sink      worked 1.5x budget or more and still wrong (pace code 3)
       worked    an ordinary pace and wrong
       unknown   an old record with no timing flags, and no budgetSeconds
                 (cfg) to work them out: not called "worked" (audit 7)
     and from the attempt's behaviour summary (SignalsJSON), per skill:
       near      wrong with the choice down to two (nearBySkill, summaries
                 from 2026-09-26 on)
       keyOut    wrong with the right answer crossed out at some point
     near and keyOut overlap the pace kinds; they are "of which".
     Per area also: questions, answered, and excluded (answers of any
     result that were too fast or rushed, so left out of the content
     evidence): when excluded passes a third of answered, the area cannot be
     judged from these tests (audit 7: a rusher's Expression of Ideas gap was
     found 6.6% of the time, 57% of its answers excluded).
     qb: Question Bank events [{ q, sk, c, cf, at }] (PracticeLog): first
     tries only, per skill: first, wrong, and the confidence taps
     (cf 2 sure / 1 unsure / 0 guessing): sure, sureWrong. Mapped to areas
     through the skills the tests carry.
     cfg.budgetSeconds(sec, dom, skill, diff) -> seconds: classifies old
     records' misses (fast under 0.15x, sink at 1.5x, else worked).
     Returns { tests, overall, byDomain: { dom: { ..., bySkill } }, qbUnmapped }. */
  function missCounts() { return { misses: 0, blank: 0, fast: 0, rush: 0, sink: 0, worked: 0, unknown: 0, near: 0, keyOut: 0,
                                   questions: 0, answered: 0, excluded: 0, qb: { first: 0, wrong: 0, sure: 0, sureWrong: 0 } }; }
  function missProfile(entries, qbEvents, cfg) {
    var overall = missCounts(), byDomain = {}, skillDom = {}, tests = 0;
    var last = (cfg && cfg.last > 0) ? cfg.last : 8;
    var budget = cfg && typeof cfg.budgetSeconds === 'function' ? cfg.budgetSeconds : null;
    var cell = function (dom, skill) {
      var d = byDomain[dom] || (byDomain[dom] = missCounts());
      if (!d.bySkill) d.bySkill = {};
      var k = d.bySkill[skill] || (d.bySkill[skill] = missCounts());
      return [overall, d, k];
    };
    var bump = function (cells, f, n) { cells.forEach(function (c) { c[f] += (n === undefined ? 1 : n); }); };
    var used = byTime((entries || []).filter(function (e) { return paceEligible(e) && e.mode !== 'section'; })
      .map(function (e) { return { at: e.at || e.date, e: e }; })).slice(-last).map(function (w) { return w.e; });
    used.forEach(function (e) {
      var qs = qsOf(e.qStats);
      tests++;
      qs.q.forEach(function (r) {
        if (!r || r.length < 4) return;
        var sk = splitKey(qs.k[r[1]]), sec = String(qs.s[r[0]] || '');
        skillDom[sk.skill] = sk.dom;
        var cells = cell(sk.dom, sk.skill), code = (r.length > 9 && typeof r[9] === 'number') ? r[9] : null;
        var blank = r[3] === 2, kind = null;
        if (!blank) {
          if (code !== null) kind = code === 1 ? 'fast' : code === 2 ? 'rush' : code === 3 ? 'sink' : 'worked';
          else if (r.length > 7 && (r[7] === 1 || r[7] === 0)) kind = r[7] === 1 ? 'fast' : 'worked';
          else if (budget) {
            var b = Number(budget(sec, sk.dom, sk.skill, QS_DIFF[r[2]] || 'medium')) || 0, secs = Number(r[4]) || 0;
            kind = !(b > 0 && secs > 0) ? 'unknown' : secs < TOO_FAST_REL * b ? 'fast' : secs >= 1.5 * b ? 'sink' : 'worked';
          } else kind = 'unknown';
        }
        bump(cells, 'questions');
        if (!blank) bump(cells, 'answered');
        if (kind === 'fast' || kind === 'rush') bump(cells, 'excluded');
        if (r[3] === 1) return;
        bump(cells, 'misses');
        bump(cells, blank ? 'blank' : kind);
      });
      var sig = e.signals;
      if (typeof sig === 'string') { try { sig = JSON.parse(sig); } catch (err) { sig = null; } }
      if (sig && sig.v === 1) {
        [['near', sig.nearBySkill], ['keyOut', sig.keyOutBySkill]].forEach(function (pair) {
          var m = pair[1] || {};
          Object.keys(m).forEach(function (skill) {
            var n = Number(m[skill]) || 0;
            if (n > 0 && skillDom[skill] !== undefined) bump(cell(skillDom[skill], skill), pair[0], n);
          });
        });
      }
    });
    // Question Bank: the first try at each question only.
    var seen = {}, unmapped = 0;
    byTime((qbEvents || []).filter(function (x) { return x && x.q && x.sk; })).forEach(function (x) {
      if (x.b === 'explain' || seen[x.q]) return;
      seen[x.q] = true;
      var dom = skillDom[x.sk];
      if (dom === undefined) { unmapped++; return; }
      cell(dom, x.sk).forEach(function (c) {
        c.qb.first++;
        if (!(x.c === 1 || x.c === true)) c.qb.wrong++;
        if (Number(x.cf) === 2) { c.qb.sure++; if (!(x.c === 1 || x.c === true)) c.qb.sureWrong++; }
      });
    });
    return { tests: tests, overall: overall, byDomain: byDomain, qbUnmapped: unmapped };
  }

  /* -- betaInterval: the Jeffreys interval ------------------------------
     k successes in n; central `level` (default 0.80) interval of the
     Beta(k + 1/2, n - k + 1/2) posterior. Jeffreys because it is the
     standard noninformative prior for a proportion, its equal-tailed
     interval covers close to nominal even at small n (Brown, Cai and
     DasGupta 2001), and it pulls nothing toward any other number the page
     shows, so an accuracy and the residual test beside it never share an
     input. Exact binomial coverage of the 80% interval (sim-B-beta.js),
     averaged over true rates 0.05-0.95: 81.1 / 79.6 / 79.1 / 79.9% at n =
     5 / 10 / 20 / 50 (pointwise it swings 60-94%, as every interval for
     a count does). Returns { mean, lo, hi, a, b }; with n = 0, { mean: null, lo: 0,
     hi: 1 }. */
  function betaInterval(k, n, level, prior) {
    k = Math.max(0, num(k)); n = Math.max(0, num(n));
    if (k > n) k = n;
    level = (level > 0 && level < 1) ? level : 0.80;
    var pa = (prior && prior.a > 0) ? prior.a : 0.5, pb = (prior && prior.b > 0) ? prior.b : 0.5;
    if (!(n > 0)) return { mean: null, lo: 0, hi: 1, a: pa, b: pb };
    var a = pa + k, b = pb + n - k, t = (1 - level) / 2;
    return { mean: a / (a + b), lo: k === 0 ? 0 : betaQuantile(t, a, b), hi: k === n ? 1 : betaQuantile(1 - t, a, b), a: a, b: b };
  }

  /* -- B. WHAT PRACTICE SAYS: practiceEvidence -------------------------
     events: PracticeLog rows [{ b: 'qb'|'chal'|'challenge'|'rush'|'retry'|
       'explain', s: 'rw'|'math', q, sk, dom?, d: 'easy'|'medium'|'hard',
       c: 0|1, at }]. Only the FIRST attempt at each question counts (a
     second try at a question already seen is not new evidence), and
     'retry' rows are left out by default: they are questions the student
     already missed, so they would read every skill as weaker than it is
     (opts.includeRetry to keep them). 'explain' rows carry no answer.
     Students choose their own difficulty, so a raw hit rate is not
     comparable across skills; the same Rasch residual as skillEvidence is
     used with ability estimated per subject from the practice itself.
     Returns { theta: { rw, math }, skills: { sk: { s, dom, n, firstRight,
       acc, accLo, accHi, exp, S, V, z, label } } }:
       acc       firstRight / n; accLo/accHi the Jeffreys 80% interval
                 (betaInterval; prior Beta(1/2, 1/2), reasons there).
       S, z      misses beyond the difficulty-adjusted expectation.
       label     'weak' (z > zWeak and S >= 1.5), 'strong' (z < -zStrong
                 and S <= -1.5), else null; never under minN first
                 attempts.
     Gates (stats build 2026-09-26, sim-B-practice.js: 10 practised
     skills, 5 per subject; difficulty chosen by the student, leaning on
     their level and stepping up after three right; item difficulty SD
     0.35 around its tag, guessing floor 0.15; repeats and retries in the
     log): one gate for both labels let 'weak' fire three times as often
     as 'strong' (misses on easy questions make S right-skewed), so they
     differ. A flat student sees any label 4.2 / 8.3 / 9.6% of the time
     with U(5,15) / U(8,30) / U(20,60) first attempts per skill (5,000
     students). Power per skill (4,000 students): a skill 1.0 logit weaker
     is labelled weak 9 / 20 / 48 / 79% at 10 / 20 / 40 / 80 first attempts,
     1.6 logits 29 / 59 / 87 / 97%; 'strong' for +1.0: 4 / 14 / 40 / 70%,
     +1.6: 11 / 38 / 73 / 91%. If skills truly differ a little (SD 0.3
     logits) labels fire 7-25%: those are real, if small, differences. */
  var PRACTICE_GATES = { zWeak: 2.8, zStrong: 2.4, minN: 8 };
  function practiceEvidence(events, opts) {
    opts = opts || {};
    var zW = typeof opts.zWeak === 'number' ? opts.zWeak : PRACTICE_GATES.zWeak;
    var zS = typeof opts.zStrong === 'number' ? opts.zStrong : PRACTICE_GATES.zStrong;
    var minN = typeof opts.minN === 'number' ? opts.minN : PRACTICE_GATES.minN;
    var minEx = typeof opts.minExcess === 'number' ? opts.minExcess : IRT_MIN_EXCESS;
    var seen = {}, first = [];
    byTime((events || []).filter(function (e) {
      if (!e || okOf(e.c) === null || !subjOf(e.s)) return false;
      if (e.b === 'explain') return false;
      if (e.b === 'retry' && !opts.includeRetry) return false;
      return e.q !== undefined && e.q !== null && e.q !== '';
    })).forEach(function (e) {
      var key = subjOf(e.s) + '|' + e.q;
      if (seen[key]) return;
      seen[key] = true;
      first.push({ s: subjOf(e.s), sk: e.sk, dom: e.dom, d: e.d, c: okOf(e.c) });
    });
    var popTau = 1 / (IRT_POP_SD * IRT_POP_SD);
    var theta = {}, wTot = {}, skills = {};
    ['rw', 'math'].forEach(function (s) {
      var its = first.filter(function (e) { return e.s === s; }).map(function (e) { return { o: irtOff(e.d), y: e.c ? 1 : 0, e: e }; });
      if (!its.length) return;
      var th = mapTheta(its, IRT_POP_MU, popTau);
      theta[s] = th;
      wTot[s] = its.reduce(function (a, it) { var p = sigm(th + it.o); return a + p * (1 - p); }, 0) + popTau;
      its.forEach(function (it) {
        var name = String(it.e.sk || '') || '(untagged)';
        var p = sigm(th + it.o);
        var u = skills[name] || (skills[name] = { s: s, dom: it.e.dom || null, n: 0, firstRight: 0, exp: 0, S: 0, W: 0 });
        u.n++; u.firstRight += it.y; u.exp += p; u.S += p - it.y; u.W += p * (1 - p);
      });
    });
    Object.keys(skills).forEach(function (k) {
      var u = skills[k];
      u.V = Math.max(1e-9, u.W - u.W * u.W / wTot[u.s]);
      u.z = u.S / Math.sqrt(u.V);
      var bi = betaInterval(u.firstRight, u.n, 0.80);
      u.acc = u.firstRight / u.n; u.accLo = bi.lo; u.accHi = bi.hi;
      u.label = null;
      if (u.n >= minN && u.z > zW && u.S >= minEx) u.label = 'weak';
      else if (u.n >= minN && u.z < -zS && u.S <= -minEx) u.label = 'strong';
      delete u.W;
    });
    return { theta: theta, skills: skills, firstAttempts: first.length };
  }

  /* -- D. REPEATED LOOKS: heldOnTwoReads -------------------------------
     The Friday email and session prep re-read every verdict after each new
     test, so a rule with a 5% error rate on one look is wrong far more
     often across a term of looks. A verdict counts only if the same
     verdict comes out of the full history AND of the history without its
     latest entry: two consecutive reads, with no state to store.
     fn(history) -> a verdict: null/false/undefined for none, a string, or
     an object whose .verdict (else .state, else .id, else true) is the
     verdict. attempts: the history, oldest first. Returns { held, verdict,
     full, prev }. */
  function verdictOf(x) {
    if (x === null || x === undefined || x === false || x === '') return null;
    if (typeof x === 'object') {
      var v = x.verdict !== undefined ? x.verdict : (x.state !== undefined ? x.state : (x.id !== undefined ? x.id : true));
      return (v === null || v === undefined || v === false || v === '' || v === 'silent') ? null : v;
    }
    return x;
  }
  function heldOnTwoReads(fn, attempts) {
    var all = (attempts || []).slice();
    var full = fn(all);
    var prev = all.length ? fn(all.slice(0, all.length - 1)) : null;
    var v = verdictOf(full);
    var held = v !== null && v === verdictOf(prev);
    return { held: held, verdict: held ? v : null, full: full, prev: prev };
  }

  /* -- gainVerdict: what a PARENT may be told about the score ----------
     scoreChange's comparison (first k comparable tests against the last k)
     at PARENT_Z (2.6 since audit 4; 2.33 before) instead of 1.645,
     one-sided per direction, and only
     when it holds on two consecutive reads (heldOnTwoReads over the
     comparable tests). tests: score-history entries, oldest first.
     Returns { verdict: 'gain'|'drop'|null, delta, threshold, k, n, full,
     prev, outlierGuard, restsOnOneTest } (delta/threshold/k/n from the
     full read; null fields with fewer than two comparable tests).
     opts: z (default PARENT_Z), outlierGuard (default true), guardZ
     (default GAIN_GUARD_Z), guardMode 'outlier' (default) | 'each' (the
     rule before audit 4), outlierZ (default GAIN_OUTLIER_Z). Returns also
     guardMode.
     Measured (stats build 2026-09-26, sim-D-gain.js, 20,000 students per
     row, a test every week, levels U(900,1450), test noise from
     compositeSem; "any" = at least once in ten weekly looks):
                   scoreChange 1.645  z 2.33 one read  gainVerdict (2 reads)
       flat              24.5%             6.3%              1.9%
       +10 a week        58.0%            27.9%             14.1%
       +20 a week        90.7%            72.6%             54.8% (median look 10)
       +30 a week        99.4%            96.5%             89.3% (median look 8)
     and a flat student hears "drop" 1.9%. scoreChange (1.645, one read)
     stays as the chart's and the tutor's reading; this is the bar for a
     parent. z = 2.0 on two reads would give 4.8% flat and 24 / 67 / 94%
     at +10 / +20 / +30: pass { z: 2.0 } if Luca wants that trade.
     OUTLIER GUARD (2026-09-26, audit: one lucky +150 / +200 test made a
     flat student "up" 6-10% and "target reached" 8-12%). Each read's
     verdict must also survive losing any ONE comparable test (so the one
     most in its favour): without it the same comparison must still clear
     GAIN_GUARD_Z (1.645) the same way. Tried 0 / 1.0 / 1.28 / 1.645 and a
     full PARENT_Z (which cut +20/wk power to 23%); 1.645 is the least that
     keeps a single +200 test under 3.5% in both models. restsOnOneTest:
     the full read cleared PARENT_Z but not without one of its tests.
     opts.outlierGuard = false turns it off (tutor views may).
     Measured 2026-09-26 (fix3-stats/claims.js, 5,000 students per row, a
     test a week, 10 looks; author = compositeSem normal noise, harsh =
     1.15 x compositeSem, t(5) tails, a fixed per-form offset SD 25):
                           author: guard (no guard)   harsh: guard (no guard)
       flat "gain"               0.5% (2.0%)             1.2% (5.8%)
       flat "drop"               0.5% (1.7%)             1.4% (5.7%)
       flat, one +150 test       1.8% (6.7%)             2.6% (10.9%)
       flat, one +200 test       2.5% (9.9%)             3.5% (14.4%)
       +10 a week                7.2% (13.4%)            9.1% (19.3%)
       +20 a week               41.9% (54.2%)           40.7% (55.8%)
       +30 a week               81.1% (87.9%)           77.0% (87.1%)
     RETUNED AFTER AUDIT 4 (2026-09-26). The binding constraint was the
     guard, not PARENT_Z: removing every test in turn and asking for 1.645
     without it cost most of the power (lowering z to 2.05 with that guard
     moved +150 level-off detection by 1 point). Now the guard removes only
     a test FLAGGED as an outlier: more than GAIN_OUTLIER_Z (1.0) null SDs
     (compositeSem x sqrt(1 + 1/2)) past the mean of its two nearest
     comparable neighbours, in the verdict's favour; the verdict must still
     clear GAIN_GUARD_Z without each flagged test. With that guard z must
     rise to 2.6 to keep a flat student under 2%. Tried (fix4-stats/
     gain-sweep.js, 2,000-4,000 per cell): z 2.05 / 2.2 / 2.33 / 2.5 / 2.55
     / 2.6, k up to 4 / 5, the first 2 or 3 against up to the last 5, the
     previous read at 1.645 / 1.96, the every-test guard at 1.28 / 1.4 /
     1.5, the outlier guard at 0 / 0.5 / 1.0 / 1.5 SD and guard z 1.28 /
     1.645. Every z below 2.5 with the outlier guard, or guard z 1.28 /
     1.4, put the harsh model's flat "gain" over 2%.
     Before -> after (fix4-stats/gain4.js with the real functions, 4,000
     students per row, 10 looks after the first test; author = compositeSem
     normal noise, weekly; harsh = 1.15 x compositeSem, t(5), form offset
     SD 25, weekly; audit4 = section noise 1.05 x sectionSem, form section
     effects SD 15, day effect SD 20, 20% of weeks skipped, 5% ran out,
     10% section-only):
                               author         harsh          audit4
       flat "gain"             0.5 -> 0.5%    0.9 -> 1.6%    0.7 -> 1.1%
       flat "drop"             0.5 -> 0.5%    1.1 -> 1.6%    1.0 -> 1.1%
       flat, forms +/-50       0.3 -> 0.7%    0.9 -> 1.8%    1.1 -> 1.4%
       flat, one +150 test     2.1 -> 2.3%    3.1 -> 4.0%    2.7 -> 3.0%
       flat, one +200 test     2.8 -> 2.9%    4.2 -> 4.7%    3.2 -> 3.4%
       +150 levelling, tau 3   23.6 -> 26.9%  24.4 -> 29.1%  17.6 -> 21.9%
       +150 levelling, tau 8    9.9 -> 10.5%  11.8 -> 13.7%  13.9 -> 15.4%
       +250 levelling, tau 3   63.9 -> 70.4%  61.0 -> 69.4%  42.4 -> 51.8%
       +20 a week              44.2 -> 43.9%  43.1 -> 44.0%  56.9 -> 58.1%
       +10 a week               7.6 -> 7.2%    9.4 -> 10.3%  17.6 -> 17.9%
     (a second seed put the worst flat "gain" at 1.8%, harsh). Honest
     limits: a +150 plateau is below what 10 noisy tests can certify at 2%
     (one test's SD is about 100 points), so it is still told only 11-29%
     of the time; the gain is at level-off curves (+3 to +9 points), not
     linear ones (+/-1); one lucky test now carries a flat student 0.2-0.9
     points more often. */
  var PARENT_Z = 2.6;         // was 2.33 until audit 4 (2026-09-26); with the outlier-only guard, table above
  var PAIR_Z = 2.33;          // pairVerdict's own bar for the single pair (unchanged; the trend must agree too)
  var GAIN_GUARD_Z = 1.645;   // the verdict without a flagged test (2026-09-26; table above)
  var GAIN_OUTLIER_Z = 1.0;   // a test is flagged when it sits this many null SDs past its neighbours, in the verdict's favour (tried 0 / 0.5 / 1.0 / 1.5 at z 2.33-2.6; table above, n 2,000-4,000)
  /* targetReached's guard (2026-09-26): without any one test, the filter's
     level less 0.84 SD (a one-sided 80% bound) must still be at the
     target. Tried 0 / 0.5 / 0.84 / 1.28 (fix3-stats/target-gz.js, 1,500
     per row): 0.84 keeps one +200 test under 3% (author) / 4.1% (harsh)
     and the median lag after a true crossing unchanged (4 weeks).
     RE-CHECKED AFTER AUDIT 4 (2026-09-26), NOT CHANGED: the lag could not
     be shortened within the false-alarm budget. Tried (fix4-stats/
     tgt-sweep.js, 1,500-3,000 per cell, three models as gainVerdict's):
     band z 0.84 / 1.0 / 1.28 / 1.645, guard z 0 / 0.3 / 0.5 / 0.65 / 0.84
     / 1.0 / 1.28, the guard on flagged outliers only (0.5 / 1.0 / 1.5 SD),
     one read, a looser second read (band z 0.5 / 0.84), and the mean of the
     last 3-4 tests instead of the filter. Kept (band 1.28, guard 0.84, two
     reads): flat, target 40 above, 0.6 / 1.4 / 1.0% (author / harsh /
     audit4); one +200 test 3.5 / 4.5 / 3.5%; +200 levelling (tau 3) to a
     target 100 above: told 88 / 86 / 68% of crossers, median lag 4 / 4 / 7
     weeks (audit4 has skipped weeks); +20 a week: 55 / 50 / 68%, lag 4 / 4
     / 7. Guard 0.65 tells 2-5 points more with the same lag and flat 1.1 /
     2.0 / 1.3%, one +200 test 5.0 / 6.0 / 5.4%; guard 0.5 puts flat over
     2% (harsh 2.3%); one read shortens the lag by 1 week but flat is 2.9-
     4.3%. The lag is the noise: about 100 points a test. */
  var TARGET_GUARD_Z = 0.84;
  function scoreChangeAt(entries, z) {
    var usable = (entries || []).filter(isTrendComparable);
    if (usable.length < 2) return null;
    var k = Math.max(1, Math.min(3, Math.floor(usable.length / 2)));
    var first = usable.slice(0, k), latest = usable.slice(usable.length - k);
    var mean = function (a) { return a.reduce(function (s, e) { return s + e.composite; }, 0) / a.length; };
    var delta = Math.round(mean(latest) - mean(first));
    var sdDiff = compositeSem(levelOf(usable)) * Math.sqrt(2 / k);
    var threshold = Math.ceil(z * sdDiff / 10) * 10;
    return { delta: delta, threshold: threshold, k: k, n: usable.length, real: Math.abs(delta) >= threshold,
             verdict: Math.abs(delta) >= threshold ? (delta > 0 ? 'gain' : 'drop') : null };
  }
  // Without each test in turn: does the verdict survive losing any single
  // test (so the one most in its favour)? h: comparable tests. With
  // outlierZ a number, only tests flagged as outliers in the verdict's
  // favour are removed: a test whose score sits more than outlierZ null SDs
  // past the mean of its two nearest comparable neighbours (null SD =
  // compositeSem x sqrt(1 + 1/2)); a test in line with its neighbours is
  // never removed.
  function outlierIn(h, i, v, oz) {
    var nb = [], sem = compositeSem(levelOf(h));
    if (h[i - 1]) nb.push(h[i - 1]);
    if (h[i + 1]) nb.push(h[i + 1]);
    if (nb.length < 2 && h[i - 2]) nb.push(h[i - 2]);
    if (nb.length < 2 && h[i + 2]) nb.push(h[i + 2]);
    if (!nb.length) return true;
    var m = nb.reduce(function (a, e) { return a + e.composite; }, 0) / nb.length;
    var res = (h[i].composite - m) * (v === 'drop' ? -1 : 1), bar = oz * sem * Math.sqrt(1 + 1 / nb.length);
    /* Symmetric since audit 7 (2026-09-26): a test in the EARLY half that
       sits low favours a gain just as much as a late one that sits high
       (and the mirror for a drop). One-sided, a first test 100 points low
       then flat told a parent "gain" 7.0% of the time and the chart 14.1%.
       With both sides (audit7-stats/gain.js on this code, 2,000 per cell,
       12 weekly looks): parent 3.8% "gain" after a bad first test, any
       claim for a flat student 0.4-2.6% across four noise models; the
       chart (z 1.96) 2.5-5.3%. Power at 2.6: +20 a week 50-53%. */
    return res >= bar || (i < (h.length - 1) / 2 && -res >= bar);
  }
  function withoutEach(h, fn, v, oz) {
    for (var i = 0; i < h.length; i++) {
      if (typeof oz === 'number' && !outlierIn(h, i, v, oz)) continue;
      if (fn(h.slice(0, i).concat(h.slice(i + 1))) !== v) return false;
    }
    return true;
  }
  function gainVerdict(tests, opts) {
    var z = (opts && typeof opts.z === 'number') ? opts.z : PARENT_Z;
    var guard = !(opts && opts.outlierGuard === false);
    var usable = (tests || []).filter(isTrendComparable);
    var gz = (opts && typeof opts.guardZ === 'number') ? opts.guardZ : GAIN_GUARD_Z;
    // 'outlier' (default since audit 4): only a flagged test is removed;
    // 'each': every test in turn, the rule before audit 4.
    var oz = (opts && opts.guardMode === 'each') ? null : ((opts && typeof opts.outlierZ === 'number') ? opts.outlierZ : GAIN_OUTLIER_Z);
    var plain = function (h) { var c = scoreChangeAt(h, gz); return c ? c.verdict : null; };
    var guardedFails = false;
    var r = heldOnTwoReads(function (h) {
      var c = scoreChangeAt(h, z);
      if (!c || !c.verdict || !guard) return c;
      if (withoutEach(h, plain, c.verdict, oz)) return c;
      if (h.length === usable.length) guardedFails = true;
      var o = {}; Object.keys(c).forEach(function (k2) { o[k2] = c[k2]; });
      o.verdict = null; o.heldWithoutEach = false;
      return o;
    }, usable);
    var f = r.full || {};
    return { verdict: r.verdict, delta: f.delta === undefined ? null : f.delta, threshold: f.threshold === undefined ? null : f.threshold,
             k: f.k || null, n: usable.length, full: r.full, prev: r.prev, outlierGuard: guard, guardMode: oz === null ? 'each' : 'outlier',
             restsOnOneTest: guardedFails };
  }
  /* pairVerdict(prev, latest, history): the single-test line ("that's X
     higher than your last test"). tutor: pairChange's own reading (1.645,
     for Luca). verdict (what a parent may be told it MEANS): 'gain' only
     when the pair clears PAIR_Z (2.33; opts.pairZ, else opts.z) one-sided (the error read at the two
     tests' average level) AND the trend rule agrees, i.e. gainVerdict over
     the history up to and including latest says 'gain'; 'drop' likewise.
     So the pair line can never claim a change the trend rule would not.
     history: score-history entries oldest first (latest is appended if it
     is not the last one); omitted = [prev, latest], which can never pass
     the two-read trend rule, so a bare pair is never a parent claim.
     Returns null when either test is not comparable, else { verdict,
     delta, threshold (parent bar), tutorThreshold, tutorReal, trend }.
     Measured 2026-09-26 (fix3-stats/claims.js, 5,000 per row, 10 weekly
     looks): a flat student is told a real gain 0.0% (author) / 0.0%
     (harsh), 0.0 / 0.2% with one +150 or +200 test, where the old pair
     line (pairChange past PARENT_Z) said so 10.7 / 27.0% (flat) and up to
     45.7 / 55.1% (one +200 test). Gaining +20 / +30 a week: 0.7 / 2.3%
     (harsh 1.6 / 4.6%): the line is rare by design; the trend sentence
     carries the news. After audit 4's gainVerdict change (PARENT_Z 2.6,
     outlier-only guard; the pair bar kept at 2.33): a flat student is told
     a pair gain 0.0% in all three models, 0.0-0.2% with one +150 or +200
     test (4,000 per row, gain4.js); +20 a week 0.4 / 1.9 / 2.6%. */
  function pairVerdict(prev, latest, history, opts) {
    var pc = pairChange(prev, latest);
    if (!pc) return null;
    var z = (opts && typeof opts.pairZ === 'number') ? opts.pairZ : ((opts && typeof opts.z === 'number') ? opts.z : PAIR_Z);
    var bar = Math.ceil(z * Math.SQRT2 * compositeSem(levelOf([prev, latest])) / 10) * 10;
    var h = (history || [prev]).slice();
    if (h[h.length - 1] !== latest) h.push(latest);
    var trend = gainVerdict(h, opts);
    var side = pc.delta >= bar ? 'gain' : (-pc.delta >= bar ? 'drop' : null);
    return { verdict: side && trend.verdict === side ? side : null, delta: pc.delta, threshold: bar,
             tutorThreshold: pc.threshold, tutorReal: pc.real, trend: trend.verdict };
  }

  /* -- F. TARGETS AND "NOW" -------------------------------------------- */
  // The filter's state after the latest test, projected `weeks` ahead.
  function levelParams(opts) {
    var o = opts || {};
    return { drift: typeof o.driftSD === 'number' ? o.driftSD : LEVEL_DRIFT_SD,
             slopeDrift: typeof o.slopeDriftSD === 'number' ? o.slopeDriftSD : LEVEL_SLOPE_DRIFT_SD,
             slope0: typeof o.slope0SD === 'number' ? o.slope0SD : LEVEL_SLOPE0_SD };
  }
  function levelState(entries, opts) {
    var P = levelParams(opts);
    var DAY = 86400000, WEEK = 7 * DAY;
    var used = [];
    (entries || []).forEach(function (e, i) {
      if (!isTrendComparable(e)) return;
      var ms = msOf(e.date);
      if (!isFinite(ms)) return;
      used.push({ e: e, i: i, ms: ms });
    });
    if (!used.length) return null;
    used.sort(function (a, b) { return (a.ms - b.ms) || (a.i - b.i); });
    var R = function (v) { var s = compositeSem({ composite: v }); return s * s; };
    var q1 = P.drift * P.drift, q2 = P.slopeDrift * P.slopeDrift;
    var x0 = 0, x1 = 0, p00 = 0, p01 = 0, p11 = 0, trace = [];
    used.forEach(function (u, k) {
      var y = u.e.composite;
      if (k === 0) {
        x0 = y; x1 = 0;
        p00 = R(y); p01 = 0; p11 = P.slope0 * P.slope0;
      } else {
        var prev = used[k - 1];
        var dt = (Math.floor(u.ms / DAY) === Math.floor(prev.ms / DAY)) ? 0 : (u.ms - prev.ms) / WEEK;
        x0 = x0 + dt * x1;
        p00 = p00 + 2 * dt * p01 + dt * dt * p11 + q1 * dt;
        p01 = p01 + dt * p11;
        p11 = p11 + q2 * dt;
        var r = R(x0), s = p00 + r, k0 = p00 / s, k1 = p01 / s, innov = y - x0;
        x0 += k0 * innov; x1 += k1 * innov;
        var n00 = (1 - k0) * p00, n01 = (1 - k0) * p01, n11 = p11 - k1 * p01;
        p00 = n00; p01 = n01; p11 = n11;
      }
      trace.push({ u: u, x0: x0, x1: x1, p00: p00 });
    });
    return { used: used, trace: trace, x0: x0, x1: x1, p00: p00, p01: p01, p11: p11, lastMs: used[used.length - 1].ms, P: P };
  }
  function bandOf(x0, p00) {
    var sd = Math.sqrt(Math.max(0, p00));
    var clamp = function (v) { return Math.max(400, Math.min(1600, v)); };
    return { level: clamp(Math.round(x0 / 10) * 10),
             lo: clamp(Math.floor((x0 - LEVEL_Z80 * sd) / 10) * 10),
             hi: clamp(Math.ceil((x0 + LEVEL_Z80 * sd) / 10) * 10) };
  }
  /* currentLevelAt(tests, date): "likely level now" meaning the given day,
     not the day of the last test. The filter's state after the latest test
     is carried forward: level + weeks * weekly gain, variance grown by the
     gain's uncertainty and by the level and gain drift over those weeks.
     A date before the latest test is treated as the latest test's day.
     date: ISO-8601 string, Date or epoch ms. Returns null with no usable
     test, else { level, lo, hi, estimate, sd, weeks, gainPerWeek }: level/lo/hi
     rounded as currentLevel's band, estimate and sd unrounded (sd to 1). */
  function currentLevelAt(entries, date, opts) {
    var st = levelState(entries, opts);
    if (!st) return null;
    var t = msOf(date);
    var dt = isFinite(t) ? Math.max(0, (t - st.lastMs) / (7 * 86400000)) : 0;
    var q1 = st.P.drift * st.P.drift;
    var x0 = st.x0 + dt * st.x1;
    // The filter's own predict step, so "now" is exactly the prior the
    // next test would be combined with.
    var p00 = st.p00 + 2 * dt * st.p01 + dt * dt * st.p11 + q1 * dt;
    var b = bandOf(x0, p00);
    b.estimate = Math.round(x0);
    b.weeks = Math.round(dt * 10) / 10;
    b.gainPerWeek = Math.round(st.x1 * 10) / 10;
    b.sd = Math.round(Math.sqrt(Math.max(0, p00)));
    return b;
  }
  /* targetReached(tests, target): true only when the LOWER end of the
     current-level band is at or above the target, so "reached" means the
     pooled evidence says so, never one lucky sitting. opts.date: judge
     the level projected to that day (currentLevelAt) instead of the day of
     the last test. opts.twoReads: also require it on the comparable tests
     without the latest (heldOnTwoReads); use it for anything a parent
     reads. Returns { reached, lo, level, hi } or null with no usable
     test or no numeric target.
     Measured (stats build 2026-09-26, sim-F-level.js, 8,000 students per
     row, a test every week; "any" = at least once in ten looks):
       flat student 40 / 80 / 120 below target: fires 10.7 / 2.6 / 0.6%
         (twoReads 2.6 / 0.2 / 0.1%)
       improving to a target 100 above the start at +10 / +20 / +30 a
         week: median lag after the true crossing 5.0 / 4.0 / 3.7 weeks
         (90th percentile 9 / 6 / 4.7), early 7.1 / 2.2 / 2.0%; twoReads
         lag 7.0 / 5.0 / 4.7 weeks, early 1.6 / 0.2 / 0.2%.
     OUTLIER GUARD (2026-09-26; opts.outlierGuard = false turns it off,
     opts.guardZ overrides TARGET_GUARD_Z): "reached" must also hold
     without any one comparable test (see TARGET_GUARD_Z); loWithoutBest is
     that bound, rounded. Measured with twoReads (fix3-stats/claims.js,
     5,000 per row, a test a week, 10 looks; harsh as gainVerdict's):
       flat, target 40 above:   author 0.8% (no guard 2.5%), harsh 1.4% (6.2%)
       ... one +150 test:       2.3% (8.3%), harsh 3.4% (12.6%)
       ... one +200 test:       2.7% (12.0%), harsh 4.6% (17.0%)
       target 100 above, reached within the 10 looks at +20 / +30 a week:
         author 52 / 98% (66 / 99.5%), harsh 49 / 95% (64 / 98%). */
  function targetReached(tests, target, opts) {
    if (!(typeof target === 'number' && isFinite(target))) return null;
    if (opts && opts.twoReads) {
      var o2 = {}; Object.keys(opts).forEach(function (k) { if (k !== 'twoReads') o2[k] = opts[k]; });
      var usable = (tests || []).filter(isTrendComparable);
      var hr = heldOnTwoReads(function (h) { var t = targetReached(h, target, o2); return t && t.reached ? 'reached' : null; }, usable);
      var cur = targetReached(tests, target, o2);
      if (cur) cur.reached = hr.held;
      return cur;
    }
    var loOf = function (list) {
      if (opts && opts.date !== undefined) return currentLevelAt(list, opts.date, opts);
      var c = currentLevel(list, opts); return c && c.now;
    };
    var now = loOf(tests);
    if (!now) return null;
    var reached = now.lo >= target, guardLo = null;
    if (reached && !(opts && opts.outlierGuard === false)) {
      // Must still hold without any one test, so without the luckiest one:
      // the level without it, less TARGET_GUARD_Z of its SD, at the target.
      var gz = (opts && typeof opts.guardZ === 'number') ? opts.guardZ : TARGET_GUARD_Z;
      var comp = (tests || []).filter(function (e) { return isTrendComparable(e) && isFinite(msOf(e.date)); });
      for (var i = 0; i < comp.length; i++) {
        var sub = comp.slice(0, i).concat(comp.slice(i + 1)), lo = -Infinity;
        var st = levelState(sub, opts);
        if (st) {
          var x0 = st.x0, p00 = st.p00;
          if (opts && opts.date !== undefined) {
            var t = msOf(opts.date), dt = isFinite(t) ? Math.max(0, (t - st.lastMs) / (7 * 86400000)) : 0;
            x0 += dt * st.x1; p00 += 2 * dt * st.p01 + dt * dt * st.p11 + st.P.drift * st.P.drift * dt;
          }
          lo = x0 - gz * Math.sqrt(Math.max(0, p00));
        }
        if (guardLo === null || lo < guardLo) guardLo = lo;
      }
      if (guardLo === null || guardLo < target) reached = false;
      guardLo = (guardLo === null || !isFinite(guardLo)) ? null : Math.round(guardLo);
    }
    return { reached: reached, lo: now.lo, level: now.level, hi: now.hi, loWithoutBest: guardLo };
  }

  /* === G. TUTOR-ONLY ANALYSES ===========================================
     For Luca's eyes (session prep, admin), never a parent. Each returns
     { ready, have, need, ... } and says nothing that reads as a verdict
     while !ready: `need` was chosen by simulation (stats build 2026-09-26,
     sim-G-need.js) as the least evidence at which the estimate's central
     80% interval is narrower than the width stated beside it in at least
     90% of simulated students (practiceTransfer gates on the width
     itself). opts.need overrides. Every figure is descriptive: none of these
     can tell cause from coincidence, and each says so in `note`.
     READY IS EXPLAINED (audit 4, 2026-09-26): `ready` can be false while
     have >= need (confidenceCalibration needs varied taps, practiceTransfer
     a narrow interval, trapPull roster abilities, ...), and the admin page
     then showed "Collecting: 40 of 25". Each now also returns
       why    null when ready, else a short machine string naming the first
              requirement not met, e.g. 'need-more-sure',
              'need-more-not-sure', 'too-uniform', 'interval-too-wide',
              'need-more-pairs', 'practice-does-not-vary',
              'need-more-explained', 'need-more-not-explained',
              'need-more-ticked-retries', 'need-more-timed-answers',
              'fit-failed', 'need-more-intervals', 'no-fit',
              'no-roster-abilities', 'no-student-ability',
              'need-more-wrong-answers', 'ability-at-roster-edge';
       needs  every requirement with what the student has, e.g.
              { sure: { have, need }, notSure: { have, need },
              sureShare: { have, max } }.
     speedAccuracy's sections carry why/needs for `ready` and whyNoVerdict
     ('no-roster-times' | 'need-more-timed-answers' |
     'roster-times-cover-too-little' | 'fit-failed') for its verdict. */
  var G_NEED = {
    // ticked retries: the 80% interval on P(right) is under 0.30 wide at
    // every true rate from 17 on (exactly; 47% of students at 16, p = 0.5)
    retryHolds: 17,
    // counted wrong answers: 80% interval on the excess share under 0.20
    // wide for 100% of simulated students at 40 (81% at 35)
    trapPull: 40,
    // timed answers in one section: 80% interval on the slope under 1.5
    // logits per e-fold of time for 90% at 160 (a width of 1.0 needs 300);
    // interval coverage 82% in simulation
    speedAccuracy: 160,
    // (skill, test) pairs with practice varying within the skill: a floor.
    // The width itself decides (under PRACTICE_TRANSFER_WIDTH), because it
    // depends on how much practice varies more than on the pair count:
    // 90% of simulated students were still over 1.0 at 250-300 pairs with
    // up to 12 practice questions per skill per window. Null coverage of the
    // 80% interval 85%.
    practiceTransfer: 30,
    // between-test intervals: 80% interval under 80 points per portal hour
    // for 94% at 15 (a width of 40 needs 40 intervals), portal time
    // U(0, 5) hours per interval, noise from compositeSem
    doseResponse: 15,
    // later attempts in EACH group: 80% interval on the difference under
    // 0.30 wide for every student at 36 (63% at 34)
    explanationEffect: 36,
    // first tries tapped "sure": the 80% interval on their accuracy is under
    // 0.26 wide at every true rate from 25 on (0.21 at 80% right)
    confidenceCalibration: 25
  };
  var PRACTICE_TRANSFER_WIDTH = 1.0;   // logits of gap per 10 practice questions
  function betaDiff(a1, b1, a2, b2) {
    var m1 = a1 / (a1 + b1), m2 = a2 / (a2 + b2);
    var v1 = a1 * b1 / ((a1 + b1) * (a1 + b1) * (a1 + b1 + 1)), v2 = a2 * b2 / ((a2 + b2) * (a2 + b2) * (a2 + b2 + 1));
    var sd = Math.sqrt(v1 + v2), d = m1 - m2;
    return { diff: d, lo: d - Z80 * sd, hi: d + Z80 * sd };
  }
  function rate(k, n) {
    var b = betaInterval(k, n, 0.80);
    return { n: n, right: k, acc: n > 0 ? k / n : null, lo: b.lo, hi: b.hi };
  }
  function okOf(x) {
    if (x === 1 || x === true || x === '1' || x === 'true' || x === 'TRUE') return 1;
    if (x === 0 || x === false || x === '0' || x === 'false' || x === 'FALSE') return 0;
    return null;
  }
  function subjOf(s) { return s === 'math' ? 'math' : ((s === 'rw' || secKeyOf(s) === 'reading-writing') ? 'rw' : null); }
  // Student's t quantile for the central 80% interval (Cornish-Fisher; exact to 0.01 for df >= 2).
  function t80(df) {
    if (!(df >= 1)) return Infinity;
    if (df === 1) return 3.0777;
    var z = Z80, z3 = z * z * z, z5 = z3 * z * z;
    return z + (z3 + z) / (4 * df) + (5 * z5 + 16 * z3 + 3 * z) / (96 * df * df);
  }

  /* -- G1. Does "I understand this" hold up? retryHolds -----------------
     events: PracticeLog rows; the 'retry' rows count, each with c (0|1),
     at, lm (when the miss was recorded) and ua (when the student ticked
     "I understand this"; absent or '' if never ticked).
     Re-checked 2026-09-26 (audit): ONE retry per recorded miss (s, k or
     q, lm), the earliest - a second go at the same miss comes after the
     first showed the answer, and counting it made a quick re-tap look
     like knowledge that held; a retry whose tick is stamped AFTER it
     (clock skew; the tick cannot have come first) is left out of both
     groups instead of counting as unticked; a saved question first
     answered right (lm '') is not a miss and is left out. leftOut counts
     each.
     Returns { ready, have, need, ticked: rate, unticked: rate, diff: { diff,
       lo, hi } | null, byDays: [{ label, from, to, ...rate }], bar, trust,
       leftOut: { repeats, tickAfter, notMiss }, note }. rate = { n, right,
       acc, lo, hi } (Jeffreys 80%).
     trust (only when ready): 'holds' when the ticked retries' 80%
     interval sits above opts.bar (default 0.7), 'does-not-hold' when it
     sits below, else 'unclear'.
     ONE RETRY PER ORIGINAL MISS (audit 4, 2026-09-26). A wrong retry
     re-records the miss with a new lm, so the next retry of the same
     question carried a new key and counted again: a student who keeps
     missing a question added a wrong retry each time, and a student who
     gets it right on the third go added a right retry made just after the
     answer was shown twice. Now a retry whose lm lies within
     RETRY_REMISS_TOL_MS (10 minutes) of an earlier WRONG retry of the same
     question is that retry's re-record, not a new miss, and is left out
     (leftOut.reRecorded); a second retry of the same original miss is
     left out as before (leftOut.repeats). A question missed again later
     somewhere else (a test, the bank: an lm not stamped by a retry) is a
     new original miss and its first retry counts. Chosen over "one per
     question per 7 days" because the question is whether "I understand
     this" survives the first real test of it, and a retry after the answer
     has been shown is memory of the answer whatever the gap; a 7-day
     window would count the third, fourth... retry of a question missed
     every time and still count the re-tap right after a wrong retry that
     falls on day 8. Without a readable lm: one retry per question.
     Returns also why ('need-more-ticked-retries' | null) and needs: {
     tickedRetries: { have, need } }. */
  var RETRY_REMISS_TOL_MS = 10 * 60000;   // a miss stamped within 10 minutes of a wrong retry of the same question is that retry's re-record
  var RETRY_DAY_BINS = [[0, 2, '0-1 days'], [2, 7, '2-6 days'], [7, 21, '1-3 weeks'], [21, Infinity, '3+ weeks']];
  function retryHolds(events, opts) {
    var bar = (opts && typeof opts.bar === 'number') ? opts.bar : 0.7;
    var need = (opts && opts.need) || G_NEED.retryHolds;
    var t = { n: 0, k: 0 }, u = { n: 0, k: 0 }, bins = RETRY_DAY_BINS.map(function () { return { n: 0, k: 0 }; });
    var seen = {}, wrongAt = {}, repeats = 0, remiss = 0, late = 0, notMiss = 0;
    byTime((events || []).filter(function (e) { return e && e.b === 'retry' && okOf(e.c) !== null; })).forEach(function (e) {
      var y = okOf(e.c), at = msOf(e.at);
      // A saved question first answered right (lm '') is not a miss to recover from.
      if (e.lm === '') { notMiss++; return; }
      var qk = (e.k !== undefined && e.k !== null && e.k !== '') ? e.k : e.q;
      if (qk !== undefined && qk !== null && qk !== '') {
        var qkey = (e.s || '') + '|' + qk, lmMs = msOf(e.lm);
        var wr = wrongAt[qkey] || (wrongAt[qkey] = []);
        // A wrong retry re-records the miss with a new lm stamped at the
        // retry: that is not a new original miss (audit 4), so the next
        // retry of the question is not counted again.
        var reRecorded = isFinite(lmMs) && wr.some(function (t) { return Math.abs(t - lmMs) <= RETRY_REMISS_TOL_MS; });
        if (isFinite(at) && y === 0) wr.push(at);
        if (reRecorded) { remiss++; return; }
        // One retry per original miss: the first after it. Without a
        // readable lm, one retry per question.
        var key = qkey + '|' + (isFinite(lmMs) ? lmMs : '?');
        if (seen[key]) { repeats++; return; }
        seen[key] = true;
      }
      var ua = e.ua === true ? -Infinity : msOf(e.ua);
      // A tick stamped after the retry cannot have come before it: which
      // group the retry belongs to is unknown, so it is left out of both.
      if (e.ua && isFinite(ua) && isFinite(at) && ua > at) { late++; return; }
      var ticked = !!e.ua && (isNaN(ua) ? e.ua !== false : true);
      var g = ticked ? t : u;
      g.n++; g.k += y;
      var lm = msOf(e.lm);
      if (isFinite(at) && isFinite(lm) && at >= lm) {
        var days = (at - lm) / 86400000;
        RETRY_DAY_BINS.forEach(function (b, i) { if (days >= b[0] && days < b[1]) { bins[i].n++; bins[i].k += y; } });
      }
    });
    var ready = t.n >= need;
    var out = {
      ready: ready, why: ready ? null : 'need-more-ticked-retries', needs: { tickedRetries: { have: t.n, need: need } },
      have: t.n, need: need, bar: bar,
      ticked: rate(t.k, t.n), unticked: rate(u.k, u.n),
      leftOut: { repeats: repeats, reRecorded: remiss, tickAfter: late, notMiss: notMiss },
      diff: (t.n && u.n) ? betaDiff(t.k + 0.5, t.n - t.k + 0.5, u.k + 0.5, u.n - u.k + 0.5) : null,
      byDays: RETRY_DAY_BINS.map(function (b, i) { var r = rate(bins[i].k, bins[i].n); r.label = b[2]; r.from = b[0]; r.to = b[1] === Infinity ? null : b[1]; return r; }),
      trust: null,
      note: 'Retries after a tick vs without one; descriptive, not a cause.'
    };
    if (ready) out.trust = out.ticked.lo > bar ? 'holds' : (out.ticked.hi < bar ? 'does-not-hold' : 'unclear');
    return out;
  }

  /* -- G2. Are this student's wrong answers the popular trap? trapPull ---
     studentWrongs: [{ q, g }] this student's wrong answers and the choice
     picked, ALL of the student's wrong rows that itemWrongCounts counts
     (repeats included). itemWrongCounts: { q: { choice: count } } wrong
     answers across the whole roster, this student's rows included.
     REBUILT (2026-09-26, audit): the old rule compared "the student picked
     the roster's modal wrong choice" with the modal choice's share, but the
     modal choice is picked BECAUSE its roster count ran high, so its share
     overstates how often a random wrong answer lands on it: a student
     wrong exactly like everyone else was told "avoids-traps" 64 / 54 / 44%
     of the time at roster 10 / 20 / 30, and repeat misses (retries,
     retakes) counted one question several times.
     Now:
       ONE wrong answer per question: the student's first row for q (input
         order); every one of the student's rows for q is taken off the
         roster counts (leave-self-out), so repeats never count twice.
       popularity of the student's choice  a = c_g / n  (n other students'
         wrong answers, c_g of them on the student's choice)
       chance  e = what a is on average when the student is just one more
         answer drawn like the roster's: given the n + 1 answers on the
         question (the student's added back, C_k per choice) the student is
         any one of them with equal chance, so e = sum_k C_k (C_k - 1) /
         ((n + 1) n) and the variance of a around e is exact (a
         permutation null), no model of the choice shares assumed.
       excess = mean(a - e) over questions with n >= minRoster (5) other
         wrong answers, 80% interval from the summed permutation variances
         (questions are independent).
     Measured 2026-09-26 (fix3-stats/trap-null.js, 4,000 simulated
     students per cell, 200 questions, choice shares Dirichlet(1,1,1),
     each student wrong on 30%): wrong exactly like the roster,
     "drawn-to-traps" / "avoids-traps" 9.1 / 10.2% at roster 15 (ready
     85%), 10.1 / 9.7% at 20, 8.6 / 10.1% at 40 (nominal 10 / 10); with
     retry/retake repeats in the input 9.6 / 10.6, 9.0 / 10.7, 10.3 /
     10.6%. At roster 10 only 3% of students reach 40 usable questions.
     Picking the roster's most popular wrong choice on an extra 20% of
     misses: "drawn" 24 / 25 / 30% at roster 15 / 20 / 40, "avoids" 2-3%.
     CONFOUNDED BY ABILITY (audit 4, 2026-09-26): which wrong choice a
     student picks depends on ability (a strong student's misses land on
     subtler distractors), so against the WHOLE roster a strong student was
     "avoids-traps" 26-62% and a weak one "drawn-to-traps" 34-44% at
     distractor ability-slope SD 1.2 with no trap tendency at all. The
     numbers above stay as a DESCRIPTION (share, expectedShare, excess, lo,
     hi, z); the VERDICT now comes only from an ability-matched null:
       itemWrongCounts[q] may be an array [{ g, th, sid? }] (every roster
         wrong answer on q, its choice, its answerer's ability theta, and
         optionally the answerer's id), and opts.ability is the student's
         theta (opts.studentId drops the student's own rows by sid; without
         sid, one row per own wrong row is dropped, same choice, nearest
         ability). With the old { choice: count } map, or no opts.ability,
         the verdict is null (why 'no-roster-abilities' / 'no-student-
         ability'): descriptive only.
       The null is the same permutation null with each roster answer
         weighted by a Gaussian kernel in ability (SD TRAP_KERNEL_SD 0.5
         logits; the student's own answer weight 1): the student is answer
         j with probability proportional to its weight. When the weighted
         answerers sit lopsided around the student (weighted mean more than
         TRAP_EDGE 0.15 logits off, the edge of the roster) the null mean is
         the local-linear intercept at the student's ability instead of the
         weighted mean. A question counts when its kernel weights are worth
         TRAP_MIN_EFF (4) answers; `need` (40) such questions for a verdict;
         and fewer than TRAP_MIN_SIDE (10%) of the usable roster answers
         above, or below, the student's ability: 'ability-at-roster-edge'.
     Measured (fix4-stats/trap4.js; the audit's nominal-response truth, 220
       questions, each answered by 70% of the roster; roster thetas and the
       student's with estimation noise SD 0.3; 150 rosters of 30 per row, so
       about 1,100 ready students per tertile, 100-150 in the top third):
       "drawn" / "avoids" by tertile of ESTIMATED ability (low / mid / high):
         slope SD 0    7.1 / 8.4   8.7 / 8.7   5.1 / 8.7%   (nominal 10 / 10)
         slope SD 0.7  9.1 / 7.0   9.7 / 9.3  12.7 / 5.9%
         slope SD 1.2 11.4 / 7.7  12.2 / 8.4  14.0 / 8.5%
       by tertile of TRUE ability, slope SD 1.2: 13.1 / 5.8, 12.1 / 8.3,
         2.1 / 24.1% (ready 73 / 74 / 10%): the ability ESTIMATES are
         noisy, so the answerers near a strong student's estimate are on
         average weaker than the student (errors in theta); with exact
         thetas the top third is 6.1 / 5.3%. Before (audit 4, whole-roster
         null): top third "avoids" 48 / 62%, bottom third "drawn" 34 / 44%
         at slope SD 1.2 (roster 15 / 30).
       The slope SD 0 rows are the author's and the audit-3 models (choice
         shares independent of ability). Ready: 71-80% of the lower two
         thirds at roster 30, 7-10% of the top third, 2-6% at roster 15.
       Power: picking the population's most popular wrong choice on an
         extra 20% of misses, "drawn" 27-28% (slope SD 0), 21-24% (0.7),
         18-27% (1.2) of ready students (about 80 per cell).
     Returns { ready, why, needs: { wrongAnswersNearAbility: { have, need },
       rosterAbilities, studentAbility }, have (ability-matched questions;
       the descriptive count with the old map), need, haveAll, hits,
       expected, share, expectedShare, excess, lo, hi, z (descriptive,
       whole roster), abilityMatched: { n, share, expectedShare, excess, lo,
       hi, z, kernelSD } | null, verdict, note }: verdict (only when
       ready) 'drawn-to-traps' (abilityMatched.lo > 0), 'avoids-traps'
       (abilityMatched.hi < 0), else 'no-clear-pull'. why: null when ready,
       else 'no-roster-abilities' | 'no-student-ability' |
       'need-more-wrong-answers' | 'ability-at-roster-edge'. */
  var TRAP_EDGE = 0.15;        // logits: weighted mean ability offset past which the local-linear correction is used
  var TRAP_MIN_SIDE = 0.1;     // share of the roster's wrong answers that must come from answerers above (and below) the student
  var TRAP_KERNEL_SD = 0.5;    // logits (2026-09-26, roster 30, n 40-150 rosters): 0.3 left 64-100% not ready; 0.8 / 1.5 (kernel mean alone) put the bottom third at "drawn" 17 / 29% (slope SD 1.2); table above
  var TRAP_MIN_EFF = 4;        // effective roster answers near the student's ability a question needs
  function trapPull(studentWrongs, itemWrongCounts, opts) {
    opts = opts || {};
    var need = opts.need || G_NEED.trapPull, minRoster = opts.minRoster || 5;
    var ab = (typeof opts.ability === 'number' && isFinite(opts.ability)) ? opts.ability : null;
    var hk = (typeof opts.kernelSD === 'number' && opts.kernelSD > 0) ? opts.kernelSD : TRAP_KERNEL_SD;
    var minEff = (typeof opts.minEffective === 'number') ? opts.minEffective : TRAP_MIN_EFF;
    var sid = (opts.studentId === undefined || opts.studentId === null) ? null : String(opts.studentId);
    var mine = {}, order = [];
    (studentWrongs || []).forEach(function (w) {
      if (!w || w.q === undefined || w.q === null || w.g === undefined || w.g === null) return;
      var q = String(w.q);
      if (!mine[q]) { mine[q] = { first: String(w.g), all: {}, n: 0 }; order.push(q); }
      mine[q].all[String(w.g)] = (mine[q].all[String(w.g)] || 0) + 1; mine[q].n++;
    });
    var n = 0, sumA = 0, sumE = 0, vNull = 0, haveTheta = false, sawMap = false;
    var m = { n: 0, a: 0, e: 0, v: 0, above: 0, below: 0 };
    order.forEach(function (q) {
      var raw = itemWrongCounts && itemWrongCounts[q];
      if (!raw) return;
      var own = mine[q].all, g = mine[q].first, tot = 0, c = {}, others = null;
      if (Array.isArray(raw)) {
        // [{ g, th, sid? }]: every roster wrong answer with its answerer's
        // ability. The student's own rows are dropped by sid when given,
        // else one row per own wrong row, same choice, nearest ability.
        others = [];
        var drop = {};
        Object.keys(own).forEach(function (k) { drop[k] = own[k]; });
        var rows = raw.filter(function (x) { return x && x.g !== undefined && x.g !== null; }).map(function (x) {
          return { g: String(x.g), th: (typeof x.th === 'number' && isFinite(x.th)) ? x.th : null, sid: x.sid === undefined || x.sid === null ? null : String(x.sid) };
        });
        if (sid !== null && rows.some(function (x) { return x.sid !== null; })) rows = rows.filter(function (x) { return x.sid !== sid; });
        else {
          rows.sort(function (x, y) { return (ab === null || x.th === null || y.th === null) ? 0 : Math.abs(x.th - ab) - Math.abs(y.th - ab); });
          rows = rows.filter(function (x) { if (drop[x.g] > 0) { drop[x.g]--; return false; } return true; });
        }
        rows.forEach(function (x) { c[x.g] = (c[x.g] || 0) + 1; tot++; if (x.th !== null) haveTheta = true; others.push(x); });
      } else {
        sawMap = true;
        Object.keys(raw).forEach(function (k) { var x = Math.max(0, num(Number(raw[k])) - (own[k] || 0)); c[k] = x; tot += x; });
      }
      if (tot < minRoster) return;
      // Descriptive: exchangeable with the WHOLE roster (the permutation null).
      var C = {};
      Object.keys(c).forEach(function (k) { C[k] = c[k]; });
      C[g] = (C[g] || 0) + 1;
      var e = 0, m2 = 0;
      Object.keys(C).forEach(function (k) { var w = C[k] / (tot + 1), x = (C[k] - 1) / tot; e += w * x; m2 += w * x * x; });
      var a = (c[g] || 0) / tot;
      n++; sumA += a; sumE += e; vNull += Math.max(0, m2 - e * e);
      // Ability-matched null: the permutation null above with each answer
      // weighted by how close its answerer's ability is to the student's
      // (Gaussian kernel in theta; the student's own answer weight 1). Given
      // the n + 1 answers, the student is answer j with probability
      // proportional to its weight, and would then score the share of the
      // other n answers on j's choice.
      if (ab === null || !others) return;
      var usable = others.filter(function (x) { return x.th !== null; });
      if (usable.length < minRoster) return;
      var Wt = 0, W2 = 0, Cu = {};
      usable.forEach(function (x) { var d = (x.th - ab) / hk; x.w = Math.exp(-0.5 * d * d); x.d = x.th - ab; Wt += x.w; W2 += x.w * x.w; Cu[x.g] = (Cu[x.g] || 0) + 1; });
      if (!(Wt > 0) || Wt * Wt / W2 < minEff) return;
      var nu = usable.length;
      Cu[g] = (Cu[g] || 0) + 1;
      var x0 = (Cu[g] - 1) / nu, S0 = 1, S1 = 0, S2 = 0, T0 = x0, T1 = 0, M2 = x0 * x0;
      usable.forEach(function (x) { var v = (Cu[x.g] - 1) / nu; S0 += x.w; S1 += x.w * x.d; S2 += x.w * x.d * x.d; T0 += x.w * v; T1 += x.w * x.d * v; M2 += x.w * v * v; });
      var ee = T0 / S0, mm = M2 / S0, det = S0 * S2 - S1 * S1;
      // Local-linear: the kernel mean corrected for the answerers' ability
      // being lopsided around the student's (the edge of the roster), the
      // intercept at the student's ability of a weighted line in theta.
      var edge = typeof opts.edge === 'number' ? opts.edge : TRAP_EDGE;
      usable.forEach(function (x) { if (x.d > 0) m.above++; else if (x.d < 0) m.below++; });
      if (opts.boundary !== 'none' && Math.abs(S1 / S0) > edge && det > 1e-9 * S0 * S2) ee = (S2 * T0 - S1 * T1) / det;
      m.n++; m.a += x0; m.e += ee; m.v += Math.max(0, mm - 2 * ee * T0 / S0 + ee * ee);
    });
    var out = { ready: false, why: null, have: (sawMap && !haveTheta) ? n : m.n, need: need, haveAll: n,
                hits: sumA, expected: sumE,
                share: n ? sumA / n : null, expectedShare: n ? sumE / n : null, excess: null, lo: null, hi: null, z: null,
                abilityMatched: null, verdict: null,
                needs: { wrongAnswersNearAbility: { have: m.n, need: need }, rosterAbilities: haveTheta, studentAbility: ab !== null },
                note: 'How popular the student\'s wrong choices are among the roster\'s wrong answers; a verdict only against students of similar ability.' };
    if (n) {
      var mu = (sumA - sumE) / n;
      var se = vNull > 0 ? Math.sqrt(vNull) / n : Infinity;
      out.excess = mu; out.lo = mu - Z80 * se; out.hi = mu + Z80 * se;
      out.z = se > 0 && isFinite(se) ? mu / se : null;
    }
    if (m.n) {
      var mu2 = (m.a - m.e) / m.n, se2 = m.v > 0 ? Math.sqrt(m.v) / m.n : Infinity;
      out.abilityMatched = { n: m.n, share: m.a / m.n, expectedShare: m.e / m.n, excess: mu2, lo: mu2 - Z80 * se2, hi: mu2 + Z80 * se2,
                             z: se2 > 0 && isFinite(se2) ? mu2 / se2 : null, kernelSD: hk };
    }
    if (sawMap && !haveTheta) out.why = 'no-roster-abilities';
    else if (ab === null) out.why = 'no-student-ability';
    else if (m.n < need) out.why = 'need-more-wrong-answers';
    else if (Math.min(m.above, m.below) < (typeof opts.minSide === 'number' ? opts.minSide : TRAP_MIN_SIDE) * (m.above + m.below)) out.why = 'ability-at-roster-edge';
    out.ready = out.why === null;
    if (out.ready) { var am = out.abilityMatched; out.verdict = am.lo > 0 ? 'drawn-to-traps' : (am.hi < 0 ? 'avoids-traps' : 'no-clear-pull'); }
    return out;
  }

  /* -- G3. Is slower more accurate for this student? speedAccuracy ------
     items: [{ sec, diff, ok, seconds, budget, attempt?, key? | qid? }]
     (attempt: any id grouping one sitting; key/qid: the question, for the
     roster time map). r = ln(seconds / budget). Per section:
       bins     accuracy by time ratio, Jeffreys 80% intervals
       slope    logistic regression of correctness on r, with the tagged
                difficulty offset and an ability per attempt (prior N(1.20,
                1.22^2)) as controls; prior N(0, 3^2) on the slope. In
                logits per e-fold of time (r + 1 = 2.7 times as long).
     NO VERDICT FROM THE BUDGET (audit 2026-09-26): within a difficulty tier
     the questions that take longer are also the harder ones, so the slope
     against the budget is negative for a student whose accuracy does not
     depend on pace at all: "slower-less-accurate" 60% of the time when
     harder questions take 0.4 log-time longer per logit. slope/lo/hi stay
     as a description; verdict is null.
     opts.itemMeanSeconds { key: seconds } (optional): the roster's typical
     (geometric mean) time on each question. When it covers at least 90% of
     a section's timed answers (and `need` of them), the slope is refitted
     on ln(seconds / roster time) over the covered answers - how much longer
     than everyone else THIS student took on the same question - and only
     then is there a verdict: 'slower-more-accurate' (controlledLo > 0),
     'slower-less-accurate' (controlledHi < 0), else 'no-clear-link'.
     Measured 2026-09-26 (fix3-stats/speed.js, 1,000 students per row, 200
     timed math answers over 4 sittings from a 400-question pool, roster of
     15 others answering 150 each, map entries with 3+ roster times; guess
     0.25, item SD 0.7): accuracy independent of pace, harder questions
     slower or not: "less" 8.9%, "more" 9.9% of students given a verdict
     (83%) - nominal 10 / 10 - where the uncontrolled slope was negative
     55-62%; guess 0.15 (the author's model) 9.2 / 9.2%. A true effect of
     +0.5 logit per e-fold of the student's own extra time: "more" 23%.
     A student who gives up fast on hopeless questions is "more" 28% of the
     time: the association is real (quick answers are the wrong ones), the
     cause is not pace, which is why the note says descriptive.
     Returns { sections: { 'reading-writing'|'math': { ready, why, needs,
       whyNoVerdict, have, need,
       bins: [{ label, n, right, acc, lo, hi }], slope, lo, hi, verdict,
       covered, controlledSlope, controlledLo, controlledHi } }, controlled,
       note }. */
  var SPEED_BINS = [[-Infinity, Math.log(0.5), 'under half the target'], [Math.log(0.5), Math.log(0.8), '0.5-0.8x'],
                    [Math.log(0.8), Math.log(1.25), 'on target'], [Math.log(1.25), Math.log(2), '1.25-2x'], [Math.log(2), Infinity, 'over twice the target']];
  function solveLinear(A, b) { // Gaussian elimination with partial pivoting; A is small and positive definite
    var n = b.length, M = A.map(function (row, i) { return row.slice().concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var p = c;
      for (var r2 = c + 1; r2 < n; r2++) if (Math.abs(M[r2][c]) > Math.abs(M[p][c])) p = r2;
      var tmp = M[c]; M[c] = M[p]; M[p] = tmp;
      if (Math.abs(M[c][c]) < 1e-12) return null;
      for (var r3 = c + 1; r3 < n; r3++) {
        var f = M[r3][c] / M[c][c];
        for (var k = c; k <= n; k++) M[r3][k] -= f * M[c][k];
      }
    }
    var x = new Array(n);
    for (var i = n - 1; i >= 0; i--) {
      var s = M[i][n];
      for (var j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = s / M[i][i];
    }
    return x;
  }
  // MAP logistic fit: logit p = a[g] + o + beta * x; returns { beta, se }.
  function fitSlope(rows, nG) {
    var tauA = 1 / (IRT_POP_SD * IRT_POP_SD), tauB = 1 / 9, P = nG + 1;
    var th = []; for (var i = 0; i < nG; i++) th.push(IRT_POP_MU); th.push(0);
    var Hm = null;
    for (var it = 0; it < 100; it++) {
      var g = th.map(function (t2, j) { return j < nG ? -(t2 - IRT_POP_MU) * tauA : -t2 * tauB; });
      Hm = []; for (var a = 0; a < P; a++) { Hm.push([]); for (var b = 0; b < P; b++) Hm[a].push(a === b ? (a < nG ? tauA : tauB) : 0); }
      rows.forEach(function (r) {
        var p = sigm(th[r.g] + r.o + th[nG] * r.x), w = p * (1 - p), e = r.y - p;
        g[r.g] += e; g[nG] += e * r.x;
        Hm[r.g][r.g] += w; Hm[r.g][nG] += w * r.x; Hm[nG][r.g] += w * r.x; Hm[nG][nG] += w * r.x * r.x;
      });
      var step = solveLinear(Hm, g);
      if (!step) return null;
      var mx = 0;
      for (var q0 = 0; q0 < P; q0++) mx = Math.max(mx, Math.abs(step[q0]));
      var sc = mx > MAP_MAX_STEP ? MAP_MAX_STEP / mx : 1;   // the same step control as mapTheta
      for (var q = 0; q < P; q++) th[q] += sc * step[q];
      if (mx < 1e-8) break;
    }
    // The slope's variance: the last element of H^-1.
    var e2 = []; for (var z = 0; z < P; z++) e2.push(z === nG ? 1 : 0);
    var col = solveLinear(Hm, e2);
    return col ? { beta: th[nG], se: Math.sqrt(Math.max(0, col[nG])) } : null;
  }
  var SPEED_MAP_COVER = 0.9;   // share of timed answers the itemMeanSeconds map must cover
  function speedAccuracy(items, opts) {
    var need = (opts && opts.need) || G_NEED.speedAccuracy;
    var map = (opts && opts.itemMeanSeconds && typeof opts.itemMeanSeconds === 'object') ? opts.itemMeanSeconds : null;
    var out = { sections: {}, controlled: !!map,
                note: map ? 'Time measured against the roster\'s own time on each question, so a question that is slow for everyone does not count as slowing down; descriptive.'
                          : 'Accuracy by time spent; no verdict: without the roster\'s time on each question, slower questions are also harder ones.' };
    ['reading-writing', 'math'].forEach(function (sec) {
      var rows = [], ctl = [], groups = {}, nG = 0;
      (items || []).forEach(function (it) {
        if (!it || secKeyOf(it.sec) !== sec || !(it.seconds > 0) || !(it.budget > 0)) return;
        var y = okOf(it.ok);
        if (y === null) return;
        var gk = String(it.attempt === undefined ? '' : it.attempt);
        if (groups[gk] === undefined) groups[gk] = nG++;
        rows.push({ g: groups[gk], o: irtOff(it.diff), y: y, x: Math.log(it.seconds / it.budget) });
        var key = it.key !== undefined && it.key !== null ? it.key : it.qid;
        var mt = (map && key !== undefined && key !== null) ? Number(map[key]) : NaN;
        if (mt > 0) ctl.push({ g: groups[gk], o: irtOff(it.diff), y: y, x: Math.log(it.seconds / mt) });
      });
      if (!rows.length) return;
      var bins = SPEED_BINS.map(function (b) {
        var n = 0, k = 0;
        rows.forEach(function (r) { if (r.x >= b[0] && r.x < b[1]) { n++; k += r.y; } });
        var rr = rate(k, n); rr.label = b[2]; return rr;
      });
      var fit = fitSlope(rows, nG);
      var saReady = rows.length >= need && !!fit;
      var s = { ready: saReady, why: saReady ? null : (rows.length < need ? 'need-more-timed-answers' : 'fit-failed'),
                needs: { timedAnswers: { have: rows.length, need: need }, rosterCover: { have: map ? ctl.length / rows.length : null, need: SPEED_MAP_COVER } },
                whyNoVerdict: null, have: rows.length, need: need, bins: bins,
                slope: fit ? fit.beta : null, lo: fit ? fit.beta - Z80 * fit.se : null, hi: fit ? fit.beta + Z80 * fit.se : null, verdict: null,
                covered: map ? ctl.length : null, controlledSlope: null, controlledLo: null, controlledHi: null };
      if (map && ctl.length >= need && ctl.length >= SPEED_MAP_COVER * rows.length) {
        var cf = fitSlope(ctl, nG);
        if (cf) {
          s.controlledSlope = cf.beta; s.controlledLo = cf.beta - Z80 * cf.se; s.controlledHi = cf.beta + Z80 * cf.se;
          s.verdict = s.controlledLo > 0 ? 'slower-more-accurate' : (s.controlledHi < 0 ? 'slower-less-accurate' : 'no-clear-link');
        } else s.whyNoVerdict = 'fit-failed';
      } else s.whyNoVerdict = !map ? 'no-roster-times' : (ctl.length < need ? 'need-more-timed-answers' : 'roster-times-cover-too-little');
      out.sections[sec] = s;
    });
    return out;
  }

  /* -- G4. Practice before a test vs that test: practiceTransfer -------
     events: PracticeLog rows (first attempts only, 'retry'/'explain'
     left out, as practiceEvidence). attempts: as skillEvidence. For each
     test (hardest test left out) and each skill on it: the practice first
     attempts on that skill since the previous test (or in the
     opts.windowDays days before, when given) against the skill's residual
     on the test (S, V, W from the skill-grain content test; gap = S/W,
     logits below expectation). The association is a slope of gap on
     practice (per 10 questions) WITHIN skills (each skill's own averages
     removed), weighted by each gap's precision W^2/V.
     Returns { ready, have, need, maxWidth, pairs: [{ skill, test, at,
       practiced, practicedRight, n, S, V, gap }], slope, lo, hi, causal:
       false, note, why, needs: { pairs: { have, need }, width: { have,
       max } } }; ready needs `need` pairs AND an interval narrower than
       maxWidth (default 1.0 logit per 10 questions); why:
       'need-more-pairs' | 'practice-does-not-vary' | 'interval-too-wide'.
     A negative slope means gaps were smaller after more practice on the
     skill. It is not a cause: students practise what they already know is
     weak, and what Luca assigns. */
  function practiceTransfer(events, attempts, opts) {
    var need = (opts && opts.need) || G_NEED.practiceTransfer;
    var windowMs = (opts && opts.windowDays > 0) ? opts.windowDays * 86400000 : null;
    var seen = {}, first = [];
    byTime((events || []).filter(function (e) {
      return e && e.b !== 'retry' && e.b !== 'explain' && okOf(e.c) !== null && e.q !== undefined && isFinite(msOf(e.at));
    })).forEach(function (e) { var k = e.s + '|' + e.q; if (!seen[k]) { seen[k] = true; first.push(e); } });
    var tests = byTime((attempts || []).filter(function (a) { return a && Array.isArray(a.items) && isFinite(msOf(a.at)) && a.testId !== HARDEST_TEST_ID && a.id !== HARDEST_TEST_ID; }));
    var pairs = [], prevAt = -Infinity;
    tests.forEach(function (a) {
      var at = msOf(a.at), from = windowMs ? at - windowMs : prevAt;
      prevAt = at;
      var res = attemptResiduals(a.items, 'skill');
      if (!res) return;
      Object.keys(res.units).forEach(function (sk) {
        var u = res.units[sk], n = 0, k = 0;
        first.forEach(function (e) { var t = msOf(e.at); if (String(e.sk) === sk && t > from && t <= at) { n++; k += okOf(e.c); } });
        pairs.push({ skill: sk, test: a.testId || a.id || null, at: a.at, practiced: n, practicedRight: k, n: u.n, S: u.S, V: u.V, W: u.W, gap: u.W > 0 ? u.S / u.W : 0 });
      });
    });
    // Within-skill weighted slope.
    var bySkill = {};
    pairs.forEach(function (p) { (bySkill[p.skill] = bySkill[p.skill] || []).push(p); });
    var sxx = 0, sxy = 0, have = 0;
    Object.keys(bySkill).forEach(function (sk) {
      var ps = bySkill[sk].filter(function (p) { return p.W > 0 && p.V > 0; });
      if (ps.length < 2) return;
      var sw = 0, mx = 0, my = 0;
      ps.forEach(function (p) { var w = p.W * p.W / p.V; sw += w; mx += w * p.practiced / 10; my += w * p.gap; });
      mx /= sw; my /= sw;
      var varies = ps.some(function (p) { return Math.abs(p.practiced / 10 - mx) > 1e-9; });
      if (!varies) return;
      ps.forEach(function (p) { var w = p.W * p.W / p.V, dx = p.practiced / 10 - mx; sxx += w * dx * dx; sxy += w * dx * (p.gap - my); });
      have += ps.length;
    });
    var slope = sxx > 0 ? sxy / sxx : null, se = sxx > 0 ? 1 / Math.sqrt(sxx) : null;
    pairs.forEach(function (p) { delete p.W; });
    var maxW = (opts && typeof opts.maxWidth === 'number') ? opts.maxWidth : PRACTICE_TRANSFER_WIDTH;
    var width = slope === null ? null : 2 * Z80 * se;
    var ptReady = have >= need && slope !== null && width < maxW;
    return { ready: ptReady, why: ptReady ? null : (have < need ? 'need-more-pairs' : (slope === null ? 'practice-does-not-vary' : 'interval-too-wide')),
             needs: { pairs: { have: have, need: need }, width: { have: width, max: maxW } },
             have: have, need: need, maxWidth: maxW, pairs: pairs,
             slope: slope, lo: slope === null ? null : slope - Z80 * se, hi: slope === null ? null : slope + Z80 * se,
             causal: false, note: 'Association only, not a cause: practice is chosen, often because a skill is already weak.' };
  }

  /* -- G5. Portal time and sessions vs score change: doseResponse ------
     intervals: [{ from, to, scoreChange, portalMinutes, sessions,
     prevScore? }], one per pair of consecutive comparable tests, oldest
     first. REBUILT AS ANCOVA (audit 2026-09-26): the old slope of score
     change on portal time read regression to the mean as a dose effect -
     a student who studies more after a disappointing test gains more next
     time whether or not the study did anything, and the slope's 80%
     interval sat above 0 for 48-94% of such students (10% expected). Now
     each input gets its own least-squares fit
       scoreChange = a + b * prevScore + c * input + d * week
                     + e * log(1 + week)          (the last term: audit 4)
     so the previous score (how the last test went) and the student's
     steady trend (week of the interval's end) are held fixed; c is points
     per hour of portal time (perHour) or per session (perSession), with a
     t-based 80% interval on n - 4 df. prevScore is the earlier test's
     composite; without it the chain of changes stands in for it (the
     score before interval j is the first score plus the changes before j,
     and the unknown first score only moves the intercept), which needs the
     intervals consecutive (each `from` the previous `to`). Without either,
     or with an unreadable week, that fit is null.
     Measured 2026-09-26 (fix3-stats/dose.js, 4,000 students per row,
     levels U(900,1450), test noise from compositeSem; hours U-ish around
     2.5 +/- 1.2 per interval): a student whose score does not respond but
     who studies 0 / 0.5 / 1 SD more per SD the last test fell short:
     80% interval all above 0 10.6 / 10.5 / 10.6% and all below 8.8-9.0%
     at 16 tests, 9.9-10.2 / 9.3-9.5% at 25 (nominal 10 / 10; the old
     slope 48-94% above); growing 15 points a week meanwhile 10.8 / 8.9%;
     noise 1.15 x compositeSem 10.6 / 9.4%. A true dose of +10 / +20 points
     per portal hour (lasting): above 0 for 20 / 45% at 16 tests, 31 / 75%
     at 25.
     LEVELLING-OFF GROWTH (audit 4, 2026-09-26): a straight line in week
     cannot follow growth that slows down, and when portal time also falls
     over the term the leftover curvature was read as a dose: the per-hour
     interval sat below 0 for 15-26% of such students. Each fit now also
     holds log(1 + week) fixed (DOSE_CURVATURE 'log'; opts.curvature
     'square' | 'recip' | null for simulation). Measured (fix4-stats/
     dose4.js, 3,000 students per row, 16 tests unless said; 80% interval
     all above 0 / all below 0, nominal 10 / 10), before -> after:
       author, more study after a low test          10.4/10.6 -> 10.6/10.5
       author, +15 a week, react 0.5                10.6/9.8  -> 10.3/9.1
       harsh (1.15 x noise, t5), react 1            10.8/10.7 -> 10.5/10.6
       audit4 +200 levelling (tau 4), hours flat    10.3/9.5  -> 10.4/9.5
       ... hours falling over the term               5.3/17.8 -> 10.1/11.5
       ... hours rising toward test day             10.0/9.4  -> 10.5/9.5
       ... hours falling, 25 tests                   2.4/26.3 -> 10.1/9.6
       audit4 +250 levelling (tau 2), falling, 25    3.7/20.0 -> 12.0/7.9
       audit4 flat, hours falling                    9.9/10.2 -> 9.7/10.4
     week^2 left 12.9-13.0% below and 1/(1 + week) 14.7%. Cost: a true
     +10 / +20 points per hour is above 0 for 19 / 42% at 16 tests (was
     21 / 48%), 71% at 25 (was 76%).
     Returns { ready, why, needs: { intervals: { have, need },
       previousScores }, have, need, perHour: { slope, lo, hi } | null,
       perSession: { slope, lo, hi } | null, curvature, adjustedFor:
       ['previous score', 'week', 'leveling off (log of weeks)'], note }.
       why: null | 'need-more-intervals' | 'no-fit' (no previous scores and
       no chain, or a singular design). Descriptive: weeks with more
       practice differ from other weeks in more than practice. */
  // Least squares of y on [1, X...]; the coefficient of column `col` of X
  // with its t-based 80% interval, or null when the design is singular.
  function olsCoef(X, ys, col) {
    var n = ys.length, P = X[0] ? X[0].length + 1 : 1;
    if (n <= P) return null;
    var row = function (i) { return [1].concat(X[i]); };
    var A = [], b = [];
    for (var r = 0; r < P; r++) { A.push([]); for (var c = 0; c < P; c++) A[r].push(0); b.push(0); }
    for (var i = 0; i < n; i++) {
      var xi = row(i);
      for (var r2 = 0; r2 < P; r2++) { b[r2] += xi[r2] * ys[i]; for (var c2 = 0; c2 < P; c2++) A[r2][c2] += xi[r2] * xi[c2]; }
    }
    var beta = solveLinear(A, b);
    if (!beta) return null;
    var rss = 0;
    for (var k = 0; k < n; k++) { var xk = row(k), f = 0; for (var q = 0; q < P; q++) f += xk[q] * beta[q]; rss += (ys[k] - f) * (ys[k] - f); }
    var e = []; for (var z = 0; z < P; z++) e.push(z === col + 1 ? 1 : 0);
    var inv = solveLinear(A, e);
    if (!inv || !(inv[col + 1] > 0)) return null;
    var se = Math.sqrt(rss / (n - P) * inv[col + 1]), t = t80(n - P);
    if (!isFinite(se)) return null;
    return { slope: beta[col + 1], lo: beta[col + 1] - t * se, hi: beta[col + 1] + t * se };
  }
  var DOSE_CURVATURE = 'log';   // 2026-09-26: nulls 7.9-12.0% per side over 10 scenarios x 3 models (n 3,000 each; linear only: up to 26.3%); table above
  function doseResponse(intervals, opts) {
    var need = (opts && opts.need) || G_NEED.doseResponse;
    var rows = (intervals || []).filter(function (r) { return r && typeof r.scoreChange === 'number' && isFinite(r.scoreChange); });
    // The score before each interval: prevScore when given, else the chain.
    var chain = rows.every(function (r, i) { return i === 0 || (r.from !== undefined && r.from !== null && String(r.from) === String(rows[i - 1].to)); });
    var haveAll = rows.length > 0 && rows.every(function (r) { return typeof r.prevScore === 'number' && isFinite(r.prevScore); });
    var t0 = rows.length ? msOf(rows[0].to) : NaN, cum = 0, base = [];
    rows.forEach(function (r) {
      var w = (msOf(r.to) - t0) / (7 * 86400000);
      base.push({ prev: haveAll ? r.prevScore : ((chain || haveAll) ? cum : NaN), week: w, y: r.scoreChange, r: r });
      cum += r.scoreChange;
    });
    var curv = (opts && opts.curvature !== undefined) ? opts.curvature : DOSE_CURVATURE;
    var fit = function (get) {
      var X = [], y = [];
      base.forEach(function (b) {
        var v = get(b.r);
        if (!(typeof v === 'number' && isFinite(v)) || !isFinite(b.prev) || !isFinite(b.week)) return;
        var row = [b.prev, v, b.week];
        if (curv === 'log') row.push(Math.log(1 + Math.max(0, b.week)));
        else if (curv === 'square') row.push(b.week * b.week);
        else if (curv === 'recip') row.push(1 / (1 + Math.max(0, b.week)));
        X.push(row); y.push(b.y);
      });
      return X.length >= (curv ? 7 : 6) ? olsCoef(X, y, 1) : null;
    };
    var ph = fit(function (r) { return typeof r.portalMinutes === 'number' ? r.portalMinutes / 60 : NaN; });
    var ps = fit(function (r) { return r.sessions; });
    var drReady = rows.length >= need && !!(ph || ps);
    return { ready: drReady, why: drReady ? null : (rows.length < need ? 'need-more-intervals' : 'no-fit'),
             needs: { intervals: { have: rows.length, need: need }, previousScores: haveAll || chain },
             have: rows.length, need: need, perHour: ph, perSession: ps, curvature: curv || null,
             adjustedFor: curv ? ['previous score', 'week', 'leveling off (' + curv + ' of weeks)'] : ['previous score', 'week'],
             note: 'Adjusted for how the previous test went and the steady trend; still descriptive: busier weeks differ from quieter ones in more than portal time.' };
  }

  /* -- G6. Do explanations stick? explanationEffect --------------------
     events: PracticeLog rows. For each question first answered wrong, the
     next later attempt at it (any bank, 'retry' included; a twin names
     its original with `twin` or `of`) is the outcome. Explained: an
     'explain' row on that question between the miss and the later attempt
     with at least opts.minMs (default 5000) milliseconds in `ms`.
     Re-checked 2026-09-26 (audit): an explanation opened AFTER the later
     attempt already did not count; exact duplicate rows (an outbox
     resend) are now one event, and a "later" attempt stamped the same
     moment as the miss is not counted, so a resent miss is never read as
     a second wrong try. Only the first miss and the attempt after it count
     per question, so repeats cannot enter twice.
     Returns { ready, why, needs: { explained: { have, need },
       notExplained: { have, need } }, have, need, explained: rate,
       notExplained: rate, diff: { diff, lo, hi } | null, note }; ready
     needs `need` later attempts in EACH group. Descriptive: students open explanations on
     the questions they care about most. */
  function explanationEffect(events, opts) {
    var need = (opts && opts.need) || G_NEED.explanationEffect, minMs = (opts && typeof opts.minMs === 'number') ? opts.minMs : 5000;
    var keyOf = function (e) { return (e.s || '') + '|' + (e.twin !== undefined ? e.twin : (e.of !== undefined ? e.of : e.q)); };
    var byQ = {}, dup = {};
    byTime((events || []).filter(function (e) { return e && e.q !== undefined && isFinite(msOf(e.at)); })).forEach(function (e) {
      // The same row twice (an outbox resend) is one event, not a later attempt.
      var d = keyOf(e) + '|' + e.b + '|' + msOf(e.at) + '|' + e.c;
      if (dup[d]) return;
      dup[d] = true;
      (byQ[keyOf(e)] = byQ[keyOf(e)] || []).push(e);
    });
    var ex = { n: 0, k: 0 }, no = { n: 0, k: 0 };
    Object.keys(byQ).forEach(function (k) {
      var list = byQ[k], answers = list.filter(function (e) { return e.b !== 'explain' && okOf(e.c) !== null; });
      if (answers.length < 2 || okOf(answers[0].c) !== 0) return;
      var t0 = msOf(answers[0].at), t1 = msOf(answers[1].at);
      // A later attempt stamped the same moment as the miss is not later.
      if (!(t1 > t0)) return;
      var explained = list.some(function (e) { var t = msOf(e.at); return e.b === 'explain' && t >= t0 && t <= t1 && num(e.ms) >= minMs; });
      var g = explained ? ex : no;
      g.n++; g.k += okOf(answers[1].c);
    });
    var eeReady = ex.n >= need && no.n >= need;
    return { ready: eeReady, why: eeReady ? null : (ex.n < need ? 'need-more-explained' : 'need-more-not-explained'),
             needs: { explained: { have: ex.n, need: need }, notExplained: { have: no.n, need: need } },
             have: Math.min(ex.n, no.n), need: need,
             explained: rate(ex.k, ex.n), notExplained: rate(no.k, no.n),
             diff: (ex.n && no.n) ? betaDiff(ex.k + 0.5, ex.n - ex.k + 0.5, no.k + 0.5, no.n - no.k + 0.5) : null,
             note: 'Descriptive: explanations are opened on the questions a student cares about most.' };
  }

  /* -- G7. Does "sure" mean right? confidenceCalibration (2026-09-26) ---
     The confidence tap in untimed Question Bank and Challenge practice:
     events carry cf (2 sure, 1 unsure, 0 guessing), tapped BEFORE the
     answer was checked. FIRST tries only: a redo is tapped after seeing the
     answer, and would read as confidence it did not earn. Returns { ready,
     have, need, sure, unsure, guessing (each a rate: n, right, acc, lo, hi,
     Jeffreys 80%), diff: sure minus not-sure { diff, lo, hi } | null,
     verdict, sureWrong: [{ skill, n, wrong }], notSure, varied,
     informative, note, why, needs }. why (audit 4): 'need-more-sure' |
     'need-more-not-sure' | 'too-uniform' | null; needs: { sure: { have,
     need }, notSure: { have, need: 8 }, sureShare: { have, max: 0.95 } }.
     (Audit 4: 89% of "sure-heavy" students with have >= need were not
     ready and the admin said only "Collecting".)
     verdict (only when ready: 25+ sure first tries, see below):
       'overconfident'   the 80% interval on sure accuracy sits below 0.80:
                         answers they are sure of are wrong often enough
                         that some of what they "know" is a wrong rule;
       'calibrated'      it sits above 0.80;
       'unclear'         otherwise.
     Simulated before the 2026-09-26 tap-habit rule (conf-sim.js, 20,000
     per cell, 15 not-sure answers): sure answers truly 90% right are called overconfident 0.0-0.1% of the time
     at 25-80 sure answers, 85% right 0.7-2.2%; truly 70% right 48 / 56 /
     78% at 25 / 40 / 80, 65% right 69 / 80 / 96%.
     A TAP HABIT IS NOT A FINDING (audit 2026-09-26): a student who taps
     "Sure" as the submit button 80% of the time was called overconfident
     31-53% of the time. Now ready also needs CONF_MIN_NOT_SURE (8)
     not-sure first tries and "sure" on at most CONF_MAX_SURE_SHARE (95%)
     of the tapped first tries, and either verdict needs the tap to carry
     information: sure answers more accurate than not-sure ones (the 80%
     interval on the difference above 0, `informative`); otherwise
     'unclear'. Measured 2026-09-26 (fix3-stats/conf.js = the audit's
     g3-conf.js plus rows, 3,000 students per row, 150 first tries, guess
     0.25, item SD 0.7): Sure as the submit button 80% / 60% of the time,
     "overconfident" 2.6 / 1.9% at the student's own level and 4.5 / 4.1%
     on hard questions only (was 31 / 53%); honest (Sure iff own p > 0.75)
     0.4-0.6%, "calibrated" 29-39%, ready 50-66% (was 69-89%; the rest tap
     sure on nearly everything or have under 8 not-sure). Truly
     overconfident (Sure iff p > 0.45): "overconfident" 66-68% of ready
     students (ready 12-29%); sure on p plus noise SD 0.3 above 0.5: 6-13%.
     sureWrong: the skills where sure answers went wrong most (2+ of them),
     descriptive, biggest first: where to look for a misconception. */
  var CONF_SURE_BAR = 0.80;
  var CONF_MIN_NOT_SURE = 8;       // not-sure first tries needed before any verdict (2026-09-26)
  var CONF_MAX_SURE_SHARE = 0.95;  // ...and "sure" on at most this share of the tapped first tries
  function confidenceCalibration(events, opts) {
    var need = (opts && opts.need) || G_NEED.confidenceCalibration;
    var seen = {}, lv = [{ n: 0, k: 0 }, { n: 0, k: 0 }, { n: 0, k: 0 }], bySkill = {};
    byTime((events || []).filter(function (e) { return e && (e.b === 'qb' || e.b === 'chal' || e.b === 'challenge'); })).forEach(function (e) {
      var key = (e.s || '') + '|' + e.q;
      if (seen[key]) return;
      seen[key] = true;
      var cf = Number(e.cf), y = okOf(e.c);
      if (!(cf === 0 || cf === 1 || cf === 2) || e.cf === null || e.cf === '' || y === null) return;
      lv[cf].n++; lv[cf].k += y;
      if (cf === 2 && !y) { var sk = String(e.sk || '(no topic)'); bySkill[sk] = (bySkill[sk] || 0) + 1; }
      if (cf === 2) { var sk2 = String(e.sk || '(no topic)'); bySkill['n|' + sk2] = (bySkill['n|' + sk2] || 0) + 1; }
    });
    var sure = rate(lv[2].k, lv[2].n), unsure = rate(lv[1].k, lv[1].n), guessing = rate(lv[0].k, lv[0].n);
    var nsN = lv[1].n + lv[0].n, nsK = lv[1].k + lv[0].k;
    var diff = (lv[2].n && nsN) ? betaDiff(lv[2].k + 0.5, lv[2].n - lv[2].k + 0.5, nsK + 0.5, nsN - nsK + 0.5) : null;
    var sureWrong = Object.keys(bySkill).filter(function (k) { return k.indexOf('n|') !== 0 && bySkill[k] >= 2; })
      .map(function (k) { return { skill: k, n: bySkill['n|' + k] || 0, wrong: bySkill[k] }; })
      .sort(function (a, b) { return b.wrong - a.wrong || b.n - a.n; }).slice(0, 3);
    var tapped = lv[2].n + nsN;
    var varied = nsN >= CONF_MIN_NOT_SURE && tapped > 0 && lv[2].n <= CONF_MAX_SURE_SHARE * tapped;
    var informative = !!(diff && diff.lo > 0);
    var ready = lv[2].n >= need && varied;
    var why = ready ? null : (lv[2].n < need ? 'need-more-sure' : (nsN < CONF_MIN_NOT_SURE ? 'need-more-not-sure' : 'too-uniform'));
    var verdict = null;
    if (ready) verdict = !informative ? 'unclear'
      : (sure.hi < CONF_SURE_BAR ? 'overconfident' : (sure.lo > CONF_SURE_BAR ? 'calibrated' : 'unclear'));
    return { ready: ready, why: why, have: lv[2].n, need: need, notSure: nsN, varied: varied, informative: informative,
             needs: { sure: { have: lv[2].n, need: need }, notSure: { have: nsN, need: CONF_MIN_NOT_SURE },
                      sureShare: { have: tapped ? lv[2].n / tapped : null, max: CONF_MAX_SURE_SHARE } },
             sure: sure, unsure: unsure, guessing: guessing, diff: diff,
             verdict: verdict, sureWrong: sureWrong,
             note: 'First tries in untimed practice, tapped before the answer was checked; descriptive.' };
  }

  return {
    DEFAULTS: DEFAULTS,
    itemKey: itemKey,
    decodeSection: decodeSection,
    guessingLift: guessingLift,
    summarizeAttempt: summarizeAttempt,
    sumLedger: sumLedger,
    changeVerdict: changeVerdict,
    changeReading: changeReading,
    behaviorHighlights: behaviorHighlights,
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
    interruptionKind: interruptionKind,
    isInterruptedForTrend: isInterruptedForTrend,
    INTERRUPT_AWAY_MIN: INTERRUPT_AWAY_MIN,
    INTERRUPT_AWAY_MS: INTERRUPT_AWAY_MS,
    scoreChange: scoreChange,
    pairChange: pairChange,
    pairVerdict: pairVerdict,
    currentLevel: currentLevel,
    // Shared statistics (stats build, 2026-09-26)
    IRT_OFFSETS: IRT_OFFSETS,
    SKILL_EVIDENCE_GATES: SKILL_EVIDENCE_GATES,
    PRACTICE_GATES: PRACTICE_GATES,
    PARENT_Z: PARENT_Z,
    PAIR_Z: PAIR_Z,
    GAIN_GUARD_Z: GAIN_GUARD_Z,
    GAIN_OUTLIER_Z: GAIN_OUTLIER_Z,
    TARGET_GUARD_Z: TARGET_GUARD_Z,
    skillEvidence: skillEvidence,
    itemsFromQStats: itemsFromQStats,
    trailingRush: trailingRush, RUSH_REL: RUSH_REL, RUSH_MIN_RUN: RUSH_MIN_RUN, RUSH_CLOCK_SHARE: RUSH_CLOCK_SHARE,
    pacingHabits: pacingHabits, missProfile: missProfile,
    skillTrend: skillTrend,
    evidenceAttempts: evidenceAttempts,
    formDomainOffsets: formDomainOffsets,
    focusOf: focusOf,
    trendWithinFocus: trendWithinFocus,
    // Bumped with every change to what this file computes (audit 5): the
    // admin deploy check compares it, since an older copy can still have
    // every function name and compute the old way.
    VERSION: 32,
    attemptAbility: attemptAbility,
    FOCUS_GATES: { domainClear: FOCUS_DOMAIN_CLEAR, skillLead: FOCUS_SKILL_LEAD, noOffsetsPenalty: FOCUS_NO_OFFSETS_PENALTY },
    practiceEvidence: practiceEvidence,
    betaInterval: betaInterval,
    heldOnTwoReads: heldOnTwoReads,
    gainVerdict: gainVerdict,
    currentLevelAt: currentLevelAt,
    targetReached: targetReached,
    G_NEED: G_NEED,
    retryHolds: retryHolds,
    trapPull: trapPull,
    speedAccuracy: speedAccuracy,
    practiceTransfer: practiceTransfer,
    doseResponse: doseResponse,
    explanationEffect: explanationEffect,
    confidenceCalibration: confidenceCalibration
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = MorettiSignals;
if (typeof window !== 'undefined') window.MorettiSignals = MorettiSignals;
