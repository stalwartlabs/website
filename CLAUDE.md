# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

The Stalwart Labs website (https://stalw.art) and its documentation. A single
Astro 6 + Starlight project produces:

- the marketing site (`/`, `/pricing`, `/about`, etc.)
- the documentation (`/docs/...`, current line + archived `/docs/0.15/...`)
- the blog (`/blog`, `/blog/<post>`)
- a sitemap, robots.txt, and curated llms.txt

Stalwart itself (the mail and collaboration server: JMAP, IMAP, POP3, SMTP,
CalDAV, CardDAV, WebDAV; written in Rust) lives in a separate repository.
**This repo is documentation, not the server.**

The repo is published at `stalwartlabs/website` and deploys to **Cloudflare
Pages**. The previous Docusaurus tree is parked at `.old/` (gitignored) and
will be deleted when no longer needed for verification.

## Commands

```sh
npm install                 # install Astro + Starlight + plugins (Node >= 20)
npm run dev                 # dev server with hot reload at http://127.0.0.1:8787
npm run build               # static build to dist/, runs link validation
npm run preview             # serve the built site locally
```

The build is a hard check: `starlight-links-validator` fails the build on any
unresolved internal link, mirroring Docusaurus' `onBrokenLinks: 'throw'`.

## Layout

```
src/
├── content.config.ts       # collection schemas (docs, pages, legal)
├── content/
│   ├── docs/
│   │   ├── docs/           # current docs    -> /docs/...
│   │   ├── docs/0.15/      # archived 0.15   -> /docs/0.15/...   (frozen)
│   │   └── blog/           # blog posts      -> /blog/...
│   ├── pages/*.yml         # marketing pages (typed YAML)
│   └── legal/*.md          # long-form legal pages
├── components/             # marketing + Starlight overrides
├── layouts/                # marketing layouts (Base, LongForm)
├── pages/[...slug].astro   # marketing dynamic route reading content/pages
└── styles/                 # tokens.css, global.css, starlight-overrides.css
public/                     # copied verbatim to dist/ (img, fonts, llms.txt, robots.txt, _headers, _redirects)
astro.config.mjs            # all integration + plugin config
wrangler.toml               # Cloudflare Pages project config
scripts/                    # build-time scripts run by npm: expand-includes.mjs (auto-runs on dev/build) and inject-breadcrumbs.py (manual: rerun after a jmap-schema cargo run)
.scripts/                   # one-off Docusaurus -> Astro migration / cleanup scripts; kept for reference, not part of any pipeline
```

## Plugins (configured in astro.config.mjs)

| Plugin | Purpose |
|---|---|
| `@astrojs/starlight` | The docs/blog framework. Search is Pagefind (built-in, offline, no third-party). |
| `starlight-blog` | `/blog` index, post layout, RSS, tags, reading time. |
| `starlight-links-validator` | Fails build on broken internal links (and anchors, with documented exclusions for the 0.15 archive). |
| `@astrojs/sitemap` | Generates `sitemap-index.xml`, excludes `/tags/**`. |
| `astro-og-canvas` | Generates per-blog-post OG images at `/og/blog/<slug>.png`. |
| `remark-gemoji` | Renders `:emoji_name:` shortcodes (e.g. `:white_check_mark:` -> ✅). |

Sidebar generation is custom (see [src/lib/sidebar.mjs](src/lib/sidebar.mjs)) because `starlight-auto-sidebar` 0.3 returns an empty sidebar against Starlight 0.38. The custom generator walks `src/content/docs/docs/`, reads `_meta.yml` files for per-directory labels/ordering, and reads frontmatter `title` / `sidebar_position` for per-page labels/ordering.

Other notable wiring:

- **Header / Head overrides**: Starlight's defaults are replaced by
  `StarlightHeader.astro` (which composes the marketing `Header.astro` with
  a `<Search />` trigger and `<ThemeToggle />` slotted into the actions
  area) and `StarlightHead.astro` (which injects the per-page `og:image`
  meta tag — per-post for blog, social card otherwise). The Footer is NOT
  overridden: Starlight's per-page Footer (edit on GitHub, last-updated,
  prev/next pagination) sits at the bottom of the docs content area; the
  multi-column marketing footer is only on marketing pages (Base.astro).
