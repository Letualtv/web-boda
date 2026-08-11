# Diseño — Libro de invitación de boda

**Proyecto:** `web-boda` (Alba & Antonio · 24·07·2027 · Priego de Córdoba)
**Fecha:** 2026-08-11
**Autor:** Antonio + Claude
**Estado:** Diseño aprobado, pendiente de plan de implementación

---

## 1. Resumen

Rediseño completo del sitio web de la boda como un **libro de invitación digital** con 7 páginas horizontales navegables mediante swipe/drag, con estética de papel marfil envejecido y tinta añil azulejo. Temática visual: patio andaluz (azulejos, limones, ramas de olivo, teja). Todo dentro de una única ruta Astro (SPA), sin recargas de página.

Sustituye por completo el diseño actual (portada oscura con countdown + página de acceso claro con contraseña).

---

## 2. Decisiones aprobadas

| Área | Decisión |
|---|---|
| Estructura | SPA en una única ruta Astro (`index.astro`) |
| Transiciones | Deslizamiento lateral 2D (no flip 3D) — mejor compatibilidad móvil |
| Contraseña | Página 2 del libro, no muro previo |
| Navegación | Swipe/drag + teclado + índice; flechas preparadas pero ocultas |
| Paper style | Marfil envejecido con textura de fibras |
| Tinta | Añil azulejo `#1E3A5F` |
| Efecto tinta contraseña | Fuente caligráfica + gotitas + cursor pluma |
| Sonido | Silencio total |
| Ilustraciones | SVG (adornos) + PNG (hand-drawn detallado) |
| Galería | Retícula tipo álbum, marcos washi tape |

---

## 3. Secciones del libro

Total: **7 páginas** más el overlay de índice.

| # | Sección | Bloqueada por contraseña |
|---|---|---|
| 0 | Portada (nombres, fecha, cuenta atrás) | No |
| 1 | Acceso (contraseña con efecto tinta) | No |
| 2 | Bienvenida (mensaje de los novios) | Sí |
| 3 | Nuestra historia | Sí |
| 4 | Celebración (ceremonia + banquete en mismo sitio) | Sí |
| 5 | Autobuses (horarios y ubicaciones) | Sí |
| 6 | Galería (huecos irregulares para fotos) | Sí |

Descartadas explícitamente: **Menú, Lista de bodas, Confirmación de asistencia (RSVP)**.

---

## 4. Arquitectura técnica

### 4.1 Estructura de archivos

```
src/
├── layouts/
│   └── Layout.astro                  # HTML base, fuentes, textura papel global
├── pages/
│   └── index.astro                   # Única ruta, monta <Libro/>
├── components/
│   ├── Libro.astro                   # Contenedor principal, estado global, gestos
│   ├── PaginaMarco.astro             # Wrapper con textura, márgenes, slots de ilustraciones
│   ├── Indice.astro                  # Overlay tabla de contenidos
│   ├── FlechasNav.astro              # Flechas laterales (ocultas por defecto)
│   ├── IndicadorPagina.astro         # "III · VII" en romanos abajo
│   ├── paginas/
│   │   ├── Portada.astro
│   │   ├── Acceso.astro
│   │   ├── Bienvenida.astro
│   │   ├── Historia.astro
│   │   ├── Celebracion.astro
│   │   ├── Autobuses.astro
│   │   └── Galeria.astro
│   └── efectos/
│       ├── TintaEscritura.ts         # Motor gotitas + cursor pluma
│       └── PaseDePagina.ts           # Motor swipe/drag/teclado
└── styles/
    └── global.css                    # Paleta, texturas, tipografías
```

Se **elimina** `src/pages/acceso.astro`, `src/components/ComingSoon.astro`, `src/components/PasswordGate.astro`, `src/components/Countdown.astro`, `src/components/Hero.astro` (todo el diseño anterior). El componente `Countdown` se reimplementa dentro de `Portada.astro` adaptado a la nueva estética.

### 4.2 Dependencias

Se **mantienen**: `astro`, `tailwindcss`, `@tailwindcss/vite`, `gsap`, `lenis`, `splitting`.

Se **añade**: fuente **Alex Brush** de Google Fonts (carga junto a Great Vibes y Cormorant Garamond).

No se instala **ningún paquete npm nuevo**.

### 4.3 Estado global

Vive en `<Libro>`:

```ts
{
  paginaActual: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  autenticado: boolean,
  indiceAbierto: boolean,
  animando: boolean,
}
```

