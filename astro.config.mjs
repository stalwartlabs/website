import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";
import starlightLinksValidator from "starlight-links-validator";
import { visit } from "unist-util-visit";
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

const GTAG_ID = "G-NTKTV3G55G";

export default defineConfig({
  site: "https://stalw.art",
  trailingSlash: "ignore",
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
    remarkPlugins: [remarkMermaid],
  },
  vite: {
    build: {
      rollupOptions: {
        // Pagefind's runtime is generated into dist/pagefind/ during the build
        // by Starlight, so it can't be resolved at compile time.
        external: [/^\/pagefind\/.*/],
      },
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/tags/"),
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
        {
          tag: "script",
          attrs: {
            async: true,
            src: `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`,
          },
        },
        {
          tag: "script",
          content: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GTAG_ID}', { anonymize_ip: true });
          `.trim(),
        },
        // og:image is injected per-page by StarlightHead.astro: blog posts
        // get their generated /og/blog/<slug>.png; everything else gets the
        // shared stalwart-social-card.jpg.
      ],
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/stalwartlabs" },
      ],
      components: {
        Head: "./src/components/StarlightHead.astro",
        Header: "./src/components/StarlightHeader.astro",
        Sidebar: "./src/components/StarlightSidebar.astro",
        // Wrap the layout shell so the marketing footer renders full-width
        // below the docs content, while Starlight's per-page Footer (edit
        // link, last-updated, prev/next) stays inside the content area.
        PageFrame: "./src/components/StarlightPageFrame.astro",
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
              picture: "https://github.com/mdecimus.png",
            },
          },
        }),
        starlightLinksValidator({
          errorOnRelativeLinks: false,
          errorOnInvalidHashes: false,
          exclude: [
            // Archived 0.15 snapshot has pre-existing broken cross-links
            // inherited from the original Docusaurus version; do not block
            // builds on legacy content.
            "/docs/0.15/**",
            // Marketing + legal pages are served by the custom [...slug].astro
            // route and are not visible to the docs link validator.
            "/legal/**",
            "/contact",
          ],
        }),
      ],
    }),
  ],
});
