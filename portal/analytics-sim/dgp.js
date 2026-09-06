/* ═══ ALTERNATIVE GROUND TRUTHS ═══
   The accuracy figures so far all rest on ONE assumption about how a real
   weakness is shaped: a uniform logit penalty applied to every question in
   one domain. That is a modelling convenience, not an observed fact, and if
   it is wrong then every sensitivity number derived from it is measuring my
   own assumption rather than the report.

   So the same report is measured against five different data-generating
   processes. Where a conclusion survives all five it is a property of the
   algorithm; where it only holds under 'domain' it is a property of my
   model and must not be quoted. */
'use strict';
const St=require('./student.js'), B=require('./build.js');

const DOM=['Algebra','Advanced Math','Geometry and Trigonometry','Problem-Solving and Data Analysis',
           'Information and Ideas','Craft and Structure','Expression of Ideas','Standard English Conventions'];
// domains that plausibly move together (shared prerequisites)
const CORRELATED={'Algebra':'Advanced Math','Advanced Math':'Algebra',
  'Geometry and Trigonometry':'Advanced Math','Problem-Solving and Data Analysis':'Algebra',
  'Information and Ideas':'Craft and Structure','Craft and Structure':'Information and Ideas',
  'Expression of Ideas':'Standard English Conventions','Standard English Conventions':'Expression of Ideas'};

function skillsOf(domain, form){
  const s=new Set();
  form.forEach(q=>{ if(q.domain===domain) s.add(q.skill||q.domain); });
  return [...s];
}

/* Each DGP returns a penalty in logits for one question. */
function makePenalty(kind, cfg, forms, rand){
  const dom=cfg.gapDomain, size=cfg.gapSize;
  if(!dom||!size) return ()=>0;
  switch(kind){
    case 'domain':            // the original assumption
      return q => q.domain===dom ? size : 0;
    case 'skill': {           // weakness lives in 1-2 SKILLS, not the whole domain
      const all=[...new Set(forms.flat().filter(q=>q.domain===dom).map(q=>q.skill||q.domain))];
      const pick=all.slice(0, Math.max(1, Math.round(all.length*0.4)));
      // concentrated: the same total damage packed into fewer questions
      const boost=size*(all.length/Math.max(1,pick.length));
      return q => (q.domain===dom && pick.indexOf(q.skill||q.domain)>=0) ? boost : 0;
    }
    case 'difficulty':        // fine on easy, falls apart on hard (a ceiling)
      return q => q.domain===dom ? (q.difficulty==='hard'?size*1.8:(q.difficulty==='medium'?size*0.7:0)) : 0;
    case 'correlated': {      // two related domains weak together
      const other=CORRELATED[dom];
      return q => q.domain===dom ? size : (q.domain===other ? size*0.6 : 0);
    }
    case 'none':              // the null: no domain structure at all
      return () => 0;
  }
  throw new Error('unknown dgp '+kind);
}

function sit(kind, cfg, seed){
  const rand=St.rng(seed);
  const forms=[B.form('reading-writing',cfg.rwVariant||'Easier'), B.form('math',cfg.mathVariant||'Easier')];
  const penalty=makePenalty(kind,cfg,forms,rand);
  const DIFF=St.DIFF_OFFSET;
  const out=[];
  [['reading-writing',forms[0]],['math',forms[1]]].forEach(([key,qs])=>{
    const rows=qs.map(q=>{
      const a=cfg.ability+(DIFF[q.difficulty]||0)-penalty(q);
      const p=Math.min(0.97,Math.max(0.03,1/(1+Math.exp(-a))));
      const b=B.TB.budgetSecondsFor(key,q.domain,q.skill||q.domain,q.difficulty,1);
      const budget=(b&&b.ms)||60000;
      const z=St.normal(rand);
      return {q, ok:rand()<p, sk:q.skill||q.domain, dom:q.domain,
              timeMs:Math.max(3000, budget*Math.exp(cfg.paceMu+cfg.paceSigma*z))};
    });
    out.push({key,rows});
  });
  return out;
}

/* The domain a perfectly-informed observer would name: the one where this
   student is expected to lose the most questions on this form. Computed from
   the SAME penalty function, so it is the truth for whichever DGP is running
   -- including 'skill', where the answer is still a domain because that is
   the grain section 1 reports at. */
function trueLead(kind, cfg){
  const forms=[B.form('reading-writing',cfg.rwVariant||'Easier'), B.form('math',cfg.mathVariant||'Easier')];
  const penalty=makePenalty(kind,cfg,forms,St.rng(1));
  const DIFF=St.DIFF_OFFSET;
  const loss={};
  forms.flat().forEach(q=>{
    const base=1/(1+Math.exp(-(cfg.ability+(DIFF[q.difficulty]||0))));
    const with_=1/(1+Math.exp(-(cfg.ability+(DIFF[q.difficulty]||0)-penalty(q))));
    loss[q.domain]=(loss[q.domain]||0)+(base-with_);
  });
  const ranked=Object.entries(loss).sort((a,b)=>b[1]-a[1]);
  return {lead:ranked[0][0], margin:ranked[0][1]-ranked[1][1], loss:ranked[0][1]};
}
module.exports={sit,trueLead,DOM,makePenalty};
