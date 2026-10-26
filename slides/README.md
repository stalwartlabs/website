# Stalwart conference slides

A Slidev deck used for technical conference talks about Stalwart.

Two output targets:

- **Online deploy** (`npm run build`) writes to `../public/slides/`, served by
  the website at `https://stalw.art/slides/`.
- **Self-contained offline bundle** (`npm run build:offline`) writes to
  `dist-offline/`, with relative asset paths and zero external requests
  (fonts, favicon, scripts all bundled). Zip the directory and open
  `index.html` from any folder, even on a machine with no internet.

## Develop

```sh
cd slides
npm install
npm run dev          # opens http://localhost:3030
```

Slidev's dev server hot-reloads the deck on file save. Speaker notes,
presenter mode and overview navigation are accessible from the toolbar.

Screenshots live in `../public/images/slides/` (Astro's public folder).
A symlink at `slides/public/images` points at them so the Slidev dev
server serves them under `/images/...` while developing.

## Build for the live website

```sh
npm run build        # writes ../public/slides/
```

The build runs with `--base /slides/`. Screenshot URLs in the deck are
absolute (`/images/slides/...`) and are served by Astro from the
website's `public/images/slides/` directory after deploy. The slides
ship as part of the Cloudflare Pages deployment alongside the rest of
the site.

The `prebuild` hook empties `../public/slides/` before each build, so
old hashed bundles do not accumulate. Vite's default `emptyOutDir`
only kicks in for output paths inside the project root; ours is
outside, hence the explicit clean step.

## Build a self-contained offline bundle

```sh
npm run build:offline       # writes ./dist-offline/
zip -r stalwart-slides.zip dist-offline
```

To view it on the offline machine, unzip and run:

- macOS / Linux: `./serve.sh`
- Windows: double-click `serve.bat`

then open `http://localhost:8000` in a browser. Both helpers use
Python's built-in `http.server`, which ships with recent macOS, Linux
and Windows. A `README.txt` next to the index file repeats these
instructions for the recipient.

Why a local web server, and not just `index.html`? Browsers refuse to
load JavaScript modules from `file://` URLs for security reasons (it
would otherwise let any HTML file silently read other files on disk),
so the bundle has to be served over HTTP, even locally.

The offline build runs with `--base ./` so every Slidev-managed URL is
relative to `index.html`. A post-build step
([scripts/finalize-offline.mjs](scripts/finalize-offline.mjs)) does
three things:

1. Rewrites the absolute screenshot URLs (`"/images/slides/..."`) into
   relative ones (`"./images/slides/..."`). The deck source uses
   absolute paths so the live site can serve them via Astro at the URL
   root, but absolute paths would break in the offline bundle. The
   online build at `/slides` is unaffected and continues to use the
   absolute form.
2. Writes `serve.sh` and `serve.bat` next to `index.html`.
3. Writes a short `README.txt` for the recipient.

The bundle includes:

- All Slidev runtime JS/CSS (no CDN imports).
- Inter and JetBrains Mono fonts via `@fontsource-variable` (Slidev's
  `fonts.provider: none` disables the Google Fonts CDN that would
  otherwise be inlined into `<head>`).
- The Stalwart favicon at `dist-offline/favicon.svg`.
- All slide screenshots in `dist-offline/images/slides/`, sourced
  through the narrow symlink at `slides/public/images/slides/` so only
  the deck-relevant captures get bundled (about 19 MB), not the entire
  website image library.

Open `dist-offline/index.html` directly in a browser. The deck runs
end-to-end with no internet connection.

## Export to PDF

```sh
npm run export       # writes slides-export.pdf
```

## Wipe build artefacts

```sh
npm run clean        # removes ../public/slides and dist-offline
```

## Layout

```
slides.md                              # the deck source
style.css                              # Slidev-auto-loaded global styles
styles/tokens.css                      # website token mirror (brand, surfaces, type)
components/                            # custom Vue components (diagrams, frames)
public/favicon.svg                     # bundled favicon (mirrors website)
public/images -> ../../public/images   # symlink for dev-time screenshots
```
