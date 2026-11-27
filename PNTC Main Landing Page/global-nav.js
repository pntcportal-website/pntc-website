/* Google Analytics 4 (property PNTC Colleges, G-M9K7LJ9YMT) on every public page. The admin console does not load
   this file, so staff work is not counted. Previews from the admin and local copies are left out too.
   Sessions, page views, engagement time, outbound clicks and downloads come from Google (Enhanced measurement).
   Added here, on every page:
     cta_click     every call to action button (Apply, Enroll, Inquire, Order, View ...)
     nav_click     menu and footer links          card_click   news, program and network cards
     scroll_depth  25, 50, 75 and 100 percent of the page
     apply_click, enroll_open, call_click, email_click, chat_open   the actions that matter most
   Each click event carries cta_text, cta_section, link_url and page_path. Forms send their own events
   (chat_start, job_application, merch_order) through window.pntcTrack(name, details). */
(function () {
  var ID = 'G-M9K7LJ9YMT';
  var host = location.hostname;
  window.pntcTrack = function () {};
  if (!/(^|\.)pntc\.edu\.ph$/.test(host) || /[?&]preview=1/.test(location.search) || window.__pntcGA) return;
  window.__pntcGA = true;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ID);
  var page = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
  window.pntcTrack = function (name, details) {
    try { var d = details || {}; if (!d.page_path) d.page_path = page; window.gtag('event', name, d); } catch (e) {}
  };

  // what kind of element was clicked
  var CTA = /(^|[-_])(btn|cta|apply|enroll|order|inquire|send|join|ask|choice|more|allbtn|view-all|track-link|link-gold|play)([-_]|$)|^(btn|cta)/i;
  var CARD = /(^|[-_])card([-_]|$)|^(nc|net)-/i;
  var UI = /(^|[-_])(day|chip|tab|arrow|close|x|thumb|view|nav-btn|back|hamburger|dd-btn|on|active|is-current|media)$/i;
  // slider, menu and window controls are not calls to action even when they are styled as buttons
  var CONTROL = /(nav-btn|arrow|close|(^|[-_])x$|max|min|prev|next|toggle|hamburger|dd-btn|play$|thumb|dot)/i;
  function classes(el) { return (el.getAttribute('class') || '').split(/\s+/).filter(Boolean); }
  function inNav(el) { return !!el.closest('#pntc-gnav, nav, header, #mob-menu, .mob-menu, .pf-col, .pf-socials, [role="navigation"]'); }
  function section(el) {
    var box = el.closest('section[id], section[class], footer, header, nav, [role="dialog"], div[id]');
    if (!box) return 'page';
    if (box.id) return box.id;
    var tag = box.tagName.toLowerCase(), c = classes(box)[0];
    return c ? tag + '.' + c : tag;
  }
  function text(el) {
    var t = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!t) { var img = el.querySelector('img[alt]'); if (img) t = img.getAttribute('alt'); }
    return t.slice(0, 100);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a, button, [role="button"]');
    if (!el) return;
    var href = el.getAttribute('href') || '', cls = classes(el), label = text(el);
    // the live chat box: opening it is counted, its inner controls are not (starting a chat sends chat_start)
    if (el.closest('#pw')) { if (el.id === 'pw-bubble') window.pntcTrack('chat_open', { page_path: page }); return; }
    var url = href && !/^(#|javascript:)/i.test(href) ? el.href || href : href;
    var base = { cta_text: label, cta_section: section(el), link_url: url, page_path: page };
    // the most important actions get their own names (and are also counted as calls to action below)
    if (el.classList.contains('ep-choice')) window.pntcTrack('apply_click', { choice: label, link_url: url, page_path: page });
    if (el.hasAttribute('data-enroll')) window.pntcTrack('enroll_open', { button: label, cta_section: base.cta_section, page_path: page });
    if (/^tel:/i.test(href)) return window.pntcTrack('call_click', { number: href.slice(4), cta_section: base.cta_section, page_path: page });
    if (/^mailto:/i.test(href)) return window.pntcTrack('email_click', { email: href.slice(7).split('?')[0], cta_section: base.cta_section, page_path: page });
    var control = cls.some(function (c) { return CONTROL.test(c); });
    var isCta = el.hasAttribute('data-enroll') || el.hasAttribute('data-order') || el.hasAttribute('data-cta') || (!control && cls.some(function (c) { return CTA.test(c); }));
    var isCard = !isCta && cls.some(function (c) { return CARD.test(c); });
    // buttons count as calls to action wherever they are (the Enroll Now in the menu bar too); plain menu links are nav_click
    if (isCta) { base.cta_class = cls.join(' ').slice(0, 80); return window.pntcTrack('cta_click', base); }
    if (el.tagName === 'A' && href && inNav(el)) return window.pntcTrack('nav_click', base);
    if (isCard) return window.pntcTrack('card_click', base);
    // plain links in the page text (not menus, tabs, sliders or close buttons)
    if (el.tagName === 'A' && href && !/^#/.test(href) && !cls.some(function (c) { return UI.test(c); })) window.pntcTrack('link_click', base);
  }, true);

  // how far down each page people read
  var marks = [25, 50, 75, 100], sent = {};
  function depth() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? Math.round((h.scrollTop || document.body.scrollTop) / max * 100) : 100;
    marks.forEach(function (m) { if (pct >= m && !sent[m]) { sent[m] = 1; window.pntcTrack('scroll_depth', { percent: m, page_path: page }); } });
  }
  var t;
  window.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(depth, 250); }, { passive: true });
})();

