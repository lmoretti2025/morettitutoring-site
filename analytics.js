/* ────────────────────────────────────────────────────────────────────────────
   Moretti Test Prep & Tutoring — site analytics

   One file, loaded on the public marketing pages only. The portal is
   deliberately excluded (see PORTAL PATHS below) so the privacy policy's
   promise that the portal carries no trackers stays literally true.

   ── TO TURN THIS ON ────────────────────────────────────────────────────────
   Fill in the two IDs in CONFIG. Until an ID is filled in, that vendor is
   never loaded and no request is made — so this file is safe to ship as-is.

     ga4        Google Analytics 4 measurement ID, looks like  G-ABC1234XYZ
                analytics.google.com → Admin → Data streams → your web stream
     metaPixel  Meta pixel ID, a 15-16 digit number
                business.facebook.com → Events Manager → Data sources
     googleAds  only when Search ads start, looks like  AW-1234567890
     adsLeadLabel  the conversion label from that Google Ads conversion action

   ── WHAT IT SENDS ──────────────────────────────────────────────────────────
     page_view       automatic, every page
     generate_lead   the enquiry form submitted successfully   (Meta: Lead)
     contact_phone   a click on the phone number               (Meta: Contact)
     view_diagnostic scrolled to the diagnostic section on the homepage

   ── TO CHECK IT IS WORKING ─────────────────────────────────────────────────
   Add ?mtdebug=1 to any URL. Every event is then logged to the browser
   console and kept in window.MTrack.log for inspection. Debug is automatic
   on localhost.
   ──────────────────────────────────────────────────────────────────────── */
