# Google sign-in — setup and integration

This turns the access key from a password into a **one-time claim code**, and
makes a verified Google identity the credential instead.

Everything new lives in three files that touch nothing existing:

| File | Where it goes |
|---|---|
| `portal/auth.gs` | a **new script file** in the same Apps Script project as `Code.gs` |
| `portal/tests/auth-test.js` | 67 tests — `node portal/tests/auth-test.js` |
| `portal/auth-client.js` | one `<script>` tag in `portal/index.html` |
| `portal/auth-admin.js` | one `<script>` tag in `portal/admin.html` — builds the access panel |

The edits to the three existing files are listed at the end. There are
**nine of them**, all small, and until they are applied nothing changes —
the new files are inert.

---

## How access is granted (the part that matters)

Nobody gets in unless **you** did one of two things.

**1 — You typed their email into the sheet.** If a Google account's verified
email matches the `GrantedEmail` column on a row, that account binds to the
row on the spot. No waiting. This is also what silently migrates your current
students: everyone who has logged in already has a `GrantedEmail`, so their
first Google sign-in just works, with no key and no action from anyone.

### Which of the two should be your default: the key

Door 1 looks like the efficient one. It mostly is not, and it is worth being
clear about why, because the instinct to pre-fill everything is a trap here.

Pre-filling only helps if you correctly guess **which Google account the
student will actually sign in with**. Teenagers routinely have two or three —
a school Workspace account, a personal Gmail, an old one from a games
console. And a *wrong* guess is worse than no guess: it does not degrade to
the approval queue, it hard-blocks them with `email_mismatch`, and the fix is
you editing the sheet. That is a support text at 9pm. The queue costs one tap
and works with whatever account they turn up on.

The approval is also the better verification. Pre-typing an address someone
read to you over the phone confirms nothing. Tapping approve after seeing the
real account's name, address and profile photo confirms quite a lot.

**So: default to handing over the key and approving the request. Pre-fill
`GrantedEmail` only when you are genuinely certain of the address** — a
returning student, a school contract where everyone is on the same Workspace
domain, or a student who volunteered it unprompted.

### Where the parent fits — and the one mistake to avoid

Parents do not get portal accounts. Their place in this system is the
**`GuardianEmail`** column, which drives the weekly Friday progress email.
You already have that address from the lead form; put it there.

Handing the *key* to a parent is completely fine — that is who you are
talking to at signup. What must not happen is the parent **signing in as
themselves** and claiming the row, because then the student cannot get into
their own portal.

Three things guard against it:

- The sign-in screen says the portal is the student's and asks for the
  student's own account, and the key screen names the exact address about to
  be bound, with a "Not the student? Switch account" link next to it.
- If the Google account's **first name** does not match the roster name, the
  approval email is subject-lined `[check]` and carries a highlighted warning
  naming both. Surnames are ignored on purpose — a parent and child share
  one, so matching on surname would mask exactly the case this is for.
  Nicknames (Will/William, Ben/Benjamin) do not trip it.
- If one slips through anyway, **Reset login** in admin undoes it completely:
  clears the pairing, clears the wrong address, kills their sessions, and
  **revokes that address's Drive access to the student's folder**. Clearing a
  cell does not un-share a Drive folder; this does.

**2 — You approved a request.** If the account matches nothing, the portal
asks for the access key. A valid key does **not** let them in. It files a
request and stops. You get an email with their name, key, Google email and
profile photo, and one tap approves. Their screen is polling, so they land in
the portal a second or two after you tap — no refresh, no second visit.

Anything else — no key, wrong key, a key already paired to someone else, a
key with a request already pending on it — gets nothing, and lands in the
`AuthLog` tab.

**A leaked key is now worth almost nothing.** The most it can do is put one
request in front of you, with the leaker's real Google account and photo
attached to it, which you decline.

### "What if they don't have a Google account?"

A Google account does not have to be `@gmail.com`. Anyone can make one on
the address they already use — `accounts.google.com/signup` → **"Use your
existing email."** School Google Workspace accounts already are Google
accounts. The sign-in screen says this, with the link, for anyone who is
stuck. There is deliberately no key-only fallback: that hole is the thing
this change exists to close.

---

## The pipeline, end to end

**A family inquires on the website.** Within 15 minutes a roster row exists
by itself: a generated key, the parent's name and email in
`GuardianName`/`GuardianEmail` (which is what the Friday progress email
runs off), their grade, and `Status: Inquiry`. No Name, so Code.gs creates
no Drive folder for it. The key opens nothing. **An auto-created row is
paperwork, not access** — which is what makes it safe to drive off a public
form.

