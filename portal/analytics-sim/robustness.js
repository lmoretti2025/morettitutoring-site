/* Does the report's accuracy survive if a real weakness is shaped differently
   from the way I assumed? Same shipped code, five ground truths. */
'use strict';
const St=require('./student.js'), B=require('./build.js'), D=require('./diagnose.js'),
      C=require('./core.js'), G=require('./dgp.js');
const AB={mean:1.20,sd:1.22,lo:-0.2,hi:3.7};
function draw(r){for(;;){const a=AB.mean+AB.sd*St.normal(r); if(a>=AB.lo&&a<=AB.hi) return a;}}

function trial(kind,gap,seed,i){
  const rand=St.rng(seed);
  const cfg={ability:draw(rand), gapDomain:G.DOM[i%8], gapSize:gap,
    paceMu:St.CALIBRATED_PACE.mu+(0.3*rand()-0.15), paceSigma:St.CALIBRATED_PACE.sigma,
    mathVariant:rand()<0.5?'Easier':'Harder', rwVariant:rand()<0.5?'Easier':'Harder'};
  const secs=G.sit(kind,cfg,seed+555);
  const rows=B.toAllRows(secs.map(s=>B.bucketRows(s.rows,s.key)));
  const named=D.diagnose(rows);
  const truth=(kind==='none'||!gap)?null:G.trueLead(kind,cfg);
  const pct=secs.reduce((a,s)=>a+s.rows.filter(r=>r.ok).length,0)/secs.reduce((a,s)=>a+s.rows.length,0);
  return {any:named.length>0, lead:named[0]?named[0].skill:null,
          truth:truth?truth.lead:null, sep:truth?truth.margin:0, pct};
}
const P=x=>(x*100).toFixed(1)+'%';
const N=5000;
const KINDS=['domain','skill','difficulty','correlated'];

console.log('ROBUSTNESS — same shipped code, five different ground truths\n');
console.log('  Each row asks: if a weakness were shaped THIS way, would the report find it?\n');
console.log('  ground truth   what it means                          gap  fires   finds it  precision');
const MEANING={domain:'uniform penalty across a whole domain',
               skill:'concentrated in 1-2 skills inside it',
               difficulty:'fine on easy, collapses on hard',
               correlated:'two related domains weak together'};
for(const k of KINDS){
  for(const gap of [1.6,2.4]){
    let f=0,h=0,n=0;
    for(let i=0;i<N;i++){ const t=trial(k,gap,300000+i,i);
      if(t.any)f++; if(t.lead&&t.lead===t.truth)h++; n++; }
    console.log('  '+k.padEnd(15)+MEANING[k].padEnd(38)+gap.toFixed(1)+P(f/n).padStart(8)+P(h/n).padStart(10)+(f?P(h/f):'--').padStart(11));
  }
}
console.log('\n  THE NULL — no domain structure at all; any naming is a false positive');
{ let f=0,n=0;
  for(let i=0;i<N;i++){ if(trial('none',0,400000+i,i).any) f++; n++; }
  console.log('  '+'none'.padEnd(15)+'pure ability, no weak domain'.padEnd(38)+'  -'+P(f/n).padStart(8)); }
