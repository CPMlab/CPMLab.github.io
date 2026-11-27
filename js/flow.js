/**
 * Top-of-page background: a soft field of coloured particles drifting left to right in
 * slow waves, drawn behind the home hero and behind the title band of every other page.
 * Purely decorative (aria-hidden). It stops when that area is scrolled away or the tab
 * is hidden, and is drawn as a still picture when reduced motion is requested.
 * Overall strength is the CSS opacity of .flow-bg.
 */
(function () {
  var host = document.querySelector('.hero, .page-head');
  if (!host || !document.createElement('canvas').getContext) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'flow-bg';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  var ctx = canvas.getContext('2d');

  // logo colours: sky, violet, coral, orange
  var PALETTE = ['#2aa2ee', '#8a6ae0', '#ec4a7b', '#f39325'];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var meta = document.querySelector('meta[name="color-scheme"]');
  var ringEl = host.querySelector('.genome svg'); // home: keep the genome ring clean
  var bandEl = host.querySelector('.hl');         // home: the field stays above the highlights band

  var W = 0, H = 0, fieldH = 0, ring = null, points = [], raf = 0, onScreen = true;

  function isDark() {
    var m = meta ? meta.content : 'dark';
    return m === 'dark' || (m !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var box = canvas.getBoundingClientRect();
    fieldH = bandEl ? Math.max(200, bandEl.getBoundingClientRect().top - box.top) : H;
    ring = null;
    if (ringEl) {
      var g = ringEl.getBoundingClientRect();
      if (g.width) ring = { x: g.left - box.left + g.width / 2, y: g.top - box.top + g.height / 2, r: g.width / 2 };
    }

    var small = W < 720;
    var cols = Math.round(W / (small ? 12 : 9));
    var rows = Math.max(8, Math.round(fieldH / (small ? 26 : 19)));
    points = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        points.push({
          u: c / cols + rand(0, 1 / cols),  // position along the stream (0..1)
          v: r / Math.max(rows - 1, 1),      // position across the stream (0..1)
          speed: rand(0.012, 0.03),          // share of the width travelled per second
          wobble: rand(0, Math.PI * 2),
          size: rand(0.7, small ? 1.6 : 2.1),
          alpha: rand(0.45, 1),
          color: PALETTE[(r + c) % 4]
        });
      }
    }
    draw(performance.now());
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    if (!W || !H || !points.length) return;
    var s = reduce.matches ? 4 : now / 1000;
    var small = W < 720;
    var top = fieldH * 0.12, spread = fieldH * 0.76;
    var ampA = Math.min(fieldH * 0.09, small ? 22 : 56), ampB = ampA * 0.35;
    var freqA = small ? 3.6 : 8.2, freqB = small ? 1.7 : 3.1;

    ctx.globalCompositeOperation = isDark() ? 'lighter' : 'source-over';
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var u = (p.u + s * p.speed) % 1;
      var x = u * W + Math.sin(s * 0.9 + p.wobble) * (small ? 5 : 14);
      var y = top + p.v * spread
        + Math.sin(u * freqA - s * 1.4 + p.v * 3) * ampA
        + Math.cos(u * freqB + s * 0.8 + p.wobble * 0.2) * ampB;
      var middle = 1 - Math.min(1, Math.abs(p.v - 0.5) * 1.7); // densest along the middle of the stream
      var edges = Math.min(1, u * 8) * Math.min(1, (1 - u) * 8); // enter and leave softly
      var bottom = Math.min(1, Math.max(0, (H - y) / 40));       // fade out before the area's bottom edge
      var a = p.alpha * middle * edges * bottom * (0.75 + 0.25 * Math.sin(s * 1.8 + p.wobble));
      if (ring) { // thin the field out over the genome ring
        var e = (Math.hypot(x - ring.x, y - ring.y) - ring.r * 0.75) / (ring.r * 0.45);
        a *= e <= 0 ? 0.12 : e >= 1 ? 1 : 0.12 + 0.88 * e * e * (3 - 2 * e);
      }
      if (a < 0.03) continue;
      ctx.globalAlpha = Math.min(0.9, a);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  function frame(now) { draw(now); raf = requestAnimationFrame(frame); }
  function update() {
    cancelAnimationFrame(raf); raf = 0;
    if (reduce.matches) draw(performance.now()); // reduced motion: a still picture
    else if (onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  }

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(resize); ro.observe(canvas); if (ringEl) ro.observe(ringEl);
  } else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; update(); }).observe(host);
  }
  document.addEventListener('visibilitychange', update);
  if (reduce.addEventListener) reduce.addEventListener('change', update);
  if (meta) new MutationObserver(function () { draw(performance.now()); }).observe(meta, { attributes: true }); // theme switch
  resize();
  update();
  if (ringEl) setTimeout(resize, 1800); // measure the ring again once its entrance animation has settled
})();
