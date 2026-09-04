#!/usr/bin/env node
/*
 * Smoke test for the portal's scoring / accommodation-adjacent math.
 *
 * This does NOT run the app in a browser — index.html and report.html are
 * one giant DOM-coupled script, not a library. Instead it pulls the handful
 * of genuinely PURE functions (score-curve interpolation, the Mastered/
 * Inefficient/Stuck/Rushed skill classification, and Saved & Mistakes
 * reconciliation) straight out of the live source files by name, evaluates
 * them in isolation, and checks them against known-good fixture values.
 *
 * Why these three: they're the parts where a silent regression is worst —
 * a wrong composite score, a wrong "your biggest issue" verdict, or a
 * reconcile that quietly drops real data — and where a human staring at the
 * UI is least likely to notice something is off by a little. This is
 * exactly the bug class that hit report.html earlier (a stale, un-migrated
 * copy of the pacing math) — this script exists so that never has to be
 * caught by eye again.
 *
 * Run: node tests/smoke-test.js
 * Exits non-zero on any failure, so it's CI-ready if this project ever
 * gets a CI step.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const INDEX_HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const REPORT_HTML = fs.readFileSync(path.join(__dirname, '..', 'report.html'), 'utf8');

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  \x1b[32m✓\x1b[0m ' + name);
  } catch (e) {
    failed++;
    console.log('  \x1b[31m✗\x1b[0m ' + name);
    console.log('      ' + (e && e.message ? e.message : e));
  }
}
function section(title) { console.log('\n' + title); }
// vm.createContext() runs code in a separate realm, so an array/object it
// produces fails Node's reference-aware deepStrictEqual against a plain
// object even when the contents are identical. Compare by value instead.
function sameValue(a, b, msg) {
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  assert.strictEqual(sa, sb, (msg || 'value mismatch') + '\n  got:      ' + sa + '\n  expected: ' + sb);
}

// ── extraction helpers ──────────────────────────────────────────────────
// Pull `function NAME(...) { ... }` out of a source string by brace-balance
// (not a fixed line range, so this keeps working as the file changes).
function extractFunction(source, name) {
  const sigIdx = source.indexOf('function ' + name + '(');
  if (sigIdx === -1) throw new Error('function ' + name + ' not found in source');
  const braceStart = source.indexOf('{', sigIdx);
  let depth = 0, i = braceStart;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') { depth--; if (depth === 0) break; }
  }
  if (depth !== 0) throw new Error('unbalanced braces extracting function ' + name);
  return source.slice(sigIdx, i + 1);
}

// Pull `var NAME = [ ... ];` out of a source string by bracket-balance.
function extractArray(source, name) {
  const sigIdx = source.indexOf('var ' + name + ' =');
  if (sigIdx === -1) throw new Error('var ' + name + ' not found in source');
  const bracketStart = source.indexOf('[', sigIdx);
  let depth = 0, i = bracketStart;
  for (; i < source.length; i++) {
    if (source[i] === '[') depth++;
    else if (source[i] === ']') { depth--; if (depth === 0) break; }
  }
  if (depth !== 0) throw new Error('unbalanced brackets extracting array ' + name);
  return 'var ' + name + ' = ' + source.slice(bracketStart, i + 1) + ';';
}

// Grab one full line (used for the small inline `var A = 1, B = 2;` that
// severityOf() closes over) by matching its leading text.
function extractLineStartingWith(source, needle) {
  const idx = source.indexOf(needle);
  if (idx === -1) throw new Error('line starting with "' + needle + '" not found');
  const end = source.indexOf(';', idx);
  return source.slice(idx, end + 1);
}

function runInSandbox(code, exportNames) {
  const sandbox = { module: { exports: {} }, console };
  vm.createContext(sandbox);
  vm.runInContext(code + '\n' + exportNames.map(function (n) { return 'module.exports.' + n + ' = ' + n + ';'; }).join('\n'), sandbox);
  return sandbox.module.exports;
}

// ═══════════════════════════════════════════════════════════════════════
// 1. SCORE CURVES — index.html and report.html each keep their own copy
//    (by design, per the comment at index.html's SCORE_RW_CURVE — report.html
//    rebuilds sections from a base64 payload instead of live state, "different
//    inputs, same math"). If one gets edited and the other doesn't, scores
//    silently diverge between the in-app report and the emailed one.
// ═══════════════════════════════════════════════════════════════════════
section('Score curves (index.html vs report.html)');

// index.html names its versions with a "SCORE_" prefix and calls the
// interpolators scoreScaleFromPct/scoreModuleWeightFromPct/scoreSatSectionScore.
const idxCode = [
  extractArray(INDEX_HTML, 'SCORE_RW_CURVE'),
  extractArray(INDEX_HTML, 'SCORE_MATH_CURVE'),
  extractLineStartingWith(INDEX_HTML, 'var SCORE_RW_MODULE_WEIGHT_CURVE'),
  extractLineStartingWith(INDEX_HTML, 'var SCORE_MATH_MODULE_WEIGHT_CURVE'),
  extractFunction(INDEX_HTML, 'scoreScaleFromPct'),
  extractFunction(INDEX_HTML, 'scoreRoundToTen'),
  extractFunction(INDEX_HTML, 'scoreModuleWeightFromPct'),
  extractFunction(INDEX_HTML, 'scoreSatSectionScore'),
].join('\n');
const idxScoring = runInSandbox(idxCode, [
  'SCORE_RW_CURVE', 'SCORE_MATH_CURVE',
  'scoreScaleFromPct', 'scoreSatSectionScore',
]);

// report.html names its versions RW_CURVE/MATH_CURVE and calls the
// interpolators scaleFromPct/moduleWeightFromPct/satSectionScore.
const reportCode = [
  extractArray(REPORT_HTML, 'RW_CURVE'),
  extractArray(REPORT_HTML, 'MATH_CURVE'),
  extractLineStartingWith(REPORT_HTML, 'var RW_MODULE_WEIGHT_CURVE'),
  extractLineStartingWith(REPORT_HTML, 'var MATH_MODULE_WEIGHT_CURVE'),
  extractFunction(REPORT_HTML, 'scaleFromPct'),
  extractFunction(REPORT_HTML, 'roundToTen'),
  extractFunction(REPORT_HTML, 'moduleWeightFromPct'),
  extractFunction(REPORT_HTML, 'satSectionScore'),
].join('\n');
const reportScoring = runInSandbox(reportCode, [
  'RW_CURVE', 'MATH_CURVE',
  'scaleFromPct', 'satSectionScore',
]);

test('SAT R&W curve is identical in both files', () => {
  sameValue(idxScoring.SCORE_RW_CURVE, reportScoring.RW_CURVE);
});
test('SAT Math curve is identical in both files', () => {
  sameValue(idxScoring.SCORE_MATH_CURVE, reportScoring.MATH_CURVE);
});

// Known fixture points (independent of the curve arrays above — these are
// Luca's real Albert.io-sourced anchor points; if a curve edit changes one
// of these, that's exactly the kind of drift this test exists to catch).
test('Math raw 34/44 (balanced split) scores 630', () => {
  const sec = { c: 34, t: 44, c1: 17, t1: 22, c2: 17, t2: 22 };
  assert.strictEqual(idxScoring.scoreSatSectionScore(sec, idxScoring.SCORE_MATH_CURVE), 630);
  assert.strictEqual(reportScoring.satSectionScore(sec, reportScoring.MATH_CURVE), 630);
});
test('R&W raw 44/54 (balanced split) scores 650', () => {
  const sec = { c: 44, t: 54, c1: 22, t1: 27, c2: 22, t2: 27 };
  assert.strictEqual(idxScoring.scoreSatSectionScore(sec, idxScoring.SCORE_RW_CURVE), 650);
  assert.strictEqual(reportScoring.satSectionScore(sec, reportScoring.RW_CURVE), 650);
});
test('Perfect score (100%) hits the 800 ceiling', () => {
  const sec = { c: 44, t: 44, c1: 22, t1: 22, c2: 22, t2: 22 };
  assert.strictEqual(idxScoring.scoreSatSectionScore(sec, idxScoring.SCORE_MATH_CURVE), 800);
});
test('Zero score (0%) floors at 200', () => {
  const sec = { c: 0, t: 44, c1: 0, t1: 22, c2: 0, t2: 22 };
  assert.strictEqual(idxScoring.scoreSatSectionScore(sec, idxScoring.SCORE_MATH_CURVE), 200);
});
// Locks in the model's existing module-weight direction (score =
// base + weight*(module1Rate - module2Rate)) rather than asserting which
// direction is "better" — that calibration judgment is Luca's Albert.io
// data, not something this test should guess at. What it does guarantee:
// two attempts with the identical overall raw score are NOT scored
// identically once the module split differs, and a bigger split moves the
// score by more, in a consistent direction.
test('module split moves the score away from the balanced baseline, monotonically', () => {
  const balanced = { c: 34, t: 44, c1: 17, t1: 22, c2: 17, t2: 22 };
  const slightlyM1Strong = { c: 34, t: 44, c1: 19, t1: 22, c2: 15, t2: 22 };
  const stronglyM1Strong = { c: 34, t: 44, c1: 22, t1: 22, c2: 12, t2: 22 };
  const base = idxScoring.scoreSatSectionScore(balanced, idxScoring.SCORE_MATH_CURVE);
  const slight = idxScoring.scoreSatSectionScore(slightlyM1Strong, idxScoring.SCORE_MATH_CURVE);
  const strong = idxScoring.scoreSatSectionScore(stronglyM1Strong, idxScoring.SCORE_MATH_CURVE);
  assert.notStrictEqual(slight, base, 'a module split should move the score off the balanced baseline');
  const slightDelta = Math.abs(slight - base), strongDelta = Math.abs(strong - base);
  assert.ok(strongDelta >= slightDelta, 'a bigger module-1/module-2 imbalance (' + strongDelta + ') should move the score at least as much as a smaller one (' + slightDelta + ')');
});

// ═══════════════════════════════════════════════════════════════════════
// 2. SKILL CLASSIFICATION — Mastered/Inefficient/Stuck/Rushed severity
//    ranking that drives the report's "Your biggest issue" verdict. Both
//    files carry their own copy of severityOf(); this locks the RULE
//    itself in, and checks the two copies haven't drifted apart.
// ═══════════════════════════════════════════════════════════════════════
section('Skill diagnosis classification (index.html vs report.html)');

function loadSeverity(source) {
  // Used to also pull `var MIN_SAMPLE = 3, SIGNAL_MIN_COUNT = 2, ...`. The
  // MIN_SAMPLE floor (ignore a skill with fewer than 3 questions) was
  // dropped from both files, and the declaration is now just
  // `var SIGNAL_MIN_COUNT = 2, SIGNAL_MIN_SHARE = 0.3;` -- so scraping for
  // the old literal threw and took the whole suite down with it, including
  // the index-vs-report parity check this function exists to run. Anchored
  // on the constants severityOf actually reads instead.
  const code = [
    extractLineStartingWith(source, 'var SIGNAL_MIN_COUNT = 2'),
    extractFunction(source, 'severityOf'),
  ].join('\n');
  return runInSandbox(code, ['severityOf']).severityOf;
}
const idxSeverityOf = loadSeverity(INDEX_HTML);
const reportSeverityOf = loadSeverity(REPORT_HTML);

const severityFixtures = [
  { name: 'dominant Stuck (content gap) ranks 3', r: { stuck: 3, rushed: 0, inefficient: 0, total: 5 }, expect: 3 },
  { name: 'dominant Rushed (pacing) ranks 2', r: { stuck: 0, rushed: 3, inefficient: 0, total: 5 }, expect: 2 },
  { name: 'dominant Inefficient (slow but right) ranks 1', r: { stuck: 0, rushed: 0, inefficient: 3, total: 5 }, expect: 1 },
  { name: 'mostly Mastered, no signal, ranks 0', r: { stuck: 0, rushed: 0, inefficient: 0, total: 5 }, expect: 0 },
  { name: 'below the count floor (1 stuck of 5) ranks 0 even if the share would clear', r: { stuck: 1, rushed: 0, inefficient: 0, total: 3 }, expect: 0 },
  { name: 'Stuck outranks Rushed even with a smaller raw count (2 stuck vs 3 rushed, both huge shares)', r: { stuck: 2, rushed: 3, inefficient: 0, total: 5 }, expect: 3 },
];
severityFixtures.forEach(function (fx) {
  test(fx.name, () => {
    assert.strictEqual(idxSeverityOf(fx.r), fx.expect, 'index.html severityOf mismatch');
    assert.strictEqual(reportSeverityOf(fx.r), fx.expect, 'report.html severityOf mismatch');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 3. SAVED & MISTAKES RECONCILIATION — the local/server merge that decides
//    whether a locally-cached saved question or mistake survives a sync.
//    Dropping a real, recent entry here is a silent data-loss bug a
//    student would never think to report (they'd just quietly find their
//    saved question gone).
// ═══════════════════════════════════════════════════════════════════════
section('Saved & Mistakes reconciliation (index.html)');

const reconcileCode = [
  extractLineStartingWith(INDEX_HTML, 'var PROGRESS_RECONCILE_GRACE_MS'),
  extractFunction(INDEX_HTML, 'reconcileProgressMap'),
].join('\n');
function makeReconcile() {
  const sandbox = {
    module: { exports: {} },
    console,
    localStorage: { setItem: function () {} },
    Date: Date,
  };
  vm.createContext(sandbox);
  vm.runInContext(reconcileCode + '\nmodule.exports.reconcileProgressMap = reconcileProgressMap;', sandbox);
  return sandbox.module.exports.reconcileProgressMap;
}

test('an old local-only entry not confirmed by the server is dropped', () => {
  const reconcileProgressMap = makeReconcile();
  const oldTs = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1hr ago, outside the 10min grace window
  const local = { q1: { savedAt: oldTs } };
  const result = reconcileProgressMap(local, {}, 'savedAt', 'test_key');
  sameValue(result, {});
});

test('a fresh local-only entry (inside the grace window) is kept even though the server does not confirm it yet', () => {
  const reconcileProgressMap = makeReconcile();
  const freshTs = new Date(Date.now() - 30 * 1000).toISOString(); // 30s ago
  const local = { q1: { savedAt: freshTs } };
  const result = reconcileProgressMap(local, {}, 'savedAt', 'test_key');
  sameValue(result, { q1: local.q1 });
});

test('server entries always win and are always included', () => {
  const reconcileProgressMap = makeReconcile();
  const local = {};
  const server = { q9: { savedAt: new Date().toISOString() } };
  const result = reconcileProgressMap(local, server, 'savedAt', 'test_key');
  sameValue(result, server);
});

test('an entry present in both local and server is not duplicated or dropped', () => {
  const reconcileProgressMap = makeReconcile();
  const oldTs = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const local = { q1: { savedAt: oldTs, note: 'local version' } };
  const server = { q1: { savedAt: oldTs, note: 'server version' } };
  const result = reconcileProgressMap(local, server, 'savedAt', 'test_key');
  sameValue(result, { q1: { savedAt: oldTs, note: 'server version' } });
});

// ── summary ────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(50));
console.log((failed === 0 ? '\x1b[32m' : '\x1b[31m') + passed + ' passed, ' + failed + ' failed\x1b[0m');
process.exit(failed === 0 ? 0 : 1);