If the inquiry said *Student* rather than *Parent*, the form's name and
email are the student's own, so those go to `Name` and `GrantedEmail` — and
that student is already on the instant-pairing path. They sign in, no key,
no invite, no approval.

### Families who never touch the website

Most don't. They call, they text, they message on Facebook — and for those
there is no lead, no row, and often **no email address at all**.

That is handled by treating **the link as the invite and email as merely one
way to hand it over**. In the access panel, **+ New student** opens a short
form where the only thing you really need is how to reach them; parent
email, phone, student name and grade are all optional, and you record how
they found you. Then:

| You have | What you get |
|---|---|
| Their email | **Email it to them** — one click, done |
| A phone number or a Messenger thread | **Copy invite link**, or **Copy whole message** — the full text written out, ready to paste |
| Nothing but a phone call | The access key, shown large, to read down the phone — the old key + approval path still works |

A family who never gives you an email still ends up with one on file: the
student's arrives by itself, **verified**, the moment they sign in with
Google — and that is what the Drive folder share runs off. The only thing
you lose by having no parent address is the Friday progress email, and you
can add one whenever they give it to you.

One thing the panel says out loud, because it would otherwise be a nasty
surprise: **minting a new link invalidates the previous one.** That is the
single-use guarantee working correctly, but it means copying a link after
emailing one kills the emailed one.

