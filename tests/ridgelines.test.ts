import { describe, expect, it } from "vitest"
import { createRandom, createRidgelines, createValueNoise, fbm, smoothstep } from "../src/lib/ridgelines"

describe("deterministic wallpaper primitives", () => {
  it("repeats the same pseudo-random sequence for the same seed", () => {
    const first = createRandom(42)
    const second = createRandom(42)
    const values = Array.from({ length: 5 }, () => first())
    expect(values).toEqual(Array.from({ length: 5 }, () => second()))
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true)
    expect(createRandom(43)()).not.toBe(values[0])
  })

  it("clamps smoothstep and handles degenerate edges", () => {
    expect(smoothstep(0, 1, -1)).toBe(0)
    expect(smoothstep(0, 1, 2)).toBe(1)
    expect(smoothstep(0, 1, 0.5)).toBe(0.5)
    expect(smoothstep(1, 1, 0.5)).toBe(0)
    expect(smoothstep(1, 1, 2)).toBe(1)
  })

  it("produces continuous value noise inside the unit range, also for negative inputs", () => {
    const noise = createValueNoise(7)
    for (const x of [-300.5, -1.25, 0, 0.5, 12.75, 400.1]) {
      const value = noise(x)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
    expect(Math.abs(noise(3.5) - noise(3.5001))).toBeLessThan(0.01)
  })

  it("normalizes fractal noise between zero and one", () => {
    const noise = createValueNoise(11)
    const samples = Array.from({ length: 50 }, (_, index) => fbm(noise, index * 0.37, 5))
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...samples)).toBeLessThanOrEqual(1)
  })
})

describe("ridgeline wallpaper", () => {
  const options = { width: 1600, height: 1000, horizon: 585, rows: 6, samples: 12, seed: 2026 }

  it("draws one closed path per row from far to near", () => {
    const lines = createRidgelines(options)
    expect(lines).toHaveLength(6)
    expect(lines.map((line) => line.depth)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    for (const line of lines) {
      expect(line.d.startsWith("M-12 ")).toBe(true)
      expect(line.d.endsWith("Z")).toBe(true)
      // Cada cresta tiene una muestra por columna más los tramos de cierre fuera del viewBox.
      expect(line.d.split("L")).toHaveLength(12 + 4)
      expect(line.d).toContain(`L${1600 + 12} ${1000 + 60}`)
    }
  })

  it("is reproducible and keeps every ridge between the sky and the bottom edge", () => {
    expect(createRidgelines(options)).toEqual(createRidgelines(options))
    for (const line of createRidgelines(options)) {
      const heights = line.d
        .slice(1, -1)
        .split("L")
        .map((point) => Number(point.split(" ")[1]))
      expect(Math.min(...heights)).toBeGreaterThan(300)
      expect(Math.max(...heights)).toBeLessThanOrEqual(1060)
    }
  })

  it("supports a single row at full depth", () => {
    expect(createRidgelines({ ...options, rows: 1 })[0].depth).toBe(1)
  })
})
