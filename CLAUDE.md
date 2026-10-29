# Lindsay Morris writing portfolio site

Portfolio site for Lindsay Morris, Kenneth's friend: a writer and performer in Richmond, VA. The source material is `Lindsay_Morris_Complete_Writing_Portfolio.pdf`, which holds her bio, credits, five short stories and the full play *We Won't Fight*. The **full text** of every piece is published on the site; Kenneth chose this knowing the pieces will then count as "previously published".

- **Live:** https://psdwizzard.github.io/lindsay-morris/ (repo `psdwizzard/lindsay-morris`, public)
- **Deploy:** push to `main`. `.github/workflows/pages.yml` publishes `site/` only, so docs, tools and mockups are never served.
- **Gotcha:** the folder name starts with a space (`…/Linsday_projects/ L-site`). Quote every path.

## Stack
Plain static HTML/CSS/JS with no framework and no runtime build. It opens by double-clicking `site/index.html` (`file://`). The pages are generated once by Node scripts and the output is committed.

```
swift tools/pdf2txt.swift Lindsay_Morris_Complete_Writing_Portfolio.pdf > tools/raw.txt     # PDFKit text dump
swift tools/pdf2lines.swift Lindsay_Morris_Complete_Writing_Portfolio.pdf > tools/lines.tsv # each line with its x/y
node tools/extract.mjs   # lines.tsv -> content/works.js + tools/works.json (prints word-count fidelity check)
node tools/build.mjs     # profile.js + works.js -> site/index.html + site/works/<slug>.html
```
- `content/profile.js` is hand-written from PDF pages 2–4: bio, credits, publications, content note. Edit it there, then run `build.mjs`.
- `extract.mjs` builds paragraphs from **line geometry**: a gap over 23pt is a new paragraph; across page breaks it falls back to a line-length heuristic. In the play, any name at x ≥ 200 is a speaker cue, matched case-insensitively. Beats are y-gaps inside a speech.
- Fidelity check: word counts must equal the source. The play was also checked word for word against the PDF; the play's title and cast pages make up its roughly 100-word difference.
- The play is parsed into blocks: scene, direction, cue, line. The original script has no Scene 7; that is in the source, not a bug.
- Never edit her prose. Leave typos and straight quotes as written.

## Design (Hallmark skill, custom route)
- Design comes from the Hallmark skill (`~/.claude/skills/hallmark`, from github.com/nutlope/hallmark). The stock themes were rejected; Kenneth picked the custom **Manuscript** direction.
- The idea is standard manuscript format: white sheets on a dark desk. Contact details sit top-left and the word count top-right; together that header is the nav. Titles sit low on the page, running heads read "Morris / X / n", and scene breaks are `#` with `# # #` at the end.
- Type: Courier Prime for display, UI and the play script; Literata for reading text. Accent: editor's red. Tokens live in `site/assets/tokens.css`.
- `:root[data-theme="night"]` is the "Night reading" night-reading mode. `site.js` toggles it and stores the choice in localStorage. `site.js` also drives the reading progress line.
- `site/assets/site.css` starts with the Hallmark stamp and waivers. Lint with `node ~/.claude/skills/hallmark/scripts/sloplint.mjs site --genre editorial --render`.
  - Gates 19 and 58 FAIL on the work pages only, because they fire on her own prose. That is accepted and must not be "fixed".
- `mockups/` holds the five directions explored: carnival, almanac, specimen, manuscript and night. They are reference only and not deployed.

## Pending from Kenneth
- **Headshot:** drop it at `site/assets/headshot.jpg` (portrait, about 600×750) and rerun `build.mjs`. The About section switches to a two-column layout automatically.
- **Publication and social URLs:** in `profile.js`, `publications` entries can become `{ name, url }`. Social links don't have a slot yet.

## Docs
`docs/plan.md` (the original plan), `docs/progress.md`, `docs/devblog.md` (newest entry first).