Sin librería de estado — señales/observables simples con `document.dispatchEvent` para comunicar entre componentes.

### 4.4 Persistencia

- `sessionStorage['boda_auth'] = 'ok'` al acertar la contraseña.
- Al cargar: si `autenticado`, arranca en página 2 (Bienvenida). Si no, en página 0.
- **No** se persiste `paginaActual` (se re-lee al recargar).
- Elegido `sessionStorage` frente a `localStorage` para no dejar autenticación permanente en dispositivos compartidos.

---

## 5. Sistema de navegación

### 5.1 Modelo de páginas

Todas las páginas viven en una única "cinta" horizontal con `display: flex`, cada página con `width: 100vw` y `flex-shrink: 0`. El desplazamiento se hace con `transform: translateX(-N * 100vw)` sobre la cinta.

Animación por defecto: **450ms `power3.inOut`** con GSAP.

### 5.2 Gestos aceptados

| Gesto | Umbral para pasar página |
|---|---|
| Touch swipe | 15% del viewport de desplazamiento **o** velocidad > 0.3 px/ms |
| Mouse drag | Mismo umbral |
| Flecha izquierda/derecha | Inmediato |
| Home / End | Va a página 0 / última |
| Click en flechas nav (si visibles) | Inmediato |

Debajo del umbral, la página vuelve a su sitio con `ease: elastic.out(1, 0.5)` (rebote suave).

### 5.3 Bloqueo por contraseña

- Mientras `!autenticado`, `PaseDePagina` limita `paginaActual` a `{0, 1}`.
- Intento de avanzar más allá → se ignora (o rebota visualmente hacia página 1).
- Al `autenticado = true`, se desbloquean todas y se auto-avanza a página 2.

### 5.4 Índice

- Botón discreto arriba a la derecha, icono de 3 líneas horizontales (SVG).
- Visible solo cuando `autenticado && paginaActual >= 2`.
- Al pulsar → overlay a pantalla completa con:
  - `role="dialog"` `aria-modal="true"`
  - Fondo marfil semi-transparente con `backdrop-filter: blur(4px)`
  - Lista vertical de 5 secciones desbloqueadas con números romanos
  - Cada entrada en Alex Brush tamaño grande, hover cambia color a limón
  - Foco atrapado con Tab, ESC cierra, click fuera cierra, botón X arriba

### 5.5 Flechas ocultas listas

Componente `<FlechasNav>` siempre renderizado en el DOM, con `display: none` por defecto. Se activan añadiendo clase `.con-flechas` al `<Libro>`. Botones circulares translúcidos en laterales, aparición con hover a mayor opacidad.

### 5.6 Indicador de página

Abajo centrado, formato `III · VII`. Página actual en `#D4C84A` (limón), resto en tinta clara `#3D5A80`. Solo visible cuando `autenticado`.

Tiene `aria-live="polite"` para anunciar cambios a lectores de pantalla.

---

## 6. Sistema visual — papel y tinta

### 6.1 Paleta

| Rol | Color | Uso |
|---|---|---|
| Papel | `#F3E9D2` | Fondo de todas las páginas |
| Papel sombra | `#E8DCC0` | Bordes/pliegue, fondo fuera de la página en desktop grande |
| Tinta principal | `#1E3A5F` | Texto de lectura |
| Tinta clara | `#3D5A80` | Texto secundario, meta, líneas |
| Limón | `#D4C84A` | Iniciales capitulares, indicador de página activa |
| Oliva | `#6B7A3E` | Ilustraciones ramas, acentos verdes |
| Teja | `#C4714F` | Acentos cálidos, azulejos |
| Vino | `#7A2D3E` | Errores, énfasis íntimo |

### 6.2 Textura de papel

Overlay SVG con dos capas por página:

1. **Fibra base** — `<feTurbulence baseFrequency="0.9" numOctaves="2"/>` en marfil oscuro con `opacity: 0.35` y `mix-blend-mode: multiply`. Textura porosa.
2. **Manchas de tiempo** — 4-6 manchas irregulares en tonos té/óxido (`#B8916A` opacidad 0.08), distribuidas asimétricamente. Semilla pseudoaleatoria basada en el índice de página → cada página tiene manchas distintas.

El overlay `#grain` cinematográfico actual se **elimina** — no encaja con estética de papel estático.

### 6.3 Pliegue central en desktop

En pantallas `>900px`, cada página tiene `linear-gradient(90deg, rgba(60,40,20,0.15) 0%, transparent 8%)` en el borde izquierdo, simulando el pliegue interior de un libro abierto. En móvil no aparece.

