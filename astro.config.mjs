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
    // v1.0 documentation reorganisation (.ignore/v1/20-reorganisation.md).
    "/docs/install/performance": "/docs/performance/",
    "/docs/server/cache": "/docs/performance/caching",
    "/docs/spamfilter/llm": "/docs/spamfilter/ai/",
    "/docs/auth/principals": "/docs/auth/accounts/",
    "/docs/auth/principals/individual": "/docs/auth/accounts/user",
    "/docs/auth/principals/group": "/docs/auth/accounts/group",
    "/docs/auth/oauth/oauth-client": "/docs/auth/oauth/clients",
    "/docs/auth/oauth/client-registration": "/docs/auth/oauth/register-client",
    "/docs/auth/oauth/flows": "/docs/auth/oauth/authorization",
    "/docs/auth/oauth/interoperability": "/docs/auth/oauth/mail-clients",
    "/docs/auth/openid": "/docs/auth/oauth/openid-connect",
    "/docs/auth/openid/provider": "/docs/auth/oauth/openid-connect#signing",
    "/docs/auth/openid/id-tokens": "/docs/auth/oauth/openid-connect#id-tokens",
    "/docs/auth/openid/endpoints": "/docs/auth/oauth/endpoints",
    "/docs/http/security": "/docs/http/settings#security",
    "/docs/http/ratelimit": "/docs/http/settings#rate-limiting",
    "/docs/development/api": "/docs/http/api",
    "/docs/mta/filter/spam": "/docs/mta/filter/",
    "/docs/mta/filter/sieve": "/docs/mta/filter/",
    "/docs/mta/outbound": "/docs/mta/outbound/strategy",
    "/docs/sieve/interpreter": "/docs/sieve/#two-interpreters",
    "/docs/sieve/jmap": "/docs/sieve/user-scripts#jmap-for-sieve",
    "/docs/sieve/managesieve": "/docs/sieve/user-scripts#managesieve",
    "/docs/spamfilter/dmarc": "/docs/spamfilter/settings/scores#authentication-tags",
    "/docs/spamfilter/settings/domain_lists": "/docs/spamfilter/settings/domain-lists",
    "/docs/spamfilter/settings/mime_types": "/docs/spamfilter/settings/mime-types",
    "/docs/storage/backends/composite/sharded-blob": "/docs/storage/backends/composite#sharded-blob-store",
    "/docs/storage/backends/composite/sharded-in-memory": "/docs/storage/backends/composite#sharded-in-memory-store",
    "/docs/storage/backends/composite/sql-replica": "/docs/storage/backends/composite#sql-read-replicas",
    "/docs/storage/lookup": "/docs/configuration/expressions/lookup/",
    "/docs/storage/lookup/local": "/docs/configuration/expressions/lookup/local",
    "/docs/storage/lookup/remote": "/docs/configuration/expressions/lookup/remote",
    "/docs/cluster/deployment/topology": "/docs/cluster/configuration/roles#planning-node-roles",
    "/docs/cluster/orchestration/apache-mesos": "/docs/cluster/orchestration/",
    "/docs/telemetry/tracing/console": "/docs/telemetry/tracing/tracers#console",
    "/docs/telemetry/tracing/log": "/docs/telemetry/tracing/tracers#log-file",
    "/docs/telemetry/tracing/journal": "/docs/telemetry/tracing/tracers#journal",
    "/docs/migration/guide/configure-source/stalwart-old": "/docs/migration/guide/configure-source/previous-stalwart",
    "/docs/migration/proxy/examples/stalwart-upgrade": "/docs/migration/proxy/examples/stalwart",
    "/docs/migration/proxy/examples": "/docs/migration/proxy/#examples",
    "/docs/migration/proxy/mappings/file": "/docs/migration/proxy/mappings/#file-source",
    "/docs/migration/proxy/mappings/redis": "/docs/migration/proxy/mappings/#redis-source",
    "/docs/migration/proxy/mappings/sql": "/docs/migration/proxy/mappings/#sql-source",
    "/docs/migration/proxy/routing/pop3": "/docs/migration/proxy/routing/imap#pop3",
    "/docs/migration/proxy/routing/managesieve": "/docs/migration/proxy/routing/imap#managesieve",
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
