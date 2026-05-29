(function () {
  function linkPaperItems() {
    var items = document.querySelectorAll('.journal-papers .paper-item');
    var urls = window.PUBLICATION_URLS || [];
    items.forEach(function (el, i) {
      var url = urls[i];
      if (!url) return;
      el.classList.add('paper-item--linked');
      el.setAttribute('role', 'link');
      el.setAttribute('tabindex', '0');
      var titleEl = el.querySelector('h3');
      el.setAttribute('aria-label', 'Open publication: ' + (titleEl ? titleEl.textContent : '').trim());
      el.addEventListener('click', function () {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', linkPaperItems);
  } else {
    linkPaperItems();
  }
})();
