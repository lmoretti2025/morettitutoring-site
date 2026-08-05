# Handoff — SAT Practice Test QA (delete this file once done)

Luca reviewed Tests 4-9 in the live portal and reported a batch of formatting/content bugs.
This session fixed most of them. One large item remains. Read this whole file before doing
anything — it tells you exactly what's left and how to do it.

## Context you need

- Main file: `portal/practice-tests.js` — a single JS array `window.SAT_PRACTICE_TESTS`,
  one object per test (`sat-practice-1` through `sat-practice-9`). Each has
  `sections.math`/`sections.readingWriting`, each with `module1`/`module2Easier`/`module2Harder`
  arrays of question objects. Read the big header comment at the top of that file first — it
  documents the schema and the provenance of every test.
- Portal login for manual testing: access key `XOR7778`. Dev server: use the Browser pane's
  `preview_start` with `{name: "static-site"}` (config already in `.claude/launch.json`), then
  navigate to `/portal/index.html`.
- Git: only `portal/practice-tests.js` should be modified for this work. There's a **git push
  auth problem** — the stored GitHub credentials are stale (HTTPS token auth fails). Don't try to
  fix this yourself with a pasted token (that's a hard boundary — never enter credentials/tokens
  on the user's behalf). Just commit locally and tell Luca to push from GitHub Desktop (already
  installed and open on his machine) or re-auth `git push` himself in a terminal.

## What's already fixed this session (don't redo)

1. **Newline bug** — Tests 5-9 used literal `\n` instead of `<br>` for paragraph breaks, so
   passages rendered with no visual spacing. Fixed across all 351 affected fields.
