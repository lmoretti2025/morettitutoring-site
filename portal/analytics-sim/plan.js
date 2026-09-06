'use strict';
function allocate(causes){
  var planInputs={areas:[]}, first='Sim';
  var total=causes.content+causes.method+causes.clock;
  if(!total) return null;
    var WEEKLY_LO = 4, WEEKLY_HI = 5;
    /* ═══ THE WEEK HAS TO FIT THE OPPORTUNITY ═══
       The split below is good at deciding HOW to spend a week and had no
       opinion at all about WHETHER there was a week's worth of work. It
       handed a student who answered 98 of 98 correctly a four-and-a-half
       hour weekly plan, because fifteen of those correct answers had run
       over budget and "method" was therefore the leading cause. It was the
       leading cause of nothing.

       Points actually lost is content + clock. Method is an efficiency
       concern: real, but it only matters insofar as there are points left
       to protect. So when nothing was lost, this stops prescribing a full
       week and says what is true -- there is no content to re-teach and no
       clock to fix, and the only thing left is keeping the pace honest. */
    var pointsLost = causes.content + causes.clock;
    var MAINTENANCE_HOURS = 1;
    var areas = (planInputs.areas || []);
    var secName = { 'reading-writing': 'Reading & Writing', 'math': 'Math' };

    /* Hours follow the question counts, with two corrections that the raw
       proportions get wrong.

       A floor, because a cause with real questions behind it and zero hours
       against it reads as "ignore this", which is not what a small share
       means. And a cap on clock work: past about one long timed sitting a
       week it stops teaching anything new and starts just consuming the
       week -- the fix for pacing is a strategy applied under time pressure,
       not more time pressure. */
    var raw = { content: causes.content / total, method: causes.method / total, clock: causes.clock / total };
    var mid = (WEEKLY_LO + WEEKLY_HI) / 2;
    function half(x) { return Math.round(x * 2) / 2; }

    /* ORDER MATTERS HERE, and getting it wrong is not a rounding nuisance.
       The clock cap has to be taken FIRST and the remainder shared out
       after it, rather than scaling all three and then capping -- capping
       last removes hours from the week without giving them to anything, so
       a pacing-dominated attempt (exactly the case the cap exists for)
       collapsed to a 1.5-hour week under a heading promising four to five.
       Taking the cap first and dividing what is left keeps every week whole
       by construction rather than by luck. */
    /* ═══ THE WEEK SCALES WITH THE OPPORTUNITY ═══
       A fixed 4-5 hours was right for a student with real ground to make up
       and absurd for one without. A student who missed a single question
       was being handed the same weekly commitment as one who missed forty.

       The target now tapers on points actually lost -- content plus clock,
       not method, for the reason above. Twelve lost questions is roughly
       where a full week earns itself; below that the plan shrinks toward a
       one-hour floor rather than padding itself out with work that is not
       there. */
    var FULL_WEEK_AT = 12;
    var target = Math.max(1, half(mid * Math.min(1, pointsLost / FULL_WEEK_AT)));
    var hours = { content: 0, method: 0, clock: 0 };
    hours.clock = causes.clock > 0 ? Math.min(1.5, Math.max(0.5, half(raw.clock * target))) : 0;
    if (hours.clock > target) hours.clock = half(target);
    var rest = Math.max(0, half(target - hours.clock));
    var cmTotal = causes.content + causes.method;
    if (cmTotal > 0 && rest > 0) {
      hours.content = causes.content > 0 ? Math.max(0.5, half(causes.content / cmTotal * rest)) : 0;
      hours.method  = causes.method  > 0 ? Math.max(0.5, half(causes.method  / cmTotal * rest)) : 0;
      // Half-hour rounding and the 0.5 floor can put the pair a step off the
      // remainder; settle it on the larger band so the visible total is
      // always exactly what the heading claims.
      var drift = rest - (hours.content + hours.method);
      if (drift) {
        if (hours.content >= hours.method && hours.content + drift >= 0.5) hours.content += drift;
        else if (hours.method + drift >= 0.5) hours.method += drift;
        else if (hours.content + drift >= 0.5) hours.content += drift;
      }
    }
    var weekly = hours.content + hours.method + hours.clock;
    /* Nothing was actually lost -- scale the week down to maintenance
       rather than inventing four hours of work to fill it. */
    var maintenanceOnly = (pointsLost === 0);
    if (maintenanceOnly) {
      hours.content = 0; hours.clock = 0;
      hours.method = MAINTENANCE_HOURS;
      weekly = MAINTENANCE_HOURS;
    }
  return { hours:hours, weekly:weekly, maintenanceOnly:maintenanceOnly, pointsLost:pointsLost };
}
module.exports={allocate};
