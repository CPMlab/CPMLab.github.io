# Bhin Lab 홈페이지 (cgi.yonsei.ac.kr)

빌드 도구 없는 정적 사이트입니다. GitHub Pages에 그대로 올리면 됩니다.

```
index.html          홈 (게놈 링 히어로, 대표 논문, 연구 주제, 뉴스, Lab life)
research.html       연구 주제 3개
members.html        PI, 팀원, 인턴
publications.html   논문 목록 (검색 가능)
news.html           뉴스 (js/news-data.js에서 그림)
galleries.html      갤러리 (js/galleries-data.js에서 그림, 클릭하면 뷰어)
positions.html      모집 안내
contact.html        주소, 지도
about.html          예전 주소 → 홈으로 이동
404.html            없는 페이지
css/site.css        모든 페이지 공통 스타일
js/site.js          메뉴, 헤더, 초록 펼치기
js/galleries.js     갤러리/홈 Lab life 렌더링
```

## 자주 하는 업데이트

### 뉴스 추가
`js/news-data.js`의 `NEWS_DATA` 맨 위에 항목을 하나 추가합니다. 홈에는 최신 4개가 자동으로 나옵니다.

```js
{
  title: '[Congratulation] 수상/선정 내용',
  names: 'Name1, Name2',
  text: 'awarded the ... .',
  date: '2026.11.27',
  people: ['sejunglee', 'eunyoungseo']   // 오른쪽 사진: images/people/<이름>.jpg 프로필 사진
},
```
`[ ]` 안의 단어는 제목 위의 작은 라벨로 표시됩니다.

오른쪽 사진은 둘 중 하나를 씁니다.
- 행사 사진이 있으면 `photo: 'images/news/파일.jpg', photoAlt: '사진 설명'` (photo가 people보다 우선)
- 없으면 `people: [...]`에 해당 멤버의 프로필 사진 파일 이름(확장자 제외)을 적습니다.

### 갤러리 추가
1. 사진을 `images/events/`에 넣습니다. 가로 1600px 이하 JPG를 권장합니다. 휴대폰 원본(5MB 이상)은 줄여서 넣어 주세요.
2. `js/galleries-data.js`의 `GALLERIES_DATA` 맨 위에 추가합니다. 홈의 Lab life에는 최신 3개가 나옵니다.
   ```js
   { title: "행사 이름", date: "2026.11.27", images: ["images/events/261127_1.jpg", "images/events/261127_2.jpg"] },
   ```
3. (선택) 썸네일: `images/events/thumbs/`에 같은 파일명의 가로 800px 사본을 넣으면 목록이 더 빨리 뜹니다. 없으면 원본을 자동으로 씁니다.
4. 움직이는 짤은 GIF 대신 MP4로 넣고, 같은 이름의 `-poster.jpg`(첫 프레임)를 함께 넣으세요.
   `ffmpeg -i in.gif -movflags +faststart -pix_fmt yuv420p -vf "scale='min(1280,iw)':-2" -crf 26 -an out.mp4`

### 논문 추가
`publications.html`에서 해당 연도 `<ol>` 맨 위에 `<li class="pub">` 블록을 하나 복사해 고칩니다. 그 해 섹션이 없으면 `<section class="pub-year">` 블록을 통째로 복사합니다.
- 빈진혁 교수 이름은 `<b>Bhin J</b>`로 감싸면 굵게 표시됩니다.
- 한빛사 논문은 `<span class="badge" lang="ko">한빛사</span>`를 붙입니다.
- `data-search` 속성에 소문자로 제목, 저자, 저널, 연도를 넣어야 검색됩니다.
- 홈의 `All 34 publications` 숫자와 publications 페이지 상단 숫자도 함께 고쳐 주세요.

### 멤버 추가
`members.html`에서 `<li class="person">` 블록을 복사합니다. 사진은 `images/people/`에 4:5 비율, 가로 720px 이하 JPG로 넣습니다.
`data-role` 값(`postdoc`, `phd`, `mph`, `ms`, `staff`, `intern`)에 따라 역할 라벨 색이 바뀝니다.

### 메뉴/푸터 수정
헤더와 푸터는 모든 HTML 파일에 같은 내용으로 들어 있습니다. 하나를 고치면 나머지 파일도 같이 고쳐 주세요.
CSS/JS를 고친 뒤 브라우저 캐시 때문에 반영이 안 되면 HTML의 `?v=20261127y` 값을 바꿔 주세요.

## 로컬에서 보기
```
python -m http.server 8765
```
브라우저에서 http://localhost:8765 를 엽니다.