### 6.4 Tipografías

| Fuente | Uso | Vía |
|---|---|---|
| **Cormorant Garamond** | Cuerpo de texto, párrafos | Google Fonts (ya cargada) |
| **Great Vibes** | Nombres, iniciales grandes, títulos solemnes | Google Fonts (ya cargada) |
| **Alex Brush** | Títulos de sección, subtítulos manuscritos | Google Fonts (nueva) |
| **Lato** | Meta funcional (horarios, fechas, notas) | Google Fonts (ya cargada) |

### 6.5 Márgenes tipo página impresa

`<PaginaMarco>` aplica:
```css
padding: clamp(3rem, 8vw, 6rem) clamp(2rem, 10vw, 8rem);
```

Márgenes generosos en desktop, ajustados en móvil.

### 6.6 Iniciales capitulares

Primer párrafo de cada sección abre con capital drop:
- Letra grande caligráfica (fuente Great Vibes o SVG dibujada)
- 4 líneas de altura, flotada a la izquierda con `float: left`
- Color limón o oliva
- Componente reutilizable `<Capitular letra="Q"/>` que puede usar SVG (si existe `svg/iniciales/Q-limon.svg`) o fallback a texto en Great Vibes

---

## 7. Efecto tinta en la página de acceso

### 7.1 Renderizado del input

- `<input type="password">` real, invisible (`opacity: 0`, `position: absolute`), pero funcional (accesible, autocompletable con gestor).
- Encima, un `<div id="tinta-display">` renderiza los caracteres visibles con **Alex Brush** en `#1E3A5F`, tamaño `clamp(1.8rem, 5vw, 2.5rem)`, letter-spacing amplio.
- Sincronización via `input` event: cada tecla actualiza el display.

**Modo de ocultación**: los caracteres se muestran tal cual mientras se escriben, pero pasados 500ms cada carácter individual se convierte en una "manchita de tinta" (círculo pequeño con la misma tinta). Solo el último carácter escrito permanece visible. Justificación: es una contraseña compartida sin datos sensibles y así se mantiene la magia de ver la caligrafía sin quemar la seguridad.

### 7.2 Cursor pluma

- SVG `svg/iconos/pluma.svg` posicionado absolutamente al final del texto renderizado.
- Sigue el cursor con `transition: transform 100ms ease-out`.
- Micro-animación de "escritura": rotación `±2°` en loop mientras el usuario tipea (se detiene 500ms tras la última tecla).

### 7.3 Motor de gotitas

Componente `<GotitaSpawner>`:
- **Pool de 12 SVG circles** pre-renderizados en el DOM, reciclados (no crea/destruye elementos).
- Al pulsar tecla: se activan 2-3 del pool con:
  - Posición inicial: xy del cursor pluma
  - Radio: 1-3px aleatorio
  - Color: `#1E3A5F` con opacidad 0.4-0.7 aleatoria
  - Desplazamiento y: +8 a +25px, curva `power2.out` (gravedad simulada)
  - Desplazamiento x: ±5px
  - Duración: 400-800ms aleatorio
  - Al terminar: quedan 2s estáticas, luego fade out 500ms
- Máximo **8 activas simultáneas**, la 9ª recicla la más antigua.

### 7.4 Línea inferior tipo cuaderno

Debajo del texto renderizado, línea `1px solid #3D5A80` opacidad `0.3`. Al focus, animar opacidad a `0.6`.

### 7.5 Estados

| Estado | Comportamiento |
|---|---|
| Vacío | Placeholder `— escribe aquí —` en tinta clara itálica |
| Escribiendo | Cursor pluma visible, gotitas activas |
| Error | Tinta a vino `#7A2D3E`, mensaje "esta no es la palabra" debajo, temblor lateral 2 iter × 5px |
| Correcto | Tinta se "seca" (`filter: saturate(1) → saturate(0.7)` en 500ms), auto-avanza a página 2 |

### 7.6 Verificación

Contraseña `genilla2027` en texto plano en el componente (ya acordado previamente por el usuario: sin datos sensibles).

```ts
const PASSWORD = 'genilla2027';
if (input.trim().toLowerCase() === PASSWORD) { ... }
```

---

## 8. Sistema de ilustraciones

### 8.1 Estructura de carpetas

