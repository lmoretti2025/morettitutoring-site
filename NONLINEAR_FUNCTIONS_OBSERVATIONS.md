# Nonlinear Functions — Corpus Observations

**Analysis only. No items generated yet, nothing written to `portal/`.**
Third section analysed, after Systems of Two Linear Equations and Linear Inequalities.

**Corpus.** 344 unique items after dedupe — **146 hard** / 124 medium / 74 easy;
266 MC / 78 FR; 44 carry a figure, 18 a table, 269 a worked solution. This is by a wide
margin the largest skill in the bank (Systems 156, Inequalities 94).

---

## 1. The one-line summary

Difficulty in this section is created by **making the student manipulate a function they
cannot simply evaluate** — an undetermined constant, a composition, a demand for an
equivalent form. It is *not* created by context or by pictures, both of which run strongly
in the opposite direction.

## 2. Difficulty predictors, measured

Base rate: 42% of all items are hard. Lift is the ratio to that base.

| Feature | n | % hard | lift |
|---|---:|---:|---:|
| composition / transformation `g(x) = f(x ± k)` | 10 | **100%** | 2.36× |
| equivalent form — "displays, as a constant or coefficient…" | 11 | **100%** | 2.36× |
| Roman-numeral option list (I / II / III) | 11 | 91% | 2.14× |
| a literal constant is declared | 58 | 83% | 1.95× |
| two functions defined in terms of each other | 23 | 83% | 1.95× |
| asks for a vertex / maximum / minimum | 47 | 77% | 1.80× |
| free-response | 78 | 56% | 1.33× |
| a percent appears | 30 | 53% | 1.26× |
| a table is present | 18 | 33% | 0.79× |
| real-world context | 92 | 33% | 0.77× |
| asks to interpret in context | 38 | 21% | **0.50×** |
| **a figure is present** | 44 | 18% | **0.43×** |

**Two inverse predictors are the interesting result.** A figure more than halves the odds
that an item is hard: figures are 34% of easy items and 5% of hard ones. Same for
interpretation questions. In this section a picture is a *scaffold* — it hands the student
the shape, the intercepts and the vertex, which is precisely the information a hard item
withholds.

This is the reverse of Systems, where figures were twice as common at hard. The rule does
not transfer between skills; it has to be re-measured each time.

Context is mildly inverse here (0.77×), consistent with Systems (flat) and Inequalities
(flat). Across three sections now, **real-world framing has never once been a difficulty
lever.**

## 3. Sub-topic composition

| Sub-topic | easy | med | hard | % of the sub-topic that is hard |
|---|---:|---:|---:|---:|
| function evaluation / notation | 32 | 40 | 58 | 45% |
| exponential growth / decay model | 10 | 42 | 25 | 32% |
| quadratic — vertex / max / min | 5 | 14 | **44** | **70%** |
| parameter/constant in the function | 0 | 10 | **48** | **83%** |
| graph reading / transformation | 28 | 12 | 12 | 23% |
| quadratic — zeros / intercepts / factored | 3 | 9 | 14 | 54% |
| table of values | 2 | 10 | 6 | 33% |

By function form, as a share of each tier:

| Form | easy | medium | hard |
|---|---:|---:|---:|
| exponential | 18% | 36% | 34% |
| quadratic | 15% | 19% | 23% |
| polynomial, degree ≥ 3 | 7% | 3% | 3% |
| absolute value / radical / rational | 11% | 2% | 8% |

The hard tier is **quadratics and exponentials, roughly 60/40**, with everything else a
rounding error. Cubics are essentially an easy-tier curiosity.

## 4. House grammar

### 4.1 Dispersion

**113 distinct interrogative forms across 141 hard items.** The five commonest cover 14% of
the tier. Compare Systems, where a single form covered 20% of the whole corpus. This
section behaves like Inequalities: near-total dispersion, no closed inventory to draw on.

There is exactly one recurring frame sentence:

> **The function f is defined by the given equation.** — 11 occurrences

That is this section's analogue of "The solution to the given system of equations is
(x, y)", and it is the sentence to reach for when a stem needs a frame.

### 4.2 Rules that hold across all three sections analysed

| | Systems | Inequalities | Nonlinear Functions |
|---|---|---|---|
| interrogative is the final sentence | 154/156 (99%) | 93/94 (99%) | 333/339 (98%) |
| items with more than one interrogative | 0 | 0 | **0** |
| second person ("you") | 0 | 0 | **0** |
| old paper-SAT deixis ("above"/"below") | 19 | 6 | **47 (14%)** |

The first three are now confirmed as bank-wide invariants across 594 items. The six
apparent exceptions to interrogative-final here are all Roman-numeral option lists, where
statements I / II / III legitimately follow the question — a house format, not a defect.

### 4.3 Answer form by tier

| Tier | numeric keys | integer | \|v\| ≤ 20 | negative | non-integer | non-numeric keys |
|---|---:|---:|---:|---:|---:|---:|
| easy | 38 | **100%** | 58% | 8% | 0% | 36 |
| medium | 50 | 90% | 54% | 6% | 10% | 74 |
| hard | 75 | 88% | 61% | **24%** | **12%** | 71 |

Same shape as the other two sections: easy answers are always integers; hard answers go
negative a quarter of the time and fractional an eighth. Note that **half the hard items
have a non-numeric key** — an equation or expression — far more than in Systems.

### 4.4 Key positions — clean

