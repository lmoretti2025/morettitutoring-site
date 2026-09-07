# Question Generation System — Systems of Two Linear Equations in Two Variables

**Pilot domain.** Algebra › *Systems of Two Linear Equations in Two Variables*, chosen as
the process prototype because it is the most template-dense skill in the bank: small
enough to enumerate exhaustively, which makes the generation rules falsifiable before
they are extended to messier skills.

**Corpus.** Every matching item across all five banks — `question-bank-math.js`,
`question-bank.js`, `practice-tests.js`, `banks.js`, `challenge-questions.js` —
**178 items, 168 unique after dedupe**: 48 easy / 58 medium / 62 hard; 125 MC / 43 FR.

**Method note.** Items were normalised with a parser that reconstructs the bank's stacked
inline-flex fraction markup back into `(a/b)` before analysis. This matters: a naive tag
strip silently reads `(1/2)y = 4` as `12y = 4` and `−(4/11)x` as `−411x`. Every figure in
this document is computed over the reconstructed text.

Three kinds of claim appear below, and they are not equally strong. **Counted** claims
(sentence frequencies, deixis, option order) are exhaustive over the 168 items.
**Measured** claims (the distractor model in §3.0) are computed over the machine-readable
subset and reported with a null baseline. **Read** claims (the hand catalogue in §3.1) are
my judgement over option sets and are labelled as such.

---

# PART 1 — THE HOUSE GRAMMAR

The structural taxonomy in Part 2 describes *what* the items ask. This part describes
*how they speak* — and the house dialect turns out to be far more rule-governed than the
mathematics is. Most of these rules are exceptionless or near-exceptionless.

## 1.1 Macro-syntax: the shape of a stem

Every item is built from at most four slots, in fixed order:

```
[DISPLAY MATH / FIGURE]  →  [FRAME declarative]  →  [CONDITION]  →  [INTERROGATIVE]
```

- **The interrogative is final in 166 of 168 items** (98.8%), and **no item contains two
  interrogatives.** One question mark per item, at the very end. This is the single most
  rigid rule in the corpus.
- **The condition never follows the question.** In all 101 items carrying an explicit
  condition, it is either fronted inside the interrogative (46) or stated as its own
  preceding declarative (55). Zero postposed conditions.
- Prose is **never mixed into the display math**. Equations sit in a centred block; the
  prose block begins afterward and re-references it deictically.

The consequence for generation: an item is assembled slot-by-slot, and *the mathematics
is fully specified before the first word of prose is written.*

## 1.2 The sentence inventory

Symbolic (non-contextual) items are built almost entirely from a closed set of
memorised sentences. Counts are occurrences across the corpus:

| n | (e/m/h) | Sentence |
|---:|---|---|
| **40** | 13/21/6 | `The solution to the given system of equations is (x, y).` |
| **11** | 1/1/9 | `In the given system of equations, k is a constant.` |
| **8** | 0/0/8 | `The system has no solution.` |
| 6 | 6/0/0 | `The graph of a system of linear equations is shown.` |
| 5 | 1/2/2 | `One of the two equations in a system of linear equations is given.` |
| 5 | 1/3/1 | `The system has infinitely many solutions.` |
| 2 | 0/0/2 | `The graph of line h is shown in the xy-plane.` |
| 2 | 0/0/2 | `In the given system of equations, a and b are constants.` |

Read the tier columns: **the frame sentence itself is a difficulty marker.** *"The
solution to the given system of equations is (x, y)"* is an easy/medium sentence (34 of
40 uses). *"In the given system of equations, k is a constant"* is a hard sentence (9 of
11). *"The system has no solution"* is hard-**only** — 8 of 8. A student who has done
volume work can predict the difficulty of an item from its second sentence, before
reading any mathematics.

**The interrogative inventory** is a long tail over a very concentrated head — 85 distinct
templates across 168 items, but:

| n | Interrogative |
|---:|---|
| 34 | `What is the value of ⟨V⟩?` |
| 10 | `What is the solution (x, y) to the given system of equations?` |
| 9 | `If the system has no solution, what is the value of ⟨V⟩?` |
| 6 | `What is the value of ⟨V⟩ + ⟨V⟩?` |
| 6 | `What is the solution (x, y) to the system?` |
| 5 | `Which equation could be the second equation in the system?` |
| 4 | `What is the value of ⟨V⟩ − ⟨V⟩?` |
| 3 | `For each real number r, which of the following points lies on the graph of each equation…?` |

`What is the value of ___?` alone covers 20% of the corpus, and the *target expression*
inside it is where difficulty is quietly loaded:

| n | Target grammar | Attested |
|---:|---|---|
| 56 | bare variable | `y`, `x`, `t`, `p` |
| 12 | `V ± V` | `x + y`, `a + b`, `x − y`, `p + w` |
| 5 | coefficient × variable | `5x`, `2x`, `39x`, `30x` |
| 3 | linear combination | `8x + 7y`, `3x + 3y` |
| 1 each | ratio · product · scaled parenthetical | `g/k` · `xy` · `6(x − 2)` |

The interrogative is syntactically identical across all of these. The difficulty is
carried entirely by the noun phrase in the object slot — which is exactly why students
who "solved it right and got it wrong" fail here.

## 1.3 Two phrasings for "look at the equations" — and they never mix

How does a stem tell the student *which* equations it is talking about? Your bank does it
two different ways:

| Form | n |
|---|---:|
| `the given system` / `the given equations` | 74 |
| `the system above`, `the equations above`, `graphed below` (old paper-SAT style) | 19 |

**These two never co-occur. The overlap is exactly zero.**

**What this means in plain terms.** These 19 items are written in the *old paper-SAT*
style. On a printed page the equations physically sat above the question, so "the system of
equations above" made sense. The digital SAT dropped that wording — on a screen the layout
shifts, and there may be nothing above the sentence at all — and replaced it everywhere
with "the given system of equations." Your bank contains both, because it was assembled
from sources of both eras: 13 of the old-style items sit in `question-bank-math.js` and 6
in `practice-tests.js`, while the newer diagnostic bank `banks.js` uses the modern wording
exclusively.

The zero overlap is what makes this actionable. Because no item mixes the two, the old
ones can be identified and rewritten mechanically — it is a find-and-replace, not a
judgement call.

These 19 also carry other old-style markers: `has solution (x, y)` instead of `The
solution … is (x, y)`, `In the system of equations above, c is a constant`, and the corpus's
only two instances of indefinite *"is **a** solution"*. They are listed individually in
Part 7.

## 1.4 Definiteness and the uniqueness presupposition

The canonical frame is a **definite description**:

> **The** solution to the given system of equations is (x, y).

The definite article presupposes both existence and uniqueness. The sentence tells the
student, before they compute anything, that this system has exactly one solution — which
silently eliminates "no solution" and "infinitely many" from consideration. It is a
genuine, if small, scaffold.

Distribution: 69 items use a definite description (`the solution`), against **2** using the
indefinite `is a solution`. Both exceptions are old-style items in `practice-tests.js`
— including `Given that (x, y) is a solution to the above system of equations, what is the
value of x ?`, which also carries the corpus's only space-before-question-mark.

The rule for generation is therefore sharper than "be consistent": **use the indefinite
only when the system genuinely has more than one solution**, and otherwise never. In a
hard item that turns on distinguishing one solution from infinitely many, the definite
article would give the answer away.

## 1.5 Modality: `could` vs `is`

Construction items — "supply the missing equation" — are **uniformly modalised**:

