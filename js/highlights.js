/**
 * Home hero: rotating research highlights, synced with the genome ring.
 * Each .hl-item lists its genes in data-genes; the matching gene on the ring lights up.
 */
(function () {
  var root = document.querySelector('.hl');
  var svg = document.querySelector('.genome svg');
  if (!root) return;
  var items = Array.prototype.slice.call(root.querySelectorAll('.hl-item'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.hl-dot'));
  var pauseBtn = root.querySelector('.hl-pause');
  var INTERVAL = 6500;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var index = 0, timer = null, held = false, expanded = false, paused = reduce.matches;

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
    // restart the progress fill on the active dot
    var active = dots[index];
    if (active) { active.classList.remove('is-running'); void active.offsetWidth; if (!paused && !expanded) active.classList.add('is-running'); }
    // warm the next thumbnail
    var next = items[(index + 1) % items.length].querySelector('img');
    if (next && next.loading === 'lazy') next.loading = 'eager';
    ring(items[index].dataset.genes.split(/\s+/));
  }

  function schedule() {
    clearTimeout(timer);
    if (paused || held || expanded) return;
    timer = setTimeout(function () { show(index + 1); schedule(); }, INTERVAL);
  }

  function setPaused(p) {
    paused = p;
    root.classList.toggle('is-paused', p);
    pauseBtn.setAttribute('aria-pressed', String(p));
    pauseBtn.setAttribute('aria-label', p ? 'Play highlights' : 'Pause highlights');
    dots.forEach(function (d) { d.classList.remove('is-running'); });
    if (!p) { var a = dots[index]; void a.offsetWidth; a.classList.add('is-running'); }
    schedule();
  }

  dots.forEach(function (d, k) {
    d.addEventListener('click', function () { show(k); schedule(); });
  });
  pauseBtn.addEventListener('click', function () { setPaused(!paused); });

  // reading a full abstract stops the rotation until it is folded again
  root.querySelectorAll('.hl-more').forEach(function (b) {
    b.addEventListener('click', function () {
      expanded = b.getAttribute('aria-expanded') !== 'true'; // state before the shared toggle in site.js runs
      root.classList.toggle('is-held', expanded || held);
      show(index);
      schedule();
    });
  });

  // hold while the reader is pointing at or focused inside the card
  root.addEventListener('pointerenter', function () { held = true; root.classList.add('is-held'); clearTimeout(timer); });
  root.addEventListener('pointerleave', function () { held = false; root.classList.remove('is-held'); show(index); schedule(); });
  root.addEventListener('focusin', function () { held = true; root.classList.add('is-held'); clearTimeout(timer); });
  root.addEventListener('focusout', function (e) {
    if (!root.contains(e.relatedTarget)) { held = false; root.classList.remove('is-held'); schedule(); }
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
    if (document.hidden) clearTimeout(timer); else schedule();
  });

  setPaused(paused);
  show(0);
  schedule();
})();
