# Hard Items — Built on the Corrected Distractor Model

**Demo only. Nothing written to `portal/` or to any bank.**

Ten hard items across the four analysed skills, generated under the distractor model taken
from the **authors' own 621 written rationales** rather than from my mutation engine.

## What changed from the earlier batches

| | earlier batches | this batch |
|---|---|---|
| distractor sources | sign flips, page-numeral arithmetic, report-wrong-thing | **wrong model, computed a different expression, reported the other quantity** |
| non-numeric keys | 0 of 20 | **4 of 10 (40%)** |
| free-response | 0 of 20 | 2 of 10 (20%) |
| skills covered | one per batch | all four, weighted to their hard tiers |

The first row is the substantive change. My published recipe said to sample ~18% sign-flips
and ~28% page-numeral arithmetic. The authors describe **neither**: across 621 rationales,
"sign handling" is 7 instances (1%) and arithmetic-on-page-numerals does not appear as a
category at all. What they document is *wrong model* (20%), *computed a different
expression* (19%), and *reported the other variable or quantity* (16%) — 54% between them.

**Every distractor below is tagged with the author category it implements.** Where a skill's
corpus shows a distinctive mix, the item follows it: Linear Inequalities distractors are
41% wrong-model in the real bank, so both inequality items below are built from wrong models.

**Allocation**, proportional to each skill's hard tier: Nonlinear Functions 4 (147 hard),
Systems 2 (58), Linear Functions 2 (55), Linear Inequalities 2 (27).

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — derived-expression target]

**Question Stem:**

> 5*x* − 2*y* = 4
> 3*x* + 4*y* = 18
>
> The solution to the given system of equations is (*x*, *y*). What is the value of 2*x* + 4*y*?

**Options:**
(A) 3
(B) 10
(C) 14
(D) 16

**Correct Answer:** (D)

**Distractor Rationale:**
- **(A) 3** — *reported the other quantity.* This is the value of *y*, not the value of
  2*x* + 4*y*.
- **(B) 10** — *computed a different expression.* This is the value of 2*x* + 2*y*.
- **(C) 14** — *computed a different expression.* This is the value of 4*x* + 2*y*, with the
  coefficients attached to the wrong variables.
- **(D) 16** — correct.

**Mathematical Solution & Underlying Concept:** Doubling the first equation gives
10*x* − 4*y* = 8; adding the second gives 13*x* = 26, so *x* = 2, and then 5(2) − 2*y* = 4
gives *y* = 3. So 2*x* + 4*y* = 4 + 12 = **16**. Alternatively, 2*x* + 4*y* = (3*x* + 4*y*)
− *x* = 18 − 2 = 16 without finding *y* at all. *Concept:* a compound target can often be
read off the given equations directly, which is faster than solving for both variables.

*Model note:* the target 2*x* + 4*y* is 75% hard in this skill (derived-expression targets),
against 33% for a bare variable.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — second-equation construction]

**Question Stem:**

> 3*x* + 2*y* = 12
>
> One of the two equations in a system of two linear equations is given. The system has
> infinitely many solutions. Which equation could be the second equation in the system?

**Options:**
(A) 3*x* + 2*y* = 24
(B) 6*x* + 2*y* = 24
(C) 6*x* + 4*y* = 12
(D) 6*x* + 4*y* = 24

**Correct Answer:** (D)

**Distractor Rationale:**
- **(A)** — *wrong model.* Keeps the coefficients and changes only the constant, which
  encodes two parallel, distinct lines: no solution, not infinitely many.
- **(B)** — *wrong model.* Doubles only the *x*-coefficient, so the slopes differ and the
  lines cross exactly once.
- **(C)** — *wrong model.* Doubles the left side but leaves the constant at 12, again giving
  parallel distinct lines. This is the classic half-executed scaling.
- **(D)** — correct.

**Mathematical Solution & Underlying Concept:** Infinitely many solutions means the two
equations describe the same line, so one must be a nonzero multiple of the other —
**every** term, including the constant. Doubling 3*x* + 2*y* = 12 throughout gives
6*x* + 4*y* = **24**. *Concept:* scaling an equation is an operation on the whole equation;
scaling one side changes which line it describes.

*Design note:* the four options span all three outcomes — (A) and (C) no solution, (B)
exactly one, (D) infinitely many — which is what 8 of 8 real construction items in your bank
do.

---

### [Difficulty Rating: Hard]
### [Advanced Math › Nonlinear Functions — vertex form with a declared constant]

