/* The homepage #start form (index.html), shared by the SAT, math and
   admissions pages: the handler, the next-sitting line and the underline
   under "free", copied from the homepage. If the homepage form changes,
   change this too. Needs portal/backend-url.js and site.js. */
(function(){
function safe(fn){ try{ fn(); }catch(err){ if(window.console) console.error('[moretti]',err); } }

/* ── the double underline under "free": drawn when the section is reached ── */
safe(function(){
  var sec=document.querySelector('.capture'), wrap=document.querySelector('.uline');
  if(!sec||!wrap) return;
  /* dash length has to match each path, or the stroke starts part-drawn */
  [].forEach.call(wrap.querySelectorAll('path'),function(p){
    var len=p.getTotalLength();
    p.style.setProperty('--len', len);
    p.style.strokeDasharray=len;
    p.style.strokeDashoffset=len;
  });
  if(!('IntersectionObserver' in window)){ sec.classList.add('drawn'); return; }
  var io=new IntersectionObserver(function(en){
    en.forEach(function(x){ if(x.isIntersecting){ sec.classList.add('drawn'); io.disconnect(); } });
  },{threshold:.25});
  io.observe(sec);
});

/* ── the sitting named beside the form: the next SAT whose regular
      registration deadline has not passed. The markup ships with the
      right answer, so this only keeps it true. ── */
safe(function(){
  var el=document.getElementById('cd-fit'), rg=document.getElementById('cd-reg'); if(!el) return;
  /* keep in step with the table on test-dates.html, which is the source */
  /* [test, regular deadline, late deadline]. A sitting stays "next" until
     late registration closes, as on test-dates.html: past the regular
     deadline the line says "late registration by". */
  var DATES=[['2026-10-03','2026-09-18','2026-09-22'],['2026-11-07','2026-10-23','2026-10-27'],['2026-12-05','2026-11-20','2026-11-24'],
             ['2027-03-06','2027-02-19','2027-02-23'],['2027-05-01','2027-04-16','2027-04-20'],['2027-06-05','2027-05-21','2027-05-25']];
  var MON=['January','February','March','April','May','June','July',
           'August','September','October','November','December'];
  function d(iso){ var a=iso.split('-'); return new Date(+a[0], +a[1]-1, +a[2]); }
  var today=new Date(); today.setHours(0,0,0,0);
  var lbl=document.getElementById('cd-reglbl');
  for(var i=0;i<DATES.length;i++){
    var t=d(DATES[i][0]), r=d(DATES[i][1]), late=d(DATES[i][2]);
    if(late>=today){
      var onTime=r>=today, by=onTime?r:late;
      el.textContent=MON[t.getMonth()]+' '+t.getDate();
      if(rg) rg.textContent=MON[by.getMonth()]+' '+by.getDate();
      if(lbl) lbl.textContent=onTime?'register by':'late registration by';
      return;
    }
  }
  /* past the end of the table: say nothing rather than something wrong */
  var line=el.closest('.capdate'); if(line) line.style.display='none';
});

safe(function(){
/* reserve form: honeypot, timing gate, Apps Script */
  var LEAD_BACKEND_URL = window.APPS_SCRIPT_URL;   // portal/backend-url.js
  var readyAt = Date.now();
  var form = document.getElementById('reserve-form');
  if (!form) return;
  /* Missing or malformed fields are named inline, under the button, and the
     first one gets the cursor. This used to be a browser alert() box. */
  var invalidMsg = document.getElementById('rf-invalid');
  function checkFields(name, phone, email) {
    var checks = [
      ['rf-name',  !name, 'your name'],
      ['rf-phone', phone.replace(/\D/g, '').length < 7, phone ? 'a full phone number' : 'a phone number'],
      ['rf-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), email ? 'a complete email address' : 'an email address']
    ];
    var wanted = [], first = null;
    checks.forEach(function (c) {
      var el = document.getElementById(c[0]);
      el.setAttribute('aria-invalid', c[1] ? 'true' : 'false');
      if (c[1]) { wanted.push(c[2]); if (!first) first = el; }
    });
    if (!first) { invalidMsg.style.display = 'none'; return true; }
    invalidMsg.textContent = 'Please add ' + (wanted.length === 1 ? wanted[0]
      : wanted.slice(0, -1).join(', ') + ' and ' + wanted[wanted.length - 1]) + '.';
    invalidMsg.style.display = 'block';
    first.focus();
    return false;
  }
  ['rf-name', 'rf-phone', 'rf-email'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('input', function () {
      if (el.getAttribute('aria-invalid') === 'true' && el.value.trim()) el.setAttribute('aria-invalid', 'false');
    });
  });

  /* ?start=call or ?start=diagnostic in the URL, or a button on the page
     carrying data-start, picks the door before the parent gets here. */
  function pickDoor(want) {
    var pick = want && document.getElementById(want === 'call' ? 'rf-start-call' : want === 'diagnostic' ? 'rf-start-diag' : '');
    if (pick) pick.checked = true;
  }
  try { pickDoor(new URLSearchParams(location.search).get('start')); } catch (err) {}
  [].forEach.call(document.querySelectorAll('[data-start]'), function (a) {
    a.addEventListener('click', function () { pickDoor(a.getAttribute('data-start')); });
  });
  /* data-interest on the form names the page's service, so the lead says
     which one the family was reading about. */
  var interest = form.getAttribute('data-interest') || '';

  /* A family who wants to talk first (or is on a page that starts with a
     call: math and essays have no diagnostic door) can book the call right
     away on book.html. What they just typed goes along in sessionStorage,
     never in the URL, so they are not asked twice. */
  var hasDoors = !!form.querySelector('input[name="start"]');
  var ABOUT = { 'Math tutoring': 'math', 'Essays and applications': 'essays', 'SAT tutoring': 'sat' };
  function offerCall(okEl, start, name, email, phone) {
    if (hasDoors && start !== 'call') return;
    try { sessionStorage.setItem('mt_book_prefill', JSON.stringify({ name: name, email: email, phone: phone, about: ABOUT[interest] || 'sat' })); } catch (err) {}
    if (okEl.querySelector('.rf-book')) return;
    var a = document.createElement('a');
    a.className = 'rf-book';
    a.href = '/book.html';
    a.textContent = 'Want to skip the back and forth? Pick a time for a free 15-minute call \u2192';
    a.style.cssText = 'display:block; margin-top:8px; font-weight:600;';
    okEl.appendChild(a);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name  = document.getElementById('rf-name').value.trim();
    var phone = document.getElementById('rf-phone').value.trim();
    var email = document.getElementById('rf-email').value.trim();
    var message = document.getElementById('rf-message').value.trim();
    /* Which door the family picked travels with the lead as the first line of
       the message, so it reaches the sheet and the lead email with no backend
       change. Unpicked is fine: the reply asks. */
    var startEl = form.querySelector('input[name="start"]:checked');
    var start = startEl ? startEl.value : '';
    if (start) message = (start === 'call' ? 'Wants to talk first, then the diagnostic' : 'Wants to start with: the free diagnostic') + (message ? '\n\n' + message : '');
    if (interest) message = 'Interested in: ' + interest + (message ? '\n' + message : '');
    /* Only name, phone and email are required: grade, subject and parent vs
       student are answered in the first minute of the call, and asking here
       turns a free diagnostic into a quoting form. */
    if (!checkFields(name, phone, email)) return;

    var honeypot = document.getElementById('rf-hp').value;
    var elapsedMs = Date.now() - readyAt;
    // Autofill can stamp the honeypot at the same moment it fills the real
    // fields. If the browser says the field was autofilled, don't hold it
    // against a real visitor.
    if (honeypot) {
      var hpEl = document.getElementById('rf-hp');
      [':autofill', ':-webkit-autofill'].forEach(function (sel) {
        try { if (hpEl.matches(sel)) honeypot = ''; } catch (err) {}
      });
    }
    var note = document.getElementById('rf-note'),
        ok   = document.getElementById('rf-success'),
        bad  = document.getElementById('rf-error'),
        btn  = document.getElementById('rf-submit');

    // Tripped honeypot or an implausibly fast submit reads as a bot:
    // show success and skip the network call, so it has no signal to adapt to.
    if (honeypot || elapsedMs < 2500) {
      note.style.display='none'; ok.style.display='block'; bad.style.display='none';
      form.reset(); return;
    }
    /* The page's own label, so a form whose button says something else
       (the diagnostic page) comes back to its own words, not "Get started". */
    var btnLabel = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending…';
    fetch(LEAD_BACKEND_URL, {
      method: 'POST',
      body: JSON.stringify({ action:'submitLead', name:name, phone:phone, email:email,
                             message:message, hp:honeypot, elapsedMs:elapsedMs,
                             src: (window.MTSource && window.MTSource.forLead()) || null })
    }).then(function(res){ return res.json(); })
      .then(function(data){
        if (!data || !data.ok) throw new Error('submit_failed');
        note.style.display='none'; ok.style.display='block'; bad.style.display='none';
        offerCall(ok, start, name, email, phone);
        // The conversion. Fired only on a confirmed write to the sheet, so a
        // failed submit or tripped honeypot never counts. No name, phone or
        // email is passed: analytics learn that a lead happened, never who.
        try {
          if (window.MTrack) window.MTrack.lead({ source: 'site_form', page: location.pathname, start: start || 'unset', has_message: message ? 1 : 0 });
        } catch (err) {}
        form.reset();
        btn.disabled=false; btn.textContent=btnLabel;
      })
      .catch(function(){
        bad.style.display='block'; ok.style.display='none';
        btn.disabled=false; btn.textContent=btnLabel;
      });
  });
});
})();