(function () {
  'use strict';
  var script = document.currentScript;
  var AREA = (script && script.getAttribute('data-area')) || '';
  var ITEMS = [
    { id: 'training',    label: 'Training Center',       href: '/training/' },
    { id: 'college',     label: 'College',               href: '/college/' },
    { id: 'shs',         label: 'Senior High School',    href: '/shs/' },
    { id: 'philnautical',label: 'PNSC',                  href: '/philnautical' },
    { id: 'about',       label: 'About PNTC',            href: '/about' },
    { id: 'careers',     label: 'Careers',               href: '/careers' }
  ];
  var H = 46;

  var css = [
    ':root{--gnav-h:' + H + 'px}',
    'body{padding-top:var(--gnav-h)!important}',
    '#nav,#header{top:var(--gnav-h)!important}',
    'nav.nav{top:var(--gnav-h)!important}',
    '@media(max-width:768px){nav.nav .nav-links{top:calc(60px + var(--gnav-h))!important}}',
    '#pntc-gnav{position:fixed;top:0;left:0;right:0;height:var(--gnav-h);z-index:1000;background:#050a15;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;padding:0 clamp(1rem,4vw,3rem);font-family:Montserrat,system-ui,sans-serif}',
    '#pntc-gnav .gn-list{display:flex;align-items:center;gap:clamp(1rem,2.2vw,2rem);overflow-x:auto;scrollbar-width:none;white-space:nowrap;height:100%;margin:0 auto 0 0;padding:0;list-style:none}',
    '#pntc-gnav .gn-list::-webkit-scrollbar{display:none}',
    '#pntc-gnav a{position:relative;display:flex;align-items:center;height:100%;font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.55);text-decoration:none;transition:color .2s}',
    '#pntc-gnav a:hover{color:#fff}',
    '#pntc-gnav a.active{color:#E6AF1A}',
    '#pntc-gnav a.active::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:#C8960C}',
    '#pntc-gnav a.gn-brand{margin-right:clamp(1rem,2.5vw,2.5rem);flex-shrink:0;transition:transform .25s}',
    '#pntc-gnav a.gn-brand:hover{opacity:1}',
    '#pntc-gnav a.gn-brand::after{display:none}',
    '#pntc-gnav .gn-brand img{height:38px;width:auto;display:block;filter:drop-shadow(0 2px 6px rgba(0,0,0,.35))}','#pntc-gnav a.gn-brand:hover{transform:scale(1.06)}',
    '#mob-menu{z-index:1100!important}',
    /* Area navbar: one format everywhere (College style) */
    '.hdr-nav a,#nav .nav-links a,nav.nav .nav-links a{font-family:"Barlow Condensed",sans-serif!important;font-size:.85rem!important;font-weight:700!important;letter-spacing:.12em!important;text-transform:uppercase!important;color:rgba(255,255,255,.6)!important;transition:color .2s}',
    '.hdr-nav a:hover,#nav .nav-links a:hover,nav.nav .nav-links a:hover,.hdr-nav a.is-current,#nav .nav-links a.is-current,nav.nav .nav-links a.is-current{color:#C8960C!important}',
    '.hdr-nav a::after,#nav .nav-links a::after,nav.nav .nav-links a::after{display:none!important}',
    '.hdr-apply,.hdr-enroll,#nav .nav-cta,nav.nav .nav-enroll-btn{padding:.52rem 1.4rem!important;background:#C8960C!important;color:#060c19!important;font-family:"Barlow Condensed",sans-serif!important;font-weight:800!important;font-size:.85rem!important;letter-spacing:.1em!important;text-transform:uppercase!important;border:0!important;border-radius:0!important;box-shadow:none!important;transform:none!important;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%);transition:background .2s}',
    '.hdr-apply:hover,.hdr-enroll:hover,#nav .nav-cta:hover,nav.nav .nav-enroll-btn:hover{background:#E6AF1A!important}',
    '#nav .nav-login{padding:.5rem 1.2rem!important;border:1.5px solid rgba(255,255,255,.3)!important;border-radius:0!important;color:rgba(255,255,255,.75)!important;font-family:"Barlow Condensed",sans-serif!important;font-weight:700!important;font-size:.85rem!important;letter-spacing:.1em!important;text-transform:uppercase!important}',
    '#nav .nav-login:hover{border-color:#C8960C!important;color:#C8960C!important}',
    '.pntc-area{display:flex;flex-direction:column;justify-content:center;min-width:0;flex-shrink:1;margin-right:1.5rem;text-decoration:none}',
    '.pntc-area .pa-top{font:700 .58rem/1 Montserrat,system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--pa-accent,#C8960C);margin-bottom:.4rem}',
    '.pntc-area .pa-name{font:800 1rem/1.15 Montserrat,system-ui,sans-serif;letter-spacing:.03em;text-transform:uppercase;color:#fff}',
    '@media(min-width:721px){.pntc-area{flex-shrink:0}.pntc-area .pa-name{white-space:nowrap}}',
    '@media(max-width:720px){.pntc-area .pa-name{font-size:.8rem}.pntc-area .pa-top{font-size:.5rem;margin-bottom:.3rem}}',
    '@media(max-width:720px){#pntc-gnav .gn-brand img{height:34px}#pntc-gnav .gn-list{-webkit-mask-image:linear-gradient(90deg,#000 82%,transparent);mask-image:linear-gradient(90deg,#000 82%,transparent);padding-right:2rem}}'
  ].join('');

  // PNTC brand guide colors everywhere except Senior High School, which keeps its own palette
  var P = AREA === 'shs'
    ? { bg: '#050a15', gold: '#C8960C', goldLt: '#E6AF1A', ink: '#060c19' }
    : { bg: '#0D0930', gold: '#F3CF33', goldLt: '#FFF09B', ink: '#1C1650' };
  css = css.replace(/#050a15/g, P.bg).replace(/#C8960C/g, P.gold).replace(/#E6AF1A/g, P.goldLt).replace(/#060c19/g, P.ink);

  if (!document.querySelector('link[href*="Barlow+Condensed"]')) {
    var font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&display=swap';
    document.head.appendChild(font);
  }

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement('nav');
  bar.id = 'pntc-gnav';
  bar.setAttribute('aria-label', 'PNTC network');
  bar.innerHTML = '<a class="gn-brand' + (AREA === 'home' ? ' active' : '') + '" href="/" aria-label="PNTC home"><img src="/PNTC%20Crest.png" alt="PNTC Colleges crest"></a><ul class="gn-list">' + ITEMS.map(function (it) {
    return '<li><a href="' + it.href + '"' + (it.id === AREA ? ' class="active" aria-current="page"' : '') + '>' +
      it.label.replace('&', '&amp;') + '</a></li>';
  }).join('') + '</ul>';

  function mount() { document.body.insertBefore(bar, document.body.firstChild); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
