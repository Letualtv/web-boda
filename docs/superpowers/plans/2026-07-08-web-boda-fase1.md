# Web de Boda — Fase 1: Save the Date

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la Fase 1 de la web de boda: pantalla de contraseña + Save the Date con cuenta atrás animada, lista para publicar en GitHub Pages.

**Architecture:** Sitio estático con Astro 4. Una página principal (`index.astro`) actúa de puerta de contraseña client-side con `sessionStorage`. Tras autenticarse, el usuario accede a `/boda` donde vive el contenido en scroll único. Las animaciones se gestionan con GSAP 3 + ScrollTrigger. El deploy es automático vía GitHub Actions a GitHub Pages en cada push a `main`.

**Tech Stack:** Astro 4, Tailwind CSS 3, GSAP 3 (+ ScrollTrigger), Google Fonts (Cormorant Garamond + Lato), GitHub Pages, GitHub Actions.

---

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `astro.config.mjs` | Config de Astro: output static, base para GitHub Pages |
| `tailwind.config.mjs` | Paleta de colores personalizada, fuentes, extensiones |
| `package.json` | Dependencias |
| `src/layouts/Layout.astro` | HTML base, `<head>`, Google Fonts, meta SEO, GSAP import |
| `src/pages/index.astro` | Pantalla de contraseña — redirige a `/boda` si OK |
| `src/pages/boda.astro` | Página principal — compone Hero + Countdown + secciones futuras |
| `src/components/PasswordGate.astro` | Overlay de contraseña, lógica JS con `sessionStorage` |
| `src/components/Hero.astro` | Sección hero: nombres, fecha, ilustración |
| `src/components/Countdown.astro` | Cuenta atrás hasta 24/07/2027 con GSAP |
| `src/styles/global.css` | CSS custom properties, reset, clases de utilidad |
| `public/img/.gitkeep` | Placeholder para imágenes |
| `.github/workflows/deploy.yml` | CI/CD: build + deploy a GitHub Pages |

---

## Tarea 1: Inicializar proyecto Astro con Tailwind y GSAP

**Archivos:**
- Crear: `astro.config.mjs`
- Crear: `tailwind.config.mjs`
- Crear: `package.json` (gestionado por npm)
- Crear: `src/env.d.ts`

- [ ] **Paso 1: Crear el proyecto Astro en el directorio actual**

Ejecutar en `C:\xampp\htdocs\web-boda`:

```powershell
npm create astro@latest . -- --template minimal --no-install --no-git
```

Cuando pregunte si inicializar git, responder **No** (ya tenemos repo).

- [ ] **Paso 2: Instalar dependencias base**

```powershell
npm install
```

- [ ] **Paso 3: Añadir integración de Tailwind CSS**

```powershell
npx astro add tailwind --yes
```

Esto crea `tailwind.config.mjs` y modifica `astro.config.mjs` automáticamente.

- [ ] **Paso 4: Instalar GSAP**

```powershell
npm install gsap
```

- [ ] **Paso 5: Verificar que el proyecto arranca**

```powershell
npm run dev
```

Esperado: servidor en `http://localhost:4321` sin errores en consola.

- [ ] **Paso 6: Commit**

```powershell
git add .
git commit -m "chore: init Astro project with Tailwind and GSAP"
```

---

## Tarea 2: Configurar Tailwind con la paleta y fuentes de la boda

**Archivos:**
- Modificar: `tailwind.config.mjs`

