# Linear Inequalities in One or Two Variables — Analysis and Hard-Tier Items

**Status: demo only. Nothing here has been written to `portal/` or to any question bank.**

Same pipeline as `QUESTION_GENERATION_SYSTEM.md`, applied to a new skill, and generating
**hard items only** as requested.

**Corpus.** All matching items across the five banks: **94 unique after dedupe** —
32 easy / 35 medium / **27 hard**; 83 MC / 11 FR; 7 carry a figure; 78 carry a worked
solution. Normalised with the same fraction-reconstructing parser, extended to preserve
`≤ ≥ < >`.

---

# PART 1 — What this skill's corpus actually looks like

## 1.1 The headline: this skill is nothing like Systems

The Systems analysis found a hard tier built from one template (32% of hard items were the
same "no solution" parameter question) written in a closed inventory of memorised
sentences. Inequalities is the opposite on both counts.

| | Systems | Linear Inequalities |
|---|---|---|
| distinct interrogatives in the hard tier | concentrated — one form is 20% of the corpus | **24 distinct forms across 27 hard items** |
| repeated frame sentences | `The solution to the given system…` × 40 | **none** — no sentence recurs across distinct items |
| dominant hard template | 32% of hard tier | largest is 9 of 27 (33%), but spread over 6 sub-types |
| subordinate clauses e/m/h | 0.56 / 0.55 / **0.92** (rises 65%) | 1.62 / 1.60 / **1.56** (flat) |
| prose words e/m/h | 21 / 20 / 28 symbolic (rises) | **41.6 / 39.5 / 49.7** (rises 26% at hard) |

