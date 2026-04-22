// @ts-check

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { themes as prismThemes } from 'prism-react-renderer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^-?\d+$/.test(v)) v = Number(v);
    else v = v.replace(/^["'](.*)["']$/, '$1');
    out[kv[1]] = v;
  }
  return out;
}

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
  catch { return null; }
}

function listDirEntries(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isFile() && /\.mdx?$/.test(e.name)) {
      const name = e.name.replace(/\.mdx?$/, '');
      if (name.startsWith('_')) continue;
      const fm = parseFrontmatter(fs.readFileSync(path.join(dir, e.name), 'utf-8'));
      out.push({
        kind: 'doc',
        name,
        position: typeof fm.sidebar_position === 'number'
          ? fm.sidebar_position
          : Number.POSITIVE_INFINITY,
      });
    } else if (e.isDirectory()) {
      const cat = readJsonSafe(path.join(dir, e.name, '_category_.json'));
      out.push({
        kind: 'dir',
        name: e.name,
        position: cat && typeof cat.position === 'number'
          ? cat.position
          : Number.POSITIVE_INFINITY,
      });
    }
  }
  out.sort((a, b) => (a.position - b.position) || a.name.localeCompare(b.name));
  return out;
}

function firstDocPath(dir) {
  for (const e of listDirEntries(dir)) {
    if (e.kind === 'doc') return e.name;
    const sub = firstDocPath(path.join(dir, e.name));
    if (sub) return `${e.name}/${sub}`;
  }
  return null;
}

function hasDirIndex(dir) {
  return fs.readdirSync(dir).some(n => /^(index|readme)\.mdx?$/i.test(n));
}

function buildDirRedirects(rootDir, urlPrefix) {
  const out = [];
  function walk(dir, urlDir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const sub = path.join(dir, e.name);
      const subUrl = `${urlDir}/${e.name}`;
      if (!hasDirIndex(sub)) {
        const first = firstDocPath(sub);
        if (first) out.push({ from: subUrl, to: `${subUrl}/${first}` });
      }
      walk(sub, subUrl);
    }
  }
  walk(rootDir, urlPrefix);
  return out;
}

const docsRoot = path.join(__dirname, 'docs');
const v015Root = path.join(__dirname, 'versioned_docs', 'version-0.15');
const directoryRedirects = [
  ...buildDirRedirects(docsRoot, '/docs'),
  ...(fs.existsSync(v015Root) ? buildDirRedirects(v015Root, '/docs/0.15') : []),
];

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Stalwart Labs',
  tagline: 'Modernize your email server',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://stalw.art',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'stalwartlabs', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],
  plugins: [
    '@docsearch/docusaurus-adapter',
    [
      '@docusaurus/plugin-client-redirects',
      { redirects: directoryRedirects },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/stalwartlabs/website/tree/main/',
          lastVersion: 'current',
          versions: {
            current: {
              label: '0.16',
              path: '',
            },
            '0.15': {
              label: '0.15',
              path: '0.15',
            },
          },
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/stalwartlabs/website/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        gtag: {
          trackingID: 'G-NTKTV3G55G',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/stalwart-social-card.jpg',
      navbar: {
        title: 'Stalwart',
        logo: {
          alt: 'Stalwart Labs',
          src: 'img/logo.svg',
          href: 'https://stalw.art',
          target: '_self',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          { to: '/blog', label: 'Blog', position: 'right' },
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownActiveClassDisabled: true,
          },
          {
            href: 'https://github.com/stalwartlabs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/install/get-started',
              },
              {
                label: 'Email Store',
                to: '/docs/email/overview',
              },
              {
                label: 'MTA',
                to: '/docs/mta/overview',
              },
              {
                label: 'Collaboration',
                to: '/docs/collaboration/overview',
              },
              {
                label: 'Spam Filter',
                to: '/docs/spamfilter/overview',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Github Discussions',
                href: 'https://github.com/stalwartlabs/mail-server/discussions',
              },
              {
                label: 'Reddit',
                href: 'https://www.reddit.com/r/stalwartlabs',
              },
              {
                label: 'Discord',
                href: 'https://discord.com/servers/stalwart-923615863037390889',
              },
              {
                label: 'Mastodon',
                href: 'https://mastodon.social/@stalwartlabs',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/stalwartlabs',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/stalwartlabs',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Stalwart Labs LLC`,
      },
      prism: {
        theme: prismThemes.dracula,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['toml'],
      },
      docsearch: {
        appId: 'CMWSXETHDL',
        apiKey: '7559c539ade0f66d36bf423da6c71e5c',
        indexName: 'stalw',
        contextualSearch: true,
        searchParameters: {},
        searchPagePath: 'search',
        /*askAi: {
          assistantId: 'YOUR_ASSISTANT_ID',
          sidePanel: true,
        },*/
      },
    }),
};

export default config;
