# Hard Items v2 — Calibrated Against the Challenge Set and Practice Tests

**Demo only. Nothing written to `portal/`.**

## Two things you were right about

**1. My distractor model came from one source.** The 621 rationales I built it from are
*entirely* from `question-bank-math.js`, because that is the only file with explanations:

| Source | hard items (4 skills) | with explanation |
|---|---:|---:|
| `question-bank-math.js` | 196 | **100%** |
| `practice-tests.js` | 66 | 21% |
| `challenge-questions.js` | 21 | **0%** |
| `banks.js` (diagnostic) | 4 | **0%** |

So the model was never tested against the practice tests, the diagnostic, or your own
compiled hard set. I have now read all 91 hard items from those three files directly.

**2. My items were not hard enough.** Reading the challenge set makes the gap obvious:

| Source | mean words | mean "steps"* |
|---|---:|---:|
| `question-bank-math.js` hard | 38 | 4.0 |
| `practice-tests.js` hard | 37 | 4.7 |
| **`challenge-questions.js` hard** | **48** | **5.3** |

\* relational symbols + operators/2 + connective words

But the count understates it. The real difference is structural.

## What genuinely hard items do that mine did not

Reading all 21 challenge items and 66 practice-test hard items, the hard ones share three
properties my previous batch lacked:

1. **Two or more mechanisms composed**, not one applied cleanly. *"The graph of y = f(x) − 4
   has a y-intercept at (0, 3). The product of a and b is 21. What is the value of a?"* — a
   translation, an intercept, and a product constraint resolving to a quadratic.
2. **An insight that replaces brute force.** *"f(x) = aˣ + a⁻ˣ, f(1) = 5, find f(3)"* — you
   can solve for *a*, but it is irrational; the intended route is the cube identity. Same
   with *"g(x) = |x|/a − 14 where a < 0; find the product of g(15a) and g(7a)"*, where *a*
   cancels entirely.
3. **A final transformation after the hard part.** The answer is `a + b`, or `p²`, or
   `c² − d²`, or a percentage — never the quantity you just solved for.

My previous batch was one mechanism per item, cleanly applied, answer = the thing solved
for. That is *medium* by this bank's standards.

**All ten items below are built to those three properties.** Distractor categories still
follow the corrected model from the explanations, since that part still holds.

---

### [Hard] Advanced Math › Nonlinear Functions — symmetric exponential, identity required

**Stem:** The function *f* is defined by *f*(*x*) = *aˣ* − *a*⁻ˣ, where *a* is a positive
constant. If *f*(1) = 3, what is the value of *f*(3)?

**(A)** 3  **(B)** 9  **(C)** 27  **(D)** 36

**Correct Answer:** (D)

- **(A) 3** — *reported the other quantity.* This is *f*(1), given in the stem.
- **(B) 9** — *computed a different expression.* This is 3*u* where *u* = *a* − *a*⁻¹, the
  correction term alone.
- **(C) 27** — *computed a different expression.* This is *u*³, cubing the given value and
  stopping — the most likely wrong answer, since it looks like the whole job.
- **(D) 36** — correct.

**Solution:** Let *u* = *a* − *a*⁻¹ = 3. Then
(*a* − *a*⁻¹)³ = *a*³ − 3*a* + 3*a*⁻¹ − *a*⁻³ = (*a*³ − *a*⁻³) − 3*u*, so
*a*³ − *a*⁻³ = *u*³ + 3*u* = 27 + 9 = **36**. *Concept:* solving *a* − 1/*a* = 3 gives the
irrational *a* = (3 + √13)/2; the identity avoids it entirely. The item rewards recognising
that *f*(3) is expressible in *f*(1).

---

### [Hard] Advanced Math › Nonlinear Functions — translation, intercept and a product constraint

**Stem:** *f*(*x*) = *a*·3ˣ + *b*, where *a* and *b* are constants and *a* < *b*. In the
*xy*-plane, the graph of *y* = *f*(*x*) + 5 has a *y*-intercept at (0, 1). The product of
*a* and *b* is 3. What is the value of *a*?

**(A)** −4  **(B)** −3  **(C)** −1  **(D)** 3

**Correct Answer:** (B)

- **(A) −4** — *computed a different expression.* This is *a* + *b*, an intermediate result.
- **(B) −3** — correct.
- **(C) −1** — *reported the other quantity.* This is *b*, the other root of the same
  quadratic; reached by ignoring the condition *a* < *b*.
- **(D) 3** — *used a value given in the stem.* This is the product *ab*.

**Solution:** *f*(0) = *a* + *b*, and the translated graph has *y*-intercept
*f*(0) + 5 = 1, so *a* + *b* = −4. With *ab* = 3, *a* and *b* are the roots of
*t*² + 4*t* + 3 = 0, i.e. −1 and −3. Since *a* < *b*, **a = −3**. *Concept:* three separate
facts — a vertical shift, an intercept, and a product — combine into a sum-and-product pair,
and the inequality is what makes the answer unique rather than ambiguous.

---

### [Hard] Algebra › Systems of Two Linear Equations — two function conditions (free-response)

**Stem:** *g*(*x*) = *a*(*x* − 4) + *b*(3*x* + 2), where *a* and *b* are constants. If
*g*(2) = 10 and *g*(0) = −8, what is the value of *a*/*b*?