**Question Stem:**

> *f*(*x*) = 2(*x* − 3)² + *k*
>
> In the given function, *k* is a constant. The minimum value of *f* is −7. What is the
> value of *f*(0)?

**Options:**
(A) −7
(B) 11
(C) 18
(D) 25

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) −7** — *reported the other quantity.* This is the minimum value of *f*, which the
  stem supplies, not the value of *f*(0).
- **(B) 11** — correct.
- **(C) 18** — *computed a different expression.* This is the value of 2(0 − 3)², omitting
  the constant *k* entirely.
- **(D) 25** — *computed a different expression.* This is the value of 2(0 − 3)² + 7, using
  +7 where the constant is −7.

**Mathematical Solution & Underlying Concept:** In the form *a*(*x* − *h*)² + *k* with
*a* > 0, the minimum value is *k* itself, attained at *x* = *h*. So *k* = −7 and
*f*(*x*) = 2(*x* − 3)² − 7. Then *f*(0) = 2(9) − 7 = **11**. *Concept:* vertex form displays
the minimum value as a constant, so the stated minimum identifies *k* without any
calculation — the work is entirely in the evaluation that follows.

*Model note:* two of this skill's strongest levers at once — a declared constant (1.99×) and
a vertex/extremum target (72% hard).

---

### [Difficulty Rating: Hard]
### [Advanced Math › Nonlinear Functions — exponential model with a change of time unit]

**Question Stem:**

> A culture contains 5,000 bacteria, and the number of bacteria decreases by 12% each hour.
> Which function gives the number of bacteria in the culture *t* days after the culture was
> measured?

**Options:**
(A) *b*(*t*) = 5,000(0.12)^(24*t*)
(B) *b*(*t*) = 5,000(0.88)^(*t*)
(C) *b*(*t*) = 5,000(0.88)^(24*t*)
(D) *b*(*t*) = 5,000(24)(0.88)^(*t*)

**Correct Answer:** (C)

**Distractor Rationale:**
- **(A)** — *wrong model.* Uses the raw percentage 0.12 as the growth factor. This models a
  culture that retains 12% of its bacteria each hour, not one that loses 12%.
- **(B)** — *wrong model.* Correct hourly factor, but the exponent still counts hours while
  the question asks for *t* in days.
- **(C)** — correct.
- **(D)** — *computed a different expression.* Multiplies the initial amount by 24 instead
  of applying the 24 hours in the exponent.

**Mathematical Solution & Underlying Concept:** Losing 12% each hour leaves 88%, so the
hourly factor is 0.88 and after *n* hours the count is 5,000(0.88)^*n*. One day is 24 hours,
so *n* = 24*t* and *b*(*t*) = **5,000(0.88)^(24t)**. *Concept:* the base of an exponential
model belongs to one unit of time; changing the unit multiplies the exponent, it does not
change the base or the initial value.

*Model note:* the raw-percentage distractor is the most reliable trap in this skill — 11 of
15 percent-context items in your bank offer it.

---

### [Difficulty Rating: Hard]
### [Advanced Math › Nonlinear Functions — constant recovered from a point (free-response)]

**Question Stem:**

> *f*(*x*) = *a*(*x* − 3)(*x* + 5)
>
> In the given function, *a* is a constant. If *f*(1) = 8, what is the value of *a*?

**Correct Answer:** −2/3

**Mathematical Solution & Underlying Concept:** Substituting *x* = 1 gives
*f*(1) = *a*(1 − 3)(1 + 5) = *a*(−2)(6) = −12*a*. Setting −12*a* = 8 gives
*a* = **−2/3**. *Concept:* the factored form fixes the zeros but leaves the vertical scale
undetermined; a single point off the *x*-axis pins it down. The negative sign follows from
the point lying above the axis at an *x*-value between the two zeros, where the product of
the factors is negative.

*Model note:* free-response, a negative fractional key. Nonlinear Functions' hard tier runs
30% free-response, 26% negative keys and 20% fractional — all three of which my earlier
batches missed entirely.

---

### [Difficulty Rating: Hard]
### [Advanced Math › Nonlinear Functions — composition and the minimum value]

**Question Stem:**

> *f*(*x*) = *x*² − 8*x* + 3
>
> The function *g* is defined by *g*(*x*) = *f*(*x* − 2). What is the minimum value of *g*?

**Options:**
(A) −13
(B) 3
(C) 4
(D) 6

