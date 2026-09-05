/* =========================================================================
   MORETTI STUDENT PORTAL — FLUID UI
   -------------------------------------------------------------------------
   Two motion primitives for index.html, kept out of it. Both are PURE
   DECORATION: nothing here decides what is on screen, what is selected, or
   what a student can click. Delete this file and the portal still works,
   one shade less smooth — which is the standard anything animating an
   18,000-line page it does not own should be held to.

   WHAT IT ADDS.
     1. window.mtaFluid — a travelling indicator for any set of items where
        one carries .active. The portal had two of these, both cutting:
        the sidebar's white pill jumped from item to item, and Saved &
        Mistakes' red underline blinked between the two tabs. Now the
        indicator slides.
     2. window.mtaCountUp — one count-up tween for numbers that appear all
        at once. The portal already counts up its scores in three places
        (Home's composite, the report's score tiles, Question Bank's stats);
        the end-of-round score, which is the one number a student is
        actually waiting for, was not one of them.

   WHY A MutationObserver AND NOT A HOOK. The .active class on a sidebar
   item is set in one place today, but the portal has several paths into a
   screen (the nav click, deep links, the onboarding sequence, a report
   opening the Mistakes tab with a preset). Watching the class is what makes
   the indicator correct on every one of them without this file knowing any
   of them exist — and without a single edit inside the navigation code.

   STYLES ARE INJECTED HERE, deliberately, for the same reason: this brings
   its own ~15 rules rather than adding another block to index.html's
   stylesheet for a feature that is optional by design.
   ========================================================================= */