| n | Form | (e/m/h) |
|---:|---|---|
| 14 | `Which equation **could be** the second equation…` | 1/3/10 |
| 3 | `Which system **can be used to** find…` | 3/0/0 |
| 10 | `Which system **represents** this situation` (indicative) | 5/4/1 |
| 32 | `The system **has** no solution / infinitely many` (indicative) | 2/4/26 |

The alternation is not decorative and it is not free. **`could be` is used exactly when
infinitely many equations satisfy the condition and the options happen to contain one**;
`represents` / `can be used to` is used when the modelling is unique. Getting this
backwards makes an item either falsely deterministic or falsely open. Note the tier
skew: `could be` is 10/14 hard, `represents` is 9/10 easy-to-medium — modality tracks
difficulty because open-ended construction is the harder task.

## 1.6 Subordination is the linguistic difficulty signal

This is the finding that most changed how I would write these items. Measured per item:

| Metric | Easy | Medium | Hard |
|---|---:|---:|---:|
| sentences | 2.38 | 2.19 | 2.35 |
| display equation lines | 1.06 | 1.24 | 1.06 |
| **subordinate clauses** | **0.56** | **0.55** | **0.92** |
| `if` per item | 0.19 | 0.17 | **0.39** |
| `where` per item | 0.02 | 0.00 | **0.13** |

**Subordination rises 65% while sentence and equation counts stay flat.** `if` doubles;
`where` — the constant-declaring relative — appears essentially only at the hard tier.

**Length must be measured within genre, not pooled.** Pooled across the corpus, prose
length looks flat (29.4 / 28.6 / 32.5 words), but that figure is a mixture artefact: the
two genres have completely different length norms and are unevenly distributed across
tiers.

| Genre | n | p25 | median | p75 | max |
|---|---:|---:|---:|---:|---:|
| Symbolic, equations in a display block | 98 | 17 | 18 | 22 | 44 |
| Symbolic, geometry stated in prose (points, slopes, transformations) | 24 | 23 | 33 | 42 | 82 |
| Contextual (real-world scenario) | 32 | 46 | 58 | 76 | 87 |

Three genres, three registers. A stem that states its lines in prose — *"one line … passes
through the points (0, 1) and (3, 4)"* — is legitimately twice the length of one that
shows a display block, because the prose is carrying the mathematics rather than
describing it. Mean word counts by tier are 21 / 20 / **28** for symbolic items overall
and 58 / 61 / 61 for contextual ones.

Split properly: **contextual length is genuinely flat** (58 / 61 / 61) — wrapping a
problem in a story does not make it harder. **Symbolic items do grow at the hard tier**,
by about a third. But that growth is not padding; it is scaffolding, and it decomposes
cleanly:

| Symbolic group | n | mean words |
|---|---:|---:|
| easy + medium, no declared constant | 80 | 20.1 |
| hard, no declared constant | 34 | 25.6 |
| hard, **with** declared constant | 19 | **31.6** |

The ~11-word gap between an easy symbolic stem and a hard parametric one is almost exactly
the two sentences the hard frame requires — `In the given system of equations, k is a
constant.` (9 words) and `The system has no solution.` (5 words). Hard items are longer
only because they must *declare more*, never because they narrate more.

Both halves say the same thing: **in this corpus you make an item harder by adding a
condition the reader must hold in working memory, not by adding words.** A generator that
lengthens stems to make them hard is producing slow items, not hard ones.

## 1.7 The grammar of contextual items (32 of 168)

- **Tense is split by design.** Standing facts take the present (`A petting zoo **sells**
  two types of tickets`, `Each small tray **holds** 24 seedlings`); the specific event
  takes the past (`One Saturday, the zoo **sold** 250 tickets`). 16 items use past-tense
  event verbs, 11 use present-tense standing verbs, and the mixed items use both in that
  order. Never the reverse.
- **Variables are glossed by appositive**, not by definition sentence:
  `…, where x represents the price, **in dollars,** of each shirt`. The `, in ⟨unit⟩,`
  appositive appears 8 times and is the house way of attaching units.
- **Currency uses `$` in the scenario and the spelled unit in the gloss** — `$5.50 per
  pint` in the setup, `in dollars` when naming a variable's unit or the gridded answer's
  unit. The two co-occur in 5 items and that is correct, not a defect.
- **Thousands separators are always present** — `2,300`, `27,600`, `1,008`. Zero
  four-digit numbers appear unseparated.
- **`a total of` is the standard summation phrase** — 14 items.
- **No second person anywhere.** Zero instances of *you*. One imperative aside in the
  whole corpus (`Disregard the $ sign when gridding your answer.`), attached to a
  free-response money item.
- **Named agents are plain, short, and demographically varied** — Hiro, Sofia, Connor,
  Maria, Angela, Ellen, Sadie, Morgan, Shantiel. All are given a single first name, no
  surname, and no characterising detail. Institutions are generic and unbranded (a petting
  zoo, a movie theater, an online bookstore, Store A / Store B).

## 1.8 Option-set syntax

| Rule | Evidence |
|---|---|
| Numeric options are ordered **ascending** | 52 of 57 purely-numeric sets; 5 descending; **0 unordered** |
| Options are grammatically parallel | 102 of 125 sets share an identical first token |
| Non-numeric options (`Zero`, `Infinitely many`, `Cannot be determined`) go **last** | exceptionless in the corpus |
| Key position is balanced | A 29 / B 37 / C 30 / D 29 (n = 125) |

And one worth stating because it is a *negative* result: **the bank has no
longest-answer leak.** The key is the uniquely longest option in only 9% of sets and the
uniquely shortest in 16% — both *below* the 25% chance baseline. Option lengths are
genuinely controlled. Any generator writing into this bank must preserve that, which in
practice means padding or trimming distractors to match the key's visual weight.

The 5 descending sets are a real inconsistency and are listed in Part 7.

## 1.9 Derived rule set

Ranked by strength of evidence. Every generated item must satisfy all of these.

| Conformance | Rule |
|---|---|
| 166/168 | Exactly one interrogative, and it is the final sentence |
| 101/101 | The condition precedes the interrogative — never after |
| 74/93 | Refers to the equations as *the given …*, never *above* / *below* |
| 69/71 | The solution is named by a definite description |
| 52/57 | Numeric options ascend; non-numeric options come last |
| 22/22 | Constants are declared before use: *…, k is a constant* |
| 14/14 | Open construction items are modalised with *could be* |
| 102/125 | Options share an identical first token |

---

# PART 2 — Structural templates

Twelve stem archetypes cover the corpus. Counts are unique items; rows overlap.

| # | Template | Easy | Med | Hard | Reading |
|---|---|---:|---:|---:|---|
| T1 | Solve, report a single variable | 5 | 6 | 2 | collapses out of the hard tier |
| T2 | Solve, report a **compound expression** | 4 | 9 | 12 | the reliable medium→hard lever |
| T3 | Report the ordered pair | 14 | 2 | 0 | an easy-tier marker |
| T4 | Model-building ("which system represents…") | 9 | 7 | 3 | front-loaded |
| T5 | Solution-count / intersection-count | 0 | 4 | 8 | medium-and-up only |
| T6 | Parameter ⇒ **no solution** | 0 | 1 | 20 | **the dominant hard template** |
| T7 | Parameter ⇒ **infinitely many** | 2 | 3 | 5 | spread across tiers |
| T8 | Construct the second equation | 0 | 1 | 10 | hard-only |
| T9 | Graph-based | 7 | 3 | 9 | bimodal |
| T10 | Three-equation concurrency | 0 | 0 | 3 | hard-only |
| T11 | Parametric point set (`for each real r`) | 0 | 0 | 3 | hard-only |
| T12 | Real-world context wrapper | 11 | 12 | 9 | **flat — not a difficulty lever** |

