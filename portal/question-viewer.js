/* question-viewer.js (2026-10-28, Luca: "have the same clickable question interface for the questions as
   does the reports and portal", for the admin Mistakes tab). report.html's question viewer, copied: the
   real-exam layout (passage left, question right), Hide answers / Hide choices, Desmos on math, Previous
   and Next, plus the bank's own explanation. Its look is question-viewer.css. Keep the two in step with
   report.html's QUESTION MODAL when the viewer changes there.

   window.openBankQuestionViewer(rows, index, label): each row is
     { q: the bank question, sectionKey: 'math' | 'reading-writing', givenIdx: 0-3 or null,
       givenText: a grid-in answer, ok: right or not, okLabel: the pill when right ('Correct'), meta: one line under the question (when, how often) }. */
(function () {
  if (window.openBankQuestionViewer) return;

  window.mathDisplay = function (html) {
    html = String(html || '');
    if (html.indexOf('=') === -1 && !/[<>≤≥]\s/.test(html.replace(/<[^>]+>/g, ''))) return html;
    // Keep existing display blocks (figures, centered equations, tables) out of reach.
    var keep = [];
    var work = html.replace(/<(div|table|svg|figure)\b[\s\S]*?<\/\1>/gi, function (m) { keep.push(m); return '\u0000' + (keep.length - 1) + '\u0000'; });
    var plain = function (s) { return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim(); };
    var okEq = function (s) {
      var p = plain(s);
      if (!p || p.length > 70 || !/[=<>≤≥]/.test(p)) return false;
      if (/[\u0000]/.test(s)) return false;
      // Math only: no prose words (more than two letters in a row), bar the usual function names.
      var words = p.replace(/\b(sin|cos|tan|log|ln|sqrt)\b/g, '').match(/[A-Za-z]{3,}/g);
      return !words;
    };
    var TRIG = '(defined by|given by|modeled by|represented by|written as|expressed as|(?:the|an|this) (?:equation|function|formula|inequality)(?: shown)?|(?:equation|function|formula|inequality))';
    var TERM = '(?=,\\s|\\.(?:\\s|$)|;|\\s(?:where|represents|gives|models|for|and|if|when|in which|describes|shows|is used|can be|has|defines)\\b|$)';
    var re = new RegExp('\\b' + TRIG + '\\s+((?:(?!\\s(?:where|represents|gives|models|for|and|if|when|describes|shows)\\b)[^.;?\\u0000]|\\.(?=\\d)|,(?=\\d))+?)' + TERM, 'gi');
    // One sentence at a time; the one that asks the question keeps its equation inline.
    var parts = work.replace(/([.?!])\s+(?=[A-Z<\u0000])/g, '$1\u0001').split('\u0001');   // no lookbehind: older iPhones can't parse it
    parts = parts.map(function (sent) {
      if (sent.indexOf('?') !== -1) return sent;
      return sent.replace(re, function (all, trig, eq) {
        // A small word between the trigger and the equation stays in the sentence ("the function of f(x) = ...").
        var lead = (eq.match(/^\s*(?:of|is|by|in|as|to|at)\s+/) || [''])[0];
        eq = eq.slice(lead.length);
        if (!okEq(eq)) return all;
        return trig + (lead ? ' ' + lead.trim() : '') + '<span class="eqline">' + eq.trim() + '</span>';
      }).replace(/(<\/span>)\s*(and|or)\s+((?:[^.;?,\u0000]|\.(?=\d)|,(?=\d))+?)(?=,\s|\.(?:\s|$)|;|$)/g, function (all, close, conj, eq) {
        // "defined by f(x) = ... and g(x) = ...": the second one goes on its own line too.
        return okEq(eq) ? close + '<span class="eqline">' + eq.trim() + '</span>' : all;
      }).replace(/(<span class="eqline">[\s\S]*?<\/span>)[.,]\s*/g, '$1');
    });
    work = parts.join(' ');
    return work.replace(/\u0000(\d+)\u0000/g, function (m, i) { return keep[+i]; });
  };
  // Only math questions get it, and only on the question side (math has no passage pane).
  window.mathFor = function (q, html) {
    var isMath = q && (/Algebra|Advanced Math|Problem-Solving|Geometry/.test(String(q.domain || '')) || q._qbSubject === 'math');
    return isMath ? window.mathDisplay(html) : html;
  };

  var LETTERS = ['A', 'B', 'C', 'D'];
  var MARKUP = "<div class=\"q-modal-overlay\" id=\"q-modal-overlay\">\n    <div class=\"q-modal\" role=\"dialog\" aria-modal=\"true\">\n      <div class=\"q-modal-hed\">\n        <div class=\"q-modal-hed-left\">\n          <span id=\"q-modal-title\"></span>\n          <span class=\"q-modal-status-pill\" id=\"q-modal-status-pill\"></span>\n          <span class=\"q-modal-flag-pill\" id=\"q-modal-flag-pill\" style=\"display:none;\">&#9873; Flagged for review</span>\n        </div>\n        <div class=\"q-modal-hed-right\">\n          <button type=\"button\" class=\"q-modal-calc-btn\" id=\"q-modal-calc-btn\" style=\"display:none;\">\n            <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"/><line x1=\"8\" y1=\"6\" x2=\"16\" y2=\"6\"/><line x1=\"8\" y1=\"10.5\" x2=\"8\" y2=\"10.51\"/><line x1=\"12\" y1=\"10.5\" x2=\"12\" y2=\"10.51\"/><line x1=\"16\" y1=\"10.5\" x2=\"16\" y2=\"10.51\"/><line x1=\"8\" y1=\"14.5\" x2=\"8\" y2=\"14.51\"/><line x1=\"12\" y1=\"14.5\" x2=\"12\" y2=\"14.51\"/><line x1=\"16\" y1=\"14.5\" x2=\"16\" y2=\"14.51\"/></svg>\n            <span>Calculator</span>\n          </button>\n          <label class=\"q-modal-toggle\">\n            <span>Hide answers</span>\n            <span class=\"q-toggle-switch\"><input type=\"checkbox\" id=\"q-modal-hide-toggle\" checked><span class=\"q-toggle-track\"><span class=\"q-toggle-thumb\"></span></span></span>\n          </label>\n          <label class=\"q-modal-toggle\">\n            <span>Hide choices</span>\n            <span class=\"q-toggle-switch\"><input type=\"checkbox\" id=\"q-modal-hide-choices-toggle\"><span class=\"q-toggle-track\"><span class=\"q-toggle-thumb\"></span></span></span>\n          </label>\n          <button type=\"button\" class=\"q-modal-close\" id=\"q-modal-close\" aria-label=\"Close\">&times;</button>\n        </div>\n      </div>\n      <div class=\"q-modal-body\" id=\"q-modal-body\">\n        <div class=\"q-modal-pane q-modal-passage-pane\" id=\"q-modal-passage-pane\"></div>\n        <div class=\"q-modal-pane q-modal-question-pane\" id=\"q-modal-question-pane\"></div>\n        <div class=\"q-modal-calc-pane\" id=\"q-modal-calc-pane\"></div>\n        <div class=\"q-modal-calc-divider\" id=\"q-modal-calc-divider\"><span class=\"q-modal-calc-grip\"><svg width=\"10\" height=\"18\" viewBox=\"0 0 10 18\" aria-hidden=\"true\"><circle cx=\"2.5\" cy=\"3\" r=\"1.4\" fill=\"currentColor\"/><circle cx=\"7.5\" cy=\"3\" r=\"1.4\" fill=\"currentColor\"/><circle cx=\"2.5\" cy=\"9\" r=\"1.4\" fill=\"currentColor\"/><circle cx=\"7.5\" cy=\"9\" r=\"1.4\" fill=\"currentColor\"/><circle cx=\"2.5\" cy=\"15\" r=\"1.4\" fill=\"currentColor\"/><circle cx=\"7.5\" cy=\"15\" r=\"1.4\" fill=\"currentColor\"/></svg></span></div>\n      </div>\n      <div class=\"q-modal-ftr\">\n        <span id=\"q-modal-counter\"></span>\n        <div class=\"q-modal-ftr-actions\">\n          <button type=\"button\" class=\"q-modal-ftr-btn\" id=\"q-modal-explain-btn\">Explanation</button>\n          <button type=\"button\" class=\"q-modal-ftr-btn\" id=\"q-modal-prev-btn\">Previous</button>\n          <button type=\"button\" class=\"q-modal-ftr-btn primary\" id=\"q-modal-next-btn\">Next</button>\n        </div>\n      </div>\n    </div>\n  </div>";
  var el = {}, built = false;
  var modalRows = [], modalIndex = 0, modalLabel = '';
  var modalHideAnswer = true, modalHideChoices = false, modalCalcOpen = false, explainOpen = false;
  var DESMOS_CALC_URL = 'https://www.desmos.com/testing/collegeboard/graphing?lang=en';

  function splitPassageForModal(text) {
    text = String(text || '');
    var idx = text.lastIndexOf('<br><br>');
    if (idx === -1) return null;
    return { passage: text.slice(0, idx), question: text.slice(idx + 8) };
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function build() {
    if (built) return;
    built = true;
    var host = document.createElement('div');
    host.innerHTML = MARKUP;
    document.body.appendChild(host.firstElementChild);
    ['overlay', 'title', 'status-pill', 'flag-pill', 'passage-pane', 'question-pane', 'calc-btn', 'calc-pane', 'body', 'calc-divider',
     'hide-toggle', 'hide-choices-toggle', 'counter', 'explain-btn', 'prev-btn', 'next-btn', 'close'].forEach(function (k) {
      el[k] = document.getElementById('q-modal-' + k);
    });
    el.close.addEventListener('click', close);
    el.overlay.addEventListener('click', function (e) { if (e.target === el.overlay) close(); });
    document.addEventListener('keydown', function (e) {
      if (!el.overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft' && !el['prev-btn'].disabled) el['prev-btn'].click();
      else if (e.key === 'ArrowRight' && !el['next-btn'].disabled) el['next-btn'].click();
    });
    el['hide-toggle'].addEventListener('change', function () { modalHideAnswer = el['hide-toggle'].checked; render(); });
    el['hide-choices-toggle'].addEventListener('change', function () { modalHideChoices = el['hide-choices-toggle'].checked; render(); });
    el['explain-btn'].addEventListener('click', function () { explainOpen = !explainOpen; render(); });
    el['prev-btn'].addEventListener('click', function () { if (modalIndex > 0) { modalIndex--; explainOpen = false; render(); } });
    el['next-btn'].addEventListener('click', function () { if (modalIndex < modalRows.length - 1) { modalIndex++; explainOpen = false; render(); } });
    el['calc-btn'].addEventListener('click', function () {
      modalCalcOpen = !modalCalcOpen;
      el.body.classList.toggle('calc-open', modalCalcOpen);
      el['calc-btn'].classList.toggle('on', modalCalcOpen);
      if (modalCalcOpen) ensureCalculator();
    });
    // Drag the seam to resize the calculator against the question (report.html's divider).
    var dragging = false, stacked = window.matchMedia('(max-width: 860px)');
    function setSplit(x, y) {
      var rect = el.body.getBoundingClientRect();
      if (stacked.matches) {
        var vh = ((y - el['calc-pane'].getBoundingClientRect().top) / window.innerHeight) * 100;
        el.body.style.setProperty('--qcalc-h', Math.max(20, Math.min(70, vh)) + 'vh');
      } else {
        el.body.style.setProperty('--qcalc-w', Math.max(25, Math.min(70, ((x - rect.left) / rect.width) * 100)) + '%');
      }
    }
    el['calc-divider'].addEventListener('pointerdown', function (e) { dragging = true; el['calc-divider'].classList.add('dragging'); el['calc-divider'].setPointerCapture(e.pointerId); e.preventDefault(); });
    el['calc-divider'].addEventListener('pointermove', function (e) { if (dragging) setSplit(e.clientX, e.clientY); });
    function stop() { if (!dragging) return; dragging = false; el['calc-divider'].classList.remove('dragging'); }
    el['calc-divider'].addEventListener('pointerup', stop);
    el['calc-divider'].addEventListener('pointercancel', stop);
  }

  function ensureCalculator() {
    var frame = el['calc-pane'].querySelector('iframe.q-calc-frame');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.className = 'q-calc-frame';
      frame.title = 'Desmos graphing calculator';
      frame.src = DESMOS_CALC_URL;
      el['calc-pane'].appendChild(frame);
    }
  }
  function isMathRow(r) { return r && r.sectionKey === 'math'; }

  function answerArea(r, q) {
    var wrap = document.createElement('div');
    wrap.className = 'q-detail';
    if (q.type !== 'fr' && q.choices) {
      if (modalHideChoices) {
        var hidden = document.createElement('div');
        hidden.className = 'q-choices-hidden';
        hidden.textContent = 'Choices hidden. Use the toggle above to reveal.';
        wrap.appendChild(hidden);
        return wrap;
      }
      var ul = document.createElement('ul');
      ul.className = 'q-choices';
      q.choices.forEach(function (choice, idx) {
        var li = document.createElement('li');
        var isCorrect = idx === q.correct, isPicked = r.givenIdx === idx;
        if (!modalHideAnswer) { if (isCorrect) li.className = 'q-correct'; else if (isPicked) li.className = 'q-picked-wrong'; }
        li.innerHTML = '<span class="q-choice-badge">' + LETTERS[idx] + '</span><span class="q-choice-text">' + choice + '</span>' +
          (!modalHideAnswer && (isCorrect || isPicked) ? '<span class="q-choice-mark">' + (isCorrect ? '&#10003;' : '&#10005;') + '</span>' : '');
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      if (!modalHideAnswer && r.givenIdx == null) {
        var none = document.createElement('div');
        none.className = 'q-tag bad';
        none.style.marginTop = '4px';
        none.textContent = 'Their answer was not recorded';
        wrap.appendChild(none);
      }
    } else {
      var fr = document.createElement('div');
      if (modalHideAnswer) { fr.className = 'q-fr q-fr-hidden'; fr.textContent = 'Answer hidden. Use the toggle above to reveal.'; }
      else {
        fr.className = 'q-fr';
        var correct = q.answerValue != null ? q.answerValue : q.answer;
        fr.innerHTML = 'Correct answer: <span class="q-correct-ans">' + esc(correct) + '</span> &nbsp;\u00b7&nbsp; Entered: <span class="q-your-ans">' +
          esc(r.givenText != null && r.givenText !== '' ? r.givenText : 'not recorded') + '</span>';
      }
      wrap.appendChild(fr);
    }
    return wrap;
  }

  function render() {
    var r = modalRows[modalIndex];
    if (!r) return;
    var q = r.q || {};
    el.title.textContent = (modalLabel ? modalLabel + ' - ' : '') + 'Question ' + (modalIndex + 1) + ' of ' + modalRows.length;
    el['status-pill'].innerHTML = r.ok ? '<span class="q-modal-pill-dot">&#10003;</span>' + esc(r.okLabel || 'Correct') : '<span class="q-modal-pill-dot">&#10005;</span>Incorrect';
    el['status-pill'].className = 'q-modal-status-pill ' + (r.ok ? 'ok' : 'bad');
    el['flag-pill'].style.display = 'none';
    var split = isMathRow(r) ? null : splitPassageForModal(q.text);
    el['passage-pane'].innerHTML = split ? split.passage : '';
    var pane = el['question-pane'];
    pane.innerHTML = '';
    var qtext = document.createElement('div');
    qtext.className = 'q-text';
    qtext.innerHTML = split ? split.question : (isMathRow(r) ? window.mathDisplay(q.text || '') : (q.text || '(question text unavailable)'));
    pane.appendChild(qtext);
    pane.appendChild(answerArea(r, q));
    if (r.meta) {
      var meta = document.createElement('div');
      meta.className = 'q-modal-meta';
      meta.textContent = r.meta;
      pane.appendChild(meta);
    }
    el['explain-btn'].style.display = q.explanation ? '' : 'none';
    el['explain-btn'].textContent = explainOpen ? 'Hide explanation' : 'Explanation';
    if (explainOpen && q.explanation) {
      var ex = document.createElement('div');
      ex.className = 'q-modal-explain';
      ex.innerHTML = q.explanation;   // the bank's own rationale, as the portal shows it
      pane.appendChild(ex);
    }
    el['hide-toggle'].checked = modalHideAnswer;
    el['hide-choices-toggle'].checked = modalHideChoices;
    el['hide-choices-toggle'].closest('.q-modal-toggle').classList.toggle('q-modal-toggle-na', !(q.type !== 'fr' && q.choices));
    el.counter.textContent = (modalIndex + 1) + ' of ' + modalRows.length;
    el['prev-btn'].disabled = modalIndex === 0;
    el['next-btn'].disabled = modalIndex === modalRows.length - 1;
    pane.scrollTop = 0;
    el['passage-pane'].scrollTop = 0;
    var math = isMathRow(r);
    el['calc-btn'].style.display = math ? '' : 'none';
    if (!math && modalCalcOpen) modalCalcOpen = false;
    el['calc-btn'].classList.toggle('on', modalCalcOpen);
    el.body.classList.toggle('calc-open', modalCalcOpen);
    if (modalCalcOpen) ensureCalculator();
  }

  function close() { if (el.overlay) el.overlay.classList.remove('open'); }

  window.openBankQuestionViewer = function (rows, index, label) {
    build();
    modalRows = rows || [];
    modalIndex = Math.max(0, Math.min(index || 0, modalRows.length - 1));
    modalLabel = label || '';
    modalHideAnswer = true; modalHideChoices = false; modalCalcOpen = false; explainOpen = false;
    render();
    el.overlay.classList.add('open');
  };
  window.closeBankQuestionViewer = close;
})();