**A 63 / B 69 / C 66 / D 68** over 266 MC items. χ² = 0.32, df = 3, **p ≈ 0.96**. As close
to uniform as a real corpus gets, and a better result than Inequalities (p ≈ 0.09, 64% at
A or D). No position leak here.

## 5. Distractor structure

### 5.1 Exponential models — the dominant trap is percent-to-base

Of 15 percent-context items with parseable bases, **11 (73%) offer the raw percent as a
base** — a `5%` growth rate appearing as `(5)^t` or `(0.05)^t` where `(1.05)^t` is meant.
This is the single most reliable distractor in the section.

Across the 18 items whose four options are all of the form `a(b)^exp`:

| n | Family |
|---:|---|
| 13 | rate substituted for the base |
| 12 | both the initial value and the base altered |
| 11 | initial value altered, base held |
| 6 | base altered (other) |
| 5 | growth/decay direction flipped — `1 + r` vs `1 − r` |
| 5 | initial value and base swapped with each other |
| 2 | exponent altered |

**3 of the 18 (17%) are a full 2×2 factorial** — two candidate initial values crossed with
two candidate bases, all four combinations present, e.g.
`72(1.5)^t / 72(2.5)^t / 180(1.5)^t / 180(2.5)^t`. Fewer than eyeballing suggested, but it
is the cleanest design in the set and worth using deliberately.

### 5.2 What I could not yet mechanise

The Systems engine reached 90% distractor coverage because those items reduce to a 2×2
linear solve. Here the item space is far more heterogeneous — 113 interrogative forms — and
only two narrow engines ran cleanly:

- "value of `f(N)`" with a parseable definition: **3 items reached, 3/3 keys correct**
- vertex / minimum with a parseable definition: **8 reached, 7 matched, 1 apparent mismatch**

The apparent mismatch is **my** bug, not the bank's: item `841ef26c` defines
`f(x) = 4x² + 64x + 262` and then `g(x) = f(x + 5)`, asking for g's minimum. My engine
found f's vertex at −8 and ignored the composition; the true answer is −13, which is
exactly what the bank stores. Any future engine for this section must handle composition
before it handles anything else — composition is also the single strongest difficulty
predictor (§2), so this is where the hard items live.

## 6. Frame ledger

★ = thin, ★★ = absent from the hard tier.

| | hard / total | Frame |
|---|---:|---|
| | 10 / 10 | composition `g(x) = f(x ± k)` |
| | 10 / 10 | two constants, asks for `ab` or `a + b` |
| | 10 / 11 | Roman-numeral multi-statement |
| | 7 / 8 | vertex form / completing the square |
| | 6 / 6 | "displays, as a constant or coefficient" |
| | 6 / 17 | exponential model built from a percent |
| | 6 / 36 | interpretation of a vertex or intercept in context |
| ★ | 2 / 2 | number of x-axis crossings / real solutions |
| ★★ | 0 / 0 | domain and range reasoning |
| ★★ | 0 / 0 | end behavior |
| ★★ | 0 / 0 | average rate of change over an interval |

## 7. QA findings

### 7.1 Possible content gaps — worth checking against the spec

I scanned **all 4,944 unique items across every skill in the bank**, not just this section:

| Probe | Hits anywhere in the bank |
|---|---|
| "end behavior" | **0** |
| "asymptote" | **0** |
| "domain" | 2 — both in *Reading & Writing* skills, neither mathematical |
| function "range" | 0 — the 11 hits for "range" are statistical range in One-Variable Data |
| "average rate of change" | 4 — all in Two-Variable Data, none in a nonlinear context |

These are absences from your bank, and I am flagging them as *questions*, not verdicts: I
have not verified against the current College Board specification which of these the
digital SAT actually assesses, and the SAT de-emphasises some of them relative to a
precalculus course. Worth a check before treating any of it as a hole to fill.

### 7.2 Old paper-SAT phrasing — 47 items (14%)

Twenty hard, 19 medium, 8 easy; 31 in `question-bank-math.js`, 15 in `practice-tests.js`,
1 in `challenge-questions.js`. Same mechanical rewrite already flagged for the other two
sections. Running total across the three analysed: **72 items**.

### 7.3 Clean results

- **Keys are sound.** 107 of 107 MC items whose explanation names a letter agree with the
  stored key. 73 of 73 free-response answers appear in their own explanations — the one
  initial flag (`-13/2`) was a formatting difference, the explanation writing `−(13/2)`.
- **No items lack a question.** An early count of 30 was my own line-classifier splitting a
  question onto a line it had bucketed as math; every item contains exactly one
  interrogative.
- **No duplicate items with conflicting difficulty tags.**

## 8. What carries forward to generation

When we convene, the hard-item levers for this section, in measured order of strength:

1. **Composition** — `g(x) = f(x ± k)`, and ask about g. 100% hard, and the thing my own
   engine got wrong, which is a good sign it is genuinely load-bearing.
2. **An undeclared constant** to solve for — 83% hard, the same lever that dominates
   Systems.
3. **Demand an equivalent form** that "displays" a feature (vertex, zero, y-intercept) —
   100% hard, only 6 items exist.
4. **Vertex/extremum of a quadratic given in an unhelpful form** — 70% hard.
5. **Percent → base conversion** in an exponential, with the raw percent offered as a
   distractor — the section's most reliable trap at 73%.

And two things **not** to do, both measured: do not add a figure, and do not reach for a
real-world wrapper. Both are markers of easy items here.

Open question for you: the three ★★ frames in §6 — worth building, or deliberately out of
scope for the digital SAT?
