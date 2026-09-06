/* A synthetic student with KNOWN latent truth, and a sampler that turns that
   truth into an attempt on a real form.

   The point of the whole exercise is that `truth` here is not recoverable
   from the attempt except through the report's own machinery -- so whatever
   the report concludes can be scored against something real. */
'use strict';
const B = require('./build.js');

// Deterministic RNG so any run is reproducible from its seed.
function rng(seed) {
  let s = seed >>> 0;
  return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function normal(rand) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* CALIBRATED against 9 real attempts that still reproduce their recorded
   score (882 classified questions): easy 83.8%, medium 71.9%, hard 65.6%.
   The label spread is far narrower than assumed -- hard was -0.90, real is
   -0.29 -- so difficulty contributes much less within-student noise than
   the first version of this study supposed. */
/* Timing fitted to the same 9 real attempts: 882 questions, time/budget
   p10=0.21 median=0.66 p90=1.56  ->  lognormal mu=-0.416 sigma=0.782.
   Real students run WELL under budget and are far more variable than the
   first pass assumed (mu 0, sigma 0.30-0.50). */
const CALIBRATED_PACE = { mu: -0.416, sigma: 0.782 };

const DIFF_OFFSET = { easy: 0.71, medium: 0.0, hard: -0.29 };

/* P(correct) for one question: a logistic in (ability - difficulty), with a
   per-domain offset. gapDomain shifts one domain down by gapSize -- that is
   the ground truth the report is being asked to recover. */
function pCorrect(student, q) {
  let a = student.ability + (DIFF_OFFSET[q.difficulty] || 0);
  if (q.domain === student.gapDomain) a -= student.gapSize;
  const p = 1 / (1 + Math.exp(-a));
  return Math.min(0.97, Math.max(0.03, p));
}

/* Time: a lognormal around the question's own budget. paceMu > 0 is a
   student who runs long; paceSigma is how erratic they are. */
function sampleTime(student, q, sectionKey, rand) {
  const b = B.TB.budgetSecondsFor(sectionKey, q.domain, q.skill || q.domain, q.difficulty, 1);
  const budget = (b && b.ms) || 60000;
  const z = normal(rand);
  return Math.max(3000, budget * Math.exp(student.paceMu + student.paceSigma * z));
}

function sit(student, seed) {
  const rand = rng(seed);
  const sections = [
    { key: 'math', qs: B.form('math', student.mathVariant) },
    { key: 'reading-writing', qs: B.form('reading-writing', student.rwVariant) }
  ];
  const out = [];
  for (const sec of sections) {
    const rows = sec.qs.map(q => {
      const ok = rand() < pCorrect(student, q);
      return { q, ok, sk: q.skill || q.domain, dom: q.domain,
               timeMs: sampleTime(student, q, sec.key, rand) };
    });
    out.push({ key: sec.key, rows });
  }
  return out;
}

/* The truth the report is being graded against: which domain is genuinely
   weakest for this student, measured as expected misses on this form -- the
   same currency section 1 now ranks in. */
function trueWorstDomain(student) {
  const tally = {};
  for (const key of ['math', 'reading-writing']) {
    const variant = key === 'math' ? student.mathVariant : student.rwVariant;
    for (const q of B.form(key, variant)) {
      tally[q.domain] = (tally[q.domain] || 0) + (1 - pCorrect(student, q));
    }
  }
  return Object.entries(tally).sort((a, b) => b[1] - a[1]);
}

module.exports = { rng, normal, sit, pCorrect, trueWorstDomain, CALIBRATED_PACE, DIFF_OFFSET };
