/**
 * Motor de gestos para pasar página.
 * Soporta touch, mouse drag, teclado. Un único punto de configuración.
 */

export interface PaseDePaginaConfig {
  contenedor: HTMLElement;
  cinta: HTMLElement;
  totalPaginas: number;
  paginaMaxPermitida: () => number;   // según autenticación
  onCambio: (nueva: number) => void;
  onDragUpdate?: (offset: number) => void;
}

const UMBRAL_PORCENTAJE = 0.15;      // 15% del viewport
const UMBRAL_VELOCIDAD = 0.3;        // px/ms

export function crearPaseDePagina(cfg: PaseDePaginaConfig) {
  let paginaActual = 0;
  let animando = false;
  let arrastrando = false;
  let inicioX = 0;
  let inicioT = 0;
  let deltaX = 0;

  const anchoViewport = () => cfg.contenedor.offsetWidth || window.innerWidth;

  function irA(nueva: number, animar = true) {
    const max = cfg.paginaMaxPermitida();
    nueva = Math.max(0, Math.min(nueva, cfg.totalPaginas - 1, max));
    if (nueva === paginaActual && !arrastrando) return;
    paginaActual = nueva;
    aplicarTransformacion(animar);
    cfg.onCambio(paginaActual);
  }

  function aplicarTransformacion(animar: boolean) {
    animando = animar;
    cfg.cinta.style.transition = animar
      ? 'transform 450ms cubic-bezier(0.65, 0, 0.35, 1)'
      : 'none';
    cfg.cinta.style.transform = `translate3d(${-paginaActual * anchoViewport()}px, 0, 0)`;
    if (animar) {
      window.setTimeout(() => { animando = false; }, 460);
    }
  }

  function iniciarDrag(x: number) {
    if (animando) return;
    arrastrando = true;
    inicioX = x;
    inicioT = performance.now();
    deltaX = 0;
    cfg.cinta.style.transition = 'none';
  }

  function moverDrag(x: number) {
    if (!arrastrando) return;
    deltaX = x - inicioX;
    const max = cfg.paginaMaxPermitida();
    // resistencia elástica en bordes
    let clamped = deltaX;
    if (paginaActual === 0 && deltaX > 0) clamped = deltaX * 0.35;
    if (paginaActual >= max && deltaX < 0) clamped = deltaX * 0.35;
    const offset = -paginaActual * anchoViewport() + clamped;
    cfg.cinta.style.transform = `translate3d(${offset}px, 0, 0)`;
    if (cfg.onDragUpdate) cfg.onDragUpdate(clamped);
  }

  function terminarDrag() {
    if (!arrastrando) return;
    arrastrando = false;
    const dur = performance.now() - inicioT;
    const vel = Math.abs(deltaX) / dur;
    const pasoUmbral = anchoViewport() * UMBRAL_PORCENTAJE;
    const debePasar =
      Math.abs(deltaX) > pasoUmbral || vel > UMBRAL_VELOCIDAD;

    if (debePasar) {
      if (deltaX < 0) irA(paginaActual + 1, true);
      else irA(paginaActual - 1, true);
    } else {
      aplicarTransformacion(true);
    }
    deltaX = 0;
  }

  // ─── Touch ──────────────────────────────────────────────
  cfg.contenedor.addEventListener('touchstart', (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    // no interceptar taps en scroll interno vertical
    if (target.closest('.pagina-scroll')) {
      const el = target.closest('.pagina-scroll') as HTMLElement;
      // solo iniciar drag horizontal
    }
    iniciarDrag(e.touches[0].clientX);
  }, { passive: true });

  cfg.contenedor.addEventListener('touchmove', (e: TouchEvent) => {
    if (arrastrando) moverDrag(e.touches[0].clientX);
  }, { passive: true });

  cfg.contenedor.addEventListener('touchend', terminarDrag);
  cfg.contenedor.addEventListener('touchcancel', terminarDrag);

  // ─── Mouse ──────────────────────────────────────────────
  cfg.contenedor.addEventListener('mousedown', (e: MouseEvent) => {
    // ignorar sobre inputs y botones
    const target = e.target as HTMLElement;
    if (target.matches('input, textarea, button, a, [role="button"]')) return;
    if (target.closest('input, textarea, button, a, [role="button"]')) return;
    e.preventDefault();
    iniciarDrag(e.clientX);
  });

  window.addEventListener('mousemove', (e: MouseEvent) => {
    if (arrastrando) moverDrag(e.clientX);
  });

  window.addEventListener('mouseup', terminarDrag);
  window.addEventListener('mouseleave', terminarDrag);

  // ─── Teclado ────────────────────────────────────────────
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight') irA(paginaActual + 1);
    else if (e.key === 'ArrowLeft') irA(paginaActual - 1);
    else if (e.key === 'Home') irA(0);
    else if (e.key === 'End') irA(cfg.paginaMaxPermitida());
  });

  // ─── Resize ─────────────────────────────────────────────
  window.addEventListener('resize', () => {
    aplicarTransformacion(false);
  });

  // API pública
  return {
    irA,
    paginaActual: () => paginaActual,
    forzar: (n: number) => irA(n, false),
  };
}
