# Handoff — Strict Instructions for Transcribing a New Practice Test from PDF

This file is for the next session where Luca hands over a PDF (or similar source) of a
full SAT practice test to add to `portal/practice-tests.js`. Read this whole file before
starting. It codifies everything learned the hard way across several QA sessions fixing
Tests 1-9 — follow it from the start instead of rediscovering these bugs one at a time.

## The two absolute rules

1. **Any table in the source is a real `<table>` element. Never describe it in prose.**
2. **Any diagram/figure/graph in the source is cropped from the actual PDF page and
   embedded as a real image. Never hand-drawn, never described in prose, never
   reconstructed from a guess at what it "probably" looks like.**

Luca has said this explicitly, more than once, after finding violations: prose
descriptions of tables/figures ("the graph shows a line starting at...") are not
acceptable substitutes, even when the description is detailed enough to solve the
problem. If it was a table or figure in the source, it must render as one on the site.

## Table construction

- Real `<table class="dx-table">` markup, `<tr>`/`<th>`/`<td>` cells, transcribed
  exactly from the source — every row, every column, every value.
- **Math-section tables**: add centering — `<table class="dx-table"
  style="margin-left:auto;margin-right:auto;">`.
- **R&W-section tables**: no centering style — just `class="dx-table"` (they sit in the
  passage pane, which is left-aligned prose, and known-good official tests never center
  them there).
- A bare `<table>` with no `class` attribute renders with **zero borders and zero
  padding** — numbers floating in space with no grid. This is not a hypothetical: it's
  the single most common table bug found this session. Always double check the class is
  present before moving on.
- If a table has a title/caption in the source, put it in `<i>...</i>` directly above or
  below the table (whichever matches how it reads naturally) — don't invent a title that
  wasn't in the source.

## Figure/diagram/graph construction — the real workflow

1. **Locate the exact PDF page.** Don't page through visually if you can avoid it: run
   `pdftotext -layout` on the whole source PDF once, split the output on `\f` (form feed
   = page break) in a small Python/Node script, and grep for a distinctive phrase from
   the question to get the exact page number instantly. This is dramatically faster than
   flipping through rendered page images one at a time.
2. **Render just that page**: `pdftoppm -png -r 170-200 -f N -l N <source.pdf> out`. Use
   the Read tool to actually look at it.
3. **Crop the figure region** with PIL/Pillow (`Image.crop((x0,y0,x1,y1))`), convert to
   grayscale, save as PNG to `portal/assets/practice-test-figures/test<N>/<name>.png`.
   Keep crops tight around the actual figure — a little margin is fine, don't include
   unrelated surrounding page content.
4. **Embed it**: `<img src="assets/practice-test-figures/test<N>/<name>.png" alt="..."
   style="display:block;margin:0.5em auto;max-width:XXXpx;width:100%;">`, prepended
   before the question prose. Write a real, descriptive `alt` text — screen readers and
   anyone with images disabled depend on it. `max-width` around 260-420px depending on
   figure complexity (simple triangle: ~260px; multi-line graph with legend: ~420px).
5. **Replace the old prose description** — don't leave it dangling alongside the image.
   Rewrite the sentence to say "shown above" / "shown in the figure" instead of
   re-describing what the image already shows.

### The narrow exception (don't reach for this first)

Hand-building an SVG instead of cropping an image is acceptable **only** when both of
these hold:
- No source PDF page can be found for the specific question (genuinely new/substitute
  content drawn from a database or refresh pool with no page-numbered source), **and**
- Every single data point needed to draw the figure accurately is already stated
  explicitly in the question's own text (so you are visualizing given data, not guessing
  at what an unseen figure looks like).

Even then: keep it simple (a bar chart of literally-stated values, a triangle with
literally-stated side lengths), use the `dx-fig` class and `currentColor`/`font-style`
conventions below, and don't invent visual details (colors, exact proportions, decorative
elements) that weren't specified. If the figure is genuinely ambiguous from the text
alone (multiple valid geometric layouts fit the description) — don't guess. Leave it
unfixed and flag it for Luca instead of drawing something that might be wrong.

### Searching for a source when the question isn't from your directly-assigned PDF page

Some tests are built from a mix of sources (a linear practice-test PDF for most of the
test, plus a broader question-bank pool for "swapped in" harder/easier substitute
questions). If a flagged question doesn't match your primary source's page map, check:
- `/Volumes/ZIGGY/Tutoring/Subjects/Test Prep/Question Bank App/test_prep.db` (SQLite) —
  `questions` table has `stem_text`, `has_figure`, `image_path`. **The `image_path`
  column is not always accurate** — verify with `find images/ -iname "*<hex-id>*"`
  instead of trusting it directly; the actual filename prefix sometimes differs from
  what the DB row says.