**Correct Answer:** (A)

**Distractor Rationale:**
- **(A) −13** — correct.
- **(B) 3** — *reported the other quantity.* This is the constant term of *f*, and the value
  of *f*(0), not a minimum.
- **(C) 4** — *reported the other quantity.* This is the *x*-value at which *f* reaches its
  minimum, not the minimum value, and it belongs to *f* rather than *g*.
- **(D) 6** — *reported the other quantity.* This is the *x*-value at which *g* reaches its
  minimum — the right function, but the input rather than the output.

**Mathematical Solution & Underlying Concept:** *f* has its vertex at
*x* = −(−8)/(2·1) = 4, where *f*(4) = 16 − 32 + 3 = −13. The graph of *g*(*x*) = *f*(*x* − 2)
is the graph of *f* translated 2 units right, which moves the vertex to *x* = 6 but does not
change its height. So the minimum value of *g* is **−13**. *Concept:* a horizontal
translation relocates an extremum without altering it — the question asks for the value, and
the translation is a distractor built into the problem itself.

*Model note:* composition is the single strongest difficulty predictor in this skill —
10 of 10 such items in the bank are hard.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Functions — linear model from a table]

**Question Stem:**

> The table gives three values of *x* and their corresponding values of *f*(*x*) for the
> linear function *f*.
>
> | *x* | *f*(*x*) |
> |---:|---:|
> | 2 | 13 |
> | 5 | 4 |
> | 8 | −5 |
>
> Which equation defines *f*?

**Options:**
(A) *f*(*x*) = −3*x* + 19
(B) *f*(*x*) = −(1/3)*x* + 19
(C) *f*(*x*) = −3*x* + 13
(D) *f*(*x*) = 3*x* + 19

**Correct Answer:** (A)

**Distractor Rationale:**
- **(A)** — correct.
- **(B)** — *slope misread.* Inverts the rate of change, dividing the change in *x* by the
  change in *f*(*x*) rather than the other way round.
- **(C)** — *intercept misread.* Correct slope, but takes 13 — the first listed output — as
  the *y*-intercept, though it is the value at *x* = 2, not *x* = 0.
- **(D)** — *slope misread.* Takes the magnitude of the rate of change but not its sign,
  though *f*(*x*) is decreasing as *x* increases.

**Mathematical Solution & Underlying Concept:** The rate of change is
(4 − 13)/(5 − 2) = −3, and it is consistent across the table since (−5 − 4)/(8 − 5) = −3.
Using the first row, 13 = −3(2) + *b*, so *b* = 19 and
*f*(*x*) = **−3*x* + 19**. *Concept:* a table gives no *x* = 0 row, so the intercept must be
computed by extrapolating back, not read off.

*Model note:* a table is this skill's strongest difficulty lever (1.91×), and slope- or
intercept-misreading is its most documented distractor family. Note also that Linear
Functions has **zero** hard items presented as bare display-math — a hard item here is a
table or a scenario.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Functions — linear model from two data points (free-response)]

**Question Stem:**

> A technician charges a fixed call-out fee plus a constant hourly rate. A job that takes
> 3 hours costs $245, and a job that takes 7 hours costs $445. What is the total cost, in
> dollars, of a job that takes 5 hours?

**Correct Answer:** 345

**Mathematical Solution & Underlying Concept:** The hourly rate is the rate of change:
(445 − 245)/(7 − 3) = 50 dollars per hour. The call-out fee is the value at 0 hours:
245 − 3(50) = 95. A 5-hour job therefore costs 95 + 5(50) = **$345**. *Concept:* two points
determine a linear model, and the fixed fee is its intercept — recoverable only by
extrapolating back from a data point, never by dividing a total by its hours.

*Model note:* real-world context is a genuine difficulty lever in this skill (1.54×,
p = 0.023) and in no other of the four — the one finding my bank-level average had hidden.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — system model-building]

**Question Stem:**

> A delivery van can carry a total load of at most 1,200 kilograms. The van is loaded with
> *x* crates weighing 45 kilograms each and *y* pallets weighing 130 kilograms each, and it
> must carry at least 6 pallets. Which system of inequalities represents this situation?

**Options:**
(A) 45*x* + 130*y* ≥ 1,200 and *y* ≥ 6
(B) 45*x* + 130*y* ≤ 1,200 and *y* ≤ 6
(C) 45*x* + 130*y* ≤ 1,200 and *y* ≥ 6
(D) 130*x* + 45*y* ≤ 1,200 and *y* ≥ 6

