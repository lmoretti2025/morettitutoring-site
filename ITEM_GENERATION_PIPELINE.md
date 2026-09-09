# Item Generation Pipeline — Moretti Test Prep & Tutoring

How original hard SAT math items get built, checked, and cleared for the bank.
Nothing reaches `portal/question-bank-math.js` until an adversarial reviewer has
explicitly passed it.

---

## 1. The standard

An item is **hard** when:

> One structural insight unlocks the problem, after which the computation is routine —
> **and that insight genuinely beats the brute-force path.**

The second half is what nine review rounds kept catching. An insight that merely *ties*
the dumb path buys nothing, because the student who never sees it loses no time.

Calibration is against `challenge-questions.js` — Luca's own 82 hand-built math items —
**not** against the College Board bank, which is looser. The client's stated exemplar:

> A sphere of radius 5 is inscribed in a right circular cylinder, tangent to both bases
> and the lateral surface. What is the total surface area of the cylinder?

### The single most useful test

For any candidate, find its structurally nearest relatives in the bank and **read the
difficulty the bank itself assigns them**. If the bank calls that template *easy* or
*medium*, the item is not hard, whatever dressing was added. This one check accounts
for more blocks than every other axis combined.

Two corollaries, both learned the hard way:

- **More steps is not harder.** Repeating a medium step three times is still medium.
  The bank's genuinely hard versions of a template usually run it **backwards** — given
  the result, recover an input — or add a complement.
- **Do not take a bank-hard template and delete the step that made it hard.** This was
  the most common single defect: replacing an indirect ratio with a stated one,
  swapping a quadratic for a linear equation, giving a parameter as a number.

---

## 2. The gates

Every gate below **blocks**; none merely warn. That rule exists because round 4 found
three gates that were computed and printed but never enforced, and two duplicate items
shipped with their similarity scores visible on screen.

| Gate | What it catches | Origin |
|---|---|---|
| `mcv()` distractor verification | Every wrong option must declare the procedure that produces it; the emitter refuses to build the item unless that procedure yields the number shown | 6 asserted-but-false rationales, round 1 |
| Ascending options / no duplicate values | Option sets out of the bank's order | round 2 |
| `feasible_solid()` | Solids that cannot exist (isoperimetric bound `36πV² ≤ A³`) | a prism with surface area 45 and volume 54 |
| `feasible_triangle()` | Triangles that cannot exist (`A ≤ P²/(12√3)`) | area 45 at perimeter 30; the max is 43.30 |
| `exhaustive()` | Constraint-search keys must be **enumerated**, not argued | a "greatest possible value" keyed 27 when the true answer is 33 |
| Order-statistic leak | Extremum questions where the key is the largest/smallest option | "greatest value" with the key as the biggest number |
| Extremum attainability | On "greatest/least **possible** value", at least one option must lie outside the attainable range | an item where all four options were attainable |
| Sign-class leak | Options a student discards on sight (a negative "sum of positive solutions") | round 6 |
| Stem-guarantee bypass | A stem certifying "is equivalent to *ax + b*" lets the student substitute one value and read the answer off; the author must justify why the bypass is still real work | round 7 |
| Register (banned phrases) | Phrases with **zero** occurrences in the 2,624-item math corpus | see §3 |
| Bare `<` / `>` | The HTML parser silently deletes the rest of the sentence | half an explanation vanished |
| Grid-in length | 5 characters, 6 if negative | an answer of `420/29` |
| Mechanic registry | Duplication by **solution operation**, not by wording | text similarity missed 4 real reskins in one round |
| Table-cell fusion | `<td>12</td><td>24</td>` read as the number 1224 | false 4-digit-separator errors |
| Thousands separators, one question mark, no page deixis, no figure references, no second person | House grammar | bank-wide analysis |

### What the gates cannot catch

Three things are irreducibly the reviewer's job, and pretending otherwise would be worse
than admitting it:

1. **Difficulty.** No syntactic property separates a hard item from a medium one.
2. **Semantic duplication.** After improving the originality metric, a genuine
   near-verbatim duplicate scored **0.46** while two unrelated items sharing generic
   vocabulary scored **0.51**. No threshold separates them. A structural matcher does
   better but produced 90 flags across 182 items — too coarse to enforce, so it is
   advisory only.
3. **Cloning the client's own challenge set.** Five items in one round reproduced a
   challenge item with every noun changed. This happens *because* the challenge set is
   the calibration target: studying it makes its shapes reappear.

---

## 3. Register

The bank's own wording is the only authority. Phrases verified to appear **0 times** in
2,624 math items, all of which had crept into drafts:

