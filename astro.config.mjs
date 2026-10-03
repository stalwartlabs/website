import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";
import starlightLinksValidator from "starlight-links-validator";
import { visit } from "unist-util-visit";
import remarkGemoji from "remark-gemoji";
import { buildDocsSidebar } from "./src/lib/sidebar.mjs";

// Convert ```mermaid fenced code blocks into <pre class="mermaid"> nodes,
// rendered client-side by the mermaid script injected via Starlight head.
function remarkMermaid() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "mermaid" || !parent || index == null) return;
      parent.children[index] = {
        type: "html",
        value: `<pre class="mermaid">${node.value}</pre>`,
      };
    });
  };
}

export default defineConfig({
  site: "https://stalw.art",
  trailingSlash: "ignore",
  // Astro-level redirects: served in dev (`astro dev`) and built into the
  // static output too, so they work regardless of host. The Cloudflare
  // _redirects file in public/ mirrors these for SEO/external bookmarks.
  // With `trailingSlash: "ignore"` Astro normalises `/docs` and `/docs/`
  // to the same route — declaring both forms triggers a router collision
  // warning, so we list the canonical (no trailing slash) form only.
  redirects: {
    "/docs": "/docs/install/",
    "/docs/install/get-started": "/docs/install/",
    "/docs/management/tasks": "/docs/management/tasks-actions/tasks",
    "/docs/management/actions": "/docs/management/tasks-actions/actions",
    "/docs/applications": "/docs/management/applications/",
    "/docs/applications/update": "/docs/management/applications/update",
  },
  server: {
    host: "127.0.0.1",
    port: 8787,
  },
  devToolbar: {
    enabled: false,
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark-default",
      },
      // Sieve isn't bundled with Shiki; treat it as plain text so highlighting
      // doesn't warn on every page that includes Sieve examples.
      langAlias: { sieve: "text" },
    },
    // remarkGemoji renders Docusaurus/GitHub-style :emoji: shortcodes
    // (e.g. :white_check_mark:) into the actual Unicode glyphs.
    remarkPlugins: [remarkMermaid, remarkGemoji],
  },
  integrations: [
    sitemap({
      // Exclude:
      //  - Starlight tag pages (`/tags/*`)
      //  - blog pagination + tag/author listings (low quality / duplicate)
      filter: (page) =>
        !/\/tags\//.test(page) &&
        !/\/blog\/(?:\d+|tags|authors)\//.test(page),
    }),
    starlight({
      title: "Stalwart",
      logo: {
        src: "./public/favicon.svg",
        alt: "Stalwart",
        replacesTitle: false,
      },
      favicon: "/favicon.svg",
      editLink: {
        baseUrl: "https://github.com/stalwartlabs/website/edit/main/",
      },
      head: [
        // GA4, og:image, twitter:image, RSS link, font preload, JSON-LD,
        // canonical, etc. all live in StarlightHead.astro now so Starlight
        // and marketing pages share one source of truth (Base.astro mirrors
        // the same set for marketing routes that don't go through Starlight).
      ],
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/stalwartlabs" },
      ],
      components: {
        Head: "./src/components/StarlightHead.astro",
        Header: "./src/components/StarlightHeader.astro",
        // Note: we deliberately do NOT override Footer or PageFrame.
        // Starlight's default per-page Footer (edit on GitHub, last
        // updated, prev/next pagination) is what readers want at the
        // bottom of a docs page; the multi-column marketing footer doesn't
        // make sense inside the docs/blog layout, where the fixed sidebar
        // and TOC overlay it. The marketing footer is only on the
        // marketing pages, served by src/layouts/Base.astro.
      },
      pagefind: true,
      disable404Route: true,
      // Sidebar is generated from src/content/docs/docs at config-load time:
      // labels come from per-directory _meta.yml (label, order, collapsed)
      // and per-file Markdown frontmatter (title, sidebar.order). See
      // src/lib/sidebar.mjs.
      sidebar: buildDocsSidebar(),
      customCss: ["./src/styles/starlight-overrides.css"],
      routeMiddleware: undefined,
      pagination: true,
      lastUpdated: true,
      plugins: [
        starlightBlog({
          title: "Stalwart Blog",
          metrics: { readingTime: true, words: false },
          authors: {
            mdecimus: {
              name: "Mauro D.",
              title: "Project Maintainer",
              url: "https://github.com/mdecimus",
              picture: "/img/authors/mdecimus.png",
            },
          },
        }),
        starlightLinksValidator({
          errorOnRelativeLinks: false,
          errorOnInvalidHashes: true,
          exclude: [
            // Marketing + legal pages are served by the custom [...slug].astro
            // route and are not visible to the docs link validator.
            "/legal/**",
            "/contact",
            "http://localhost:8081",
          ],
        }),
      ],
    }),
  ],
});