**Correct Answer:** 3/2

**Solution:** *g*(2) = *a*(−2) + *b*(8) = 10 and *g*(0) = *a*(−4) + *b*(2) = −8. The second
simplifies to −2*a* + *b* = −4. Subtracting from the first: 7*b* = 14, so *b* = 2 and then
*a* = 3. Therefore *a*/*b* = **3/2**. *Concept:* two evaluations of one function produce a
two-by-two system in its constants — the function notation hides an ordinary system, and the
requested ratio is a further step past solving it.

---

### [Hard] Algebra › Linear Inequalities — compound bound from a partitioned total

**Stem:** A shipment contains 20 boxes. Six of the boxes each weigh 14 kilograms, and four
other boxes have a combined weight of 75 kilograms. Each of the remaining boxes weighs more
than 8 kilograms and at most 12 kilograms. The total weight of the shipment is *w* kilograms.
Which inequality represents all possible values of *w*?

**(A)** 80 < *w* ≤ 120  **(B)** 164 < *w* ≤ 204  **(C)** 239 ≤ *w* < 279  **(D)** 239 < *w* ≤ 279

**Correct Answer:** (D)

- **(A)** — *reported the other quantity.* This is the range for the ten remaining boxes
  alone, ignoring the fourteen whose weights are known.
- **(B)** — *wrong model.* Omits the 75 kilograms contributed by the four boxes.
- **(C)** — *wrong model.* Correct endpoints, but both strictnesses reversed: 239 is
  unreachable because each remaining box weighs *more than* 8, and 279 is reachable because
  each weighs *at most* 12.
- **(D)** — correct.

**Solution:** The six boxes contribute 6 × 14 = 84 kg and the four contribute 75 kg, a fixed
159 kg. The remaining 20 − 6 − 4 = 10 boxes each weigh in (8, 12], contributing more than 80
and at most 120. So *w* lies in (159 + 80, 159 + 120], i.e. **239 < w ≤ 279**. *Concept:*
partitioning a total into fixed and variable parts, then carrying the strictness of each
bound through the addition — the endpoints inherit strictness from the variable part only.

---

### [Hard] Algebra › Linear Functions — a linear function recovered through a composition

**Stem:** The function *g* is defined by *g*(*x*) = *f*(2*x* − 1), where *f* is a linear
function. The table gives three values of *x* and their corresponding values of *g*(*x*).

| *x* | *g*(*x*) |
|---:|---:|
| 0 | −1 |
| 2 | 11 |
| 4 | 23 |

What is the value of *f*(4)?

**(A)** 2  **(B)** 11  **(C)** 14  **(D)** 26

**Correct Answer:** (C)

- **(A) 2** — *reported the other quantity.* This is *f*(0), the *y*-intercept of *f*.
- **(B) 11** — *used a value given in the stem.* This is *g*(2), read straight from the
  table, treating *g*(2) as though it were *f*(2).
- **(C) 14** — correct.
- **(D) 26** — *computed a different expression.* This is *f*(8), evaluating *f* at 2(4)
  rather than at 4 — applying the composition in the wrong direction.

**Solution:** Write *f*(*t*) = *mt* + *c*. Then *g*(*x*) = *m*(2*x* − 1) + *c*, so *g* is
linear in *x* with slope 2*m*. From the table the slope of *g* is (11 − (−1))/2 = 6, giving
*m* = 3. From *g*(0) = *f*(−1) = −3 + *c* = −1, *c* = 2. So *f*(*x*) = 3*x* + 2 and
*f*(4) = **14**. *Concept:* the table describes *g*, not *f*; every row must be pulled back
through the substitution *t* = 2*x* − 1 before it says anything about *f*.

---

### [Hard] Advanced Math › Nonlinear Functions — an asymptotic bound

**Stem:** *f*(*x*) = 24 − 6(1/4)ˣ. For all values of *x*, *f*(*x*) < *k*, where *k* is a
constant. What is the least possible value of *k*?

**(A)** 6  **(B)** 18  **(C)** 24  **(D)** 30

**Correct Answer:** (C)

- **(A) 6** — *used a value given in the stem.* This is the coefficient of the exponential
  term.
- **(B) 18** — *reported the other quantity.* This is *f*(0), a value the function takes,
  not a bound on all its values.
- **(C) 24** — correct.
- **(D) 30** — *computed a different expression.* This is 24 + 6, adding the coefficient
  rather than recognising that the term is subtracted and approaches zero.

**Solution:** (1/4)ˣ is positive for every *x*, so 6(1/4)ˣ > 0 and *f*(*x*) < 24 always. As
*x* increases, (1/4)ˣ approaches 0 and *f*(*x*) approaches 24 without reaching it, so no
value below 24 is an upper bound. The least such *k* is **24**. *Concept:* the least upper
bound of an exponential is its horizontal asymptote, and it is never attained — the item
turns on the difference between a value the function takes and a value it approaches.

---

### [Hard] Advanced Math › Nonlinear Functions — rate conversion inside the exponent (free-response)

**Stem:** *v*(*t*) = 18,000(0.5)^(*t*/6) models the value, in dollars, of a machine *t*
months after it was purchased. According to the model, the value of the machine decreases by
*p*% each year. What is the value of *p*?

