# Handoff — Next Session

## Where things stand

This session added the **Account Settings screen** (see below) — code is
written and browser-verified against mocked/seeded state, but **not yet
committed** (Luca commits periodically himself; check `git status` before
assuming otherwise) and **not tested against the real Apps Script backend**.

- **`Code.gs` has NOT been redeployed.** On top of everything from the prior
  session (score history sync, guardian columns + biweekly trigger, baseline
  score fields, onboarding prefs), this session added `guardianName`/
  `guardianEmail` to `handleAuth`'s return object. None of it is live until
  it's pasted into the Apps Script project and redeployed as a new version
  (Deploy → Manage deployments → edit existing → new version).
- **Nothing has been tested against the real backend or a real key.** All
  verification (this session and last) was done either with local
  mocked/seeded state (sessionStorage injection + a stubbed `fetch`) or a
  local static file server — never a real `fetch` to the live Apps Script
  URL. Do a real end-to-end run (real key, real save, confirm the Sheet
  actually updates) before trusting any of this with an actual student.
- If the guardian biweekly email is something Luca wants live, `Code.gs`'s
  `setupGuardianSummaryTrigger` still needs to be run once manually from the
  Apps Script function dropdown — it's written but not switched on.

The other thing Luca asked for next — a **full revamp of the score report**
(`portal/report.html`) — is scoped/investigated but **not started**. See
section 2 below.

---

## 1. Account Settings screen — DONE (pending redeploy + real-backend test)

