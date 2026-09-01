# Student Portal Backend — One-Time Setup

This is a one-time setup to move the student roster out of the public
website and into a private backend, and to make Drive folder sharing
automatic. It has to be done from **your** Google account, since it's
tied to your Drive and your Apps Script — this isn't something that can
be done for you from outside your account.

Budget about 15 minutes. You won't need to touch this again after —
adding new students afterward is just adding a row to a spreadsheet.

---

## Step 1 — Create the roster spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new,
   blank spreadsheet. Name it something like **"Moretti Portal — Students"**.
2. Rename the first tab (bottom-left) to exactly: `Students`
3. In row 1, add these column headers exactly as written, one per cell,
   left to right:

   ```
   Key | Name | DriveFolderUrl | GrantedEmail | GrantedAt | SATTakenAt | ACTTakenAt | TestPrep | TestDate
   ```

4. Add your existing students starting in row 2. Right now that's:

   | Key | Name | DriveFolderUrl | GrantedEmail | GrantedAt | SATTakenAt | ACTTakenAt | TestPrep | TestDate |
   |---|---|---|---|---|---|---|---|---|
   | DEMO123 | Demo Student | | | | | | | |

   (Add one row per real student directly in the Sheet itself — not in
   this file. This file is committed to git, so a real student's key,
   name, and Drive folder link don't belong here; the Sheet is the only
   place that data should live.)

   Leave `GrantedEmail` and `GrantedAt` blank — the backend fills those in
   automatically the first time each key is used.

5. From the address bar, copy the spreadsheet's ID — it's the long string
   in the URL between `/d/` and `/edit`:

   ```
   https://docs.google.com/spreadsheets/d/  1AbCdEfGhIjKlMnOpQrStUvWxYz  /edit
                                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^ this part
   ```

   Save that somewhere — you'll paste it into the script in Step 2.

---

## Step 2 — Create the Apps Script backend

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Name the project (top-left, "Untitled project") something like
   **"Moretti Portal Backend"**.
3. Delete everything in the default `Code.gs` editor and paste in the
   full contents of `portal/Code.gs` from this folder.
4. Near the top, find this line:

   ```js
   var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';
   ```

   Replace `PASTE_YOUR_SHEET_ID_HERE` with the spreadsheet ID you copied
   in Step 1 (keep the quotes).
5. Save the project (the disk icon, or Ctrl/Cmd+S).

---

## Step 3 — Deploy it as a web app

1. Top-right, click **Deploy** → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** anything, e.g. "v1"
   - **Execute as:** **Me** (your account — this is what lets the script
     grant Drive access on your behalf)
   - **Who has access:** **Anyone**
     (This makes the *endpoint* publicly reachable, same as the old key
     screen was — but it only ever returns one student's data for a
     correct key, never the full roster. This is expected and required
     for the portal's fetch requests to reach it without a Google login.)
4. Click **Deploy**.
5. The first time, Google will ask you to authorize the script — click
   through **Authorize access**, pick your account, and if it shows an
   "unverified app" warning, click **Advanced** → **Go to Moretti Portal
   Backend (unsafe)**. This warning is normal for scripts you write
   yourself; it's not actually unsafe, Google just hasn't reviewed it.
6. Copy the **Web app URL** it gives you (ends in `/exec`).

---

## Step 4 — Wire the URL into the portal

1. Open `portal/index.html` in this folder.
2. Find this line (near the top, in the "BACKEND CONFIG" comment block):

   ```js
   window.APPS_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```

3. Replace the placeholder with the URL you copied in Step 3, keeping the
   quotes.
4. Save, commit, and push (same as always):

   ```
   git add -A
   git commit -m "Wire up portal backend"
   git push origin main
   ```

---

## Step 5 — Turn on auto-created folders

This makes it so adding a student is just a Key and a Name — no manual
Drive folder creation needed either.

1. Back in the Apps Script editor, click the function dropdown (top
   toolbar, currently probably showing `doGet` or `doPost`) and select
   **setupTrigger**.
2. Click **Run**.
3. If it asks you to authorize again, click through it — same as before.
4. Check the **Execution log** panel; it should say "Trigger installed."

From now on, any row with a Name but a blank `DriveFolderUrl` gets a real
Drive folder created automatically the moment you edit the sheet, filed
inside a folder called **"Moretti Portal — Student Folders"** in your
Drive, with the URL written back into the sheet for you. Pasting in an
existing folder link still works exactly as before — this only fills in
blanks, it never overwrites a link you've already set.

---

## Step 6 — Lock down any folder that was previously shared broadly

If a student's folder was previously shared as "Anyone with the link,"
that's the exact exposure this backend is meant to close. Once the steps
above are live, for each such student:

1. Have the student open the portal and enter their key — since their
   `GrantedEmail` cell is still blank, they'll be asked for their email,
   and the backend will grant them Viewer access directly.
2. After that, go to their folder in Drive → **Share** → change **General
   access** from "Anyone with the link" to **Restricted**. Their named
   access (granted in step 1) keeps them working; the public link stops
   working for anyone else.

Do this same "Restricted + granted individually" pattern for any other
folder you've shared broadly in the past.

---

## Redeploying after a code change (the one that bites)

**Editing `portal/Code.gs` here changes nothing on its own.** Apps Script
keeps serving the *last deployed version* — so the old code answers every
request, quietly ignoring any field it has never heard of. Nothing errors.
The admin page says "saved", the sheet just doesn't get the new column, and
the feature looks broken for no visible reason.

Any time `portal/Code.gs` changes, do this:

1. Open the Apps Script project (script.google.com → Moretti Portal Backend).
2. Select all in the editor and paste in the current contents of
   `portal/Code.gs`. Save.
3. **Deploy → Manage deployments → the pencil (edit) icon → Version:
   *New version* → Deploy.**

Step 3 is the one that's easy to miss: saving the file, or creating a
*new deployment* instead of a new *version* of the existing one, both
leave the live URL pointing at the old code.

### How to tell which version is live

The backend reports its own version (`BACKEND_VERSION` near the top of
`Code.gs`). The admin page checks it on load and shows a red banner naming
exactly what won't stick if the deployment is behind. Bump
`BACKEND_VERSION` — and add to `BACKEND_CAPABILITIES` — whenever you add
something the pages depend on, and bump `REQUIRED_BACKEND_VERSION` in
`admin.html` to match.

To check by hand:

```
curl -sL -X POST <your /exec URL> -H 'Content-Type: application/json' \
  -d '{"action":"version"}'
```

`unknown_action` means the deployment predates this check entirely, i.e.
it's definitely out of date.

### Pushing the site itself

`index.html`, `admin.html` and `report.html` are served from the repo, so
those need a normal `git push` — separate from the Apps Script deploy
above. A change to the calendar or the report usually needs **both**.

---

## Adding a new student going forward

No code, no manual Drive sharing. Just add a row to the **Students**
sheet: their key, name, and Drive folder link(s), with `GrantedEmail`
left blank. Hand them the key. The first time they log in, they'll enter
their email and get shared automatically.

**If a student typos their email on first use:** clear the `GrantedEmail`
and `GrantedAt` cells for their row in the sheet, and manually remove the
wrong email from the folder's Share settings in Drive. They can then
re-enter the correct email next time they use their key.