**The hard tier is structurally narrow.** T6 alone is 20 of 62 hard items (32%); T6+T8
together are 48%. Nearly half the hard bank asks one question — make the coefficients
proportional and the constants not — in different costumes. The generator caps this.

---

# PART 3 — Distractor logic

## 3.0 The measured model

Naming traps by reading option sets is guesswork. So instead: parse the display equations
of every multiple-choice item into a coefficient matrix, solve exactly with rationals,
parse the target expression out of the interrogative, and then **test each wrong answer
against a library of candidate values produced by specific broken procedures.** A
distractor is "explained" when it equals the output of a named error.

Scope of what could be mechanised: 125 MC items → 50 whose display math parses as two
equations → 45 solving to a unique rational point → **31 with a machine-readable
`value of ⟨expression⟩` target, giving 93 distractors.**

**Result: 84 of 93 distractors (90%) are the exact output of a named broken procedure.**

The null baseline matters, because a big enough candidate library explains anything by
accident. Drawing random integers from [−60, 60] against the same libraries, **21% land on
a candidate by chance.** So the model runs at 90% against a 21% floor.

| n | Mechanism | What the student did |
|---:|---|---|
| 17 | **Sign or placement slip inside the system** | Solved a system differing from the printed one by a single negated coefficient or constant, or by two coefficients transposed. Overwhelmingly a flipped constant on the second equation. |
| 14 | **Arithmetic on two numerals from the page** | Combined two visible numbers directly — `21 ÷ 10 = 2.1` where `10 + 21 = 31` was required. |
| 14 | **One component reported alone** | Solved correctly, reported `x` or `y` when a compound expression was asked. |
| 12 | **Echo of a numeral from the page** | Answered with a number simply visible in the stem, including a fraction's numerator or denominator in isolation. |
| 8 | **Sum or difference of components, wrong one** | `x − y` or `y − x` for `x + y`, and the reversed order of a difference. |
| 6 | **Sign error on the final answer** | Correct magnitude, wrong sign. |
| 5 | **Reported the pre-division value** | Reached `2x = 10` and answered 10. |
| 3 | **Did not divide at all** | Read `3x = 12` as `x = 12`, then propagated it. |
| 3 | **Component negated** | Reported `−x` where `x` was wanted. |
| 2 | **Product of components** | Answered `xy`. |
| **9** | **unexplained** | |

**Ablation — which families are load-bearing.** Coverage and null were re-measured with
each family removed:

| Model | Coverage | Null | Lift |
|---|---:|---:|---:|
| Full (6 families) | 90% | 19% | 71 |
| − page-numeral echo & arithmetic | 65% | 10% | 55 |
| − procedural sign/placement slips | 77% | 18% | 59 |
| − reporting-the-wrong-thing | 82% | 17% | 65 |
| − stopping early | 87% | 16% | 71 |
| − target-coefficient mishandling | 90% | 17% | **73** |
| − inverted fractional coefficient | 90% | 19% | 71 |

The last two families explain **nothing** the others do not, while still inflating the
candidate set — dropping them *raises* the lift. The parsimonious model is four families —
sign/placement slips, reporting the wrong thing, stopping early, and page-numeral
arithmetic — which reaches the same 90% coverage.

**The generative recipe this implies.** A three-distractor set should be sampled to mirror
the measured distribution, not invented:

```
distractor_1 : re-solve the system with ONE sign flipped        (~18% of real distractors)
distractor_2 : report a component, or the wrong ± combination   (~24%)
distractor_3 : a numeral from the page, or two of them combined (~28%)
```
The remaining ~30% — pre-division values, unsigned magnitudes, products — supply
substitutes when one of the three collides with the key or with another distractor.

**The one thing this does not license.** `Echo of a numeral from the page` is 12
occurrences of real, attested practice, but it is the *weakest* distractor type: it
diagnoses nothing about the student's method, only that they guessed from what was
visible. It is common in your corpus at the easy tier and should stay there. At the hard
tier every distractor should come from families 1, 3, or 4, where a wrong answer identifies
a specific broken procedure.

**A validity check that came free.** The engine recomputes the key for all 31 machine-
readable items and compares it with the marked answer. **All 31 agree** — no mis-keyed
item among those checkable.

## 3.1 The hand-read catalogue

The classes below were catalogued by reading option sets, and remain the working
vocabulary for items the parser cannot reach (contextual, graphical, and parametric ones).
Where a class maps onto §3.0 the measured frequency is the better authority.


**Solve-and-report**

| Code | Trap | Corpus evidence |
|---|---|---|
| D1 | Wrong-variable report | `x = 8, y = −3` ⇒ `10 / 6 / 4 / 2` |
| D2 | Coordinate swap | 6 of 19 ordered-pair sets carry an explicit swap |
| D3 | Sign mirror `±v` | 11 of 63 numeric sets; `−17 / −13 / 13 / 17` |
| D4 | Companion operation (`x−y` offered for `x+y`) | the `−13 / 13` pair above |
| D5 | Partial step — the last-but-one line of the work | `2k = 10 ⇒ 10` |
| D6 | Raw-input echo | `y = 4x − 9, y = 19` ⇒ `(4,19)/(7,19)/(19,4)/(19,7)` |

**Model-building**

| Code | Trap | Corpus evidence |
|---|---|---|
| D7 | Constant swap between equations | `f+r = 2,145 ; 11f + 8.25r = 214` |
| D8 | Coefficient transposition | `26g + 35b = 881` |
| D9 | Rate inversion | `31l + (104/3)e = 16` |
| D10 | Complement error (`0.25m` for `0.75m`) | mirror/vase discount item |

**Structural — these carry the hard tier**

| Code | Trap | Diagnoses |
|---|---|---|
| D11 | Proportional coefficients *and* proportional constant | Cannot separate *no solution* from *infinitely many*. The highest-value trap in the skill. |
| D12 | Slope- and intercept-matched (the same line) | Equates "parallel" with "identical". |
| D13 | Unrearranged coefficient | Fails on `4x − 6y = 10y + 2` shapes where the true *y*-coefficient is `−16`. |
| D14 | One root of a two-root parameter condition | Solves `k² = c`, stops at the positive root. |
| D15 | "Cannot be determined" live | Cannot see that a parameter cancels. |

**Measured geometry.** 17% of numeric sets offer an explicit sign mirror; 32% of
ordered-pair sets offer an explicit coordinate swap. House style makes roughly one
distractor per item a *symmetry* of the key rather than a random near-miss.

---

## 3.2 Extending the engine to parametric and contextual items

§3.0 only reached items whose two equations sat in a display block with a numeric target —
31 of 156. The remaining items fall into four groups, each needing a different engine.
Re-extracting the corpus first recovered two fields the earlier pass had missed:
`answerValue` (free-response answers) and `explanation` (a worked solution on 133 items).
Both turned out to be load-bearing.

### Engine B — parametric items (constant + structural condition)

Parse the system with the literal parameter left symbolic, then solve the *condition*
rather than the system. `det(A) = 0` gives the candidate parameter values; the constants
then decide whether each candidate yields **no solution** or **infinitely many**.

