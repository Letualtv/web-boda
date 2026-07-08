// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  // En dev: base '/' para acceder en localhost:4321 sin prefijo
  // En producción (GitHub Pages): '/web-boda/'
  base: isProd ? '/web-boda/' : '/',
  site: 'https://letualtv.github.io',
});