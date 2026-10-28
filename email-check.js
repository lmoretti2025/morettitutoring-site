/* EMAIL TYPOS (Luca, 2026-10-28: a family booked with "hotmail.con", so the
   confirmation and the Meet link went nowhere). window.emailProblem(email)
   returns null when the address looks fine, or { msg, fix, sure }:
     fix   the address it probably meant, when there is one
     sure  true when the address cannot be right (".con" is not a real
           ending); false for a likely misspelling of a common provider,
           which the family can keep by submitting again unchanged.
   Used by session.html and book.html. */
(function () {
  'use strict';
  var KNOWN = ['gmail.com', 'googlemail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'aol.com', 'live.com',
    'msn.com', 'me.com', 'mac.com', 'comcast.net', 'verizon.net', 'optonline.net', 'att.net', 'protonmail.com', 'proton.me',
    'ymail.com', 'rocketmail.com', 'mail.com', 'gmx.com', 'yahoo.co.uk', 'hotmail.co.uk', 'sbcglobal.net', 'bellsouth.net'];
  // Endings no address has, and what they were meant to be.
  var BAD_END = { con: 'com', cmo: 'com', ocm: 'com', comm: 'com', vom: 'com', xom: 'com', cpm: 'com', coom: 'com', clm: 'com', co0: 'com', cim: 'com',
    nte: 'net', ner: 'net', ogr: 'org', rog: 'org', orgg: 'org', eud: 'edu', edy: 'edu' };
  // On these providers, .co, .cm and .om are a slip for .com.
  var SHORT_END = { co: 1, cm: 1, om: 1, c: 1 };

  function dist(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) d[i] = [i];
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }

  window.emailProblem = function (raw) {
    var email = String(raw || '').trim();
    if (!email) return { msg: 'Please add your email address.', sure: true };
    if (/\s/.test(email)) return { msg: 'Your email address has a space in it.', fix: email.replace(/\s+/g, ''), sure: true };
    var m = /^([^@]+)@([^@]+)$/.exec(email);
    if (!m || !/^[A-Za-z0-9._%+'-]+$/.test(m[1]) || !/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(m[2]) || /\.\./.test(email)) {
      return { msg: 'That doesn’t look like a complete email address. It should look like name@example.com.', sure: true };
    }
    var user = m[1], domain = m[2].toLowerCase();
    var parts = domain.split('.'), end = parts[parts.length - 1], base = parts.slice(0, -1).join('.');
    if (BAD_END[end]) {
      var fixed = base + '.' + BAD_END[end];
      return { msg: 'Your email ends in “.' + end + '”. Did you mean ' + user + '@' + fixed + '?', fix: user + '@' + fixed, sure: true };
    }
    if (KNOWN.indexOf(domain) !== -1) return null;
    if (SHORT_END[end] && KNOWN.indexOf(base + '.com') !== -1) {
      return { msg: 'Did you mean ' + user + '@' + base + '.com?', fix: user + '@' + base + '.com', sure: true };
    }
    var best = null, bestD = 9;
    KNOWN.forEach(function (k) { var dd = dist(domain, k); if (dd < bestD) { bestD = dd; best = k; } });
    if (best && bestD <= (domain.length < 9 ? 1 : 2)) {
      return { msg: 'Did you mean ' + user + '@' + best + '?', fix: user + '@' + best, sure: false };
    }
    return null;
  };

  /* The message under the field, with a button that puts the fix in. Checked
     when the field is left and again on submit. window.emailCheckWire(input)
     returns ok(): false, with the message shown and the field focused, when
     the form should not go yet. A likely misspelling stops it once; the same
     address submitted again goes through (a real but unusual domain). */
  window.emailCheckWire = function (input) {
    var box = document.createElement('p'), warned = '';
    box.className = 'email-hint';
    box.setAttribute('role', 'alert');
    box.hidden = true;
    box.style.cssText = 'margin:6px 0 0;font-size:.84rem;line-height:1.45;color:var(--red,#B0271C)';
    input.insertAdjacentElement('afterend', box);
    function hide() { box.hidden = true; input.removeAttribute('aria-invalid'); }
    function show(p) {
      box.textContent = p.msg + ' ';
      if (p.fix) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = 'Use ' + p.fix;
        b.style.cssText = 'border:0;background:none;padding:0;font:inherit;font-weight:600;color:inherit;text-decoration:underline;cursor:pointer';
        b.addEventListener('click', function () { input.value = p.fix; hide(); input.focus(); });
        box.appendChild(b);
      }
      box.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    }
    input.addEventListener('input', hide);
    input.addEventListener('blur', function () {
      var v = input.value.trim();
      if (!v) return hide();
      var p = window.emailProblem(v);
      if (p) show(p); else hide();
    });
    return function ok() {
      var v = input.value.trim(), p = window.emailProblem(v);
      if (!p || (!p.sure && warned === v)) { hide(); return true; }
      warned = v;
      show(p);
      input.focus();
      return false;
    };
  };
})();