`the greatest value of` (bank: *maximum value of*) · `the least value of` (bank:
*minimum value of*) · `is undefined at` · `is defined for all values of` ·
`strictly between` · `arbitrarily close` · `coordinate axes` · `joining fee` (bank:
*onetime fee*) · `average (arithmetic mean)` · `how many ordered pairs` ·
`pairs of integers` · `the opposite of the slope` · `consecutive even integers` ·
`equivalent to which expression` (bank: *equivalent to which of the following*)

Geometry nouns the bank never uses in a stem: `chord`, `sector`, `curved surface`,
`intercepted`, `tetrahedron`, `circumscribed`.

British spellings, which I default to and the bank never uses: `millilitres`,
`centimetres`, `factorisation`, `recognis-`, `minimis-`, `maximis-`, `parametrised`.

Claims worth *not* repeating: the reviewer asserted `what value of x satisfies`,
`represents a line in the xy-plane` and `at least one solution` were zero-occurrence.
They are not — they appear 2, 3 and 6 times. Every banned phrase above was counted
against the corpus before being banned.

---

## 4. Emission conventions

Match `question-bank-math.js` itself, not any handoff document:

- `<i>` for variables, `<sup>`/`<sub>` for exponents and indices
- the stacked inline-flex fraction span; `<table style="border-collapse:collapse; margin:0 auto;" border="1">`
- U+2212 minus in `text`, `choices` and `explanation`; **ASCII hyphen** in `answerValue`
- `&lt;` / `&gt;` for inequality symbols, always
- `qid` = first 8 hex of the md5 of the item text
- field order exactly `qid, domain, skill, difficulty, type, text, [choices+correct | answerValue], explanation, source`
- `source: "Moretti Test Prep & Tutoring"`
- All new items are **figure-free** by design, which sidesteps the rule that new items
  cannot crop figures from a source. Figure-free is not a licence to simplify: one
  reviewer's sharpest line was that a batch achieved it "by retreating to configurations
  so simple they need no figure and no thought."

---

## 5. Allocation

The original allocation was proportional to each skill's **total** size in the bank.
That was wrong. Review evidence showed the Algebra skills have very few genuinely hard
templates — the bank tags most of theirs easy or medium — so demanding 111 hard items
across Linear Equations, Systems and Inequalities asked for more than those skills
contain.

Allocation is now proportional to each skill's **hard-item count**, capped at 60% of it.
Biggest moves: Nonlinear Functions 55 → 83, Circles 18 → 33, Right Triangles 18 → 30;
Linear Functions 45 → 32, Linear Equations in One Variable 29 → 18, Inference 12 → 3.

---

## 6. Review record

Every batch has now been reviewed against the current standard. Earlier rounds used a
lower bar and were re-run.

| Round | Batches | Items | Passed |
|---|---|---:|---:|
| H | Linear Equations 1-var + 2-var | 24 | 3 |
| I | Systems + Linear Inequalities | 24 | 6 |
| J | Equivalent Expressions + Nonlinear Functions | 36 | 15 |
| K | Nonlinear Equations + Percentages | 25 | 7 |
| L | Ratios + One-Variable Data | 24 | 6 |
| M | Area and Volume + Circles *(re-review)* | 23 | 8 |
| N | Right Triangles + Lines and Angles *(re-review)* | 16 | 3 |
| O | Linear Functions | 12 | 2 |
| P | Probability + Two-Variable Data | 10 | 1 |
| Q | Nonlinear Functions batch 2 *(catalogue-driven)* | 11 | 1 |
| R | Equivalent Expressions batch 2 *(catalogue-driven)* | 8 | 1 |
| S | Nonlinear Equations batch 2 *(catalogue-driven)* | 8 | 0 |
| **Total** | | **221** | **53 (24%)** |

Plus a separate audit of the **20 items already live** in the bank: zero wrong keys, zero
ambiguity, zero rendering hazards; one wrong-answer explanation that misinforms (see §9).

Correctness is now clean: across the last five rounds every key recomputed correctly in
sympy, with three exceptions the reviewers caught and which are now gated —
the impossible solid, the impossible triangles, and the constraint-search key of 27
that enumeration puts at 33.

---

### A distribution problem to correct

The cleared set is **33% multiple choice / 67% free response**. The bank's own hard items run
**65% / 35%**. The cause is mechanical: an MC item has to clear the distractor gate (every
rationale must compute to its own option), the order-statistic gate, and the sign-class gate,
none of which apply to a grid-in — so MC items fail more often and free-response accumulates.

Correcting it means writing *more* MC than the target ratio, not the same, and budgeting the
extra failures. Nothing about the current set is wrong; it is just skewed, and a set that
stays skewed would be noticeably unlike the real test.


## 7. Economics

At the current standard the yield is **25%**. Producing 500 cleared items therefore means
generating roughly 1,900 candidates across something like 130 review rounds. That is not
a one-session job; it is many sessions.

