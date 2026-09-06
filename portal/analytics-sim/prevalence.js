/* ═══ THE NUMBER THAT DECIDES WHETHER THE CLAIM IS HONEST ═══
   Every precision figure so far was computed on students who DEFINITELY had
   a planted weakness. That is precision conditional on the finding being
   there to find, and it is not what a parent experiences.

   What a parent experiences depends on how many students genuinely have one
   concentrated weak area at all. If most do, the headline precision is close
   to right. If many do not, the report is firing on noise for them and real
   precision is much lower. Since nobody knows that prevalence, the honest
   thing is to report precision AS A FUNCTION of it. */
'use strict';
const St=require('./student.js'), B=require('./build.js'), D=require('./diagnose.js'),
      C=require('./core.js'), G=require('./dgp.js');
const AB={mean:1.20,sd:1.22,lo:-0.2,hi:3.7};
function draw(r){for(;;){const a=AB.mean+AB.sd*St.normal(r); if(a>=AB.lo&&a<=AB.hi) return a;}}
function trial(kind,gap,seed,i,gate){
  const rand=St.rng(seed);
  const cfg={ability:draw(rand), gapDomain:G.DOM[i%8], gapSize:gap,
    paceMu:St.CALIBRATED_PACE.mu+(0.3*rand()-0.15), paceSigma:St.CALIBRATED_PACE.sigma,
    mathVariant:rand()<0.5?'Easier':'Harder', rwVariant:rand()<0.5?'Easier':'Harder'};
  const secs=G.sit(kind,cfg,seed+555);
  let rows=B.toAllRows(secs.map(s=>B.bucketRows(s.rows,s.key)));
  let named;
  if(!gate){ named=D.diagnose(rows); }
  else {
    rows=rows.filter(r=>r.total>=C.MIN_JUDGEABLE_N);
    let pT=0,pC=0; rows.forEach(r=>{pT+=r.total;pC+=r.content;});
    const base=pT?pC/pT:0;
    named=rows.filter(r=>{
      if(r.content<2||r.content/r.total<0.3) return false;
      if(C.shrunkRate(r.content,r.total,base)-base<0.15) return false;
      return gate(r.content,r.total,base);
    });
    named.forEach(r=>{r.reach=C.reachForRow(r); r.priority=r.content*r.reach.w;});
    named.sort((a,b)=>b.priority-a.priority);
  }
  const truth=(kind==='none')?null:G.trueLead(kind,cfg).lead;
  return {any:named.length>0, lead:named[0]?named[0].skill:null, truth};
}
const P=x=>(x*100).toFixed(1)+'%';
const N=6000;

/* Realistic mix: weaknesses in the wild are more likely correlated or
   skill-concentrated than perfectly uniform, so the "has a gap" half is
   drawn across shapes rather than from the flattering one. */
const SHAPES=['domain','skill','difficulty','correlated'];
function measure(gate){
  let fireGap=0,hitGap=0,nGap=0, fireNull=0,nNull=0;
  for(let i=0;i<N;i++){
    const k=SHAPES[i%4], gap=1.2+1.4*((i%7)/6);   // 1.2 .. 2.6
    const t=trial(k,gap,600000+i,i,gate);
    if(t.any)fireGap++; if(t.lead&&t.lead===t.truth)hitGap++; nGap++;
  }
  for(let i=0;i<N;i++){ if(trial('none',0,700000+i,i,gate).any) fireNull++; nNull++; }
  return {sens:hitGap/nGap, fireGap:fireGap/nGap, fireNull:fireNull/nNull};
}
const GATES={
  'shipped':      null,
  'wilson +0.05': (c,t,b)=>C.wilsonInterval(c,t).lo>b+0.05,
  'wilson +0.10': (c,t,b)=>C.wilsonInterval(c,t).lo>b+0.10,
};
console.log('REALISTIC PRECISION vs how common a real weak area actually is\n');
console.log('  A parent only ever sees "the report named something". How often that');
console.log('  naming is right depends on how many students have anything to name.\n');
for(const [name,g] of Object.entries(GATES)){
  const m=measure(g);
  console.log('  '+name+'   (fires on a real gap '+P(m.fireGap)+', on no gap '+P(m.fireNull)+', correct '+P(m.sens)+')');
  console.log('     prevalence:   90%     75%     50%     30%');
  const row=[0.9,0.75,0.5,0.3].map(pv=>{
    const fire=pv*m.fireGap+(1-pv)*m.fireNull;
    const right=pv*m.sens;
    return fire? P(right/fire) : '--';
  });
  console.log('     precision: '+row.map(s=>s.padStart(7)).join(' '));
  console.log();
}