**They sign up. You click Send invite** — one click, on a row already filled
in. (`mtaSendInvite('BGD2465')`, or `mtaNewStudent('parent@email.com')` first
for anyone who didn't come through the form.) The parent gets an email
saying, plainly, that the link must be opened **by the student** on their
own device with **their own Google account**, because that becomes the login
and is what their files get shared to.

**The student taps it.** The portal asks once more who is signing in — an
"I'm a parent" option hands back a forward-this instruction instead of
continuing. Then Google sign-in, and in that single step:

- their **verified email** lands in `GrantedEmail`
- their Google account id lands in `GoogleSub` (survives them changing their
  address later)
- the Drive folder is created and **shared to that verified address**

That last one is the point: notes and slide decks reach them without anyone
being asked to spell out an address, and without a typo silently sharing
nothing. Then they type their name, the folder is renamed to
`Owen Chen — BGD2465`, and your onboarding sequence runs.

**Every visit after that** they just open the portal and they're in.

### When it goes wrong

- **A parent signs in anyway.** Nothing can block it — the row has no name
  to check against, because you never got one. So instead you are **emailed
  the moment any invite is claimed**, with the name, address and photo. Not
  an approval to tap; an FYI. If it's wrong, **Reset login** clears the
  pairing and the address, kills their sessions, and revokes their Drive
  access, and you send a fresh invite.
- **Link expires** (14 days) or is lost → send another; issuing a new invite
  invalidates the old one.
- **Forwarded to a group chat** → single-use, first claim wins, and you are
  told who. Same exposure as a leaked key today, except undoable in a click.

The access key does not go away. It remains the fallback claim code, with
the approval queue behind it, for anyone who loses an invite or was set up
before this existed.

---

## What this does to the first-login sequence

The onboarding sequence in `index.html` was built around **"this is a brand
new key"**. That premise is gone, and three things follow from it. All three
are handled — this section is so you know what changed and why, not a list of
things left for you to do.

### 1. The trigger moved

It used to fire on `needsEmail`, i.e. *`GrantedEmail` is still blank*. That
signal is now dead: under Google sign-in that cell is filled the moment you
approve a claim — **before the student has ever seen a screen**. They would
have gone straight to the home screen and never been asked for a test date,
a target score, or their accommodations.

The replacement is `needsOnboarding` on the login payload, backed by a new
`OnboardedAt` column stamped the instant a `saveOnboardingPrefs` request
arrives.

It is deliberately *not* inferred from `AccomTimeMult`. That sequence submits
once, at its final beat, fire-and-forget with a `.catch` that swallows
failures — so hanging "have they onboarded?" on that write turns one
swallowed network blip into *replay all nine beats on next login*. Students
who onboarded before `OnboardedAt` existed are still recognised by their
`AccomTimeMult`, so none of your current nine get sent through it again.

### 2. The identity beat is retired, and its job is done elsewhere

`#onb-identity` — the dark name/email capture between the splash and the
welcome — has nothing left to ask.

- **Email** comes from the verified Google account. Better than what the beat
  collected: it is confirmed to exist and to belong to whoever is typing.
  The "please use your main email" nudge is moot.
- **Name** is the part that would quietly have regressed, and did in my first
  pass. That beat enforced *first and last name*; auto-filling from Google
  does not, because Google profile names are whatever the account holder
  typed — `alex`, a nickname, a school login string, sometimes empty. A name
  that fails the old test is now **not** written to the roster; instead the
  sign-in surface asks for it, with the same validation, before handing the
  student to the portal. A name **you** typed is never questioned or
  overwritten.

This matters beyond tidiness: `settle()` and the onboarding welcome both do
`name.split(' ')[0]`, so a blank name renders your greeting as "Hey ."

### 3. A brand-new student may now wait in the middle of it

This is the one genuinely new shape. Before: key → sequence, in one sitting.
Now, for a student whose row has no email on file: sign in → key → **wait for
you** → sequence. The approval can land minutes later, or the next day, in a
different browser session.

So the dark splash is no longer the first thing a new student sees. The
sign-in screen is, and possibly the waiting screen after it. Both are built
from the portal's own `.panel` / `.kicker` / `.panel-hed` classes for that
reason — the waiting screen is now part of your first impression, not an
error page, and it says plainly that nothing is visible to anyone until you
approve.

You can remove the wait for a given student by filling in `GrantedEmail`
first — but see "Which of the two should be your default" above before
making that a habit. For most new students the one-tap approval is both
less work overall and a better check.

### Unchanged

Everything from `#onb-welcome` onward — welcome, pillars, roadmap, test date,
target, baseline, guardian, accommodations, handoff — runs exactly as it does
today, in the same order, saving the same way, with `settle()` still called at
the handoff and nowhere earlier.

### Dead code you can delete later

Once this is live and settled, `goToOnboardIdentity()`, `resetKeyScreen()`,
`trySubmitEmail()`, `callAuth()`, the `#onb-identity` markup and the
`#email-notice` nudge are all unreachable. Leaving them in place costs
nothing; removing them is a separate, safe tidy-up.

---

## Step 1 — Create the OAuth client ID (about four minutes, once)

1. Go to **console.cloud.google.com** and sign in as the same Google account
   that owns the Apps Script and the roster Sheet.
2. Create a project (any name, e.g. *Moretti Portal*) if you do not have one.
3. **APIs & Services → OAuth consent screen.**
   - User type: **External**. *(Internal is only offered to Workspace orgs.)*
   - App name: `Moretti Test Prep Student Portal`
   - User support email and developer contact: your address.
   - Scopes: **add none.** Sign-in needs no scopes at all.
   - Save. You do **not** need to submit for verification: with no scopes
     requested, and using only sign-in, there is no verification gate and no
     100-user test-user cap to worry about.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID.**
   - Application type: **Web application**
   - Name: `Portal web client`
   - **Authorized JavaScript origins** — add these exactly, no trailing slash:
     - `https://morettitutoring.com`
     - `https://www.morettitutoring.com`
   - Leave **Authorized redirect URIs** empty. Google Identity Services
     signs in inside the page; there is no redirect.
   - Create, and copy the **Client ID** (ends in
     `.apps.googleusercontent.com`).
5. Paste that same client ID into **two** places:
   - `portal/auth.gs` → `var GOOGLE_CLIENT_ID = '…'`
   - `portal/auth-client.js` → `var CLIENT_ID = '…'`

The client ID is **not a secret** — it ships in the page source by design.
What makes it safe is that the backend checks every ID token was issued *for
this exact client ID* before trusting a single field in it.

> Testing locally? Add your dev origin (e.g. `http://localhost:8000`) to the
> authorized origins list too. Google will not issue tokens to an origin that
> is not listed, and the sign-in button will simply do nothing.

## Step 2 — Add `auth.gs` to the Apps Script project

Open the project at **script.google.com** → the **+** next to *Files* →
**Script** → name it `auth` → paste the whole of `portal/auth.gs` in.

Do **not** paste it into `Code.gs`. Every `.gs` file in a project shares one
global scope, so `auth.gs` can call `Code.gs`'s helpers directly, and keeping
them separate is what makes this reviewable and revertible.

## Step 2b — Set the portal URL, then run three one-off functions

In `auth.gs`, check `PORTAL_URL` points at your live portal
(`https://morettitutoring.com/portal/`). It is what goes into emails sent to
real families, so a preview URL here sends them nowhere.

Then, from the function dropdown in the Apps Script editor, **Run** each of
these once:

1. **`migrateToSubjectOnly`** — ticks `SubjectOnly` for exactly the students
   who were *not* doing SAT prep, so flipping the default is a no-op for
   everyone already on the roster. Run this **before** edits 5 and 6 below.
   Afterwards you can delete the old `SAT` column. Safe to run twice.
2. **`setupLeadProvisioning`** — turns on lead → roster provisioning and
   stamps a watermark of "now", so only inquiries that arrive *after* this
   moment get a row. Without the watermark the first run would provision
   every historical inquiry in the sheet at once.
3. **`testMailApp`** (already in `Code.gs`) — confirms mail works, since
   invites and claim notifications both depend on it.

## Step 3 — Apply the nine edits below, then redeploy

**Deploy → Manage deployments → edit (pencil) → Version: New version →
Deploy.** Editing the script changes nothing until you do this — the old
code keeps answering every request until a new version is deployed.

## Step 4 — Check it

First, run the access-control suite. It runs the real `auth.gs` against a
fake sheet and a fake Google, and covers what a leaked key can and cannot
do, that a pending claim grants nothing, that a session cannot be pointed at
another student's row, that a parent claiming a child's key is caught and
fully undoable, and that revocation actually revokes:

```bash
node portal/tests/auth-test.js
```

Then, in a browser:

1. Open the portal in a private window. You should get a Google sign-in
   screen, not a key box.
2. Sign in as yourself. If your address is in a `GrantedEmail` cell you land
   straight in the portal; otherwise you get the key prompt.
3. Check the roster Sheet: `GoogleSub`, `PendingEmail`, `PendingSub`,
   `PendingName`, `PendingAt`, `TokenVersion`, `OnboardedAt`, `InviteNonce`,
   `InviteSentAt`, `Status`, `SubjectOnly`, `LeadRole`, `Grade`, a
   `PortalKey` column on **Leads**, and an `AuthLog` tab all create
   themselves on first use. Nothing to set up by hand.
4. Test the invite end to end: in admin.html's console,
   `mtaNewStudent('your@email.com')` then `mtaSendInvite('THEKEY')`. Open the
   link in a private window, sign in with a second Google account, and check
   the row goes to `Status: Active` with that address in `GrantedEmail` and
   the folder shared to it.
5. Submit your own inquiry form and confirm a row appears within 15 minutes
   with `Status: Inquiry` and your address in `GuardianEmail`.
4. Test the queue end to end with a spare key and a second Google account:
   sign in → enter the key → you should get the request email → tap
   **Review this request** → **Approve** → the waiting browser lets itself in
   within a few seconds.

---

## The nine edits

> Other work is in flight on `Code.gs`, `index.html` and `admin.html`, so
> these are written as **find-and-replace against an anchor line** rather
> than as line numbers. If a quoted block has drifted, the anchor to search
> for is named in each heading — the surrounding whitespace may differ, the
> anchor will not. Apply these last, once the other changes have landed;
> nothing here depends on when it happens.

### `Code.gs` — 1 of 6: route auth actions
*Anchor: the first `if (body.action === 'auth') {` inside `doPost`.*

Find, near the top of `doPost`:

```js
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'auth') {
```

Replace with:

```js
    var body = JSON.parse(e.postData.contents);
    // ═══ AUTH (auth.gs) ═══ authGuard_ rejects any student action that
    // arrives without a valid signed session, and rewrites body.key to the
    // key inside that session — so a session for one student can never be
    // pointed at another student's row by editing the request body.
    // authRoute_ then handles the sign-in/claim/approval actions themselves.
    var authOut = authGuard_(body) || authRoute_(body);
    if (authOut) {
      out = authOut;
    } else if (body.action === 'auth') {
```

> Adding a new per-student action to `Code.gs` later? Add its name to
> `STUDENT_ACTIONS` in `auth.gs` as well. That list fails **open** — an
> action missing from it runs unauthenticated.

### `Code.gs` — 2 of 6: serve the approval page
*Anchor: `function doGet(e) {`.*

Find:

```js
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: 'Moretti portal backend is running.' }))
```

Insert one line so it reads:

```js
function doGet(e) {
  // The one-tap approval link emailed on a new access request (auth.gs).
  if (e && e.parameter && e.parameter.claim) return renderClaimPage_(e.parameter.claim);
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: 'Moretti portal backend is running.' }))
```

### `Code.gs` — 3 of 6: close the key-only door
*Anchor: `function handleAuth(rawKey, rawEmail, rawName) {`.*

Find the first line of the body of `handleAuth` and put this above it:

```js
function handleAuth(rawKey, rawEmail, rawName) {
  /* ═══ RETIRED ═══ this was key-as-password: a key alone returned a
     student's whole record. Sign-in now goes through handleGoogleAuth in
     auth.gs, and a key is only ever a one-time claim code. Failing closed
     rather than deleting the function means a browser holding a cached
     copy of the OLD index.html gets a clear message instead of silently
     still working through the old door. Everything below this return is
     dead and can be deleted once no stale client is in the wild. */
  return { ok: false, error: 'google_required' };

  if (!rawKey) return { ok: false, error: 'missing_key' };
```

### `Code.gs` — 4 of 6: gate two ungated admin utilities
*Anchor: `body.action === 'listBlankComposite'`. Unrelated to sign-in, but worth closing while you are in here.*

`listBlankComposite` and `backfillCompositeFields` are dispatched with **no
credential of any kind** today. The first returns every student's key, name
and report link to anyone who asks; the second writes into the Attempts
sheet. Find these two lines in `doPost`:

```js
    } else if (body.action === 'listBlankComposite') {
      out = handleListBlankComposite();
    } else if (body.action === 'backfillCompositeFields') {
      out = handleBackfillCompositeFields(body.patches);
```

Replace with:

```js
    } else if (body.action === 'listBlankComposite') {
      out = (body.adminKey === ADMIN_KEY) ? handleListBlankComposite() : { ok: false, error: 'unauthorized' };
    } else if (body.action === 'backfillCompositeFields') {
      out = (body.adminKey === ADMIN_KEY) ? handleBackfillCompositeFields(body.patches) : { ok: false, error: 'unauthorized' };
```


### `Code.gs` — 5 of 6: SAT prep becomes the default
*Anchor: `function testPrepFlags_(row) {`. Run `migrateToSubjectOnly()` first.*

The roster's `SAT` checkbox had to be **ticked** for a student to see the SAT
diagnostic and resources — so the common case took an action and the rare
case took none, which is how a new student ends up with the portal's main
feature invisible because of a box nobody remembered. `SubjectOnly` inverts
it: blank means SAT prep, tick it only for a subject-tutoring student.

Replace:

```js
function testPrepFlags_(row) {
  var showSat = truthy_(row.SAT);
```

with:

```js
function testPrepFlags_(row) {
  // SAT prep is the default. SubjectOnly is ticked only for a student who
  // is here for subject tutoring and should not see the SAT material —
  // see the SubjectOnly block in auth.gs. Named positively on purpose: a
  // column called NotSAT reads as a double negative when it is unticked.
  var showSat = !truthy_(row.SubjectOnly);
```

### `Code.gs` — 6 of 6: same inversion for the admin roster
*Anchor: `sat: truthy_(data[i][col.SAT])`.*

`handleGetRoster` reads the column directly rather than through
`testPrepFlags_`, so without this the admin roster would show every student
as non-SAT. Replace:

```js
      sat: truthy_(data[i][col.SAT]),
```

with:

```js
      sat: !truthy_(data[i][col.SubjectOnly]),
```

### `index.html` — 1 of 2: load the client
*Anchor: `window.APPS_SCRIPT_URL = `.*

Immediately **after** the line that sets `window.APPS_SCRIPT_URL` (so the
fetch wrapper is installed before anything can call the backend), add:

```html
<script src="auth-client.js"></script>
```

### `index.html` — 2 of 2: start sign-in instead of showing the key screen
*Anchors: `(function restoreState() {`, `getElementById('onb-splash').addEventListener`, and `function switchKey(e) {`.*

Three small changes inside the main script:

**(a)** At the very end of the `restoreState()` IIFE — after its closing
`})();` and before the outer `})();` — add:

```js
  /* ═══ SIGN-IN ═══ (auth-client.js). Only when restoreState() did not
     already put a student back after a same-tab refresh. Resumes a stored
     session silently, so a returning student sees no login at all. */
  if (!currentStudent) {
    MorettiAuth.start({
      onStudent: function (data) {
        pendingKey = data.key;
        pendingName = data.name;
        if (data.needsOnboarding) {
          onboardAuthData = data;
          goToOnboardSplash();
        } else {
          settle(data);
        }
      }
    });
  }
```

**(b)** The onboarding splash used to hand off to a name/email capture pane.
The identity is already known now, so that pane is dead. Find:

```js
  document.getElementById('onb-splash').addEventListener('click', function () {
    goToOnboardIdentity();
  });
```

Replace with:

```js
  document.getElementById('onb-splash').addEventListener('click', function () {
    // Name and email both come from the verified Google account now, so the
    // old identity-capture beat has nothing left to ask for.
    transitionOnboardToLight(onboardAuthData);
  });
```

**(c)** Make "Use a different key" a real sign-out. In `switchKey()`, replace:

```js
    resetKeyScreen();
    show('screen-key');
```

with:

```js
    MorettiAuth.signOut();
    location.reload();
```

While you are there, the menu item at `id="nav-profile-switch-key"` now reads
better as **"Sign out"**.

### `admin.html` — 1 of 1: load the access panel

Anywhere before `</body>`:

```html
<script src="auth-admin.js"></script>
```

That one tag is the whole integration. The panel builds its own markup and
styles itself from `admin.html`'s own `:root` variables, so nothing in that
file changes and removing the tag removes the feature completely.

A **Portal access** tab sits bottom-right with a badge counting the rows
that need you. Opening it gives you:

| Section | What's in it | Buttons |
|---|---|---|
| **Needs you** | inquiries with no invite sent, and claims waiting on approval | **Send invite** · **Approve** / **Decline** |
| **Invited — not claimed yet** | invites sent but not taken up | **Re-send invite** (replaces the old link) |
| **Find a student** | search by name, key or email | **Reset login** |

Plus **+ New student** in the header — the intake form for families who
reached you by phone, text or Messenger. Only optional fields, a
`How did they reach you?` selector recorded to a `Source` column, and a
subject-tutoring-only tick (SAT prep being the default). On save it shows
the key and the three delivery options above.

Rows with no email on file show **Copy link** as the primary action instead
of **Send invite**, since emailing one is guaranteed to fail.

Two deliberate details:

- **Reset login only appears where there is a login to reset** — an inquiry
  nobody has claimed has no pairing and no bound address, so the button
  would be noise, and a destructive-looking button that does nothing is
  worse than no button. It confirms before running, and the confirmation
  says explicitly that it revokes Drive access as well as the login.
- **A row with a claim waiting is pilled "Wants in", not "Inquiry."**
  Technically nobody is paired yet so its status *is* Inquiry, but labelling
  it that way buries the one thing on the panel actually asking you a
  question.

The same actions stay on `window` — `mtaNewStudent('parent@email.com')`,
`mtaSendInvite('BGD2465')`, `mtaResetStudentAuth('BGD2465')` — so the
pipeline is still fully operable from the console if the panel is ever
hidden by a layout change.

---

## What you get that you did not have before

- **Revocation.** `window.mtaResetStudentAuth('KEY')` (or the reset action in
  `auth.gs`) clears the pairing and the bound address, bumps `TokenVersion`
  to kill every session, and revokes that address's Drive access to the
  student's folder. Their scores, reports and the folder itself are
  untouched — only the login resets. Previously the only way to cut off
  access was to issue a new key, and nothing revoked Drive at all.
- **An audit trail.** The `AuthLog` tab records every login, pairing, claim,
  approval, decline and rejected attempt, with timestamp, key, email and the
  Google subject id. Previously the only evidence anyone ever logged in was a
  single `GrantedAt` cell.
- **Sessions.** 30 days, signed, reissued on each page load. A student stops
  retyping anything; a dormant login dies on its own.
- **Identity that survives an email change.** Pairing is anchored to the
  Google `sub` (permanent per account), not the address, so a student who
  changes the email on their account does not get locked out.

## Known limits, stated plainly

- **Revocation lands at the student's next page load,** not mid-request.
  Sessions are stateless by design (no per-request sheet read), so bumping
  `TokenVersion` takes effect when they next open the portal. For a student
  portal that is the right trade; if it ever is not, the fix is a
  `CacheService`-backed version check in `authGuard_`.
- **`admin.html` still authenticates with the shared `ADMIN_KEY`.** That is
  a password with the same weaknesses the student key had. It is a different
  risk profile — one holder, not nine — so it is deliberately out of scope
  here, but the same Google-sign-in machinery would gate it on your own
  email in well under an hour. Worth doing before anyone else ever gets an
  admin login.
- **`math-review.html` also uses `ADMIN_KEY`** and is unaffected by any of
  this.
