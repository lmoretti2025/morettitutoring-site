# Generated Items — Batch 2

**Status: demo only. Nothing here has been written to `portal/` or to any question bank.**
These are for review; emission into `banks.js` / `challenge-questions.js` schema happens
only on your say-so.

Generated under the protocol in `QUESTION_GENERATION_SYSTEM.md`, with the two conformance
gaps from Batch 1 corrected.

| | Batch 1 | Batch 2 | Corpus |
|---|---|---|---|
| key positions A/B/C/D | 2 / 5 / 2 / 1 | **2 / 3 / 3 / 2** | 29 / 37 / 30 / 29 |
| hard keys negative | 3 of 5 (60%) | **1 of 4 (25%)** | 14% |
| hard keys fractional | 1 of 5 (20%) | 1 of 4 (25%) | 19% |
| medium keys \|v\| ≤ 20 | 1 of 3 (33%) | **1 of 2 (50%)** | 68% |
| easy key integer | yes | yes | 100% |

At four hard numeric keys the granularity is coarse — one negative is 25%, zero is 0%, and
14% sits between them. One was kept deliberately rather than overcorrecting to none, since
a batch with no negative answers is as much a signature as a batch full of them.

Frames used are all distinct from Batch 1: F3 construction, F2 parametric (fractional
key), two-constant substitution, condition inversion, three-equation concurrency, compound
target, T4 model-building, F12 two-line intersection, F11 derived quantity, T1
substitution.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — second-equation construction (F3)]

**Question Stem:**

> 6*x* − 4*y* = 10
>
> One of the two equations in a system of two linear equations is given. The system has no
> solution. Which equation could be the second equation in the system?

**Options:**
(A) 3*x* − 2*y* = 5
(B) 3*x* + 2*y* = 10
(C) 4*x* − 6*y* = 10
(D) 3*x* − 2*y* = 8

**Correct Answer:** (D)

**Distractor Rationale:**
- **(A)** — D11, the central misconception. `3x − 2y = 5` *is* the given equation divided
  by 2, so the two graphs are the same line: infinitely many solutions, not none. The
  student has matched the coefficients and never checked the constant.
- **(B)** — flips the sign of the *y*-coefficient on the belief that opposite signs make
  lines miss each other. The slopes now differ, so the lines cross: exactly one solution.
- **(C)** — rearranges the digits into `4x − 6y` without preserving the ratio `6 : −4`.
  Different slope, so again exactly one solution.
- **(D)** — correct.

**Mathematical Solution & Underlying Concept:** `6x − 4y = 10` is equivalent to
`3x − 2y = 5`. Two linear equations have no solution exactly when their coefficients are
proportional but their constants are not — the same slope, a different intercept. Option
(D), `3x − 2y = 8`, has identical coefficients and a different constant, so the lines are
parallel and distinct. *Concept:* "no solution" is a condition on the coefficients **and**
the constants together; matching only the coefficients produces the same line instead.

*Design note:* the four options span all three outcomes — (A) infinitely many, (B) and (C)
exactly one, (D) none — which is what 8 of 8 real construction items in your bank do.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — parametric, fractional key (F2)]

**Question Stem:**

> 3*x* − 8*y* = 12
> *kx* − 6*y* = 5
>
> In the given system of equations, *k* is a constant. If the system has no solution, what
> is the value of *k*?

**Options:**
(A) 4/3
(B) 9/4
(C) 12/5
(D) 4

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) 4/3** — reports the *ratio* rather than the value: the student correctly computes
  `−8 / −6 = 4/3` and answers with it, never solving `3/k = 4/3`.
- **(B) 9/4** — correct.
- **(C) 12/5** — matches the **constants** instead of the coefficients, taking `12/5` as
  the required ratio. This is the mirror image of the usual error and diagnoses a student
  who knows two ratios are involved but not which one carries the condition.
- **(D) 4** — inverts the proportion, solving `k/3 = 8/6` instead of `3/k = 8/6`.

