import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://andronasef.github.io/bezaverse-website',
  base: process.env.NODE_ENV === 'production' ? '/bezaverse-website' : '/',
  output: 'static',
  prefetch: true,
});
