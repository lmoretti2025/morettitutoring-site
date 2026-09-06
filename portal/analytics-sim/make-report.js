/* Builds a REAL report payload (#d=...) for a synthetic student, so the
   attempt renders through the actual report rather than a mock.
   Every tendency is drawn from the calibration in README.md. */
'use strict';
const fs=require('fs'), path=require('path');
const St=require('./student.js'), B=require('./build.js');
const P=process.env.PORTAL;
const wb={}; new Function('window',fs.readFileSync(path.join(P,'banks.js'),'utf8'))(wb);

function form(sectionKey,variant){
  return sectionKey==='math'
    ? wb.MATH_MODULE1.concat(variant==='Harder'?wb.MATH_MODULE2_HARDER:wb.MATH_MODULE2_EASIER)
    : wb.RW_MODULE1.concat(variant==='Harder'?wb.RW_MODULE2_HARDER:wb.RW_MODULE2_EASIER);
}
const DIFF=St.DIFF_OFFSET;

/* profile knobs, all calibrated:
   ability     from the fitted real range (-0.2 .. 3.7)
   gapDomain   a planted content weakness
   paceMu      lognormal centre; -0.416 is the real median (0.66x budget)
   clockTrouble  if set, the student runs out and leaves the tail blank    */
function build(cfg){
  const rand=St.rng(cfg.seed);
  const sections=[];
  for(const key of ['reading-writing','math']){
    const variant=cfg[key==='math'?'mathVariant':'rwVariant']||'Easier';
    const qs=form(key,variant);
    const a=[],tm=[],m=[];
    // where the clock runs out, if it does
    const cut = cfg.clockTrouble ? Math.floor(qs.length*cfg.clockTrouble) : qs.length;
    for(let i=0;i<qs.length;i++){
      const q=qs[i];
      if(i>=cut){ a.push(null); tm.push(0); m.push(0); continue; }
      let ab=cfg.ability+(DIFF[q.difficulty]||0);
      if(q.domain===cfg.gapDomain) ab-=cfg.gapSize||0;
      const p=Math.min(0.97,Math.max(0.03,1/(1+Math.exp(-ab))));
      const correct=rand()<p;
      if(q.type==='fr'){
        a.push(correct?{raw:String(q.answer),value:parseFloat(q.answer)}:{raw:'0',value:0});
      } else {
        if(correct) a.push(q.correct);
        else { let w; do { w=Math.floor(rand()*4); } while(w===q.correct); a.push(w); }
      }
      const b=B.TB.budgetSecondsFor(key,q.domain,q.skill||q.domain,q.difficulty,1);
      const budget=(b&&b.ms)||60000;
      const z=St.normal(rand);
      let mu=cfg.paceMu!==undefined?cfg.paceMu:St.CALIBRATED_PACE.mu;
      if(cfg.slowDomain===q.domain) mu+=0.55;
      tm.push(Math.max(3000,Math.round(budget*Math.exp(mu+(cfg.paceSigma||St.CALIBRATED_PACE.sigma)*z))));
      m.push(rand()<(cfg.flagRate||0.06)?1:0);
    }
    const t0=Date.now()-3600000;
    sections.push({k:key,a:a,m:m,v:variant,tm:tm,
      fv:tm.map((_,i)=>t0+i*45000), lv:tm.map((_,i)=>t0+i*45000+tm[i])});
  }
  return {n:cfg.name,k:'SIM0001',t:'SAT',dt:new Date().toISOString().slice(0,10),s:sections};
}
function toUrl(payload, base){
  const json=JSON.stringify(payload);
  const b64=Buffer.from(json,'utf8').toString('base64');
  /* NOT percent-encoded: report.html reads the fragment with
     location.hash.replace(/^#d=/,'') and feeds it straight to atob(), with
     no decodeURIComponent step -- so an encoded '+' would arrive as '%2B'
     and atob would throw. Base64's alphabet is fragment-safe as-is. */
  return (base||'http://localhost:4173/portal/report.html')+'#d='+b64;
}
module.exports={build,toUrl,form};
