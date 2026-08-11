/**
 * Genera public/img/svg/monogramas/nombres.svg
 * Extrae glifos de Great Vibes con opentype.js, glifo por glifo (sin ligaduras),
 * y compone un SVG con paths animables via stroke-dashoffset.
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
 * Genera un path SVG para un texto colocando cada glifo manualmente.
 * Devuelve { pathData, ancho }.
 */
function textoAPath(texto, xInicio) {
  let x = xInicio;
  let d = '';
  for (const ch of texto) {
    const glyph = font.charToGlyph(ch);
    if (!glyph) continue;
    const p = glyph.getPath(x, baseline, FONT_SIZE);
    d += p.toPathData(2) + ' ';
    x += glyph.advanceWidth * scale;
  }
  return { d: d.trim(), ancho: x - xInicio };
}

// Componer
const albaX = PADDING;
const alba = textoAPath('Alba', albaX);

const espacio1 = FONT_SIZE * 0.15;
const ampX = albaX + alba.ancho + espacio1;
const amp = textoAPath('&', ampX);

const espacio2 = FONT_SIZE * 0.15;
const antonioX = ampX + amp.ancho + espacio2;
const antonio = textoAPath('Antonio', antonioX);

const anchoTotal = antonioX + antonio.ancho + PADDING;
const alturaTotal = FONT_SIZE * 1.5 + PADDING;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${anchoTotal.toFixed(0)} ${alturaTotal.toFixed(0)}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
  <path class="alba"    d="${alba.d}"/>
  <path class="amp"     d="${amp.d}"/>
  <path class="antonio" d="${antonio.d}"/>
</svg>
`;

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
fs.writeFileSync(SALIDA, svg, 'utf8');

console.log(`✔ SVG generado: ${SALIDA}`);
console.log(`  viewBox: 0 0 ${anchoTotal.toFixed(0)} ${alturaTotal.toFixed(0)}`);
console.log(`  Alba:    ${alba.d.length} chars`);
console.log(`  &:       ${amp.d.length} chars`);
console.log(`  Antonio: ${antonio.d.length} chars`);
