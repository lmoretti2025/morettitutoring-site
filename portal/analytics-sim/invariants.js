/* ═══ INVARIANTS ═══
   Properties that must hold for EVERY attempt, checked over a large sweep of
   simulated students drawn from the calibrated distribution. These are not
   accuracy measures -- they are the things that must never be false, whatever
   the data. A violation here is a bug, not a trade-off. */
'use strict';
const St=require('./student.js'), B=require('./build.js'), D=require('./diagnose.js'),
      C=require('./core.js'), PLAN=require('./plan.js');
const DOM=['Algebra','Advanced Math','Geometry and Trigonometry','Problem-Solving and Data Analysis',
           'Information and Ideas','Craft and Structure','Expression of Ideas','Standard English Conventions'];
const fails={};
let leadNotBiggest=0, leadChecked=0;
function check(name,cond,ctx){ if(!cond){ (fails[name]=fails[name]||[]).push(ctx); } }

function one(seed){
  const rand=St.rng(seed);
  // deliberately wide: includes students outside the observed range, plus
  // degenerate profiles (perfect, near-zero, total clock collapse)
  const mode=seed%13;
  let ability=-1.5+5.5*rand();
  if(mode===0) ability=4.5;            // near-perfect
  if(mode===1) ability=-2.0;           // near-floor
  const gap= mode===2 ? 0 : 3.0*rand();
  const clockTrouble = mode===3 ? 0.4 : (mode===4 ? 0.95 : 0);
  const s={ability,gapDomain:gap>0?DOM[seed%8]:null,gapSize:gap,
           paceMu:St.CALIBRATED_PACE.mu+(1.2*rand()-0.6),
           paceSigma:0.3+1.0*rand(),
           mathVariant:rand()<0.5?'Easier':'Harder',rwVariant:rand()<0.5?'Easier':'Harder'};
  const secs=St.sit(s,seed+900001);
  if(clockTrouble){ for(const sec of secs){ const cut=Math.floor(sec.rows.length*clockTrouble);
    for(let i=cut;i<sec.rows.length;i++){ sec.rows[i].ok=false; sec.rows[i].skipped=true; sec.rows[i].timeMs=0; } } }

  const maps=secs.map(x=>B.bucketRows(x.rows.filter(r=>!r.skipped),x.key));
  const rows=B.toAllRows(maps);

  // 1. buckets partition the questions, exactly
  rows.forEach(r=>{
    const sum=r.mastered+r.skimmed+r.inefficient+r.stuck+r.onpace+r.rushed;
    check('buckets partition total', sum===r.total, {seed,dom:r.skill,sum,total:r.total});
    check('content = stuck + onpace', r.content===r.stuck+r.onpace, {seed,dom:r.skill});
    check('no negative buckets', [r.mastered,r.inefficient,r.stuck,r.onpace,r.rushed].every(v=>v>=0), {seed});
  });

  const named=D.diagnose(rows);
  // 2. anything named must have cleared the evidence bar
  named.forEach(r=>{
    check('named has severity>0', r.severity>0, {seed,dom:r.skill,sev:r.severity});
    check('named is judgeable', r.total>=C.MIN_JUDGEABLE_N, {seed,dom:r.skill,n:r.total});
    check('priority finite & >=0', Number.isFinite(r.priority)&&r.priority>=0, {seed,p:r.priority});
    check('reach weight sane', r.reach&&r.reach.w>0&&r.reach.w<2, {seed,w:r.reach&&r.reach.w});
    check('ci within [0,1]', r.ci.lo>=0&&r.ci.hi<=1&&r.ci.lo<=r.ci.hi, {seed,ci:r.ci});
    check('leadN <= total', r.leadN<=r.total, {seed,lead:r.leadN,total:r.total});
  });
  // 3. ranking is a valid ordering
  for(let i=1;i<named.length;i++){
    const a=named[i-1],b=named[i];
    check('sorted by severity then priority',
      a.severity>b.severity || (a.severity===b.severity && (a.priority>b.priority-1e-9)),
      {seed,a:[a.skill,a.severity,a.priority],b:[b.skill,b.severity,b.priority]});
  }
  // 4. the plan, from the diagnosis card's own counts
  let content=0,method=0,clock=0;
  for(const sec of secs){
    for(const r of sec.rows){ if(r.skipped){clock++; continue;} }
  }
  rows.forEach(r=>{ content+=r.content; });
  method = Math.round(rows.reduce((a,r)=>a+r.inefficient,0));
  const plan=PLAN.allocate({content,method,clock});
  if(plan){
    const sum=+(plan.hours.content+plan.hours.method+plan.hours.clock).toFixed(2);
    check('plan sums to weekly', Math.abs(sum-plan.weekly)<1e-9, {seed,sum,weekly:plan.weekly});
    check('plan weekly in [1,5]', plan.weekly>=1-1e-9&&plan.weekly<=5+1e-9, {seed,weekly:plan.weekly});
    check('plan bands >= 0.5 or 0',
      [plan.hours.content,plan.hours.method,plan.hours.clock].every(v=>v===0||v>=0.5), {seed,h:plan.hours});
    check('maintenance iff nothing lost',
      (plan.pointsLost===0)===plan.maintenanceOnly, {seed,lost:plan.pointsLost,m:plan.maintenanceOnly});
    check('all plan numbers finite',
      [plan.weekly,plan.hours.content,plan.hours.method,plan.hours.clock].every(Number.isFinite), {seed,plan});
  }

  /* 5. HEADLINE CLAIMS. Every comparative statement the headline makes has
     to be true of the data it is printed beside. Both prerequisite swaps
     once asserted a superlative outright -- "the biggest pile of misses is
     in X" -- and it was false on ~31% of the attempts that reached it,
     because an area leads by SEPARATING from the student's own baseline,
     not by holding the most misses. The two guards below are the exact
     predicates report.html now gates that wording on; if a threshold there
     drifts, this fails rather than shipping a false sentence. */
  if(named.length){
    const top=named[0];
    const missesOf=r=>r.total-(r.mastered+r.inefficient+r.skimmed);
    const isBiggestPile=r=>rows.every(o=>o===r||missesOf(o)<=missesOf(r));
    /* The claim the copy makes is "pile of MISSES", so the quantity it
       compares must be every wrong answer, not the content-attributed
       subset. Mixing the two is what made the first fix still slightly
       dishonest: it put content misses on one side and total misses on the
       other. This holds the bucket algebra that makes them comparable. */
    check('content misses are a subset of all misses',
      rows.every(r=>missesOf(r)>=r.content), {seed});
    check('all misses = stuck + onpace + rushed',
      rows.every(r=>missesOf(r)===r.stuck+r.onpace+r.rushed), {seed});
    /* A skimmed answer is RIGHT. It must never be counted as a miss, and it
       must never be counted as command -- those are the two ways the new
       bucket can silently corrupt a number that used to be sound. */
    check('skimmed never counted as a miss',
      rows.every(r=>r.total-(r.mastered+r.inefficient+r.skimmed)===r.stuck+r.onpace+r.rushed), {seed});
    check('command <= raw accuracy',
      rows.every(r=>(r.mastered+r.inefficient)<=(r.mastered+r.inefficient+r.skimmed)), {seed});
    check('skimmed >= 0', rows.every(r=>r.skimmed>=0), {seed});
    /* The lead is NOT generally the biggest pile -- that is the whole
       reason the superlative had to be gated. If this ever stopped being
       true the gate would be dead code and the finding would be stale. */
    if(!isBiggestPile(top)) leadNotBiggest++;
    leadChecked++;
  }
}
/* SOURCE GUARD. The sweep above can only see data, not the sentence that
   gets printed. This asserts the superlative wording in the shipped files is
   still behind its gate -- deleting the gate is exactly how the bug got in. */
{
  const fsx=require('fs'), px=require('path'), P=process.env.PORTAL;
  for(const f of ['report.html','index.html']){
    const src=fsx.readFileSync(px.join(P,f),'utf8');
    const guarded=/isBiggestPile\(top\)\s*\?\s*\n?\s*'The biggest pile of misses is in '/.test(src);
    const stray=(src.match(/'The biggest pile of misses is in '/g)||[]).length;
    const rdGated=/\(topMissed > fndMissed\)/.test(src);
    /* Both headlines must also branch on the LEAD CAUSE. severity 3 is a
       content gap; 2 and 1 are pacing and lost time. Arguing teachability
       about a row named for pacing is the bug this catches. */
    const mathSev=/if \(top\.severity === 3\) \{/.test(src);
    const readSev=/var cmp = \(top\.severity !== 3\)/.test(src);
    const bare=(src.match(/it is comprehension, and that moves in months/g)||[]).length;
    if(!guarded||stray!==1||!rdGated||!mathSev||!readSev||bare!==1){
      console.log('   SOURCE GUARD FAILED in '+f+
        '  {gated:'+guarded+', occurrences:'+stray+', readingGated:'+rdGated+
        ', mathSeverityBranch:'+mathSev+', readingSeverityBranch:'+readSev+
        ', comprehensionClaims:'+bare+'}');
      process.exitCode=1;
    }
  }
}
const N=Number(process.argv[2]||20000);
for(let i=0;i<N;i++) one(1000000+i);
const names=Object.keys(fails);
console.log('INVARIANT SWEEP — '+N.toLocaleString()+' simulated attempts\n');
if(!names.length){ console.log('   all invariants held.'); }
else names.forEach(n=>{
  console.log('   VIOLATED: '+n+'  ('+fails[n].length+' cases)');
  console.log('      e.g. '+JSON.stringify(fails[n][0]));
});
console.log('\n   lead is NOT the biggest pile of misses on '+
  (100*leadNotBiggest/Math.max(1,leadChecked)).toFixed(1)+'% of attempts'+
  '  ('+leadNotBiggest.toLocaleString()+' of '+leadChecked.toLocaleString()+')');
console.log('   -- which is why both prerequisite headlines gate that wording.');
