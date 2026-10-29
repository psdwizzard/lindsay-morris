// Generates the static site pages from the extracted content.
// Usage: node tools/build.mjs   (after tools/extract.mjs). Output is plain HTML in site/.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../site/', import.meta.url);
const load = (file, key) => {
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(new URL(`../content/${file}`, import.meta.url), 'utf8'), ctx);
  return ctx.window[key];
};
const P = load('profile.js', 'LM_PROFILE');
const WORKS = load('works.js', 'LM_WORKS');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (n) => n.toLocaleString('en-US');
const minutes = (w) => Math.max(1, Math.round(w.wordCount / 230));
const about = (n) => `About ${fmt(Math.round(n / 100) * 100)} words`;
const firstLine = (w) => {
  if (w.type === 'play') return 'What pairs well with Xanax?';
  const t = w.blocks.find((b) => b.t === 'p').text;
  return t.split(/(?<=[.?!])\s/)[0];
};
const length = (w) => (w.type === 'play' ? 'a full-length play in 75 pages' : `${minutes(w)}-minute read`);
const total = WORKS.reduce((s, w) => s + w.wordCount, 0);
const hasHeadshot = existsSync(new URL('assets/headshot.jpg', root));
const PDF = 'assets/Lindsay_Morris_Writing_Portfolio.pdf';
const SITE_URL = 'https://psdwizzard.github.io/lindsay-morris/';

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&display=swap" rel="stylesheet">`;