**Mathematical Solution & Underlying Concept:** No solution requires proportional
coefficients with non-proportional constants. From `3/k = −8/−6 = 4/3`, `4k = 9`, so
`k = **9/4**`. Check: with `k = 9/4` the second equation is `(9/4)x − 6y = 5`, and
`3 ÷ (9/4) = 4/3 = (−8) ÷ (−6)` ✓, while the constants give `12/5 ≠ 4/3` ✓ — parallel and
distinct. *Concept:* the proportionality is a single equation in *k*, and the constants
must be checked separately to rule out the same line.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — two constants from a known intersection]

**Question Stem:**

> *ax* + 5*y* = 17
> 3*x* + *by* = 11
>
> In the given system of equations, *a* and *b* are constants. If the graphs of these
> equations in the *xy*-plane intersect at the point (2, 1), what is the value of *ab*?

**Options:**
(A) 5
(B) 6
(C) 11
(D) 30

**Correct Answer:** (D)

**Distractor Rationale:**
- **(A) 5** — reports `b` alone, having solved only the second equation.
- **(B) 6** — reports `a` alone, having solved only the first. Together (A) and (B) are the
  two natural stopping points once one equation has been handled.
- **(C) 11** — computes `a + b` instead of `ab`; the wrong operation on two correct
  components, and the more tempting because 11 also appears in the stem.
- **(D) 30** — correct.

**Mathematical Solution & Underlying Concept:** A point lies on a graph when its
coordinates satisfy the equation, so substitute `x = 2`, `y = 1` into each.
First: `2a + 5 = 17` ⇒ `a = 6`. Second: `6 + b = 11` ⇒ `b = 5`. Then `ab = **30**`.
*Concept:* an intersection point satisfies **both** equations, which turns one two-variable
system into two independent one-variable equations — the parameters never interact.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — condition inversion (novel frame)]

**Question Stem:**

> 4*x* + *ky* = 9
> *kx* + 9*y* = 5
>
> In the given system of equations, *k* is a constant. If the system has exactly one
> solution, which of the following is NOT a possible value of *k*?

**Options:**
(A) 0
(B) 4
(C) 6
(D) 13

**Correct Answer:** (C)

**Distractor Rationale:**
- **(A) 0** — the student believes a zero parameter degenerates the system. It does not:
  `k = 0` gives `4x = 9` and `9y = 5`, a perfectly ordinary unique solution.
- **(B) 4** — matches only the first column, solving `4 − k = 0`. Diagnoses a student who
  treats one pair of coefficients as the whole condition.
- **(C) 6** — correct.
- **(D) 13** — combines the two visible constants, `4 + 9`.

**Mathematical Solution & Underlying Concept:** A system has exactly one solution when the
lines are not parallel, i.e. when `4·9 − k·k ≠ 0`. So `36 − k² ≠ 0`, and the excluded
values are `k = 6` and `k = −6`. Of the options only **6** is excluded; every other value
leaves `36 − k² ≠ 0`. *Concept:* the question inverts the usual one — instead of finding
the parameter that breaks uniqueness, it asks which candidate is disqualified, so the
student must test values against the condition rather than solve for one.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — three-equation concurrency (F5)]

**Question Stem:**

> A system of two linear equations has exactly one solution, (−2, 5). How many solutions
> does the system of three linear equations consisting of those two equations and the
> equation 3*x* + 2*y* = 4 have?

**Options:**
(A) Zero
(B) Exactly one
(C) Exactly two
(D) Infinitely many

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) Zero** — the reflex answer, and the one the analogous item already in your bank
  rewards: students learn that a third line over-determines a system and answer "zero"
  without testing the point. This item inverts that expectation, so a student pattern-
  matching on the familiar version lands here.
- **(B) Exactly one** — correct.
- **(C) Exactly two** — treats each pair of lines as contributing its own solution.
- **(D) Infinitely many** — confuses "more equations than unknowns" with an
  under-determined system.

