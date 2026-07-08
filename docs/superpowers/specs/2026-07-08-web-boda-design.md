# Diseño: Web de Boda — Antonio & [Novia]

**Fecha:** 2026-07-08  
**Boda:** 24 de julio de 2027  
**Lugar:** Finca Genilla, Priego de Córdoba  
**Estado:** Aprobado

---

## 1. Objetivo

Sitio web privado para la boda, accesible solo por invitados mediante contraseña única. Se construye en fases: primero el Save the Date, luego el resto de secciones antes de la boda, y la galería de fotos tras ella.

---

## 2. Stack técnico

| Herramienta | Versión | Uso |
|---|---|---|
| Astro | 4.x | Framework, genera HTML estático |
| Tailwind CSS | 3.x | Estilos |
| GSAP | 3.x | Animaciones (entradas, parallax, countdown) |
| GitHub Pages | — | Hosting gratuito |
| GitHub Actions | — | Deploy automático en push a `main` |

**Sin backend.** Todo es estático. La protección por contraseña es client-side con `sessionStorage`.

---

## 3. Estructura de proyecto

```
web-boda/
├── src/
│   ├── pages/
│   │   ├── index.astro          ← pantalla de contraseña
│   │   └── boda.astro           ← contenido principal (single-page scroll)
│   ├── components/
│   │   ├── PasswordGate.astro
│   │   ├── Hero.astro
│   │   ├── Countdown.astro
│   │   ├── Lugar.astro
│   │   ├── Celebracion.astro
│   │   ├── Atuendo.astro
│   │   ├── Autobuses.astro
│   │   ├── Menu.astro
│   │   ├── MapaFinca.astro
│   │   └── Galeria.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── styles/
│       └── global.css
├── public/
│   └── img/
│       └── finca/               ← captura aérea + fotos de la finca
├── docs/
│   └── superpowers/specs/
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## 4. Identidad visual

### Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `--color-limon` | `#D4C84A` | Títulos destacados, acentos dorados |
| `--color-azul` | `#2B5F8E` | Fondos de sección, textos sobre claro |
| `--color-marfil` | `#FAF6EE` | Fondo base |
| `--color-oliva` | `#6B7A3E` | Elementos de olivo, decoración vegetal |
| `--color-vino` | `#7A2D3E` | Acentos secundarios, bordes |
| `--color-terracota` | `#C4714F` | Cerámica, detalles andaluces |

### Tipografía

- **Títulos:** Cormorant Garamond (Google Fonts, serif elegante)
- **Cuerpo:** Lato (Google Fonts, sans-serif legible)

### Estética

- Fondo marfil con textura sutil (lino o papel)
- Elementos decorativos SVG: ramas de olivo, azulejos geométricos andaluces, motivos de vid
- Separadores de sección con cenefas de azulejo
- Solo fotos propias, sin stock
- Sin fotografías de fondo en cabeceras (ilustración o degradado con textura)

### Animaciones (GSAP)

- `fade-up` en entradas de texto al hacer scroll (ScrollTrigger)
- Parallax leve en hero (imagen se mueve más lento que el scroll)
- Números del countdown con animación de cambio suave
- Secciones se revelan una a una al bajar — sin brusquedad
- Transición suave en la tarjeta de información del mapa interactivo

---

## 5. Páginas y secciones

### Arquitectura de navegación

Una única página con scroll (`/boda`), con barra de navegación fija arriba que resalta la sección activa. No hay rutas separadas por sección.

### Fase 1 — Save the Date (lanzamiento)

**`/` — Pantalla de contraseña**
- Overlay a pantalla completa con iniciales/logo de la boda
- Campo de contraseña, botón de acceso
- Si la contraseña es correcta: guarda flag en `sessionStorage`, redirige a `/boda`
- Fondo con textura andaluza (azulejo o lino)

**`/boda` — Hero / Save the Date**
- Nombres de los novios (tipografía Cormorant Garamond grande)
- Fecha: `24 · 07 · 2027`
- Cuenta atrás animada: días / horas / minutos / segundos
- Frase o cita corta de la boda
- Ilustración o foto de los novios con rama de olivo

### Fase 2 — Antes de la boda

| Sección | Componente | Contenido |
|---|---|---|
| El lugar | `Lugar.astro` | Nombre, dirección, cómo llegar, Google Maps embed |
| La celebración | `Celebracion.astro` | Horario del día: ceremonia → cóctel → banquete |
| Atuendo | `Atuendo.astro` | Dress code con descripción y paleta de colores sugerida |
| Autobuses | `Autobuses.astro` | Horarios y puntos de recogida |
| Menú | `Menu.astro` | Platos con descripción, opciones especiales |
| Mapa de la finca | `MapaFinca.astro` | Plano interactivo (ver Sección 6) |

### Fase 3 — Después de la boda

| Sección | Componente | Contenido |
|---|---|---|
| Fotos | `Galeria.astro` | Galería con lightbox, fotos del fotógrafo |

---

## 6. Mapa interactivo de la finca

**Tecnología:** SVG overlay sobre imagen estática. Sin librerías de mapas. Sin coste.

**Cómo funciona:**
1. Imagen base: captura aérea de Finca Genilla desde Google Maps satelital o Google Earth
2. Encima: polígonos SVG transparentes dibujados sobre cada zona de interés
3. Al clic/hover: tarjeta animada (GSAP) con nombre, descripción e icono de la zona

**Zonas a marcar** (ajustable según el plano real):
- Entrada / acceso principal
- Zona de ceremonia
- Cóctel (jardín / terraza)
- Banquete (salón o carpa)
- Parking
- Zona de autobuses

**Responsive:**
- Móvil: zonas con tap, tarjeta aparece debajo del mapa
- Escritorio: hover resalta zona, clic fija la tarjeta

**Pendiente del usuario:** captura aérea de la finca en buena resolución.

---

## 7. Deploy

**GitHub Pages** con GitHub Actions:

```yaml
# .github/workflows/deploy.yml
# En cada push a main:
# 1. npm install
# 2. astro build
# 3. Publica /dist en rama gh-pages
```

URL resultante: `https://[usuario].github.io/web-boda/`  
Opcional en el futuro: dominio personalizado (ej. `antonioy[novia].es`) apuntando a GitHub Pages, gratis si el dominio ya lo tienen.

---

## 8. Fases de desarrollo

| Fase | Contenido | Cuándo |
|---|---|---|
| 1 | Contraseña + Save the Date + Countdown | Ahora |
| 2 | Lugar, Celebración, Atuendo, Autobuses | 6-12 meses antes |
| 3 | Menú, Mapa interactivo | 3-6 meses antes |
| 4 | Galería de fotos | Tras la boda |

---

## 9. Decisiones descartadas

- **RSVPs/confirmaciones:** No se implementan. Confirmaciones por otros medios.
- **Backend / base de datos:** No necesario. Todo estático.
- **Multiidioma:** Solo español.
- **Next.js / Vue:** Descartados por ser excesivos para un sitio de contenido estático.