The first version got 10 of 12 and reported two "mismatches" — both wrong, and instructive.
In `2x + 7y = 9 ; 8x + 28y = a` the determinant is **identically zero** whatever `a` is
(2·28 − 7·8 = 0), so "solve det = 0 for `a`" returns nothing. The condition there lives
entirely in the constants: infinitely many solutions requires `a = 36`. Generalising to
handle a vanishing determinant separately from the consistency condition:

**12 of 12 parametric items reached, 12 of 12 keys verified, 0 mismatches** — covering
`no solution`, `infinitely many`, and one item whose condition is "the graphs intersect at
`(q, 19)`", solved by substitution instead.

### Engine A2 — "which could be the second equation" (construction items)

For each option, form the system with the given equation and classify it. The stated
condition should be satisfied by **exactly one** option.

**8 of 8 verified, 0 ambiguous, 0 mismatched.** And the classification exposes a design
rule invisible from reading: in **8 of 8 items the four options span all three outcomes** —
at least one produces a unique solution, one produces none, and one produces infinitely
many. The distractor set is not a set of near-misses; it is a *partition of the outcome
space*. A student who cannot tell "parallel and distinct" from "the same line" has a wrong
answer waiting for them every time, by construction.

### Engine A1 — model-building items ("which system represents…")

Compare each option's coefficient matrix against the key's. Of 50 distractor systems
across 16 items:

| n | How the distractor system differs from the key |
|---:|---|
| 22 | coefficients and totals both altered |
| 8 | coefficients altered, totals held |
| 8 | coefficients attached to the wrong variable |
| 6 | totals attached to the wrong equation |
| 4 | totals altered, coefficients held |

**26 of 50 (52%) are built from exactly the key's own numerals, rearranged** — the same six
numbers dealt into different slots. That is the generative rule for this template: permute,
don't invent.

### Engine C — contextual items

The system is not printed anywhere in the stem; it lives in the prose. Rather than infer
it, read it out of the bank's own worked solution — the explanations state the model
explicitly ("*this can be modeled by the equation 4x + 2y = 86*"). A tightened equation
grabber recovers the system, which then feeds the §3.0 library.

An earlier attempt at *searching* for a model that reproduces the key was abandoned: on the
Store A / Store B item it "recovered" `X + Y = 6.5 ; 3X + 6.5Y = 37`, which is not the
problem's system at all but happens to yield the keyed answer. Any search over templates
finds *a* model consistent with the key, not *the* model. The worked solutions are ground
truth; the search was not.

### Unified result

| | items reached | distractors | explained | null |
|---|---:|---:|---:|---:|
| display-math only (§3.0) | 31 | 93 | 90% | 21% |
| **+ contextual (Engine C)** | **35** | **105** | **81%** | 19% |

Coverage *falls* when contextual items are added, and that is the honest signal: contextual
distractors carry error modes the symbolic library does not model. Two are visible in the
residue and worth naming:

- **Collapsing the system into a single equation.** On the wire item (`x + y = 106`,
  `x = 4y + 6`), the distractors 25 and 28 are `4x + 6 = 106 → x = 25` and
  `(106 + 6)/4 = 28` — the student solves the relation against the *total* as though one
  variable were the whole quantity.
- **Adjacent-integer near-misses** — see below.

Adding a "partial totals" family (rate × quantity, including the cross-pairing) moved
coverage not at all: 5 hits, all already explained by other families. It is reported here
as a negative result rather than quietly dropped.

## 3.3 A rule of mine the corpus contradicts

§3.0 told you to *"reject any option that is merely the answer ± 1."* The corpus does not
obey that:

| | n | share |
|---|---:|---|
| integer-option distractors examined | 135 | |
| exactly key ± 1 | 10 | 7% |
| exactly key ± 2 | 10 | 7% |

By tier, key ± 1 runs **8% easy, 9% medium, 4% hard**. So the rule is right in direction
and wrong as an absolute. The corrected rule: **a near-miss integer is acceptable at most
once per item and should not appear in a hard item**, where every distractor ought to name
a procedure.

## 3.4 The shape of the answer is itself a difficulty scaler

An audit of the keys themselves — something I had not looked at at all:

| Tier | n | integer | \|value\| ≤ 20 | negative | non-integer |
|---|---:|---:|---:|---:|---:|
| easy | 19 | **100%** | 74% | 5% | 0% |
| medium | 40 | 92% | 68% | 2% | 8% |
| hard | 37 | **81%** | 49% | **14%** | **19%** |

Easy answers are, without exception, integers, and usually small positive ones. Hard answers
are fractional a fifth of the time and negative one time in seven. **The form of the answer
signals the tier before a student does any work** — and a generator that produces a tidy
small positive integer for a "hard" item has produced an item that *reads* easy.

## 3.5 Key audit of the existing bank

