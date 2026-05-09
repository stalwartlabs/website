# Stalwart conference slides

A Slidev deck used for technical conference talks about Stalwart. The
build output goes into the website's `public/slides/` directory, so the
deployed deck is served at `https://stalw.art/slides/`.

## Develop

```sh
cd slides
npm install
npm run dev          # opens http://localhost:3030
```

Slidev's dev server hot-reloads the deck on file save. Speaker notes,
presenter mode and overview navigation are accessible from the toolbar.

Screenshots are stored in `../public/images/slides/` (Astro's public
folder). A symlink at `slides/public/images` points at them so the
Slidev dev server can serve them under `/images/...` while developing.

## Build

```sh
npm run build        # writes ../public/slides/
```

The build runs with `--base /slides/`, so the bundled JS, CSS and chunks
resolve under that path. Screenshot URLs in the deck are absolute
(`/images/slides/...`) and are served by Astro from the website's
`public/images/slides/` directory after deploy. The slides ship as part
of the Cloudflare Pages deployment alongside the rest of the site.

## Export to PDF

```sh
npm run export       # writes slides-export.pdf
```

## Layout

```
slides.md                 # the deck source
components/               # custom Vue components (diagrams, frames)
styles/                   # tokens.css mirror, slidev style overrides
public/images -> ../../public/images   # symlink for dev-time screenshots
```
