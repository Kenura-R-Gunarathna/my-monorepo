// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable SSR/API routes
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react()],

  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
  },
});
