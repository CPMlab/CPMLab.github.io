/**
 * Site-wide scroll: header background + background GIF fade
 */
(function () {
  var BG_OPACITY_START = 0.5;
  var BG_OPACITY_MIN = 0;
  var BG_FADE_VIEWPORT_RATIO = 1.2;
  var HEADER_SCROLL_THRESHOLD = 50;

  function updateBackgroundScrollOpacity() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var fadeDistance = window.innerHeight * BG_FADE_VIEWPORT_RATIO;
    var progress = fadeDistance > 0 ? Math.min(scrollTop / fadeDistance, 1) : 0;
    var opacity = BG_OPACITY_START - (BG_OPACITY_START - BG_OPACITY_MIN) * progress;
    document.documentElement.style.setProperty('--bg-scroll-opacity', String(opacity));
    document.body.style.setProperty('--bg-scroll-opacity', String(opacity));
  }

  function updateHeaderScroll() {
    var siteHeader = document.querySelector('.site-header');
    if (!siteHeader) return;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > HEADER_SCROLL_THRESHOLD) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }

  function onScroll() {
    updateHeaderScroll();
    updateBackgroundScrollOpacity();
  }

  function init() {
    updateBackgroundScrollOpacity();
    updateHeaderScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateBackgroundScrollOpacity, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