(function (w, d) {
  'use strict';

  var CONFIG = {
    ga4:          'G-XXXXXXXXXX',
    metaPixel:    'XXXXXXXXXXXXXXX',
    googleAds:    '',
    adsLeadLabel: ''
  };

  /* Pages that must never load a tracker. */
  var PORTAL_PATHS = ['/portal', '/portal.html', '/portal-login'];

  /* An ID still containing an X is a placeholder, not a setting. */
  function configured(v) {
    return typeof v === 'string' && v.length > 0 && v.indexOf('X') === -1;
  }

  var path    = (w.location.pathname || '').toLowerCase();
  var onPortal = PORTAL_PATHS.some(function (p) { return path.indexOf(p) === 0; });

  var debug = false;
  try {
    debug = /[?&]mtdebug=1/.test(w.location.search) ||
            /^(localhost|127\.0\.0\.1|\[::1\])$/.test(w.location.hostname) ||
            w.localStorage.getItem('mtDebug') === '1';
  } catch (e) { /* storage can throw in private mode; debug stays off */ }

  var log = [];

  function note(name, params, sent) {
    var row = { at: new Date().toISOString(), event: name, params: params, sent: sent };
    log.push(row);
    if (debug) {
      /* eslint-disable no-console */
      console.log('%c[MTrack]%c ' + name,
        'background:#B0271C;color:#fff;padding:1px 5px;border-radius:2px',
        'color:inherit', { params: params, sentTo: sent.length ? sent : ['(no vendor configured)'] });
    }
  }

  var useGa4   = configured(CONFIG.ga4)       && !onPortal;
  var useMeta  = configured(CONFIG.metaPixel) && !onPortal;
  var useAds   = configured(CONFIG.googleAds) && !onPortal;

  /* ── Google (GA4, and Google Ads through the same tag) ─────────────────── */
  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }
  /* Google's own snippet exposes this globally, and Tag Assistant and the
     Google Ads tag checker both look for it by name. */
  if (!w.gtag) w.gtag = gtag;

  if (useGa4 || useAds) {
    var g = d.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' +
            encodeURIComponent(useGa4 ? CONFIG.ga4 : CONFIG.googleAds);
    d.head.appendChild(g);

    gtag('js', new Date());
    if (useGa4) gtag('config', CONFIG.ga4);
    if (useAds) gtag('config', CONFIG.googleAds);
  }

  /* ── Meta pixel ───────────────────────────────────────────────────────── */
  if (useMeta) {
    /* Meta's own loader, kept intact so their queue semantics are preserved. */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(w, d, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    w.fbq('init', CONFIG.metaPixel);
    w.fbq('track', 'PageView');
  }

  /* GA4 sends its own page_view on config; this is only for the debug log. */
  note('page_view', { page_path: w.location.pathname }, vendors());

  function vendors() {
    var v = [];
    if (useGa4)  v.push('ga4');
    if (useMeta) v.push('meta');
    return v;
  }

  /* Meta recognises a fixed set of standard event names; anything else has to
     go through trackCustom or it is silently discarded. */
  var META_STANDARD = {
    generate_lead:   'Lead',
    contact_phone:   'Contact',
    view_diagnostic: 'ViewContent'
  };

  function event(name, params) {
    params = params || {};
    var sent = [];

    if (useGa4) { gtag('event', name, params); sent.push('ga4'); }

    if (useMeta) {
      var std = META_STANDARD[name];
      if (std) w.fbq('track', std, params);
      else     w.fbq('trackCustom', name, params);
      sent.push('meta');
    }

    note(name, params, sent);
    return sent;
  }

  /* The enquiry form succeeded. This is the conversion everything optimises
     toward, so it also fires the Google Ads conversion when one is set up. */
  function lead(detail) {
    detail = detail || {};
    var params = {
      currency:    'USD',
      value:       detail.value || 0,
      source:      detail.source || 'site_form',
      has_message: detail.has_message || 0
    };

    var sent = event('generate_lead', params);

    if (useAds && CONFIG.adsLeadLabel) {
      gtag('event', 'conversion', {
        send_to: CONFIG.googleAds + '/' + CONFIG.adsLeadLabel,
        value: params.value,
        currency: 'USD'
      });
      sent.push('google_ads');
      note('conversion(google_ads)', { send_to: CONFIG.googleAds + '/' + CONFIG.adsLeadLabel }, ['google_ads']);
    }
    return sent;
  }

  /* ── Automatic bindings ───────────────────────────────────────────────── */
  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
    if (a) event('contact_phone', { method: 'phone_link' });
  }, true);

  /* The diagnostic section is the page's real pitch. Knowing how many readers
     reach it is what tells you whether the homepage or the ad is at fault. */
  function watchDiagnostic() {
    watchDiagnostic.ran = true;
    var target = d.getElementById('diagnostic');
    if (!target || !('IntersectionObserver' in w)) return;
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      if (seen) return;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          seen = true;
          event('view_diagnostic', { section: 'diagnostic' });
          io.disconnect();
          return;
        }
      }
      /* Measured against a band across the middle of the screen rather than a
         fraction of the section. The diagnostic section is taller than a phone
         viewport, so a percentage-of-element threshold can never be reached on
         a small screen and the event would silently never fire. */
    }, { threshold: 0, rootMargin: '-35% 0px -35% 0px' });
    io.observe(target);
  }

  /* A deferred script normally runs before DOMContentLoaded, but not if the
     browser has already finished parsing — in which case that event has been
     and gone and a listener for it would never fire. Check the state instead
     of assuming it. */
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', watchDiagnostic);
  else watchDiagnostic();

  w.MTrack = {
    event: event,
    lead:  lead,
    log:   log,
    debug: debug,
    active: vendors(),
    /* true once the diagnostic-section observer has been attached */
    watching: function () { return watchDiagnostic.ran === true; },
    /* exposed so a page can tell whether anything is actually switched on */
    isLive: function () { return vendors().length > 0; }
  };

  if (debug && !vendors().length) {
    console.warn('[MTrack] No vendor IDs configured — events are logged only. ' +
                 'Fill in CONFIG at the top of analytics.js to go live.');
  }
})(window, document);
