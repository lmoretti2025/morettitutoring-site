/* =========================================================================
   THE BACKEND URL — defined ONCE, here.
   -------------------------------------------------------------------------
   Every page and script talks to the same Apps Script web app, and every
   consumer reads `window.APPS_SCRIPT_URL`. Deploy > New deployment mints a
   NEW /exec URL (Manage deployments > edit > New version keeps the old one,
   which is the documented path); a missed copy makes the site half-work.

   Load this file BEFORE anything that uses it. The pages that do:

     index.html            (root: the marketing lead form)
     portal/index.html     (the student portal, before auth-client.js)
     portal/admin.html     (before auth-admin-signin.js and auth-admin.js)
     portal/math-review.html
     portal/approve.html   portal/setup.html

   portal/Code.gs holds the one other copy, as `WEB_APP_URL` near the top:
   its "Assign homework" dialog renders inside the spreadsheet where this
   file is not reachable. Change the two together.

   `portal/tests/verify-deployment.js` reads this file when no URL is given
   on the command line, and `portal/tests/set-client-id.js` rewrites it.

   THE EDGE (2026-09-24). The site talks to api.morettitutoring.com, a
   Cloudflare Worker (edge/worker.js) that forwards every request to the
   Apps Script /exec URL, which now lives in edge/wrangler.toml. A new Apps
   Script deployment URL goes THERE (and in Code.gs), then `npx wrangler
   deploy` from edge/. Code.gs keeps calling Apps Script directly.
   To bypass the edge, put the /exec URL back here:
     https://script.google.com/macros/s/AKfycbwsLMGq3lhBEPObcas0k8gVS67NX9y4wXKG6RgzKtlBOT2SXfREK6vBpvvM19w9s1m6/exec
   ========================================================================= */
window.APPS_SCRIPT_URL = 'https://api.morettitutoring.com/';
