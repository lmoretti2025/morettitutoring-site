/* =====================================================================
   GRID-IN GRADING — the one copy of the rule for student-produced-
   response ("fr") answers. index.html and report.html call
   window.gridInCorrect(); tests/grid-in-test.js requires this file.

   What the digital SAT accepts, and so what this accepts:
   - An exact answer: an integer, a decimal, or a fraction equal to the
     key (5/12, 10/24, .375 for 3/8). Mixed numbers ("3 1/2") are not.
   - A decimal that is the key rounded OR truncated, provided it fills
     the answer box: 5 characters for a positive answer, 6 for a
     negative one, counting the decimal point, minus sign and a leading
     zero. For 5/12: .4166, .4167, 0.416 or 0.417, but not .42 or .417.
     This is College Board's own rule.

   No absolute tolerance: 0.05 would let 5/13 pass for 5/12.
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

  // raw: what the student typed. keys: the answer key, or an array of keys
  // (the stored answer plus any window.FR_ALTERNATES for that question).
  // A key must be exact: store 29/3, not 9.667, or 29/3 itself is marked
  // wrong. tests/grid-in-test.js flags keys that look rounded.
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
      if (entry && key && key.value && accepts(entry, key.value)) return true;
    }
    return false;
  }

  root.gridInCorrect = gridInCorrect;
  if (typeof module !== 'undefined' && module.exports) module.exports = { gridInCorrect: gridInCorrect };
})(typeof window !== 'undefined' ? window : this);
