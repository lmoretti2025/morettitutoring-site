/* tiles.js (2026-10-14): the "And everything else" row moves slowly on its own and loops.
   A hover, touch, focus or arrow press pauses it; it carries on a few seconds after. */
(function(){
  var tr=document.getElementById('hxtrack'); if(!tr) return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cards=[].slice.call(tr.children); if(cards.length<3) return;
  cards.forEach(function(c){ var k=c.cloneNode(true); k.setAttribute('aria-hidden','true'); k.classList.add('hx-clone'); [].forEach.call(k.querySelectorAll('a,button'),function(a){a.tabIndex=-1;}); tr.appendChild(k); });
  tr.classList.add('drift');
  var held=0, last=0, on=false, pos=tr.scrollLeft, SPEED=28; // px per second
  function loopW(){ return cards[cards.length-1].offsetLeft+cards[cards.length-1].offsetWidth+parseFloat(getComputedStyle(tr).columnGap||20)-cards[0].offsetLeft; }
  function hold(ms){ held=performance.now()+(ms||3500); }
  ['pointerenter','touchstart','focusin','wheel'].forEach(function(e){ tr.addEventListener(e,function(){ hold(1e9); },{passive:true}); });
  ['pointerleave','touchend','focusout'].forEach(function(e){ tr.addEventListener(e,function(){ hold(2500); },{passive:true}); });
  [].forEach.call(document.querySelectorAll('[data-hx]'),function(b){ b.addEventListener('click',function(){ hold(4000); }); });
  function frame(t){
    if(on){
      var dt=last?Math.min(64,t-last):16; last=t;
      var w=loopW();
      // The position is kept here, not read back: scrollLeft rounds, and at this speed a frame moves under a pixel.
      if(t>held){ pos+=SPEED*dt/1000; if(pos>=w) pos-=w; tr.scrollLeft=pos; }
      else { if(tr.scrollLeft>=w) tr.scrollLeft-=w; pos=tr.scrollLeft; }
    } else last=0;
    requestAnimationFrame(frame);
  }
  if('IntersectionObserver' in window) new IntersectionObserver(function(es){ on=es[0].isIntersecting; },{threshold:.15}).observe(tr); else on=true;
  requestAnimationFrame(frame);
})();