Reachable from the profile dropdown top-right (`#nav-profile-settings`,
"Account Settings", above "Use a different key"). Lands on a new
`#screen-settings` (`portal/index.html`), which reuses the exact
`.onb-accom-cards`/`.onb-accom-sub`/`.onb-accom-opt` card-toggle markup and
validation from onboarding, under fresh `settings*` ids so they don't
collide with the onboarding pane's `onb*` ids. Covers all four fields in one
screen (test date, accommodations, baseline score, guardian contact),
pre-filled from `currentStudent` each time it's opened
(`openSettingsScreen()`), saved together in a single `saveOnboardingPrefs`
call (`#settings-save`'s click handler) — unlike onboarding, which submits
one field group per step.

What changed, concretely:
- `portal/Code.gs` `handleAuth`: added `guardianName`/`guardianEmail` to the
  return object (previously write-only).
- `portal/index.html`: new `#screen-settings` block, `.settings-section` CSS,
  `#nav-profile-settings` menu item, and a JS block (search "ACCOUNT
  SETTINGS" in the script) with the card handlers, `openSettingsScreen()`,
  and the save handler. `settle()` and the resume-state restore path both
  now carry `guardianName`/`guardianEmail` onto `currentStudent`.

Verified this session (local mocked state + a stubbed `window.fetch`, via
a local `python3 -m http.server`):
- All five fields pre-fill correctly from a seeded `currentStudent`
  (including guardian name/email, which needed the `handleAuth` change
  above to round-trip at all).
- Save sends the expected `saveOnboardingPrefs` payload, updates
  `currentStudent` + `sessionStorage` immediately, and the Home screen's
  Score Progress chart baseline point re-renders live off the new baseline
  score (1200 → 1230 after bumping the RW score) — confirms the "editing
  retroactively affects the chart" behavior mentioned in the prior write-up
  is correct/intentional, not a bug.
- Guardian email format validation blocks save and shows the inline error,
  same as onboarding's version of the same check.
- "Back to menu" returns to `screen-menu` cleanly; the screen is
  deliberately **not** in `SIDEBAR_SCREENS`/`isGrantedLocked()` gating (it's
  account management, always reachable, doesn't get swept into the 3-day
  new-key hold that hides Your Overview/Practice Tests) — decided instead of
  defaulted, per the open question from last time.

Not yet done / worth a look next session:
- No real-backend save has been attempted — the `postToBackend` call path is
  unexercised against the actual Apps Script URL.
- No explicit test of the "not sure yet" test-date path or of unchecking an
  already-set accommodation/baseline/guardian card (i.e. going from "has a
  value" back to "skip this") — worth a quick pass to confirm those write
  nulls correctly rather than silently no-op-ing on Code.gs's per-field
  guards.

---

## 2. Score report revamp (`portal/report.html`)

Luca's ask: **(a)** cleaner appearance, brought in line with the rest of the
site's current look, and **(b)** more useful timing-behavior analysis —
specifically things like a student spending too little/too much time on
questions on their initial pass, and not using all the time allotted for a
section. This maps closely to the kind of thing Luca already writes by hand
in his own parent emails (see the guardian-email conversation earlier this
session) — late-night testing, leftover clock time, guessing instead of
working through or flagging, zero flag usage despite missed questions.

### Current state — read this before assuming a rebuild is needed

`report.html` is a real, fairly built-out page (~2000 lines) — **not** a
bare-bones stub. Worth actually opening and reading it fully before deciding
how much of it to keep vs. replace:

- It already uses the site's real palette and type (`--red:#B0271C`,
  `--gold:#C9A84C`, Caladea/Poppins) — it is not wildly off-brand today, so
  "cleaner, matching the website" is more likely a refinement/polish pass
  than a from-scratch redesign. Confirm this by actually looking at it
  rendered, not just the CSS variables.
- It already has **some** timing analysis: a per-section breakdown of "Time
  on Module," "Time on Correct," "Time on Incorrect" (search `sc-time-item`
  in the file). So raw per-question timing is already being surfaced in
  *some* form — the ask is for something more pointed/behavioral, not
  introducing timing data to a page that has none.
- It already has a "Bridge to Target" score-goal feature, per-question
  expandable detail rows, and a "raw" fallback view — there's real
  functionality here to understand before touching it.

### What data is already flowing into the report vs. what's missing

The report is built from a base64 JSON payload in the URL hash
(`report.html#d=...`), constructed in `index.html`'s `finishDiagnostic()`
(search `var payload = {` near the `reportLink` construction). Per section,
today's payload already includes:

- `a` — answers, `m` — ever-flagged-for-review (not just final state),
  `v` — module 2 variant
- `tm` — **total** ms spent per question (cumulative across every visit, not
  just the first pass — see caveat below)
- `fv` / `lv` — Date.now() timestamps of first-visited / last-viewed, per
  question

**Not currently in the payload, and needed for "unused time" analysis:**
the section's actual time limit in minutes. `index.html` has this
client-side (`SECTION_MODULE_TIME_LIMITS` / `PRACTICE_MODULE_TIME_LIMITS`),
it's just never included in what gets sent to the report. Simplest fix:
add a `tl: <minutes>` (or similar) field per section to the payload in
`finishDiagnostic()`, rather than hardcoding a duplicate copy of the time
limits table inside `report.html` (that's exactly the kind of "two
hand-maintained copies of the same data" trap flagged elsewhere in this
codebase's own comments — e.g. the SAT test-dates list).

**Important caveat for "initial go-around" timing specifically:** `tm`
(`questionTimeMs` client-side) is a **running total across every visit** to
a question, not a first-pass-only figure — a student who spent 8 seconds on
first pass, skipped it, then came back later and spent 40 more seconds shows
up as `tm: 48000`, indistinguishable from someone who spent 48 seconds in
one sitting. `fv`/`lv` tell you *when* the first and last visits happened,
but not how long the first visit itself lasted. **Real "rushed on the first
pass" detection needs new client-side tracking** — e.g. a
`questionFirstVisitTimeMs` array recorded separately from the cumulative
`questionTimeMs`, captured the first time a question is left (not every
time). This is a real, scoped addition to `index.html`'s diagnostic engine,
not just a report.html display change — flag this clearly before promising
"first pass" timing analysis specifically, since the data doesn't fully
support it yet.

### Concrete analysis ideas (from Luca's own real emails, see earlier
this session's guardian-email conversation for the full example)

- Section time left unused at submission (needs the `tl` field above) —
  **DONE this session**, see below.
- Count of questions answered very quickly (a rushed/guessed proxy) —
  already possible today from `tm` alone, no new tracking needed. (Already
  implemented pre-session as the "Pacing flag" behavior check — see
  `RUSHED_REL`/`rushedWrong` in report.html.)
- Zero (or low) flag usage despite missed questions — already possible
  today from `m` (everMarked) cross-referenced with wrong answers. (Already
  implemented pre-session — see the `markedT === 0 && totalQ >= 40` check.)
- Time-of-day the attempt happened — NOT currently in the payload at all;
  `dt` is just a date, not a time. Would need a real timestamp added. **Not
  done — still open, see below.**
- "First pass" rushing/lingering specifically — needs the new tracking
  described above; don't build this one without adding that field first,
  or it'll be measuring the wrong thing. **Not done — still open.**

### Unused section time — DONE this session

Implemented the one item flagged above as fully spec'd and low-risk to add:

- `portal/index.html`'s `finishDiagnostic()`: added an `allottedMinutesFor()`
  helper and a `tl` field per section in the report payload — total minutes
  allotted for that section (both modules combined, scaled by whatever
  extended-time accommodation was actually in effect when the section was
  taken). Computed at submission time from `SECTION_MODULE_TIME_LIMITS`/
  `PRACTICE_MODULE_TIME_LIMITS` + `accommodations.timeMult`, the same inputs
  `enterModule()` already uses to set the real countdown timer — no new
  per-module state tracking needed, since it's a pure function of section
  key + accommodation multiplier and neither changes mid-attempt.
- `portal/report.html`: reads `sec.tl` into `timeAllottedMin` on each
  section (and splits it evenly per module for a two-module SAT
  section/card, matching how the real per-module clock works). Two visible
  results: (1) each section card's timing row now shows an "Unused" stat
  (e.g. "13m 41s of 32m") alongside the existing Time On Section/Correct/
  Incorrect stats, colored red once unused time hits 15%+ of the allotment;
  (2) a new "Unused time" flag in the Test-Taking Behavior section, firing
  per section when ≥5 minutes AND ≥15% of the section's clock went unused
  AND at least one question there was missed (so a fast-but-perfect section
  doesn't get flagged as a problem).
- Demo mode (`report.html?demo=1`) generates a synthetic `tl` per section too
  (via a new `demoAllottedMinutes()` helper mirroring the real minutes
  table), so the feature is actually exercisable/visible without a real
  diagnostic attempt.
- Backward compatible: a report saved before this change simply has no `tl`
  field, which reads as `timeAllottedMin: 0` — every new check is gated on
  `timeAllottedMin > 0`, so old reports render exactly as before with no
  errors and no unused-time line.
- Verified via `?demo=1&test=SAT` and the default (ACT) demo in-browser: no
  console errors, "Unused" stat renders correctly per module, and the new
  behavior flags fire with sensible numbers. **Not tested against a real
  saved diagnostic** — the `tl` field only gets populated on a diagnostic
  taken AFTER `Code.gs`/`index.html` are redeployed; anything taken before
  that (or already sitting in a saved report link) won't have it.

### Still open for a future session

- **Time-of-day tracking.** `data.dt` is date-only; add a real timestamp
  (e.g. `data.ts` = ISO string) alongside it in the payload, then a
  report.html read like "attempt started at 11:40 PM" for a late-night
  pattern. Small, low-risk addition, same shape as the `tl` work above —
  a reasonable next pick.
- **"First pass" rushing/lingering.** Needs new client-side tracking in
  index.html's diagnostic engine (a `questionFirstVisitTimeMs`-style array,
  captured once per question on first departure, separate from the
  cumulative `questionTimeMs`) — a real change to the diagnostic-taking
  code path itself, not just a report.html display change. Higher risk;
  test carefully against a real in-progress diagnostic (resume-after-
  refresh especially) before trusting it.
- **Visual polish pass — DONE this session**, see below.

### Visual polish pass — DONE this session

Two concrete fixes, found by actually opening the rendered page rather than
just reading the CSS:

- **Section-card timing row rebalanced.** Adding the "Unused" stat (see
  above) made `.sc-time` a 4-item row; it's a flex-wrap container, so it
  wrapped as an unbalanced 3-then-1. Changed to a `grid-template-columns:
  repeat(auto-fit, minmax(90px, 1fr))`, which lays out as a clean 2×2 for
  both a two-module SAT card (4 stats) and a single-module ACT card (also 4
  stats, since Unused was added there too) without changing anything for a
  report that predates the Unused stat (3 items, still wraps sensibly).
- **Mobile layout — the bigger find.** `report.html` had zero responsive
  handling: `.page` is a fixed `width: 8.5in` (816px) because the whole page
  doubles as the Print/PDF target, and that fixed width was being served to
  every viewport, phone included. Since this report is emailed to parents
  as a link (see `reportLink` in index.html) and a parent is at least as
  likely to open it on a phone first as to ever print it, that meant every
  mobile visit landed on a tiny, force-zoomed, horizontally-scrolling
  miniature of a print page — probably the single biggest "doesn't look
  clean" issue on this page, and not one that shows up just from reading
  the CSS variables. Added a `@media screen and (max-width: 700px)` block
  (kept fully separate from the existing `@media print` block — different
  context, doesn't touch print or the >700px desktop layout) that:
  - lets `.page` go fluid-width instead of a fixed 816px, with smaller
    padding/margins and a smaller header/logo, so the existing content
    (score tiles, section cards) reflows through the flex-wrap/grid
    auto-fit rules that were already there — no changes needed to those,
    they just needed room to actually collapse to one column;
  - gives the two genuinely fixed-width children — the bridge/waterfall
    canvas chart (≥620px by design, see `drawBridge`) and the raw
    question-detail table on page 2 — their own local `overflow-x: auto`
    scroll box instead of blowing out the whole page's width;
  - explicitly resets `white-space: normal` on the expanded question-detail
    prose (`.q-detail`), which sits inside a `<td>` of that now-nowrap
    table — without this override, an opened question's text and answer
    choices would render as one unreadable horizontal line.
  Verified at 375×812 (mobile preset) on both the SAT and ACT demos:
  `document.documentElement.scrollWidth` matches `window.innerWidth`
  (no page-wide horizontal overflow) both collapsed and with the raw
  detail table expanded, the bridge chart scrolls locally, and an expanded
  question's text wraps normally. Desktop/print re-verified unchanged
  after the addition (screenshots at 1000px+ match pre-change layout).

---

## Suggested order for next session

1. Redeploy `Code.gs` and do a real end-to-end test (see "Where things
   stand" at the top) — nothing added across the last three sessions is
   live yet, and the unused-time feature specifically needs a diagnostic
   taken post-redeploy to ever show real (non-demo) data.
2. Time-of-day tracking is the next small, contained report.html addition
   if more timing analysis is wanted.
3. First-pass rushing/lingering is the one large remaining piece — it
   touches the diagnostic engine itself (new per-question tracking), not
   just report.html, and deserves careful testing (especially the
   resume-after-refresh path) before trusting it.
