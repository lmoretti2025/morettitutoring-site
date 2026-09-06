/* ═══ THE CALIBRATED STUDY ═══
   Everything below is measured against the shipped code, with every free
   parameter fitted to Luca's own students rather than assumed:

     difficulty offsets   easy +0.71 / medium 0 / hard -0.29   (882 real questions)
     pace                 lognormal mu -0.416, sigma 0.782     (real time/budget)
     ability              N(1.20, 1.22) truncated to [-0.2, 3.7]  (9 real attempts)

   The classifier is the current one, including the self-relative `hurried`
   rule, which the real data forced. */
'use strict';
const St=require('./student.js'), B=require('./build.js'), D=require('./diagnose.js'), C=require('./core.js');
const DOM=['Algebra','Advanced Math','Geometry and Trigonometry','Problem-Solving and Data Analysis',
           'Information and Ideas','Craft and Structure','Expression of Ideas','Standard English Conventions'];
const ABILITY={mean:1.20,sd:1.22,lo:-0.2,hi:3.7};

function drawAbility(rand){
  for(;;){ const a=ABILITY.mean+ABILITY.sd*St.normal(rand);
    if(a>=ABILITY.lo&&a<=ABILITY.hi) return a; }
}
function run(seed,gap,domIdx){
  const rand=St.rng(seed);
  const ability=drawAbility(rand);
  const dom = gap>0 ? DOM[domIdx%DOM.length] : null;
  const s={ability,gapDomain:dom,gapSize:gap,
           paceMu:St.CALIBRATED_PACE.mu+(0.3*rand()-0.15),
           paceSigma:St.CALIBRATED_PACE.sigma,
           mathVariant: rand()<0.5?'Easier':'Harder',
           rwVariant:   rand()<0.5?'Easier':'Harder'};
  const secs=St.sit(s,seed+31337);
  const rows=B.toAllRows(secs.map(x=>B.bucketRows(x.rows,x.key)));
  const named=D.diagnose(rows);
  const correct=secs.reduce((x,y)=>x+y.rows.filter(r=>r.ok).length,0);
  const total=secs.reduce((x,y)=>x+y.rows.length,0);
  return {ability,dom,any:named.length>0,lead:named[0]?named[0].skill:null,pct:correct/total,s};
}
const P=x=>(x*100).toFixed(1)+'%';
const N=4000;

console.log('CALIBRATED TO YOUR STUDENTS  (ability N(1.20,1.22), real pace, real difficulty spread)\n');

console.log('FALSE POSITIVES -- student with no gap at all');
{ let a=0,n=0,acc=0;
  for(let i=0;i<N;i++){const t=run(400000+i,0,0); if(t.any)a++; acc+=t.pct; n++;}
  console.log('   names something: '+P(a/n)+'   (mean score '+P(acc/n)+')'); }

console.log('\nSENSITIVITY & PRECISION by gap size');
console.log('   gap    fires    names the TRUE gap    precision');
for(const gap of [0.8,1.6,2.4]){
  let f=0,h=0,n=0;
  for(let i=0;i<N;i++){const t=run(500000+i*7+gap*100,gap,i);
    if(t.any)f++; if(t.lead===t.dom)h++; n++;}
  console.log('   '+gap.toFixed(1)+P(f/n).padStart(9)+P(h/n).padStart(21)+(f?P(h/f):'--').padStart(13));
}

console.log('\nSENSITIVITY by score band  (clear gap, 1.6)');
console.log('   score band     n      names the TRUE gap    precision');
const bands=[[0,0.6,'under 60%'],[0.6,0.75,'60-75%'],[0.75,0.88,'75-88%'],[0.88,1.01,'over 88%']];
{ const acc=bands.map(()=>({n:0,h:0,f:0}));
  for(let i=0;i<N*3;i++){ const t=run(600000+i,1.6,i);
    const bi=bands.findIndex(b=>t.pct>=b[0]&&t.pct<b[1]); if(bi<0)continue;
    acc[bi].n++; if(t.any)acc[bi].f++; if(t.lead===t.dom)acc[bi].h++; }
  bands.forEach((b,i)=>{const o=acc[i]; if(o.n<50)return;
    console.log('   '+b[2].padEnd(14)+String(o.n).padStart(5)+P(o.h/o.n).padStart(20)+(o.f?P(o.h/o.f):'--').padStart(13));}); }

console.log('\nTEST-RETEST  (same student, two sittings)');
console.log('   gap    both fire    SAME lead');
for(const gap of [1.6,2.4]){
  let both=0,agree=0,n=0;
  for(let i=0;i<N;i++){
    const a=run(700000+i,gap,i);
    const rand=St.rng(900000+i);
    const s2=Object.assign({},a.s,{mathVariant:rand()<0.5?'Easier':'Harder',rwVariant:rand()<0.5?'Easier':'Harder'});
    const secs=St.sit(s2,950000+i);
    const rows=B.toAllRows(secs.map(x=>B.bucketRows(x.rows,x.key)));
    const named=D.diagnose(rows);
    const lead2=named[0]?named[0].skill:null;
    if(a.any&&lead2){both++; if(a.lead===lead2)agree++;} n++;
  }
  console.log('   '+gap.toFixed(1)+P(both/n).padStart(13)+(both?P(agree/both):'--').padStart(13));
}
