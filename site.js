/* Shared by every public page. */
/* Phone menu: below 820px the nav links and the login are hidden, so the burger is the only way to them. */
(function () {
  var b = document.getElementById('navburger'), m = document.getElementById('navmenu');
  if (!b || !m) return;
  function set(open) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); m.classList.toggle('open', open); }
  b.addEventListener('click', function () { set(b.getAttribute('aria-expanded') !== 'true'); });
  m.addEventListener('click', function (e) { if (e.target.tagName === 'A') set(false); });
  addEventListener('resize', function () { if (innerWidth > 820) set(false); }, { passive: true });
})();

/* Where this visitor came from, for the inquiry form (prep.gs's leadChannel_ turns it into a channel like "Google search" or
   "Referral link"). Two visits are kept in this browser only: the first, and the latest that arrived from somewhere (a search,
   a social link, a ?ref= referral link, a tagged flyer link). Nothing is sent anywhere unless the visitor sends an inquiry.
   A third, the earliest visit that arrived from somewhere, decides when the first was direct. Kept 180 days, then the next
   visit starts over. */
(function () {
  var MAX_MS = 180 * 86400000, clip = function (v, n) { return String(v || '').slice(0, n); };
  try {
    var ls = window.localStorage;
    var q = new URLSearchParams(location.search), host = '';
    try { host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ''; } catch (e) { host = ''; }
    if (host === location.hostname || /(^|\.)morettitutoring\.com$/.test(host)) host = '';
    var t = { s: clip(q.get('utm_source'), 40), m: clip(q.get('utm_medium'), 40), c: clip(q.get('utm_campaign'), 60),
      r: clip(q.get('ref'), 40), g: q.has('gclid') ? 1 : 0, fb: q.has('fbclid') ? 1 : 0, h: clip(host, 80),
      p: clip(location.pathname, 60), t: new Date().toISOString() };
    var first = null;
    try { first = JSON.parse(ls.getItem('mt_src_first') || 'null'); } catch (e) { first = null; }
    if (!first || !first.t || Date.now() - Date.parse(first.t) > MAX_MS) ls.setItem('mt_src_first', JSON.stringify(t));
    if (t.s || t.r || t.g || t.fb || t.h) {
      // The earliest visit that came from somewhere: a family who first typed the address and later came through a friend's
      // link is credited to the link, even if a flyer or a search brought them back again after that.
      var tag = null;
      try { tag = JSON.parse(ls.getItem('mt_src_tag') || 'null'); } catch (e) { tag = null; }
      if (!tag || !tag.t || Date.now() - Date.parse(tag.t) > MAX_MS) ls.setItem('mt_src_tag', JSON.stringify(t));
      ls.setItem('mt_src_last', JSON.stringify(t));
    }
  } catch (e) { /* storage blocked: the inquiry simply goes without a source */ }
  window.MTSource = {
    forLead: function () {
      try {
        var g = function (k) { return JSON.parse(localStorage.getItem(k) || 'null'); };
        return { f: g('mt_src_first'), t: g('mt_src_tag'), l: g('mt_src_last') };
      }
      catch (e) { return null; }
    }
  };
})();
