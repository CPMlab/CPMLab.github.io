/**
 * Renders GALLERIES_DATA (js/galleries-data.js).
 *  - #eventsGrid  (galleries.html): every event, opens a lightbox
 *  - #cgiLifeGrid (index.html): the newest three events, links to galleries.html
 * Image paths ending in .mp4 / .webm are shown as muted looping video.
 */
(function () {
  var DATA = window.GALLERIES_DATA || [];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function isVideo(src) { return /\.(mp4|webm)$/i.test(src); }
  function poster(src) { return src.replace(/\.(mp4|webm)$/i, '-poster.jpg'); }
  function oneLine(t) { return String(t || '').replace(/\n/g, ' '); }

  // Covers use images/events/thumbs/<file> when it exists, else the full photo
  function thumb(src) { return src.replace(/^(images\/events\/)/, '$1thumbs/'); }
  function mediaHtml(src, alt, eager) {
    var full = isVideo(src) ? poster(src) : src;
    return '<img src="' + esc(thumb(full)) + '" data-full="' + esc(full) + '" alt="' + esc(alt) + '" width="800" height="600"' +
      (eager ? '' : ' loading="lazy"') + ' decoding="async">';
  }
  // No thumbnail yet (e.g. a newly added photo)? Fall back to the full image.
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.dataset.full && (t.currentSrc || t.src).indexOf('/thumbs/') > -1) {
      t.removeAttribute('srcset');
      t.src = t.dataset.full;
    }
  }, true);

  function titleHtml(t) { return esc(t).replace(/\n/g, '<br>'); }

  /* ---------- Home: lab life ---------- */
  var home = document.getElementById('cgiLifeGrid');
  if (home) {
    DATA.slice(0, 3).forEach(function (ev) {
      var a = document.createElement('a');
      a.className = 'photo-card';
      a.href = 'galleries.html';
      a.innerHTML =
        '<div class="photo-frame">' + mediaHtml((ev.images || [])[0] || '', oneLine(ev.title)) + '</div>' +
        '<p class="photo-title">' + titleHtml(ev.title) + '</p>' +
        '<p class="photo-meta">' + esc(ev.date) + '</p>';
      home.appendChild(a);
    });
  }

  /* ---------- Galleries page ---------- */
  var grid = document.getElementById('eventsGrid');
  var box = document.getElementById('lightbox');
  if (!grid || !box) return;

  /* Each event card is a small slideshow that advances on its own. */
  var INTERVAL = 3500;
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  var paused = false;
  var cards = [];

  function slideImg(src, alt, i, featured, eager) {
    var full = isVideo(src) ? poster(src) : src;
    var sizes = featured ? '(min-width: 1200px) 1152px, 100vw' : '(min-width: 760px) 50vw, 100vw';
    return '<img class="slide' + (i === 0 ? ' is-active' : '') + '" src="' + esc(thumb(full)) + '" data-full="' + esc(full) + '"' +
      ' srcset="' + esc(thumb(full)) + ' 800w, ' + esc(full) + ' 1600w" sizes="' + sizes + '"' +
      ' alt="' + (i === 0 ? esc(alt) : '') + '" width="800" height="600"' +
      (eager && i === 0 ? '' : ' loading="lazy"') + ' decoding="async">';
  }

  DATA.forEach(function (ev, i) {
    var imgs = ev.images || [];
    var featured = i === 0;
    var li = document.createElement('li');
    if (featured) li.className = 'is-featured';
    var slides = imgs.map(function (src, k) { return slideImg(src, oneLine(ev.title), k, featured, i < 3); }).join('');
    var dots = imgs.length > 1
      ? '<span class="dots" aria-hidden="true">' + imgs.map(function (_, k) { return '<i' + (k === 0 ? ' class="is-active"' : '') + '></i>'; }).join('') + '</span>'
      : '';
    var count = imgs.length > 1 ? '<span class="photo-count">' + imgs.length + (imgs.some(isVideo) ? ' items' : ' photos') + '</span>' : '';
    li.innerHTML =
      '<button type="button" class="event-open" data-index="' + i + '" aria-haspopup="dialog">' +
        '<div class="photo-frame slideshow">' + slides + dots + count + '</div>' +
        '<p class="photo-title">' + titleHtml(ev.title) + '</p>' +
        '<p class="photo-meta">' + esc(ev.date) + '</p>' +
      '</button>';
    grid.appendChild(li);
    if (imgs.length > 1) {
      cards.push({ el: li, frame: li.querySelector('.slideshow'), n: imgs.length, i: 0, visible: false, hold: false, due: 0, offset: (cards.length % 4) * 700 });
    }
  });

  function show(card, n) {
    var slides = card.frame.querySelectorAll('.slide');
    var dots = card.frame.querySelectorAll('.dots i');
    slides[card.i].classList.remove('is-active');
    if (dots[card.i]) dots[card.i].classList.remove('is-active');
    card.i = (n + card.n) % card.n;
    var next = slides[card.i];
    if (next.loading === 'lazy') next.loading = 'eager';
    next.classList.add('is-active');
    if (dots[card.i]) dots[card.i].classList.add('is-active');
    // preload the one after
    var after = slides[(card.i + 1) % card.n];
    if (after.loading === 'lazy') after.loading = 'eager';
  }

  // Only cards on screen advance; hovering or focusing a card holds it
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var c = cards.find(function (x) { return x.el === en.target; });
        if (c) c.visible = en.isIntersecting;
      });
    }, { threshold: 0.4 });
    cards.forEach(function (c) { io.observe(c.el); });
  } else {
    cards.forEach(function (c) { c.visible = true; });
  }
  cards.forEach(function (c) {
    c.el.addEventListener('pointerenter', function () { c.hold = true; });
    c.el.addEventListener('pointerleave', function () { c.hold = false; });
    c.el.addEventListener('focusin', function () { c.hold = true; });
    c.el.addEventListener('focusout', function () { c.hold = false; });
  });

  var start = performance.now();
  cards.forEach(function (c) { c.due = start + INTERVAL + c.offset; });
  setInterval(function () {
    if (paused || reduceMotion.matches || document.hidden || box.open) return;
    var now = performance.now();
    cards.forEach(function (c) {
      if (!c.visible || c.hold) { c.due = Math.max(c.due, now + 1200); return; }
      if (now >= c.due) { show(c, c.i + 1); c.due = now + INTERVAL; }
    });
  }, 250);

  // Pause control (WCAG 2.2.2: moving content needs a way to stop it)
  if (cards.length) {
    var tools = document.createElement('div');
    tools.className = 'gallery-tools';
    tools.innerHTML = '<button type="button" class="text-btn" aria-pressed="false"><span>Pause slideshows</span></button>';
    grid.parentNode.insertBefore(tools, grid);
    var toggle = tools.querySelector('button');
    function syncToggle() {
      toggle.hidden = reduceMotion.matches;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.firstChild.textContent = paused ? 'Play slideshows' : 'Pause slideshows';
    }
    toggle.addEventListener('click', function () { paused = !paused; syncToggle(); });
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', syncToggle);
    syncToggle();
  }

  var stage = box.querySelector('.lightbox-stage');
  var titleEl = box.querySelector('#lightboxTitle');
  var metaEl = box.querySelector('.lightbox-meta');
  var prev = box.querySelector('[data-step="-1"]');
  var next = box.querySelector('[data-step="1"]');
  var current = { ev: null, i: 0 };

  function render() {
    var ev = current.ev;
    var imgs = ev.images || [];
    var src = imgs[current.i];
    var alt = oneLine(ev.title) + ' (' + (current.i + 1) + '/' + imgs.length + ')';
    stage.innerHTML = isVideo(src)
      ? '<video src="' + esc(src) + '" poster="' + esc(poster(src)) + '"' + (matchMedia('(prefers-reduced-motion: reduce)').matches ? '' : ' autoplay') + ' muted loop playsinline controls aria-label="' + esc(alt) + '"></video>'
      : '<img src="' + esc(src) + '" alt="' + esc(alt) + '">';
    titleEl.innerHTML = titleHtml(ev.title);
    metaEl.textContent = (imgs.length > 1 ? (current.i + 1) + ' of ' + imgs.length + ', ' : '') + ev.date;
    prev.disabled = current.i === 0;
    next.disabled = current.i >= imgs.length - 1;
    prev.hidden = next.hidden = imgs.length < 2;
  }

  function step(d) {
    var n = current.i + d;
    if (!current.ev || n < 0 || n >= current.ev.images.length) return;
    current.i = n;
    render();
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.event-open');
    if (!btn) return;
    var idx = +btn.dataset.index;
    var card = cards.find(function (c) { return c.el.contains(btn); });
    current = { ev: DATA[idx], i: card ? card.i : 0 };
    render();
    box.showModal();
  });

  prev.addEventListener('click', function () { step(-1); });
  next.addEventListener('click', function () { step(1); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  box.addEventListener('close', function () { stage.innerHTML = ''; });

  // Light dismiss where closedby="any" is unsupported
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    box.addEventListener('click', function (e) {
      if (e.target !== box) return;
      var r = box.getBoundingClientRect();
      var inside = r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
      if (!inside) box.close();
    });
  }
})();