```
public/img/
├── svg/
│   ├── esquinas/           # 4 slots: sup-izq, sup-der, inf-izq, inf-der
│   ├── azulejos/           # patrones tileable
│   ├── separadores/        # cenefas horizontales entre bloques
│   ├── iniciales/          # capitulares (una por letra usada)
│   ├── iconos/             # pluma, sello, marca de página, autobús, etc.
│   └── monogramas/         # A&A a varios tamaños
├── png/
│   ├── ramas-olivo/
│   ├── limones/
│   ├── acuarelas/          # manchas y washes de fondo
│   └── botanicos/
└── galeria/                # fotos de la boda (subidas manualmente)
```

### 8.2 API de `<PaginaMarco>`

```astro
<PaginaMarco
  titulo="Bienvenida"
  esquinaSupIzq="/img/svg/esquinas/olivo-sup-izq.svg"
  esquinaInfDer="/img/png/limones/limon-inf-der.png"
  fondoAcuarela="/img/png/acuarelas/mancha-verde-01.png"
  separadorInicial="/img/svg/separadores/cenefa-limon.svg"
  inicial="Q"
>
  { children }
</PaginaMarco>
```

Todas las props son opcionales. Slots vacíos no muestran nada (no placeholder feo).

### 8.3 Convención de nombres

`elemento-descripcion-numero.ext`, minúsculas, guiones.

Ejemplos: `olivo-rama-larga-01.svg`, `limon-cortado-02.png`, `azulejo-geometrico-azul-01.svg`.

### 8.4 Animaciones de aparición

- **SVG con clase `.decorativo`**: se auto-dibujan con `stroke-dashoffset` animado por GSAP (800ms) al entrar en la página.
- **PNG**: entran con fade + escala `0.95 → 1` en 500ms.
- Ambas respetan `prefers-reduced-motion` (aparición instantánea si está activada).

---

## 9. Página por página — contenido

### 9.1 Portada (página 0)

- Nombres `Alba & Antonio` en Great Vibes, centrados
- Fecha `24 · Julio · 2027` en Lato con letter-spacing amplio
- Lugar `Priego de Córdoba` en Cormorant itálica
- Cuenta atrás minimalista adaptada a tinta añil sobre marfil (mantener lógica JS actual, rediseñar visualmente)
- Ilustración: rama de olivo esquina sup-izq, limón esquina inf-der (slots opcionales)
- Debajo del contenido: `Desliza para entrar →` en tinta clara con animación sutil de "invitación"
- No hay scroll interno

### 9.2 Acceso (página 1)

- Título `Palabra de entrada` en Alex Brush centrado
- Efecto tinta descrito en Sección 7
- Botón `Entrar` que aparece cuando `input.length >= 3`
- Mensaje de error si falla
- Nota discreta abajo: `Pregúntanos si no la recuerdas`
- Al acertar: auto-avance a página 2

### 9.3 Bienvenida (página 2)

- Título `Bienvenidos` en Alex Brush
- Inicial capitular grande (letra según primer párrafo)
- Párrafo de 3-4 líneas de bienvenida
- Firma manuscrita `Alba & Antonio` a la derecha, tipo firma real
- Ilustración: azulejos geométricos en esquinas

### 9.4 Nuestra historia (página 3)

- Título `Nuestra historia`
- 2-3 párrafos largos con espacio para 1-2 fotos pequeñas intercaladas
- **Scroll interno vertical** si el texto excede el viewport (Lenis gestiona la fluidez)
- Ilustración: rama de olivo grande semi-transparente de fondo, acuarela verde en esquina

### 9.5 Celebración (página 4)

- Título `La celebración`
- Bloque 1: fecha y hora (`Sábado 24 de julio · 12:30 h`)
- Bloque 2: lugar con dirección
- Bloque 3: mapa embebido de Google Maps (iframe estilizado marfil) o imagen estática con enlace a Maps
- Ilustración: azulejo andaluz de fondo semi-transparente

### 9.6 Autobuses (página 5)

- Título `Cómo llegar`
- Dos bloques verticales:
  - **Salida**: hora + parada 1 + parada 2 (con enlaces a Maps)
  - **Vuelta**: hora + mismo formato
- Iconos SVG de autobús pequeños
- Nota final: `Si vas por tu cuenta, aparcamiento disponible en el propio recinto`

### 9.7 Galería (página 6)

- Título `Recuerdos`
- Retícula tipo álbum: 6-8 huecos irregulares (algunos cuadrados, otros verticales, otros horizontales)
- Marcos con washi tape sutil en tonos limón/oliva
- Rotación aleatoria `-3° a +3°` por foto
- Al pulsar foto: lightbox simple (fondo oscuro fade, foto grande centrada, cierre con ESC/tap fuera)
- Placeholder mientras no hay fotos: marcos vacíos con layout intacto
- Nota abajo: `Iremos añadiendo fotos` en itálica muy discreta

