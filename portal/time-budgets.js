/* =====================================================================
   MORETTI TIME BUDGETS — how long a question SHOULD take, by skill and
   difficulty, and how that scales for a student with extended time.

   WHY THIS EXISTS
   ---------------
   Every pacing read in report.html/index.html up to now was measured
   against the student's OWN median on that section (see pacingTimeMs()
   and the RUSHED_REL/STUCK_REL cutoffs). That self-relative baseline has
   two blind spots this file closes:

     1. A UNIFORMLY slow student never flags. Everything sits near their
        own median, so no cutoff fires — right up until they leave eight
        questions blank at the buzzer.
     2. It cannot name a strategy failure. "You spent 95s on a Words in
        Context question that should cost 45" is the sentence Luca
        actually teaches; a self-relative median can never produce it,
        because the 95s IS that student's median.

   So: an ABSOLUTE budget per (skill, difficulty), authored from the
   strategy doctrine rather than from the student. The self-relative
   flags stay exactly as they are — they answer a different question
   ("was this rushed FOR THIS STUDENT") and both reads are useful. This
   is additive.

   THE ORDERING RULE
   -----------------
   Per Luca: everything under INFORMATION AND IDEAS takes the longest.
   That's enforced structurally below (see assertDomainOrdering_) rather
   than left to whoever next edits a number — the floor of Information
   and Ideas must stay above the ceiling of every other R&W domain, and
   this file logs a warning if an edit ever breaks that.

   The budgets deliberately sum to LESS than the section clock. That gap
   is the point: it's the surplus a student banks on fast skills and
   spends on slow ones, and it's what the report's banking read measures.

   ACCOMMODATIONS
   --------------
   Budgets scale linearly by the student's time multiplier (1, 1.5, 2).
   Extended time multiplies the clock, so it multiplies the per-question
   budget by the same factor — which keeps the RELATIVE structure (fast
   skills vs. slow skills) identical, and that relative structure is what
   the strategy teaching is actually about. A double-time student should
   still be spending roughly twice as long on Cross-Text Connections as
   on Boundaries; only the absolute seconds move.

   Crucially, the multiplier can be RECOVERED from an already-saved
   report — no payload change, and this works retroactively on every
   attempt already stored. See timeMultFromAllotted(): the report payload
   stores `tl` (total minutes allotted, already accommodation-adjusted by
   allottedMinutesFor() in index.html), and the un-adjusted baseline is a
   constant in banks.js, so tl / baseline IS the multiplier the student
   sat under.

   TAXONOMY — one canonical domain per skill
   -----------------------------------------
   The bank files used to disagree with each other about domains:
   "Transitions" was filed under Standard English Conventions in
   practice-tests.js, "Text Structure and Purpose" under Information and
   Ideas, "Cross-Text Connections" under Craft and Structure in two files
   and Information and Ideas in a third. Skill NAMES were consistent;
   domain labels were not. All 33 offending records have been retagged in
   the bank files themselves, and RW_SKILLS below is now the single
   source of truth: canonicalize() derives a question's domain from its
   skill rather than trusting the stored label, so a future import can't
   quietly reintroduce the drift.

   On Cross-Text Connections specifically: College Board's published
   blueprint files it under Craft and Structure, but Luca's banks file it
   under Information and Ideas (59 records to 3), and that's what the
   retag standardized on — it's also the only reading of it that keeps
   the ordering rule above satisfiable, since Cross-Text is the single
   most expensive R&W question type at 105s. To move it, change its one
   entry in RW_SKILLS below and retag the banks to match.
   ===================================================================== */
