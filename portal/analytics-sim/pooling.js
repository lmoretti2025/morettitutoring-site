/* ═══ THE POOLING EXPERIMENT ═══
   How much does a second (and third) form actually buy?

   Same student, sat 1/2/3 times on independently-routed forms. Domain buckets
   are summed across sittings -- totals, every bucket, and the per-skill maps --
   and the SAME shipped gate is then run on the pooled rows. Nothing about the
   thresholds is relaxed: the only thing that changes is how much evidence sits
   behind each domain. */
'use strict';
const St=require('./student.js'), B=require('./build.js'), D=require('./diagnose.js'), C=require('./core.js');
const DOMAINS=['Algebra','Advanced Math','Geometry and Trigonometry','Problem-Solving and Data Analysis',
               'Information and Ideas','Craft and Structure','Expression of Ideas','Standard English Conventions'];

function sitting(student, seed, variantSeed){
  // Independently routed: which Module 2 a student sees varies by sitting.
  const r=St.rng(variantSeed);
  const s=Object.assign({},student,{
    mathVariant: r()<0.5?'Easier':'Harder',
    rwVariant:   r()<0.5?'Easier':'Harder'});
  const secs=St.sit(s,seed);
  return B.toAllRows(secs.map(x=>B.bucketRows(x.rows,x.key)));
}

function pool(listOfRowSets){
  const acc={};
  for(const rows of listOfRowSets) for(const r of rows){
    const a=acc[r.skill]||(acc[r.skill]={skill:r.skill,isDomain:true,sec:r.sec,skills:{},
      mastered:0,inefficient:0,stuck:0,onpace:0,rushed:0,total:0,hardTotal:0});
    ['mastered','inefficient','stuck','onpace','rushed','total'].forEach(k=>a[k]+=r[k]);
    a.hardTotal += Math.round(r.hardShare*r.total);
    for(const [sk,v] of Object.entries(r.skills||{})){
      const d=a.skills[sk]||(a.skills[sk]={total:0,missed:0,missedHard:0,stuck:0});
      d.total+=v.total; d.missed+=v.missed; d.missedHard+=(v.missedHard||0); d.stuck+=v.stuck;
    }
  }
  return Object.values(acc).map(a=>{ a.content=a.stuck+a.onpace;
    a.hardShare=a.total?a.hardTotal/a.total:0; return a; });
}

function mk(ability,dom,gap,seed){const r=St.rng(seed);
  return {ability,gapDomain:dom,gapSize:gap,paceMu:-0.15+0.3*r(),paceSigma:0.3+0.2*r()};}

function measure(nForms, ability, gap, trials, seed0){
  let any=0,hit=0,n=0,judge=0,leadN=0;
  for(let i=0;i<trials;i++){
    const dom = gap>0 ? DOMAINS[i%DOMAINS.length] : null;
    const s=mk(ability,dom,gap,seed0+i);
    const sets=[]; for(let f=0;f<nForms;f++) sets.push(sitting(s, seed0+100000*(f+1)+i, seed0+50000*(f+1)+i));
    const rows=pool(sets);
    judge += rows.filter(r=>r.total>=C.MIN_JUDGEABLE_N).length;
    const named=D.diagnose(rows);
    if(named.length){any++; leadN+=named[0].leadN;}
    if(dom && named[0] && named[0].skill===dom) hit++;
    n++;
  }
  return {any:any/n, sens:hit/n, prec:any?hit/any:0, judge:judge/n, leadN:leadN/Math.max(1,any)};
}
const P=x=>(x*100).toFixed(1)+'%';
const TR=1200;

console.log('POOLING: what a second and third form buy\n');
console.log('  Same student. Same shipped gate. Only the amount of evidence changes.\n');
for(const [label,ability] of [['weak  (~35%)',-0.6],['mid   (~55%)',0.4],['strong(~72%)',1.2]]){
  console.log('  '+label);
  console.log('     gap   forms   judgeable domains   names the TRUE gap   precision   evidence behind lead');
  for(const gap of [0.8,1.6]){
    for(const f of [1,2,3]){
      const m=measure(f,ability,gap,TR,300000+f*1000+Math.round(gap*10)*17);
      console.log('     '+gap.toFixed(1).padStart(4)+String(f).padStart(7)+
        m.judge.toFixed(1).padStart(18)+P(m.sens).padStart(21)+P(m.prec).padStart(12)+
        (m.leadN.toFixed(1)+' questions').padStart(23));
    }
  }
  console.log();
}
console.log('  FALSE POSITIVES (no gap at all)');
console.log('     forms   names something');
for(const f of [1,2,3]){
  let a=0,n=0;
  for(let i=0;i<2000;i++){ const ab=[-0.6,0.4,1.2,2.0][i%4];
    const m=measure(f,ab,0,1,700000+f*9000+i*13); a+=m.any; n++; }
  console.log('     '+String(f).padStart(5)+P(a/n).padStart(18));
}