Building these engines made a full independent key check almost free, because 133 items
carry a worked solution that names its own answer ("*Choice A is correct*", "*The correct
answer is 1,677*").

| Check | Result |
|---|---|
| MC items whose explanation names a letter | 92 |
| explanation letter agrees with the stored `correct` index | **92 / 92** |
| FR items with both a stored answer and an explanation | 41 |
| stored answer appears in its own explanation | **41 / 41** |
| parametric keys recomputed from scratch (Engine B) | **12 / 12** |
| construction keys recomputed from scratch (Engine A2) | **8 / 8** |

**No mis-keyed item was found anywhere in the systems-of-equations content.** One item
flagged initially — `1677` stored against `1,677` in the explanation — is a thousands-
separator difference, not an error.

# PART 4 — Difficulty scalers

| Scaler | Easy | Med | Hard | Lift |
|---|---:|---:|---:|---|
| Literal parameter declared a constant | 2 | 1 | 20 | **10×** |
| Free-response (no options to reverse-engineer) | 8% | 22% | 42% | 5× |
| Compound-expression target | 4 | 9 | 12 | 3× |
| Subordinate clauses per item | 0.56 | 0.55 | 0.92 | 1.65× |
| Fractional / decimal coefficients | 4 | 2 | 9 | 2× |
| Figure present | 7 | 4 | 13 | 2× |
| Variables on both sides | 26 | 42 | 43 | flat alone |
| **Real-world context** | 23% | 21% | 15% | **none** |
| **Contextual prose length** | 58 w | 61 w | 61 w | **none** |
| Symbolic prose length | 21 w | 20 w | 28 w | 1.35×, and entirely declaration scaffolding (§1.6) |

**Working model — difficulty is the number of independent decisions between reading the
stem and writing the answer:**

- **Easy (1).** One equation already isolable; substitution immediate; target is a
  variable that appears in the work.
- **Medium (2).** Elimination or substitution *plus* one of: rearrangement, a compound
  target, or translating context into equations.
- **Hard (3+).** A structural condition (no solution / infinitely many / concurrency) or a
  parameter to solve for, **plus** an obstacle: fractional coefficients, terms on both
  sides, a two-root condition, an expression-valued target, or figure-only information.

The corpus confirms the converse: the longest stems (mpg, alloy, Store A/B) sit at 2–3
decisions, while the shortest hard item — `4x − 9y = 9y + 5 ; hy = 2 + 4x` — sits at 3.

---

# PART 5 — The generation algorithm

## 5.0 Difficulty budget

Per batch of 10: **6 Hard / 3 Medium / 1 Easy**. Within the 6 hard, at most **2** may come
from T6/T8 — a hard cap written to counteract the 48% concentration measured in Part 2.

## 5.1 Protocol

**A — Draw a structural frame, not a number set.** Sample from the frame ledger (§5.2)
under the T6/T8 cap; if the frame has ≥3 bank instances, mutate it at step B.

**B — Apply at least one novelty operator.**

| Op | Transformation |
|---|---|
| O1 *Target shift* | ask for `x/y`, `x−y`, `3x+3y`, `xy`, or a quantity the variables only feed |
| O2 *Representation shift* | state a line by two points, slope-and-point, or a transformation |
| O3 *Parameter promotion* | promote a coefficient to a literal, then ask something parameter-independent |
| O4 *Condition inversion* | give the solution, ask which parameter values are excluded |
| O5 *System-on-system* | ask which transformed system preserves the solution set |
| O6 *Multiplicity* | make the condition quadratic in the parameter; ask for the sum/product of roots |
| O7 *Geometric embedding* | define a line by reflection, translation, or rotation |
| O8 *Concurrency* | add a third line; ask for the parameter making all three meet |

**C — Fix the solution first, generate coefficients second.** Never choose coefficients
and solve. This is what guarantees clean arithmetic without laundering ugly numbers.

**D — Add one obstacle per difficulty step above Easy.** Two ⇒ Medium, three ⇒ Hard. More
than four ⇒ reject: the item is testing stamina, not the skill.

**E — Sample distractors from the measured model (§3.0), never by perturbation.** Build
the table before writing options, mirroring the empirical distribution:

```
key      = correct procedure
distr_1  = re-solve with ONE sign flipped                      (~18%)
distr_2  = report a component, or the wrong ± combination      (~24%)
distr_3  = a numeral from the page, or two combined            (~28%)
           — at the HARD tier substitute a pre-division value,
             an unsigned magnitude, or a misconception run to
             the end (D11–D15) instead of a bare numeral echo
```
A near-miss integer (key ± 1 or ± 2) is permitted **at most once per item and never in a
hard item** — the corpus uses it 7% of the time overall but only 4% at hard (§3.3). Reject
a bare page-numeral echo in any hard item: it diagnoses guessing, not method.

For **model-building** items, build every distractor system by *permuting the key's own
numerals* into wrong slots (52% of real ones are exactly that, §3.2) rather than inventing
new numbers. For **construction** items ("which could be the second equation"), make the
four options span all three outcomes — unique, none, infinitely many — as 8 of 8 real
items do.

**F — Surface realisation (the language layer).** Assemble the stem in slot order —
`[display math] → [frame] → [condition] → [interrogative]` — drawing sentences from the
attested inventory in §1.2 and obeying §1.9 in full. Concretely:

1. Choose the frame sentence to *match the intended tier* (§1.2): `The solution to the
   given system of equations is (x, y).` for easy/medium; `In the given system of
   equations, k is a constant.` + `The system has no solution.` for hard.
2. Refer to the equations as **the given system of equations**. Never *above*, never
   *below*, never *shown* unless a figure is actually present.
3. Definite description only when the solution is unique (§1.4).
4. `could be` iff the condition admits many equations; `represents` iff modelling is
   unique (§1.5).
5. One interrogative, last sentence, no exceptions.
6. Contextual items: present tense for standing facts, past for the event; units by
   `, in ⟨unit⟩,` appositive; `$` in the scenario; thousands separators; no second person.
   Respect the three genre length norms of §1.6 (inter-quartile ranges): display-math
   symbolic 17–22 words, prose-stated symbolic 23–42, contextual 46–76. A 60-word
   display-math stem is out of register; a 60-word contextual stem is normal.
7. Options ascending, non-numeric last, parallel first tokens, key length not extremal.

**G — Integrity checks (all must pass).**

1. *Uniqueness* — substitute the key into every stated condition; verify each distractor
   explicitly **fails** at least one.
2. *Non-degeneracy* — confirm the determinant is nonzero wherever a unique solution is
   claimed.
3. *Root completeness* — if the parameter condition is quadratic, test **both** roots; one
   often yields *infinitely many* rather than *no solution*, silently changing the key.
4. *Disjointness* — no two options equal under simplification (`1/2` and `0.5` are one
   option).
5. *Position and length balance* — keys spread across A–D; key not the uniquely longest
   option.
6. *Answer form matches the tier* (§3.4) — an easy item's answer must be an integer, and
   usually a small positive one; a hard item may be fractional (19% of real ones are) or
   negative (14%). A tidy small positive integer as the answer to a "hard" item makes it
   read easy before any work is done.
7. *Time budget* — Hard ≤ 120 s, Medium ≤ 90 s, Easy ≤ 45 s.

**H — Novelty audit.** Grep the bank for the stem's distinctive numbers and its scenario
noun. A match on both ⇒ regenerate.

**I — Emit in bank schema** (§5.3).

## 5.2 Frame ledger

★ marks under-represented frames the generator should favour.

| Frame | Bank count | Status |
|---|---:|---|
| F1 Parameter ⇒ no solution | 20 | saturated — capped |
| F2 Parameter ⇒ infinitely many | 5 | adequate |
| F3 Second-equation construction | 10 | adequate |
| F4 Compound-expression target | 12 | adequate |
| F5 Concurrency of three lines | 3 | ★ expand |
| F6 Parametric point set | 3 | ★ expand |
| F7 Solution-preserving transformation | 1 | ★★ effectively absent — the sole instance is a graphical read-off with `x = c` / `y = c` options, not an algebraic equivalence |
| F8 Geometric transformation of a line | 0 | ★★ absent |
| F9 Two-root parameter condition | 0 | ★★ absent |
| F10 Parameter-independent target (ratio) | 0 | ★★ absent |
| F11 Derived-quantity word problem | 2 | ★ expand |
| F12 Line from two points / slope-point | 4 | ★ expand |

## 5.3 Emission schema

```json
{"domain":"Algebra",
 "skill":"Systems of Two Linear Equations in Two Variables",
 "difficulty":"hard",
 "type":"mc",
 "text":"<div style=\"text-align:center; margin:1.2em 0; font-size:1.1em;\">…</div><div>…</div>",
 "choices":["…","…","…","…"],
 "correct":2,
 "key":"gen-sys-001",
 "sectionKey":"math"}
```

House conventions on emission: variables in `<i>`; `correct` is **0-indexed**; FR items
drop `choices`/`correct` for `answer`; stacked fractions use the bank's inline-flex
`<span>` construction; U+2212 `−` for minus, never the ASCII hyphen; never `<i>` inside an
SVG `<text>`; figures are real images under `portal/assets/`, never prose descriptions.

---

# PART 6 — Ten generated items

6 Hard / 3 Medium / 1 Easy. Frames: F5, F1×F9, F8, F7, F10, F9, F12, F11, F11, T1 — of
which three (F8, F9, F10) have no instance anywhere in the bank and a fourth (F7) exists
only in a degenerate graphical form. Every stem below is written to the §1.9 rule set.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — concurrency of three lines (F5)]

**Question Stem:**

> x + y = 5
> 3x − 2y = 0
>
> The solution to the given system of equations is (*x*, *y*). In the *xy*-plane, the
> graph of *kx* + 4*y* = 22, where *k* is a constant, passes through the point
> (*x*, *y*). What is the value of *k*?

**Options:**
(A) 4
(B) 14/3
(C) 5
(D) 10

**Correct Answer:** (C)

**Distractor Rationale:**
- **(A) 4** — D12. The student reads "passes through the same point" as "is the same
  line" and scales `x + y = 5` by 4 to match the `4y` term. Diagnoses the conflation of
  concurrency with equivalence.