(function () {
  'use strict';

  /* ── SAT Reading & Writing ─────────────────────────────────────────
     Base seconds per question, against a real module clock of 32 min
     for 27 questions (71s average). Ordered longest-first within each
     domain. `dom` is the canonical domain for this skill — the report
     reads THIS, not q.domain, for the reason in the header comment. */
  var RW_SKILLS = {
    // Information and Ideas — the longest, all of them. These are the
    // questions that require actually reading and holding a passage (or
    // two) before any answer work can start; the budget has to cover the
    // read, not just the choice.
    'Cross-Text Connections':               { sec: 105, dom: 'Information and Ideas' },
    // Command of Evidence is split by evidence type, the way the banks tag
    // it: quantitative items carry a table or graph and ask you to read a
    // value out of it; textual ones are prose and ask which quotation or
    // finding supports the claim. Same budget for now — chart-reading
    // overhead would justify giving quantitative a few more seconds, but
    // that's a doctrine call, not something to infer. Bare "Command of
    // Evidence" is kept so a report saved while the two were briefly
    // merged still resolves.
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
     Math budgets key off DIFFICULTY first (the dominant driver — a hard
     Nonlinear Functions item and a hard Linear Functions item cost about
     the same), with a per-domain multiplier layered on top. Module clock
     is 35 min for 22 questions (95s average). */
  var MATH_BY_DIFFICULTY = { easy: 48, medium: 75, hard: 115 };
  var MATH_DOMAIN_MULT = {
    // Procedural. If these aren't fast, it's fluency, not reasoning.
    'Algebra': 0.9,
    // Multi-step manipulation before the reasoning even starts.
    'Advanced Math': 1.1,
    // Chart/table reading is real overhead on top of the math itself.
    'Problem-Solving and Data Analysis': 1.05,
    'Geometry and Trigonometry': 1.0
  };

  /* Fallback when a skill/domain isn't in any table above — a new bank
     import, or a renamed skill. Uses
     the section's own average pace so an unbudgeted question is treated
     as exactly average rather than silently scoring as a huge overrun.
     Every consumer can tell these apart via `.estimated` on the result. */
  var SECTION_AVERAGE_SECONDS = {
    'reading-writing': 71,
    'math':            95
  };

  /* Un-accommodated per-MODULE minutes, mirroring
     window.SECTION_MODULE_TIME_LIMITS in banks.js. Duplicated here on
     purpose: this file has to be able to recover a saved report's
     accommodation multiplier even when banks.js hasn't loaded yet (or
     ever changes), and these are the fixed real-exam clocks, not a
     tunable. sectionBaselineMinutes() prefers the live banks.js value
     when it's present and falls back to these. */
  var MODULE_MINUTES = {
    'reading-writing': 32,
    'math':            35
  };
  /* Section keys that run as two separately-timed modules on the real
     exam (so their whole-section allotment is 2× the per-module figure).
     Mirrors sectionHasModules() in index.html. Both SAT sections do; kept
     as a map rather than inlined so a future non-modular section can be
     added without touching sectionBaselineMinutes(). */
  var TWO_MODULE_SECTIONS = { 'reading-writing': 1, 'math': 1 };

  /* Supported accommodation multipliers. A recovered ratio is snapped to
     the nearest of these rather than used raw, so floating-point noise
     in tl (or a hand-edited allotment) can't produce a 1.4993× budget. */
  var SUPPORTED_MULTS = [1, 1.5, 2];

  /* ── skill-name normalization ───────────────────────────────────────
     Collapses the casing and wording variants that exist across the four
     bank files (see the taxonomy-drift note in the header) onto one
     canonical spelling, so a budget lookup and a per-skill rollup both
     land on the same bucket. Keys are lowercased-and-squeezed. */
  var SKILL_ALIASES = {
    // Retired spellings, kept so a report saved before the reconciliation
    // still resolves to the right skill. Anything that differs only by
    // case or punctuation is folded by normalizeSkill() below and doesn't
    // need an entry here — these are the ones whose WORDS changed.
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
     wherever this file knows the skill — which is what fixes the
     Transitions/Cross-Text/Text-Structure mislabeling described in the
     header without touching the question records themselves.

     The bank files have since been retagged so nothing actually drifts
     today (see the taxonomy note in the header). This stays as a guard
     against the next import reintroducing it, and the derivation is gated
     on the question ALREADY carrying an SAT R&W domain (or none at all) —
     a Math question is never rewritten by an R&W skill-name collision. */
  function canonicalize(domain, skill) {
    var sk = normalizeSkill(skill || domain);
    var rawDomain = squeeze_(domain);
    var known = RW_SKILLS[sk];
    var derivable = known && (!rawDomain || RW_DOMAINS[rawDomain]);
    return { skill: sk, domain: derivable ? known.dom : rawDomain };
  }

  /* ── the budget lookup ──────────────────────────────────────────────
     Returns { seconds, ms, estimated, basis } — `estimated` true means
     no real budget existed and the section average was substituted, so
     callers can exclude it from a strategy-compliance count rather than
     scoring a guess as though it were doctrine.

     timeMult is the student's accommodation multiplier (1 / 1.5 / 2);
     pass 1, or the value from timeMultFromAllotted(). */
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
     Snaps an arbitrary number to the nearest supported multiplier.
     Anything falsy, <1, or wildly out of range becomes 1 — a bad value
     should quietly mean "no accommodation," never a nonsense budget. */
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
     live banks.js constant so this can't drift from the timer the test
     actually ran on, and falls back to this file's own copy when banks.js
     isn't loaded (report.html opened standalone before its <script> tags
     have run, or a section key banks.js doesn't define). */
  function sectionBaselineMinutes(sectionKey, hasModules) {
    var live = window.SECTION_MODULE_TIME_LIMITS || null;
    var perModule = (live && (live[sectionKey] || live[sectionKey === 'reading-writing' ? 'readingWriting' : sectionKey]))
      || MODULE_MINUTES[sectionKey] || 0;
    if (!perModule) return 0;
    var two = (hasModules === undefined) ? !!TWO_MODULE_SECTIONS[sectionKey] : !!hasModules;
    return two ? perModule * 2 : perModule;
  }

  /* THE RETROACTIVE BIT. Recovers the accommodation multiplier a saved
     attempt was actually taken under, from the `tl` already in its
     payload — allottedMinutesFor() in index.html computed tl as
     baseline × timeMult, so dividing it back out returns timeMult with
     no new field and no migration. Returns 1 for any report predating
     the tl field (tl absent/zero), which is correct: extended time was
     not yet being recorded, and treating an unknown as "standard time"
     is the reading that under-claims rather than over-claims. */
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
     A budget that exceeds the clock is worse than no budget: it tells
     EVERY student they're behind, on a module where nobody could have
     been on pace. That happens for real — several of the adaptive
     "Module 2 Harder" sets in practice-tests.js are far more hard-tagged
     than a real digital SAT module (sat-practice-6's math module 2 is 16
     hard out of 22, where the real exam runs roughly 5 easy / 8 medium /
     9 hard), so their raw budget sum lands above the 35-minute clock.

     So the raw per-question budgets are treated as a RELATIVE allocation
     of a fixed clock, not as absolute seconds: if a module's raw sum
     exceeds MAX_BUDGET_SHARE of its own clock, every budget in that
     module is scaled down by one uniform factor until it fits. Uniform
     scaling is what keeps the teaching intact — Boundaries stays exactly
     as fast relative to Cross-Text Connections as it was — while making
     the target actually reachable, which is what a real test-taker has
     to do on a brutal module anyway.

     The factor is mult-invariant (budget and clock both scale linearly
     with the accommodation multiplier), so it's computed once against
     the un-accommodated baseline and applies unchanged at 1.5x and 2x.
     Callers can see whether it fired via `.scale` on the rollup. */
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
     Given the report's own row objects for one section, returns the
     numbers every consumer of this file needs. Rows are expected to look
     like report.html's: { q: {domain, skill, difficulty, type}, ok,
     timeMs, firstVisitMs, sk, dom }.

     `actualMsFor` is injected rather than assumed so the caller keeps
     control of the first-look-vs-cumulative choice (report.html's
     pacingTimeMs) instead of this file quietly picking one. It should be
     the FIRST-LOOK measure: a budget describes what deciding the question
     costs, and a student who answers, moves on, and comes back later has
     not spent that whole total deciding. Return trips are accounted for
     separately below, as `revisit`, because they are a different behaviour
     with a different verdict attached. */
  function sectionBudgetRollup(sectionKey, rows, timeMult, actualMsFor, opts) {
    var getMs = actualMsFor || function (r) { return (r.firstVisitMs != null) ? r.firstVisitMs : r.timeMs; };
    var mult = normalizeMult(timeMult);
    var o = opts || {};
    // Un-accommodated clock for this section, used only to decide whether
    // the raw budgets need compressing (see budgetScaleFor above). Derived
    // from the accommodation-adjusted allotment when the caller has one,
    // so it stays correct for an extended-time attempt.
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

      // Return trips: the time on this question BEYOND its first look. Only
      // computed where both measures exist (a report predating the fp field
      // has no way to tell a long first look from a revisit, so it reports
      // no revisit time rather than guessing).
      if (r.firstVisitMs != null && typeof r.timeMs === 'number' && r.timeMs > r.firstVisitMs) {
        var back = r.timeMs - r.firstVisitMs;
        out.revisit.ms += back;
        out.revisit.questions++;
        // Flagged vs not is the verdict on that time. Coming back to a
        // question you marked for review is the review pass doing its job;
        // coming back to one you never marked is second-guessing an answer
        // you had already committed to.
        if (r.marked) { out.revisit.flaggedMs += back; out.revisit.flaggedQuestions++; }
        else { out.revisit.unflaggedMs += back; out.revisit.unflaggedQuestions++; }
      }

      if (delta > budgetMs * BAND) { out.overCount++; out.overrunMs += delta; }
      else if (delta < -budgetMs * BAND) { out.underCount++; out.surplusMs += -delta; }
      else out.onPaceCount++;

      // A right answer that cost well over budget is a STRATEGY failure
      // even though it scored — the single read this whole file exists to
      // make possible, and one the accuracy-only view can never show.
      if (r.ok && delta > budgetMs * BAND) out.correctOverBudget++;

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
     Enforces Luca's ordering rule at load time instead of trusting the
     next person editing a number: the FLOOR of Information and Ideas has
     to stay above the CEILING of every other R&W domain. Logs rather
     than throws — a mis-ordered budget should surface loudly in the
     console during development without ever breaking a student's report
     in production. */
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
