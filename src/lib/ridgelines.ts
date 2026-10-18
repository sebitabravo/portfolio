// Crestas deterministas para el fondo SVG del escritorio: se calculan en build,
// así el paisaje existe sin JavaScript ni WebGL y no compite con el LCP.

export interface RidgelineOptions {
  readonly width: number
  readonly height: number
  readonly horizon: number
  readonly rows: number
  readonly samples: number
  readonly seed: number
}

export interface Ridgeline {
  readonly d: string
  readonly depth: number
}

export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const smooth = (value: number) => value * value * (3 - 2 * value)

export function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1
  return smooth(Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0))))
}

// Ruido de valor 1D con interpolación suave; la tabla se repite cada 256 celdas.
export function createValueNoise(seed: number): (x: number) => number {
  const random = createRandom(seed)
  const table = Array.from({ length: 256 }, () => random())
  return (x: number) => {
    const cell = Math.floor(x)
    const fraction = x - cell
    const start = table[((cell % 256) + 256) % 256]
    const end = table[(((cell + 1) % 256) + 256) % 256]
    return start + (end - start) * smooth(fraction)
  }
}

export function fbm(noise: (x: number) => number, x: number, octaves = 4): number {
  let total = 0
  let amplitude = 0.5
  let frequency = 1
  let normalizer = 0
  for (let octave = 0; octave < octaves; octave += 1) {
    total += noise(x * frequency) * amplitude
    normalizer += amplitude
    amplitude *= 0.5
    frequency *= 2.03
  }
  return total / normalizer
}

const round = (value: number) => Math.round(value * 10) / 10

export function createRidgelines(options: RidgelineOptions): Ridgeline[] {
  const { width, height, horizon, rows, samples, seed } = options
  const noise = createValueNoise(seed)
  const lines: Ridgeline[] = []

  for (let row = 0; row < rows; row += 1) {
    const depth = rows === 1 ? 1 : row / (rows - 1)
    // La perspectiva comprime las filas lejanas contra el horizonte.
    const baseline = horizon + (height - horizon) * depth ** 1.65
    const amplitude = 10 + 150 * depth ** 1.35
    const points: string[] = []

    for (let sample = 0; sample < samples; sample += 1) {
      const u = sample / (samples - 1)
      const x = u * width
      // Un valle central deja volar a la cámara entre dos cordilleras.
      const valley = smoothstep(0.06, 0.34, Math.abs(u - 0.5))
      const ridge = fbm(noise, u * (5 + depth * 3) + row * 0.43) ** 1.6
      points.push(`${round(x)} ${round(baseline - ridge * amplitude * (0.18 + valley * 0.82))}`)
    }

    const first = points[0].split(" ")[1]
    const last = points[points.length - 1].split(" ")[1]
    // Los tramos de cierre quedan fuera del viewBox: el trazo visible es solo la cresta.
    const d = `M-12 ${first}L${points.join("L")}L${width + 12} ${last}L${width + 12} ${height + 60}L-12 ${height + 60}Z`
    lines.push({ d, depth })
  }

  return lines
}