**The difficulty mechanism is inverted.** In Systems, hard items are the same length but
more deeply embedded — difficulty is *syntactic*. In Inequalities, subordination is
completely flat and difficulty is carried by **sheer length and number count**: hard stems
run 8 words longer than easy ones and carry more numerals (2.59 vs 2.56 per stem, with the
hard tier's extra length going into extra *conditions*, not extra clauses).

Practically: an inequality item gets harder by **stacking constraints**, not by nesting
grammar. That is a different generation lever entirely.

## 1.2 Template census

| Template | easy | med | hard |
|---|---:|---:|---:|
| T1 model-building — "which inequality represents…" | 11 | 9 | 9 |
| T3 extremal value (greatest / least / maximum / minimum) | 7 | 8 | 9 |
| T7 table of values satisfying an inequality | 0 | 4 | 3 |
| T5 derived bound on one variable from a system | 0 | 0 | **3** |
| T4 which point satisfies the system | 1 | 3 | 1 |
| T10 graph / shaded region | 3 | 3 | 1 |
| T2 model-building — which **system** of inequalities | 0 | 1 | 1 |
| T6 quadrant identification | 0 | 0 | **1** |
| T8 interpretation of a term in context | 1 | 0 | 1 |
| T11 parameter inside the inequality | 0 | 0 | **1** |
| T9 solve a one-variable inequality | 0 | 1 | 0 |
| T12 real-world context | 13 | 6 | 10 |

Note T1: **model-building runs flat across all three tiers** (11 / 9 / 9). In Systems the
same template collapsed out of the hard tier. Here "which inequality represents this
situation" is a legitimate hard question, because the difficulty lives in the modelling —
compound bounds, inverted rates, geometry — not in the algebra.

## 1.3 What actually makes an inequality item hard

Counted over the 27 hard items:

| n / 27 | Mechanism |
|---:|---|
| 7 | **two constraints must be combined** (a system, or a dual "at least … at most" bound) |
| 6 | the answer is a **compound (double) inequality**, `a < x ≤ b` |
| 5 | the answer requires **rounding to an integer** at the end |
| 4 | a **rate or percentage must be inverted** to isolate the variable |
| 3 | a **geometry fact or formula** is supplied and must be applied first |
| 1 | algebraic representation of consecutive terms |

## 1.4 The inequality-specific vocabulary

| Phrase | easy | med | hard | total |
|---|---:|---:|---:|---:|
| "at least" | 10 | 4 | 4 | 18 |
| "at most" | 3 | 4 | 6 | 13 |
| "greatest" / "least" (superlative) | 10 | 7 | 9 | 26 |
| "maximum" / "minimum" (noun) | 11 | 7 | 5 | 23 |
| "more than" / "less than" | 6 | 9 | 7 | 22 |
| "no more than" | 4 | 4 | 1 | 9 |
| "cannot exceed" / "without exceeding" | 0 | 3 | 2 | 5 |
| compound inequality appears | 9 | 9 | 7 | 25 |

The register is stable: **"at least" / "at most" are the house forms for inclusive bounds**,
"more than" / "less than" for strict ones, and the superlatives "greatest" / "least" are how
an extremal answer is requested. No item anywhere uses second person.

## 1.5 Register and deixis

| | e | m | h | total |
|---|---:|---:|---:|---:|
| "the given inequality / system" | 0 | 6 | 5 | 11 |
| **"above" / "below" (old paper-SAT phrasing)** | 0 | 3 | 3 | **6** |
| "this situation" | 9 | 3 | 4 | 16 |
| "Which of the following…" | 8 | 16 | 9 | 33 |
| bare "Which inequality / system / point…" | 14 | 10 | 8 | 32 |
| modal "could" | 2 | 5 | 2 | 9 |
| indicative "represents" | 13 | 11 | 9 | 33 |
| second person "you" | 0 | 0 | 0 | **0** |

Same finding as the Systems bank, smaller in scale: **6 items still use the pre-digital
"above" / "below" phrasing** and should be rewritten to "the given".

---

# PART 2 — Distractor forensics

## 2.1 Options that are themselves inequalities

44 MC items have four inequality options — 132 distractors. Comparing each distractor's
parsed `(expression, operator, bound)` structure against the key's:

| n | How the distractor differs from the key |
|---:|---|
| 61 | same operators, different expression or bounds |
| 24 | direction reversed **and** bounds changed |
| 21 | different number of inequality signs (single vs compound) |
| 17 | **inequality direction reversed only** |
| 5 | expression and operators both altered |
| 3 | operator altered (mixed direction / strictness) |
| **1** | **strictness changed (`<` ↔ `≤`) only** |

**Direction reversal is the signature trap of this skill** — 41 of 132 distractors (31%)
flip a direction, against 31 of 132 that change only the numbers.

## 2.2 The gap: strict versus inclusive is essentially untested

That single row above is the finding worth acting on.

- Items whose four options are all inequalities: **44**
- Items where the options differ **only** in the operator: **0**
- Items containing two options identical except for strictness: **8**

The distinction between `<` and `≤` — whether the boundary value is itself a solution — is
the conceptual core of inequality notation, and this corpus almost never makes a student
decide it. One distractor in 132. It is the largest available opening in the skill, and
**five of the ten items below are built on it.**

## 2.3 Extremal items and the rounding trap

43 items ask for a greatest / least / maximum / minimum value. Among those with numeric
options, **12% of distractors are exactly key ± 1** — nearly double the 7% rate in the
Systems bank, and unsurprising: an extremal answer is a boundary rounded to an integer, so
the off-by-one is the natural error. Here, unlike in Systems, a ±1 distractor is a *named
procedure* rather than a near-miss, and belongs in hard items.

## 2.4 Answer-form profile

| tier | numeric keys | integer | \|v\| ≤ 20 | negative | non-integer |
|---|---:|---:|---:|---:|---:|
| easy | 9 | 89% | 78% | 0% | 11% |
| medium | 10 | 100% | 60% | 30% | 0% |
| **hard** | **10** | **90%** | **60%** | **30%** | **10%** |

Note the contrast with Systems, where negative keys ran 14% at hard. **Here they run 30%** —
negative answers are ordinary in this skill, because inequalities routinely resolve to
bounds below zero. The generation target for a hard batch is therefore ~30% negative, ~10%
fractional, ~60% within ±20.

## 2.5 Option ordering and key position

Numeric option sets: **15 ascending, 3 descending, 0 unordered** — ascending is the norm,
as in Systems.

Key positions across all 83 MC items: **A 26 / B 16 / C 14 / D 27**. That is 64% at A or D
against a 50% chance baseline, which looks like a leak. It is not established: χ² = 6.49,
df = 3, **p ≈ 0.09 — not significant at 0.05**. Suggestive, n too small to act on.

I have therefore generated the batch below at a roughly even 2/3/3/2 rather than copying a
skew I cannot show is real. If it *is* real, copying it would build an answer-position leak
into new content; if it is noise, matching it gains nothing.

---

# PART 3 — QA findings in the existing bank

**a) One genuinely broken item — `qid 187f74bc` (hard).** The stem is
`ry < 60, where r is a constant`, shown with a graph. Its figure's alt text reads
*"Graph with shaded region **below** the dashed horizontal line y = −4."* I opened the PNG:
**the shading is above the line.** The explanation agrees with the image ("all of the points
above this boundary line", giving `y > −4` and `r = −15`, choice D, which is the stored
key).