2. **Math notation italics** — function notation (`f(x)`), `xy`-plane/axis references, line/point/
   triangle/angle labels, and consistent re-mentions of the same variable within a question, now
   render in `<i>`. Applied platform-wide (all 9 tests), 440 questions touched. This was regex-
   based with named-pattern matching, not full per-question review — it's good but not 100%
   coverage (skips bare variable letters in prose that don't match a recognized pattern).
3. **Fractions** — calculator-notation fractions (`1/29`, `55/(x+6)`) converted to real stacked
   HTML fractions (a `<span>` with a `border-bottom` divider). Platform-wide.
4. **Table centering** — all `<table class="dx-table">` in math questions got
   `style="margin-left:auto;margin-right:auto;"`.
5. **R&W title italics** — book/poem/film/artwork titles wrapped in `<i>`, matching Test 1's
   established convention. Found via cue-word pattern (novel/poem/book/film/etc. + capitalized
   phrase). 29 titles across the platform, including 2 genuine gaps that existed even in
   "known good" Tests 1-3 (`Save Me the Waltz`, `Sunshine`). Also propagated into `choices`/
   `choiceNotes` where the same title is restated.
6. **Test 4 specific bugs**, all fixed and verified:
   - R&W M1 Q10: missing `<u>` on the sentence the question asks about — added (verified against
     the answer explanation which choice/sentence it meant).
   - R&W M1 Q14: was a prose-described graph, not an actual figure — rebuilt as a real inline SVG
     bar chart (grouped bars, 2019 vs 2024, matches the data the correct answer needs).
   - R&W M1 Q16, Q17: were prose-described tables — rebuilt as real `<table>` elements using the
     data that was already in the prose.
   - Math Module 2 (Easier AND Harder — same shared figure appears in both): angle labels `a`,
     `b`, `c` in the SVG now show `a°`, `b°`, `c°` to distinguish from point labels.

All of the above is committed. Verify with `node --check portal/practice-tests.js` before and
after any change you make — the splice logic that inserts/replaces test blocks in this file is
hand-written string manipulation, not a proper JSON writer, and it's bitten this session twice
(unescaped quotes when doing raw string replacement; brace-boundary mis-detection when replacing
whole test objects). See "How to safely edit this file" below.

## What's NOT fixed — this is the real remaining work

### 1. Missing figures/graphs/tables across Tests 5-9 (the big one)

Luca's suspicion was confirmed: Tests 5-9 (built via background agents this session) mostly used
**worded descriptions** of figures instead of real inline SVG/HTML, unlike Tests 1-4 which have
actual `<svg class="dx-fig">` diagrams and `<table class="dx-table">` elements.

**Luca's explicit instruction: for these, literally screenshot/crop the actual figure from the
original source and embed it as a real image. Do NOT hand-draw new SVG reconstructions — that
wastes time and risks getting the figure wrong.** (Test 4's Q14/Q16/Q17 fixes above were done as
SVG/table reconstructions because Test 4 has no known recoverable source — that was the exception,
not the pattern to follow for Tests 5-9, which DO have real sources available — see below.)

**Detection**: a heuristic script found every math/RW question whose text mentions
figure/graph/table/chart/scatterplot/etc. but has no `<svg` or `<table` in it. Re-run it any time
(the list will shrink as you fix things) with:

```bash
node -e "
const fs = require('fs');
global.window = {};
eval(fs.readFileSync('portal/practice-tests.js','utf8'));
const tests = window.SAT_PRACTICE_TESTS;
const refPattern = /\b(figure|graph|table|chart|shown above|shown below|scatterplot|dot plot|bar graph|line graph)\b/i;
for (const t of tests) {
  if (!['sat-practice-5','sat-practice-6','sat-practice-7','sat-practice-8','sat-practice-9'].includes(t.id)) continue;
  let flagged = [];
  for (const sec of ['math','readingWriting']) {
    for (const mod of ['module1','module2Easier','module2Harder']) {
      t.sections[sec][mod].forEach((q,i) => {
        const hasVisual = /<svg|<table/i.test(q.text);
        const refsVisual = refPattern.test(q.text);
        if (refsVisual && !hasVisual) flagged.push(sec+'/'+mod+'#'+(i+1));
      });
    }
  }
  console.log(t.id, flagged.length, flagged.join(', '));
}
"
```

As of this handoff: **Test5=22, Test6=19, Test7=~20, Test8=12, Test9=~22 flagged items** (~95
total, though some are false positives — e.g. a question just saying "the value of x" without
actually needing a figure — so eyeball each one, don't blindly fix all of them).

**Sources available per test** (this is the important part — where to get the actual images):

- **Test 7** — sourced from `/Volumes/ZIGGY/Tutoring/Subjects/Test Prep/SAT/Practice Tests/
  Barron_Practice_Test_1_Complete.pdf`. Page map: R&W Module1 = pdf pages 1-11, R&W
  Module2Harder = pdf 12-24, Math Module1 = pdf 25-34, Math Module2Harder = pdf 35-43 (there's a
  1-2 page directions/reference block before each Math module). Read the specific page for a
  flagged question, screenshot/crop the figure region, and embed it — either save a cropped PNG
  into a small `assets/` folder under `portal/` and reference it with `<img src="...">`, or
  (simpler, no new files) just re-read that exact PDF page with the Read tool and describe/copy
  what you see precisely enough to build an accurate `<svg>` from the ACTUAL figure (not a
  guess) — Luca's preference is the literal image, so prefer saving+embedding a real cropped
  image over hand-drawing when you can.
- **Test 8** — `/Volumes/ZIGGY/Tutoring/Subjects/Test Prep/SAT/Practice Tests/
  Princeton_Review_Practice_Test_2_with_Answers.pdf`. Page map: R&W Module1 = pdf 4-25, R&W
  Module2Harder = pdf 43-64, Math Module1 = pdf 65-85, Math Module2Harder = pdf 86-97.
- **Test 9** — `/Volumes/ZIGGY/Tutoring/Subjects/Test Prep/SAT/Practice Tests/
  Princeton_Review_Practice_Test_1_with_Answers.pdf`. Page map: R&W Module1 = pdf 4-25, R&W
  Module2Harder = pdf 45-65, Math Module1 = pdf 67-89, Math Module2Harder = pdf 92-103.
- **Test 5 & 6** — mixed sourcing, harder:
  - Some questions came from `/Volumes/ZIGGY/Tutoring/Subjects/Test Prep/Question Bank App/
    test_prep.db` (a SQLite DB) with real question **image files** in the `images/` folder next
    to it (e.g. `images/Math_Advanced_Math_Nonlinear_Functions_q<id>.png`). If a flagged Test 5/6
    question came from this source, you can find its image by the question ID pattern used in
    that DB (8-char hex IDs) — but the final JSON in `practice-tests.js` doesn't retain the
    original ID, so you'll need to match by question text/content back to the DB
    (`SELECT question_number, stem_text FROM questions WHERE ...`) to find the right image file.
  - Other questions came from College Board's July 2026 Question Bank refresh PDFs in
    `/Users/lucamoretti/Downloads/New Question Bank Questions (August 2026)/` (`Copy of
    new_math_questions_only.pdf`, `Copy of new_rw_questions_only.pdf`, plus `_with_answers`
    versions) — same idea, match by content, find the page, screenshot the figure.
  - This matching-by-content step is genuinely more work for Tests 5/6 than 7/8/9 (where you
    already have exact page numbers). Budget more time here.

**Recommended approach**: work test-by-test. For each flagged item: read the source page, look at
the actual figure, decide whether it's worth a real image crop or whether the question doesn't
actually need one (false positive from the detector — some flagged items are fine as pure text).
Fix directly in `practice-tests.js`, verify syntax after each batch, don't try to do all ~95 in one
giant unverified pass.

### 2. Test 4 R&W M1 Q26/Q27 — unresolved "exits split-page formatting" bug

Luca said these two questions break out of the site's split-page layout. I could not reproduce it:
I extracted the raw HTML for Q26 and rendered it in isolation in a plain div, and it displayed
fine with no overflow (496px content in a 500px container). Both questions use `<ul><li>` note
lists (6 items each) — Test 1 also uses this same list pattern successfully elsewhere, so the tag
itself isn't inherently broken.

**Next step**: get an actual screenshot from Luca of what "breaking the split-page formatting"
looks like on Q26/Q27 specifically (which panel, what breaks, does content overflow/disappear/
misalign), OR log into the live portal yourself (access key `XOR7778`), navigate to SAT Practice
Test 4 → Reading & Writing Module 1 → jump to question 26, and look at it directly — don't just
guess-fix based on the raw HTML, since the isolated test found nothing wrong.

## How to safely edit this file

Learned the hard way this session — two ways this can silently produce a broken file:

1. **Never do raw Python/JS string `.replace()` with content containing unescaped `"` characters**
   directly into the file (e.g. inserting a raw `<svg ... attr="value">` string via plain text
   replace) — the file's questions are JSON string literals, so any `"` you insert must be
   escaped as `\"`. Build replacement content as a Python dict/object and use `json.dumps(...,
   ensure_ascii=False)` to get proper escaping, then splice that in — don't hand-write escaped
   JSON strings.
2. **When replacing a whole test object** (e.g. `{"id": "sat-practice-5", ...}` in full), don't
   find its boundaries with fragile string-pattern search (`content.rfind("\n  }", ...)`) — this
   broke twice on nested closing braces. Instead count braces with proper string-aware parsing
   (skip characters inside JSON string literals so braces in question text don't get counted) to
   find the exact matching `}` for the opening `{`. There's a working `find_object_bounds()`
   function for this — search the shell history / just rewrite it, it's about 20 lines.
3. **Always run `node --check portal/practice-tests.js` after every edit**, and also load it and
   verify counts (22 math / 27 R&W per module per test) with:
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

- Figures: `<svg viewBox="..." class="dx-fig" style="color:var(--text);">...</svg>`, using
  `stroke="currentColor"` / `fill="currentColor"` so it's theme-aware. Or a real embedded image if
  cropped from source (Luca's preference for Tests 5-9's figures — see above).
- Tables: `<table class="dx-table" style="margin-left:auto;margin-right:auto;">`.
- Fractions: `<span style="display:inline-flex;flex-direction:column;align-items:center;
  vertical-align:middle;line-height:1.15;margin:0 0.12em;font-size:0.95em;"><span
  style="border-bottom:1px solid currentColor;padding:0 0.25em;">NUMERATOR</span><span
  style="padding:0 0.25em;">DENOMINATOR</span></span>`.
- Italics: `<i>` for math variables/function notation/plane-axis refs and for book/work titles.
- Paragraph breaks: `<br>` / `<br><br>` — never a literal newline character in a JSON string.
