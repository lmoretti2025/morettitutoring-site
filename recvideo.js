/* recvideo.js (2026-10-27): the portal screen recordings are real videos now. As animated WebP most
   frames were patches painted over the last one, and browsers showed them shaking or with white bands
   (Luca: "glitching out sometimes, shaking, showing white"). Each <video data-rec> loads only as it
   nears the screen, plays while on it and pauses off it; with reduced motion it stays on its poster. */
(function () {
  var vids = [].slice.call(document.querySelectorAll('video[data-rec]'));
  if (!vids.length) return;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function load(v) { if (!v.getAttribute('src')) { v.setAttribute('src', v.getAttribute('data-rec')); v.load(); } }
  function play(v) { if (still) return; load(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  window.recRestart = function (v) { if (!v || still) return; try { v.currentTime = 0; } catch (e) {} play(v); };
  if (!('IntersectionObserver' in window)) { vids.forEach(play); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) play(e.target); else if (!e.target.paused) e.target.pause(); });
  }, { rootMargin: '300px 0px' });
  vids.forEach(function (v) { io.observe(v); });
})();