**Correct Answer:** 75

**Solution:** One year is 12 months, so over a year the factor is
(0.5)^(12/6) = (0.5)² = 0.25. The machine retains 25% of its value, so it decreases by
**75%**. *Concept:* the base of the model belongs to a 6-month period, not to a month and
not to a year; converting a rate between units changes the exponent, and the percentage
decrease is one minus the resulting factor, not the factor itself.

---

### [Hard] Algebra › Linear Functions — collinear points with parametric coordinates

**Stem:** In the *xy*-plane, a line passes through the points (0, 24), (*m*, 20), (*n*, 12),
and (*m* + *n*, *c*), where *m* and *n* are positive constants. What is the value of *c*?

**(A)** 4  **(B)** 8  **(C)** 12  **(D)** 16

**Correct Answer:** (B)

- **(A) 4** — *computed a different expression.* This is 24 − 20, the drop to the second
  point rather than the value at the fourth.
- **(B) 8** — correct.
- **(C) 12** — *used a value given in the stem.* This is the *y*-value at *x* = *n*.
- **(D) 16** — *computed a different expression.* This is the total drop from (0, 24) to
  (*m* + *n*, *c*), not the resulting *y*-value.

**Solution:** The slope is constant, so (20 − 24)/*m* = (12 − 24)/*n*, giving −4/*m* = −12/*n*
and *n* = 3*m*. The line is *y* = 24 − (4/*m*)*x*. At *x* = *m* + *n* = 4*m*,
*y* = 24 − (4/*m*)(4*m*) = 24 − 16 = **8**. *Concept:* neither *m* nor *n* can be found, and
neither needs to be — the constant slope forces a fixed ratio between them, and the
parameter cancels at the point asked about.

---

### [Hard] Algebra › Systems of Two Linear Equations — a symmetric system whose parameter cancels

**Stem:** 3*x* + *ky* = 12 and *kx* + 3*y* = 12 form a system of two linear equations, where
*k* is a constant and *k* ≠ 3 and *k* ≠ −3. The solution to the system is (*x*, *y*). What is
the value of *x* − *y*?

**(A)** 0  **(B)** 3  **(C)** 12  **(D)** The value cannot be determined from the given information.

**Correct Answer:** (A)

- **(A) 0** — correct.
- **(B) 3** — *used a value given in the stem.* This is a coefficient from the system.
- **(C) 12** — *used a value given in the stem.* This is the constant both equations share.
- **(D)** — *wrong model.* Treats an unspecified constant as making the system
  indeterminate, missing that *x* − *y* is fixed for every permitted *k*.

**Solution:** Subtracting the second equation from the first gives
(3 − *k*)*x* + (*k* − 3)*y* = 0, that is (3 − *k*)(*x* − *y*) = 0. Since *k* ≠ 3 the factor
3 − *k* is nonzero, so *x* − *y* = **0**. (The exclusion *k* ≠ −3 is what guarantees the
system has a unique solution at all.) *Concept:* the system is symmetric under swapping *x*
and *y*, which forces the solution onto the line *y* = *x* — visible without solving.

---

### [Hard] Algebra › Linear Inequalities — the largest integer for which a region is non-empty

**Stem:** *y* > 2*x* − 5 and *y* < −*x* + 4 form a system of inequalities. If (*x*, *y*) is a
solution to the system and *x* is an integer, what is the greatest possible value of *x*?

**(A)** 2  **(B)** 3  **(C)** 4  **(D)** 9

**Correct Answer:** (A)

- **(A) 2** — correct.
- **(B) 3** — *wrong model.* Treats the boundary case as attainable, though at *x* = 3 the
  two constraints require 1 < *y* < 1, which no *y* satisfies.
- **(C) 4** — *used a value given in the stem.* This is the constant in the second
  inequality.
- **(D) 9** — *computed a different expression.* This is the value of 3*x* at the boundary,
  reported without dividing by 3.

**Solution:** A solution exists for a given *x* only if some *y* satisfies both, which
requires 2*x* − 5 < −*x* + 4, i.e. 3*x* < 9 and *x* < 3. The greatest integer is **2**, where
the constraints give −1 < *y* < 2. At *x* = 3 the interval collapses to a single excluded
point. *Concept:* the two boundary lines cross at *x* = 3, and because both inequalities are
strict the crossing point itself is excluded — so the feasible region is open on that side.

---

## Verification

**33 checks, all passing** — including symbolic ones rather than arithmetic: item 1's key
verified by solving *a* − 1/*a* = 3 exactly and evaluating *a*³ − *a*⁻³ (36, matching the
identity route); item 8's answer confirmed independent of *m* by symbolic simplification;
item 9's *x* − *y* = 0 confirmed for symbolic *k* and spot-checked at *k* = 5; item 6's bound
confirmed as a limit and checked never to be attained over a range of inputs.

**Difficulty features per item** — every item has at least two:

| # | composed mechanisms | insight required | final transformation |
|---|---|---|---|
| 1 | ✓ | cube identity | — |
| 2 | ✓✓ (shift + intercept + product) | sum-and-product | pick the root by *a* < *b* |
| 3 | ✓ | — | ratio *a*/*b* |
| 4 | ✓✓ (partition + strictness) | strictness propagation | — |
| 5 | ✓✓ (composition + table) | pull rows back through 2*x* − 1 | — |
| 6 | ✓ | asymptote is not attained | — |
| 7 | ✓ | unit conversion in the exponent | 1 − factor, as a % |
| 8 | ✓ | parameter cancels | — |
| 9 | ✓ | symmetry ⇒ *y* = *x* | — |
| 10 | ✓ | region non-empty ⇔ boundary order | greatest integer |

**Form.** Key positions A 2 / B 2 / C 2 / D 2. Free-response 2 of 10 (20%). Numeric keys:
36, −3, 3/2, 14, 24, 75, 8, 0, 2 — one negative (11%), one fractional (11%), six within ±20.
One non-numeric key (item 4, a compound inequality); item 9 places its non-numeric option
last, per house convention.

**Distractor categories** across the 24 distractors, still following the corrected model:
computed a different expression 8, used a value given in the stem 7, reported the other
quantity 5, wrong model 4. No sign-flip or page-numeral-arithmetic rationales.

Note the shift from the previous batch: *used a value given in the stem* rises from 0 to 7.
That is a direct consequence of composing mechanisms — once an item carries three or four
given quantities, echoing one of them back becomes the natural wrong answer, and the corpus
uses it too.

**Not emitted.** No file under `portal/` has been touched.
