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