The decision this forces is worth stating plainly rather than burying:

- **Hold the strict bar** (calibrated to `challenge-questions.js`) and accept that the
  set grows slowly — roughly 12 cleared items per two batches reviewed.
- **Relax to College Board "hard"** and the yield rises sharply, because roughly half the
  blocks are items the College Board itself would tag hard. The bank tags
  "arc RS is 100°, find ∠ROS" as hard.

Nothing has been written to the bank, so either choice is still open.

---

## 8. Resuming

Scratchpad: `gen/` in the session directory.

- `emit.py` — emitter and all gates
- `calibrate.py` — structural match against the bank, reporting the bank's own difficulty tags
- `packet.py` — renders a batch into a reviewer packet
- `verdicts.json` — per-item review outcome; **the source of truth**
- `mech_registry.json` — mechanics the bank already owns
- `banned_phrases.json` — register gate, every entry corpus-verified
- `status.py` — passed / blocked / unreviewed by skill
- `write_bank.py` — guarded final write; **writes only items marked `pass`**, dry-run by default

A companion file, `HARD_TEMPLATE_CATALOGUE.md`, lists the templates the bank actually rates
hard, skill by skill, together with the three moves that turn a medium template hard. It was
compiled from ten rounds of reviewer findings and is the thing most likely to raise the yield.

`python3 write_bank.py` to check, `--write` to append. It takes a backup first and
refuses on any pre-flight failure.

---

## 9. A strategy that was tried and measured, and did not work

Rounds Q and R tested a specific idea: since the most common block was *"a bank-hard template
with the step that made it hard deleted"*, generate deliberately the other way — take a
bank-hard template and **invert it** (run it backwards, or add a parameter that must reach
the answer). `HARD_TEMPLATE_CATALOGUE.md` was compiled for exactly this.

**It yielded 2 of 27 — about 7%, against a 24% baseline.** It made things worse, and a third
catalogue-driven batch scored 0 of 8.

The reviewers diagnosed why, consistently:

- **Inverting the *ask* is not inverting the *work*.** Swapping which end of "find the vertex,
  then apply the shift" is unknown leaves the step count identical.
- **Inversion preserves the surface of a hard stem while relocating the work to the easy end
  of the template's parameter space** — the lowest power, perfect roots, integer answers, a
  pre-supplied constant. The stem still *looks* hard.
- **The added parameter gets eaten by a shortcut.** One item added "recover *c*", but *c* was
  the constant term, so substituting x = 0 answered it in one line — faster than the intended
  route. When adding a parameter, check what the cheapest substitution reveals about it.
- Both batches' only survivors were the items that were **not** inversions at all: the ones
  whose mechanism has no precedent in the corpus.

The conclusion, in the reviewer's words: **novelty of mechanism, not reversal of direction, is
what produces a defensible hard item.** The catalogue is still worth keeping — it is an accurate
map of what the bank rates hard, and therefore of what to avoid re-deriving — but it should be
read as a list of occupied ground, not as a generator.

### Two corrections to this document's own claims

1. **The bypass gate is not a gate.** It asks the author to judge whether a substitution
   shortcut is cheap. Audited against a reviewer, **three of five of those judgements were
   wrong**, including one where the bypass was the printed solution. The note is now passed
   *into* the review packet, labelled "AUTHOR CLAIMS (audit this, do not accept it)", rather
   than clearing the item on its own.

2. **Cross-batch duplication was not being checked at all.** Seven of eleven items in one batch
   repeated mechanisms from their own sibling batch in the same skill — two of them mechanisms
   that had already passed review. Text similarity scored those collisions at 0.20, and
   matching the mechanic *labels* fails too, because the same operation gets described in
   different words. The fix is not another metric: the review packet now appends every
   previously staged item in the same skills, with its verdict, so the reviewer compares
   directly. **This fix has since been validated**: on the next batch the reviewer used that
   list to find 7 of 8 collisions, three against siblings that had already passed. The printed
   IDF similarity identified the true nearest relative in **zero** of those eight cases.

---

## 10. The live bank

An audit of the 20 items already published under `source: "Moretti Test Prep & Tutoring"`:

- **Zero wrong keys** — all 20 verified in sympy, premises included. Zero ambiguity, zero
  rendering hazards, every grid-in within the field, and 47 of 48 distractor rationales
  compute to the option they explain.
- **One defect worth fixing: qid `1eb097ba`.** Choice B is 18/(a − b); its rationale says that
  comes from "subtracting the equations, which gives x − y" — but subtracting gives
  −4/(a − b). A student who picks B is handed the derivation for a different quantity.
  A repair is staged at `gen/fix_live_1eb097ba.py`, dry-run by default, **not applied**.