(function () {
  'use strict';

  var REDUCE = false;
  try {
    REDUCE = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  /* ═══ STYLES ═══ scoped to the indicator and to the two containers it is
     attached to. The two `.mta-fluid-on` rules are the only thing here that
     reaches into the portal's own styling, and both do the same small job:
     stop the item painting the state that the indicator is now painting. */
  function injectStyles() {
    if (document.getElementById('mta-fluid-css')) return;
    var st = document.createElement('style');
    st.id = 'mta-fluid-css';
    st.textContent =
      '.mta-fluid-on{position:relative;}' +
      '.mta-fluid-ind{position:absolute;top:0;left:0;opacity:0;pointer-events:none;z-index:0;' +
        'transition:transform .42s cubic-bezier(.22,1.1,.32,1),width .42s cubic-bezier(.22,1.1,.32,1),' +
        'height .3s var(--ease,cubic-bezier(.16,1,.3,1)),opacity .18s linear;}' +
      '.mta-fluid-pill{background:#fff;border-radius:999px;}' +
      '.mta-fluid-underline{height:2px;background:var(--red,#B0271C);border-radius:2px;top:auto;bottom:-1px;}' +
      /* The items paint above the indicator, and the active one stops
         drawing its own background/underline while the indicator is live. */
      '.sb-links.mta-fluid-on .sidebar-item{position:relative;z-index:1;}' +
      '.sb-links.mta-fluid-on .sidebar-item.active{background:transparent;}' +
      '.iq-tabs.mta-fluid-on .iq-tab.active{border-bottom-color:transparent;}' +
      '@media (prefers-reduced-motion:reduce){.mta-fluid-ind{transition:none;}}' +

      /* ── STEPPER ── a numeric control whose digits roll rather than
         swap. Colours come from currentColor and two custom properties so
         the same control works on the portal's white cards and on the red
         gradient card it currently lives on. */
      '.mta-stepper{display:inline-flex;align-items:center;gap:.55rem;border-radius:999px;' +
        'border:1px solid var(--mta-step-line,rgba(255,255,255,.35));padding:.25rem;' +
        'font-family:var(--hel,inherit);}' +
      '.mta-step-btn{width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;' +
        'border:none;border-radius:50%;cursor:pointer;font-size:1rem;line-height:1;font-weight:700;' +
        'background:var(--mta-step-btn-bg,rgba(255,255,255,.16));color:inherit;padding:0;' +
        'transition:transform .18s cubic-bezier(.22,1.1,.32,1),opacity .18s linear,background .18s linear;}' +
      '.mta-step-btn:hover:not(:disabled){transform:scale(1.06);}' +
      '.mta-step-btn:active:not(:disabled){transform:scale(.92);}' +
      '.mta-step-btn:disabled{opacity:.35;cursor:default;}' +
      '.mta-step-value{position:relative;display:flex;align-items:center;justify-content:center;gap:1px;' +
        'min-width:2.4em;height:1.6em;font-size:1.05rem;font-weight:700;cursor:text;' +
        'font-variant-numeric:tabular-nums;user-select:none;}' +
      '.mta-step-slot{position:relative;width:.62em;height:1.6em;overflow:hidden;}' +
      '.mta-step-slot span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}' +
      // Enter from the direction of travel, leave the opposite way.
      '.mta-roll-in-up{animation:mtaRollInUp .34s cubic-bezier(.22,1.1,.32,1) both;}' +
      '.mta-roll-in-down{animation:mtaRollInDown .34s cubic-bezier(.22,1.1,.32,1) both;}' +
      '.mta-roll-out-up{animation:mtaRollOutUp .34s cubic-bezier(.22,1.1,.32,1) both;}' +
      '.mta-roll-out-down{animation:mtaRollOutDown .34s cubic-bezier(.22,1.1,.32,1) both;}' +
      '@keyframes mtaRollInUp{from{transform:translateY(80%) scale(.6);opacity:0;filter:blur(2px);}' +
        'to{transform:none;opacity:1;filter:none;}}' +
      '@keyframes mtaRollInDown{from{transform:translateY(-80%) scale(.6);opacity:0;filter:blur(2px);}' +
        'to{transform:none;opacity:1;filter:none;}}' +
      '@keyframes mtaRollOutUp{from{transform:none;opacity:1;filter:none;}' +
        'to{transform:translateY(-80%) scale(.6);opacity:0;filter:blur(2px);}}' +
      '@keyframes mtaRollOutDown{from{transform:none;opacity:1;filter:none;}' +
        'to{transform:translateY(80%) scale(.6);opacity:0;filter:blur(2px);}}' +
      /* The input sits ON TOP of the digit slots, and it is transparent --
         so without this the number being typed reads on top of the number
         being replaced. The slots go, not the input's transparency: a
         solid input would need to match whatever surface the stepper is
         sitting on, and it sits on two different ones already. */
      '.mta-step-value.mta-step-editing .mta-step-slot{opacity:0;}' +
      '.mta-step-input{position:absolute;inset:0;width:100%;height:100%;border:none;background:transparent;' +
        'color:inherit;font:inherit;text-align:center;padding:0;font-variant-numeric:tabular-nums;}' +
      '.mta-step-input:focus{outline:none;}' +
      '@media (prefers-reduced-motion:reduce){.mta-step-btn,.mta-step-slot span{animation:none!important;' +
        'transition:none!important;}}' +

      /* ── SPLIT BUTTON ── one primary action with its variants folded up
         behind a caret. The extra actions expand from a real measured
         width, so the row grows the way a drawer opens rather than
         popping to its full size. */
      '.mta-split{display:inline-flex;align-items:center;}' +
      /* overflow:hidden is what makes the max-width collapse read as a
         drawer -- but it clips VERTICALLY too, which was cutting the top
         off the primary button when it lifts on hover. The padding gives
         the lift somewhere to go; the negative margin keeps the control
         the same size on the card. */
      '.mta-split-primary,.mta-split-more{display:flex;align-items:center;gap:.4rem;overflow:hidden;' +
        'padding:6px 0;margin:-6px 0;' +
        'transition:max-width .42s cubic-bezier(.22,1.1,.32,1),opacity .22s linear;}' +
      '.mta-split-more{max-width:0;opacity:0;}' +
      '.mta-split.open .mta-split-more{opacity:1;}' +
      '.mta-split.open .mta-split-primary{opacity:0;}' +
      '.mta-split-action{flex:none;white-space:nowrap;border:1px solid var(--mta-split-line,rgba(255,255,255,.45));' +
        'background:var(--mta-split-bg,rgba(255,255,255,.12));color:inherit;font-family:inherit;' +
        'font-size:.68rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;' +
        'border-radius:999px;padding:.5rem .72rem;cursor:pointer;' +
        'transition:transform .18s cubic-bezier(.22,1.1,.32,1),background .18s linear;}' +
      '.mta-split-action:hover{background:var(--mta-split-bg-hover,rgba(255,255,255,.24));transform:translateY(-1px);}' +
      '.mta-split-action:active{transform:scale(.96);}' +
      '@media (prefers-reduced-motion:reduce){.mta-split-more,.mta-split-primary,.mta-split-action{' +
        'transition:none!important;}}' +

      /* ── SLIDER ── a value you drag rather than a set of buttons you pick
         from. The fill runs under the thumb, the dots mark the track, and
         the number above rolls a digit at a time (same machinery as the
         stepper). */
      '.mta-slider{display:flex;flex-direction:column;gap:.5rem;width:100%;}' +
      '.mta-slider-head{display:flex;align-items:baseline;gap:.35rem;}' +
      '.mta-slider-val{display:flex;gap:1px;font-size:1.5rem;font-weight:800;line-height:1;' +
        'color:var(--text,#111);font-variant-numeric:tabular-nums;}' +
      '.mta-slider-word{display:inline-block;}' +
      '.mta-slider-unit{font-size:.78rem;font-weight:600;color:var(--mid,rgba(17,17,17,.58));}' +
      '.mta-slider-track{position:relative;height:40px;border-radius:999px;' +
        'background:var(--mta-slider-bg,rgba(17,17,17,.06));overflow:hidden;}' +
      '.mta-slider-dots{position:absolute;inset:0;display:flex;align-items:center;' +
        'justify-content:space-between;padding:0 15px;pointer-events:none;}' +
      '.mta-slider-dots i{width:4px;height:4px;border-radius:50%;background:rgba(17,17,17,.2);}' +
      '.mta-slider-fill{position:absolute;left:0;top:0;height:100%;border-radius:999px;pointer-events:none;' +
        'background:linear-gradient(to right,var(--gold,#C9A84C),var(--red,#B0271C));' +
        'transition:width .26s cubic-bezier(.22,1.1,.32,1);}' +
      '.mta-slider-thumb{position:absolute;top:0;width:40px;height:40px;display:flex;align-items:center;' +
        'justify-content:center;pointer-events:none;transition:left .26s cubic-bezier(.22,1.1,.32,1);}' +
      '.mta-slider-thumb i{width:30px;height:30px;border-radius:50%;background:#fff;' +
        'box-shadow:0 2px 6px rgba(17,17,17,.22),inset 0 2px 4px rgba(0,0,0,.05);}' +
      '.mta-slider input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;' +
        'cursor:pointer;z-index:2;}' +
      // While a finger or mouse is actually on it, the fill must track the
      // input exactly — an easing curve here reads as lag, not as polish.
      '.mta-slider.dragging .mta-slider-fill,.mta-slider.dragging .mta-slider-thumb{transition:none;}' +
      '@media (prefers-reduced-motion:reduce){.mta-slider-fill,.mta-slider-thumb{transition:none;}}' +

      /* ── SKELETON ── shown while a screen waits on the backend. The
         portal's own measurements put an Apps Script round trip at ~1.2s
         warm and 5-6s cold, which is a long time to sit under the word
         "Loading". A shape that matches what is coming says the same thing
         and says it about the actual content. */
      '.mta-skel{display:flex;flex-direction:column;gap:.7rem;}' +
      '.mta-skel-row{height:var(--mta-skel-h,44px);border-radius:10px;position:relative;overflow:hidden;' +
        'background:rgba(17,17,17,.05);}' +
      '.mta-skel-row::after{content:"";position:absolute;inset:0;transform:translateX(-100%);' +
        'background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent);' +
        'animation:mtaSkel 1.4s ease-in-out infinite;}' +
      '@keyframes mtaSkel{100%{transform:translateX(100%);}}' +
      '@media (prefers-reduced-motion:reduce){.mta-skel-row::after{animation:none;}}';
    (document.head || document.documentElement).appendChild(st);
  }

  /* ═══ THE TRAVELLING INDICATOR ═══
     Measures the active item and moves one absolutely-positioned element to
     it. offsetLeft/offsetTop are read against the container (which this
     makes position:relative), so a horizontally-scrolled container — the
     sidebar is a scrolling strip on mobile — needs no special handling: the
     indicator scrolls with the items because it is positioned against the
     same padding box they are. */
  function attach(container, opts) {
    if (!container) return null;
    if (container.__mtaFluid) {
      /* Already attached -- unless the container's contents were rebuilt
         underneath us and took the indicator with them (the Question Bank
         rebuilds its segmented control when the subject changes). Then this
         is a fresh attach, not a no-op. */
      if (container.querySelector('.mta-fluid-ind')) { container.__mtaFluid.sync(); return container.__mtaFluid; }
      container.__mtaFluid = null;
    }
    injectStyles();
    opts = opts || {};
    var itemSel = opts.item || '.mta-fluid-item';
    var mode = opts.mode === 'underline' ? 'underline' : 'pill';

    var ind = document.createElement('span');
    ind.className = 'mta-fluid-ind mta-fluid-' + mode;
    ind.setAttribute('aria-hidden', 'true');
    container.insertBefore(ind, container.firstChild);
    container.classList.add('mta-fluid-on');

    /* First placement must not animate -- an indicator sliding in from the
       top-left corner on load is a worse first impression than no
       indicator at all. Also re-armed whenever the active item goes away,
       so coming back to a screen places the indicator instead of flying it
       across from wherever it was last. */
    var placeInstantly = true;

    function sync() {
      var el = container.querySelector(itemSel + '.active');
      // No active item, or the container is not laid out yet (a screen that
      // is still display:none). Hide rather than guess.
      if (!el || !el.offsetWidth) { ind.style.opacity = '0'; placeInstantly = true; return; }
      if (placeInstantly) ind.style.transition = 'none';
      ind.style.opacity = '1';
      ind.style.width = el.offsetWidth + 'px';
      if (mode === 'pill') {
        ind.style.height = el.offsetHeight + 'px';
        ind.style.transform = 'translate(' + el.offsetLeft + 'px,' + el.offsetTop + 'px)';
      } else {
        ind.style.transform = 'translateX(' + el.offsetLeft + 'px)';
      }
      if (placeInstantly) {
        ind.getBoundingClientRect();        // commit before re-enabling motion
        ind.style.transition = '';
        placeInstantly = false;
      }
      keepInView(el);
    }

    /* On phones the sidebar is a horizontally scrolling strip, and the item
       for the screen you are actually on is frequently off the right-hand
       edge of it -- open Vocabulary and the strip still shows Home. The
       indicator was about to slide somewhere nobody could see. Bring it
       into view instead; only ever when the strip really does scroll. */
    function keepInView(el) {
      if (container.scrollWidth <= container.clientWidth + 1) return;
      var left = el.offsetLeft, right = left + el.offsetWidth;
      var viewL = container.scrollLeft, viewR = viewL + container.clientWidth;
      var pad = 16;
      var to = null;
      if (left - pad < viewL) to = Math.max(0, left - pad);
      else if (right + pad > viewR) to = right + pad - container.clientWidth;
      if (to === null) return;
      // Smooth scrolling is frame-driven, so in a hidden tab it would never
      // advance -- jump there instead, the same way reduced motion does.
      var smooth = !REDUCE && !document.hidden;
      try { container.scrollTo({ left: to, behavior: smooth ? 'smooth' : 'auto' }); }
      catch (e) { container.scrollLeft = to; }
    }

    /* Coalesced to one measurement per frame: a class change, a resize and
       a font swap can easily all land together. requestAnimationFrame is
       the right clock while the tab is visible and the WRONG one when it is
       not -- browsers stop firing it in a hidden tab, so a student who
       switches screens, switches tabs, and comes back would find the
       indicator still on the screen they left. A timer keeps it honest
       there; the geometry is correct either way, only the timing differs. */
    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      var run = function () { queued = false; sync(); };
      if (typeof requestAnimationFrame === 'function' && !document.hidden) requestAnimationFrame(run);
      else setTimeout(run, 0);
    }

    try {
      new MutationObserver(schedule).observe(container, {
        subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style']
      });
    } catch (e) {}
    // Catches the two cases a class change cannot: the window resizing, and
    // the container going from hidden to laid out when its screen opens.
    window.addEventListener('resize', schedule);
    try { if (window.ResizeObserver) new ResizeObserver(schedule).observe(container); } catch (e) {}

    container.__mtaFluid = { sync: schedule };
    schedule();
    return container.__mtaFluid;
  }

  /* ═══ COUNT-UP ═══ same curve the report's score tiles land on, so the
     end-of-round score and the report agree about how a number arrives.
     `suffix` keeps the "/ 12" (or a "%") intact while only the counting
     part moves — the portal's older count-up helpers write a bare integer
     and would eat it. */
  function countUp(el, target, opts) {
    if (!el) return;
    opts = opts || {};
    var suffix = opts.suffix || '', prefix = opts.prefix || '';
    target = Number(target);
    if (!isFinite(target)) return;
    function land() { el.textContent = prefix + target + suffix; }
    /* A hidden tab gets the number, not the tween: requestAnimationFrame
       does not run there, so the count would sit at 0 until the student
       came back and then play for an audience that has already read the
       screen. Nobody is watching -- just land it. */
    if (REDUCE || !window.requestAnimationFrame || document.hidden) { land(); return; }
    var duration = opts.duration || 900, start = null;
    // Out-cubic: quick off the mark, long settle.
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    el.textContent = prefix + '0' + suffix;
    requestAnimationFrame(function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      if (p >= 1) { land(); return; }
      el.textContent = prefix + Math.round(target * ease(p)) + suffix;
      requestAnimationFrame(tick);
    });
  }

  /* ═══ STEPPER ═══ a numeric control with plus/minus and rolling digits.
     Ported from a React/Framer component (Watermelon UI's Stepper) into
     the portal's own vanilla CSS: same idea -- only the digits that
     actually changed move, and they enter from the direction of travel --
     without pulling a 40KB animation runtime into an 18,000-line page that
     has no build step.

     Double-click (or Enter / a tap-and-hold-free focus) turns the number
     into an input, so a student going from 50 to 20 types it instead of
     pressing minus six times. Arrow keys work on the focused value too. */
  function stepper(opts) {
    opts = opts || {};
    var min = opts.min == null ? 0 : opts.min;
    var max = opts.max == null ? 999 : opts.max;
    var stepBy = opts.step || 1;
    var value = clamp(opts.value == null ? min : opts.value);
    var onChange = opts.onChange || function () {};

    function clamp(v) { return Math.max(min, Math.min(max, Math.round(v || 0))); }

    var root = document.createElement('div');
    root.className = 'mta-stepper';
    root.setAttribute('role', 'group');
    if (opts.label) root.setAttribute('aria-label', opts.label);

    var minus = button('\u2212', -1), val = document.createElement('div'), plus = button('+', 1);
    val.className = 'mta-step-value';
    val.tabIndex = 0;
    val.setAttribute('role', 'spinbutton');
    root.appendChild(minus); root.appendChild(val); root.appendChild(plus);

    function button(glyph, dir) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mta-step-btn';
      b.textContent = glyph;
      b.setAttribute('aria-label', (dir < 0 ? 'Decrease' : 'Increase') + (opts.label ? ' ' + opts.label : ''));
      b.addEventListener('click', function () { set(value + dir * stepBy, dir); });
      return b;
    }

    /* Digit slots, aligned from the RIGHT so 9 -> 10 rolls the units digit
       and adds a tens slot, rather than every digit changing because the
       string got longer. */
    function paint(next, dir) {
      var from = String(value), to = String(next);
      /* Anything still on its way out goes NOW. Waiting on animationend
         alone was leaving the old number stacked under the new one when a
         value was typed rather than stepped -- the commit happens on a
         keypress, not on a frame, so two paints can land inside one
         animation. */
      Array.prototype.forEach.call(val.querySelectorAll('.mta-roll-out-up,.mta-roll-out-down'),
        function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
      var slots = val.querySelectorAll('.mta-step-slot');
      if (slots.length !== to.length) {
        val.innerHTML = '';
        for (var i = 0; i < to.length; i++) {
          var slot = document.createElement('div');
          slot.className = 'mta-step-slot';
          var sp = document.createElement('span');
          sp.textContent = to.charAt(i);
          if (dir) sp.className = dir > 0 ? 'mta-roll-in-up' : 'mta-roll-in-down';
          slot.appendChild(sp);
          val.appendChild(slot);
        }
        return;
      }
      var pad = to.length - from.length;
      for (var j = 0; j < to.length; j++) {
        var wasIdx = j - pad;
        var was = wasIdx >= 0 ? from.charAt(wasIdx) : null;
        if (was === to.charAt(j)) continue;
        var s = slots[j], old = s.querySelector('span:not(.mta-roll-out-up):not(.mta-roll-out-down)');
        var fresh = document.createElement('span');
        fresh.textContent = to.charAt(j);
        if (dir && !REDUCE) fresh.className = dir > 0 ? 'mta-roll-in-up' : 'mta-roll-in-down';
        if (old && dir && !REDUCE && !document.hidden) {
          old.className = dir > 0 ? 'mta-roll-out-up' : 'mta-roll-out-down';
          /* animationend is the clean signal and a timer is the honest
             backstop: it does not fire in a hidden tab, and a digit that
             never leaves stacks the old number on top of the new one. */
          var done = function () { if (old.parentNode) old.parentNode.removeChild(old); };
          old.addEventListener('animationend', done);
          setTimeout(done, 420);
        } else if (old && old.parentNode) {
          old.parentNode.removeChild(old);
        }
        s.appendChild(fresh);
      }
    }

    // Builds every slot from scratch — used when a value is typed.
    function paintFresh(to, dir) {
      var str = String(to);
      for (var i = 0; i < str.length; i++) {
        var slot = document.createElement('div');
        slot.className = 'mta-step-slot';
        var sp = document.createElement('span');
        sp.textContent = str.charAt(i);
        if (dir && !REDUCE && !document.hidden) sp.className = dir > 0 ? 'mta-roll-in-up' : 'mta-roll-in-down';
        slot.appendChild(sp);
        val.appendChild(slot);
      }
    }

    function set(next, dir, quiet) {
      next = clamp(next);
      if (next === value) { syncButtons(); return; }
      paint(next, dir || (next > value ? 1 : -1));
      value = next;
      syncButtons();
      if (!quiet) onChange(value);
    }

    function syncButtons() {
      minus.disabled = value <= min;
      plus.disabled = value >= max;
      val.setAttribute('aria-valuenow', String(value));
      val.setAttribute('aria-valuemin', String(min));
      val.setAttribute('aria-valuemax', String(max));
    }

    /* ── type a number instead ── */
    var editing = false;
    function edit() {
      if (editing) return;
      editing = true;
      val.classList.add('mta-step-editing');
      var input = document.createElement('input');
      input.className = 'mta-step-input';
      input.type = 'text';
      input.inputMode = 'numeric';
      input.value = String(value);
      val.appendChild(input);
      input.focus(); input.select();
      function done(commit) {
        if (!editing) return;
        editing = false;
        val.classList.remove('mta-step-editing');
        var typed = parseInt(input.value, 10);
        if (input.parentNode) input.parentNode.removeChild(input);
        if (!commit || !isFinite(typed)) return;
        /* A typed number is a jump, not a step: rebuild the slots outright
           so nothing from the old value can linger behind it. */
        var next = clamp(typed);
        var dir = next > value ? 1 : -1;
        val.innerHTML = '';
        value = next === value ? value : value;   // paint() reads `value` as the from-state
        paintFresh(next, dir);
        value = next;
        syncButtons();
        onChange(value);
      }
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); done(true); }
        else if (e.key === 'Escape') { e.preventDefault(); done(false); }
        e.stopPropagation();          // never let a portal-level key handler see this
      });
      input.addEventListener('blur', function () { done(true); });
    }
    val.addEventListener('dblclick', edit);
    val.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); set(value + stepBy, 1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); set(value - stepBy, -1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); edit(); }
    });

    injectStyles();
    paint(value, 0);
    syncButtons();

    return { el: root, get: function () { return value; }, set: function (v) { set(v, 0, true); } };
  }

  /* ═══ SPLIT BUTTON ═══ wraps an EXISTING primary button rather than
     replacing it, so whatever already styles that button, disables it
     mid-request, or holds a reference to it by id keeps working -- the
     split only adds a caret and the variants behind it.

     Collapsed is the resting state on purpose: the primary action is the
     one nearly everyone wants, and the alternatives should cost a click
     to see, not a decision to ignore. */
  function splitButton(opts) {
    opts = opts || {};
    var primary = opts.primary;
    var actions = opts.actions || [];
    if (!primary || !actions.length) return null;
    injectStyles();

    var wrap = document.createElement('div');
    wrap.className = 'mta-split';
    var pWrap = document.createElement('span');
    pWrap.className = 'mta-split-primary';
    var more = document.createElement('div');
    more.className = 'mta-split-more';

    actions.forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mta-split-action' + (a.emphasis ? ' mta-split-action-primary' : '');
      b.textContent = a.label;
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        a.onSelect();
      });
      more.appendChild(b);
    });

    primary.parentNode.insertBefore(wrap, primary);
    pWrap.appendChild(primary);
    wrap.appendChild(pWrap);
    wrap.appendChild(more);

    /* Both halves are measured once, up front: max-width has to be a real
       number at both ends for the transition to run at all. */
    var primaryW = pWrap.scrollWidth, moreW = more.scrollWidth;
    function measure() { 
      var wasOpen = open;
      if (wasOpen) return;                       // never measure mid-swap
      primaryW = pWrap.scrollWidth;
      var prev = more.style.maxWidth;
      more.style.maxWidth = 'none';
      moreW = more.scrollWidth;
      more.style.maxWidth = prev;
    }
    measure();
    pWrap.style.maxWidth = primaryW + 'px';

    /* The primary click OPENS rather than acts. That is the whole point of
       the control here: "Start" is a question — which of these? — and the
       answer is the thing that runs. So the card must not also keep a
       direct listener on the button, or one click would both ask and
       answer (see the wiring in index.html). */
    var open = false;
    function setOpen(next) {
      open = next;
      wrap.classList.toggle('open', open);
      primary.setAttribute('aria-expanded', open ? 'true' : 'false');
      pWrap.style.maxWidth = open ? '0px' : primaryW + 'px';
      more.style.maxWidth = open ? (moreW + 4) + 'px' : '0px';
    }

    primary.setAttribute('aria-haspopup', 'true');
    primary.setAttribute('aria-expanded', 'false');
    primary.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!open);
    });
    document.addEventListener('click', function (e) { if (open && !wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setOpen(false); });
    window.addEventListener('resize', function () { measure(); if (open) setOpen(true); });

    return { el: wrap, close: function () { setOpen(false); } };
  }

  /* ═══ SLIDER ═══ ported from a React/Framer adaptive slider: gradient
     fill, dotted track, a thumb that rides it, and a value that rolls its
     digits. A real <input type="range"> sits invisible on top, so keyboard,
     touch and screen readers get the control they already understand and
     none of the drag maths is ours.

     `format` lets a caller name a value rather than print it — the Question
     Bank calls its maximum "All" instead of a number. */
  function slider(opts) {
    opts = opts || {};
    var min = opts.min == null ? 0 : opts.min;
    var max = opts.max == null ? 100 : opts.max;
    var step = opts.step || 1;
    var value = Math.min(max, Math.max(min, opts.value == null ? min : opts.value));
    var onChange = opts.onChange || function () {};
    var format = opts.format || function (v) { return String(v); };
    injectStyles();

    var root = document.createElement('div');
    root.className = 'mta-slider';

    var head = document.createElement('div');
    head.className = 'mta-slider-head';
    var val = document.createElement('div');
    val.className = 'mta-slider-val';
    head.appendChild(val);
    if (opts.unit) {
      var unit = document.createElement('span');
      unit.className = 'mta-slider-unit';
      unit.textContent = opts.unit;
      head.appendChild(unit);
    }

    var track = document.createElement('div');
    track.className = 'mta-slider-track';
    var dots = document.createElement('div');
    dots.className = 'mta-slider-dots';
    for (var i = 0; i < (opts.dots || 6); i++) dots.appendChild(document.createElement('i'));
    var fill = document.createElement('div');
    fill.className = 'mta-slider-fill';
    var thumb = document.createElement('div');
    thumb.className = 'mta-slider-thumb';
    thumb.appendChild(document.createElement('i'));
    var input = document.createElement('input');
    input.type = 'range';
    input.min = String(min); input.max = String(max); input.step = String(step);
    input.value = String(value);
    if (opts.label) input.setAttribute('aria-label', opts.label);

    track.appendChild(dots); track.appendChild(fill); track.appendChild(thumb); track.appendChild(input);
    root.appendChild(head); root.appendChild(track);

    // Digits roll only for the ones that changed, exactly like the stepper.
    var shown = '';
    function paintValue(text, dir) {
      if (text === shown) return;
      /* A word is not a number: "All" laid out in fixed-width digit slots
         came out spaced like A-l-l. Words get one plain span; only digits
         get the per-slot roll. */
      if (!/^\d+$/.test(text)) {
        val.innerHTML = '<span class="mta-slider-word">' + text + '</span>';
        shown = text;
        return;
      }
      if (!/^\d+$/.test(shown)) val.innerHTML = '';
      var slots = val.querySelectorAll('.mta-step-slot');
      var same = slots.length === text.length && shown.length === text.length;
      if (!same) {
        val.innerHTML = '';
        for (var i = 0; i < text.length; i++) {
          var slot = document.createElement('div');
          slot.className = 'mta-step-slot';
          var sp = document.createElement('span');
          sp.textContent = text.charAt(i);
          slot.appendChild(sp);
          val.appendChild(slot);
        }
      } else {
        for (var j = 0; j < text.length; j++) {
          if (shown.charAt(j) === text.charAt(j)) continue;
          var s2 = slots[j];
          var old = s2.querySelector('span:not(.mta-roll-out-up):not(.mta-roll-out-down)');
          var fresh = document.createElement('span');
          fresh.textContent = text.charAt(j);
          if (!REDUCE && !document.hidden) {
            fresh.className = dir > 0 ? 'mta-roll-in-up' : 'mta-roll-in-down';
            if (old) {
              old.className = dir > 0 ? 'mta-roll-out-up' : 'mta-roll-out-down';
              var drop = function (n) { return function () { if (n.parentNode) n.parentNode.removeChild(n); }; }(old);
              old.addEventListener('animationend', drop);
              setTimeout(drop, 420);
            }
          } else if (old && old.parentNode) {
            old.parentNode.removeChild(old);
          }
          s2.appendChild(fresh);
        }
      }
      shown = text;
    }

    function paint(dir) {
      var pct = max === min ? 0 : (value - min) / (max - min);
      // 40px is the thumb; the fill ends under its centre, never past it.
      fill.style.width = 'calc(' + (pct * 100) + '% * (1 - 40px / 100%) + 40px)';
      thumb.style.left = 'calc(' + (pct * 100) + '% - ' + (pct * 40) + 'px)';
      paintValue(format(value), dir == null ? 1 : dir);
    }

    input.addEventListener('input', function () {
      var next = Number(input.value);
      var dir = next > value ? 1 : -1;
      value = next;
      root.classList.add('dragging');
      paint(dir);
      onChange(value);
    });
    ['change', 'pointerup', 'blur'].forEach(function (ev) {
      input.addEventListener(ev, function () { root.classList.remove('dragging'); });
    });

    paint(1);
    return {
      el: root,
      get: function () { return value; },
      set: function (v) { value = Math.min(max, Math.max(min, v)); input.value = String(value); paint(1); }
    };
  }

  /* Fills a container with placeholder rows. Deliberately dumb: callers
     replace the whole container the moment their data lands, so there is
     nothing to tear down. */
  function skeleton(host, opts) {
    if (!host) return;
    opts = opts || {};
    injectStyles();
    var rows = opts.rows || 4;
    var html = '<div class="mta-skel">';
    for (var i = 0; i < rows; i++) {
      // A little variation stops it reading as a loading bar.
      var w = opts.stagger === false ? 100 : [100, 92, 96, 88][i % 4];
      html += '<div class="mta-skel-row" style="width:' + w + '%;' +
        (opts.height ? '--mta-skel-h:' + opts.height + ';' : '') + '"></div>';
    }
    host.innerHTML = html + '</div>';
  }

  window.mtaSkeleton = skeleton;
  window.mtaSlider = slider;
  window.mtaSplitButton = splitButton;
  window.mtaStepper = stepper;
  window.mtaFluid = { attach: attach };
  window.mtaCountUp = countUp;

  /* ═══ SELF-WIRING ═══ the two places in the portal that have a set of
     items with one .active. Both are in index.html's static markup, so
     there is nothing to wait for beyond the DOM; the indicator stays
     hidden until its screen is actually laid out. */
  function init() {
    attach(document.querySelector('.sb-links'), { item: '.sidebar-item', mode: 'pill' });
    attach(document.getElementById('iq-tabs'), { item: '.iq-tab', mode: 'underline' });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