- **(B) 14/3** — D2. Coordinate swap: solves correctly but assigns `x = 3, y = 2`, giving
  `3k + 8 = 22`.
- **(C) 5** — correct.
- **(D) 10** — D5. Reaches `2k = 10` and reports 10, dropping the final division.

**Mathematical Solution & Underlying Concept:** From `3x − 2y = 0`, `y = 3x/2`. Then
`x + 3x/2 = 5` ⇒ `5x/2 = 5` ⇒ `x = 2`, `y = 3`. A point lies on a line exactly when its
coordinates satisfy the equation, so `k(2) + 4(3) = 22` ⇒ `2k = 10` ⇒ **k = 5**.
*Concept:* three lines are concurrent when the solution of any two satisfies the third — a
point condition, not a coefficient condition.

*Language note:* uses the 40× frame sentence, then the 5× `where k is a constant`
appositive; interrogative final.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — parameter with two candidate roots (F1 × F9)]

**Question Stem:**

> *kx* + 4*y* = 10
> 9*x* + *ky* = 15
>
> In the given system of equations, *k* is a constant. If the system has no solution, what
> is the value of *k*?

**Options:**
(A) −6
(B) 0
(C) 6
(D) Both −6 and 6

**Correct Answer:** (A)

**Distractor Rationale:**
- **(A) −6** — correct.
- **(B) 0** — the student believes "no solution" requires a variable to vanish. In fact
  `k = 0` gives `4y = 10` and `9x = 15`: an ordinary unique solution.
- **(C) 6** — D14. Solves `k² = 36`, takes the positive root by reflex, never tests it.
  `k = 6` yields two *identical* lines (`3x + 2y = 5` twice) — infinitely many solutions,
  the opposite of what was asked.
- **(D) Both −6 and 6** — D11, the central misconception in this skill: proportional
  coefficients treated as sufficient, with no check on the constants.

**Mathematical Solution & Underlying Concept:** Parallel-and-distinct requires
`k/9 = 4/k` with `10/15` not equal to that ratio. `k² = 36` ⇒ `k = ±6`. Test each.
`k = 6`: both equations reduce to `3x + 2y = 5` — infinitely many, rejected. `k = −6`:
coefficient ratio `−2/3`, constant ratio `+2/3` — parallel and distinct. **k = −6.**
*Concept:* the coefficient condition is necessary but not sufficient; every root must be
tested against the constants.

*Language note:* the canonical hard pairing — `In the given system…, k is a constant.`
(11×) followed by the fronted `If the system has no solution,` (9×).

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — lines defined by geometric transformation (F8)]

**Question Stem:**

> In the *xy*-plane, line *g* is defined by *y* = (1/2)*x* + 6. Line *h* is the reflection
> of line *g* across the *x*-axis, and line *k* is the image of line *g* after a
> translation 4 units down. If lines *h* and *k* intersect at the point (*x*, *y*), what is
> the value of *x* + *y*?

**Options:**
(A) −14
(B) −10
(C) −8
(D) 8

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) −14** — direction error on the translation: writes `k: y = (1/2)x + 10`, intersects
  at `(−16, 2)`, reports −14.
- **(B) −10** — correct.
- **(C) −8** — D1. Finds `x = −8` and reports the coordinate instead of the sum.
- **(D) 8** — axis confusion: reflects across the *y*-axis (`y = −(1/2)x + 6`), giving the
  intersection `(4, 4)`.

**Mathematical Solution & Underlying Concept:** Reflection across the *x*-axis maps
`(x, y) → (x, −y)`, so *h* is `y = −(1/2)x − 6`. A translation 4 units down subtracts 4,
so *k* is `y = (1/2)x + 2`. Then `−(1/2)x − 6 = (1/2)x + 2` ⇒ `x = −8`, `y = −2`, and
`x + y = **−10**`. *Concept:* a transformation acts on the equation as an algebraic
substitution (`y → −y`; `y → y + 4`), converting a geometry statement into an ordinary
two-line system.

*Language note:* line names *g*, *h*, *k* are the corpus's own (`line h`, `line k`,
`line g`); `is defined by` is attested; the condition is fronted.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — solution-preserving transformation (F7)]

**Question Stem:**

> 3*x* − 7*y* = −2
> 5*x* + 2*y* = 24
>
> Which of the following systems of equations has the same solution as the given system of
> equations?

**Options:**
(A) 3*x* − 7*y* = −2 and 2*x* + 9*y* = 22
(B) 6*x* − 14*y* = −2 and 5*x* + 2*y* = 24
(C) 3*x* − 7*y* = −2 and 8*x* − 5*y* = 22
(D) 3*x* − 7*y* = −2 and 15*x* + 6*y* = 24

**Correct Answer:** (C)

**Distractor Rationale:**
- **(A)** — a near-miss built from the *correct* operation (equation 2 minus equation 1)
  with the constant slipped: the true difference is `2x + 9y = 26`. Catches students who
  know the method but do not verify.
- **(B)** — D13/D5. Doubles the left side of the first equation and leaves the constant
  untouched — the classic half-executed scaling. `(4, 2)` gives `−4`, not `−2`.
- **(C)** — correct.
- **(D)** — triples only the left side of the second equation. `(4, 2)` gives 72, not 24.

**Mathematical Solution & Underlying Concept:** The solution is `(4, 2)`
(`3(4) − 7(2) = −2` ✓; `5(4) + 2(2) = 24` ✓). Replacing one equation by the sum of the two
preserves the solution set provided the pair stays independent. Adding:
`8x − 5y = 22`, and `8(4) − 5(2) = 22` ✓, with `3(−5) − (−7)(8) = 41 ≠ 0`, so `(4, 2)` is
its unique solution. Every other option fails at `(4, 2)` by substitution. *Concept:*
elimination is legitimate precisely because adding a multiple of one equation to another
is solution-preserving — and scaling must be applied to **both** sides.

*Language note:* refers to *the given system of equations*, not *the system above*; options ordered by
their second equation's leading coefficient and sharing an identical first token, per
§1.8.

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — parameter-independent target (F10)]

**Question Stem:**