### 9.8 Índice (overlay, no es página)

Formato:
```
II.   Bienvenida
III.  Nuestra historia
IV.   La celebración
V.    Cómo llegar
VI.   Recuerdos
```

---

## 10. Accesibilidad

- Input real de contraseña (invisible) conserva atributos correctos para lectores de pantalla y gestores de contraseñas.
- Overlay del índice con `role="dialog"`, `aria-modal="true"`, foco atrapado, ESC cierra.
- Cada página tiene un `<h1>` o `<h2>` visible con el título.
- Indicador de página con `aria-live="polite"`.
- Contraste tinta `#1E3A5F` sobre papel `#F3E9D2` = **8.9:1** (AAA sobrado).
- `prefers-reduced-motion`:
  - Transición de página: 150ms en vez de 450ms
  - Sin gotitas de tinta
  - Ilustraciones aparecen renderizadas (sin auto-dibujado)
- Sin JavaScript: mensaje amable `Esta invitación necesita JavaScript activado`.

---

## 11. Responsive

| Breakpoint | Comportamiento |
|---|---|
| `<768px` (móvil vertical) | Márgenes reducidos, tipografías escaladas con `clamp()`, ilustraciones al 60% |
| `768-1024px` (tablet, móvil landscape) | Márgenes intermedios, ilustraciones al 80% |
| `>1024px` (desktop) | Márgenes generosos, sombra de pliegue izquierdo, ilustraciones al 100% |
| `>1600px` (pantalla grande) | Página centrada `max-width: 1400px`, fondo exterior en `#E8DCC0` (mesa donde reposa el libro) |

Compatibilidad garantizada: Android ≥ 8, iOS ≥ 13, todos los navegadores modernos.

---

## 12. Rendimiento

- Bundle JS crítico (Libro + gestos + tinta): objetivo **<20KB gzipped**.
- PNGs servidos como `.webp` con fallback `.jpg` via `<picture>`.
- Páginas 2-6: renderizadas al montar el Libro (todas en el DOM), pero sin ejecutar animaciones hasta ser visibles.
- Assets de ilustraciones: `loading="lazy"` en PNGs no visibles inicialmente.
- Sin canvas WebGL, sin librería de física, sin framework externo.
- Peso total estimado del sitio completo con assets: **~800KB-1MB gzipped**.

---

## 13. Edge cases

- **Recarga con `!autenticado` pero `paginaActual > 1`**: forzar `paginaActual = 1`.
- **Resize durante animación**: `animando` bloquea gestos; al terminar, re-calcular ancho de cinta y aplicar `translateX` sin animación.
- **Rotación móvil**: soportado, layout es `100vw × 100vh` puro.
- **Doble swipe rápido**: `animando` bloquea inputs durante la transición de 450ms.
- **Gestor de contraseñas del navegador**: input real es accesible, `autocomplete="current-password"`.

---

## 14. Alcance MVP (Fase 1)

**Incluido**:
- Estructura completa de las 7 páginas con contenido placeholder realista
- Sistema de navegación (swipe/drag/teclado, sin flechas visibles)
- Índice funcional
- Efecto tinta completo (fuente + cursor pluma + gotitas + errores)
- Sistema de papel + texturas + tipografías
- Persistencia de autenticación (`sessionStorage`)
- Marcos de galería con placeholders correctos
- Accesibilidad + `prefers-reduced-motion`
- Responsive completo

**Fuera de esta fase**:
- Ilustraciones definitivas (Antonio las subirá cuando estén listas — slots ya preparados)
- Textos definitivos (placeholders realistas hasta entonces)
- Fotos de la galería
- Sonidos (descartado)
- Sistema de RSVP (descartado)
- Menú / lista de bodas (descartado)

---

## 15. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Rendimiento del efecto tinta en móviles viejos | Pool de gotitas (no crea/destruye DOM), máximo 8 activas |
| Gestos táctiles inconsistentes entre navegadores | Usar `pointer events` que unifican touch/mouse |
| Fuentes Google Fonts bloqueando render | `font-display: swap` en `<link>` |
| SVG grandes de ilustraciones ralentizando la carga | Objetivo <10KB por SVG, PNG optimizados con squoosh |
| Textos placeholder olvidados en producción | Comentario visible `<!-- PLACEHOLDER: sustituir -->` en cada uno |
