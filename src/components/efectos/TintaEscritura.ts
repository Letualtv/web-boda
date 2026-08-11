/**
 * Motor de efecto tinta para el input de contraseña.
 * - Renderiza caracteres con fuente caligráfica
 * - Cursor pluma que sigue el texto
 * - Gotitas de tinta con pool reciclado (máx 8 activas)
 * - Estados: vacío / escribiendo / error / correcto
 */

export interface TintaEscrituraConfig {
  contenedor: HTMLElement;
  inputReal: HTMLInputElement;
  displayVisible: HTMLElement;
  pluma: HTMLElement;
  gotitas: HTMLElement;
  onCorrecto: () => void;
  onError: () => void;
  password: string;
}

const MAX_GOTITAS = 8;
const POOL_GOTITAS = 12;
const OCULTAR_TRAS_MS = 500;

export function crearTintaEscritura(cfg: TintaEscrituraConfig) {
  const gotitasPool: HTMLElement[] = [];
  const gotitasActivas = new Set<HTMLElement>();
  let ultimoTiempoTecla = 0;

  // ─── Pre-render pool de gotitas ────────────────────────
  for (let i = 0; i < POOL_GOTITAS; i++) {
    const g = document.createElement('span');
    g.className = 'gotita';
    g.setAttribute('aria-hidden', 'true');
    cfg.gotitas.appendChild(g);
    gotitasPool.push(g);
  }

  // ─── Reveal chars: cada carácter aparece y a los 500ms se convierte en manchita ──
  function renderDisplay() {
    const valor = cfg.inputReal.value;
    const previos = cfg.displayVisible.querySelectorAll<HTMLElement>('.char');
    const nuevosN = valor.length - previos.length;

    // Reset si borró
    if (valor.length < previos.length) {
      cfg.displayVisible.innerHTML = '';
      for (const ch of valor) crearChar(ch, true);
      return;
    }

    // Añadir chars nuevos
    for (let i = 0; i < nuevosN; i++) {
      const ch = valor[previos.length + i];
      crearChar(ch, false);
    }
  }

  function crearChar(letra: string, yaOculto: boolean) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = letra === ' ' ? ' ' : letra;
    cfg.displayVisible.appendChild(span);
    // fuerza reflow para animación
    void span.offsetWidth;
    span.classList.add('entrando');

    if (!yaOculto) {
      setTimeout(() => convertirEnMancha(span), OCULTAR_TRAS_MS);
    } else {
      span.classList.add('mancha');
    }
  }

  function convertirEnMancha(span: HTMLElement) {
    if (!span.isConnected) return;
    span.classList.add('mancha');
  }

  // ─── Cursor pluma sigue el final del texto ─────────────
  function actualizarPluma() {
    const chars = cfg.displayVisible.querySelectorAll<HTMLElement>('.char');
    const rectContenedor = cfg.displayVisible.getBoundingClientRect();
    let x: number;
    let y: number;
    if (chars.length === 0) {
      const r = cfg.displayVisible.getBoundingClientRect();
      x = 0;
      y = r.height / 2;
    } else {
      const ultimo = chars[chars.length - 1];
      const r = ultimo.getBoundingClientRect();
      x = r.right - rectContenedor.left;
      y = r.top + r.height / 2 - rectContenedor.top;
    }
    cfg.pluma.style.transform = `translate(${x}px, ${y}px)`;
  }

  // ─── Motor de gotitas ──────────────────────────────────
  function lanzarGotitas() {
    if (gotitasActivas.size >= MAX_GOTITAS) {
      // reciclar la más antigua
      const primera = gotitasActivas.values().next().value;
      if (primera) resetearGotita(primera);
    }
    const cuantas = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < cuantas; i++) {
      const g = gotitasPool.find(gg => !gotitasActivas.has(gg));
      if (!g) break;
      lanzarUnaGotita(g);
    }
  }

  function lanzarUnaGotita(g: HTMLElement) {
    const plumaRect = cfg.pluma.getBoundingClientRect();
    const contRect = cfg.gotitas.getBoundingClientRect();
    const x0 = plumaRect.left + plumaRect.width / 2 - contRect.left;
    const y0 = plumaRect.top + plumaRect.height * 0.7 - contRect.top;

    const radio = 1 + Math.random() * 2.5;
    const dx = (Math.random() - 0.5) * 10;
    const dy = 8 + Math.random() * 18;
    const dur = 400 + Math.random() * 400;
    const opac = 0.4 + Math.random() * 0.3;

    g.style.width = `${radio * 2}px`;
    g.style.height = `${radio * 2}px`;
    g.style.left = `${x0 - radio}px`;
    g.style.top = `${y0 - radio}px`;
    g.style.opacity = String(opac);
    g.style.transition = 'none';
    g.style.transform = 'translate(0, 0)';

    gotitasActivas.add(g);

    // fase 1: caer con gravedad
    requestAnimationFrame(() => {
      g.style.transition = `transform ${dur}ms cubic-bezier(0.4, 0, 1, 0.6), opacity ${dur + 500}ms ease-out`;
      g.style.transform = `translate(${dx}px, ${dy}px)`;
      g.style.opacity = String(opac * 0.9);
    });

    // fase 2: reposo 2s, luego fade
    setTimeout(() => {
      g.style.transition = `opacity 500ms ease-out`;
      g.style.opacity = '0';
      setTimeout(() => resetearGotita(g), 500);
    }, dur + 2000);
  }

  function resetearGotita(g: HTMLElement) {
    g.style.opacity = '0';
    g.style.transform = 'translate(0, 0)';
    gotitasActivas.delete(g);
  }

  // ─── Estados visuales ──────────────────────────────────
  function ponerError() {
    cfg.contenedor.classList.add('error');
    cfg.contenedor.classList.remove('escribiendo');
    setTimeout(() => cfg.contenedor.classList.remove('error'), 1200);
  }

  function ponerCorrecto() {
    cfg.contenedor.classList.add('correcto');
    cfg.contenedor.classList.remove('escribiendo');
  }

  // ─── Listeners ─────────────────────────────────────────
  cfg.inputReal.addEventListener('input', () => {
    ultimoTiempoTecla = performance.now();
    cfg.contenedor.classList.add('escribiendo');
    cfg.contenedor.classList.remove('error', 'vacio');
    renderDisplay();
    actualizarPluma();
    lanzarGotitas();
  });

  cfg.inputReal.addEventListener('focus', () => {
    cfg.contenedor.classList.add('con-foco');
    if (!cfg.inputReal.value) cfg.contenedor.classList.add('vacio');
  });

  cfg.inputReal.addEventListener('blur', () => {
    cfg.contenedor.classList.remove('con-foco');
    if (!cfg.inputReal.value) cfg.contenedor.classList.add('vacio');
  });

  // Detener rotación de pluma tras 500ms sin teclear
  setInterval(() => {
    if (performance.now() - ultimoTiempoTecla > 500) {
      cfg.contenedor.classList.remove('escribiendo');
    }
  }, 200);

  // Verificación
  function verificar() {
    const val = cfg.inputReal.value.trim().toLowerCase();
    if (val === cfg.password.toLowerCase()) {
      ponerCorrecto();
      setTimeout(() => cfg.onCorrecto(), 500);
    } else {
      ponerError();
      cfg.onError();
      setTimeout(() => {
        cfg.inputReal.value = '';
        renderDisplay();
        actualizarPluma();
        cfg.inputReal.focus();
      }, 800);
    }
  }

  // Estado inicial
  cfg.contenedor.classList.add('vacio');
  actualizarPluma();

  return { verificar };
}
