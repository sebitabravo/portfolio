import { describe, expect, it } from "vitest"
import { heroScrollProgress, storyProgress } from "../src/scripts/hero-camera"

describe("hero scroll progress", () => {
  it("starts at zero before scrolling", () => {
    expect(heroScrollProgress(0, 800)).toBe(0)
  })

  it("maps half the hero height to half progress", () => {
    expect(heroScrollProgress(400, 800)).toBe(0.5)
  })

  it("clamps progress to one after the hero leaves", () => {
    expect(heroScrollProgress(1200, 800)).toBe(1)
  })

  it("fails closed for invalid heights", () => {
    expect(heroScrollProgress(400, 0)).toBe(0)
    expect(heroScrollProgress(400, -10)).toBe(0)
    expect(heroScrollProgress(Number.NaN, 800)).toBe(0)
  })
})

describe("story progress", () => {
  const track = { top: 600, height: 3600 }

  it("starts when the track reaches the bottom of the header", () => {
    expect(storyProgress(544, track, 900, 56)).toBe(0)
    expect(storyProgress(0, track, 900, 56)).toBe(0)
  })

  it("maps the pinned distance linearly", () => {
    // Distancia fijada: 3600 - (900 - 56) = 2756.
    expect(storyProgress(544 + 1378, track, 900, 56)).toBeCloseTo(0.5, 5)
  })

  it("ends when the stage releases and clamps afterwards", () => {
    expect(storyProgress(544 + 2756, track, 900, 56)).toBe(1)
    expect(storyProgress(10_000, track, 900, 56)).toBe(1)
  })

  it("works with viewport-relative boxes", () => {
    expect(storyProgress(0, { top: 56 - 1378, height: 3600 }, 900, 56)).toBeCloseTo(0.5, 5)
  })

  it("returns null when there is no pinned distance or the input is invalid", () => {
    expect(storyProgress(0, { top: 600, height: 700 }, 900, 56)).toBeNull()
    expect(storyProgress(Number.NaN, track, 900, 56)).toBeNull()
    expect(storyProgress(0, { top: 600, height: Number.POSITIVE_INFINITY }, 900, 56)).toBeNull()
  })
})