So the image, the explanation and the key are all correct and mutually consistent — **only
the alt text is wrong**, and it is wrong in the one way that matters: a student using a
screen reader, or any pipeline reading alt text instead of pixels, is told the opposite
region. Worse, "below" makes the item unanswerable: `y < −4` from `ry < 60` requires
`r > 0` with `60/r = −4`, which has no positive solution, so no option is correct. This is a
one-line fix — change `below` to `above`.

I checked whether this is systemic: of 10 figure items whose alt text names "above" or
"below" and that also carry an explanation, **exactly 1 contradicts its explanation** — this
one.

**b) 6 items still use the old paper-SAT "above" / "below" phrasing** (3 medium, 3 hard),
where the digital SAT says "the given". Same mechanical rewrite as flagged for Systems.

**c) Clean results, reported as such.** Three checks that found nothing:

- **Keys are sound.** 68 of 68 MC items whose explanation names a letter agree with the
  stored key; 10 of 10 free-response answers appear in their own explanations.
- **No unescaped `<` breaks rendering.** 9,862 string fields scanned across all five banks.
  66 instances of `<` followed by a space, digit or `=` — all render literally and are safe.
  Every remaining hit was a genuine SVG tag. This was worth checking precisely because an
  inequality bank is full of raw `<` characters, and `<` immediately followed by a letter
  *would* be swallowed by the HTML parser.
- **No difficulty-tag conflicts.** An initial pass flagged 4 items in each skill as tagged
  at two different difficulties; matching on prose **and** math showed all of them to be
  prefix collisions between genuinely different items. The real count is **zero** in both
  skills.

---

# PART 4 — Ten hard items

Six frames deliberately target what the corpus under-tests: **strict vs inclusive
boundaries** (absent — 1 distractor in 132), **quadrant reasoning** (1 item), **a parameter
inside the inequality** (1 item), **empty feasible regions** (absent), and **integer-solution
counting** (absent).

Batch profile: key positions **A 2 / B 3 / C 3 / D 2**; of 7 numeric keys, **2 negative
(29%, corpus 30%)**, **1 fractional (14%, corpus 10%)**, all within ±20.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — compound inequality with a boundary decision]

**Question Stem:**

> −13 < 5 − 3*x* ≤ 11
>
> In the given inequality, *x* is an integer. What is the greatest value of *x* that
> satisfies the given inequality?

**Options:**
(A) −2
(B) −1
(C) 5
(D) 6

**Correct Answer:** (C)

**Distractor Rationale:**
- **(A) −2** — solves correctly, reaching −2 ≤ *x* < 6, then answers the *least* integer
  instead of the greatest.
- **(B) −1** — the least integer again, but with the inclusive lower bound read as strict,
  so −2 is wrongly excluded.
- **(C) 5** — correct.
- **(D) 6** — takes the upper boundary as attainable. It is not: the left inequality is
  strict, so *x* = 6 gives 5 − 18 = −13, and −13 < −13 is false. This is the intended trap
  and the most tempting wrong answer.

**Mathematical Solution & Underlying Concept:** Split the compound inequality.
From −13 < 5 − 3*x*: −18 < −3*x*, and dividing by −3 **reverses** the direction, giving
*x* < 6. From 5 − 3*x* ≤ 11: −3*x* ≤ 6, so *x* ≥ −2. Together, −2 ≤ *x* < 6, whose greatest
integer member is **5**. *Concept:* dividing by a negative reverses each direction, and the
two bounds differ in strictness — the lower is attainable, the upper is not.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — parameter recovered from a solution set]

**Question Stem:**

> *ax* + 5 ≥ 2*x* − 7
>
> In the given inequality, *a* is a constant. The solution to the inequality is *x* ≤ 8.
> What is the value of *a*?

**Options:**
(A) −3/2
(B) 1/2
(C) 2
(D) 7/2

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) −3/2** — reports the coefficient *a* − 2 rather than *a* itself, stopping one
  substitution short.
- **(B) 1/2** — correct.
- **(C) 2** — the value that makes the *x* terms cancel. The student picks the value that
  "removes" *x*, not noticing it leaves 5 ≥ −7, true for every *x*, which is not a solution
  set of the form *x* ≤ 8.
- **(D) 7/2** — solves −12/(*a* − 2) = −8 instead of 8, flipping the sign of the boundary.

