# Handoff — SAT Practice Test QA, Tests 5 & 6 figures (delete this file once done)

Tests 7, 8, and 9 are now fully done (this session). Only Tests 5 & 6 remain, and they're
the hardest of the batch — read this whole file before starting.

## Context you need

- Main file: `portal/practice-tests.js` — a single JS array `window.SAT_PRACTICE_TESTS`,
  one object per test. Read the big header comment at the top first — it documents the
  schema and provenance of every test.
- Portal login for manual testing: access key `XOR7778`. Dev server: Browser pane's
  `preview_start` with `{name: "static-site"}`, then navigate to `/portal/index.html`.
- Git: only `portal/practice-tests.js` and `portal/assets/practice-test-figures/**` should
  be touched for this work. **Push auth is broken** (stale GitHub HTTPS token) — commit
  locally, tell Luca to push via GitHub Desktop or re-auth `git push` himself. Don't try to
  fix auth yourself with a pasted token.

## What's done (Tests 7, 8, 9 — don't redo)

All three fully cleaned up and committed (3 commits on `main`, not yet pushed — see git
auth note above). Method used, which worked well and should be reused for Tests 5/6 where
applicable:

1. Ran the detector script (below) to list flagged questions per test.
2. For each test, figured out the `module2Easier` → `module2Harder`/`module1` position
   mapping by comparing stripped question text (see "Position mapping" below) — this
   showed most `module2Easier` flags were literal duplicates of already-flagged
   `module1`/`module2Harder` questions, so fixing one source fixed both locations at once
   (confirmed via the apply script's "replacing N occurrences" output — N=2 means it hit
   both copies).
