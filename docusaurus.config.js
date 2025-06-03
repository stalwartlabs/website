// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

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
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/stalwartlabs/website/tree/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/stalwartlabs/website/tree/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          changefreq: 'weekly',
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
        copyright: `Copyright © ${new Date().getFullYear()} Stalwart Labs Ltd.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['toml'],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'CMWSXETHDL',

        // Public API key: it is safe to commit it
        apiKey: '7559c539ade0f66d36bf423da6c71e5c',

        indexName: 'stalw',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        //externalUrlRegex: 'external\\.com|domain\\.com',

        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
        /*replaceSearchResultPathname: {
          from: '/docs/', // or as RegExp: /\/docs\//
          to: '/',
        },*/

        // Optional: Algolia search parameters
        searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',

        //... other Algolia params
      },
    }),
};

module.exports = config;