**Mathematical Solution & Underlying Concept:** The first two equations are already
satisfied only by (−2, 5). A third equation removes that point only if the point fails it.
Testing: `3(−2) + 2(5) = −6 + 10 = 4` ✓. The third line passes through the same point, so
all three are concurrent and the solution set is unchanged: **exactly one**. *Concept:*
adding an equation can only shrink a solution set — never enlarge it — so the whole
question reduces to a single substitution.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — compound target]

**Question Stem:**

> 2*x* + *y* = −1
> *x* − *y* = 10
>
> The solution to the given system of equations is (*x*, *y*). What is the value of *x* + *y*?

**Options:**
(A) −10
(B) −7
(C) −4
(D) 3

**Correct Answer:** (C)

**Distractor Rationale:**
- **(A) −10** — computes `y − x` instead of `x + y`, reversing the difference already
  printed in the second equation.
- **(B) −7** — reports `y` alone.
- **(C) −4** — correct.
- **(D) 3** — reports `x` alone. (B) and (D) are the two components; a student who solves
  correctly but stops reading the question lands on one of them.

**Mathematical Solution & Underlying Concept:** Adding the two equations eliminates *y*:
`3x = 9` ⇒ `x = 3`; then `3 − y = 10` ⇒ `y = −7`. So `x + y = **−4**`. (Check:
`2(3) + (−7) = −1` ✓.) *Concept:* the question asks for a sum while the system hands you a
difference — the printed `x − y = 10` is a trap for anyone who answers from the page rather
than from the solution.

---

### [Difficulty Rating: Medium]
### [Algebra › Systems of Two Linear Equations in Two Variables — model building (T4)]

**Question Stem:**

> A bike-share station rents standard bikes and electric bikes. Renting a standard bike
> costs $3 per hour, and renting an electric bike costs $7 per hour. During one afternoon
> the station recorded a total of 40 rentals and collected a total of $216. Which system of
> equations represents this situation, where *s* is the number of standard-bike rentals and
> *e* is the number of electric-bike rentals?

**Options:**
(A) *s* + *e* = 40 and 3*s* + 7*e* = 216
(B) *s* + *e* = 40 and 7*s* + 3*e* = 216
(C) *s* + *e* = 216 and 3*s* + 7*e* = 40
(D) *s* + *e* = 216 and 7*s* + 3*e* = 40

**Correct Answer:** (A)

**Distractor Rationale:**
- **(A)** — correct.
- **(B)** — D8, coefficient transposition: the $3 rate is attached to electric bikes and
  the $7 rate to standard ones.
- **(C)** — D7, constant swap: the count total and the money total are attached to the
  wrong equations.
- **(D)** — both errors at once, the option a student reaches by matching numbers to slots
  in the order they appear in the stem.

**Mathematical Solution & Underlying Concept:** Each rental is either standard or electric,
so the counts add to the total number of rentals: `s + e = 40`. Each standard rental
contributes $3 and each electric rental $7, so the money collected is `3s + 7e = 216`.
*Concept:* one equation counts *things*, the other counts *value*; the rates multiply the
quantities in the value equation only, and each total belongs to the equation measured in
its own units.

*Design note:* all four options use exactly the same six numerals — `1, 1, 3, 7, 40, 216` —
dealt into different slots. 52% of the real model-building distractors in your bank are
built that way.

---

### [Difficulty Rating: Medium]
### [Algebra › Systems of Two Linear Equations in Two Variables — two lines given as functions (F12)]

**Question Stem:**

> In the *xy*-plane, the graph of *y* = 5*x* − 12 intersects the graph of *y* = 2*x* + 3 at
> the point (*a*, *b*). What is the value of *a*?

**Options:**
(A) 5
(B) 9
(C) 13
(D) 15

**Correct Answer:** (A)

**Distractor Rationale:**
- **(A) 5** — correct.
- **(B) 9** — combines the two constants directly, `12 − 3`, without ever setting the
  expressions equal.
