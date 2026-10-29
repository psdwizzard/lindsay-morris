// Turns tools/raw.txt (from tools/pdf2txt.swift) into site/content/works.js + works.json.
// Usage: swift tools/pdf2txt.swift <pdf> > tools/raw.txt && swift tools/pdf2lines.swift <pdf> > tools/lines.tsv && node tools/extract.mjs
// Paragraphs come from line spacing in lines.tsv; raw.txt is used for section bounds and the word-count check.
import { readFileSync, writeFileSync } from 'node:fs';

const raw = readFileSync(new URL('./raw.txt', import.meta.url), 'utf8').split('\n');

const NOISE = [
  /^=== PAGE \d+ ===$/,
  /^PAGES: \d+$/,
  /^LINDSAY MORRIS \/ (NARRATIVE|SELECTED) WRITING$/,
  /^MORRIS [•·] WRITING PORTFOLIO( \/ \d+)?$/,
  /^0\d \/ (COMPLETE SHORT FICTION|FULL STAGE PLAY)$/,
  /^\d+$/,
  /^\\$/,
];
const isNoise = (l) => NOISE.some((r) => r.test(l.trim()));

const META = [
  { slug: 'lucky-boy', title: 'Lucky Boy', genre: 'Speculative fiction', type: 'story',
    logline: 'A dark, unsettling story about institutional power, enforced obedience, and the people caught inside it.' },
  { slug: 'cruella-de-raven', title: 'Cruella De Raven', genre: 'Dark comedy', type: 'story',
    logline: 'A theater performer must find a way home while trapped inside an elaborate, nearly inescapable costume.' },
  { slug: 'crumb-struck', title: 'Crumb-Struck', genre: 'Literary satire', type: 'story',
    logline: 'A retail worker navigates corporate pressure, private humiliation, and an increasingly fragile sense of control.' },
  { slug: 'sushi-please', title: 'Sushi, Please?', genre: 'Literary fiction', type: 'story',
    logline: 'A mordantly funny, self-protective narrator confronts grief, addiction, and the limits of self-deception.' },
  { slug: 'the-flying-nun', title: 'The Flying Nun', genre: 'Absurdist comedy', type: 'story',
    logline: 'A turbulent flight becomes a chaotic test of one deeply imperfect passenger’s capacity for heroism.' },
  { slug: 'we-wont-fight', title: 'We Won’t Fight', genre: 'Stage play', type: 'play',
    logline: 'A woman attempts to orchestrate a peaceful family gathering, only to expose the conflicts she hopes to avoid.' },
];

// Find section starts: the "0N / COMPLETE SHORT FICTION" / "06 / FULL STAGE PLAY" labels.
const starts = [];
raw.forEach((l, i) => { if (/^0[1-6] \/ (COMPLETE SHORT FICTION|FULL STAGE PLAY)$/.test(l.trim())) starts.push(i); });
if (starts.length !== 6) throw new Error(`expected 6 section labels, found ${starts.length}`);

const sentenceCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();
const words = (s) => (s.match(/\S+/g) || []).length;

