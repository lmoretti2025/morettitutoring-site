/* Scores the REAL attempts (decoded from ReportLink) and runs them through the
   shipped classifier. Exclusions were applied at extraction time. */
'use strict';
const fs=require('fs'), path=require('path');
const C=require('./core.js'), B=require('./build.js'), D=require('./diagnose.js');
const P=process.env.PORTAL;
const w={}; new Function('window',fs.readFileSync(path.join(P,'practice-tests.js'),'utf8'))(w);
const PT=w.SAT_PRACTICE_TESTS;
const wb={}; new Function('window',fs.readFileSync(path.join(P,'banks.js'),'utf8'))(wb);

function sectionQuestions(bank,variant){
  return bank.module2Easier ? bank.module1.concat(bank['module2'+(variant||'Easier')]) : bank.module1;
}
function questionsFor(att, sec){
  if(att.pt){
    const t=PT.find(x=>x.id===att.pt); if(!t) return null;
    const bank = sec.k==='math' ? t.sections.math : t.sections.readingWriting;
    return sectionQuestions(bank, sec.v);
  }
  return sec.k==='math'
    ? wb.MATH_MODULE1.concat(sec.v==='Harder'?wb.MATH_MODULE2_HARDER:wb.MATH_MODULE2_EASIER)
    : wb.RW_MODULE1.concat(sec.v==='Harder'?wb.RW_MODULE2_HARDER:wb.RW_MODULE2_EASIER);
}
/* isCorrect + parseFractionOrDecimal EXTRACTED VERBATIM from report.html */
  function parseFractionOrDecimal(str) {
    str = (str == null ? '' : String(str)).trim();
    if (str.indexOf('/') !== -1) {
      var p = str.split('/');
      if (p.length === 2) {
        var num = parseFloat(p[0]), den = parseFloat(p[1]);
        if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
      }
    }
    var v = parseFloat(str.replace(/[^0-9.\-]/g, ''));
    return isNaN(v) ? null : v;
  }
  function isCorrect(q, given) {
    if (given === null || given === undefined) return false;
    if (q.type === 'mc') return given === q.correct;
    var v = (typeof given === 'object') ? given.value : null;
    if (v === null && typeof given === 'object') { v = parseFractionOrDecimal(given.raw); }
    var target = parseFractionOrDecimal(q.answer);
    return v !== null && target !== null && Math.abs(v - target) < 0.05;
  }

function rowsFor(att){
  const out=[];
  for(const sec of att.sections){
    const qs=questionsFor(att,sec); if(!qs) return null;
    const n=Math.min(qs.length,(sec.a||[]).length);
    const rows=[];
    for(let i=0;i<n;i++){
      const q=qs[i], given=sec.a[i];
      const skipped=(given===null||given===undefined||given==='');
      rows.push({q, ok:isCorrect(q,given), sk:q.skill||q.domain, dom:q.domain,
                 timeMs:(sec.tm&&sec.tm[i])||0, skipped});
    }
    out.push({key:sec.k, rows});
  }
  return out;
}
module.exports={rowsFor, questionsFor};

if(require.main===module){
  const atts=JSON.parse(fs.readFileSync(process.env.ATTEMPTS,'utf8'));
  let ok=0;
  console.log('scoring check — reconstructed vs the score recorded in the sheet\n');
  console.log('  sid       source            recorded    rebuilt   match');
  for(const a of atts){
    const secs=rowsFor(a);
    if(!secs){ console.log('  '+a.sid+'  '+(a.pt||'diagnostic')+'   <no bank>'); continue; }
    const c=secs.reduce((x,s)=>x+s.rows.filter(r=>r.ok).length,0);
    const t=secs.reduce((x,s)=>x+s.rows.length,0);
    const rec=(a.score||'').split('/')[0];
    const m=String(c)===String(rec);
    if(m)ok++;
    console.log('  '+a.sid+'  '+String(a.pt||'diagnostic').padEnd(18)+String(a.score||'').padEnd(11)+(c+'/'+t).padEnd(10)+(m?'yes':'NO'));
  }
  console.log('\n  exact score match: '+ok+'/'+atts.length);
}
