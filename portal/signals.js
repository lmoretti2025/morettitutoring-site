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
    // Literature helping rate, at strength 2. Strength 6 (the report's
    // shrinkage) was tested and rejected: with 12-15 changes on record it
    // said "hurt" for only 8% of students whose changes truly go wrong 65%
    // of the time. Strength 2 raises that to 32% with false "hurt" verdicts
    // still at 0.1% (SIGNALS_SPEC.md section 3.1). Refit from real
    // students once 30+ have changes on record.
    changePrior: { mu: 0.73, kappa: 2 },
    gateProb: 0.90,         // a verdict needs this posterior probability...
    minFlips: 6,            // ...and at least this many correctness-flipping changes
    leanProb: 0.75,         // tutor-only "leaning" state
    ledgerDays: 90
  };
  function opt(o, k) { return (o && o[k] !== undefined) ? o[k] : DEFAULTS[k]; }

  /* ── small helpers ─────────────────────────────────────────────────── */
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
      return { raw: code, value: parseFloat(code) };
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
  function sameAnswer(a, b) {
    if (a === null || b === null) return a === b;
    if (typeof a === 'object' || typeof b === 'object') return !!(a && b && String(a.raw) === String(b.raw));
    return a === b;
  }

  /* ── one section's questions ────────────────────────────────────────
     sec:       a payload section ({k, a, m, sv, el, eu, vl, rv, co, cf, rf, tl, ...})
     questions: the section's questions in the same order as sec.a
                (Module 1 followed by the Module 2 variant that was served)
     cfg:       grade(q, answer) -> bool          required
                module1Length                     questions in Module 1 (default: all)
                moduleSec: [s1, s2]               allotted seconds per module (default: tl split evenly)
     Returns { recorded:false } for a section captured before signals existed. */
  function decodeSection(sec, questions, cfg) {
    if (!sec || sec.sv !== 1 || !Array.isArray(sec.vl) || !questions || !cfg || typeof cfg.grade !== 'function') {
      return { recorded: false };
    }
    var n = questions.length;
    var m1 = (cfg.module1Length > 0 && cfg.module1Length < n) ? cfg.module1Length : n;
    var nMods = m1 < n ? 2 : 1;
    var moduleSec = cfg.moduleSec || (sec.tl > 0 ? (nMods === 2 ? [sec.tl * 30, sec.tl * 30] : [sec.tl * 60]) : []);
    var glance = opt(cfg, 'glanceSec'), late = opt(cfg, 'lateSec'), active = opt(cfg, 'desmosActiveSec');
    var modOf = function (q) { return q < m1 ? 0 : 1; };

    var visits = [];
    for (var i = 0; i < n; i++) visits.push([]);
    sec.vl.forEach(function (v, order) {
      if (!Array.isArray(v) || v[0] < 0 || v[0] >= n) return;
      visits[v[0]].push({ t0: num(v[1]), dur: num(v[2]), end: v[3], sw: num(v[4]), order: order });
    });

    // Where each module's review phase starts: the first arrival on the
    // review page, else the end of the first look at the module's last
    // question, else never.
    var reviewStart = [];
    for (var m = 0; m < nMods; m++) {
      var rvm = Array.isArray(sec.rv) ? sec.rv[m] : null;
      if (typeof rvm === 'number') { reviewStart.push(rvm); continue; }
      var lastQ = m === 0 ? m1 - 1 : n - 1;
      var fl = visits[lastQ] && visits[lastQ][0];
      reviewStart.push(fl ? fl.t0 + fl.dur : Infinity);
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
      var changes = [], prev = null, initial = null, initialVisit = null, answeredAt = null, switches = 0;
      vs.forEach(function (v) {
        switches += v.sw;
        var a = logAnswer(Q, v.end);
        if (a === null) return;
        if (initial === null) { initial = a; initialVisit = v; answeredAt = v; }
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
      var firstReal = real[0] || null;
      var skipFirst = !!(firstReal && logAnswer(Q, firstReal.end) === null);
      var elFinal = hexAt(sec.el, q), elEver = hexAt(sec.eu, q) | elFinal;
      var isMc = Q.type !== 'fr';
      var keyBit = (isMc && typeof Q.correct === 'number') ? (1 << Q.correct) : 0;
      var cf = sec.cf && sec.cf[q];
      var rf = sec.rf && sec.rf[q];

      rows.push({
        q: q, module: mod, type: isMc ? 'mc' : 'fr', skill: Q.skill || Q.domain || null,
        difficulty: Q.difficulty || null,
        final: final, finalOk: finalOk, initial: initial,
        initialOk: initial !== null && cfg.grade(Q, initial),
        flagged: flagged,
        visits: vs.length, realVisits: real.length, revisits: Math.max(0, real.length - 1),
        timeSec: vs.reduce(function (s, v) { return s + v.dur; }, 0),
        changes: changes, switches: switches,
        skipFirst: skipFirst,
        skipThenAnswer: skipFirst && final !== null,
        answeredInReview: !!(answeredAt && answeredAt.t0 >= reviewStart[mod]),
        elFinal: elFinal, elEver: elEver,
        k: isMc ? 4 - popcount4(elFinal) : null,
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
      var gain = 0;
      inMod.forEach(function (r) {
        r.changes.forEach(function (c) {
          if (c.phase !== 'review') return;
          if (c.kind === 'WR') gain++; else if (c.kind === 'RW') gain--;
        });
        if (r.skipThenAnswer && r.answeredInReview && r.finalOk) gain++;
      });
      modules.push({
        module: mm, questions: inMod.length,
        reviewReached: Array.isArray(sec.rv) && typeof sec.rv[mm] === 'number',
        reviewStartSec: isFinite(rs) ? rs : null,
        reserveSec: (isFinite(rs) && moduleSec[mm] > 0) ? Math.max(0, moduleSec[mm] - rs) : null,
        reviewSec: reviewSec,
        reviewFlaggedShare: reviewSec > 0 ? reviewFlaggedSec / reviewSec : null,
        reviewGain: gain,
        skips: inMod.filter(function (r) { return r.skipFirst; }).length,
        skipAnswered: inMod.filter(function (r) { return r.skipThenAnswer; }).length,
        skipRight: inMod.filter(function (r) { return r.skipThenAnswer && r.finalOk; }).length
      });
    }
    return { recorded: true, sectionKey: sec.k, rows: rows, modules: modules };
  }

  /* ── the elimination-aware guessing correction ───────────────────────
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

  /* ── one attempt → the compact summary stored as SignalsJSON ─────────
     parts: [{ sec, questions, module1Length, moduleSec }]
     cfg:   grade(q, answer)                         required
            scoreSection(sectionKey, correct[], module1Length) -> scaled score   optional; enables dPts
            dz(q) -> 0|1|2                            optional; Desmos-favourability tag (not built yet)
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
      rev: [], calc: { mathQ: 0, active: 0, openOnly: 0, fav: null, favActive: null, favMissNoUse: null },
      ref: { opens: 0 }
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
          if (!r.finalOk && r.keyOutEver) {
            out.keyOut++;
            if (r.skill) out.keyOutBySkill[r.skill] = (out.keyOutBySkill[r.skill] || 0) + 1;
          }
          if (r.final !== null && !r.finalOk) {
            if (r.k === 2 && !r.keyOutFinal) out.near++;
            if (r.k === 4 && (r.difficulty === 'medium' || r.difficulty === 'hard')) out.blindMedHard++;
          }
        }
        out.ref.opens += r.refOpens;
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
          if (out.calc.fav === null) { out.calc.fav = 0; out.calc.favActive = 0; out.calc.favMissNoUse = 0; }
          rows.forEach(function (r, i) {
            if (cfg.dz(p.questions[i]) !== 2 || r.visits === 0) return;
            out.calc.fav++;
            if (r.calcActive) out.calc.favActive++;
            else if (!r.finalOk) out.calc.favMissNoUse++;
          });
        }
      }

      d.modules.forEach(function (m) {
        out.rev.push({
          sec: d.sectionKey, m: m.module,
          reached: m.reviewReached,
          reserve: m.reserveSec === null ? null : Math.round(m.reserveSec),
          mins: Math.round(m.reviewSec / 6) / 10,
          gain: m.reviewGain,
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
    lift.old = Math.round(lift.old * 100) / 100;
    lift.elim = Math.round(lift.elim * 100) / 100;
    return out;
  }

  /* ── pooling attempts ───────────────────────────────────────────────
     entries: [{ at: Date|ISO|ms, signals: summary }]. Sums the counts over
     the last `days` (default 90), all attempts weighted equally. */
  function sumLedger(entries, nowMs, days) {
    days = days || DEFAULTS.ledgerDays;
    var now = nowMs || Date.now(), since = now - days * 86400000;
    var L = { attempts: 0, chg: { h: 0, r: 0, ww: 0, sw: 0, unfl: { h: 0, r: 0 }, rev: { h: 0, r: 0 }, late: { h: 0, r: 0 } },
              near: 0, keyOut: 0, blindMedHard: 0, elim: { mc: 0, used: 0 },
              calc: { mathQ: 0, active: 0, fav: 0, favActive: 0, favMissNoUse: 0 } };
    (entries || []).forEach(function (e) {
      if (!e || !e.signals || e.signals.v !== 1) return;
      var t = e.at instanceof Date ? e.at.getTime() : (typeof e.at === 'number' ? e.at : Date.parse(e.at));
      if (!(t >= since && t <= now + 86400000)) return;
      var s = e.signals, c = s.chg || {};
      L.attempts++;
      L.chg.h += num(c.h); L.chg.r += num(c.r); L.chg.ww += num(c.ww); L.chg.sw += num(c.sw);
      ['unfl', 'rev', 'late'].forEach(function (k) { if (c[k]) { L.chg[k].h += num(c[k].h); L.chg[k].r += num(c[k].r); } });
      L.near += num(s.near); L.keyOut += num(s.keyOut); L.blindMedHard += num(s.blindMedHard);
      if (s.elim) { L.elim.mc += num(s.elim.mc); L.elim.used += num(s.elim.used); }
      if (s.calc) {
        L.calc.mathQ += num(s.calc.mathQ); L.calc.active += num(s.calc.active);
        L.calc.fav += num(s.calc.fav); L.calc.favActive += num(s.calc.favActive); L.calc.favMissNoUse += num(s.calc.favMissNoUse);
      }
    });
    return L;
  }

  /* ── Beta machinery ─────────────────────────────────────────────── */
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

  /* ── do this student's answer changes help? ─────────────────────────
     h = changes wrong->right, r = right->wrong (pooled). Each such change
     helps with unknown probability p; prior Beta with mean mu (the
     literature's ~0.73) and strength kappa. A verdict needs the posterior
     probability on one side of 0.5 to reach gateProb AND at least minFlips
     changes, so a parent is never told a child's instincts betray them on
     a handful of data points. */
  function changeVerdict(h, r, cfg) {
    var prior = opt(cfg, 'changePrior');
    var a = prior.mu * prior.kappa + num(h), b = (1 - prior.mu) * prior.kappa + num(r);
    var pHurt = betaCdf(0.5, a, b), pHelp = 1 - pHurt, flips = num(h) + num(r);
    var gate = opt(cfg, 'gateProb'), lean = opt(cfg, 'leanProb'), minF = opt(cfg, 'minFlips');
    var state = 'silent';
    if (flips >= minF && pHelp >= gate) state = 'help';
    else if (flips >= minF && pHurt >= gate) state = 'hurt';
    else if (pHelp >= lean && flips > 0) state = 'lean-help';
    else if (pHurt >= lean && flips > 0) state = 'lean-hurt';
    return {
      state: state, h: num(h), r: num(r), flips: flips,
      mean: a / (a + b), pHelp: pHelp, pHurt: pHurt,
      ci80: [betaQuantile(0.10, a, b), betaQuantile(0.90, a, b)]
    };
  }

  /* ── what a parent may be told ──────────────────────────────────────
     Gated, structured facts; the wording lives in the email templates.
     Only facts whose gates pass are returned (SIGNALS_SPEC.md section 5):
     nothing here says "not enough data". Frequency limits (once every
     three weeks per habit) are the sender's job, since only it knows what
     went out before. */
  function parentFacts(ledger, last, cfg) {
    var facts = [];
    if (ledger && ledger.chg) {
      var v = changeVerdict(ledger.chg.h, ledger.chg.r, cfg);
      if (v.state === 'help') facts.push({ id: 'changes-help', fixed: v.h, of: v.flips });
      if (v.state === 'hurt') facts.push({ id: 'changes-hurt', broke: v.r, of: v.flips });
    }
    if (last) {
      if (num(last.near) >= 4) facts.push({ id: 'near-misses', count: last.near });
      var ko = last.keyOutBySkill || {};
      Object.keys(ko).forEach(function (skill) { if (ko[skill] >= 2) facts.push({ id: 'key-out', skill: skill, count: ko[skill] }); });
      (last.rev || []).forEach(function (m) {
        if (m.reached && m.reserve !== null) facts.push({ id: 'review-pass', sec: m.sec, module: m.m, reserveSec: m.reserve, gain: m.gain });
      });
      if (last.calc && num(last.calc.favMissNoUse) >= 4) {
        facts.push({ id: 'desmos', used: last.calc.favActive, of: last.calc.fav });
      }
    }
    return facts;
  }

  return {
    DEFAULTS: DEFAULTS,
    itemKey: itemKey,
    decodeSection: decodeSection,
    guessingLift: guessingLift,
    summarizeAttempt: summarizeAttempt,
    sumLedger: sumLedger,
    changeVerdict: changeVerdict,
    parentFacts: parentFacts,
    wilson: wilson,
    betaCdf: betaCdf,
    betaQuantile: betaQuantile
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = MorettiSignals;
if (typeof window !== 'undefined') window.MorettiSignals = MorettiSignals;
