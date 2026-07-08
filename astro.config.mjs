// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  // Debe coincidir con el nombre exacto del repositorio en GitHub
  base: '/web-boda/',
  // Cambiar por el usuario real de GitHub si es diferente
  site: 'https://letualtv.github.io',
});