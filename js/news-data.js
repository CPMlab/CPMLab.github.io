/**
 * Single source of truth for lab news.
 * Add new items at the top of NEWS_DATA to update both news.html and index.html.
 * index.html shows the first NEWS_HOME_COUNT entries.
 *
 * Picture next to each item (optional):
 *   photo: 'images/news/xxx.jpg', photoAlt: '...'           -> a photo of the event itself
 *   photoFull: 'images/news/xxx-full.jpg'                    -> optional larger copy shown when the photo is clicked
 *   people: ['sejunglee', 'eunyoungseo']                    -> profile photos from images/people/<name>.jpg
 * When both are given, photo wins.
 */
window.NEWS_HOME_COUNT = 4;

function escapeNewsHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.NEWS_DATA = [
  {
    title: '[Congratulation] 마크로젠 젊은생명정보학자상 수상 (BIOINFO/GIW ISCB-Asia 2026)',
    names: 'Prof. Jinhyuk Bhin',
    text: 'received the Macrogen Young Bioinformatician Award at BIOINFO/GIW ISCB-Asia 2026.',
    date: '2026.11.20',
    photo: 'images/events/thumbs/261119_award1.jpg',
    photoAlt: 'Professor Jinhyuk Bhin receiving the award on stage at BIOINFO/GIW ISCB-Asia 2026'
  },
  {
    title: '[Congratulation] 2026년도 바이오·의료기술개발사업 첨단바이오 연구교류 프로그램 선정 (KOBRA-ES)',
    names: 'Jebin Lee',
    text: 'selected for the 2026 International Research Exchange Program (KOBRA-ES).',
    date: '2026.05.11',
    people: ['jebinlee']
  },
  {
    title: '[Congratulation] 2025 한국 유전체 학회 우수포스터상 수상',
    names: 'Eunyoung Seo, Sejung Lee',
    text: 'awarded the Best Poster Prize at the 2025 Korean Genome Conference.',
    date: '2025.09.06',
    photo: 'images/news/250906-kogo-best-poster.jpg',
    photoFull: 'images/news/250906-kogo-best-poster-full.jpg',
    photoAlt: 'Eunyoung Seo and Sejung Lee on stage at the 34th KOGO Annual Conference in front of the Best Poster Prize slide'
  },
  {
    title: '[Congratulation] 2025 보건장학회 연구 지원 장학생 선정',
    names: 'Eunyoung Seo',
    text: 'selected for the Health Scholarship Foundation Scholarship.',
    date: '2025.07.25',
    people: ['eunyoungseo']
  },
  {
    title: '[Congratulation] 대학원 대통령 과학 장학생 선정',
    names: 'Sejung Lee',
    text: 'selected for the students of Presidential Science Fellow for Graduate Studies.',
    date: '2025.06.05',
    photo: 'images/news/250605-presidential-fellowship.jpg',
    photoAlt: 'Group photo of the Presidential Science Fellows for Graduate Studies'
  },
  {
    title: '[Congratulation] 한국연구재단 사업단 선정-기초의과학연구센터(MRC) 2024',
    names: 'Prof. Jinhyuk Bhin',
    text: 'selected as a National Research Foundation of Korea Project - Basic Medical Research Center (MRC)',
    date: '2024~',
    people: ['jinhyukbhin']
  },
  {
    title: '[Congratulation] 한국연구재단-학문후속세대지원-석사과정생연구장려금지원사업 과제 선정',
    names: 'Se Jung Lee',
    text: 'selected for the National Research Foundation of Korea-Support for the Next Generation of Scholars-Graduate Student Research Fellowship Program',
    date: '2024.09.01',
    people: ['sejunglee']
  },
  {
    title: '[Congratulation] 한국연구재단-과학기술분야 기초연구사업-우수신진연구 과제 선정',
    names: 'Prof. Jinhyuk Bhin',
    text: 'selected for the National Research Foundation of Korea - Basic Research Projects in Science and Technology - Outstanding New Research Project.',
    date: '2024.04.24',
    people: ['jinhyukbhin']
  }
];

// full-size picture for the lightbox: event thumbnails have a full photo next to them
function newsFullPhoto(item) {
  return item.photoFull || String(item.photo).replace('/thumbs/', '/');
}

