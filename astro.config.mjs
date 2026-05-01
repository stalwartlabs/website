import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://stalw.art',
  server: {
    host: '127.0.0.1',
    port: 8787,
  },
  devToolbar: {
    enabled: false,
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-default',
      },
    },
  },
});