- [ ] **Paso 1: Reemplazar el contenido de `tailwind.config.mjs`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        limon:     '#D4C84A',
        azul:      '#2B5F8E',
        marfil:    '#FAF6EE',
        oliva:     '#6B7A3E',
        vino:      '#7A2D3E',
        terracota: '#C4714F',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['Lato', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Paso 2: Verificar que Tailwind reconoce los colores**

Arranca el dev server (`npm run dev`) y en cualquier componente prueba `class="bg-marfil"` — el fondo debe cambiar a marfil. Luego quita la prueba.

- [ ] **Paso 3: Commit**

```powershell
git add tailwind.config.mjs
git commit -m "chore: configure Tailwind palette and fonts for wedding theme"
```

---

## Tarea 3: Layout base y estilos globales

**Archivos:**
- Crear/Modificar: `src/layouts/Layout.astro`
- Crear: `src/styles/global.css`

- [ ] **Paso 1: Crear `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-limon:     #D4C84A;
  --color-azul:      #2B5F8E;
  --color-marfil:    #FAF6EE;
  --color-oliva:     #6B7A3E;
  --color-vino:      #7A2D3E;
  --color-terracota: #C4714F;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-marfil);
  color: #2a2a2a;
  font-family: 'Lato', system-ui, sans-serif;
}

/* Textura sutil de fondo */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23FAF6EE'/%3E%3Crect width='1' height='1' fill='%23F0EBE0' opacity='0.4'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: -1;
}

/* Separador de sección estilo cenefa andaluza */
.separador {
  width: 100%;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    var(--color-limon),
    var(--color-terracota),
    var(--color-limon),
    transparent
  );
  margin: 2rem auto;
  max-width: 400px;
}

/* Clase para animaciones de entrada — GSAP las activa */
.gsap-fade-up {
  opacity: 0;
  transform: translateY(30px);
}
```

- [ ] **Paso 2: Crear `src/layouts/Layout.astro`**

```astro
---
interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'Nuestra Boda · 24·07·2027',
  description = 'Nos casamos el 24 de julio de 2027. Guarda la fecha.',
} = Astro.props;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <!-- Evitar indexación en buscadores -->
    <meta name="robots" content="noindex, nofollow" />
    <title>{title}</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Lato:wght@300;400;700&display=swap"
      rel="stylesheet"
    />

    <!-- Favicon placeholder -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Paso 3: Asegurarse de que `global.css` se importa en el layout**

Añadir en la sección `---` del layout, justo después de las interfaces:

```astro
---
import '../styles/global.css';
// ... resto de props
---
```

- [ ] **Paso 4: Verificar en el dev server**

`npm run dev` → `http://localhost:4321`. El fondo debe ser marfil, sin errores en consola.

- [ ] **Paso 5: Commit**

```powershell
git add src/layouts/Layout.astro src/styles/global.css
git commit -m "feat: add base layout with Google Fonts and global CSS"
```

---

## Tarea 4: Componente PasswordGate (pantalla de contraseña)

**Archivos:**
- Crear: `src/components/PasswordGate.astro`
- Crear/Modificar: `src/pages/index.astro`

- [ ] **Paso 1: Crear `src/components/PasswordGate.astro`**

```astro
---
// La contraseña se define aquí. Cambiarla antes del lanzamiento.
const PASSWORD = 'genilla2027';
// BASE_URL es '/web-boda/' en producción y '/' en dev — necesario para los redirects
const BASE_URL = import.meta.env.BASE_URL;
---

<div
  id="password-gate"
  class="fixed inset-0 z-50 flex items-center justify-center bg-azul"
>
  <!-- Fondo con patrón de azulejo SVG -->
  <div class="absolute inset-0 opacity-10"
    style="background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='none' stroke='%23FAF6EE' stroke-width='0.5'/%3E%3Ccircle cx='20' cy='20' r='8' fill='none' stroke='%23FAF6EE' stroke-width='0.5'/%3E%3C/svg%3E\"); background-size: 40px 40px;">
  </div>

  <div class="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
    <!-- Iniciales / logo -->
    <div class="font-serif text-limon">
      <p class="text-6xl font-light tracking-widest">A &amp; M</p>
      <p class="mt-2 text-sm font-sans font-light tracking-[0.3em] text-white/60 uppercase">
        24 · Julio · 2027
      </p>
    </div>

    <div class="separador"></div>

    <!-- Formulario -->
    <form id="password-form" class="flex flex-col items-center gap-4 w-full max-w-xs">
      <label for="pwd" class="font-sans text-white/80 text-sm tracking-widest uppercase">
        Contraseña
      </label>
      <input
        id="pwd"
        type="password"
        autocomplete="current-password"
        class="w-full px-4 py-3 bg-white/10 border border-white/30 rounded text-white text-center font-sans tracking-widest placeholder-white/30 focus:outline-none focus:border-limon transition-colors"
        placeholder="········"
      />
      <p id="pwd-error" class="text-vino text-sm hidden">Contraseña incorrecta</p>
      <button
        type="submit"
        class="w-full py-3 bg-limon text-azul font-sans font-bold tracking-widest uppercase text-sm rounded hover:bg-yellow-300 transition-colors"
      >
        Entrar
      </button>
    </form>
  </div>
</div>

<script define:vars={{ PASSWORD, BASE_URL }}>
  const STORAGE_KEY = 'boda_auth';
  // BASE_URL termina en '/', boda queda como BASE_URL + 'boda/'
  const BODA_URL = BASE_URL + 'boda/';

  // Si ya está autenticado, redirigir directamente
  if (sessionStorage.getItem(STORAGE_KEY) === 'ok') {
    window.location.replace(BODA_URL);
  }

  document.getElementById('password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('pwd').value.trim().toLowerCase();
    const errorEl = document.getElementById('pwd-error');

    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'ok');
      window.location.replace(BODA_URL);
    } else {
      errorEl.classList.remove('hidden');
      document.getElementById('pwd').value = '';
      document.getElementById('pwd').focus();
    }
  });
</script>
```

> **Nota:** Cambia `'genilla2027'` por la contraseña real antes de publicar. Las iniciales `A & M` también deben actualizarse con los nombres reales.

- [ ] **Paso 2: Crear `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import PasswordGate from '../components/PasswordGate.astro';
---

<Layout title="Nuestra Boda · Acceso privado">
  <PasswordGate />
</Layout>
```

- [ ] **Paso 3: Verificar en el navegador**

`npm run dev` → `http://localhost:4321`. Debe aparecer la pantalla de contraseña azul. Prueba con contraseña incorrecta (aparece error) y con `genilla2027` (redirige a `/boda`, que aún no existe — error 404 es esperado aquí).

- [ ] **Paso 4: Commit**

```powershell
git add src/components/PasswordGate.astro src/pages/index.astro
git commit -m "feat: add client-side password gate with sessionStorage"
```

---

## Tarea 5: Componente Countdown (cuenta atrás)

**Archivos:**
- Crear: `src/components/Countdown.astro`

- [ ] **Paso 1: Crear `src/components/Countdown.astro`**

```astro
---
// Fecha objetivo: 24 de julio de 2027, 12:00h (ajustar hora real si se sabe)
const WEDDING_DATE = '2027-07-24T12:00:00';
---

<section class="py-16 flex flex-col items-center gap-8">
  <p class="font-sans text-xs tracking-[0.4em] uppercase text-azul/60">Quedan</p>

  <div id="countdown" class="flex gap-6 md:gap-12 text-center">
    {[
      { id: 'dias',    label: 'días' },
      { id: 'horas',   label: 'horas' },
      { id: 'minutos', label: 'minutos' },
      { id: 'segundos',label: 'segundos' },
    ].map(({ id, label }) => (
      <div class="flex flex-col items-center gap-1">
        <span
          id={id}
          class="gsap-fade-up font-serif text-5xl md:text-7xl font-light text-azul tabular-nums"
        >
          00
        </span>
        <span class="font-sans text-xs tracking-widest uppercase text-azul/50">
          {label}
        </span>
      </div>
    ))}
  </div>
</section>

<script define:vars={{ WEDDING_DATE }}>
  const target = new Date(WEDDING_DATE).getTime();

  function pad(n) {
    return String(Math.floor(n)).padStart(2, '0');
  }

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      document.getElementById('dias').textContent    = '00';
      document.getElementById('horas').textContent   = '00';
      document.getElementById('minutos').textContent = '00';
      document.getElementById('segundos').textContent = '00';
      return;
    }

    const days    = diff / (1000 * 60 * 60 * 24);
    const hours   = (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
    const minutes = (diff % (1000 * 60 * 60)) / (1000 * 60);
    const seconds = (diff % (1000 * 60)) / 1000;

    document.getElementById('dias').textContent     = pad(days);
    document.getElementById('horas').textContent    = pad(hours);
    document.getElementById('minutos').textContent  = pad(minutes);
    document.getElementById('segundos').textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
</script>
```

- [ ] **Paso 2: Verificar que los números cambian cada segundo**

El countdown debe mostrar valores correctos y el segundo debe decrementar en tiempo real.

- [ ] **Paso 3: Commit**

```powershell
git add src/components/Countdown.astro
git commit -m "feat: add live countdown to wedding date 24/07/2027"
```

---

## Tarea 6: Componente Hero y página principal `/boda`

**Archivos:**
- Crear: `src/components/Hero.astro`
- Crear: `src/pages/boda.astro`
- Crear: `public/favicon.svg`
- Crear: `public/img/.gitkeep`

- [ ] **Paso 1: Crear `public/favicon.svg`** (placeholder hasta tener logo real)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#2B5F8E" rx="4"/>
  <text x="16" y="22" font-family="serif" font-size="18" fill="#D4C84A" text-anchor="middle">B</text>
</svg>
```

- [ ] **Paso 2: Crear `public/img/.gitkeep`**

```powershell
New-Item -ItemType File -Path "public/img/.gitkeep" -Force
```

- [ ] **Paso 3: Crear `src/components/Hero.astro`**

```astro
---
import Countdown from './Countdown.astro';
---

<!-- Hero principal: nombres + fecha + cuenta atrás -->
<section
  id="inicio"
  class="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden"
>
  <!-- Decoración: rama de olivo SVG (esquinas) -->
  <svg
    class="absolute top-0 left-0 w-48 md:w-64 opacity-20 -rotate-12"
    viewBox="0 0 200 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M100 280 C100 280 80 200 60 160 C40 120 20 100 30 60 C40 20 80 10 100 10" stroke="#6B7A3E" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="55" cy="90" rx="18" ry="10" fill="#6B7A3E" transform="rotate(-30 55 90)"/>
    <ellipse cx="40" cy="130" rx="18" ry="10" fill="#6B7A3E" transform="rotate(-45 40 130)"/>
    <ellipse cx="70" cy="160" rx="16" ry="9" fill="#6B7A3E" transform="rotate(-20 70 160)"/>
    <ellipse cx="55" cy="200" rx="15" ry="8" fill="#6B7A3E" transform="rotate(-35 55 200)"/>
  </svg>

  <svg
    class="absolute top-0 right-0 w-48 md:w-64 opacity-20 rotate-12 scale-x-[-1]"
    viewBox="0 0 200 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M100 280 C100 280 80 200 60 160 C40 120 20 100 30 60 C40 20 80 10 100 10" stroke="#6B7A3E" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="55" cy="90" rx="18" ry="10" fill="#6B7A3E" transform="rotate(-30 55 90)"/>
    <ellipse cx="40" cy="130" rx="18" ry="10" fill="#6B7A3E" transform="rotate(-45 40 130)"/>
    <ellipse cx="70" cy="160" rx="16" ry="9" fill="#6B7A3E" transform="rotate(-20 70 160)"/>
    <ellipse cx="55" cy="200" rx="15" ry="8" fill="#6B7A3E" transform="rotate(-35 55 200)"/>
  </svg>

  <!-- Contenido principal -->
  <div class="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
    <!-- Subtítulo superior -->
    <p id="hero-pre" class="gsap-fade-up font-sans text-xs tracking-[0.4em] uppercase text-azul/60">
      Guarda la fecha
    </p>

    <!-- Nombres -->
    <h1 id="hero-names" class="gsap-fade-up font-serif font-light text-azul leading-tight">
      <span class="text-5xl md:text-8xl">Antonio</span>
      <span class="block text-limon text-3xl md:text-5xl my-2">&amp;</span>
      <span class="text-5xl md:text-8xl">María</span>
      <!-- ↑ Cambiar "María" por el nombre real -->
    </h1>

    <!-- Fecha -->
    <p id="hero-date" class="gsap-fade-up font-serif text-2xl md:text-4xl font-light text-azul/70 tracking-widest">
      24 · 07 · 2027
    </p>

    <div class="separador w-full max-w-sm"></div>

    <!-- Lugar -->
    <p id="hero-location" class="gsap-fade-up font-sans text-sm tracking-[0.2em] uppercase text-azul/50">
      Finca Genilla · Priego de Córdoba
    </p>

    <!-- Cuenta atrás -->
    <div id="hero-countdown" class="gsap-fade-up w-full">
      <Countdown />
    </div>
  </div>
</section>

<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  // Animación de entrada en secuencia al cargar la página
  gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } })
    .to('#hero-pre',       { opacity: 1, y: 0, delay: 0.3 })
    .to('#hero-names',     { opacity: 1, y: 0 }, '-=0.5')
    .to('#hero-date',      { opacity: 1, y: 0 }, '-=0.5')
    .to('#hero-location',  { opacity: 1, y: 0 }, '-=0.5')
    .to('#hero-countdown', { opacity: 1, y: 0 }, '-=0.4');

  // Animaciones de scroll para elementos con clase gsap-fade-up que no son del hero
  gsap.utils.toArray('.gsap-fade-up:not(#hero-pre):not(#hero-names):not(#hero-date):not(#hero-location):not(#hero-countdown)').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
    });
  });
