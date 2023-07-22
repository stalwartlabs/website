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
          src: 'img/logo.png',
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
                label: 'All-in-one Server',
                to: '/docs/get-started',
              },
              {
                label: 'JMAP Server',
                to: '/docs/jmap/overview',
              },
              {
                label: 'IMAP Server',
                to: '/docs/imap/overview',
              },
              {
                label: 'SMTP Server',
                to: '/docs/smtp/overview',
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
                href: 'https://discord.gg/aVQr3jF8jd',
              },
              {
                label: 'Mastodon',
                href: 'https://mastodon.social/@stalwartlabs',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/stalwartlabs',
              },
              {
                label: 'Threads',
                href: 'https://www.threads.net/@stalwartlabs',
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
    }),
};

module.exports = config;
