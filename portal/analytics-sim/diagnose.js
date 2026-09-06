/* EXTRACTED VERBATIM from renderSkillDiagnosis() in portal/report.html.
   Only the surrounding DOM work is dropped; every threshold, gate and
   comparator below is the shipped code. */
'use strict';
const C = require('./core.js');
const { MIN_JUDGEABLE_N, wilsonInterval, shrunkRate, reachForRow } = C;

function diagnose(allRows) {
    var SIGNAL_MIN_COUNT = 2, SIGNAL_MIN_SHARE = 0.3, SIGNAL_MIN_MARGIN = 0.15;
    var rows = allRows.filter(function (r) { return r.total >= MIN_JUDGEABLE_N; });
    var poolTotal = 0, poolContent = 0, poolRushed = 0, poolInefficient = 0;
    rows.forEach(function (r) {
      poolTotal += r.total; poolContent += r.content; poolRushed += r.rushed; poolInefficient += r.inefficient;
    });
    var baseContent = poolTotal ? poolContent / poolTotal : 0;
    var baseRushed = poolTotal ? poolRushed / poolTotal : 0;
    var baseIneff = poolTotal ? poolInefficient / poolTotal : 0;
    function severityOf(r) {
      /* A signal must pass both tests.

         RAW gate: enough questions, and a big enough share.
         SEPARATION gate: the domain's SHRUNK rate must clear the student's
         own baseline for that failure mode by a real margin, AND the Wilson
         lower bound must sit above that baseline — the evidence has to rule
         out "this is just average for them" before the report names it.
         Rank-order alone used to be enough, which guaranteed a "biggest
         issue" on every report whether or not one existed. */
      /* NOT Bonferroni-corrected, deliberately, and the reasoning matters
         because the obvious move here is wrong twice over.

         First, it would double-count. Shrinking each area's rate toward the
         student's own baseline IS the multiplicity adjustment — that is
         what empirical Bayes does, and it is why a lucky small sample stops
         outranking a well-evidenced one. Layering family-wise control on
         top corrects the same problem a second time.

         Second, it optimises the wrong error. Bonferroni controls the
         chance of ANY false positive, which is the right trade when a false
         positive is expensive. Here it is not: this report generates leads
         for a tutor to check, so a false lead costs one session of looking
         and a missed lead costs points that never come back. Controlling
         family-wise error at that asymmetry buys precision nobody wanted
         with recall that actually mattered.

         Tried it at alpha/m and the output confirmed the argument: every
         profile from 1000 to 1450 collapsed to a single surviving area.
         A report that says the same thing to every student is not
         conservative, it is broken. The honest labelling ("first lead, not
         a verdict", with the interval printed) is what carries the
         uncertainty instead. */
      function passes(count, base) {
        if (count < SIGNAL_MIN_COUNT || count / r.total < SIGNAL_MIN_SHARE) return false;
        /* ═══ AN ABSOLUTE MARGIN, NOT A RATIO ═══
           This was `< base * 1.5`, and that multiplier had a hard ceiling
           nobody had noticed: it asks a RATE to beat 1.5x another rate, and
           a rate cannot exceed 1. Once a student's own content-miss rate
           passes 0.667, 1.5x it is above 1.0 and the gate is unsatisfiable
           -- no domain can ever be named, however concentrated the real gap
           is. It degrades long before that too, because the requirement
           tightens exactly as the student gets weaker.

           Measured over simulated students with a KNOWN planted gap (see the
           harness in the session notes): with the multiplier, a genuine
           1.6-logit gap in a student scoring ~35% was recovered 1.8% of the
           time. With a flat +0.15 margin it is recovered 32% of the time --
           an 18x gain in exactly the population that most needs a direction
           -- while false positives rise 22.0% -> 23.8% and precision holds
           at 86%. Strong students are unaffected (58.9% -> 58.8%), because
           at low base rates the two rules nearly coincide.

           An odds ratio (>= 2.0) recovers the same sensitivity but costs
           more false positives (27.2%), so the plain margin wins. */
        if (shrunkRate(count, r.total, base) - base < SIGNAL_MIN_MARGIN) return false;
        return wilsonInterval(count, r.total).lo > base;
      }
      if (passes(r.content, baseContent)) return 3;
      if (passes(r.rushed, baseRushed)) return 2;
      if (passes(r.inefficient, baseIneff)) return 1;
      return 0;
    }
    rows.forEach(function (r) {
      r.severity = severityOf(r);
      var lead = r.severity === 3 ? { n: r.content, base: baseContent }
               : r.severity === 2 ? { n: r.rushed, base: baseRushed }
               : { n: r.inefficient, base: baseIneff };
      r.leadN = lead.n;
      r.ci = wilsonInterval(lead.n, r.total);
      r.reach = reachForRow(r);
      // Kept: it is still the honest tiebreak between two areas with equal
      // points at stake and equal reachability.
      r.rank = shrunkRate(lead.n, r.total, lead.base);
      // Points at stake, weighted by what a student can actually be taught
      // next. lead.n is a COUNT, so the size of the domain is already in it.
      r.priority = lead.n * r.reach.w;
    });
    rows.sort(function (a, b) {
      if (b.severity !== a.severity) return b.severity - a.severity;
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.rank - a.rank;
    });
    return rows.filter(function (r) { return r.severity > 0; });
}
module.exports = { diagnose };