- College Board Question Bank refresh PDFs, e.g. `/Users/lucamoretti/Downloads/New
  Question Bank Questions (August 2026)/Copy of new_math_questions_only.pdf` and the R&W
  equivalent — same `pdftotext` page-search trick works here.
- Match by content (a distinctive number, name, or phrase from the stem), not by
  question number — numbering resets across every source.

## Structural/formatting bugs to avoid from the start

These are all bugs that were actually shipped and had to be found and fixed after the
fact. Building correctly the first time avoids all of this rework.

### 1. Never put `<i>`, `<b>`, `<em>`, `<strong>`, `<sup>`/`<sub>`, or similar HTML tags
   **directly inside an SVG `<text>` element.**

This is the single most damaging bug found this session. The HTML5 parser has a
"foreign content breakout" rule: specific tags (`b`, `big`, `code`, `em`, `font`, `i`,
`s`, `small`, `strike`, `strong`, `tt`, `u`, and a few others) force the parser to pop
back out of SVG/foreign content the instant they're encountered — **even nested inside
`<text>` inside `<svg>`.** The SVG silently truncates right there: every subsequent
`<text>` label in the same figure, the closing `</svg>` tag, and everything in the
question text after it all fall out as broken plain HTML. This produced exactly what it
sounds like: figures with missing labels, "empty" graphs (the actual plotted line/circle
elements came after the broken `<text>` and never rendered), and garbled leaked text
right in the middle of the question ("xyWhat is the y-intercept...").

**The fix, and the only way to italicize an SVG text label:**
- Single italic letter, nothing else in that `<text>`: put `font-style="italic"`
  directly on the `<text>` tag itself, plain text content, no `<i>`.
  `<text x="40" y="20" font-style="italic">m</text>`
- Mixed content (e.g. an italic letter followed by a non-italic degree symbol): use
  `<tspan font-style="italic">` — `<tspan>` is SVG-native and never triggers the
  breakout. `<text x="40" y="20"><tspan font-style="italic">x</tspan>°</text>`

Before considering any SVG figure done, grep your own new content for `<text[^>]*><i>`
and confirm zero matches.

### 2. Hardcoded colors break dark mode.

Never use `stroke="black"`, plain `<text>` with no `fill`, or any other literal color in
an SVG. Every figure needs `style="color:var(--text);"` on the `<svg>` tag itself, then
`stroke="currentColor"` / `fill="currentColor"` on every line/shape/text element. A
figure built with literal "black" is invisible against a dark background.

### 3. R&W split-pane layout requires `<br><br>` in the right place — and only there.

The site's passage/question split-pane view (stimulus on the left, question + choices on
the right) is triggered by `splitRwPassage()` in `portal/index.html`, which splits a
question's `text` field on its **last** `<br><br>` occurrence. Whatever comes after that
last `<br><br>` is the ONLY thing shown in the question pane; everything before it
(including tables, images, and any explanatory/reasoning paragraph) is the passage pane.

Two ways to get this wrong, both actually shipped:
- **No `<br><br>` at all** → the whole question (passage + prompt) renders in a single
  un-split column with no visual divider, indistinguishable from a Math question.
- **The `<br><br>` in the wrong place** → e.g. a "Note: Figure not drawn to scale." line
  or an explanatory reasoning paragraph ends up stranded on the question (right) side
  instead of with the passage. Rule of thumb: **only the final interrogative sentence
  itself** (the "Which choice...?" / "What is the value of...?" line) belongs after the
  last `<br><br>`. Everything else — the stimulus, any table/image, any reasoning
  paragraph building up to the question, even a fill-in-the-blank sentence the reasoning
  paragraph ends with — goes before it, on the passage side.
- Note-list questions using `<ul><li>` need `<br><br>` between `</ul>` and the following
  sentence too, not a single `<br>` and not nothing.

### 4. "Note: Figure not drawn to scale." ordering.

Convention: figure → description sentence(s) → "Note: Figure not drawn to scale." →
question sentence. NOT figure → note → description (reads backwards). If the source
places the note differently, still normalize to this order for consistency with the rest
of the platform.

### 5. Math variable italics — be consistent, and know the exceptions.

