# Lindsay Morris writing portfolio site (Hallmark design, GitHub Pages)

## Context
Lindsay Morris is a writer and performer in Richmond. Her whole portfolio sits in one 133-page PDF (`Lindsay_Morris_Complete_Writing_Portfolio.pdf`):
- her bio and credits
- five short stories (Lucky Boy, Cruella De Raven, Crumb-Struck, Sushi Please?, The Flying Nun)
- a full stage play (We Won't Fight)

Kenneth wants a polished, responsive site (phone and desktop) designed with the **Hallmark** skill (github.com/nutlope/hallmark), hosted free on GitHub Pages under his account **psdwizzard**.

Decisions already made:
- **Full text** of every piece goes on the site. The user accepted that the pieces will then count as "published".
- **Look**: Hallmark deals 3 themes, I mock up the hero in each, and the user (and Lindsay) pick one.
- **Repo**: `psdwizzard/lindsay-morris`, served at `https://psdwizzard.github.io/lindsay-morris/` (the repo has to be public).
- **Contact**: her public email (`Lindzymorris@gmail.com`) appears as a mailto link.
- **From the user (pending)**: a headshot and links to her publications and socials. Until they arrive I leave those slots out. I don't use placeholders and I don't invent anything.

Gotcha: the project folder name starts with a space (`…/Linsday_projects/ L-site`), so quote every path.

## Steps

### 1. Setup
- `npx skills add nutlope/hallmark -g --agent claude-code`, then `npm i -g puppeteer-core` for `sloplint --render` (Chrome is already installed).
- Write the docs scaffolding: `docs/plan.md` (this plan), `docs/progress.md`, `docs/devblog.md` and the project `CLAUDE.md`.

### 2. Extract the content (mechanical work, delegated to gpt-6-astra via `codex-implementation`)
- Pull the text with macOS PDFKit (a Swift one-liner; no poppler or pypdf is needed).
- Write the content to `site/content/*.js` as inlined JS data, so the site still works from `file://`. It holds the bio, credits (8 entries), publications and the 6 works, each with title, genre, logline and body.
- Cleanup:
  - Strip the running page headers and footers: `LINDSAY MORRIS / NARRATIVE WRITING` and `MORRIS • WRITING PORTFOLIO / n`.
  - Rejoin paragraphs that are split across page breaks.
  - Keep curly quotes and em dashes.
- Script formatting for the play (roughly PDF lines 1738 to 4417): character cues, dialogue, stage directions and act or scene headings become structured blocks.
- Verify:
  - Spot-check the opening and closing paragraphs of each piece against the PDF.
  - Word counts should be within about 1% of the source.
  - The extracted text must not contain any leftover header or footer strings.

### 3. Pick the theme
- `theme.mjs deal`, with a prompt built around her voice: a writer's portfolio of dark comedy, theater and speculative fiction.
- Build three static hero mockups: `mockups/<theme>/index.html`, each with her real name, line and work list.
- Open them locally, take screenshots and **stop for the user to choose**.

### 4. Build the site in the chosen theme (inline with the Hallmark skill; Fable/Opus quality)
The site is static HTML/CSS/JS in `site/`. There is no build step and no server, and it opens from `file://`.
- `index.html`:
  - hero (her name; Fiction · Theater · Performance)
  - the selected work: 6 entries with genre and logline, linking to each piece
  - about
  - credits timeline
  - publications
  - contact
  - the site-wide content note
- `works/<slug>.html`, one per piece:
  - long-form reading typography: about 65ch measure, good leading, small-caps scene breaks
  - a reading progress bar
  - estimated reading time
  - a per-piece content note
  - previous and next links
  - the play is formatted as a proper script
- A link to download the original PDF (the file is copied into `site/`).
- Dark default with a light/dark toggle, if the theme supports it. Respect `prefers-reduced-motion`. Pages work at every width from 320px up.
- Meta and OG tags and a favicon. `.nojekyll`.
- When the headshot and links arrive, drop them into the slots in the about section and the contact/publications section.

### 5. Verify
- `sloplint.mjs site --render` at all 8 widths, then fix every Floor and Reflex issue.
- `open site/index.html`, check it from `file://` and click through every work page.
- Review with Claude in Chrome at phone width and desktop width.
- A fresh-context reviewer (Opus) audits design, accessibility and the content's fidelity to the PDF.

### 6. Deploy
- Create a `.gitignore`. `git init` the project folder; the whole folder becomes the repo, with the site living in `site/`.
- `gh repo create psdwizzard/lindsay-morris --public` and push to `main`.
- Turn on Pages from a GitHub Actions workflow that deploys `site/` (`.github/workflows/pages.yml`, the official `actions/deploy-pages`). This keeps the docs and mockups out of the served site.
- Confirm `https://psdwizzard.github.io/lindsay-morris/` loads, and spot-check it on a phone-width viewport.
- Close out by updating the devblog and `CLAUDE.md`. The push itself is delegated to a sonnet subagent, per the user's routine.

## Critical files
- `site/index.html`, `site/works/*.html`, `site/assets/{styles.css,app.js}`, `site/content/*.js`
- `mockups/` (theme choice only; not deployed)
- `.github/workflows/pages.yml`, `CLAUDE.md`, `docs/*.md`
