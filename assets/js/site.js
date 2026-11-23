(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;

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
  var hasIO = 'IntersectionObserver' in window;
  if (!hasIO) doc.classList.add('no-io');

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

    /* hero: words rise in, one by one (text itself is untouched, only wrapped) */
    var hero = document.querySelector('.hero');
    var h1 = hero && hero.querySelector('h1');
    if (h1 && !reduce) {
      var i = 0;
      (function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.nodeValue.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part; frag.appendChild(s);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) { wrap(n); }
        });
      })(h1);
    }
    if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('ready'); }); });

    /* hero media: gentle depth on pointer move */
    var hm = document.querySelector('.hero-media');
    if (hm && fine && !reduce) {
      var layers = [[hm.querySelector('.a .ph'), 1], [hm.querySelector('.b .ph'), 1.6], [hm.querySelector('.f1'), -1.2], [hm.querySelector('.f2'), -.8]];
      hero.addEventListener('pointermove', function (e) {
        var r = hm.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
        layers.forEach(function (l) {
          if (!l[0]) return;
          l[0].style.setProperty('--tx', (x * 14 * l[1]).toFixed(1) + 'px');
          l[0].style.setProperty('--ty', (y * 10 * l[1]).toFixed(1) + 'px');
          l[0].style.setProperty('--rx', (-y * 4).toFixed(2) + 'deg');
          l[0].style.setProperty('--ry', (x * 5).toFixed(2) + 'deg');
          if (l[0].classList.contains('float')) l[0].style.translate = (x * 18 * l[1]).toFixed(1) + 'px ' + (y * 12 * l[1]).toFixed(1) + 'px';
        });
      });
      hero.addEventListener('pointerleave', function () {
        layers.forEach(function (l) { if (!l[0]) return; ['--tx', '--ty', '--rx', '--ry'].forEach(function (k) { l[0].style.removeProperty(k); }); l[0].style.translate = ''; });
      });
    }

    /* section numbers as large outlined figures */
    document.querySelectorAll('.sec-head').forEach(function (h) {
      var b = h.querySelector('.num b'); if (b) h.setAttribute('data-n', b.textContent.trim());
    });

    /* stagger siblings that reveal together */
    document.querySelectorAll('.reveal').forEach(function (el) {
      var p = el.parentElement, k = 0, sib = p ? p.children : [];
      for (var j = 0; j < sib.length && sib[j] !== el; j++) if (sib[j].classList.contains('reveal')) k++;
      if (k) el.style.setProperty('--d', Math.min(k, 5) * 0.07 + 's');
    });

    /* pointer spotlight on cards, and tilt on project cards */
    var spots = document.querySelectorAll('.out, .q, .way, .collab .c, .else a, .notes a.n, .vt, .li, .proj');
    spots.forEach(function (c) { c.classList.add('spot'); });
    if (fine && !reduce) {
      spots.forEach(function (c) {
        c.addEventListener('pointermove', function (e) {
          var r = c.getBoundingClientRect();
          c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          c.style.setProperty('--my', (e.clientY - r.top) + 'px');
          if (c.classList.contains('proj')) {
            c.classList.add('tilt');
            c.style.setProperty('--rx', (((e.clientY - r.top) / r.height - .5) * -4).toFixed(2) + 'deg');
            c.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 5).toFixed(2) + 'deg');
          }
        });
        if (c.classList.contains('proj')) c.addEventListener('pointerleave', function () { c.classList.remove('tilt'); });
      });
    }

    /* scroll-linked: progress bar, nav state, story line, parallax numbers */
    var bar = document.querySelector('.nav .progress i');
    var story = document.querySelector('.story');
    var heads = document.querySelectorAll('.sec-head');
    var ticking = false;
    function onScroll() {
      ticking = false;
      var y = window.scrollY, vh = window.innerHeight, max = doc.scrollHeight - vh;
      if (nav) nav.classList.toggle('scrolled', y > 8);
      if (bar) bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      if (story && !reduce) {
        var r = story.getBoundingClientRect();
        var p = (vh * 0.6 - r.top) / r.height;
        story.style.setProperty('--sp', Math.max(0, Math.min(1, p)).toFixed(4));
      }
      if (!reduce) heads.forEach(function (h) {
        var r = h.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        h.style.setProperty('--py', ((r.top - vh / 2) * -0.12).toFixed(1) + 'px');
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    var links = {};
    document.querySelectorAll('.nav ul a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    if (hasIO) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && links[e.target.id]) {
            Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); links[k].removeAttribute('aria-current'); });
            links[e.target.id].classList.add('active'); links[e.target.id].setAttribute('aria-current', 'true');
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });

      /* reveal */
      var rv = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('.reveal, .glance, .sec-head, .chapter, .showcase, .amr, .values').forEach(function (el) { rv.observe(el); });

      /* the closing paragraphs light up as they are read */
      var lit = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lit'); lit.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -30% 0px' });
      document.querySelectorAll('.next p').forEach(function (p) { lit.observe(p); });
    } else {
      document.querySelectorAll('.reveal, .glance, .sec-head, .chapter, .showcase, .amr, .values').forEach(function (el) { el.classList.add('in'); });
      document.querySelectorAll('.next p').forEach(function (p) { p.classList.add('lit'); });
    }

    /* Builder Showcase: muted previews loop while a card is on screen */
    var cards = document.querySelectorAll('.sc-media');
    var dlg = document.getElementById('player');
    function setPlay(card, on) {
      var v = card.querySelector('.sc-prev'); if (!v) return;
      if (on && !(dlg && dlg.open)) {
        if (!v.src) { v.src = v.getAttribute('data-src'); }
        var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
      } else { v.pause(); }
    }
    cards.forEach(function (card) {
      var v = card.querySelector('.sc-prev'); if (!v) return;
      v.addEventListener('playing', function () { card.classList.add('playing'); });
      v.addEventListener('timeupdate', function () { if (v.duration) card.style.setProperty('--vp', (v.currentTime / v.duration).toFixed(3)); });
      if (fine) {
        card.addEventListener('pointerenter', function () { if (!saveData) setPlay(card, true); });
      }
    });
    if (hasIO && !reduce && !saveData && cards.length) {
      var vio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { setPlay(e.target, e.isIntersecting); });
      }, { threshold: 0.45 });
      cards.forEach(function (c) { vio.observe(c); });
    }

    /* player dialog for website videos and YouTube */
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
        document.querySelectorAll('.sc-prev').forEach(function (v) { v.pause(); });
        var st = dlg.querySelector('.stage');
        st.className = 'stage';
        st.innerHTML = '';
        if (b.hasAttribute('data-video')) {
          var v = document.createElement('video');
          v.src = b.getAttribute('data-video'); v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
          var poster = b.querySelector('.sc-poster'); if (poster) v.poster = poster.getAttribute('src');
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
        if (link) {
          var href = b.getAttribute('data-href') || (b.hasAttribute('data-yt') ? 'https://www.youtube.com/watch?v=' + b.getAttribute('data-yt') : '');
          if (href) { link.href = href; link.hidden = false; } else { link.removeAttribute('href'); link.hidden = true; }
        }
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
