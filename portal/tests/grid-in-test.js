#!/usr/bin/env node
/*
 * Grid-in grading test: runs the shipped grid-in.js against every
 * student-produced-response question the portal serves.
 *
 * For every grid-in in banks.js (the diagnostic), question-bank-math.js,
 * challenge-questions.js and practice-tests.js:
 *   - the key, its window.FR_ALTERNATES entries, and the SAT's own
 *     box-filling decimal forms of it (.4166 and .4167 for 5/12) pass;
 *   - every form quoted in the explanation's "Note that ... are examples
 *     of ways to enter a correct answer" line passes;
 *   - near misses fail: a neighbouring fraction (5/13 for 5/12), the key
 *     written short (.42, .417), and the key off by 0.01-0.04, which the
 *     old absolute 0.05 tolerance accepted.
 * It also checks that index.html and report.html load grid-in.js and
 * have no grader of their own left.
 *
 * Run: node tests/grid-in-test.js   (exits non-zero on any failure)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PORTAL = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(PORTAL, f), 'utf8');
const { gridInCorrect, isRoundedKey } = require(path.join(PORTAL, 'grid-in.js'));

let passed = 0, failed = 0;
const failures = [];
function check(ok, label) {
  if (ok) { passed++; return; }
  failed++;
  failures.push(label);
}
function section(title) { console.log('\n' + title); }

// ---- load the banks and FR_ALTERNATES exactly as the browser would ----
const INDEX_HTML = read('index.html'), REPORT_HTML = read('report.html');
const ctx = { window: {} };
ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const f of ['banks.js', 'question-bank-math.js', 'challenge-questions.js', 'practice-tests.js'])
  vm.runInContext(read(f), ctx, { filename: f });
const altBlock = /window\.FR_ALTERNATES\s*=\s*\{[\s\S]*?\};/.exec(INDEX_HTML);
if (!altBlock) throw new Error('window.FR_ALTERNATES not found in index.html');
vm.runInContext(altBlock[0], ctx);
const W = ctx.window, ALTS = W.FR_ALTERNATES;

const items = [];
function add(where, q) {
  if (!q || q.type !== 'fr') return;
  const key = String(q.answerValue != null ? q.answerValue : q.answer);
  const qid = q.qid || null;
  items.push({ where, qid, key, keys: [key].concat((qid && ALTS[qid]) || []), expl: q.explanation || '' });
}
(W.QUESTION_BANK_MATH || []).forEach((q) => add('question-bank-math ' + q.qid, q));
(W.CHALLENGE_MATH || []).forEach((q, i) => add('challenge ' + (q.key || i), q));
['MATH_MODULE1', 'MATH_MODULE2_EASIER', 'MATH_MODULE2_HARDER'].forEach((m) =>
  (W[m] || []).forEach((q, i) => add('banks.js ' + m + ' #' + (i + 1), q)));
(W.SAT_PRACTICE_TESTS || []).forEach((t) => {
  const m = t.sections && t.sections.math;
  if (m) ['module1', 'module2Easier', 'module2Harder'].forEach((mk) =>
    (m[mk] || []).forEach((q, i) => add(t.id + ' ' + mk + ' #' + (i + 1), q)));
});

// ---- exact rationals (BigInt), independent of grid-in.js ----
function rational(s) {
  s = String(s).trim().replace(/−/g, '-');
  let m = /^(-?)(\d+)\/(\d+)$/.exec(s);
  if (m) return { neg: m[1] === '-', n: BigInt(m[2]), d: BigInt(m[3]) };
  m = /^(-?)(\d*)\.?(\d*)$/.exec(s);
  if (!m || !(m[2] + m[3])) return null;
  return { neg: m[1] === '-', n: BigInt((m[2] || '0') + m[3]), d: 10n ** BigInt(m[3].length) };
}
const sameValue = (a, b) => a && b && (a.n === 0n && b.n === 0n || a.neg === b.neg && a.n * b.d === b.n * a.d);
// |v| to k places, truncated and rounded half-up, as "int.frac" strings.
function places(v, k) {
  const scaled = v.n * 10n ** BigInt(k), t = scaled / v.d, r = scaled % v.d;
  const fmt = (x) => { const s = x.toString().padStart(k + 1, '0'); return k ? s.slice(0, -k) + '.' + s.slice(-k) : s; };
  return { trunc: fmt(t), round: fmt(2n * r >= v.d ? t + 1n : t), exact: r === 0n };
}
// The SAT's box-filling decimal forms of v (5 characters, 6 if negative:
// either way 4 digits once the point and any minus sign are placed), with
// and without a leading zero when |v| < 1.
function boxForms(v) {
  const sign = v.neg ? '-' : '', room = 4;
  const intLen = (v.n / v.d).toString().length;
  const out = [];
  const push = (k, dropZero) => {
    if (k < 1) return;
    const p = places(v, k);
    if (p.exact) return;
    for (const s of [p.trunc, p.round]) {
      if (s.split('.')[0].length !== intLen) continue; // rounding carried into a new digit
      out.push(sign + (dropZero ? s.replace(/^0\./, '.') : s));
    }
  };
  if (v.n < v.d) { push(room, true); push(room - 1, false); }
  else push(room - intLen, false);
  return out;
}

// ---- College Board's "Note that ... are examples of ways to enter" ----
function noteForms(expl) {
  const m = /Note that([\s\S]*?)(?:are|is) (?:examples?|an example) of ways to enter/i.exec(expl);
  if (!m) return [];
  const text = m[1]
    .replace(/<span[^>]*flex-direction:\s*column[^>]*>\s*<span[^>]*>([^<]*)<\/span>\s*<span[^>]*>([^<]*)<\/span>\s*<\/span>/g, ' $1/$2 ')
    .replace(/<[^>]+>/g, ' ').replace(/&minus;|−/g, '-').replace(/&nbsp;/g, ' ');
  return text.split(/,|\band\b|\bor\b/).map((s) => s.trim()).filter(Boolean);
}

// ---- 1. every call site goes through grid-in.js ----
section('Call sites');
for (const [name, html] of [['index.html', INDEX_HTML], ['report.html', REPORT_HTML]]) {
  check(/<script src="grid-in\.js[?"]/.test(html), name + ' loads grid-in.js');
  check(!/Math\.abs\([^)]*\)\s*<\s*0\.05/.test(html), name + ' has no absolute-tolerance grader left');
  check(!/function parseFractionOrDecimal/.test(html), name + ' has no local fr parser left');
}
const frDefs = INDEX_HTML.match(/function checkFrAnswer\([^)]*\)\s*\{[^}]*\}/g) || [];
check(frDefs.length === 3 && frDefs.every((d) => /gridInCorrect\(/.test(d)), 'all 3 checkFrAnswer copies delegate to gridInCorrect');
const isCorrectDefs = (INDEX_HTML + REPORT_HTML).match(/function isCorrect\(q, given\)\s*\{[\s\S]*?\n  \}/g) || [];
check(isCorrectDefs.length === 3 && isCorrectDefs.every((d) => /gridInCorrect\(/.test(d)), 'all 3 isCorrect copies delegate to gridInCorrect');
console.log('  ' + (failed ? '\x1b[31m' + failed + ' failed\x1b[0m' : '\x1b[32mok\x1b[0m'));

// ---- 2. the cases from the bug report ----
section('Reported cases');
const cc = items.find((it) => it.qid === 'cc6aba19');
check(cc && cc.key === '11/26', 'cc6aba19 is in the bank with key 11/26');
for (const [raw, key, want] of [
  ['5/12', '5/12', true], ['10/24', '5/12', true], ['.4166', '5/12', true], ['.4167', '5/12', true],
  ['0.416', '5/12', true], ['0.417', '5/12', true],
  ['5/13', '5/12', false], ['2/5', '5/12', false], ['.4', '5/12', false], ['7/17', '5/12', false],
  ['.42', '5/12', false], ['.417', '5/12', false], ['.385', '5/12', false], ['.3846', '5/12', false],
  ['11/26', '11/26', true], ['.4230', '11/26', true], ['.4231', '11/26', true],
  ['11/25', '11/26', false], ['10/26', '11/26', false], ['.44', '11/26', false], ['.4', '11/26', false],
  ['7/2', '7/2', true], ['3.5', '7/2', true], ['3 1/2', '7/2', false], ['31/2', '7/2', false],
  ['-1/3', '-1/3', true], ['-.3333', '-1/3', true], ['-0.333', '-1/3', true], ['-.333', '-1/3', false], ['-.33', '-1/3', false],
  ['2/3', '2/3', true], ['.6666', '2/3', true], ['.6667', '2/3', true], ['0.666', '2/3', true], ['0.667', '2/3', true],
  ['.66', '2/3', false], ['0.67', '2/3', false], ['.667', '2/3', false],
]) check(gridInCorrect(raw, key) === want, `"${raw}" against ${key} should be ${want ? 'accepted' : 'rejected'}`);

// Keys stored already rounded, with the exact answer each was rounded
// from (re-derived from the question): the exact answer and both of its
// box forms must pass, and the next box value over must not.
for (const [key, exact, near] of [
  ['-2.8333', '-17/6', '-2.834'],   // banks.js MATH_MODULE1 #20: y = 6x + 22 shifted down 5
  ['9.667', '29/3', '9.668'],       // sat-practice-2: sum of the roots of 3x^2 - 29x + 56
  ['6.556', '59/9', '6.557'],       // sat-practice-2: 9x - 10y = 59 at y = 0
  ['-0.3267', '-49/150', '-.3268'], // sat-practice-2: t = -2.352 / 7.2
]) {
  check(isRoundedKey(key), `${key} is recognised as an already-rounded key`);
  for (const f of [exact].concat(boxForms(rational(exact))))
    check(gridInCorrect(f, key), `"${f}" (the exact answer ${exact}) against rounded key ${key} should be accepted`);
  check(!gridInCorrect(near, key), `"${near}" against rounded key ${key} should be rejected`);
}
console.log('  ' + (failures.length ? '\x1b[31m' + failures.length + ' failed so far\x1b[0m' : '\x1b[32mok\x1b[0m'));

// ---- 3. every grid-in in every bank ----
section('Every grid-in (' + items.length + ' questions)');
let oldRuleNearMisses = 0, noteCount = 0, nearMissCount = 0;
const oldRule = (raw, keys) => keys.some((k) => {
  const a = rational(raw), b = rational(k);
  if (!a || !b) return false;
  const av = Number(a.n) / Number(a.d) * (a.neg ? -1 : 1), bv = Number(b.n) / Number(b.d) * (b.neg ? -1 : 1);
  return Math.abs(av - bv) < 0.05;
});
for (const it of items) {
  const where = `${it.where} [key ${it.key}]`;
  const values = it.keys.map(rational);
  const accepted = (v) => values.some((kv) => sameValue(kv, v));

  // Must pass.
  for (const k of it.keys) {
    check(gridInCorrect(k, it.keys), `${where}: its own key/alternate "${k}" is rejected`);
    const v = rational(k);
    if (!v) continue;
    if (!isRoundedKey(k)) for (const f of boxForms(v)) check(gridInCorrect(f, it.keys), `${where}: SAT box form "${f}" of ${k} is rejected`);
    if (v.d !== 1n && /\//.test(k)) check(gridInCorrect((v.neg ? '-' : '') + 2n * v.n + '/' + 2n * v.d, it.keys), `${where}: equivalent fraction of ${k} is rejected`);
  }
  for (const f of noteForms(it.expl)) {
    noteCount++;
    check(gridInCorrect(f, it.keys), `${where}: explanation's own form "${f}" is rejected`);
  }

  // Must fail.
  const misses = new Set();
  for (const k of it.keys) {
    const v = rational(k);
    if (!v || v.d === 1n) continue;
    const s = v.neg ? '-' : '';
    if (/\//.test(k)) {
      for (const [n, d] of [[v.n + 1n, v.d], [v.n - 1n, v.d], [v.n, v.d + 1n], [v.n, v.d - 1n]])
        if (n > 0n && d > 0n) misses.add(s + n + '/' + d);
    }
    const two = places(v, 2), three = places(v, 3);
    if (!two.exact) { misses.add(s + two.round.replace(/^0\./, '.')); misses.add(s + two.trunc.replace(/^0\./, '.')); }
    if (!three.exact && v.n < v.d) misses.add(s + three.round.replace(/^0\./, '.'));
    const approx = Number(v.n) / Number(v.d) * (v.neg ? -1 : 1);
    for (const off of [0.01, 0.02, 0.04, -0.01, -0.02, -0.04]) misses.add((approx + off).toFixed(4).replace(/^(-?)0\./, '$1.'));
  }
  for (const m of misses) {
    const mv = rational(m);
    if (!mv || accepted(mv)) continue;
    // A short form is only a near miss if it isn't itself a legal box-filling entry.
    if (it.keys.some((k) => { const v = rational(k); return v && boxForms(v).includes(m); })) continue;
    // For a key that is itself rounded, anything that rounds to the key is fair game.
    if (it.keys.some((k) => {
      if (!isRoundedKey(k)) return false;
      const kv = rational(k), kk = (k.split('.')[1] || '').length;
      return kv.neg === mv.neg && places(mv, kk).round === places(kv, kk).round;
    })) continue;
    nearMissCount++;
    if (oldRule(m, it.keys)) oldRuleNearMisses++;
    check(!gridInCorrect(m, it.keys), `${where}: near miss "${m}" is accepted`);
  }
}
console.log(`  ${noteCount} explanation forms, ${nearMissCount} near misses checked`);
console.log(`  (the old absolute 0.05 rule accepted ${oldRuleNearMisses} of those near misses)`);

const rounded = [...new Set(items.flatMap((it) => it.keys).filter(isRoundedKey))];
console.log('  keys treated as already rounded: ' + rounded.join(', '));

console.log('\n' + '─'.repeat(50));
if (failures.length) {
  console.log(failures.slice(0, 60).map((f) => '  \x1b[31m✗\x1b[0m ' + f).join('\n'));
  if (failures.length > 60) console.log('  … and ' + (failures.length - 60) + ' more');
}
console.log((failed ? '\x1b[31m' : '\x1b[32m') + passed + ' passed, ' + failed + ' failed\x1b[0m');
process.exit(failed ? 1 : 0);
