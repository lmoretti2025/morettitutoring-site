/* highlighter.js (2026-10-28, Luca: "in that question viewer, allow for highlighting just like on the
   exam. This should be ubiquitous across the portal, report viewer, and admin"). The exam's passage
   highlighter (index.html PASSAGE HIGHLIGHTER and NOTES ON HIGHLIGHTS), packaged for the pages that do
   not carry the exam: the report (report.html) and the admin page's question viewer
   (question-viewer.js). Select text in a passage or a question to get the same floating toolbar: three
   colors, underline, a note, and delete on a highlight you click. The portal keeps its own copy, which
   already covers its question viewer; keep the two in step.

   Highlights live in the DOM, so they last until that question's HTML is drawn again. Roots are the
   viewer's passage pane and any .q-text; window.MorettiHighlighter.roots can widen that. */
(function () {
  if (window.MorettiHighlighter || document.getElementById('dx-hl-toolbar')) return;   // the portal has its own

  var CSS = [
    '.dx-user-highlight { cursor: pointer; border-radius: 1px; }',
    '.dx-user-highlight.dx-hl-yellow { background: #fff3a0; } .dx-user-highlight.dx-hl-yellow:hover { background: #ffe985; }',
    '.dx-user-highlight.dx-hl-blue { background: #cfe3ff; } .dx-user-highlight.dx-hl-blue:hover { background: #b6d3ff; }',
    '.dx-user-highlight.dx-hl-pink { background: #ffd6ea; } .dx-user-highlight.dx-hl-pink:hover { background: #ffc2df; }',
    '.dx-user-highlight.dx-hl-underline { background: none; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 2px; }',
    '.dx-hl-toolbar { position: fixed; z-index: 9500; display: none; align-items: center; gap: 0.5rem; background: #fff; border-radius: 999px; padding: 0.5rem 0.7rem; box-shadow: 0 10px 28px rgba(17,17,17,0.22); font-family: "Poppins", sans-serif; }',
    '.dx-hl-toolbar.active { display: flex; }',
    '.dx-hl-swatch { width: 26px; height: 26px; border-radius: 50%; border: 1.5px solid rgba(17,17,17,0.12); cursor: pointer; padding: 0; transition: transform 0.12s ease; }',
    '.dx-hl-swatch:hover { transform: scale(1.1); }',
    '.dx-hl-swatch-yellow { background: #fff3a0; } .dx-hl-swatch-blue { background: #cfe3ff; } .dx-hl-swatch-pink { background: #ffd6ea; }',
    '.dx-hl-divider { width: 1px; align-self: stretch; background: rgba(17,17,17,0.12); }',
    '.dx-hl-tool-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; border: none; background: none; color: #1a1a1a; cursor: pointer; }',
    '.dx-hl-tool-btn:hover { background: #f2f2f2; } .dx-hl-tool-btn.on { color: #3457d5; }',
    '.dx-hl-tool-btn svg { width: 16px; height: 16px; display: block; }',
    '.dx-hl-tool-btn.dx-hl-delete:hover { color: #B0271C; background: rgba(176,39,28,0.08); }',
    '.dx-user-highlight.dx-has-note { box-shadow: inset 0 -2px 0 #3457d5; }',
    '.dx-user-highlight.dx-has-note::after { content: ""; display: inline-block; width: 6px; height: 6px; margin-left: 2px; border-radius: 50%; background: #3457d5; vertical-align: super; }',
    '.dx-hl-notebox { position: fixed; z-index: 9501; width: 280px; background: #fff; border-radius: 14px; padding: 0.8rem; box-shadow: 0 10px 28px rgba(17,17,17,0.22); font-family: "Poppins", sans-serif; }',
    '.dx-hl-notebox[hidden] { display: none; }',
    '.dx-hl-notebox label { display: block; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(17,17,17,0.6); margin-bottom: 0.4rem; }',
    '.dx-hl-notebox textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: 0.82rem; border: 1px solid rgba(17,17,17,0.12); border-radius: 8px; padding: 0.5rem; resize: vertical; }',
    '.dx-hl-noteacts { display: flex; justify-content: space-between; margin-top: 0.5rem; }',
    '.dx-hl-noteacts button { font: inherit; font-size: 0.72rem; font-weight: 600; border: 0; background: none; color: rgba(17,17,17,0.6); cursor: pointer; padding: 0.3rem 0.2rem; }',
    '.dx-hl-noteacts #dx-hl-notedone { color: #3457d5; }'
  ].join('\n');
  var MARKUP =
    '<div class="dx-hl-toolbar" id="dx-hl-toolbar">' +
      '<button type="button" class="dx-hl-swatch dx-hl-swatch-yellow" data-hl-color="yellow" title="Highlight yellow"></button>' +
      '<button type="button" class="dx-hl-swatch dx-hl-swatch-blue" data-hl-color="blue" title="Highlight blue"></button>' +
      '<button type="button" class="dx-hl-swatch dx-hl-swatch-pink" data-hl-color="pink" title="Highlight pink"></button>' +
      '<div class="dx-hl-divider"></div>' +
      '<button type="button" class="dx-hl-tool-btn" id="dx-hl-underline" title="Underline" aria-label="Underline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 4v7a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg></button>' +
      '<button type="button" class="dx-hl-tool-btn" id="dx-hl-note" title="Add a note" aria-label="Add a note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v12H8l-4 4z"/><path d="M8 9h8M8 12h5"/></svg></button>' +
      '<button type="button" class="dx-hl-tool-btn dx-hl-delete" id="dx-hl-delete" title="Remove highlight" aria-label="Remove highlight" style="display:none;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>' +
    '</div>' +
    '<div class="dx-hl-notebox" id="dx-hl-notebox" hidden>' +
      '<label for="dx-hl-notetext">Note</label>' +
      '<textarea id="dx-hl-notetext" rows="3" maxlength="400" placeholder="Type a note for this highlight"></textarea>' +
      '<div class="dx-hl-noteacts"><button type="button" id="dx-hl-notedel">Delete note</button><button type="button" id="dx-hl-notedone">Done</button></div>' +
    '</div>';

  var api = window.MorettiHighlighter = { roots: '#q-modal-passage-pane, .q-text' };
  var hlToolbar, hlDeleteBtn, hlUnderlineBtn, noteBox, noteText;
  var hlPendingRange = null, hlTargetMark = null, hlGroupSeq = 0, noteMark = null;

  function hlRootOf(node) {
    if (!node) return null;
    var el = node.nodeType === 1 ? node : node.parentElement;
    return el && el.closest ? el.closest(api.roots) : null;
  }
  function unwrapHighlight(mark) {
    var parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  }
  // One highlight can need several <mark>s, so they carry a group id and recolor and delete act on the whole group.
  function hlGroup(mark) {
    var g = mark.getAttribute('data-hl-group');
    if (!g) return [mark];
    var root = hlRootOf(mark) || document;
    return [].slice.call(root.querySelectorAll('mark[data-hl-group="' + g + '"]'));
  }
  function hlFirstText(el) { return document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null).nextNode(); }
  function hlLastText(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, last = null;
    while ((n = w.nextNode())) last = n;
    return last;
  }
  // Every text node the range touches, the two ends split at the selection's edges so each can be wrapped whole.
  function hlRangeTextNodes(range, root) {
    var sc = range.startContainer, so = range.startOffset, ec = range.endContainer, eo = range.endOffset;
    if (ec.nodeType === 3 && eo > 0 && eo < ec.nodeValue.length) ec.splitText(eo);
    if (sc.nodeType === 3 && so > 0 && so < sc.nodeValue.length) {
      var tail = sc.splitText(so);
      if (ec === sc) ec = tail;
      sc = tail;
    }
    var first = sc.nodeType === 3 ? sc : hlFirstText(sc), last = ec.nodeType === 3 ? ec : hlLastText(ec);
    if (!first || !last) return [];
    var out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, on = false;
    while ((n = w.nextNode())) {
      if (n === first) on = true;
      if (on && n.nodeValue.length) out.push(n);
      if (n === last) break;
    }
    while (out.length && !out[0].nodeValue.trim()) out.shift();
    while (out.length && !out[out.length - 1].nodeValue.trim()) out.pop();
    return out;
  }
  function positionHlToolbar(rect) {
    hlToolbar.classList.add('active');
    var tr = hlToolbar.getBoundingClientRect();
    var left = Math.max(8, Math.min(rect.left + rect.width / 2 - tr.width / 2, window.innerWidth - tr.width - 8));
    var top = rect.top - tr.height - 10;
    if (top < 8) top = rect.bottom + 10;
    hlToolbar.style.left = left + 'px';
    hlToolbar.style.top = top + 'px';
  }
  function closeHlToolbar() { hlToolbar.classList.remove('active'); hlPendingRange = null; hlTargetMark = null; }
  function refreshHlToolbarState() {
    hlDeleteBtn.style.display = hlTargetMark ? '' : 'none';
    hlUnderlineBtn.classList.toggle('on', !!(hlTargetMark && hlTargetMark.classList.contains('dx-hl-underline')));
  }
  function openHlToolbarForRange(range) { hlTargetMark = null; hlPendingRange = range; positionHlToolbar(range.getBoundingClientRect()); refreshHlToolbarState(); }
  function openHlToolbarForMark(mark) { hlPendingRange = null; hlTargetMark = mark; positionHlToolbar(mark.getBoundingClientRect()); refreshHlToolbarState(); }
  // Wraps each text node where it sits, so a fraction drawn with CSS is never cloned apart (see index.html).
  function applyHlClass(className) {
    if (hlTargetMark) {
      hlGroup(hlTargetMark).forEach(function (m) { m.className = 'dx-user-highlight ' + className + (m.getAttribute('data-note') ? ' dx-has-note' : ''); });
      closeHlToolbar();
      return;
    }
    if (!hlPendingRange) return;
    var root = hlRootOf(hlPendingRange.commonAncestorContainer);
    if (root) {
      var gid = 'hl' + (++hlGroupSeq);
      hlRangeTextNodes(hlPendingRange, root).forEach(function (t) {
        if (!t.parentNode) return;
        var m = document.createElement('mark');
        m.className = 'dx-user-highlight ' + className;
        m.setAttribute('data-hl-group', gid);
        t.parentNode.insertBefore(m, t);
        m.appendChild(t);
      });
    }
    window.getSelection().removeAllRanges();
    closeHlToolbar();
  }
  function closeNoteBox() {
    if (!noteMark) { noteBox.hidden = true; return; }
    var v = noteText.value.trim();
    if (v) { noteMark.setAttribute('data-note', v); noteMark.classList.add('dx-has-note'); noteMark.title = v; }
    else { noteMark.removeAttribute('data-note'); noteMark.classList.remove('dx-has-note'); noteMark.removeAttribute('title'); }
    noteMark = null; noteBox.hidden = true;
  }
  function openNoteBox(mark) {
    if (!mark) return;
    noteMark = mark;
    noteText.value = mark.getAttribute('data-note') || '';
    noteBox.hidden = false;
    var r = mark.getBoundingClientRect(), bw = noteBox.offsetWidth, bh = noteBox.offsetHeight;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - bw - 8));
    var top = r.bottom + 8; if (top + bh > window.innerHeight - 8) top = Math.max(8, r.top - bh - 8);
    noteBox.style.left = left + 'px'; noteBox.style.top = top + 'px';
    try { noteText.focus(); } catch (e) {}
  }
  // Figures and tables would be torn out of the text by a wrap across them; those selections are refused.
  function hlRangeHitsFigure(range, root) {
    var figs = root.querySelectorAll('svg, img, table');
    for (var i = 0; i < figs.length; i++) if (range.intersectsNode(figs[i])) return true;
    return false;
  }
  function onMouseUp() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    var range = sel.getRangeAt(0), root = hlRootOf(range.commonAncestorContainer);
    if (!root) return;
    if (range.toString().trim() === '' || hlRangeHitsFigure(range, root)) { sel.removeAllRanges(); return; }
    var existing = root.querySelectorAll('.dx-user-highlight');
    for (var i = 0; i < existing.length; i++) if (range.intersectsNode(existing[i])) { sel.removeAllRanges(); return; }
    openHlToolbarForRange(range.cloneRange());
  }
  function onClick(e) {
    if (!e.target.closest || e.target.closest('#dx-hl-toolbar')) return;
    var hit = e.target.closest('.dx-user-highlight');
    if (hit && hlRootOf(hit)) { openHlToolbarForMark(hit); return; }
    var sel = window.getSelection();
    if (sel && !sel.isCollapsed && hlRootOf(sel.anchorNode)) return;
    if (hlToolbar.classList.contains('active')) closeHlToolbar();
  }

  function init() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    var host = document.createElement('div');
    host.innerHTML = MARKUP;
    while (host.firstChild) document.body.appendChild(host.firstChild);
    hlToolbar = document.getElementById('dx-hl-toolbar');
    hlDeleteBtn = document.getElementById('dx-hl-delete');
    hlUnderlineBtn = document.getElementById('dx-hl-underline');
    noteBox = document.getElementById('dx-hl-notebox');
    noteText = document.getElementById('dx-hl-notetext');
    hlToolbar.querySelectorAll('[data-hl-color]').forEach(function (btn) {
      btn.addEventListener('click', function () { applyHlClass('dx-hl-' + btn.getAttribute('data-hl-color')); });
    });
    hlUnderlineBtn.addEventListener('click', function () { applyHlClass('dx-hl-underline'); });
    hlDeleteBtn.addEventListener('click', function () { if (hlTargetMark) hlGroup(hlTargetMark).forEach(unwrapHighlight); closeHlToolbar(); });
    document.getElementById('dx-hl-note').addEventListener('click', function () {
      var mark = hlTargetMark;
      if (!mark && hlPendingRange) {
        var root = hlRootOf(hlPendingRange.commonAncestorContainer);
        var had = root ? [].slice.call(root.querySelectorAll('.dx-user-highlight')) : [];
        applyHlClass('dx-hl-yellow');
        var all = root ? root.querySelectorAll('.dx-user-highlight') : [];
        for (var i = 0; i < all.length; i++) if (had.indexOf(all[i]) < 0) { mark = all[i]; break; }
      }
      closeHlToolbar();
      openNoteBox(mark);
    });
    document.getElementById('dx-hl-notedone').addEventListener('click', closeNoteBox);
    document.getElementById('dx-hl-notedel').addEventListener('click', function () { noteText.value = ''; closeNoteBox(); });
    noteText.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closeNoteBox(); } });
    document.addEventListener('mousedown', function (e) {
      if (!noteBox.hidden && !noteBox.contains(e.target) && !(e.target.closest && e.target.closest('#dx-hl-toolbar'))) closeNoteBox();
    });
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('click', onClick);
    // A toolbar left floating over a question that has scrolled or changed is closed.
    document.addEventListener('scroll', function () { if (hlToolbar.classList.contains('active')) closeHlToolbar(); }, true);
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
