/**
 * Site-wide behaviour: responsive navigation + header state.
 * The navigation is one list: inline when it fits, a native popover when it does not.
 */
(function () {
  // Popover polyfill only where the browser lacks it
  if (!Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'popover')) {
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/@oddbird/popover-polyfill@0.5.2/dist/popover.min.js';
    document.head.appendChild(s);
  }

  var header = document.querySelector('.site-header');
  if (!header) return;
  var inner = header.querySelector('.header-inner');
  var menu = header.querySelector('.site-menu');
  var lastWidth = 0;

  function layout() {
    if (!inner || !menu) return;
    var width = inner.clientWidth;
    var wasWide = header.classList.contains('is-wide');
    // while collapsed, only re-measure when the header has grown
    if (!wasWide && width <= lastWidth) { lastWidth = width; return; }
    lastWidth = width;

    var wasOpen = false;
    try { wasOpen = menu.matches(':popover-open'); } catch (e) { wasOpen = menu.classList.contains(':popover-open'); }

    header.classList.add('is-measuring', 'is-wide');
    menu.removeAttribute('popover');
    var fits = inner.scrollWidth <= inner.clientWidth + 1;
    if (!fits) {
      header.classList.remove('is-wide');
      menu.setAttribute('popover', 'auto');
      if (wasOpen && menu.showPopover) menu.showPopover();
    }
    requestAnimationFrame(function () { header.classList.remove('is-measuring'); });
  }

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(layout);
    ro.observe(header);
    ro.observe(menu);
  } else {
    window.addEventListener('resize', layout);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { lastWidth = 0; layout(); });
  layout();

  // Close the collapsed menu after choosing a link (same-page anchors)
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a') && menu.hasAttribute('popover') && menu.hidePopover) {
      try { menu.hidePopover(); } catch (err) { /* already closed */ }
    }
  });

  // Header border once the page scrolls
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* "Read full abstract": only shown when the text is actually clamped */
(function () {
  var btns = document.querySelectorAll('.text-btn[aria-controls]');
  function sync() {
    btns.forEach(function (b) {
      var p = document.getElementById(b.getAttribute('aria-controls'));
      if (!p || b.getAttribute('aria-expanded') === 'true') return;
      b.hidden = p.scrollHeight <= p.clientHeight + 2;
    });
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var p = document.getElementById(b.getAttribute('aria-controls'));
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open));
      p.classList.toggle('is-clamped', !open);
      b.firstChild.nodeValue = open ? 'Show less ' : 'Read full abstract ';
    });
  });
  sync();
  window.addEventListener('resize', sync, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
})();

/* Theme switch (footer). Dark is the default; the button switches to light and back.
   The choice lives in <meta name="color-scheme">; CSS maps it to color-scheme.
   Only "light" is stored, so clearing storage returns to the default. */
(function () {
  var meta = document.querySelector('meta[name="color-scheme"]');
  var btn = document.querySelector('.theme-toggle');
  if (!meta || !btn) return;
  function apply(value) {
    var run = function () { meta.content = value; };
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(run);
    } else {
      run();
    }
  }
  btn.addEventListener('click', function () {
    var target = meta.content === 'light' ? 'dark' : 'light';
    try {
      if (target === 'dark') localStorage.removeItem('color-scheme');
      else localStorage.setItem('color-scheme', 'light');
    } catch (e) { /* storage blocked: still switch for this page */ }
    apply(target);
  });
  // another tab changed it
  window.addEventListener('storage', function (e) {
    if (e.key === 'color-scheme') meta.content = e.newValue === 'light' ? 'light' : 'dark';
  });
})();
