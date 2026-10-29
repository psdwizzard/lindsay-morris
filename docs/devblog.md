# Dev blog

## 2026-10-29: Lindsay's feedback on the hero
- Headline is now "Lindsay Morris’s portfolio" (was "Five stories and a play", which she felt boxed her in). New byline: "Lindsay Morris is an author, playwright and performer in Richmond, Virginia."
- On phones the title sheet now fills the screen (`min-height: 100svh`), so it no longer stops short with a strip of desk showing.

## 2026-10-29: first build, Manuscript design, deployed to GitHub Pages
- Installed the Hallmark design skill globally and puppeteer-core for its render checks.
- Extracted the 133-page PDF with PDFKit. `tools/extract.mjs` produces structured stories and a script-formatted play. Word counts match the source exactly for all five stories.
- Design rounds:
  - Hallmark dealt Carnival, Almanac and Specimen. Kenneth rejected all three ("make them feel more like something a writer would like").
  - Two custom directions followed: Manuscript and Night Edition. Kenneth picked **Manuscript**.
- Built the full site with `tools/build.mjs`:
  - a five-sheet homepage: title page, contents, about, stage credits, contact
  - six reading pages with a running-head bar and progress line
  - the play set as a script
  - "Night reading" night mode
  - a PDF download
- A fresh-context review caught 9 wrongly attributed play cues, about 50 merged paragraphs and Sushi's section breaks. The extractor was rebuilt on PDF line positions (`tools/pdf2lines.swift`) and the play now matches the PDF word for word.
- The sloplint sweep is clean apart from gates 19 and 58 on her own prose, which is deliberately left verbatim. A fresh-context reviewer also checked the site.
- **Next:** her headshot, publication and social links, and possibly a custom domain later.
