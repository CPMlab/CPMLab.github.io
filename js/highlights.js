/**
 * Home hero: rotating research highlights, synced with the genome ring.
 * Each .hl-item lists its genes in data-genes; the matching gene on the ring lights up.
 * Hovering, focusing, opening an abstract or the pause button freezes the timer;
 * when that ends it carries on from where it stopped (it does not start over).
 */
(function () {
  var root = document.querySelector('.hl');
  var svg = document.querySelector('.genome svg');
  if (!root) return;
  var items = Array.prototype.slice.call(root.querySelectorAll('.hl-item'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.hl-dot'));
  var pauseBtn = root.querySelector('.hl-pause');
  var INTERVAL = 6500; // keep in sync with the hl-progress animation in css/site.css
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var index = 0, held = false, expanded = false, paused = reduce.matches;
  var timer = null, remaining = INTERVAL, startedAt = 0;

  // fold an opened abstract back (used when the slide changes)
  function collapse() {
    expanded = false;
    root.querySelectorAll('.hl-more[aria-expanded="true"]').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
      b.firstChild.nodeValue = 'Read full abstract ';
      var p = document.getElementById(b.getAttribute('aria-controls'));
      if (p) p.classList.add('is-clamped');
    });
  }

  function ring(genes) {
    if (!svg) return;
    svg.classList.add('has-active');
    svg.querySelectorAll('.is-active').forEach(function (el) { el.classList.remove('is-active'); });
    genes.forEach(function (g) {
      svg.querySelectorAll('[data-gene="' + g + '"]').forEach(function (el) { el.classList.add('is-active'); });
      var label = svg.querySelector('.gene-label[data-gene="' + g + '"]');
      var chr = label && svg.querySelector('.chr-group[data-chr="' + label.dataset.chr + '"]');
      if (chr) chr.classList.add('is-active');
    });
  }

  // restart the progress fill on the active dot (a fresh 6.5 s)
  function restartFill() {
    dots.forEach(function (d) { d.classList.remove('is-running'); });
    var active = dots[index];
    if (!active) return;
    void active.offsetWidth;
    active.classList.add('is-running');
  }

  function show(n) {
    var target = (n + items.length) % items.length;
    if (target !== index) collapse();
    index = target;
    items.forEach(function (it, k) {
      var on = k === index;
      it.classList.toggle('is-active', on);
      if (on) it.removeAttribute('aria-hidden'); else it.setAttribute('aria-hidden', 'true');
      it.querySelectorAll('.hl-title a, .hl-more').forEach(function (a) {
        if (on) a.removeAttribute('tabindex'); else a.setAttribute('tabindex', '-1');
      });
      var img = it.querySelector('img');
      if (on && img && img.loading === 'lazy') img.loading = 'eager';
    });
    dots.forEach(function (d, k) {
      var on = k === index;
      d.classList.toggle('is-active', on);
      if (on) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
    remaining = INTERVAL; // a new slide gets the full time
    restartFill();
    // warm the next thumbnail
    var next = items[(index + 1) % items.length].querySelector('img');
    if (next && next.loading === 'lazy') next.loading = 'eager';
    ring(items[index].dataset.genes.split(/\s+/));
  }

  function stopped() { return paused || held || expanded || document.hidden; }

  // run the timer for whatever time is left on this slide
  function schedule() {
    clearTimeout(timer); timer = null;
    if (stopped()) return;
    startedAt = performance.now();
    timer = setTimeout(function () { timer = null; show(index + 1); schedule(); }, remaining);
  }

  // stop the timer but remember how much time was left (the CSS freezes the fill at the same moment)
  function freeze() {
    if (timer === null) return;
    clearTimeout(timer); timer = null;
    remaining = Math.max(0, remaining - (performance.now() - startedAt));
  }

  // is-held freezes the progress fill in CSS
  function syncFill() { root.classList.toggle('is-held', held || expanded || document.hidden); }

  function setHeld(h) {
    held = h;
    syncFill();
    if (stopped()) freeze(); else schedule();
  }

  function setPaused(p) {
    paused = p;
    root.classList.toggle('is-paused', p);
    pauseBtn.setAttribute('aria-pressed', String(p));
    pauseBtn.setAttribute('aria-label', p ? 'Play highlights' : 'Pause highlights');
    if (stopped()) freeze(); else schedule();
  }

  dots.forEach(function (d, k) {
    d.addEventListener('click', function () { show(k); schedule(); });
  });
  pauseBtn.addEventListener('click', function () { setPaused(!paused); });

  // reading a full abstract stops the rotation until it is folded again
  root.querySelectorAll('.hl-more').forEach(function (b) {
    b.addEventListener('click', function () {
      expanded = b.getAttribute('aria-expanded') !== 'true'; // state before the shared toggle in site.js runs
      setHeld(held);
    });
  });

  // hold while the reader is pointing at or focused inside the card
  root.addEventListener('pointerenter', function () { setHeld(true); });
  root.addEventListener('pointerleave', function () { setHeld(false); });
  root.addEventListener('focusin', function () { setHeld(true); });
  root.addEventListener('focusout', function (e) {
    if (!root.contains(e.relatedTarget)) setHeld(false);
  });

  // clicking a highlighted gene on the ring shows its paper
  if (svg) {
    svg.addEventListener('click', function (e) {
      var g = e.target.closest('.gene-label');
      if (!g) return;
      var k = items.findIndex(function (it) { return it.dataset.genes.split(/\s+/).indexOf(g.dataset.gene) > -1; });
      if (k > -1) { show(k); schedule(); }
    });
    items.forEach(function (it) {
      it.dataset.genes.split(/\s+/).forEach(function (g) {
        var label = svg.querySelector('.gene-label[data-gene="' + g + '"]');
        if (label) label.classList.add('has-paper');
      });
    });
  }

  document.addEventListener('visibilitychange', function () {
    syncFill();
    if (document.hidden) freeze(); else schedule();
  });

  show(0);
  setPaused(paused);
})();
