/* EXTRACTED VERBATIM from portal/report.html — do not hand-edit.
   Regenerate with the extractor if the report changes. */
'use strict';
var MATH_MODULE_WEIGHT_CURVE = [[77.27, 88], [84.09, 78.57]];
var RW_MODULE_WEIGHT_CURVE = [[77.78, 56.25], [98.15, 135]];
var RW_CURVE = [
    [0, 200], [14.81, 270], [29.63, 320], [44.44, 370], [59.26, 470],
    [74.07, 590], [81.48, 650], [88.89, 710], [92.59, 740], [96.3, 770],
    [100, 800]
  ];

var MATH_CURVE = [
    [0, 200], [13.64, 260], [27.27, 330], [45.45, 400], [59.09, 480],
    [72.73, 580], [77.27, 630], [84.09, 675], [86.36, 700], [90.91, 730],
    [95.45, 770], [100, 800]
  ];

  function scaleFromPct(pct, curve) {
    if (pct <= curve[0][0]) return curve[0][1];
    for (var i = 1; i < curve.length; i++) {
      if (pct <= curve[i][0]) {
        var lo = curve[i - 1], hi = curve[i];
        var frac = (pct - lo[0]) / (hi[0] - lo[0]);
        return Math.round(lo[1] + frac * (hi[1] - lo[1]));
      }
    }
    return curve[curve.length - 1][1];
  }

  function roundToTen(n) { return Math.round(n / 10) * 10; }


  function moduleWeightFromPct(pct, curve) {
    if (pct <= curve[0][0]) return curve[0][1];
    if (pct >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];
    for (var i = 1; i < curve.length; i++) {
      if (pct <= curve[i][0]) {
        var lo = curve[i - 1], hi = curve[i];
        var frac = (pct - lo[0]) / (hi[0] - lo[0]);
        return lo[1] + frac * (hi[1] - lo[1]);
      }
    }
    return curve[curve.length - 1][1];
  }

  function satSectionScore(sec, curve) {
    if (!sec || !sec.t) return null;
    var pct = sec.c / sec.t * 100;
    var base = scaleFromPct(pct, curve);
    // Module-1 vs Module-2 success rates. A non-adaptive section (no
    // Module 2, so t2 == 0) has nothing to split, so both rates fall back
    // to the overall rate and the shift term is 0.
    var r1 = sec.t1 ? sec.c1 / sec.t1 : (sec.c / sec.t);
    var r2 = sec.t2 ? sec.c2 / sec.t2 : (sec.c / sec.t);
    var weightCurve = (curve === MATH_CURVE) ? MATH_MODULE_WEIGHT_CURVE : RW_MODULE_WEIGHT_CURVE;
    var weight = moduleWeightFromPct(pct, weightCurve);
    var score = base + weight * (r1 - r2);
    score = Math.max(200, Math.min(800, score));
    return roundToTen(score);
  }

  function zForTwoSided(alpha) {
    var p = 1 - alpha / 2;
    var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687,
             138.3577518672690, -30.66479806614716, 2.506628277459239];
    var b = [-54.47609879822406, 161.5858368580409, -155.6989798598866,
             66.80131188771972, -13.28068155288572];
    var c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838,
             -2.549732539343734, 4.374664141464968, 2.938163982698783];
    var d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    var pl = 0.02425, q, r2;
    if (p < pl) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
             ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p <= 1 - pl) {
      q = p - 0.5; r2 = q * q;
      return (((((a[0] * r2 + a[1]) * r2 + a[2]) * r2 + a[3]) * r2 + a[4]) * r2 + a[5]) * q /
             (((((b[0] * r2 + b[1]) * r2 + b[2]) * r2 + b[3]) * r2 + b[4]) * r2 + 1);
    }
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  function wilsonInterval(k, n, z) {
    if (!n) return { lo: 0, hi: 1 };
    z = z || 1.96;
    var p = k / n, z2 = z * z, d = 1 + z2 / n;
    var centre = (p + z2 / (2 * n)) / d;
    var half = (z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n))) / d;
    return { lo: Math.max(0, centre - half), hi: Math.min(1, centre + half) };
  }

  var PRIOR_STRENGTH = 6;

  function shrunkRate(k, n, priorRate) {
    return (k + PRIOR_STRENGTH * priorRate) / (n + PRIOR_STRENGTH);
  }

  var MIN_JUDGEABLE_N = 5;

  var DOMAIN_REACH = {
    // ── Math ──────────────────────────────────────────────────────────
    // Linear equations, functions, inequalities, systems. The floor of SAT
    // math and its single largest domain; nothing else is reachable first.
    'Algebra':                            { tier: 'foundation', w: 1.35 },
    /* NOT a foundation domain, despite containing the two most reachable
       skills on the Math side. Ratios/rates/proportions and percentages are
       arithmetic a student can be taught from a standing start; one-variable
       distributions, conditional probability and scatterplot models are not,
       and they are three of the five skills here. The domain default is
       therefore middling, and SKILL_REACH below pulls it up or down
       depending on where this student's misses actually landed. */
    'Problem-Solving and Data Analysis':  { tier: 'building',   w: 0.95 },
    // Quadratics, nonlinear systems, equivalent expressions. Real points,
    // but only once linear algebra is solid.
    'Advanced Math':                      { tier: 'building',   w: 1.0 },
    // Circles, triangles, trig ratios, volume. Its own vocabulary plus the
    // algebra to finish -- and the smallest Math domain on the form.
    'Geometry and Trigonometry':          { tier: 'deep',       w: 0.75 },
    // ── Reading & Writing ─────────────────────────────────────────────
    // Boundaries, form/structure/sense. A closed, finite rule set that can
    // be taught outright, needing no reading ability beyond parsing one
    // sentence. The most reachable content on the whole exam.
    'Standard English Conventions':       { tier: 'foundation', w: 1.35 },
    // Same split as above in miniature: Transitions is close to rule-based,
    // Rhetorical Synthesis is not. SKILL_REACH separates them.
    'Expression of Ideas':                { tier: 'building',   w: 1.05 },
    // Words in context and text structure -- gated on vocabulary, which is
    // built slowly rather than taught in a session.
    'Craft and Structure':                { tier: 'building',   w: 0.95 },
    // Central ideas, evidence, inference, cross-text. Reading comprehension
    // proper: it moves with reading ability, and that moves slowest.
    'Information and Ideas':              { tier: 'deep',       w: 0.8 }
  };

  var SKILL_REACH = {
    // ── Problem-Solving and Data Analysis ────────────────────────────
    'Ratios, Rates, Proportional Relationships, and Units':               1.35,
    'Percentages':                                                        1.35,
    'One-Variable Data: Distributions and Measures of Center and Spread':  0.8,
    'Probability and Conditional Probability':                            0.8,
    'Two-Variable Data: Models and Scatterplots':                         0.8,
    // ── Expression of Ideas ──────────────────────────────────────────
    'Transitions':                                                        1.3,
    'Rhetorical Synthesis':                                               0.95,
    // ── Advanced Math ────────────────────────────────────────────────
    // Factoring and rewriting expressions is the reachable end of this
    // domain; nonlinear functions and systems are not, and keep the
    // domain default.
    'Equivalent Expressions':                                             1.1,
    // ── Geometry and Trigonometry ────────────────────────────────────
    // Formula application, against a domain whose other skills each need
    // their own body of theory first.
    'Area and Volume':                                                    0.95
  };

  var HARD_REACH_CAP = 1.0;

  var REACH_LABEL = { foundation: 'Foundation', building: 'Builds on the basics', deep: 'Deeper prerequisites' };

  function reachFor(domain) { return DOMAIN_REACH[domain] || { tier: 'building', w: 1.0 }; }


  function reachForRow(r) {
    var base = reachFor(r.skill);
    var skills = r.skills || {};
    var acc = 0, n = 0;
    Object.keys(skills).forEach(function (name) {
      var s = skills[name] || {};
      var missed = s.missed || 0;
      if (!missed) return;
      var w = SKILL_REACH.hasOwnProperty(name) ? SKILL_REACH[name] : base.w;
      // Split the misses by difficulty and weight them separately, so a
      // skill is credited as reachable only for the questions where that
      // was actually true.
      var hard = Math.min(s.missedHard || 0, missed);
      var easyMed = missed - hard;
      if (easyMed) { acc += w * easyMed; n += easyMed; }
      if (hard) { acc += Math.min(w, HARD_REACH_CAP) * hard; n += hard; }
    });
    if (!n) return base;
    var w = acc / n;
    // The pill has to follow the blended weight, or a row can read
    // "Foundation" while being ranked as deep content.
    var tier = w >= 1.15 ? 'foundation' : (w >= 0.9 ? 'building' : 'deep');
    return { tier: tier, w: w };
  }

  function median(arr) {
    if (!arr.length) return 0;
    var s12 = arr.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(s12.length / 2);
    return s12.length % 2 ? s12[mid] : (s12[mid - 1] + s12[mid]) / 2;
  }

  var RUSHED_REL = 0.5, RUSHED_ABS_CAP = 20000, LUCKY_REL = 0.35, LUCKY_ABS_CAP = 15000, STUCK_REL = 1.6;

  var STUCK_BUDGET_REL = 1.5;

  var RUSHED_BUDGET_REL = 0.5;
  /* Engagement floor -- see the long note in report.html. Budget-relative on
     purpose: the test is not "fast for them", it is "too fast to have read
     the stimulus". Calibrated on 1,503 real answers. */
  var TOO_FAST_BUDGET_REL = 0.15;
module.exports = { MATH_MODULE_WEIGHT_CURVE, RW_MODULE_WEIGHT_CURVE, RW_CURVE, MATH_CURVE, scaleFromPct, roundToTen, moduleWeightFromPct,
  satSectionScore, zForTwoSided, wilsonInterval, PRIOR_STRENGTH, shrunkRate, MIN_JUDGEABLE_N,
  DOMAIN_REACH, SKILL_REACH, HARD_REACH_CAP, REACH_LABEL, reachFor, reachForRow, median,
  RUSHED_REL, RUSHED_ABS_CAP, LUCKY_REL, LUCKY_ABS_CAP, STUCK_REL, STUCK_BUDGET_REL, RUSHED_BUDGET_REL, TOO_FAST_BUDGET_REL };
