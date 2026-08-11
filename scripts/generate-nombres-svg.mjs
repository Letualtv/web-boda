/**
 * Genera public/img/svg/monogramas/nombres.svg
 * Extrae glifos de Great Vibes con opentype.js, un path por letra
 * (Vivus.js necesita paths simples sin subpaths para trazar bien).
 */
import opentype from 'opentype.js';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const FUENTE = path.join(__dirname, 'GreatVibes-Regular.ttf');
const SALIDA = path.resolve(__dirname, '..', 'public', 'img', 'svg', 'monogramas', 'nombres.svg');

const buffer = fs.readFileSync(FUENTE);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
const font = opentype.parse(arrayBuffer);

const FONT_SIZE = 200;
const PADDING = 40;
const scale = FONT_SIZE / font.unitsPerEm;
const baseline = FONT_SIZE + PADDING;

/**
 * Devuelve array de { d, ancho, char, clase }, un path por carácter.
 */
function textoAPaths(texto, xInicio, clasePalabra) {
  let x = xInicio;
  const paths = [];
  let idx = 0;
  for (const ch of texto) {
    const glyph = font.charToGlyph(ch);
    if (!glyph) continue;
    const p = glyph.getPath(x, baseline, FONT_SIZE);
    const d = p.toPathData(2);
    const ancho = glyph.advanceWidth * scale;
    if (d && d.trim() && ch !== ' ') {
      paths.push({ d, char: ch, clase: `${clasePalabra} c-${idx}` });
    }
    x += ancho;
    idx++;
  }
  return { paths, anchoTotal: x - xInicio };
}

// Componer
const albaX = PADDING;
const alba = textoAPaths('Alba', albaX, 'alba');

const espacio = FONT_SIZE * 0.15;
const ampX = albaX + alba.anchoTotal + espacio;
const amp = textoAPaths('&', ampX, 'amp');

const antonioX = ampX + amp.anchoTotal + espacio;
const antonio = textoAPaths('Antonio', antonioX, 'antonio');

const anchoTotal = antonioX + antonio.anchoTotal + PADDING;
const alturaTotal = FONT_SIZE * 1.5 + PADDING;

const todosPaths = [...alba.paths, ...amp.paths, ...antonio.paths];

const pathsMarkup = todosPaths
  .map((p) => `  <path class="${p.clase}" data-char="${p.char}" d="${p.d}"/>`)
  .join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${anchoTotal.toFixed(0)} ${alturaTotal.toFixed(0)}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
${pathsMarkup}
</svg>
`;

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
fs.writeFileSync(SALIDA, svg, 'utf8');

console.log(`✔ SVG generado: ${SALIDA}`);
console.log(`  viewBox: 0 0 ${anchoTotal.toFixed(0)} ${alturaTotal.toFixed(0)}`);
console.log(`  Paths totales: ${todosPaths.length}`);
console.log(`  Alba: ${alba.paths.length} · &: ${amp.paths.length} · Antonio: ${antonio.paths.length}`);
