// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMermaid from './src/plugins/remark-mermaid.mjs';

export default defineConfig({
  site: 'https://southern-light.dev',
  output: 'static',
  trailingSlash: 'never',
  markdown: {
    remarkPlugins: [remarkMermaid],
    // Nord: arctic frost palette (cool blues/teals/greens) — matches the
    // aurora / ice-ocean identity better than the default warm github-dark.
    shikiConfig: { theme: 'nord' },
  },
  integrations: [mdx(), sitemap()],
  build: {
    format: 'directory',
  },
});
