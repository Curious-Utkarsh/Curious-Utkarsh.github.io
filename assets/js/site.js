(function () {
  var doc = document.documentElement;

  /* theme: system by default, manual override remembered per browser */
  function stored() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem('theme', v); } catch (e) {} }
  var t = stored();
  if (t === 'light' || t === 'dark') doc.setAttribute('data-theme', t);
  function isDark() {
    var a = doc.getAttribute('data-theme');
    if (a) return a === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  document.addEventListener('DOMContentLoaded', function () {
    var tb = document.querySelector('[data-theme-toggle]');
    function label() { if (tb) tb.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme'); }
    label();
    if (tb) tb.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      doc.setAttribute('data-theme', next); store(next); label();
    });

    /* nav: shadow on scroll, mobile menu, active section */
    var nav = document.querySelector('.nav');
    var onScroll = function () { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    var mb = document.querySelector('[data-menu]');
    if (mb && nav) {
      mb.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.querySelectorAll('ul a').forEach(function (a) {
        a.addEventListener('click', function () { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); });
      });
    }
    var links = {};
    document.querySelectorAll('.nav ul a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && links[e.target.id]) {
            Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); links[k].removeAttribute('aria-current'); });
            links[e.target.id].classList.add('active'); links[e.target.id].setAttribute('aria-current', 'true');
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });

      /* gentle reveal */
      var rv = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { rv.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    }

    /* player dialog for website videos and YouTube */
    var dlg = document.getElementById('player');
    function closePlayer() {
      if (!dlg) return;
      var st = dlg.querySelector('.stage'); st.innerHTML = '';
      dlg.querySelector('.tx').innerHTML = '';
      if (dlg.open) dlg.close();
    }
    if (dlg) {
      dlg.addEventListener('close', function () { dlg.querySelector('.stage').innerHTML = ''; });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) closePlayer(); });
      dlg.querySelector('[data-close]').addEventListener('click', closePlayer);
    }
    document.querySelectorAll('[data-video],[data-yt]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!dlg || typeof dlg.showModal !== 'function') {
          var u = b.getAttribute('data-video') || ('https://www.youtube.com/watch?v=' + b.getAttribute('data-yt'));
          window.open(u, '_blank', 'noopener'); return;
        }
        var st = dlg.querySelector('.stage');
        st.className = 'stage';
        st.innerHTML = '';
        if (b.hasAttribute('data-video')) {
          var v = document.createElement('video');
          v.src = b.getAttribute('data-video'); v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
          v.setAttribute('aria-label', b.getAttribute('data-title') || 'Video');
          st.appendChild(v);
        } else {
          if (b.hasAttribute('data-vertical')) st.classList.add('vertical');
          var f = document.createElement('iframe');
          f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-yt') + '?autoplay=1&rel=0';
          f.title = b.getAttribute('data-title') || 'YouTube video';
          f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
          f.setAttribute('allowfullscreen', '');
          f.referrerPolicy = 'strict-origin-when-cross-origin';
          st.appendChild(f);
        }
        dlg.querySelector('.t').innerHTML = '';
        var tt = document.createElement('span'); tt.textContent = b.getAttribute('data-title') || '';
        var sm = document.createElement('small'); sm.textContent = b.getAttribute('data-sub') || '';
        dlg.querySelector('.t').appendChild(tt); dlg.querySelector('.t').appendChild(sm);
        var txId = b.getAttribute('data-tx');
        var tx = dlg.querySelector('.tx'); tx.innerHTML = '';
        if (txId) { var src = document.getElementById(txId); if (src) tx.innerHTML = src.innerHTML; }
        var link = dlg.querySelector('[data-open]');
        if (link) { link.href = b.getAttribute('data-href') || b.getAttribute('data-video') || ('https://www.youtube.com/watch?v=' + b.getAttribute('data-yt')); }
        dlg.showModal();
      });
    });

    /* inline YouTube facades on project pages */
    document.querySelectorAll('[data-facade]').forEach(function (b) {
      b.addEventListener('click', function () {
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-facade') + '?autoplay=1&rel=0';
        f.title = b.getAttribute('aria-label') || 'YouTube video';
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.setAttribute('allowfullscreen', '');
        f.referrerPolicy = 'strict-origin-when-cross-origin';
        b.innerHTML = ''; b.appendChild(f); b.style.cursor = 'default';
      }, { once: true });
    });
  });
  doc.classList.add('js');
})();
