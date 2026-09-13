/* =====================================================================
   MORETTI TIME BUDGETS — how long a question SHOULD take, by skill and
   difficulty, and how that scales for a student with extended time.

   WHY THIS EXISTS
   ---------------
   The pacing reads in report.html/index.html are relative to the
   student's OWN section median (pacingTimeMs(), RUSHED_REL/STUCK_REL).
   That misses a uniformly slow student, and it cannot say "95s on a Words
   in Context question that should cost 45". So this adds an ABSOLUTE
   budget per (skill, difficulty), authored from the strategy doctrine.
   The self-relative flags stay; this is additive.

   THE ORDERING RULE
   -----------------
   Everything under INFORMATION AND IDEAS takes the longest: its floor
   must stay above the ceiling of every other R&W domain. Checked at load
   by assertDomainOrdering_().

   The budgets deliberately sum to LESS than the section clock: the gap
   is the surplus banked on fast skills and spent on slow ones, which the
   report's banking read measures.

   ACCOMMODATIONS
   --------------
   Budgets scale linearly by the time multiplier (1, 1.5, 2), keeping the
   relative structure of fast vs. slow skills identical.

   The multiplier is recovered from a saved report with no payload change
   (timeMultFromAllotted()): `tl` is the accommodation-adjusted allotment
   from allottedMinutesFor() in index.html, and the un-adjusted baseline
   is a constant in banks.js, so tl / baseline is the multiplier.

   TAXONOMY: one canonical domain per skill
   -----------------------------------------
   RW_SKILLS below is the single source of truth for domains.
   canonicalize() derives a question's domain from its skill rather than
   the stored label, so a future import can't reintroduce mismatched
   domain labels across the bank files.

   Cross-Text Connections: College Board files it under Craft and
   Structure, but Luca's banks file it under Information and Ideas, and
   that is the only placement that keeps the ordering rule satisfiable (it
   is the most expensive R&W type at 105s). To move it, change its
   RW_SKILLS entry and retag the banks to match.
   ===================================================================== */
