# Analytics validation harness

Measures how accurately section 1 of the diagnostic report recovers a content
gap that is actually there, by simulating students whose truth is known.

`core.js` and `diagnose.js` are **extracted verbatim from `../report.html`** —
constants, the Wilson interval, the shrinkage prior, the separation gate, the
reachability tables and the ranking comparator are the shipped code, not a
re-implementation. `build.js` replicates the classification pass (that part is
entangled with the DOM in the report); `validate.js` checks that replication
against a real rendered attempt before any result is trusted.

## Run

All commands are run from `portal/`:

    PORTAL=$PWD node analytics-sim/invariants.js 30000   # must always pass
    PORTAL=$PWD node analytics-sim/study.js              # sensitivity / precision / test-retest
    PORTAL=$PWD node analytics-sim/robustness.js         # the same, under 5 different ground truths
    PORTAL=$PWD node analytics-sim/prevalence.js         # precision as a function of how common gaps are
    PORTAL=$PWD node analytics-sim/pooling.js            # what a 2nd and 3rd form buy

Against real attempts (needs a decoded export; see `real.js`):

    PORTAL=$PWD ATTEMPTS=/path/to/real-attempts.json node analytics-sim/real.js

`invariants.js` is the one to run after any change to the report — it asserts
the properties that must hold whatever the data, and a failure there is a bug
rather than a trade-off.

## Files

| file | what it is |
|---|---|
| `core.js`, `diagnose.js` | **extracted verbatim** from `../report.html` — re-extract if the report changes |
| `build.js` | replicates the classification pass (entangled with the DOM in the report) |
| `validate.js` | checks that replication against a real rendered attempt |
| `student.js` | the calibrated student model |
| `dgp.js` | five alternative ground truths |
| `plan.js` | the study-plan allocator, extracted from the report |
| `make-report.js` | builds real `#d=` payloads, so a simulated attempt renders through the actual report |
| `real.js` | decodes and scores real attempts from a sheet export |

## Re-extract after changing report.html

`core.js` / `diagnose.js` are generated. If the report's thresholds or gate
change, re-extract them or the harness will measure stale logic.

## What the numbers mean

- **ability** is a logit. Roughly: -0.6 ≈ 35% correct, 0.4 ≈ 55%, 1.2 ≈ 72%, 2.0 ≈ 84%.
- **gap** is how far one domain sits below the student's own ability, in logits.
  0.8 is subtle, 1.6 is a clear weakness, 2.4 is a hole.
- **sensitivity** = P(the report names the domain that is genuinely weakest).
- **precision** = P(the named lead is the true gap | it named something).

## Calibration (from 9 real attempts, 882 classified questions)

Every free parameter is now fitted rather than assumed:

| parameter | assumed | measured |
|---|---|---|
| difficulty offset, hard | −0.90 | **−0.29** |
| difficulty offset, easy | +0.85 | **+0.71** |
| pace (time / budget), median | 1.00 | **0.66** |
| pace sigma | 0.30–0.50 | **0.78** |
| ability | grid −0.6…2.0 | **N(1.20, 1.22)** |

The real data also forced a code change: `hurried` was budget-relative at
0.5×, which labelled **40.4%** of real misses "rushed" because real students
run at 0.66× budget by default. Self-relative labels **11.0%**. A real miss
takes a median 1.13× that student's own median *correct* time — misses are
slower than their typical answer, not faster.

**Ground-truth limitation:** the simulator plants *content* gaps only. A
severity-1 (inefficient) or severity-2 (rushed) lead is therefore scored as
an error even when it may be a true observation. Content-lead metrics are the fair
comparison; all-lead metrics from `study.js` are a lower bound.

## Verification performed

| check | scale | result |
|---|---|---|
| invariant sweep (buckets, gates, ranking, plan) | 30,000 simulated attempts | all held |
| plan allocator, exhaustive | 226,980 cause combinations | 0 violations |
| end-to-end render sweep (real report, iframed) | 60 randomised payloads | 0 issues |
| edge cases (perfect / zero / all-skipped / half-skipped / 3s / 10min / no-timing / all-A) | 8 | 0 errors, no NaN |
| archetypes drawn from the real cohort | 5 | all diagnosed correctly |

Invariants asserted: buckets partition each domain's questions exactly;
content = stuck + onpace; nothing named without severity > 0 and n >= 5;
ranking is a valid ordering; plan sums to its stated weekly total; every band
>= 0.5h; clock band <= 1.5h; maintenance mode iff nothing was lost; no NaN,
undefined or Infinity anywhere in the rendered page; score band inside
400-1600 with lo <= hi.

## Robustness: does the accuracy survive a different ground truth?

Every figure above was first computed against ONE assumption about how a real
weakness is shaped — a uniform logit penalty across a whole domain. That is a
modelling convenience, not an observed fact, so `dgp.js` re-runs the same
shipped code against five ground truths. A conclusion that only holds under
`domain` is a property of the model, not the algorithm, and must not be quoted.

| ground truth | meaning | precision @ clear gap |
|---|---|---|
| domain | uniform penalty across a domain | 80.2% |
| skill | concentrated in 1–2 skills inside it | 83.3% |
| difficulty | fine on easy, collapses on hard | 73.2% |
| correlated | two related domains weak together | **63.3%** |
| none | no domain structure at all (the null) | 27.2% fire = false positives |

**Precision depends on prevalence, and that is the honest caveat.** Every
precision figure above is conditional on a weakness being there to find. What a
parent experiences depends on how many students have one at all:

| prevalence of a real concentrated weakness | 90% | 75% | 50% | 30% |
|---|---|---|---|---|
| precision, shipped gate | 80.1% | 74.0% | 60.2% | 43.9% |

Nobody knows the true prevalence. Quote the range, not the top of it.

## The hard limit

Measured on 9 real attempts: section 1 names a content area for **none of
them**, and still none after pooling a student's attempts. This is not a
threshold that needs tuning — a domain gets 9–15 questions on one form, and the
Wilson lower bound on 6-of-13 is 0.23. The interval is too wide to separate one
domain from a student's own average at that sample size.

**So "we identify your weak topics from one diagnostic" is not a supportable
claim.** What is supportable is everything built on counts rather than
inference — see the claim inventory in the session notes.