- **(C) 13** — reports `b`, the *y*-coordinate, instead of `a`.
- **(D) 15** — stops at `3x = 15` and reports 15, dropping the final division. The most
  instructive wrong answer here.

**Mathematical Solution & Underlying Concept:** At an intersection the two expressions for
*y* are equal: `5x − 12 = 2x + 3` ⇒ `3x = 15` ⇒ `a = **5**` (and `b = 2(5) + 3 = 13`).
*Concept:* two functions of *x* form a system; setting the outputs equal collapses it to a
single linear equation in one variable.

---

### [Difficulty Rating: Medium]
### [Algebra › Systems of Two Linear Equations in Two Variables — derived-quantity context (F11)]

**Question Stem:**

> A ferry charges $9 for each adult fare and $4 for each child fare. On one crossing the
> ferry sold a total of 78 fares and collected a total of $567. How many adult fares did
> the ferry sell on that crossing?

**Options:**
(A) 27
(B) 51
(C) 78
(D) 108

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) 27** — solves the system correctly and reports the number of *child* fares, the
  other component.
- **(B) 51** — correct.
- **(C) 78** — quotes the row total back: the number of fares of both kinds.
- **(D) 108** — a partial total, `4 × 27`: the money taken in child fares rather than a
  count of anything. Diagnoses a student who has lost track of which quantity the question
  measures.

**Mathematical Solution & Underlying Concept:** With *a* adult and *c* child fares,
`a + c = 78` and `9a + 4c = 567`. Substituting `c = 78 − a`: `9a + 312 − 4a = 567` ⇒
`5a = 255` ⇒ `a = **51**` (and `c = 27`; check `459 + 108 = 567` ✓). *Concept:* a
count equation and a value equation in the same two unknowns — the standard two-rate
model, with the answer being one of the counts rather than a total.

---

### [Difficulty Rating: Easy]
### [Algebra › Systems of Two Linear Equations in Two Variables — direct substitution (T1)]

**Question Stem:**

> *y* = 2*x*
> *x* + *y* = 18
>
> The solution to the given system of equations is (*x*, *y*). What is the value of *y*?

**Options:**
(A) 6
(B) 9
(C) 12
(D) 18

**Correct Answer:** (C)

**Distractor Rationale:**
- **(A) 6** — reports `x` instead of `y`, the commonest error at this tier.
- **(B) 9** — halves the total, `18 ÷ 2`, treating the two quantities as equal.
- **(C) 12** — correct.
- **(D) 18** — echoes the total straight from the stem.

**Mathematical Solution & Underlying Concept:** The first equation gives *y* in terms of
*x*, so substitute into the second: `x + 2x = 18` ⇒ `3x = 18` ⇒ `x = 6`, and
`y = 2(6) = **12**`. *Concept:* when one equation is already solved for a variable,
substitution reduces the system to a single linear equation in one move.

---

## Verification

**Mathematics — 29 checks, all passing.** Every key confirmed by substitution; every
distractor confirmed to fail; the construction item's four options each classified
independently; the model-building options confirmed to be permutations of the key's own
numerals.

**Option sets — all conform.** Every numeric set ascends; non-numeric options
(`Zero` … `Infinitely many`) run last; no distractor is key ± 1 anywhere in the batch, and
the single key ± 2 sits in a hard item where it is the output of a named procedure
(`4 − k = 0`), not a near-miss.

**Distractor families**, against the measured distribution in §3.0 of the framework:
9 reporting-the-wrong-thing, 6 procedural sign/placement slips, 5 page-numeral arithmetic,
4 structural misconceptions, 3 stopping-early, 2 partial totals, 1 bare numeral echo — and
that echo is in the Easy item, where the corpus puts them.

**Not yet emitted.** No file under `portal/` has been touched. On your word these become
`banks.js`-schema objects with `<i>`-wrapped variables, U+2212 minus signs, stacked-fraction
markup for `4/3`, `9/4`, `12/5`, 0-indexed `correct`, and stable `gen-sys-0NN` keys.