(function () {
  'use strict';

  /* ── SAT Reading & Writing ─────────────────────────────────────────
     Base seconds per question (real module clock: 32 min for 27 questions,
     71s average), longest-first within each domain. `dom` is the canonical
     domain; the report reads it instead of q.domain (see header). */
  var RW_SKILLS = {
    // Information and Ideas: the longest, all of them. These require reading
    // and holding a passage (or two) before any answer work, so the budget
    // covers the read, not just the choice.
    'Cross-Text Connections':               { sec: 105, dom: 'Information and Ideas' },
    // Command of Evidence is split by evidence type, as the banks tag it:
    // quantitative items carry a table or graph, textual ones are prose.
    // Same budget for now (giving quantitative more is a doctrine call).
    // Bare "Command of Evidence" stays so older saved reports still resolve.
    'Command of Evidence (Quantitative)':   { sec:  95, dom: 'Information and Ideas' },
    'Command of Evidence (Textual)':        { sec:  95, dom: 'Information and Ideas' },
    'Command of Evidence':                  { sec:  95, dom: 'Information and Ideas' },
    'Inferences':                           { sec:  90, dom: 'Information and Ideas' },
    'Central Ideas and Details':            { sec:  85, dom: 'Information and Ideas' },

    // Craft and Structure.
    'Text Structure and Purpose':           { sec:  70, dom: 'Craft and Structure' },
    'Words in Context':                     { sec:  45, dom: 'Craft and Structure' },

    // Expression of Ideas.
    'Rhetorical Synthesis':                 { sec:  60, dom: 'Expression of Ideas' },
    'Transitions':                          { sec:  45, dom: 'Expression of Ideas' },

    // Standard English Conventions — rule recognition. Should be near
    // instant; if it isn't, the rule isn't known and no amount of extra
    // time on the question fixes that.
    'Boundaries':                           { sec:  40, dom: 'Standard English Conventions' },
    'Form, Structure, and Sense':           { sec:  40, dom: 'Standard English Conventions' }
  };

  /* ── SAT Math ───────────────────────────────────────────────────────
     Budgets key off DIFFICULTY first (the dominant driver), with a
     per-domain multiplier on top. Module clock is 35 min for 22 questions
     (95s average). Cut 15% across the board (Luca, 2026-09-12: the math
     targets read as too slow; was 48 / 75 / 115). A typical module's
     targets now add up to about 25 of its 35 minutes, leaving about 10 for
     going back and the hardest questions, and only 4 of the 39 math modules
     still need the MAX_BUDGET_SHARE squeeze below (13 did before). */
  var MATH_BY_DIFFICULTY = { easy: 41, medium: 64, hard: 98 };
  var MATH_DOMAIN_MULT = {
    // Procedural. If these aren't fast, it's fluency, not reasoning.
    'Algebra': 0.9,
    // Multi-step manipulation before the reasoning even starts.
    'Advanced Math': 1.1,
    // Chart/table reading is real overhead on top of the math itself.
    'Problem-Solving and Data Analysis': 1.05,
    'Geometry and Trigonometry': 1.0
  };

  /* Fallback for a skill/domain missing from the tables above (a new
     import or renamed skill): the section's average pace, so it counts as
     exactly average rather than a huge overrun. Flagged via `.estimated`. */
  var SECTION_AVERAGE_SECONDS = {
    'reading-writing': 71,
    'math':            95
  };

  /* Un-accommodated per-MODULE minutes, mirroring
     window.SECTION_MODULE_TIME_LIMITS in banks.js. Duplicated on purpose so
     a saved report's multiplier can be recovered even when banks.js is not
     loaded; these are fixed real-exam clocks. sectionBaselineMinutes()
     prefers the live banks.js value when present. */
  var MODULE_MINUTES = {
    'reading-writing': 32,
    'math':            35
  };
  /* Sections that run as two separately timed modules (whole-section
     allotment is 2× the per-module figure). Mirrors sectionHasModules() in
     index.html. A map so a non-modular section can be added without
     touching sectionBaselineMinutes(). */
  var TWO_MODULE_SECTIONS = { 'reading-writing': 1, 'math': 1 };

  /* Supported accommodation multipliers. A recovered ratio is snapped to
     the nearest of these rather than used raw, so floating-point noise
     in tl (or a hand-edited allotment) can't produce a 1.4993× budget. */
  var SUPPORTED_MULTS = [1, 1.5, 2];

  /* ── skill-name normalization ───────────────────────────────────────
     Collapses casing and wording variants across the bank files onto one
     canonical spelling, so budget lookups and per-skill rollups land in
     the same bucket. Keys are lowercased-and-squeezed. */
  var SKILL_ALIASES = {
    // Retired spellings, so older saved reports still resolve. Case and
    // punctuation variants are folded by normalizeSkill() and need no entry;
    // only spellings whose WORDS changed go here.
    'ratios, rates, proportions, and units': 'Ratios, Rates, Proportional Relationships, and Units',
    'linear inequalities':                'Linear Inequalities in One or Two Variables',
    'systems of linear equations':        'Systems of Two Linear Equations in Two Variables',
    'one-variable data':                  'One-Variable Data: Distributions and Measures of Center and Spread',
    'nonlinear equations and systems':    'Nonlinear Equations in One Variable and Systems of Equations in Two Variables',
    'probability':                        'Probability and Conditional Probability',
    'text, structure, and purpose':       'Text Structure and Purpose',
    'form structure and sense':           'Form, Structure, and Sense'
  };

  function squeeze_(s) {
    return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  }
  function normalizeSkill(skill) {
    var raw = squeeze_(skill);
    if (!raw) return '';
    var alias = SKILL_ALIASES[raw.toLowerCase()];
    if (alias) return alias;
    // Case-insensitive match against the R&W table, so a bank that writes
    // "Words In Context" still lands on "Words in Context".
    var lower = raw.toLowerCase();
    for (var k in RW_SKILLS) {
      if (RW_SKILLS.hasOwnProperty(k) && k.toLowerCase() === lower) return k;
    }
    return raw;
  }

  /* The four canonical SAT Reading & Writing domains. Used as the guard
     on the domain-derivation below — see canonicalize(). */
  var RW_DOMAINS = {
    'Information and Ideas': 1,
    'Craft and Structure': 1,
    'Expression of Ideas': 1,
    'Standard English Conventions': 1
  };

  /* Returns { skill, domain } with the domain DERIVED from the skill
     wherever this file knows the skill, as a guard against an import
     reintroducing mislabeled domains. Derivation only applies when the
     question already carries an SAT R&W domain (or none), so a Math
     question is never rewritten by an R&W skill-name collision. */
  function canonicalize(domain, skill) {
    var sk = normalizeSkill(skill || domain);
    var rawDomain = squeeze_(domain);
    var known = RW_SKILLS[sk];
    var derivable = known && (!rawDomain || RW_DOMAINS[rawDomain]);
    return { skill: sk, domain: derivable ? known.dom : rawDomain };
  }

  /* ── the budget lookup ──────────────────────────────────────────────
     Returns { seconds, ms, estimated, basis }. `estimated` true means the
     section average was substituted, so callers can exclude it from a
     strategy-compliance count.

     timeMult is the accommodation multiplier (1 / 1.5 / 2); pass 1, or the
     value from timeMultFromAllotted(). */
  function budgetSecondsFor(sectionKey, domain, skill, difficulty, timeMult) {
    var mult = normalizeMult(timeMult);
    var canon = canonicalize(domain, skill);
    var diff = squeeze_(difficulty).toLowerCase();
    var base = null, basis = '';

    if (sectionKey === 'reading-writing') {
      var rw = RW_SKILLS[canon.skill];
      if (rw) { base = rw.sec; basis = 'skill'; }
    } else if (sectionKey === 'math') {
      var mBase = MATH_BY_DIFFICULTY[diff];
      if (mBase) {
        base = mBase * (MATH_DOMAIN_MULT[canon.domain] || 1);
        basis = 'difficulty+domain';
      }
    }

    var estimated = false;
    if (base === null) {
      base = SECTION_AVERAGE_SECONDS[sectionKey] || 70;
      estimated = true;
      basis = 'section average';
    }
    var seconds = base * mult;
    return { seconds: seconds, ms: seconds * 1000, estimated: estimated, basis: basis, mult: mult };
  }

  /* ── accommodation multiplier ───────────────────────────────────────
     Snaps a number to the nearest supported multiplier. Anything falsy,
     <1, or wildly out of range becomes 1: a bad value means "no
     accommodation", never a nonsense budget. */
  function normalizeMult(v) {
    var n = Number(v);
    if (!isFinite(n) || n <= 1) return 1;
    if (n > 2.5) return 2;
    var best = 1, bestGap = Infinity;
    for (var i = 0; i < SUPPORTED_MULTS.length; i++) {
      var gap = Math.abs(n - SUPPORTED_MULTS[i]);
      if (gap < bestGap) { bestGap = gap; best = SUPPORTED_MULTS[i]; }
    }
    return best;
  }

  /* Un-accommodated whole-section minutes for a section key. Prefers the
     live banks.js constant so it matches the timer the test ran on; falls
     back to this file's copy when banks.js isn't loaded or lacks the key. */
  function sectionBaselineMinutes(sectionKey, hasModules) {
    var live = window.SECTION_MODULE_TIME_LIMITS || null;
    var perModule = (live && (live[sectionKey] || live[sectionKey === 'reading-writing' ? 'readingWriting' : sectionKey]))
      || MODULE_MINUTES[sectionKey] || 0;
    if (!perModule) return 0;
    var two = (hasModules === undefined) ? !!TWO_MODULE_SECTIONS[sectionKey] : !!hasModules;
    return two ? perModule * 2 : perModule;
  }

  /* Recovers the multiplier a saved attempt was taken under from its `tl`:
     allottedMinutesFor() in index.html computed tl as baseline × timeMult,
     so dividing it back out needs no new field or migration. Returns 1
     when tl is absent/zero (older reports), which under-claims rather than
     over-claims. */
  function timeMultFromAllotted(sectionKey, hasModules, allottedMinutes) {
    var allotted = Number(allottedMinutes);
    if (!isFinite(allotted) || allotted <= 0) return 1;
    var baseline = sectionBaselineMinutes(sectionKey, hasModules);
    if (!baseline) return 1;
    return normalizeMult(allotted / baseline);
  }

  function multLabel(mult) {
    var m = normalizeMult(mult);
    return m === 2 ? 'double time' : (m === 1.5 ? 'time and a half' : 'standard time');
  }

  /* ── budget scaling for an unusually hard module ────────────────────
     A budget that exceeds the clock tells EVERY student they're behind.
     Some adaptive "Module 2 Harder" sets in practice-tests.js are far more
     hard-tagged than a real module (sat-practice-6 math module 2 is 16 hard
     of 22), so their raw budget sum exceeds the 35-minute clock.

     So raw budgets are a RELATIVE allocation: if a module's raw sum exceeds
     MAX_BUDGET_SHARE of its clock, every budget in it is scaled down by one
     uniform factor. Uniform scaling keeps the relative teaching intact
     while making the target reachable.

     The factor is mult-invariant (budget and clock both scale with the
     multiplier), so it is computed once against the un-accommodated
     baseline. Callers see whether it fired via `.scale` on the rollup. */
  var MAX_BUDGET_SHARE = 0.92;

  /* baselineMinutes is the UN-accommodated whole-section clock — pass the
     standard-time figure even for an extended-time attempt, since the
     factor is mult-invariant (see above). */
  function budgetScaleFor(sectionKey, rows, baselineMinutes) {
    if (!(baselineMinutes > 0) || !rows || !rows.length) return 1;
    var raw = 0;
    rows.forEach(function (r) {
      if (!r || !r.q) return;
      raw += budgetSecondsFor(sectionKey, r.q.domain, r.q.skill || r.dom, r.q.difficulty, 1).seconds;
    });
    if (!raw) return 1;
    var ceiling = baselineMinutes * 60 * MAX_BUDGET_SHARE;
    return raw > ceiling ? ceiling / raw : 1;
  }

  /* ── section-level rollup ───────────────────────────────────────────
     Given report.html-style rows for one section ({ q: {domain, skill,
     difficulty, type}, ok, timeMs, firstVisitMs, sk, dom }), returns the
     numbers every consumer needs.

     `actualMsFor` is injected so the caller picks the time measure
     (report.html's pacingTimeMs). It should be the FIRST-LOOK time: a
     budget describes what deciding the question costs. Return trips are
     counted separately as `revisit`. */
  function sectionBudgetRollup(sectionKey, rows, timeMult, actualMsFor, opts) {
    var getMs = actualMsFor || function (r) { return (r.firstVisitMs != null) ? r.firstVisitMs : r.timeMs; };
    var mult = normalizeMult(timeMult);
    var o = opts || {};
    // Un-accommodated clock, used only to decide whether the raw budgets
    // need compressing (see budgetScaleFor). Derived from the adjusted
    // allotment when given, so it holds for extended-time attempts.
    var baselineMin = (Number(o.allottedMinutes) > 0)
      ? Number(o.allottedMinutes) / mult
      : sectionBaselineMinutes(sectionKey, o.hasModules);
    var scale = budgetScaleFor(sectionKey, rows, baselineMin);
    var out = {
      mult: mult, scale: scale, compressed: scale < 0.999,
      revisit: { ms: 0, questions: 0, flaggedMs: 0, flaggedQuestions: 0, unflaggedMs: 0, unflaggedQuestions: 0 },
      budgetMs: 0, actualMs: 0, counted: 0, estimatedCount: 0,
      overCount: 0, underCount: 0, onPaceCount: 0,
      correctOverBudget: 0,
      // The rows behind that count, so a report can show WHICH questions.
      // Collected next to the test that defines them so list and count agree.
      correctOverBudgetRows: [],
      surplusMs: 0, overrunMs: 0,
      skills: {}
    };
    // On-pace band: within ±25% of budget. Wide on purpose — the point is
    // to catch a systematic pattern, not to police a student for taking
    // 52s on a 45s question.
    var BAND = 0.25;

    rows.forEach(function (r) {
      if (!r || !r.q) return;
      var actual = getMs(r);
      if (!(actual > 0)) return; // never visited, or a report with no timing
      var canon = canonicalize(r.q.domain, r.q.skill || r.dom);
      var b = budgetSecondsFor(sectionKey, r.q.domain, r.q.skill || r.dom, r.q.difficulty, mult);
      var budgetMs = b.ms * scale;
      var delta = actual - budgetMs;

      out.counted++;
      out.budgetMs += budgetMs;
      out.actualMs += actual;
      if (b.estimated) out.estimatedCount++;

      // Return trips: time on this question BEYOND its first look. Only
      // computed where both measures exist; a report without the fp field
      // reports no revisit time rather than guessing.
      if (r.firstVisitMs != null && typeof r.timeMs === 'number' && r.timeMs > r.firstVisitMs) {
        var back = r.timeMs - r.firstVisitMs;
        out.revisit.ms += back;
        out.revisit.questions++;
        // Flagged vs not is the verdict: returning to a question marked for
        // review is the review pass working; returning to an unmarked one is
        // second-guessing a committed answer.
        if (r.marked) { out.revisit.flaggedMs += back; out.revisit.flaggedQuestions++; }
        else { out.revisit.unflaggedMs += back; out.revisit.unflaggedQuestions++; }
      }

      if (delta > budgetMs * BAND) { out.overCount++; out.overrunMs += delta; }
      else if (delta < -budgetMs * BAND) { out.underCount++; out.surplusMs += -delta; }
      else out.onPaceCount++;

      // A right answer that cost well over budget is a STRATEGY failure even
      // though it scored: the key read this file exists to make.
      if (r.ok && delta > budgetMs * BAND) { out.correctOverBudget++; out.correctOverBudgetRows.push(r); }

      var s = out.skills[canon.skill] || (out.skills[canon.skill] = {
        skill: canon.skill, domain: canon.domain,
        n: 0, correct: 0, budgetMs: 0, actualMs: 0, estimated: b.estimated
      });
      s.n++;
      if (r.ok) s.correct++;
      s.budgetMs += budgetMs;
      s.actualMs += actual;
    });

    out.debtMs = out.actualMs - out.budgetMs;
    Object.keys(out.skills).forEach(function (k) {
      var s = out.skills[k];
      s.debtMs = s.actualMs - s.budgetMs;
      s.perQuestionDebtMs = s.n ? s.debtMs / s.n : 0;
      s.ratio = s.budgetMs ? s.actualMs / s.budgetMs : 1;
    });
    return out;
  }

  /* Sorted skill rows, worst overrun first. `minN` gates out a skill with
     too few questions to read as a pattern rather than one bad question. */
  function rankedSkillDebt(rollup, minN) {
    var floor = minN || 2;
    return Object.keys(rollup.skills)
      .map(function (k) { return rollup.skills[k]; })
      .filter(function (s) { return s.n >= floor && !s.estimated; })
      .sort(function (a, b) { return b.debtMs - a.debtMs; });
  }

  /* ── self-check ─────────────────────────────────────────────────────
     Enforces the ordering rule at load: the FLOOR of Information and Ideas
     must stay above the CEILING of every other R&W domain. Logs rather than
     throws, so a mis-ordered budget shows in the console without breaking
     a student's report. */
  function assertDomainOrdering_() {
    var iiFloor = Infinity, otherCeil = -Infinity, otherName = '';
    for (var k in RW_SKILLS) {
      if (!RW_SKILLS.hasOwnProperty(k)) continue;
      var e = RW_SKILLS[k];
      if (e.dom === 'Information and Ideas') {
        if (e.sec < iiFloor) iiFloor = e.sec;
      } else if (e.sec > otherCeil) {
        otherCeil = e.sec; otherName = k;
      }
    }
    if (iiFloor <= otherCeil && window.console && console.warn) {
      console.warn('[time-budgets] Ordering rule broken: Information and Ideas floor (' +
        iiFloor + 's) is not above the highest non-Information-and-Ideas budget (' +
        otherName + ', ' + otherCeil + 's). Every Information and Ideas skill is ' +
        'supposed to take longer than every other R&W skill.');
    }
  }
  assertDomainOrdering_();

  window.TIME_BUDGETS = {
    RW_SKILLS: RW_SKILLS,
    MATH_BY_DIFFICULTY: MATH_BY_DIFFICULTY,
    MATH_DOMAIN_MULT: MATH_DOMAIN_MULT,
    SUPPORTED_MULTS: SUPPORTED_MULTS,
    normalizeSkill: normalizeSkill,
    canonicalize: canonicalize,
    budgetSecondsFor: budgetSecondsFor,
    normalizeMult: normalizeMult,
    budgetScaleFor: budgetScaleFor,
    MAX_BUDGET_SHARE: MAX_BUDGET_SHARE,
    multLabel: multLabel,
    sectionBaselineMinutes: sectionBaselineMinutes,
    timeMultFromAllotted: timeMultFromAllotted,
    sectionBudgetRollup: sectionBudgetRollup,
    rankedSkillDebt: rankedSkillDebt
  };
})();