// Positioned lines from tools/pdf2lines.swift: page, x, y (from top), height, text.
const geo = readFileSync(new URL('./lines.tsv', import.meta.url), 'utf8').trim().split('\n').map((r) => {
  const [page, x, y, h, ...t] = r.split('\t');
  return { page: +page, x: +x, y: +y, h: +h, text: t.join('\t').trim() };
});
// Section boundaries by page, from the same "0N / ..." labels.
const labelPages = geo.filter((g) => /^0[1-6] \/ (COMPLETE SHORT FICTION|FULL STAGE PLAY)$/.test(g.text)).map((g) => g.page);
const SEP = /^(#|-{5,}|=+|\*{2,})$/;

function parseStory(n) {
  const from = labelPages[n], to = labelPages[n + 1];
  const all = geo.filter((g) => g.page >= from && g.page < to);
  const headerGenre = sentenceCase(all[3].text); // label, title, genre
  const lines = all.slice(4).filter((g) => !isNoise(g.text));
  const blocks = [];
  let buf = '';
  const flush = () => { if (buf.trim()) blocks.push({ t: 'p', text: buf.trim() }); buf = ''; };
  for (let i = 0; i < lines.length; i++) {
    const g = lines[i], prev = lines[i - 1];
    if (SEP.test(g.text)) { flush(); blocks.push({ t: 'break' }); continue; }
    if (prev && !SEP.test(prev.text)) {
      let newPara;
      if (prev.page === g.page) newPara = g.y - prev.y > 23; // 17.9pt between lines, 28.9pt between paragraphs
      else newPara = prev.text.length < 80 || (/[.!?”"…]$/.test(prev.text) && /^[“"]/.test(g.text));
      if (newPara) flush();
    }
    buf = buf ? (buf.endsWith('—') ? buf + g.text : buf + ' ' + g.text) : g.text;
  }
  flush();
  while (blocks.length && blocks[blocks.length - 1].t === 'break') blocks.pop(); // the closing rule is not a scene break
  return { headerGenre, blocks };
}

const NAMES = ['LINDSAY', 'SHERRI', 'SHERI', 'CLIFF', 'HAMMOND', 'NOAH', 'GREG', 'EVERYONE', 'NOAH AND SHERRI', 'NOAH & LINDSAY'];
const cueOf = (g) => {
  if (g.x < 200) return null;
  const m = g.text.match(/^([A-Za-z &]+?)\.?\s*(\(.*\))?$/);
  if (!m || !NAMES.includes(m[1].toUpperCase())) return null;
  return { name: m[1].toUpperCase(), ext: m[2] || null };
};

function parsePlay(n) {
  const from = labelPages[n];
  const all = geo.filter((g) => g.page >= from);
  const subtitle = all.find((g) => /^A full-length stage play/.test(g.text))?.text;
  const castAt = all.findIndex((g) => g.text === 'Cast of Characters');
  const cast = [];
  let i = castAt + 1;
  for (; i < all.length && /^[A-Z]+: /.test(all[i].text); i++) {
    const m = all[i].text.match(/^([A-Z]+): (.+)$/); cast.push({ name: m[1], description: m[2] });
  }
  const lines = all.slice(i).filter((g) => !isNoise(g.text));
  const blocks = [];
  let mode = null, buf = '', speaking = false;
  const flush = () => { if (buf.trim()) blocks.push({ t: mode === 'line' ? 'line' : 'direction', text: buf.trim() }); buf = ''; mode = null; };
  const add = (t) => { buf = buf ? buf + ' ' + t : t; };
  for (let k = 0; k < lines.length; k++) {
    const g = lines[k], prev = lines[k - 1];
    const l = g.text;
    if (l === 'THE END') { flush(); blocks.push({ t: 'end', text: 'THE END' }); break; }
    if (/^scene \d+$/i.test(l)) { flush(); speaking = false; blocks.push({ t: 'scene', text: 'Scene ' + l.match(/\d+/)[0] }); continue; }
    const cue = mode !== 'paren' && cueOf(g);
    if (cue) { flush(); speaking = true; blocks.push({ t: 'cue', name: cue.name, ...(cue.ext ? { ext: cue.ext } : {}) }); continue; }
    const gap = prev && prev.page === g.page ? g.y - prev.y : 0;
    if (mode === 'paren') { add(l); if (/[)\]]\.?$/.test(l)) flush(); continue; }
    if (/^[(\[]/.test(l)) {
      const closesEarly = /\)/.test(l) && !/[)\]]\.?$/.test(l);
      if (closesEarly && speaking) { if (mode !== 'line' || gap > 20) { flush(); mode = 'line'; } add(l); continue; }
      flush(); mode = 'paren'; add(l);
      if (/[)\]]\.?$/.test(l)) flush();
      continue;
    }
    if (!speaking || g.x < 150) { if (mode !== 'direction' || gap > 20) { flush(); mode = 'direction'; } add(l); continue; }
    // A blank line inside a speech (a beat) starts a new line block.
    if (mode !== 'line' || gap > 20) { flush(); mode = 'line'; }
    add(l);
  }
  flush();
  return { subtitle, cast, blocks };
}

const works = META.map((m, n) => {
  const from = starts[n];
  const to = n < 5 ? starts[n + 1] : raw.length;
  const parsed = m.type === 'story' ? parseStory(n) : parsePlay(n);
  const text = parsed.blocks.map((b) => b.text || b.name || '').join(' ');
  return { ...m, number: String(n + 1).padStart(2, '0'), ...parsed, wordCount: words(text) };
});

// Fidelity check: words in the cleaned source vs words in the output.
const report = [];
works.forEach((w, n) => {
  const from = starts[n] + (w.type === 'story' ? 3 : 0);
  const to = n < 5 ? starts[n + 1] : raw.length;
  const src = raw.slice(from, to).filter((l) => l.trim() && !isNoise(l) && !SEP.test(l.trim())).join(' ');
  report.push(`${w.number} ${w.title}: out ${w.wordCount} words / src ${words(src)} · ${w.blocks.length} blocks`);
});
console.log(report.join('\n'));

const json = JSON.stringify(works, null, 1);
writeFileSync(new URL('../content/works.js', import.meta.url),
  `// Generated by tools/extract.mjs from the portfolio PDF. Do not edit by hand.\nwindow.LM_WORKS = ${json};\n`);
writeFileSync(new URL('./works.json', import.meta.url), json);
