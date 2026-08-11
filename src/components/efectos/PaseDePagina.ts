/**
 * Motor de gestos para pasar página.
 * - Detecta scroll vertical vs horizontal: si el usuario deslizó vertical, no intercepta
 * - Añade sombra al borde durante el arrastre para dar sensación de hoja
 */

export interface PaseDePaginaConfig {
  contenedor: HTMLElement;
  cinta: HTMLElement;
  totalPaginas: number;
  paginaMaxPermitida: () => number;
  onCambio: (nueva: number) => void;
  onDragUpdate?: (offset: number) => void;
}

const UMBRAL_PORCENTAJE = 0.18;
const UMBRAL_VELOCIDAD = 0.35;
const UMBRAL_INTENCION = 8;        // píxeles antes de decidir eje

type Intencion = 'indefinido' | 'horizontal' | 'vertical';

export function crearPaseDePagina(cfg: PaseDePaginaConfig) {
  let paginaActual = 0;
  let animando = false;
  let arrastrando = false;
  let intencion: Intencion = 'indefinido';
  let inicioX = 0, inicioY = 0, inicioT = 0;
  let deltaX = 0, deltaY = 0;

  const anchoViewport = () => cfg.contenedor.offsetWidth || window.innerWidth;

  function irA(nueva: number, animar = true) {
    const max = cfg.paginaMaxPermitida();
    nueva = Math.max(0, Math.min(nueva, cfg.totalPaginas - 1, max));
    if (nueva === paginaActual && !arrastrando) {
      // rebote si intentó pasar del límite
      aplicarTransformacion(true);
      return;
    }
    paginaActual = nueva;
    aplicarTransformacion(animar);
    cfg.onCambio(paginaActual);
  }

  function aplicarTransformacion(animar: boolean) {
    animando = animar;
    cfg.cinta.style.transition = animar
      ? 'transform 550ms cubic-bezier(0.32, 0.72, 0, 1)'
      : 'none';
    cfg.cinta.style.transform = `translate3d(${-paginaActual * anchoViewport()}px, 0, 0)`;
    if (animar) {
      window.setTimeout(() => { animando = false; }, 560);
    }
  }

  function iniciarDrag(x: number, y: number) {
    if (animando) return;
    arrastrando = true;
    intencion = 'indefinido';
    inicioX = x; inicioY = y;
    inicioT = performance.now();
    deltaX = 0; deltaY = 0;
    // NO removemos la transición todavía — solo cuando decidamos horizontal
  }

  function moverDrag(x: number, y: number, e?: TouchEvent) {
    if (!arrastrando) return;
    deltaX = x - inicioX;
    deltaY = y - inicioY;

    // Decidir intención tras superar umbral
    if (intencion === 'indefinido') {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (absX < UMBRAL_INTENCION && absY < UMBRAL_INTENCION) return;
      // El eje dominante decide
      intencion = absX > absY ? 'horizontal' : 'vertical';
      if (intencion === 'vertical') {
        // Ceder al scroll nativo — cancelar arrastre
        arrastrando = false;
        return;
      }
      // Horizontal confirmado — arrancar transición transparente
      cfg.cinta.style.transition = 'none';
      cfg.contenedor.classList.add('arrastrando');
    }

    // Si es horizontal y hay evento touch, prevenir default para bloquear scroll
    if (intencion === 'horizontal' && e && e.cancelable) {
      e.preventDefault();
    }

    const max = cfg.paginaMaxPermitida();
    let clamped = deltaX;
    if (paginaActual === 0 && deltaX > 0) clamped = deltaX * 0.35;
    if (paginaActual >= max && deltaX < 0) clamped = deltaX * 0.35;
    const offset = -paginaActual * anchoViewport() + clamped;
    cfg.cinta.style.transform = `translate3d(${offset}px, 0, 0)`;

    // Actualizar sombra visual de arrastre
    const progreso = Math.abs(clamped) / anchoViewport();
    cfg.contenedor.style.setProperty('--drag-progreso', String(progreso));
    cfg.contenedor.style.setProperty('--drag-direccion', clamped < 0 ? '-1' : '1');

    if (cfg.onDragUpdate) cfg.onDragUpdate(clamped);
  }

  function terminarDrag() {
    if (!arrastrando) {
      // se descartó por vertical
      intencion = 'indefinido';
      return;
    }
    arrastrando = false;
    cfg.contenedor.classList.remove('arrastrando');
    cfg.contenedor.style.setProperty('--drag-progreso', '0');
    if (intencion === 'horizontal') {
      const dur = performance.now() - inicioT;
      const vel = Math.abs(deltaX) / dur;
      const pasoUmbral = anchoViewport() * UMBRAL_PORCENTAJE;
      const debePasar = Math.abs(deltaX) > pasoUmbral || vel > UMBRAL_VELOCIDAD;

      if (debePasar) {
        if (deltaX < 0) irA(paginaActual + 1, true);
        else irA(paginaActual - 1, true);
      } else {
        aplicarTransformacion(true);
      }
    }
    intencion = 'indefinido';
    deltaX = deltaY = 0;
  }

  // ─── Touch ──────────────────────────────────────────────
  cfg.contenedor.addEventListener('touchstart', (e: TouchEvent) => {
    iniciarDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  cfg.contenedor.addEventListener('touchmove', (e: TouchEvent) => {
    if (arrastrando) moverDrag(e.touches[0].clientX, e.touches[0].clientY, e);
  }, { passive: false });   // passive:false para poder preventDefault en horizontal

  cfg.contenedor.addEventListener('touchend', terminarDrag);
  cfg.contenedor.addEventListener('touchcancel', terminarDrag);

  // ─── Mouse ──────────────────────────────────────────────
  cfg.contenedor.addEventListener('mousedown', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.matches('input, textarea, button, a, [role="button"]')) return;
    if (target.closest('input, textarea, button, a, [role="button"]')) return;
    iniciarDrag(e.clientX, e.clientY);
    // en desktop, prevenir selección
    if (e.button === 0) e.preventDefault();
  });

  window.addEventListener('mousemove', (e: MouseEvent) => {
    if (arrastrando) moverDrag(e.clientX, e.clientY);
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

  return {
    irA,
    paginaActual: () => paginaActual,
    forzar: (n: number) => irA(n, false),
  };
}
