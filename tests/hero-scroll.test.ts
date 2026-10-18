import { describe, expect, it } from "vitest"
import { heroScrollProgress } from "../src/scripts/hero-webgl"

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
