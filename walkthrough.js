/* walkthrough.js (2026-10-14): reveals for the math page, the same as the SAT page's */
/* MOTION (2026-10-14): rows reveal once (their recording restarts so it plays from the top), the
   report window grows from 92% as it comes up, the hero lifts and fades as it scrolls away. */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero=document.querySelector('.phero'); if(hero) requestAnimationFrame(function(){ hero.classList.add('lit'); });
  var rows=[].slice.call(document.querySelectorAll('.prow,.pmore'));
  var restart=function(r){ var im=r.querySelector('.pmedia img'); if(!im||!/rec-/.test(im.src)) return; var b=im.getAttribute('src'); im.src=b+'#t'+Date.now(); };
  if(!('IntersectionObserver' in window)||reduce){ rows.forEach(function(r){ r.classList.add('show'); }); }
  else {
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('show'); restart(e.target); io.unobserve(e.target); } }); },{threshold:.22,rootMargin:'0px 0px -6% 0px'});
    rows.forEach(function(r){ io.observe(r); });
  }
  if(reduce) return;
  var win=document.querySelector('.dwin'), sh=hero&&hero.querySelector('.shell'), tick=false;
  function frame(){ tick=false; var vh=innerHeight;
    if(win){ var r=win.getBoundingClientRect(), p=Math.min(1,Math.max(0,(vh-r.top)/(vh*.7))); win.style.setProperty('--dz',(0.92+0.08*p).toFixed(4)); }
    if(sh){ var y=Math.min(scrollY,vh), q=y/vh; sh.style.setProperty('--hy',(q*-90).toFixed(1)+'px'); sh.style.setProperty('--ho',Math.max(0,1-q*1.5).toFixed(3)); }
  }
  addEventListener('scroll',function(){ if(!tick){ tick=true; requestAnimationFrame(frame); } },{passive:true}); addEventListener('resize',frame); frame();
})();

/* HIGHLIGHT TILES: arrows scroll the row; the cards slide in once the row is in view. */
(function(){
  var tr=document.getElementById('hxtrack'), sec=document.querySelector('.hx'); if(!tr) return;
  [].slice.call(document.querySelectorAll('[data-hx]')).forEach(function(b){ b.addEventListener('click',function(){ tr.scrollBy({left:Number(b.getAttribute('data-hx'))*350,behavior:'smooth'}); }); });
  if(!('IntersectionObserver' in window)){ sec.classList.add('show'); return; }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ sec.classList.add('show'); io.disconnect(); } }); },{threshold:.2}); io.observe(sec);
})();

/* CHAPTER REVEAL: each chapter's label, headline (word by word) and sentence rise in once, when it comes into view. */
(function(){
  var chaps=[].slice.call(document.querySelectorAll('.chap'));
  chaps.forEach(function(c){
    var h=c.querySelector('.chap-h'); if(!h) return;
    var words=h.textContent.trim().split(/\s+/);
    h.innerHTML=words.map(function(w,i){ return '<span class="w" style="--i:'+i+'">'+w.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>'; }).join(' ');
    c.style.setProperty('--n', words.length);
  });
  if(!('IntersectionObserver' in window)){ chaps.forEach(function(c){c.classList.add('show');}); return; }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); } }); },{threshold:.35});
  chaps.forEach(function(c){ io.observe(c); });
})();
