// Retrato ASCII calculado en build: la luminancia de cada muestra elige un
// carácter de la rampa, de lo vacío (oscuro) a lo denso (claro).

export const ASCII_RAMP = " .:-=+*#%@"

export function luminanceToChar(value: number, ramp: string = ASCII_RAMP): string {
  if (ramp.length === 0) return ""
  const normalized = Math.min(1, Math.max(0, Number.isFinite(value) ? value / 255 : 0))
  return ramp[Math.min(ramp.length - 1, Math.floor(normalized * ramp.length))]
}

export function pixelsToAscii(
  pixels: ArrayLike<number>,
  width: number,
  height: number,
  ramp: string = ASCII_RAMP,
): string {
  if (width <= 0 || height <= 0 || pixels.length < width * height) return ""
  const rows: string[] = []
  for (let row = 0; row < height; row += 1) {
    let line = ""
    for (let column = 0; column < width; column += 1) {
      line += luminanceToChar(pixels[row * width + column], ramp)
    }
    rows.push(line.trimEnd())
  }
  return rows.join("\n")
}

export interface AsciiSvgOptions {
  readonly color: string
  readonly glow?: boolean
}

// Celda de 1:2, la misma proporción con la que se muestreó la foto.
const CELL_WIDTH = 6
const CELL_HEIGHT = 12
const XML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }

const escapeXml = (value: string) => value.replace(/[&<>"]/g, (char) => XML_ESCAPES[char])

// El retrato es una imagen, no texto: cada fila se fija a todo el ancho con textLength,
// así la grilla se mantiene aunque el visor use otra fuente monoespaciada.
export function asciiToSvg(ascii: string, { color, glow = false }: AsciiSvgOptions): string {
  const rows = ascii === "" ? [] : ascii.split("\n")
  const columns = rows.reduce((widest, row) => Math.max(widest, row.length), 0)
  const width = columns * CELL_WIDTH
  const height = rows.length * CELL_HEIGHT
  const filter = glow
    ? '<filter id="glow"><feGaussianBlur stdDeviation="1.4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    : ""
  const lines = rows
    .map(
      (row, index) =>
        `<text x="0" y="${(index + 1) * CELL_HEIGHT - 2.5}" textLength="${width}" lengthAdjust="spacingAndGlyphs">${escapeXml(row.padEnd(columns, " "))}</text>`,
    )
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" xml:space="preserve">${filter}<g fill="${escapeXml(color)}" font-family="ui-monospace,Menlo,Consolas,'DejaVu Sans Mono',monospace" font-size="${CELL_HEIGHT * 0.82}"${glow ? ' filter="url(#glow)"' : ""}>${lines}</g></svg>`
}

export function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