- **Header.astro slot pattern**: marketing pages render the default
  right-end actions (GitHub icon, theme toggle, "Get Stalwart" CTA);
  Starlight pages override the `actions` slot with `<Search />` + theme
  toggle. Same component, two consumers.
- **Sidebar**: custom generator in `src/lib/sidebar.mjs` (see Plugins
  table). Top-level `v0.15 (archived)` group is appended automatically
  for any directory matching `\d+\.\d+/` under `src/content/docs/docs/`.
  Auto-generated landing pages (the CardGrid stubs from the migration)
  are detected by their `@astrojs/starlight/components` import and
  excluded from the sidebar; the directory still routes to them.
- **ReadingProgress.astro** is rendered into Starlight pages but only
  activates on actual blog post URLs (`/blog/<slug>`, not `/blog/`, tags,
  authors, or pagination).
- **OG image route**: `src/pages/og/[...slug].ts` enumerates blog posts via
  `getCollection('docs')` and emits PNGs at `/og/blog/<slug>.png` using
  `astro-og-canvas`. Brand colours mirror `src/styles/tokens.css`.
- **Mermaid**: a small inline `remarkMermaid` plugin in `astro.config.mjs`
  rewrites ` ```mermaid ` fences to `<pre class="mermaid">`, then
  `StarlightHeader.astro` imports the `mermaid` package and renders them on
  the client. The script is bundled only on Starlight routes, not marketing.
- **Includes**: shared partials live as sibling `_<name>.md` files (the
  underscore makes Astro skip them as collection entries). Consumer pages
  reference them with `<!-- include:<name> -->...<!-- /include:<name> -->`
  marker pairs; `scripts/expand-includes.mjs` (run via `predev` /
  `prebuild`) inlines the content between the markers. Edit the partial,
  run dev/build, and every consumer picks up the change. **View
  Transitions are NOT enabled** because they leave inline scripts (reveal
  observers, header scroll-state) stale on swap; full page navigations are
  reliable, transitions are easy to add back later if every script is made
  transition-aware.
- **404 page**: `src/pages/404.astro` ships an embedded Pagefind search box,
  so a wrong URL still gives the visitor a way forward.
- **Redirects**: declared in two places. `astro.config.mjs` `redirects`
  works in dev + prod (baked into `dist` as meta-refresh stubs).
  `public/_redirects` mirrors them as proper 301s on Cloudflare Pages.
- **Google Analytics** (`G-NTKTV3G55G`) is injected via Starlight's `head`
  config.

## Versioning

The current docs are v0.16, served at `/docs/...`. The frozen v0.15 snapshot
lives under `src/content/docs/docs/0.15/` and is served at `/docs/0.15/...`.

**Do not edit `0.15/` for normal doc work**: it is an immutable historical
snapshot. The 0.15 archive carries pre-existing broken links and anchors
inherited from Docusaurus that are exempted from validation in
`astro.config.mjs` (the `/docs/0.15/**` URL exclude plus a few specific
anchor URLs the archive references in current docs).

To cut a new archived version (e.g. when v1.0 ships), copy the current docs
into `src/content/docs/docs/<old-version>/`. The custom sidebar generator
will pick it up automatically as a new top-level "v(version) (archived)"
group, no config change needed.

## Doc conventions

- Markdown frontmatter is YAML. Per-page sidebar position is
  `sidebar_position: N` (Docusaurus-style flat key, what the custom
  sidebar generator reads). Per-directory metadata goes in `_meta.yml`
  (`label`, `order`, `collapsed`).
- Required frontmatter on every doc: `title:`. Recommended: `description:`.
- Admonitions: `:::note`, `:::tip`, `:::caution`, `:::danger`. Starlight
  has no `:::info` or `:::warning`; use `:::note` / `:::caution`. **Titled
  forms require brackets**: `:::tip[Enterprise feature]`, NOT
  `:::tip Enterprise feature` (that fails to render as an aside).
- **Custom heading anchors** (`### Heading {#anchor}`) don't work in
  Astro/Starlight; the `{#anchor}` text shows literally. Heading IDs
  come from github-slugger over the heading text, so omit the suffix.
- Internal doc links use absolute Astro paths without `.md`:
  `[Foo](/docs/path/to/page)`. Anchors are `#kebab-case`.
- **Raw `<video>` tags must include `</video>`**: HTML's video element
  is NOT void, so `<video ... />` is treated as an unclosed tag and
  swallows every following sibling as fallback content. Always close it.
- TOML is the standard configuration language shown in code blocks; Shiki
  highlighting is enabled for it by default. The `sieve` language is
  aliased to `text` since Shiki doesn't bundle it.
- Mermaid diagrams use ` ```mermaid ` code fences.
- Emoji shortcodes (e.g. `:white_check_mark:`, `:warning:`) render via
  `remark-gemoji` and become real Unicode glyphs.

### Shared partials (includes)

To share a chunk of prose across multiple pages, create a sibling
`_<name>.md` file (underscore = excluded from the docs collection) and
reference it from each consumer:

```md
<!-- include:setup-wizard -->
   (this region is regenerated from sibling _setup-wizard.md)
<!-- /include:setup-wizard -->
```

`scripts/expand-includes.mjs` runs as `predev` and `prebuild`, walks
ancestors looking for the partial, and replaces what's between the
markers in place. Idempotent; re-run with `npm run includes` (or check
without writing via `npm run check:includes`).

## Blog conventions

- File location determines the URL: `src/content/docs/blog/<slug>.mdx` ->
  `/blog/<slug>`. **Do not** set `slug:` in frontmatter (that was a
  Docusaurus convention; Astro derives slugs from the filename).
- Required frontmatter: `title:`, `date:`. Recommended: `authors:` (keys
  defined in `astro.config.mjs` `starlightBlog.authors`), `tags:`, `excerpt:`.
- Multi-file posts: drop into `src/content/docs/blog/<slug>/index.mdx` and
  put images alongside.

## Deployment (Cloudflare Pages)

The site is fully static. Cloudflare Pages settings:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `20+`

`public/_headers`, `public/_redirects`, and `wrangler.toml` are picked up
automatically. Update `_redirects` whenever a doc URL moves.

## Search and analytics

- **Pagefind**: built into `dist/pagefind/` on every `npm run build`. The
  Starlight default `<Search />` UI in the header uses it; the 404 page also
  uses it. No external service or API key. To switch back to Algolia
  DocSearch, install `@astrojs/starlight-docsearch` and add the plugin entry
  to `astro.config.mjs` (commit `<replaced>` removed it).
- Google Analytics 4: `G-NTKTV3G55G`, injected via Starlight `head`. IP
  anonymisation enabled.
- Sitemap is generated by `@astrojs/sitemap` at `/sitemap-index.xml`. The
  curated machine-readable index for AI agents is `public/llms.txt`; keep it
  in sync when adding or renaming top-level doc sections.

## Legacy artefacts

- `.old/`: the previous Docusaurus tree, including the EJS marketing-page
  builder (`build.js`, `html/*.ejs`). Gitignored. The user will delete it
  when ready.
- `.scripts/`: one-shot Docusaurus -> Astro migration / cleanup scripts
  (`migrate-docs.mjs`, `extract-titles.mjs`, `fix-links.mjs`,
  `strip-blog-slug.mjs`, `promote-overview.mjs`, `fix-docusaurus-md.mjs`,
  `fix-mdx-comments.mjs`, `backfill-meta.mjs`, `count-schema.py`). Kept
  for reference; do
  not re-run on the live tree.

## House style for documentation prose

- **No em dashes** (`-`). Replace with comma, semicolon, colon, parentheses,
  or split into two sentences depending on context.
- **Avoid marketing/AI-speak**: words like *robust*, *seamless(ly)*,
  *leverage*, *empower(s)*, *unlock(s)* (when not the HTTP method),
  *streamline(s)*, *harness*, *delve*, *cutting-edge*, *state-of-the-art*,
  *lightning-fast*, *unparalleled*, *world-class*, *enterprise-grade*,
  *comprehensive* (when puffery), *powerful* (when puffery), *effortlessly*.
  Prefer concrete technical wording: *use*, *allows*, *enables*,
  *simplifies*, *reliable*, *fast*, *flexible*.
- Don't add filler like "By leveraging X, administrators can..." - describe
  the mechanism directly.
- Keep RFC and spec references precise; verify when in doubt.

## Things to verify before recommending a setting or path

- The Stalwart server source itself is **not** in this repo. If tempted to
  assert behaviour of a setting (default value, valid keys, semantics),
  verify against the docs that already exist or ask the user. The docs are
  the spec for users; do not introduce inaccuracies.
- Run `npm run build` after non-trivial doc edits to catch broken links.