**Mathematical Solution & Underlying Concept:** Collect terms: (*a* − 2)*x* ≥ −12. The
solution has the form *x* ≤ 8, and a `≤` can only arise from dividing by a **negative**
coefficient, so *a* − 2 < 0 and *x* ≤ −12/(*a* − 2). Setting −12/(*a* − 2) = 8 gives
*a* − 2 = −3/2, so *a* = **1/2**. Check: (−3/2)*x* ≥ −12 ⇒ *x* ≤ 8 ✓. *Concept:* the
*direction* of the given solution set is itself information — it tells you the sign of the
coefficient before you compute its value.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — empty feasible region (absent frame)]

**Question Stem:**

> *y* ≤ 2*x* + 5
> *y* ≥ 2*x* + *k*
>
> In the given system of inequalities, *k* is a constant. If the system has no solution,
> which of the following could be the value of *k*?

**Options:**
(A) 2
(B) 4
(C) 5
(D) 8

**Correct Answer:** (D)

**Distractor Rationale:**
- **(A) 2** and **(B) 4** — the belief that a smaller constant shrinks the region to
  nothing. Both leave a non-empty band between the two parallel lines.
- **(C) 5** — the boundary case. Here the two lines coincide, and the solution set is that
  entire line: infinitely many solutions, not none. This is the inequality analogue of the
  central Systems misconception, confusing "the region collapses" with "the region is
  empty".
- **(D) 8** — correct.

**Mathematical Solution & Underlying Concept:** Both boundaries have slope 2, so the lines
are parallel and the solution set is the band `2x + k ≤ y ≤ 2x + 5`. Such a *y* exists for
some *x* exactly when 2*x* + *k* ≤ 2*x* + 5, i.e. when *k* ≤ 5. The system therefore has no
solution precisely when *k* > 5, and of the options only **8** qualifies. *Concept:* two
parallel strict-side constraints pointing at each other define a band whose width is the
difference of the constants; the system is unsatisfiable exactly when that width goes
negative.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — counting integer solutions (absent frame)]

**Question Stem:**

> −3 ≤ (2*x* + 1)/5 < 4
>
> In the given inequality, *x* is an integer. How many values of *x* satisfy the given
> inequality?

**Options:**
(A) 10
(B) 17
(C) 18
(D) 35

**Correct Answer:** (C)

**Distractor Rationale:**
- **(A) 10** — counts only the non-negative solutions, 0 through 9, overlooking that the
  interval extends below zero.
- **(B) 17** — drops the endpoint *x* = −8 by reading the inclusive lower bound as strict.
  The boundary-inclusion trap, in counting form.
- **(C) 18** — correct.
- **(D) 35** — counts integer values of 2*x* rather than of *x*: the 35 integers from −16 to
  18. The student never divides by 2 at the final step.

**Mathematical Solution & Underlying Concept:** Multiply throughout by 5:
−15 ≤ 2*x* + 1 < 20. Subtract 1: −16 ≤ 2*x* < 19. Divide by 2: −8 ≤ *x* < 9.5. The integers
are −8 through 9 inclusive, and 9 − (−8) + 1 = **18**. *Concept:* counting integer solutions
requires deciding both endpoints separately — one is attained, one is not — and the count
is over *x*, not over the expression that was manipulated.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — extremal value under two binding constraints]

**Question Stem:**

> A caterer has $960 to spend on serving trays. Small trays cost $18 each and large trays
> cost $30 each. The caterer must buy at least 40 trays in total and cannot spend more than
> $960. What is the greatest number of large trays the caterer can buy?

**Options:**
(A) 20
(B) 32
(C) 40
(D) 53

**Correct Answer:** (A)

**Distractor Rationale:**
- **(A) 20** — correct.
- **(B) 32** — uses only the budget, `960 ÷ 30 = 32`, ignoring the requirement to buy at
  least 40 trays. The single-constraint error, and the one the item is built to catch.
- **(C) 40** — quotes the count requirement back as though it were the answer.
- **(D) 53** — uses the budget with the *small*-tray price, `960 ÷ 18`, rounded down:
  the right method applied to the wrong rate.