Every math variable (single letters used as variables, not English words) should be
italicized every time it appears: `<i>x</i>`, `<i>n</i>`, etc. Two hard exceptions:
- **Lowercase `a` is never italicized**, anywhere on this platform — it's visually
  indistinguishable from the English article "a" when italicized, so the deliberate
  convention is to leave it plain even when it actually is a variable/constant.
  Uppercase `A` (a point label, a circle's name, etc.) does NOT have this problem and
  gets italicized normally.
- **`i`/`I` are never italicized** — collides with the pronoun "I" and roman-numeral
  statement labels ("Statement I").
- Geometry point-label sequences (triangle "ABC", quadrilateral "DEFG") get each letter
  wrapped individually — `<i>A</i><i>B</i><i>C</i>`, not one `<i>ABC</i>` block. But a
  **2-letter run naming a segment length** (e.g. "RS = 20" for the distance between
  points R and S) stays plain, un-italicized — that's the established convention even
  when both letters are independently italicized elsewhere in the same sentence as point
  labels. Only 3+-letter runs (actual shape names) get split.
- Coefficient-attached variables get just the letter wrapped, not the digit:
  `3<i>x</i>`, not `<i>3x</i>`.

### 6. Exponents: never leave a literal `^` in the text.

Convert `x^2` style calculator notation to a real `<sup>`: `<i>x</i><sup>2</sup>`. For
exponents that are themselves expressions (`x^(2y-1)`), still use `<sup>` and italicize
any variable letters inside it. **Do not** nest a stacked-fraction widget (the
`inline-flex; flex-direction:column` numerator/denominator span used for regular
fractions in running text) inside a `<sup>` for a rational exponent like x^(14/3) — it
can render fine visually but is fragile: flex-column children serialize onto separate
lines when the text is copy-pasted, which reads as completely broken when someone quotes
it back to you. For a fractional exponent, just write the fraction as plain inline text
inside the sup: `<sup>14/3</sup>`, not a stacked widget.

### 7. Never build a fraction with a blind regex over the whole file.

An earlier session had a global "convert `a/b` to a stacked fraction" pass that corrupted
content it shouldn't have touched, repeatedly, because "/" shows up in things that are
not fractions:
- Text labels with a slash, like "Magazines/brochures" or "Other/none of the above" —
  got wrongly stacked into a fraction widget.
- Decimal PAIRS separated by a slash meaning "two different values", like "83.0/84.7"
  (a country's 2012 and 2013 figures written as one string) — the regex grabbed a
  fragment across the decimal point and truncated the rest.
- Genuine DIVISION expressions like "2.34/1.3 = 1.80" or "1.00/1.60 = 62.5%" — same
  truncation.
- A radical/rational expression with an internal "/", like "cube root of (n^11 · p^25))
  / 5" — truncated mid-expression, losing the closing parenthesis and everything after.

If you ever write a fraction-conversion pass, scope it tightly (only touch a `/`
that's unambiguously between two short numeric or single-variable tokens with no other
punctuation nearby) and spot-check a broad, randomized sample of the diffs before
applying — not just the first few. Better yet, just hand-write each fraction span
individually when transcribing a new test rather than running a blanket regex.

Related: **after transcribing, run a paren-balance check on every fraction span** —
count `(` vs `)` inside each numerator/denominator `<span>`. An imbalance is a reliable
signal of exactly this kind of truncation bug. This caught multiple real corruptions this
session that were otherwise invisible in a normal read-through.

### 8. Two blanks in one R&W question stem — check they're not duplicating text.

A legitimate paired-blank question has choices that explicitly fill BOTH slots at once,
e.g. choices like `"testimonies ... refugees"` for a stem with two `______` blanks. That
is fine. What's NOT fine, and did ship once: a stem with two blanks where the text
BETWEEN them duplicates text that ALSO appears inside every answer choice, producing a
nonsensical doubled-up sentence when assembled. If you write a two-blank question, always
mentally assemble the full sentence with each choice substituted in and confirm it reads
correctly and non-redundantly.

### 9. Cross-Text Connections passages: bold the labels.

Any question with a "Text 1" / "Text 2" structure (two grounding passages being
compared) should have both literal occurrences of "Text 1" and "Text 2" wrapped in
`<b>...</b>`, every time they appear — including when referenced again inside the
question itself ("how would the author of Text 2 respond to Text 1's claim?").

### 10. Use real Unicode math symbols, never spelled-out words or ASCII approximations.

`√` not `sqrt(...)` or `sqrt[...]`. `π` not `pi`. `≥` `≤` `≠` `°` not `>=` `<=` `!=`
`deg`. This platform already has these characters in use everywhere — check for and
follow the existing convention rather than typing out the word.

## Verification checklist (run after transcribing each batch of questions)

```bash
node --check portal/practice-tests.js
```

Question counts per module (22 math / 27 R&W):
```bash
node -e "
global.window = {};
const fs = require('fs');
eval(fs.readFileSync('portal/practice-tests.js','utf8'));
for (const t of window.SAT_PRACTICE_TESTS) {
  for (const sec of ['math','readingWriting']) {
    for (const mod of ['module1','module2Easier','module2Harder']) {
      const exp = sec==='math'?22:27;
      const n = t.sections[sec][mod].length;
      if (n!==exp) console.log('BAD', t.id, sec, mod, n);
    }
  }
}
console.log('done');
"
```

No `<i>` (or other breakout tag) inside SVG `<text>`:
```bash
grep -o '<text[^>]*><i>' portal/practice-tests.js
```

No bare `<table>` missing its class:
```bash
grep -o '<table>' portal/practice-tests.js
```

No leftover caret exponents:
```bash
grep -o '\^[a-zA-Z0-9(]' portal/practice-tests.js
```

No literal "sqrt" or "pi" (should be √/π) — careful, this needs eyeballing since "pi"
can be a false-positive substring:
```bash
grep -o 'sqrt' portal/practice-tests.js
grep -o '\bpi\b' portal/practice-tests.js
```

Fraction-span paren balance:
```bash
node -e "
const fs = require('fs');
global.window = {};
eval(fs.readFileSync('portal/practice-tests.js','utf8'));
function checkFracSpans(text, path) {
  const re = /<span style=\"border-bottom:1px solid currentColor;padding:0 0\.25em;\">([^<]*)<\/span><span style=\"padding:0 0\.25em;\">([^<]*)<\/span>/g;
  let m;
  while ((m = re.exec(text))) {
    for (const part of [m[1], m[2]]) {
      const opens = (part.match(/\(/g)||[]).length;
      const closes = (part.match(/\)/g)||[]).length;
      if (opens !== closes) console.log(path, 'UNBALANCED:', JSON.stringify(part));
    }
  }
}
function scan(obj, path) {
  if (typeof obj === 'string') { checkFracSpans(obj, path); return; }
  if (Array.isArray(obj)) { obj.forEach((v,i)=>scan(v, path+'['+i+']')); return; }
  if (obj && typeof obj === 'object') { for (const k in obj) scan(obj[k], path+'.'+k); }
}
scan(window.SAT_PRACTICE_TESTS, 'SAT_PRACTICE_TESTS');
console.log('done');
"
```

Missing R&W split-pane divider:
```bash
node -e "
global.window = {};
const fs = require('fs');
eval(fs.readFileSync('portal/practice-tests.js','utf8'));
for (const t of window.SAT_PRACTICE_TESTS) {
  let missing=0;
  ['module1','module2Easier','module2Harder'].forEach(mod=>{
    t.sections.readingWriting[mod].forEach(q=>{ if (!q.text.includes('<br><br>')) missing++; });
  });
  console.log(t.id, 'missing:', missing);
}
"
```

**After every batch of edits, visually verify at least the figures.** Build a small
standalone HTML file that loads `portal/banks.js` + `portal/practice-tests.js` and
renders each new question's `text` directly (see any earlier session's scratchpad for
the pattern) — open it in the Browser pane preview and actually look at it. Reading the
raw HTML string is not sufficient to catch a broken SVG; you have to render it.

## How to safely edit the file (mechanics, not content)

- Build replacements as `[oldText, newText]` pairs using the plain decoded text (not
  pre-escaped), then apply with a small Node script that does
  `JSON.stringify(text).slice(1,-1)` to get the correctly-escaped literal — **the
  `.slice(1,-1)` matters**: `JSON.stringify` wraps the whole string in its own quotes,
  which must be stripped when you're matching a substring inside a larger JSON string
  field rather than an entire field value. Forgetting this strip causes silent
  "not found" failures.
- Verify occurrence `count` before writing — if a fix matches more than expected, that
  usually means the same text also appears as a duplicate `module2Easier`/`module2Harder`
  copy (expected, both get fixed at once) or, less innocently, has accidentally matched
  unrelated content elsewhere (like the file's own header-comment documentation, which
  happened once with a bolding fix) — check before assuming it's fine.
- Never do a blind `.replace()` across the WHOLE raw file for a broad pattern without
  first checking how many matches exist and reviewing a sample — the file's header
  comment block (documentation, not question content) is plain text too and can get
  swept up in a naive regex just like real question content.
- Never write raw unescaped `"` characters directly into a splice — always go through
  `JSON.stringify`.
- Commit incrementally, one coherent fix (or one test) per commit, not one giant
  unverified pass.

## When you're done, delete this file (or ask Luca if he wants it kept as permanent docs).
