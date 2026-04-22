// @ts-check

import { themes as prismThemes } from 'prism-react-renderer';

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
