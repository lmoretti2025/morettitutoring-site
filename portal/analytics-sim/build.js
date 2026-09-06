/* Builds the domain rows exactly the way report.html's classification pass
   does, using the SHIPPED constants imported from core.js. This part is
   replicated rather than extracted (the original is entangled with the DOM
   and the section objects) -- validate.js checks the replication against the
   live page before any of it is trusted. */
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('./core.js');

const PORTAL = process.env.PORTAL;
function loadBanks() {
  const w = {};
  const sandbox = { window: w };
  const src = fs.readFileSync(path.join(PORTAL, 'banks.js'), 'utf8');
  new Function('window', src)(w);
  return w;
}
function loadBudgets() {
  const w = {};
  const src = fs.readFileSync(path.join(PORTAL, 'time-budgets.js'), 'utf8');
  new Function('window', src)(w);
  return w.TIME_BUDGETS;
}

const BANKS = loadBanks();
const TB = loadBudgets();

function form(sectionKey, variant) {
  if (sectionKey === 'math') {
    return BANKS.MATH_MODULE1.concat(variant === 'Harder' ? BANKS.MATH_MODULE2_HARDER : BANKS.MATH_MODULE2_EASIER);
  }
  return BANKS.RW_MODULE1.concat(variant === 'Harder' ? BANKS.RW_MODULE2_HARDER : BANKS.RW_MODULE2_EASIER);
}

/* One section's worth of rows -> the domain buckets renderSkillDiagnosis
   consumes. Mirrors the shipped pass: three time bands against the
   question's own budget, four-way bucket, domain rollup with a skills map. */
function bucketRows(rows, sectionKey) {
  const domains = {};
  const correctTimes = rows.filter(r => r.ok && r.q.type !== 'fr' && r.timeMs > 0).map(r => r.timeMs);
  const typical = C.median(correctTimes);
  const cutoff = Math.min(typical * C.RUSHED_REL, C.RUSHED_ABS_CAP);
  const stuckCutoff = typical * C.STUCK_REL;
  for (const r of rows) {
    if (!r.sk) continue;
    let qBudgetMs = 0;
    const bq = TB.budgetSecondsFor(sectionKey, r.q.domain, r.sk || r.dom, r.q.difficulty, 1);
    qBudgetMs = (bq && bq.ms) || 0;
    const t = r.timeMs;
    const slow    = qBudgetMs ? (t >= qBudgetMs * C.STUCK_BUDGET_REL) : (t >= stuckCutoff);
    const hurried = typical ? (t < cutoff) : (qBudgetMs ? t < qBudgetMs * C.RUSHED_BUDGET_REL : false);
    const db = domains[r.dom] || (domains[r.dom] = {
      mastered:0, inefficient:0, stuck:0, onpace:0, rushed:0,
      total:0, skills:{}, sec:sectionKey });
    db.total++;
    if (r.ok) { if (slow) db.inefficient++; else db.mastered++; }
    else if (slow) db.stuck++;
    else if (hurried) db.rushed++;
    else db.onpace++;
    const ds = db.skills[r.sk] || (db.skills[r.sk] = { total:0, missed:0, missedHard:0, stuck:0 });
    ds.total++;
    if (!r.ok) { ds.missed++; if (slow) ds.stuck++; if (r.q.difficulty === 'hard') ds.missedHard++; }
  }
  return domains;
}

function toAllRows(domainMaps) {
  const merged = {};
  for (const m of domainMaps) for (const [k, v] of Object.entries(m)) merged[k] = v;
  return Object.entries(merged).map(([dm, b]) => ({
    skill: dm, isDomain: true, skills: b.skills, sec: b.sec,
    mastered: b.mastered, inefficient: b.inefficient, stuck: b.stuck,
    onpace: b.onpace, rushed: b.rushed,
    content: b.stuck + b.onpace,
    total: b.total
  }));
}

module.exports = { BANKS, TB, form, bucketRows, toAllRows };