3. For each remaining unique flagged question: read the full question text, decide if it's
   a **false positive** (the question mentions "graph"/"table"/"figure" in passing but
   every number needed to solve it is already in the prose — very common, e.g. "the graph
   of a line through (0,5) and (12,0)"), a **pure data table** (build a real `<table
   class="dx-table">` directly — safe since it's just transcribing given numbers), or a
   **real figure/graph** (crop it from the source PDF as an image — this is what Luca
   explicitly wants, not hand-drawn SVG reconstructions).
4. For real figures: used `pdftotext -layout` on the whole source PDF once, split on
   `\f` (form feed = page break) in Python, then grepped for a distinctive phrase from the
   question to find the exact PDF page number instantly, instead of paging through images
   one by one. Then `pdftoppm -png -r 170-200 -f N -l N <pdf> out` to render just that page,
   viewed it with Read, cropped the figure region with PIL, saved as grayscale PNG to
   `portal/assets/practice-test-figures/test<N>/`, and referenced it with a plain `<img
   src="assets/practice-test-figures/test<N>/name.png" style="display:block;margin:0.5em
   auto;max-width:...px;width:100%;">` prepended to the question text.
5. Applied all text edits through a small Node script (`apply_fix.js` pattern below) that
   does `JSON.stringify(oldText)` / `JSON.stringify(newText)` and a literal string
   `.split(oldLit).join(newLit)` on the raw file — NOT regex, NOT manual escaping. This
   guarantees correct JSON-string escaping and lets you verify occurrence counts before
   writing (it aborts with nothing written if any old string isn't found — safe to retry).
6. `node --check portal/practice-tests.js` after every batch, plus the module-count
   verifier (both scripts below).

Two items were left deliberately unfixed because the source text itself was ambiguous
about the exact geometric layout (not just missing an image) — drawing a guessed diagram
risked being actively wrong, so they're flagged for Luca instead:
- Test 8 `math/module2Easier#10` — a lines/angles figure whose own stem says line ℓ
  crosses line *n* at a right angle, but the answer explanation says line *m*. Needs Luca
  to check the real source and say which is correct before a diagram can be drawn.
- Test 9 `math/module2Easier#14` — a transversal + right-triangle figure with more than
  one geometrically valid layout matching the prose. The question is fully solvable from
  the given angle values (130°, a°, b°) without a diagram, so nothing is broken by leaving
  it as text-only; a diagram is a nice-to-have if Luca can point to the source.

Also fixed in passing (not part of the original figure-hunt, found while working nearby):
- A bug from an earlier session's fraction-formatting regex had mistakenly converted two
  non-fraction text labels ("Magazines/brochures", "Other/none of the above" in a Test 9
  survey table) into stacked-fraction HTML. Fixed to plain text.
- A genuine transcription error in Test 9's dot-plot question: the text claimed each of
  10–14 "occur exactly 4 times," but the real source image shows 5/4/2/4/5. Corrected the
  text to match the actual image (verified the answer is unaffected either way).

## What's NOT done — Tests 5 & 6 (the remaining work)

**Detector script** (re-run any time, list shrinks as you fix things):

```bash
node -e "
const fs = require('fs');
global.window = {};
eval(fs.readFileSync('portal/practice-tests.js','utf8'));
const tests = window.SAT_PRACTICE_TESTS;
const refPattern = /\b(figure|graph|table|chart|shown above|shown below|scatterplot|dot plot|bar graph|line graph)\b/i;
for (const t of tests) {
  if (!['sat-practice-5','sat-practice-6'].includes(t.id)) continue;
  let flagged = [];
  for (const sec of ['math','readingWriting']) {
    for (const mod of ['module1','module2Easier','module2Harder']) {
      t.sections[sec][mod].forEach((q,i) => {
        const hasVisual = /<svg|<table|<img/i.test(q.text);
        const refsVisual = refPattern.test(q.text);
        if (refsVisual && !hasVisual) flagged.push(sec+'/'+mod+'#'+(i+1));
      });
    }
  }
  console.log(t.id, flagged.length, flagged.join(', '));
}
"
```

As of this handoff: **Test5 = 22 flagged, Test6 = 19 flagged** (41 total; expect some
false positives once you read them, same as Tests 7-9 — roughly a third of flagged items
in each test turned out to need no image at all).

### Why Tests 5 & 6 are harder than 7/8/9

Tests 7, 8, 9 each came from ONE linear PDF practice test with exact page ranges, so
finding a figure was "look up the page number, crop it." Tests 5 & 6 are different: **every
question in module1, module2Harder, AND module2Easier is independently drawn from a shared
pool** (see the header comment in `practice-tests.js`, Test 5 & 6 provenance paragraphs) —
there is no `module1`/`module2Harder` unmodified-source relationship to exploit, so the
"fix one position, it propagates to module2Easier automatically" shortcut from Tests 7-9
mostly won't apply here. Confirmed this session: comparing stripped question text between
`module2Easier` and `module2Harder`/`module1` for Tests 5/6 found only 0-2 overlapping
questions per test/section (vs. 15-18 for Tests 7-9) — so budget for fixing each flagged
item essentially independently, ~41 separate lookups, not ~15.

**Two source pools, no direct page map:**

1. **College Board digital Question Bank refresh PDFs** (`/Users/lucamoretti/Downloads/New
   Question Bank Questions (August 2026)/` — `Copy of new_math_questions_only.pdf`,
   `Copy of new_rw_questions_only.pdf`, plus `_with_answers` versions). Match by content:
   `pdftotext -layout` the PDF once, search for a distinctive phrase/number from the
   flagged question's text to find its page (same trick used for Tests 7-9, just without a
   pre-known page range — search the whole PDF).
2. **`test_prep.db`** SQLite DB at `/Volumes/ZIGGY/Tutoring/Subjects/Test Prep/Question
   Bank App/test_prep.db`, table `questions` (columns: `stem_text`, `choices_text`,
   `correct_answer`, `image_path`, `has_figure`, etc.), with real question **image files**
   sitting in the sibling `images/` folder. Match by content — `sqlite3` `LIKE` queries on
   distinctive substrings from the flagged question's stem worked well this session (e.g.
   `WHERE stem_text LIKE '%distinctive phrase%'`). **Important gotcha found this session:
   the `image_path` column value in the DB row does NOT reliably match the actual filename
   on disk** — e.g. DB said `Math_Advanced_Math_Nonlinear_Functions_q50418728.png` but the
   real file was `Advanced_Nonlinear_Functions_q50418728.png` (different prefix). Always
   verify with `find images/ -iname "*<the 8-char hex id>*"` rather than trusting
   `image_path` directly. The hex ID after `q` is the reliable anchor.