</script>
```

- [ ] **Paso 4: Crear `src/pages/boda.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';

// Guardia: si no está autenticado, redirigir al gate
// (protección server-side mínima — la real es client-side en PasswordGate)
---

<Layout>
  <!-- Guardia client-side: si sessionStorage no tiene el flag, volver al inicio -->
  <script>
    if (sessionStorage.getItem('boda_auth') !== 'ok') {
      window.location.replace(import.meta.env.BASE_URL);
    }
  </script>

  <main>
    <Hero />
    <!-- Las siguientes secciones se añadirán en fases posteriores -->
  </main>
</Layout>
```

- [ ] **Paso 5: Verificar la página completa**

`npm run dev` → entrar con contraseña `genilla2027` → debe mostrar el hero con nombres, fecha, ramas de olivo SVG y la cuenta atrás funcionando. Las animaciones de entrada deben ejecutarse al cargar.

- [ ] **Paso 6: Verificar la guardia de autenticación**

Borrar el flag de sessionStorage en las DevTools del navegador (`Application > Session Storage > borrar boda_auth`) y recargar `/boda` — debe redirigir a `/`.

- [ ] **Paso 7: Commit**

```powershell
git add src/components/Hero.astro src/pages/boda.astro public/favicon.svg public/img/.gitkeep
git commit -m "feat: add Hero section with GSAP animations and olive branch decoration"
```

---

## Tarea 7: Configurar Astro para GitHub Pages

**Archivos:**
- Modificar: `astro.config.mjs`

- [ ] **Paso 1: Actualizar `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
  // Cambiar 'web-boda' si el nombre del repo de GitHub es diferente
  base: '/web-boda/',
  // Cambiar por el usuario real de GitHub
  site: 'https://letualtv.github.io',
});
```

> **Nota:** `base` debe coincidir exactamente con el nombre del repositorio en GitHub. Si el repo se llama `web-boda`, `base` es `/web-boda/`. Si se usa un dominio personalizado en el futuro, `base` pasa a ser `/`.

- [ ] **Paso 2: Verificar el build**

```powershell
npm run build
```

Esperado: carpeta `dist/` generada sin errores.

- [ ] **Paso 3: Previsualizar el build localmente**

```powershell
npm run preview
```

Abrir `http://localhost:4321/web-boda/` — debe funcionar igual que el dev server.

