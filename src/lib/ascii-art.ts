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
