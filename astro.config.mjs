// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import tailwindcss from '@tailwindcss/vite';

import vue from '@astrojs/vue';

import netlify from '@astrojs/netlify';

import sitemap from '@astrojs/sitemap';

// astro.config.mjs runs in plain Node, so `.env` must be loaded explicitly
// (unlike app code, where Vite/Astro inject `import.meta.env` automatically).
const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

if (!PUBLIC_SITE_URL) {
  throw new Error(
    'PUBLIC_SITE_URL is not set. Copy .env.example to .env and fill it in — ' +
      'it is required for canonical URLs, the sitemap, and RSS feed.',
  );
}

// https://astro.build/config
export default defineConfig({
  site: PUBLIC_SITE_URL,

  image: {
    // Notion stores files (cover images, in-body images) in temporary AWS S3 URLs.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [vue(), sitemap()],
  adapter: netlify(),
});
