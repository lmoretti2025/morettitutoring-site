/* =====================================================================
   GRID-IN GRADING — the one copy of the rule for student-produced-
   response ("fr") answers. index.html (the diagnostic, Question Bank,
   Challenge Questions, the review quiz, the native report) and
   report.html all call window.gridInCorrect(); tests/grid-in-test.js
   requires this file directly.

   What the digital SAT accepts, and so what this accepts:
   - An exact answer: an integer, a decimal, or a fraction equal to the
     key (5/12, 10/24, .375 for 3/8). Mixed numbers ("3 1/2") are not.
   - A decimal that is the key rounded OR truncated, provided it fills
     the answer box: 5 characters for a positive answer, 6 for a
     negative one, counting the decimal point, the minus sign and a
     leading zero. For 5/12 that is .4166, .4167, 0.416 or 0.417, but not
     .42 or .417. For 7/6 it is 1.166 or 1.167. This is College Board's
     own rule; the "Note that ... are examples of ways to enter a correct
     answer" lines in the bank's explanations follow it.

   This replaces an absolute tolerance of 0.05, which let 5/13 pass for
   5/12.
   ===================================================================== */
(function (root) {
  'use strict';

  // Symbols the real answer box would never let a student type, but which
  // carry no numeric meaning: "$", "%", a Unicode minus, and correctly
  // grouped thousands commas ("36,504").
  function clean(s) {
    s = String(s == null ? '' : s).trim().replace(/\u2212/g, '-');
    s = s.replace(/^\$\s*/, '').replace(/\s*%$/, '');
    if (/^[+-]?[1-9]\d{0,2}(,\d{3})+(\.\d*)?$/.test(s)) s = s.replace(/,/g, '');
    return s;
  }

  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function reduce(neg, n, d) { var g = gcd(n, d) || 1; return { neg: neg && n !== 0, n: n / g, d: d / g }; }

  // "12.5" -> 125/10; null when it would not fit in a safe integer.
  function decimalRatio(s) {
    var p = s.split('.'), frac = p[1] || '';
    var n = Number((p[0] || '') + frac || '0'), d = Math.pow(10, frac.length);
    return (Number.isSafeInteger(n) && Number.isSafeInteger(d)) ? { n: n, d: d } : null;
  }

  // Decimals keep their digits as typed (the rule depends on how many
  // places were entered and how wide the entry is); fractions become an
  // exact, reduced ratio.
  function parse(s) {
    var m = /^([+-]?)(\d+(?:\.\d+)?|\.\d+)\s*\/\s*(\d+(?:\.\d+)?|\.\d+)$/.exec(s);
    if (m) {
      var a = decimalRatio(m[2]), b = decimalRatio(m[3]);
      if (!a || !b || !b.n) return null;
      var n = a.n * b.d, d = a.d * b.n;
      if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d)) return null;
      return { frac: true, value: reduce(m[1] === '-', n, d) };
    }
    m = /^([+-]?)(\d*)(\.?)(\d*)$/.exec(s);
    if (!m || !(m[2] + m[4])) return null;
    var neg = m[1] === '-', intPart = m[2].replace(/^0+(?=\d)/, '');
    var dec = { frac: false, neg: neg, intPart: intPart, places: m[4] };
    dec.width = (neg ? 1 : 0) + intPart.length + m[3].length + m[4].length;
    var r = decimalRatio(intPart + '.' + m[4]);
    dec.value = r ? reduce(neg, r.n, r.d) : null;
    return dec;
  }

  function fillsBox(dec) { return dec.width >= (dec.neg ? 6 : 5); }
  function magnitude(digits) { return digits.replace(/^0+/, '') || '0'; }
  function digitsOf(dec) { return magnitude(dec.intPart + dec.places); }

  // "0999" -> "1000"
  function plusOne(digits) {
    var d = digits.split(''), i = d.length - 1;
    while (i >= 0 && d[i] === '9') d[i--] = '0';
    return i < 0 ? '1' + d.join('') : d.slice(0, i).join('') + (+d[i] + 1) + d.slice(i + 1).join('');
  }

  // |v| to exactly k decimal places, as a digit string with no point:
  // truncated, rounded half-up, and whether that is v exactly.
  function toPlaces(v, k) {
    var r = v.n % v.d, digits = String((v.n - r) / v.d);
    for (var i = 0; i < k; i++) { r *= 10; digits += Math.floor(r / v.d); r %= v.d; }
    return { truncated: magnitude(digits), rounded: magnitude(2 * r >= v.d ? plusOne(digits) : digits), exact: r === 0 };
  }

  function sameSign(dec, neg) { return dec.neg === neg || digitsOf(dec) === '0'; }

  function accepts(entry, v) {
    if (entry.frac) return entry.value.neg === v.neg && entry.value.n === v.n && entry.value.d === v.d;
    if (!sameSign(entry, v.neg)) return false;
    var t = toPlaces(v, entry.places.length), typed = digitsOf(entry);
    if (t.exact && typed === t.truncated) return true;
    return (typed === t.truncated || typed === t.rounded) && fillsBox(entry);
  }

  // A few keys are stored already rounded: 9.667 for 29/3, -0.3267 for
  // -49/150. Such a key fills the answer box and is not a simple fraction
  // (lowest-terms denominator over 100, which rules out exact keys such as
  // .0625 = 1/16 or 86.875 = 695/8). All it says about the real answer is
  // that it rounds to the key, so accept whatever is a correct entry for
  // some value that rounds to it: 29/3, 9.666 and 9.667 all pass for 9.667.
  function isRoundedKey(key) {
    return !key.frac && !!key.value && key.value.d > 100 && fillsBox(key);
  }

  function acceptsRounded(entry, key) {
    var k = key.places.length, target = digitsOf(key);
    if (entry.frac) return entry.value.neg === key.neg && toPlaces(entry.value, k).rounded === target;
    if (!sameSign(entry, key.neg) || !fillsBox(entry)) return false;
    var typed = digitsOf(entry), kE = entry.places.length;
    if (kE > k) {
      var head = entry.intPart + entry.places.slice(0, k);
      return magnitude(entry.places.charAt(k) >= '5' ? plusOne(head) : head) === target;
    }
    // The values that round to the key span less than one unit at the
    // entry's precision, so only the two ends of that span matter.
    var n = Number(target), s = Math.pow(10, k);
    var lo = toPlaces({ n: 2 * n - 1, d: 2 * s }, kE), hi = toPlaces({ n: 20 * n + 9, d: 20 * s }, kE);
    return [lo.truncated, lo.rounded, hi.truncated, hi.rounded].indexOf(typed) !== -1;
  }

  // raw: what the student typed. keys: the answer key, or an array of keys
  // (the stored answer plus any window.FR_ALTERNATES for that question).
  function gridInCorrect(raw, keys) {
    var a = clean(raw);
    if (!a) return false;
    var entry = parse(a);
    keys = Array.isArray(keys) ? keys : [keys];
    for (var i = 0; i < keys.length; i++) {
      var b = clean(keys[i]);
      if (!b) continue;
      if (a.toLowerCase() === b.toLowerCase()) return true;
      var key = parse(b);
      if (!entry || !key || !key.value) continue;
      if (accepts(entry, key.value)) return true;
      if (isRoundedKey(key) && acceptsRounded(entry, key)) return true;
    }
    return false;
  }

  root.gridInCorrect = gridInCorrect;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      gridInCorrect: gridInCorrect,
      isRoundedKey: function (key) { var k = parse(clean(key)); return !!k && isRoundedKey(k); }
    };
  }
})(typeof window !== 'undefined' ? window : this);