> 5*x* + 2*y* = 9*k*
> 3*x* + 4*y* = 11*k*
>
> In the given system of equations, *k* is a nonzero constant, and the solution to the
> system is (*x*, *y*). What is the value of *x*/*y*?

**Options:**
(A) 1/2
(B) 9/11
(C) 2
(D) The value cannot be determined from the given information.

**Correct Answer:** (A)

**Distractor Rationale:**
- **(A) 1/2** — correct.
- **(B) 9/11** — reads the ratio off the constants, assuming `x : y = 9k : 11k`. Diagnoses
  a surface-pattern shortcut with no algebraic basis.
- **(C) 2** — D3/D4. Solves correctly for `x = k`, `y = 2k`, then inverts the requested
  ratio.
- **(D)** — D15. Sees an unspecified constant and concludes the system is
  underdetermined, missing that *k* cancels.

**Mathematical Solution & Underlying Concept:** Doubling the first equation gives
`10x + 4y = 18k`; subtracting the second gives `7x = 7k` ⇒ `x = k`. Then `5k + 2y = 9k`
⇒ `y = 2k`, so `x/y = k/(2k) = **1/2**`, independent of *k*. *Concept:* a parameter
appearing linearly and identically on the right-hand sides scales the solution without
changing its direction, so any ratio of its coordinates is parameter-free.

*Language note:* declares the constant before use, then names the solution with a definite
description in the same sentence; non-numeric option placed last (§1.8).

---

### [Difficulty Rating: Hard]
### [Algebra › Systems of Two Linear Equations in Two Variables — two-root parameter condition (F9)]

**Question Stem:**

> (*k* − 1)*x* + 6*y* = 10
> 3*x* + (*k* + 2)*y* = 5
>
> In the given system of equations, *k* is a constant. If the system has no solution, what
> is the sum of all possible values of *k*?

**Options:**
(A) −5
(B) −1
(C) 1
(D) 4

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) −5** — D14. Finds both roots but reports only the negative one, answering "what is
  *k*" rather than "what is the sum."
- **(B) −1** — correct.
- **(C) 1** — sign error on the sum of roots: from `k² + k − 20 = 0` the sum is `−b/a = −1`
  and the student drops the negation.
- **(D) 4** — D14 mirrored, and the most likely wrong answer: 4 is the root reached first
  when factoring `(k + 5)(k − 4)`.

**Mathematical Solution & Underlying Concept:** No solution requires proportional
coefficients with non-proportional constants: `(k − 1)/3 = 6/(k + 2)` ⇒
`(k − 1)(k + 2) = 18` ⇒ `k² + k − 20 = 0` ⇒ `(k + 5)(k − 4) = 0`, so `k = −5` or `k = 4`.
Both must be tested. `k = 4`: `3x + 6y = 10` and `3x + 6y = 5` — contradictory ✓.
`k = −5`: `−6x + 6y = 10` and `3x − 3y = 5` — coefficient ratio `−2`, constant ratio `+2` ✓.
Both qualify, so the sum is `−5 + 4 = **−1**`. *Concept:* the proportionality condition is
genuinely quadratic; completeness and verification are separate obligations.

---

### [Difficulty Rating: Medium]
### [Algebra › Systems of Two Linear Equations in Two Variables — line from points and slope (F12)]

**Question Stem:**

> In the *xy*-plane, one line in a system of two linear equations passes through the points
> (0, −4) and (6, 8). The other line has a slope of −3 and passes through the point (2, 5).
> If (*a*, *b*) is the solution to the system, what is the value of *a* + *b*?

**Options:**
(A) 1
(B) 2
(C) 3
(D) 5

**Correct Answer:** (D)

**Distractor Rationale:**
- **(A) 1** — D4. Computes `a − b` instead of `a + b`.
- **(B) 2** — D1. Reports `b` alone.
- **(C) 3** — D1. Reports `a` alone. Together (B) and (C) capture the two commonest
  stopping points.
- **(D) 5** — correct.

**Mathematical Solution & Underlying Concept:** The first line has slope
`(8 − (−4))/6 = 2` and *y*-intercept −4, so `y = 2x − 4`. The second: `y − 5 = −3(x − 2)`
⇒ `y = −3x + 11`. Then `2x − 4 = −3x + 11` ⇒ `a = 3`, `b = 2`, and `a + b = **5**`.
*Concept:* a system need not arrive in equation form — two points, or a slope and a point,
determine a line uniquely.

*Language note:* deliberately modelled on the corpus's own `In the xy-plane, one line in a
system of two linear equations passes through the points …` frame.

---

### [Difficulty Rating: Medium]
### [Algebra › Systems of Two Linear Equations in Two Variables — derived-quantity context (F11)]

**Question Stem:**

> A print shop uses two binding machines. Machine A binds 12 booklets per minute, and
> Machine B binds 20 booklets per minute. During one job, Machine A ran for *a* minutes and
> Machine B ran for *b* minutes. The two machines ran for a total of 45 minutes and bound a
> total of 700 booklets. How many more booklets did Machine B bind than Machine A?

**Options:**
(A) 5
(B) 100
(C) 300
(D) 400

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) 5** — finds `a = 25`, `b = 20` and reports the difference in *minutes* rather than
  booklets, missing the unit the question asks for.
- **(B) 100** — correct.
- **(C) 300** — D5. Stops at Machine A's output, `12 × 25`.
- **(D) 400** — D5. Stops at Machine B's output, `20 × 20`; the most tempting stopping
  point because the question names Machine B first.

**Mathematical Solution & Underlying Concept:** `a + b = 45` and `12a + 20b = 700`.
Substituting: `12a + 900 − 20a = 700` ⇒ `a = 25`, `b = 20`. Machine A bound `300`, Machine
B bound `400`, and the difference is **100**. *Concept:* the variables are times, but the
question is about outputs — solving the system is the middle of the problem, not the end.

*Language note:* present tense for the standing rates, past for the job; `a total of`
twice, per the 14× house phrase.

---

### [Difficulty Rating: Medium]
### [Algebra › Systems of Two Linear Equations in Two Variables — derived-quantity context (F11)]

**Question Stem:**

> A greenhouse uses two sizes of seed tray. Each small tray holds 24 seedlings and costs
> $4, and each large tray holds 40 seedlings and costs $7. The greenhouse ordered a total
> of 32 trays, and those trays hold a total of 1,008 seedlings. What is the total cost, in
> dollars, of the trays the greenhouse ordered?

**Options:**
(A) 128
(B) 173
(C) 179
(D) 224

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) 128** — never sets up the system; prices all 32 trays as small (`4 × 32`).
- **(B) 173** — correct.
- **(C) 179** — D8. Solves correctly but transposes the results, pricing 15 small and 17
  large trays. One number from the key, and the reason the arithmetic must be traced.
- **(D) 224** — the mirror of (A): all 32 trays priced as large (`7 × 32`).

**Mathematical Solution & Underlying Concept:** With *s* small and *ℓ* large trays,
`s + ℓ = 32` and `24s + 40ℓ = 1,008`. Substituting: `24s + 1,280 − 40s = 1,008` ⇒ `s = 17`,
`ℓ = 15` (check: `408 + 600 = 1,008` ✓). Cost `= 4(17) + 7(15) = **$173**`. *Concept:* a
context can carry three rates — capacity, count, price — where only two enter the system
and the third converts the solution into the requested quantity.

*Language note:* `, in dollars,` appositive (8× house pattern); thousands separator on
`1,008`; `$` in the scenario, spelled unit in the gloss.

---

### [Difficulty Rating: Easy]
### [Algebra › Systems of Two Linear Equations in Two Variables — direct substitution (T1)]

**Question Stem:**

> *y* = *x* − 7
> *x* + *y* = 21
>
> The solution to the given system of equations is (*x*, *y*). What is the value of *x*?

**Options:**
(A) 7
(B) 14
(C) 21
(D) 28

**Correct Answer:** (B)

**Distractor Rationale:**
- **(A) 7** — D1/D6. Either reports `y = 7`, or echoes the 7 in the first equation.
- **(B) 14** — correct.
- **(C) 21** — D6. Raw-input echo of the total.
- **(D) 28** — D5. Reaches `2x = 28` and reports 28. The most instructive wrong answer at
  this tier.

**Mathematical Solution & Underlying Concept:** The first equation already gives *y* in
terms of *x*: `x + (x − 7) = 21` ⇒ `2x = 28` ⇒ `x = **14**` (and `y = 7`). *Concept:* when
one equation is solved for a variable, substitution reduces the system to one linear
equation in one variable in a single move.

*Language note:* the exact 40× canonical frame, verbatim.

---

# PART 7 — Verification, balance, and QA findings

## 7.1 Verification

All ten items were verified computationally, not by inspection.

**Mathematics — 32 checks, all passing.** Every key confirmed by substitution; every
distractor confirmed to actually fail; both roots of both quadratic-parameter items (2 and
6) tested against the stated condition. That last check is load-bearing — in item 2,
`k = +6` produces *infinitely many* solutions, so a writer who stopped at `k² = 36` would
have shipped the wrong key.

**Keying — 31 of 31 machine-checkable existing bank items agree with the recomputed key**,
a by-product of building the §3.0 engine and a reassuring signal about the corpus itself.

**Distractors — checked against the §3.0 distribution.** Classifying the 30 distractors in
Part 6 by measured mechanism: 9 are procedural sign/placement slips, 8 are
reporting-the-wrong-thing, 5 are stopping-early values, 4 are page-numeral arithmetic, and
4 are structural misconceptions (D11–D15). Exactly **one** is a bare numeral echo — the
`21` in item 10 — and it sits in the Easy item, which is precisely where the corpus puts
that weakest distractor type. No hard item leans on one.

**Answer form — two conformance gaps in my own batch, against §3.4.** Of the 5 numeric
hard keys, **3 are negative (60%) where the corpus runs 14%**; and of the 3 medium keys,
only 1 has \|value\| ≤ 20 where the corpus runs 68%. The fractional rate is fine (1 of 5,
against 19%). The negatives arise honestly — a two-root parameter condition and an
`x + y` on a downward-sloping pair both land below zero — but three in six hard items is
a signature, and a student who noticed it could start guessing negatives. On the next batch
the fix is to choose solutions in Step C that place the target above zero for at least
four of six hard items.

**Language — all 10 stems conform to §1.9**, checked mechanically rather than by eye: one
interrogative and it is final; no `above`/`below` deixis; no second person; no indefinite
`is a solution`; constants declared before use; no space before `?`; thousands separators
present; and every stem inside the inter-quartile length range for *its own genre*
(display-math symbolic, prose-stated symbolic, or contextual). Options ascend in all ten,
with non-numeric options last.

| # | Difficulty | Frame | Key | Position | Novelty |
|---|---|---|---|---|---|
| 1 | Hard | F5 concurrency | k = 5 | C | expands a 3-item frame |
| 2 | Hard | F1 × F9 | k = −6 | A | ✔ two-root variant |
| 3 | Hard | F8 transformation | −10 | B | ✔✔ absent frame |
| 4 | Hard | F7 equivalence | option C | C | ✔✔ absent in algebraic form |
| 5 | Hard | F10 parameter-free ratio | 1/2 | A | ✔✔ absent frame |
| 6 | Hard | F9 sum of roots | −1 | B | ✔✔ absent frame |
| 7 | Medium | F12 points/slope | 5 | D | expands a 4-item frame |
| 8 | Medium | F11 derived quantity | 100 | B | ✔ new context |
| 9 | Medium | F11 derived quantity | 173 | B | ✔ new context |
| 10 | Easy | T1 substitution | 14 | B | standard by design |

Only items 2 and 6 draw on the no-solution family, honouring the §5.0 cap.

**One balance target missed, disclosed rather than faked.** Key positions are A 2 / B 5 /
C 2 / D 1, against the corpus's even 29/37/30/29. Because §1.8 requires numeric options to
ascend, key position is a *consequence* of the distractor values, not a free choice — and
the only way to move a key is to invent a distractor at a chosen magnitude. Every
distractor above is the traced output of a named error procedure, and inventing unmotivated
ones to hit a position quota would violate step E of the algorithm. The corpus shows the
same mild B-skew for the same reason. The fix is to balance across a larger batch, not
within ten items.

## 7.2 QA findings in the existing bank

These are defects found in your live content while building the taxonomy, worth fixing
independently of anything above.

**a) 19 items written in old paper-SAT phrasing.** They say *the system of equations
above* / *below* where the digital SAT says *the given system of equations*. No item mixes
the two wordings, so this is a clean mechanical rewrite rather than a judgement call. On a
screen there is frequently nothing "above" the question at all.

| # | Tier | Source | Stem opening |
|---|---|---|---|
| 1 | hard | question-bank-math | `If (x, y) satisfies the system of equations above…` |
| 2 | medium | question-bank-math | `The system of equations above has solution (x, y).` |
| 3 | medium | question-bank-math | `Which of the following graphs … could be used to solve the system of equations above?` |
| 4 | easy | question-bank-math | `A system of two linear equations is graphed in the xy-plane below.` |
| 5 | medium | question-bank-math | `If the system of equations above has solution (x, y)…` |
| 6 | hard | question-bank-math | `In the system of equations below, a and c are constants.` |
| 7 | hard | question-bank-math | `If (x, y) is the solution to the system of equations above…` |
| 8 | hard | question-bank-math | `In the system of equations above, c is a constant.` |
| 9 | hard | question-bank-math | `In the system of equations above, a is a constant.` |
| 10 | medium | question-bank-math | `In the solution to the system of equations above…` |
| 11 | hard | question-bank-math | `One of the two equations in a linear system is shown above.` |
| 12 | medium | question-bank-math | `The graph of a system of two linear equations is shown. Which of the following systems…` |
| 13 | medium | question-bank-math | `In the solution (x, y) to the system of equations above…` |
| 14 | hard | practice-tests | `One of the equations … is given above.` |
| 15 | medium | practice-tests | `If (a, b) is the solution to the system of equations above…` |
| 16 | medium | practice-tests | `If (x, y) is **a** solution to the above system…` |
| 17 | hard | practice-tests | `If (x, y) is the solution to the system of equations above…` |
| 18 | medium | practice-tests | `Given that (x, y) is **a** solution to the above system … what is the value of x **?**` |
| 19 | hard | practice-tests | `If the above set of equations has infinitely many solutions…` |

**b) 2 items break the uniqueness presupposition** — items 16 and 18 above use indefinite
`is a solution` where the system has exactly one. Should be `the solution`.

**c) 1 typographic defect** — item 18 has a space before its question mark (`the value of
x ?`). It is the only instance in 168 items.

**d) 10 items mix U+2212 `−` with the ASCII hyphen** inside the same item. The bank's
standard is U+2212 (83 items use it). Mixed items render with visibly inconsistent minus
widths.

**e) 5 numeric option sets run descending**, against 52 ascending and zero unordered:
`[24, 15, 12, 5]` (×2), `[30, 20, 19, 18]`, `[10, 6, 4, 2]`, `[63, 11, 10, 3]`.

**f) No mis-keyed items.** Reported here as a clean result rather than a defect: an
independent audit against the bank's own worked solutions (§3.5) found **92/92 MC keys and
41/41 free-response answers correct**, with a further 20 keys recomputed from scratch by
the parametric and construction engines. The systems-of-equations content is soundly keyed.

**g) Latent risk: fraction markup is invisible to text tooling.** The stacked inline-flex
fraction renders correctly in a browser but flattens to adjacent digits in any plain-text
extraction — `(1/2)y = 4` reads as `12y = 4`, `−(4/11)x` as `−411x`, `4/17` as `417`. This
is not corrupted data, but it will silently poison any future grep, export, diff, LLM pass,
or analytics over these banks unless the reader reconstructs the markup first.

## 7.3 Extending to the next skill

The protocol transfers by rebuilding four artefacts, in this order: (1) the **sentence
inventory** and rule set of Part 1 — the language is the part that generalises least and
matters most; (2) the template census of Part 2 by tier; (3) the error-model catalogue of
Part 3, read off actual option sets; (4) the frame ledger of §5.2 with bank counts, so the
generator can be steered toward absent frames. Steps C–I of the algorithm are
skill-independent and change not at all.
