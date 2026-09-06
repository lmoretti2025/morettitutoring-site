/* WHAT GUESSING COSTS THE DIAGNOSIS.
   Baseline = the attempt as generated (unknowns come back wrong).
   Guessed  = the same attempt, but each wrong MULTIPLE-CHOICE question is
              flipped to correct with p = 1/4, which is exactly what a
              four-option guess does to a question the student cannot do.
   Everything else -- timing, the planted weakness, the seed -- is held
   identical, so any change in the diagnosis is caused by luck alone. */
'use strict';
const St=require('./student.js'), B=require('./build.js'), D=require('./diagnose.js');
const DOM=['Algebra','Advanced Math','Geometry and Trigonometry','Problem-Solving and Data Analysis',
           'Information and Ideas','Craft and Structure','Expression of Ideas','Standard English Conventions'];
const N=Number(process.argv[2]||20000);
let named0=0,named1=0, hit0=0,hit1=0, lost=0, gained=0, silenced=0;
const BANDS=[[0,.08,'under 8%'],[.08,.12,'8-12%'],[.12,.18,'12-18%  (Zahra 14%)'],
             [.18,.26,'18-26%'],[.26,1,'26%+   (John-Carlos 30%)']];
const strat=BANDS.map(b=>({lab:b[2],lo:b[0],hi:b[1],n:0,h0:0,h1:0,d0:0,d1:0,at:0,ash:0}));
let accTrue=0,accShown=0,nAcc=0, liftSum=0, liftN=0;
for(let s=0;s<N;s++){
  const seed=4000000+s, rand=St.rng(seed);
  const gapDom=DOM[seed%8];
  const cfg={ability:-0.3+3.2*rand(), gapDomain:gapDom, gapSize:1.2+1.8*rand(),
    paceMu:St.CALIBRATED_PACE.mu+(0.8*rand()-0.4), paceSigma:0.4+0.7*rand(),
    mathVariant:rand()<0.5?'Easier':'Harder', rwVariant:rand()<0.5?'Easier':'Harder'};
  const secs=St.sit(cfg,seed+11);
  // deep copy for the guessed world
  const g=secs.map(x=>({key:x.key,rows:x.rows.map(r=>({...r}))}));
  const r2=St.rng(seed+777);
  let flips=0, mcRight=0;
  for(const sec of g) for(const r of sec.rows){
    if(r.q.type!=='fr'){
      if(!r.ok && r2()<0.25){ r.ok=true; flips++; }
      if(r.ok) mcRight++;
    }
  }
  const liftShare = mcRight ? flips/mcRight : 0;
  if(mcRight){ liftSum+=liftShare; liftN++; }
  const bucket = strat.find(b=>liftShare>=b.lo && liftShare<b.hi);
  const rows0=B.toAllRows(secs.map(x=>B.bucketRows(x.rows,x.key)));
  const rows1=B.toAllRows(g.map(x=>B.bucketRows(x.rows,x.key)));
  const n0=D.diagnose(rows0), n1=D.diagnose(rows1);
  if(n0.length) named0++; if(n1.length) named1++;
  const in0=n0.some(r=>r.skill===gapDom), in1=n1.some(r=>r.skill===gapDom);
  if(in0) hit0++; if(in1) hit1++;
  if(in0&&!in1) lost++;
  if(!in0&&in1) gained++;
  if(n0.length&&!n1.length) silenced++;
  // how far the printed accuracy for the planted domain drifts from the truth
  const a=rows0.find(r=>r.skill===gapDom), b=rows1.find(r=>r.skill===gapDom);
  if(a&&b&&a.total){ accTrue+=(a.mastered+a.inefficient)/a.total;
                     accShown+=(b.mastered+b.inefficient)/b.total; nAcc++; }
  if(bucket){ bucket.n++; if(in0)bucket.h0++; if(in1)bucket.h1++;
              if(n0.length)bucket.d0++; if(n1.length)bucket.d1++;
              if(a&&b&&a.total){ bucket.at+=(a.mastered+a.inefficient)/a.total;
                                 bucket.ash+=(b.mastered+b.inefficient)/b.total; } }
}
const pc=x=>(100*x/N).toFixed(1)+'%';
console.log('GUESSING vs THE DIAGNOSIS — '+N.toLocaleString()+' paired attempts\n');
console.log('  mean guess lift (share of MC right answers): '+(100*liftSum/liftN).toFixed(1)+'%\n');
console.log('  planted weak area is NAMED');
console.log('     without guessing : '+pc(hit0)+'   ('+hit0.toLocaleString()+')');
console.log('     with guessing    : '+pc(hit1)+'   ('+hit1.toLocaleString()+')');
console.log('     -> detection lost: '+((100*(hit0-hit1)/Math.max(1,hit0)).toFixed(1))+'% of the cases it used to catch\n');
console.log('  report names ANYTHING');
console.log('     without guessing : '+pc(named0));
console.log('     with guessing    : '+pc(named1));
console.log('     went silent      : '+pc(silenced)+' of all attempts\n');
console.log('  planted-area accuracy the report PRINTS');
console.log('     true            : '+(100*accTrue/nAcc).toFixed(1)+'%');
console.log('     after guessing  : '+(100*accShown/nAcc).toFixed(1)+'%');
console.log('     overstated by   : '+(100*(accShown-accTrue)/nAcc).toFixed(1)+' points');
console.log('\n  BY HOW MUCH LUCK WAS ACTUALLY IN THE ATTEMPT');
console.log('     '+'guess lift'.padEnd(24)+'n'.padEnd(8)+'named true area'.padEnd(20)+'detection lost'.padEnd(17)+'accuracy overstated');
strat.forEach(b=>{ if(!b.n) return;
  const l0=100*b.h0/b.n, l1=100*b.h1/b.n;
  console.log('     '+b.lab.padEnd(24)+String(b.n).padEnd(8)+
    (l0.toFixed(0)+'% -> '+l1.toFixed(0)+'%').padEnd(20)+
    ((b.h0? (100*(b.h0-b.h1)/b.h0).toFixed(0):'-')+'%').padEnd(17)+
    ('+'+(100*(b.ash-b.at)/b.n).toFixed(1)+' pts'));
});
