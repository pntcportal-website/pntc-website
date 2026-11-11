/* Access types in the admin console.
   Shows each login only the screens its access type allows (the server checks every request as well),
   adds the Users and History screens for Executive (Admin) logins, and shows who is logged in at the bottom of the menu. */
(function () {
  // which access areas open each screen (any one of them is enough)
  var PAGES = {
    'index.html': ['posts'], 'posts.html': ['posts'], 'editor.html': ['posts'], 'images.html': ['images'],
    'landing.html': ['careers', 'research', 'directory', 'merchandise'], 'content.html': ['content', 'calendar', 'courses'],
    'chat.html': ['chat'], 'users.html': ['users'], 'history.html': ['history'], 'applications.html': ['careers'],
  };
  var ORDER = ['index.html', 'posts.html', 'content.html', 'landing.html', 'images.html', 'chat.html', 'applications.html', 'users.html', 'history.html'];
  var page = (location.pathname.split('/').pop() || 'index.html').replace(/^$/, 'index.html');
  if (page === 'admin' || page === '') page = 'index.html';

  // hide everything until the access type is known, so no one sees screens they cannot use
  var hold = document.createElement('style');
  hold.textContent = '.sidebar-nav .nav-item{visibility:hidden}';
  document.head.appendChild(hold);

  fetch('/api/auth/me').then(function (r) { return r.json(); }).then(function (me) {
    if (!me || !me.ok) { location.href = '/admin/login.html'; return; }
    window.PNTC_ME = me;
    var has = function (a) { return me.areas.indexOf(a) > -1; };
    var allowed = function (p) { var need = PAGES[p]; return !need || need.some(has); };

    // this screen is not part of the access type: go to the first one that is
    if (!allowed(page)) {
      var first = ORDER.filter(allowed)[0];
      if (first && first !== page) { location.replace(first); return; }
    }

    var css = [];
    // menu links
    document.querySelectorAll('.sidebar-nav a.nav-item').forEach(function (a) {
      var p = (a.getAttribute('href') || '').split('?')[0];
      if (PAGES[p] && !allowed(p)) a.style.display = 'none';
    });
    // posts by site (the "Sites" menu) only for those who work on posts
    if (!has('posts')) {
      css.push('#site-nav{display:none!important}');
      document.querySelectorAll('.sidebar-section-label').forEach(function (l) { if (/sites/i.test(l.textContent)) l.style.display = 'none'; });
    }
    // Landing Page tabs
    ['careers', 'research', 'directory', 'merchandise'].forEach(function (t) {
      if (!has(t)) css.push('.lp-tab[data-tab="' + t + '"],#panel-' + t + ',[data-area="' + t + '"]{display:none!important}');
    });
    if (page === 'landing.html') {
      var active = document.querySelector('.lp-tab.active');
      if (active && !has(active.dataset.tab)) {
        var firstTab = Array.prototype.filter.call(document.querySelectorAll('.lp-tab'), function (b) { return has(b.dataset.tab); })[0];
        if (firstTab) firstTab.click();
      }
    }
    // Site Content: the calendars need "calendar", the course list needs "courses", page texts need "content"
    if (!has('calendar')) css.push('.sc-item[data-id="@calendar"],.sc-item[data-id="@shs-calendar"]{display:none!important}');
    if (!has('courses')) css.push('.sc-item[data-id="@courses"]{display:none!important}');

    // Applications, Users and History screens in the menu
    var nav = document.querySelector('.sidebar-nav');
    [['careers', 'applications.html', '📨', 'Applications'], ['users', 'users.html', '👥', 'Users'], ['history', 'history.html', '🕘', 'History']].forEach(function (s) {
      if (!has(s[0]) || !nav || nav.querySelector('a[href="' + s[1] + '"]')) return;
      var link = document.createElement('a');
      link.className = 'nav-item' + (page === s[1] ? ' active' : '');
      link.href = s[1];
      link.innerHTML = '<span class="nav-icon">' + s[2] + '</span> ' + s[3];
      nav.appendChild(link);
    });

    // who is logged in
    var box = document.querySelector('.sidebar-bottom');
    if (box) {
      var strong = box.querySelector('strong');
      var info = document.createElement('div');
      info.className = 'acc-who';
      var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
      info.innerHTML = '<strong>' + esc(me.name || me.email) + '</strong><span>' + esc(me.email) + '</span><em>' + esc(me.label) + '</em>';
      // replace the old fixed name and email text
      var n = box.firstChild;
      while (n && n.nodeName !== 'BUTTON') { var next = n.nextSibling; if (n === strong || n.nodeType === 3) box.removeChild(n); n = next; }
      box.insertBefore(info, box.firstChild);
      css.push('.acc-who{display:flex;flex-direction:column;gap:.15rem;line-height:1.35}.acc-who span{font-size:.72rem;opacity:.8;word-break:break-all}.acc-who em{font-style:normal;align-self:flex-start;margin-top:.3rem;padding:.12rem .5rem;border-radius:99px;background:rgba(243,207,51,.15);color:#F3CF33;font-size:.66rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}');
    }

    var st = document.createElement('style');
    st.textContent = css.join('\n');
    document.head.appendChild(st);
    hold.remove();
    document.dispatchEvent(new CustomEvent('pntc-access', { detail: me }));
  }).catch(function () { hold.remove(); });
})();