**Mathematical Solution & Underlying Concept:** Let *s* and *ℓ* be the numbers of small and
large trays. Then *s* + *ℓ* ≥ 40 and 18*s* + 30*ℓ* ≤ 960. Buying more large trays costs
more, so the cheapest way to meet the count is to hold *s* + *ℓ* at exactly 40, giving
*s* = 40 − *ℓ*. Substituting: 18(40 − *ℓ*) + 30*ℓ* ≤ 960 ⇒ 720 + 12*ℓ* ≤ 960 ⇒ *ℓ* ≤ 20.
So the greatest number of large trays is **20** (with 20 small trays, costing exactly $960).
*Concept:* with two constraints, the maximum sits where **both** are tight; optimising
against one alone overshoots.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — point membership with a strict boundary]

**Question Stem:**

> 3*x* − 2*y* > 6
> *y* ≥ −*x* + 1
>
> Which point (*x*, *y*) is a solution to the given system of inequalities in the
> *xy*-plane?

**Options:**
(A) (0, 4)
(B) (2, −2)
(C) (4, 3)
(D) (6, 2)

**Correct Answer:** (D)

**Distractor Rationale:**
- **(A) (0, 4)** — satisfies the second inequality but not the first: 3(0) − 2(4) = −8,
  which is not greater than 6.
- **(B) (2, −2)** — satisfies the first (10 > 6) but fails the second: −2 ≥ −1 is false.
  Catches a student who stops after one constraint.
- **(C) (4, 3)** — makes 3*x* − 2*y* equal **exactly** 6. It satisfies the second
  inequality and would satisfy the first if it were `≥` rather than `>`. This is the
  strictness trap, and the only option that fails by a boundary rather than by a margin.
- **(D) (6, 2)** — correct.

**Mathematical Solution & Underlying Concept:** Test each point in both inequalities. For
(6, 2): 3(6) − 2(2) = 14 > 6 ✓, and 2 ≥ −6 + 1 = −5 ✓. **(6, 2)** satisfies both.
*Concept:* a point on a strict boundary is not a solution — the line itself is excluded when
the symbol is `>` and included when it is `≥`, and one option is placed exactly there.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — derived bound on one variable (T5)]

**Question Stem:**

> *y* ≥ 4*x* + 3
> *x* > −2
>
> Which of the following consists of all possible values of *y* for the given system of
> inequalities?

**Options:**
(A) *y* > −8
(B) *y* > −5
(C) *y* ≥ −5
(D) *y* > 3

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) *y* > −8** — substitutes *x* = −2 into 4*x* alone, reaching −8 and forgetting the
  `+ 3`.
- **(B) *y* > −5** — correct.
- **(C) *y* ≥ −5** — the boundary-inclusion trap, placed adjacent to the key so the student
  must decide it. *y* = −5 would require 4*x* + 3 ≤ −5, i.e. *x* ≤ −2, which the second
  inequality forbids. The strictness of *x* > −2 propagates to *y*.
- **(D) *y* > 3** — substitutes *x* = 0 rather than using the bound on *x*.

**Mathematical Solution & Underlying Concept:** From *x* > −2, multiply by 4 (positive, so
the direction holds): 4*x* > −8, hence 4*x* + 3 > −5. Since *y* ≥ 4*x* + 3, every attainable
*y* exceeds −5, and every value above −5 is attainable by choosing *x* close enough to −2.
So the possible values are exactly **y > −5**. *Concept:* a bound on one variable propagates
through the other inequality, and a strict bound stays strict — the excluded endpoint on
*x* forces an excluded endpoint on *y*.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — region and quadrants (T6)]

**Question Stem:**

> *y* > −*x* + 4
> *y* < 2*x* − 1
>
> The solutions to the given system of inequalities lie in which quadrant or quadrants of
> the *xy*-plane?

**Options:**
(A) Quadrant I only
(B) Quadrants I and II only
(C) Quadrants I and IV only
(D) Quadrants I, II, and IV only

**Correct Answer:** (C)

**Distractor Rationale:**
- **(A) Quadrant I only** — locates the vertex where the boundaries cross, at (5/3, 7/3) in
  Quadrant I, and stops there, missing that the region is unbounded and drops below the
  *x*-axis further right.
- **(B) Quadrants I and II only** — takes the wrong side of *y* = 2*x* − 1, extending the
  region leftward instead of rightward.
- **(C) Quadrants I and IV only** — correct.
- **(D) Quadrants I, II, and IV only** — over-includes, testing the boundaries
  independently rather than requiring both at once.

