/**
 * Single source of truth for lab news.
 * Add new items at the top of NEWS_DATA to update both news.html and index.html.
 * index.html shows the first NEWS_HOME_COUNT entries.
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
    title: '[Congratulation] 2026년도 바이오·의료기술개발사업 첨단바이오 연구교류 프로그램 선정 (KOBRA-ES)',
    names: 'Jebin Lee',
    text: 'selected for the 2026 International Research Exchange Program (KOBRA-ES).',
    date: '2026.05.11'
  },
  {
    title: '[Congratulation] 2025 한국 유전체 학회 우수포스터상 수상',
    names: 'Eunyoung Seo, Sejung Lee',
    text: 'awarded the Best Poster Prize at the 2025 Korean Genome Conference.',
    date: '2025.09.06'
  },
  {
    title: '[Congratulation] 2025 보건장학회 연구 지원 장학생 선정',
    names: 'Eunyoung Seo',
    text: 'selected for the Health Scholarship Foundation Scholarship.',
    date: '2025.07.25'
  },
  {
    title: '[Congratulation] 대학원 대통령 과학 장학생 선정',
    names: 'Sejung Lee',
    text: 'selected for the students of Presidential Science Fellow for Graduate Studies.',
    date: '2025.06.05'
  },
  {
    title: '[Congratulation] 한국연구재단 사업단 선정-기초의과학연구센터(MRC) 2024',
    names: 'Prof. Jinhyuk Bhin',
    text: 'selected as a National Research Foundation of Korea Project - Basic Medical Research Center (MRC)',
    date: '2024~'
  },
  {
    title: '[Congratulation] 한국연구재단-학문후속세대지원-석사과정생연구장려금지원사업 과제 선정',
    names: 'Se Jung Lee',
    text: 'selected for the National Research Foundation of Korea-Support for the Next Generation of Scholars-Graduate Student Research Fellowship Program',
    date: '2024.09.01'
  },
  {
    title: '[Congratulation] 한국연구재단-과학기술분야 기초연구사업-우수신진연구 과제 선정',
    names: 'Prof. Jinhyuk Bhin',
    text: 'selected for the National Research Foundation of Korea - Basic Research Projects in Science and Technology - Outstanding New Research Project.',
    date: '2024.04.24'
  }
];

window.fillNewsListPage = function (container) {
  if (!container || !window.NEWS_DATA) return;
  container.innerHTML = '';
  window.NEWS_DATA.forEach(function (item) {
    var div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML =
      '<h3>' + escapeNewsHtml(item.title) + '</h3>' +
      '<p><span class="bhin-name">' + escapeNewsHtml(item.names) + '</span> ' + escapeNewsHtml(item.text) + '</p>' +
      '<span class="date">' + escapeNewsHtml(item.date) + '</span>';
    container.appendChild(div);
  });
};

window.fillNewsListHome = function (container) {
  if (!container || !window.NEWS_DATA) return;
  var n = window.NEWS_HOME_COUNT || 4;
  var slice = window.NEWS_DATA.slice(0, n);
  var delays = [200, 300, 400, 500, 600, 700, 800];
  container.innerHTML = '';
  slice.forEach(function (item, i) {
    var art = document.createElement('article');
    art.className = 'news-item-text';
    art.setAttribute('data-aos', 'fade-up');
    art.setAttribute('data-aos-delay', String(delays[i] != null ? delays[i] : 200 + i * 100));
    art.onclick = function () { window.location.href = 'news.html'; };
    art.innerHTML =
      '<h3>' + escapeNewsHtml(item.title) + '</h3>' +
      '<p><strong>' + escapeNewsHtml(item.names) + '</strong> ' + escapeNewsHtml(item.text) + '</p>' +
      '<span class="date">' + escapeNewsHtml(item.date) + '</span>';
    container.appendChild(art);
  });
};
