/* DOES THE ENGAGEMENT FLOOR RECOVER WHAT GUESSING DESTROYS?
   guessing.js flipped wrong answers to right but left their timing alone,
   which models luck but not the behaviour. A real guess is FAST -- that is
   what makes it a guess -- so here a guessed question is answered in a
   fraction of its budget, and both the hit and the miss carry that mark.
   Then the same attempt is diagnosed with the floor off and with it on. */
'use strict';
const St=require('./student.js'), B=require('./build.js'), D=require('./diagnose.js'), C=require('./core.js'),
      PLAN=require('./plan.js');
const DOM=['Algebra','Advanced Math','Geometry and Trigonometry','Problem-Solving and Data Analysis',
           'Information and Ideas','Craft and Structure','Expression of Ideas','Standard English Conventions'];
const N=Number(process.argv[2]||20000);
const GUESS_RATE=Number(process.argv[3]||0.30);   // share of questions blitzed
let cleanHit=0, offHit=0, onHit=0, offAny=0, onAny=0, offP=0, onP=0, n=0, offClock=0, onClock=0;
for(let s=0;s<N;s++){
  const seed=7000000+s, rand=St.rng(seed);
  const gapDom=DOM[seed%8];
  const cfg={ability:-0.3+3.2*rand(), gapDomain:gapDom, gapSize:1.2+1.8*rand(),
    paceMu:St.CALIBRATED_PACE.mu+(0.8*rand()-0.4), paceSigma:0.4+0.7*rand(),
    mathVariant:rand()<0.5?'Easier':'Harder', rwVariant:rand()<0.5?'Easier':'Harder'};
  const clean=St.sit(cfg,seed+11);
  const g=clean.map(x=>({key:x.key,rows:x.rows.map(r=>({...r}))}));
  const r2=St.rng(seed+777);
  /* Blitzing is CONCENTRATED, not uniform. A student does not lose patience
     evenly across a whole exam -- they hit a section they cannot read and
     start picking. Zahra blitzed Reading and Writing (24 of 64 minutes) and
     worked Math at a normal pace. Spreading it evenly instead makes every
     domain equally bad, which a relative test can never see -- so that
     version of the experiment was measuring the wrong thing. */
  const blitzSection = (seed%2) ? 'reading-writing' : 'math';
  for(const sec of g) for(const r of sec.rows){
    if(r.q.type==='fr') continue;
    if(sec.key!==blitzSection) continue;
    if(r2()>=GUESS_RATE) continue;                 // this one was blitzed
    const b=B.TB.budgetSecondsFor(sec.key,r.q.domain,r.sk||r.dom,r.q.difficulty,1);
    const budget=(b&&b.ms)||60000;
    r.timeMs=Math.max(1500,Math.round(budget*(0.04+0.07*r2())));  // 4-11% of budget
    r.ok = r2()<0.25;                                             // one in four lands
  }
  const diag=(secs,floor)=>{ C.TOO_FAST_BUDGET_REL=floor;
    return D.diagnose(B.toAllRows(secs.map(x=>B.bucketRows(x.rows,x.key)))); };
  /* The PLAN is the part that is not relative to the student's own average,
     so it is where the fix has to show up regardless of separation. */
  const planFor=(secs,floor)=>{ C.TOO_FAST_BUDGET_REL=floor;
    const rows=B.toAllRows(secs.map(x=>B.bucketRows(x.rows,x.key)));
    let clock=0;
    for(const sec of secs) for(const r of sec.rows){
      if(r.skipped){clock++; continue;}
      if(r.ok) continue;
      const b=B.TB.budgetSecondsFor(sec.key,r.q.domain,r.sk||r.dom,r.q.difficulty,1);
      const budget=(b&&b.ms)||0;
      if(budget && floor && r.timeMs < budget*floor) clock++;
    }
    const content=rows.reduce((a,r)=>a+r.content,0);
    const method=rows.reduce((a,r)=>a+r.inefficient,0);
    return PLAN.allocate({content,method,clock});
  };
  const nc=diag(clean,0.15), noff=diag(g,0), non=diag(g,0.15);
  n++;
  if(nc.some(r=>r.skill===gapDom)) cleanHit++;
  if(noff.some(r=>r.skill===gapDom)) offHit++;
  if(non.some(r=>r.skill===gapDom)) onHit++;
  if(noff.length) offAny++;
  if(non.length) onAny++;
  if(noff.some(r=>r.severity===2)) offP++;
  if(non.some(r=>r.severity===2)) onP++;
  const pOff=planFor(g,0), pOn=planFor(g,0.15);
  if(pOff && pOff.hours.clock>0) offClock++;
  if(pOn && pOn.hours.clock>0) onClock++;
}
const pc=x=>(100*x/n).toFixed(1)+'%';
console.log('BLITZED ATTEMPTS — '+n.toLocaleString()+' students, '+Math.round(GUESS_RATE*100)+'% of questions guessed fast\n');
console.log('  no guessing at all, floor on      : names the true weak area '+pc(cleanHit));
console.log('  guessing, floor OFF (old system)  : names the true weak area '+pc(offHit));
console.log('  guessing, floor ON  (new system)  : names the true weak area '+pc(onHit));
/* Deliberately NOT reporting this as a "% recovered" ratio: the denominator
   is (clean - off), which is a handful of cases, so the ratio swings wildly
   and once printed 209%. The three absolute rates above say it honestly. */
console.log('');
console.log('  report says ANYTHING at all       : '+pc(offAny)+'  ->  '+pc(onAny));
console.log('  report flags it as PACING         : '+pc(offP)+'  ->  '+pc(onP));
console.log('\n  THE PLAN — blitzed attempts given any pacing hours at all');
console.log('     old system : '+pc(offClock));
console.log('     new system : '+pc(onClock));