**Mathematical Solution & Underlying Concept:** The region needs *y* above −*x* + 4 and
below 2*x* − 1, which is only possible where 2*x* − 1 > −*x* + 4, i.e. *x* > 5/3. So every
solution has *x* > 0, immediately ruling out Quadrants II and III. For *x* slightly above
5/3 the region sits above the *x*-axis (Quadrant I); for *x* > 4 the lower boundary
−*x* + 4 falls below zero, so points such as (5, −0.5) satisfy both and lie in Quadrant IV.
The solutions therefore occupy **Quadrants I and IV only**. *Concept:* the feasible region
of two half-planes is a wedge opening from their intersection; which quadrants it reaches
is decided by where that wedge crosses the axes, not by the boundaries taken separately.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — parameter constrained by a point (T11)]

**Question Stem:**

> *y* ≥ 2*x* + *k*
>
> In the given inequality, *k* is a constant. If the point (4, −5) is a solution to the
> inequality, what is the greatest possible value of *k*?

**Options:**
(A) −20
(B) −13
(C) 3
(D) 13

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) −20** — a value that genuinely satisfies the condition but is not the greatest such
  value. Catches the student who tests options until one works instead of solving for the
  bound.
- **(B) −13** — correct.
- **(C) 3** — computes −5 + 8 instead of −5 − 8, adding when isolating *k* requires
  subtracting.
- **(D) 13** — the sign of the correct magnitude reversed.

**Mathematical Solution & Underlying Concept:** A point is a solution when its coordinates
satisfy the inequality, so −5 ≥ 2(4) + *k*, i.e. −5 ≥ 8 + *k*, giving *k* ≤ −13. The
greatest permitted value is therefore **−13**, attained when the point lies exactly on the
boundary line — which the inclusive `≥` allows. *Concept:* substituting a point into an
inequality with an unknown constant yields an inequality in that constant, and "greatest
possible value" asks for its boundary, attainable precisely because the symbol is inclusive.

---

### [Difficulty Rating: Hard]
### [Algebra › Linear Inequalities in One or Two Variables — constant recovered from a solution set]

**Question Stem:**

> *cx* ≥ 24
>
> In the given inequality, *c* is a constant. The solution to the inequality is *x* ≤ −3.
> What is the value of *c*?

**Options:**
(A) −8
(B) −3
(C) 3
(D) 8

**Correct Answer:** (A)

**Distractor Rationale:**
- **(A) −8** — correct.
- **(B) −3** — echoes the boundary value from the stated solution set, mistaking the
  endpoint for the constant.
- **(C) 3** — divides 24 by 8 without reference to the sign or the direction.
- **(D) 8** — solves 24/*c* = 3, ignoring both the negative boundary and the direction
  reversal. A student who never asks why the solution set points left lands here.

**Mathematical Solution & Underlying Concept:** The solution is stated as *x* ≤ −3. Dividing
`cx ≥ 24` by *c* produces a `≤` only when *c* is **negative**, which fixes the sign before
any arithmetic. Then *x* ≤ 24/*c*, so 24/*c* = −3 and *c* = **−8**. Check: −8*x* ≥ 24 ⇒
*x* ≤ −3 ✓. *Concept:* the direction of the reported solution set encodes the sign of the
coefficient — reading it first turns a two-case problem into a one-case one.

---

## Verification

**Mathematics — 36 checks, all passing.** Every key derived independently; every distractor
confirmed to fail; the solution sets of items 1 and 4 enumerated exhaustively over the
integers; item 8's quadrant claim verified by scanning a lattice of 25,600 points; items 3,
6, 7 and 10 verified at their boundaries specifically, since boundary behaviour is what
those items test.

**Stem length against genre norms.** Hard-tier stems in this corpus split by genre:
symbolic-with-display-math run 16–25 words (median 23), symbolic-without run 23–53, and
contextual run 40–97. All ten items sit inside the range for their own genre; items 1 and 4
were lengthened after a first draft came in at 13 and 10 words, below the corpus floor of
16.

**Batch profile.** Key positions A 2 / B 3 / C 3 / D 2. Of 7 numeric keys: 2 negative (29%,
corpus 30%), 1 fractional (14%, corpus 10%), 7 within ±20. Every numeric option set
ascends; non-numeric option sets (points, inequalities, quadrants) are ordered structurally.

**Frame coverage.** Five items are built on the strict-vs-inclusive distinction that the
existing corpus tests with exactly one distractor in 132: items 1, 4, 6, 7 and 9 each turn
on whether a boundary value is attainable. Items 3, 4 and 8 use frames with no instance or
one instance in the bank.

**Not emitted.** No file under `portal/` has been touched.