- [ ] **Paso 4: Commit**

```powershell
git add astro.config.mjs
git commit -m "chore: configure Astro for GitHub Pages deployment"
```

---

## Tarea 8: GitHub Actions — Deploy automático

**Archivos:**
- Crear: `.github/workflows/deploy.yml`

- [ ] **Paso 1: Crear la carpeta y el workflow**

```powershell
New-Item -ItemType Directory -Force -Path ".github/workflows"
```

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Paso 2: Crear el repositorio en GitHub (si no existe)**

Ir a `https://github.com/new` y crear un repositorio con el nombre exacto `web-boda` (privado, para mantener la privacidad del contenido aunque la web tenga contraseña).

- [ ] **Paso 3: Añadir el remoto y hacer push**

```powershell
git remote add origin https://github.com/Letualtv/web-boda.git
git push -u origin main
```

- [ ] **Paso 4: Activar GitHub Pages en el repositorio**

En GitHub: `Settings > Pages > Source > GitHub Actions`. Guardar.

- [ ] **Paso 5: Verificar el deploy**

En la pestaña `Actions` del repositorio, comprobar que el workflow `Deploy to GitHub Pages` se ejecuta sin errores. La URL final será:

```
https://letualtv.github.io/web-boda/
```

- [ ] **Paso 6: Commit del workflow**

```powershell
git add .github/workflows/deploy.yml
git commit -m "chore: add GitHub Actions workflow for GitHub Pages deploy"
git push
```

---

## Notas para fases futuras

- **Nombre real de la novia:** Actualizar `A & M` en `PasswordGate.astro` y `Antonio & María` en `Hero.astro`.
- **Contraseña real:** Cambiar `genilla2027` en `PasswordGate.astro` antes del lanzamiento.
- **Foto de los novios:** Añadir en `public/img/` y referenciar en `Hero.astro` (hay un espacio reservado).
- **Dominio personalizado:** Si se compra un dominio, añadir `CNAME` en `public/` y actualizar `astro.config.mjs`.
- **Fases 2 y 3:** Cada nueva sección es un componente nuevo en `src/components/` importado en `boda.astro`. El separador `.separador` de `global.css` separa visualmente las secciones.
