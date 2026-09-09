# Four Skills — Round Two: the authors' own reasoning

**Linear Functions · Systems of Two Linear Equations · Linear Inequalities · Nonlinear
Functions.** 842 items. Analysis only; nothing written to `portal/`.

Rounds one to three measured these items from the outside — templates, grammar, difficulty
signatures, per-item classification. This round uses a source I had only ever used for
key-checking: **the 665 worked explanations, and specifically the per-distractor
commentary the item authors wrote.** That turns the distractor taxonomy from something I
inferred into something documented — and it exposes an error in how I inferred it.

---

# 1. The authors' distractor taxonomy

438 of the 665 explanations carry per-choice commentary. Extracting every reason gives
**621 author-written distractor rationales**, 83% of which classify cleanly:

| n | % | Mechanism |
|---:|---:|---|
| 122 | 20% | **wrong model / wrong situation encoded** |
| 118 | 19% | **computed a different expression** |
| 100 | 16% | *generic — "conceptual or calculation errors", no reason given* |
| 98 | 16% | **reported the other variable or quantity** |
| 14 | 2% | slope / rate misread |
| 10 | 2% | percent / decimal conversion |
| 9 | 1% | X-instead-of-Y operation swap |
| 9 | 1% | coordinates or roles switched |
| 7 | 1% | explicit miscalculation of a step |
| 7 | 1% | sign handling |
| 6 | 1% | intercept / initial value misread |
| 4 | 1% | inequality direction / strictness |
| 107 | 17% | unclassified |

**Three mechanisms account for 54% of every documented distractor in these four skills.**
Everything else is a long tail of ones and twos.

## 1.1 The mechanisms are skill-specific — again

Share within each skill:

| Skill | dominant mechanism | share |
|---|---|---:|
| **Linear Inequalities** | wrong model / wrong situation encoded | **41%** |
| **Systems** | computed a different expression | **31%** |
| **Linear Functions** | computed a different expression | 23% |
| **Nonlinear Functions** | *generic (no reason given)* | 19% |

Linear Inequalities is the outlier and it makes sense: 41% of its distractors are wrong
*models* — an inequality pointing the wrong way, a bound attached to the wrong quantity,
"at most" where "at least" was meant. Systems and Linear Functions instead punish
computing the wrong thing correctly. Nonlinear Functions' most common category is that no
reason was given at all.

Notable absences: Linear Inequalities has **zero** "computed a different expression"
rationales, and Systems has zero "slope / rate misread". These are not small differences in
emphasis; they are categories that simply do not occur in that skill.

---

# 2. The correction: my distractor engine over-fits

In round one I built a mutation engine for Systems and reported **90% distractor coverage
against a 21% null baseline.** Running it head-to-head against the authors' own labels, on
the 23 Systems items where both exist (64 distractors), changes that story.

| | my engine | the authors |
|---|---:|---:|
| reported the other variable | 12 | 4 |
| computed a different expression | 13 | 19 |
| sign/placement slip in the system | 11 | **0** |
| numerals combined | 12 | **0** |
| numeral copied from the page | 9 | **0** |
| sign handling | 7 | **0** |
| *generic — no reason given* | 0 | **31** |
| unexplained | 5 | 0 |

**31 of 64 distractors (48%) are ones the authors decline to explain at all.** My engine
assigns a specific named mechanism to **28 of those 31 — 90%**.

That is the definition of over-fitting. The engine's candidate set contains every pairwise
sum, difference, product and quotient of the numerals on the page, plus nine single-token
mutations of the system. With that many candidates, a match is often arithmetic
coincidence rather than a reconstructed student error. The null baseline I reported (11–21%)
measured how often a *random integer* lands in the candidate set — it did not measure how
often a *plausible-looking wrong answer* does, which is much higher.

**Where the authors do give a reason, agreement is reasonable** — but only after fixing a
flaw in my own scoring. Raw exact-label agreement looked like 12%, which is misleading: the
author phrase *"This is the value of y, not x + y"* is simultaneously "computed a different
expression" and "reported the other variable", and my two labels were not disjoint. Of the
21 "this is the value of…" rationales in Systems, **12 name a bare variable** and 9 name a
genuine compound. Collapsing that overlap:

| | authors | my engine |
|---|---:|---:|
| reported the other variable | 16 | 12 |
| computed a different expression | 7 | 13 |

Close on the dominant mechanism, with my engine over-attributing to the compound category.

**What this means for generation.** The distractor recipe I published in
`QUESTION_GENERATION_SYSTEM.md` — sample ~18% sign-flips, ~24% report-the-wrong-thing, ~28%
page-numeral arithmetic — is wrong in its first and third terms. The authors almost never
describe a distractor as a sign flip or as arithmetic on page numerals. The recipe that
matches documented practice is:

```
distractor_1 : compute a DIFFERENT but defensible expression   (~19% of real distractors)
distractor_2 : report the other variable or quantity           (~16%)
distractor_3 : encode a WRONG MODEL of the situation           (~20%, and 41% in Inequalities)
```
and, for honesty about the corpus: roughly one distractor in six in the real bank has no
articulable mechanism behind it at all.