- **5 of the 20 are re-skins of items already live in `challenge-questions.js`.** A student
  working both decks meets the same question twice.
- **8 of the 20 are not hard** by the current standard: one easy, seven medium.

---

## 11. Rounds AA–AE: five consecutive 0/8, and what they settled

Thirty-nine items across five batches, every one blocked. The batches were not worse than
earlier ones — the diagnosis in round AE was blunt and correct: **"It hit hard fine. It hit
novel badly."** Step counts were at or above the bank's own hard median. Novelty, not
difficulty, is the binding constraint.

### What the reviews established about figures

- **Figure necessity is real.** 14 of 43 hard geometry `<img>` items (33%) carry *no number
  in their prose at all*, against **2 of 227** geometry items that have no figure. A figure
  exists in this bank because it carries what the prose does not. I once measured the
  opposite and retired the necessity axis on that basis; the measurement was wrong.
- **Withholding makes a figure necessary but does not make an item hard.** Withholding is
  more common at easy (58%) than at hard (31%). Orthogonal axes; the bank satisfies both.
- **Grid-in does not rescue a to-scale figure — it makes it worse.** With options, a student
  must at least separate them; with a grid-in and an accurate drawing they read the answer
  straight off. Three of five figures in one batch were solvable with a ruler or protractor
  to within 0.3%.
- The "all hard angle-answer figure items are grid-in" rule I built two batches on had a
  true n of **2**. Zero-of-two happens 25% of the time under a coin flip. It was noise.

### Tooling added in response

| Tool | What it catches |
|---|---|
| `figure_fidelity()` in `emit.py` | Parses every emitted SVG, computes drawn angles and lengths, and refuses any item whose **answer** is measurable off the figure. Reproduces every measurability defect the reviewers had found by hand, including a ruler attack that read 39.01 against a stored answer of 39. Now runs inside `validate()`. |
| `register_report.py` | Flags every 2- and 3-gram in a stem with zero occurrences among the 1,937 real stems. Caught all seven off-register phrases a reviewer found by hand; measured at ~81% precision. Noisy by design — read the flags, do not gate on them. |
| Mechanic dedupe, cross-skill | The check used to skip comparisons when the prior item was filed under a different skill, so a mechanic could be laundered past it by refiling. Now compares across all skills. |
| 38 backfilled mech labels | All four early Geometry batches had null mechanics, making them invisible to the dedupe — the direct cause of three blocks in one round. On backfill the check immediately caught those same collisions. |
| Point-label markup | The bank writes `<i>AB</i>` (122 stems) and per-letter `<i>A</i><i>B</i>` (2). The emitter now joins runs of single-capital italics, which also fixes `<i>xy</i>-plane` (213 stems vs 0). |

### Measurement discipline

Three consecutive rounds found the *measurements* wrong, not just the items. The rules now:
count **items whose stem matches**, never raw occurrences (the latter inflates stem
frequency 5–8×); strip tags before matching but expect the strip to break the phrase
(`the x-axis` scores 0 because the bank writes `<i>x</i>-axis`); reconstruct stacked
fractions first (a reviewer reported a bank key as wrong because `199/2` tag-strips to
`1992`); and never calibrate against the 76 Moretti-sourced items.

**Absence is two-valued and the distinction is expensive.** Two good items were deleted
because `inside the circle` is 0/1,937 — but `in the interior of` is licensed by hard item
`acd30391`. The wording was dead; the concept was not.

### Where the seams actually are

Hard Circles is **43% arc / central angle / radian / tangent-segment** (18 of 42), not
coordinate algebra as I had assumed; only 5 of 42 carry a figure and 16 are grid-in.
Tangency *as a condition to solve for* is 0/1,937 — the bank's four tangent items all hand
you the point of contact.

---

## 12. Two live-product findings, neither caused by this project

1. **11 live items have set-valued answers the portal cannot grade.** `checkFrAnswer`
   (`portal/index.html:16619`, `:17306`, `:17701`) compares against a single stored
   `answerValue` and accepts only `|a − b| < 0.05`. Ten of the eleven are College Board's
   own — for example `7cb3a8ee`, `|x − 5| = 10`, "What is one possible solution?", stored
   answer 15: a student who answers −5 is marked wrong today. The fix is an accepted-set
   field; **not applied**, since it changes live grading behaviour.
2. **Seven blocked figure items are still live in the bank** (`3e5b345e`, `56ed15b5`,
   `d561c3e3`, `da42eda1`, `aebc543d`, `5d7be0eb`, `75928d05`). A removal script is staged
   at `gen/remove_blocked_fig1.py`, dry-run by default, **not run**. One of them,
   `56ed15b5`, now looks wrongly blocked: it is the altitude-to-the-hypotenuse mechanism,
   which the bank itself tags hard at `6a3fbec3`.
