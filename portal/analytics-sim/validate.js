'use strict';
const fs=require('fs');
const B=require('./build.js'), D=require('./diagnose.js');
const live=JSON.parse(fs.readFileSync(process.argv[2],'utf8')).rows;

// Split by section: R&W numbers run 1..54, Math restarts at 1.
let split=0; for(let i=1;i<live.length;i++){ if(live[i].n<live[i-1].n){split=i;break;} }
const rwRows=live.slice(0,split), mathRows=live.slice(split);

// Which Module-2 variant did the page route to? Pick the variant whose skill
// sequence matches the rows we scraped.
function pickVariant(sectionKey, rows){
  let best=null,bestScore=-1;
  for(const v of ['Easier','Harder']){
    const qs=B.form(sectionKey,v);
    let m=0; rows.forEach((r,i)=>{ const q=qs[i]; if(q && (q.domain+' → '+(q.skill||q.domain))===r.skill) m++; });
    if(m>bestScore){bestScore=m;best=v;}
  }
  return {variant:best,match:bestScore,of:rows.length};
}
const rwV=pickVariant('reading-writing',rwRows), mV=pickVariant('math',mathRows);
console.log('variant match  R&W:',rwV.variant,rwV.match+'/'+rwV.of,'   Math:',mV.variant,mV.match+'/'+mV.of);

function build(sectionKey,variant,rows){
  const qs=B.form(sectionKey,variant);
  return rows.map((r,i)=>({ q:qs[i], ok:r.result==='Correct',
    sk:qs[i].skill||qs[i].domain, dom:qs[i].domain,
    timeMs:(r.secs==null?0:r.secs*1000) }));
}
const maps=[ B.bucketRows(build('reading-writing',rwV.variant,rwRows),'reading-writing'),
             B.bucketRows(build('math',mV.variant,mathRows),'math') ];
const rows=B.toAllRows(maps);
const named=D.diagnose(rows);
console.log('\nsimulator says section 1 names:', named.length?named.map(r=>r.skill+' [sev'+r.severity+']').join(', '):'(nothing)');
console.log('\nper-domain buckets the simulator built:');
rows.sort((a,b)=>b.content-a.content).forEach(r=>console.log('   '+r.skill.padEnd(36)+'n='+String(r.total).padStart(3)+
 '  mast '+String(r.mastered).padStart(2)+'  ineff '+String(r.inefficient).padStart(2)+
 '  stuck '+String(r.stuck).padStart(2)+'  onpace '+String(r.onpace).padStart(2)+'  rushed '+String(r.rushed).padStart(2)));
