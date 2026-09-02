/* =========================================================================
   THE BACKEND URL — defined ONCE, here.
   -------------------------------------------------------------------------
   Every page and script in this site talks to the same Apps Script web app.
   That URL used to be typed out in full in nine separate files, and the
   only thing keeping them in agreement was that nobody had needed to change
   it yet.

   The day that stops being true is the day it bites: Deploy > New
   deployment mints a BRAND NEW /exec URL (Deploy > Manage deployments >
   edit > New version keeps the old one, which is why that is the documented
   path). Miss one copy and the site half-works in a way that looks random —
   the portal signs in but the admin panel cannot load a roster, or the
   marketing form silently posts into the void.

   So: one definition, and every consumer reads `window.APPS_SCRIPT_URL`.
   Load this file BEFORE anything that uses it. The pages that do:

     index.html            (root — the marketing lead form)
     portal/index.html     (the student portal, before auth-client.js)
     portal/admin.html     (before auth-admin-signin.js and auth-admin.js)
     portal/math-review.html
     portal/approve.html   portal/setup.html

   portal/Code.gs holds the one unavoidable copy, as `WEB_APP_URL` near the
   top of that file — it is the backend, and its "Assign homework" dialog is
   rendered inside the spreadsheet where this file is not reachable. Two
   places, both named and both commented, instead of nine scattered
   literals. Change them together.

   `portal/tests/verify-deployment.js` reads this file when no URL is given
   on the command line, and `portal/tests/set-client-id.js` rewrites it.
   ========================================================================= */
window.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwsLMGq3lhBEPObcas0k8gVS67NX9y4wXKG6RgzKtlBOT2SXfREK6vBpvvM19w9s1m6/exec';