function head({ title, description, rel = '', path = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE_URL}${path}">
<meta name="theme-color" content="#16181c">
<link rel="icon" href="${rel}assets/favicon.svg" type="image/svg+xml">
${fonts}
<link rel="stylesheet" href="${rel}assets/site.css">
<script>document.documentElement.classList.add('js');try{if(localStorage.getItem('lm-theme')==='night')document.documentElement.dataset.theme='night'}catch(e){}</script>
</head>`;
}

const toggle = `<button class="lights" type="button" aria-pressed="false" hidden>Night reading</button>`;

function msHead({ rel, right, nav }) {
  return `<header class="ms-head">
      <address><a class="home" href="${rel}index.html">${esc(P.name)}</a><br>${esc(P.location)}<br><a href="mailto:${P.email}">${esc(P.email)}</a></address>
      <div class="count">${right}
        <nav aria-label="Main"><ul>${nav}</ul></nav>
        ${toggle}
      </div>
    </header>`;
}

const footer = (rel) => `<footer class="desk-foot">
  <p>© 2026 ${esc(P.name)}. All writing is her own and may not be reproduced without permission.</p>
  <p><a href="${rel}${PDF}" download>Download the portfolio as a PDF</a></p>
</footer>
<script src="${rel}assets/site.js"></script>
</body>
</html>
`;

/* ---------- index ---------- */
function tocItem(w) {
  return `<li><a href="works/${w.slug}.html"><span class="row"><span class="t">${esc(w.title)}</span><span class="lead-dots" aria-hidden="true"></span><span class="w">${w.type === 'play' ? '75 pages' : fmt(w.wordCount) + ' words'}</span></span><span class="first">${esc(firstLine(w))}</span><span class="g">${esc(w.headerGenre || w.genre)}</span></a></li>`;
}

function credit(c) {
  // Link the one credit that is on this site.
  const desc = esc(c.description).replace('We Won’t Fight', '<a href="works/we-wont-fight.html">We Won’t Fight</a>');
  return `<li><span class="yrs">${esc(c.years.replace('–', ' to '))}</span><div><h3>${esc(c.company)}</h3><p class="where">${esc(c.city)}, ${esc(c.roles.toLowerCase())}</p><p>${desc}</p></div></li>`;
}

const index = `${head({ title: `${P.name}, writer and performer`, description: `${P.name} is a writer and performer in ${P.location}. Read five of her short stories and her stage play, We Won’t Fight, in full.` })}
<body>
<a class="skip" href="#contents">Skip to the contents</a>
<main>
  <section class="sheet title-page">
    ${msHead({ rel: '', right: about(total), nav: '<li><a href="#contents">Contents</a></li><li><a href="#about">About</a></li><li><a href="#stage">Stage</a></li>' })}
    <div class="title-block">
      <h1>Five stories and a play</h1>
      <p class="by">by ${esc(P.name)}, writer and performer in ${esc(P.location)}</p>
      <div class="actions"><a class="btn btn--primary" href="#contents">Start reading</a><a class="btn" href="mailto:${P.email}">Email Lindsay</a></div>
    </div>
  </section>

  <section class="sheet" id="contents" aria-labelledby="toc-h">
    <span class="runhead">Morris / Contents / 2</span>
    <h2 id="toc-h">Contents</h2>
    <ol class="toc">
      ${WORKS.map(tocItem).join('\n      ')}
    </ol>
    <p class="note">${esc(P.contentNote)}</p>
  </section>

  <section class="sheet" id="about" aria-labelledby="about-h">
    <span class="runhead">Morris / About / 3</span>
    <h2 id="about-h">About the author</h2>
    <div class="about${hasHeadshot ? ' about--photo' : ''}">
      ${hasHeadshot ? `<figure class="headshot"><img src="assets/headshot.jpg" alt="Lindsay Morris" width="600" height="750" loading="lazy"></figure>` : ''}
      <div class="bio">
        ${P.bio.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
      </div>
    </div>
    <dl class="facts">
      <div><dt>Published in</dt><dd>${P.publications.map((p) => (typeof p === 'string' ? `<cite>${esc(p)}</cite>` : `<a href="${esc(p.url)}"><cite>${esc(p.name)}</cite></a>`)).join(' and ')}</dd></div>
      <div><dt>Stages</dt><dd>New York, New Orleans, Chicago and Richmond</dd></div>
      <div><dt>Education</dt><dd>${esc(P.education)}</dd></div>
    </dl>
  </section>

  <section class="sheet" id="stage" aria-labelledby="stage-h">
    <span class="runhead">Morris / Stage / 4</span>
    <h2 id="stage-h">Writing for the stage</h2>
    <ol class="credits">
      ${P.credits.map(credit).join('\n      ')}
    </ol>
  </section>

  <section class="sheet end-page" id="contact" aria-labelledby="contact-h">
    <span class="runhead">Morris / Contact / 5</span>
    <h2 id="contact-h">Write to Lindsay</h2>
    <p class="mail"><a href="mailto:${P.email}">${esc(P.email)}</a></p>
    <p class="pdf"><a class="btn" href="${PDF}" download>Download the PDF</a></p>
    <p class="endmark" aria-hidden="true"># # #</p>
  </section>
</main>
${footer('')}`;

writeFileSync(new URL('index.html', root), index);

/* ---------- work pages ---------- */
function storyBody(w) {
  return w.blocks.map((b) => (b.t === 'break' ? '<p class="scene-break" aria-label="Section break">#</p>' : `<p>${esc(b.text)}</p>`)).join('\n');
}

function playBody(w) {
  const out = [];
  out.push(`<section class="cast" aria-labelledby="cast-h"><h2 id="cast-h">Cast of characters</h2><dl>${w.cast.map((c) => `<div><dt>${esc(c.name)}</dt><dd>${esc(c.description)}</dd></div>`).join('')}</dl></section>`);
  let open = false;
  const close = () => { if (open) { out.push('</div>'); open = false; } };
  for (const b of w.blocks) {
    if (b.t === 'scene') { close(); out.push(`<h2 class="scene">${esc(b.text)}</h2>`); }
    else if (b.t === 'cue') { close(); out.push(`<div class="speech"><p class="cue">${esc(b.name)}${b.ext ? ` <span class="ext">${esc(b.ext)}</span>` : ''}</p>`); open = true; }
    else if (b.t === 'line') out.push(`<p class="line">${esc(b.text)}</p>`);
    else if (b.t === 'direction') out.push(`<p class="direction">${esc(b.text)}</p>`);
    else if (b.t === 'end') { close(); }
  }
  close();
  return out.join('\n');
}

WORKS.forEach((w, i) => {
  const prev = WORKS[i - 1];
  const next = WORKS[i + 1];
  const right = w.type === 'play' ? '75 pages' : about(w.wordCount);
  const page = `${head({ title: `${w.title}, by ${P.name}`, description: `${w.logline} ${w.type === 'play' ? 'A full-length stage play' : 'A short story'} by ${P.name}, in full.`, rel: '../', path: `works/${w.slug}.html` })}
<body class="reading${w.type === 'play' ? ' reading--play' : ''}">
<a class="skip" href="#text">Skip to the text</a>
<div class="runbar" aria-hidden="true"><span>Morris / ${esc(w.title)}</span><span class="progress"></span></div>
<main>
  <article class="sheet manuscript">
    ${msHead({ rel: '../', right, nav: '<li><a href="../index.html#contents">Contents</a></li><li><a href="../index.html#about">About</a></li>' })}
    <div class="ms-title">
      <h1>${esc(w.title)}</h1>
      <p class="by">by ${esc(P.name)}</p>
      <p class="meta">${esc(w.headerGenre || w.genre)}, ${esc(length(w))}</p>
    </div>
    <p class="cnote">A note before you read: this ${w.type === 'play' ? 'play' : 'story'} may contain strong language, drug use, sexual content, and bodily or psychological distress.</p>
    <div class="text" id="text">
${w.type === 'play' ? playBody(w) : storyBody(w)}
    </div>
    <p class="endmark">${w.type === 'play' ? 'The end' : '# # #'}</p>
  </article>
  <nav class="sheet next" aria-label="More work">
    ${next ? `<a class="next-link" href="${next.slug}.html"><span class="k">Next</span><span class="t">${esc(next.title)}</span><span class="first">${esc(firstLine(next))}</span></a>` : `<a class="next-link" href="../index.html#about"><span class="k">That’s everything</span><span class="t">About the author</span><span class="first">Lindsay writes and performs in Richmond, Virginia.</span></a>`}
    <p class="aside">${prev ? `<a href="${prev.slug}.html">Back to ${esc(prev.title)}</a>` : ''}<a href="../index.html#contents">All the work</a></p>
  </nav>
</main>
${footer('../')}`;
  writeFileSync(new URL(`works/${w.slug}.html`, root), page);
});

console.log(`built index + ${WORKS.length} work pages · ${fmt(total)} words · headshot: ${hasHeadshot}`);