function newsMediaHtml(item, index) {
  var imgs = [];
  if (item.photo) {
    imgs.push('<img src="' + escapeNewsHtml(item.photo) + '" alt="' + escapeNewsHtml(item.photoAlt || '') + '" loading="lazy" decoding="async">');
  } else if (item.people && item.people.length) {
    // profile photos; the names are already in the text, so they are decorative here
    item.people.forEach(function (key) {
      imgs.push('<img class="is-portrait" src="' + escapeNewsHtml('images/people/' + key + '.jpg') + '" alt="" loading="lazy" decoding="async">');
    });
  }
  if (!imgs.length) return '';
  // a button, so the photo can be opened larger (news.html lightbox)
  return '<button type="button" class="news-media' + (item.photo ? '' : ' is-people') + '" data-index="' + index + '"' +
    ' aria-haspopup="dialog" aria-label="Enlarge photo">' + imgs.join('') + '</button>';
}

function newsItemHtml(item, withMedia, index) {
  var title = String(item.title || '');
  var tag = '';
  var m = title.match(/^\s*\[([^\]]+)\]\s*/);
  if (m) { tag = m[1]; title = title.slice(m[0].length); }
  return '<span class="news-date">' + escapeNewsHtml(item.date) + '</span>' +
    '<div class="news-body">' +
      (tag ? '<span class="news-tag">' + escapeNewsHtml(tag) + '</span>' : '') +
      '<h3>' + escapeNewsHtml(title) + '</h3>' +
      '<p><strong>' + escapeNewsHtml(item.names) + '</strong> ' + escapeNewsHtml(item.text) + '</p>' +
    '</div>' +
    (withMedia ? newsMediaHtml(item, index) : '');
}

function fillNews(container, items, withMedia) {
  if (!container) return;
  container.innerHTML = '';
  items.forEach(function (item, index) {
    var li = document.createElement('li');
    li.className = 'news-item';
    li.innerHTML = newsItemHtml(item, withMedia, index);
    container.appendChild(li);
  });
}

/* news.html: every item, with its picture */
window.fillNewsListPage = function (container) {
  var items = window.NEWS_DATA || [];
  fillNews(container, items, true);
  openNewsPhotosLarger(container, items);
};

/* news.html: clicking a picture opens it larger in the #newsLightbox dialog */
function openNewsPhotosLarger(container, items) {
  var box = document.getElementById('newsLightbox');
  if (!container || !box || !box.showModal) return;
  var stage = box.querySelector('.lightbox-stage');
  var titleEl = box.querySelector('#newsLightboxTitle');
  var metaEl = box.querySelector('.lightbox-meta');

  container.addEventListener('click', function (e) {
    var btn = e.target.closest('.news-media');
    if (!btn) return;
    var item = items[+btn.dataset.index];
    if (!item) return;
    var html = '';
    if (item.photo) {
      html = '<img src="' + escapeNewsHtml(newsFullPhoto(item)) + '" alt="' + escapeNewsHtml(item.photoAlt || '') + '">';
    } else {
      html = (item.people || []).map(function (key) {
        return '<img src="' + escapeNewsHtml('images/people/' + key + '.jpg') + '" alt="">';
      }).join('');
    }
    stage.classList.toggle('is-people', !item.photo);
    stage.innerHTML = html;
    titleEl.textContent = String(item.title || '').replace(/^\s*\[[^\]]+\]\s*/, '');
    metaEl.textContent = [item.names, item.date].filter(Boolean).join(' · ');
    box.showModal();
  });
  box.addEventListener('close', function () { stage.innerHTML = ''; });

  // light dismiss where closedby="any" is unsupported
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    box.addEventListener('click', function (e) {
      if (e.target !== box) return;
      var r = box.getBoundingClientRect();
      var inside = r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
      if (!inside) box.close();
    });
  }
}

/* index.html: the newest NEWS_HOME_COUNT items, text only (pictures are on the News page) */
window.fillNewsListHome = function (container) {
  fillNews(container, (window.NEWS_DATA || []).slice(0, window.NEWS_HOME_COUNT || 4));
};