3. If a question isn't found in either pool after a genuine search (try a few distinctive
   substrings, not just one), and every number needed to solve it is already given in the
   prose (like the Test 7 gift-bar-chart case), it's safe to hand-build an accurate SVG or
   `<table>` from the exact stated values — this is NOT the same as guessing an unknown
   figure, it's just visualizing data that's already fully specified in text. If the figure
   has any real ambiguity (multiple valid layouts, or the text contradicts itself the way
   Test 8's ME#10 did), leave it and flag for Luca rather than guess — don't force it.

### Recommended approach

Same as Tests 7-9: work test-by-test, one flagged item at a time. For each: read the full
question text, classify as false-positive / buildable-table / needs-image. For
needs-image, try the refresh PDFs first (`pdftotext` + phrase search), then `test_prep.db`
(`sqlite3` `LIKE` search), then fall back to hand-built SVG/table only if the data is fully
specified in the prose. Verify syntax (`node --check`) after every batch of edits, not
after all 41. Commit per-test like this session did (separate commit for Test 5, separate
for Test 6) so Luca can review incrementally.

## How to safely edit this file

1. **Use the apply-fix pattern, not raw string replace.** Build a JSON file of
   `[[oldText, newText], ...]` pairs (old/new are the plain decoded question text, not
   pre-escaped), then run a script that does `JSON.stringify()` on each to get the exact
   escaped literal as it appears in the file, and `raw.split(oldLit).join(newLit)` to
   replace — this handles escaping correctly and is idempotent/safe to retry (nothing is
   written until every pair in the batch is found). Example script used this session:
   ```js
   const fs = require('fs');
   const fixes = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
   let raw = fs.readFileSync('portal/practice-tests.js', 'utf8');
   for (const [oldText, newText] of fixes) {
     const oldLit = JSON.stringify(oldText), newLit = JSON.stringify(newText);
     const count = raw.split(oldLit).length - 1;
     if (count === 0) { console.error('NOT FOUND:', oldText.slice(0,60)); process.exit(1); }
     console.log('Replacing', count, 'occurrence(s) of:', oldText.slice(0,60));
     raw = raw.split(oldLit).join(newLit);
   }
   fs.writeFileSync('portal/practice-tests.js', raw);
   ```
   A "Replacing 2 occurrence(s)" result on a `module2Harder` fix usually means it also hit
   an identical `module2Easier` copy — that's expected and good, not a bug.
2. **Never hand-write escaped JSON strings or do raw `.replace()` with unescaped `"`
   characters** — this bit the very first session on this file.
3. **Always run `node --check portal/practice-tests.js`** after every batch, and verify
   question counts (22 math / 27 R&W per module per test) with:
   ```bash
   node -e "
   const fs = require('fs');
   global.window = {};
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

## Established conventions (for consistency)

- Figures: real cropped image, grayscale PNG, saved to
  `portal/assets/practice-test-figures/test<N>/<name>.png`, referenced as
  `<img src="assets/practice-test-figures/test<N>/<name>.png" alt="..." style="display:block;
  margin:0.5em auto;max-width:XXXpx;width:100%;">` prepended before the question prose
  (keep a short "shown above"-style rephrase of the prose after the image, don't just leave
  the old prose-description text — replace the descriptive sentence, keep the actual
  question sentence). `max-width` around 280-420px depending on figure complexity.
- Hand-built SVG (only when no source found AND all data is explicit in the prose):
  `<svg viewBox="..." class="dx-fig" style="color:var(--text);max-width:...px;display:block;
  margin:0.5em auto;">...</svg>`, using `stroke="currentColor"`/`fill="currentColor"` so
  it's theme-aware.
- Tables: `<table class="dx-table" style="margin-left:auto;margin-right:auto;">`.
- Fractions: `<span style="display:inline-flex;flex-direction:column;align-items:center;
  vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;"><span
  style="border-bottom:1px solid currentColor;padding:0 0.25em;">NUMERATOR</span><span
  style="padding:0 0.25em;">DENOMINATOR</span></span> — ONLY for actual numeric fractions,
  never for text labels containing a slash (caught a bug this session where "Magazines/
  brochures" got wrongly converted to this).
- Italics: `<i>` for math variables/function notation/plane-axis refs and book/work titles.
- Paragraph breaks: `<br>` / `<br><br>` — never a literal newline character in a JSON string.

## Still outstanding after Tests 5/6 are done

- Test 8 `math/module2Easier#10` and Test 9 `math/module2Easier#14` — see "What's NOT
  done" above, need Luca's input, not blocking.
- Test 4 R&W M1 Q26/Q27 "exits split-page formatting" bug — unresolved from an earlier
  session, couldn't reproduce in isolation. Needs a screenshot from Luca of what breaks, or
  someone driving the live portal directly to Test 4 → R&W Module 1 → Q26.
- Once Tests 5/6 are done, this file (`HANDOFF_NEXT_SESSION.md`) should be deleted.