**Correct Answer:** (C)

**Distractor Rationale:**
- **(A)** — *wrong model.* Reverses the capacity constraint, describing a van that must
  carry **at least** 1,200 kilograms rather than at most that.
- **(B)** — *wrong model.* Encodes "at least 6 pallets" as *y* ≤ 6, reversing the second
  constraint while keeping the first correct.
- **(C)** — correct.
- **(D)** — *wrong model.* Attaches 130 kilograms to the crates and 45 to the pallets,
  swapping which item carries which weight.

**Mathematical Solution & Underlying Concept:** The total load is 45*x* + 130*y*, and "at
most 1,200" makes that ≤ 1,200. "At least 6 pallets" constrains the pallet count directly:
*y* ≥ 6. *Concept:* each phrase maps to one symbol — *at most* to ≤, *at least* to ≥ — and
each weight belongs to the quantity it describes.

*Model note:* all three distractors are wrong models, which is what this skill's corpus
does — 41% of its documented distractors are wrong models, its single largest category, and
it has **zero** "computed a different expression" rationales.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — extremum under a budget constraint]

**Question Stem:**

> A gym charges a one-time joining fee of $60 plus $28 for each month of membership. A
> member wants the total amount spent to be less than $500. What is the greatest whole
> number of months the membership can last?

**Options:**
(A) 5
(B) 15
(C) 17
(D) 18

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) 5** — *wrong model.* Charges the $60 joining fee every month, solving
  88*m* < 500 instead of 60 + 28*m* < 500.
- **(B) 15** — correct.
- **(C) 17** — *wrong model.* Omits the joining fee altogether, solving 28*m* < 500.
- **(D) 18** — *wrong model.* Omits the joining fee and then rounds 17.8 upward, though a
  partial month cannot be afforded.

**Mathematical Solution & Underlying Concept:** The total after *m* months is 60 + 28*m*,
and the requirement is 60 + 28*m* < 500, so 28*m* < 440 and *m* < 15.71. The greatest whole
number of months is **15** (costing $480; a 16th month would reach $508). *Concept:* a
one-time fee sits outside the repeated term, and an extremal answer must be rounded toward
the feasible side — down, here, because the inequality is an upper bound.

---

## Verification

**Mathematics — 34 checks, all passing.** Every key derived independently; every distractor
confirmed to be the stated wrong procedure rather than merely a wrong number; the
construction item's four options each classified as unique / none / infinitely many; the
table item's three rows confirmed collinear and each distractor equation confirmed to fail
at least one row; both extremal items checked at the boundary and one step past it.

**Distractor composition**, against the authors' documented distribution:

| Category | this batch | share | authors' corpus |
|---|---:|---:|---:|
| wrong model / wrong situation encoded | 11 | **46%** | 20% |
| reported the other variable or quantity | 5 | 21% | 16% |
| computed a different expression | 5 | 21% | 19% |
| slope misread | 2 | 8% | 3% |
| intercept misread | 1 | 4% | 1% |
| **sign flips** | **0** | 0% | 1% |
| **arithmetic on page numerals** | **0** | 0% | not a documented category |

24 distractors across 8 multiple-choice items. Every one implements a category the item
authors actually use, and the two families my earlier recipe over-weighted are absent.

**One imbalance, disclosed.** Wrong-model runs 46% here against 20% in the corpus. That is a
consequence of another correction rather than a free choice: to fix the missing non-numeric
keys I added construction and model-building items, and those are precisely the item types
whose distractors *are* wrong models. Both Linear Inequalities items are wrong-model by
design, which matches that skill (41%), but the batch average is pulled well above the
overall figure. A larger batch should hold non-numeric keys near 40% while letting more of
them be symbolic selections, which carry different-expression distractors instead.

**Form.** Key positions A 2 / B 2 / C 2 / D 2. Non-numeric keys 4 of 10 (40%); free-response
2 of 10 (20%); numeric keys 16, 11, −13, −2/3, 345, 15 — two negative, one fractional, four
within ±20. Numerals in the symbolic items stay in the 2–9 band the corpus uses; the larger
values (1,200, 5,000, 500) appear only in contexts, as they do in the bank.

**Structural distinctness.** No two items share a skeleton, and none repeats a frame from the
two earlier batches. Real items in these skills share a structure only 6–17% of the time.

**Not emitted.** No file under `portal/` has been touched.