---

# 3. What numbers these items actually use

Never measured before, and directly constraining for generation.

| Skill | numerals | integer | ≤20 (of integers) | most common values |
|---|---:|---:|---:|---|
| Systems | 731 | **98%** | **80%** | 2 (91), 3 (76), 4 (72), 5 (52), 7 (43) |
| Nonlinear Functions | 1,079 | 91% | 72% | 2 (147), 0 (98), 4 (76), 3 (62) |
| Linear Functions | 611 | 93% | 68% | 3 (43), 2 (42), 4 (36), 5 (35) |
| Linear Inequalities | 261 | 91% | **55%** | 3 (18), 2 (18), 4 (17), 5 (10) |

For Systems display-math items specifically, the coefficients attached to a variable:

- most common: **3, 2, 4, 5, 7** — in that order
- **53% are prime**
- only **9% exceed 20**

Nonlinear Functions is the exception in shape: 2 appears 147 times, far ahead of everything,
because of squaring. Linear Inequalities has the largest numbers, because its contexts are
budgets and totals.

The practical constraint: **generated items should use small integers, predominantly 2–9,
with prime-leaning coefficients, and almost never above 20.** My generated batches used
values like 216, 567 and 1,008 in contextual items — defensible for a budget scenario, but
the symbolic items should stay in the 2–9 band, and mine mostly did.

---

# 4. The bank is not built from numeric variants

I expected to find that items are mass-produced by re-numbering templates. Reducing every
item to a skeleton (all numerals replaced by `N`) and clustering:

| Skill | items | distinct skeletons | items sharing a skeleton |
|---|---:|---:|---:|
| Systems | 158 | 144 | 27 (**17%**) |
| Linear Functions | 236 | 224 | 24 (10%) |
| Nonlinear Functions | 353 | 340 | 23 (7%) |
| Linear Inequalities | 95 | 92 | 6 (**6%**) |

**Only 6–17% of items share a structural skeleton with any other item.** The largest cluster
in the entire set is four items ("What is the y-intercept of the graph shown?"). The bank is
structurally diverse, not a template farm.

This matters for the generation protocol: a generator that produces ten numeric variants of
one frame would be immediately out of register. The novelty constraint I wrote in round one
was right, and this quantifies how right — real items repeat a structure at most twice or
three times across a whole skill.

---

# 5. Explanation coverage is entirely a property of the source file

I previously reported "177 of 842 items (21%) have no worked explanation" as if it were
scattered. It is not.

| Source file | items | with explanation |
|---|---:|---:|
| `question-bank-math.js` | 628 | **628 (100%)** |
| `practice-tests.js` | 177 | 37 (21%) |
| `challenge-questions.js` | 21 | **0** |
| `banks.js` | 16 | **0** |

Every single item in `question-bank-math.js` across all four skills carries a worked
solution. Essentially nothing else does. Difficulty is not the driver — coverage by tier
runs 65–91% with no pattern.

Two consequences. First, the fix is targeted rather than diffuse: 140 practice-test items
and 37 in the two hand-built sets. Second, **anything I can verify about the bank, I can
only verify where explanations exist** — the independent key audit that came back
1,138/1,138 clean was, necessarily, an audit of the explained subset.

---

# 6. A new source defect

Two explanations contain **"This the value of…"** — a missing verb:

- `qid 570b5a5d` (Systems, medium): *"Choice C is incorrect. This the value of ((7/2)x + 6y) + ((5/2)x + 6y)…"*
- `qid a94ed4e0` (Systems, medium): *"Choice C is incorrect. This the value of 13x, not 39x."*

Both are in `question-bank-math.js`. Bank-wide across all 5,140 items, these are the only
two instances.

Still outstanding from earlier rounds: `qid 187f74bc`, whose figure alt text says the shaded
region is *below* y = −4 when the image, explanation and key all require *above*.

---

# 7. What changed in my understanding

| Round-one claim | Round-two status |
|---|---|
| Distractor engine reaches 90% coverage | **Over-fitted.** 48% of Systems distractors have no author-stated mechanism; the engine labels 90% of those anyway. |
| Distractor recipe: sign-flips + page-numeral arithmetic + report-wrong-thing | **Two of three terms wrong.** Authors document wrong-model, different-expression, and wrong-quantity. |
| 21% of items lack explanations | **True but misleading** — it is 0% in the main bank and ~100% in the other three files. |
| Novelty constraint: don't just re-number templates | **Confirmed and quantified** — real items share a skeleton only 6–17% of the time. |
| Levers must be re-measured per skill | **Confirmed again** — Inequalities' distractors are 41% wrong-model; Systems has zero of one whole category. |

The methodological lesson is the one that keeps recurring: **a mechanism I can compute is
not the same as a mechanism a student runs.** The mutation engine finds arithmetic paths to
a wrong answer; the authors describe intentions. Where a documented source of intent exists
— and here 665 items carry one — it outranks anything inferred.

Open question for you: the "wrong model" category is 20% of all distractors and 41% in
Inequalities, and it is the one category my tooling cannot generate or verify, because it
requires understanding what the scenario means. That is the part of item-writing that
stays manual for now.
