import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const heroCss = readFileSync("src/styles/portfolio-hero.css", "utf8")
const baseCss = readFileSync("src/styles/portfolio-base.css", "utf8")

function channel(value: number): number {
  const normalized = value / 255
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const values = hex.slice(1).match(/../g)?.map((part) => Number.parseInt(part, 16))
  if (!values || values.length !== 3) throw new Error(`Invalid color: ${hex}`)
  return 0.2126 * channel(values[0]) + 0.7152 * channel(values[1]) + 0.0722 * channel(values[2])
}

function contrast(foreground: string, background: string): number {
  const foregroundLuminance = luminance(foreground)
  const backgroundLuminance = luminance(background)
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
}

describe("hero contrast contract", () => {
  it("keeps the faint hero token above WCAG AA on both base canvases", () => {
    expect(heroCss).toContain("--hero-faint: #4c527b")
    expect(heroCss).toContain("--hero-faint: #bac5ef")
    expect(contrast("#4c527b", "#f6f5ff")).toBeGreaterThanOrEqual(4.5)
    expect(contrast("#bac5ef", "#10143a")).toBeGreaterThanOrEqual(4.5)
  })

  it("keeps both surname gradient stops and the availability badge readable", () => {
    expect(heroCss).toContain("#3730a3")
    expect(heroCss).toContain("#312e81")
    expect(baseCss).toContain("color: #166534")
    expect(contrast("#3730a3", "#f6f5ff")).toBeGreaterThanOrEqual(4.5)
    expect(contrast("#312e81", "#f6f5ff")).toBeGreaterThanOrEqual(4.5)
    expect(contrast("#8873e8", "#10143a")).toBeGreaterThanOrEqual(4.5)
    expect(contrast("#166534", "#dcfce7")).toBeGreaterThanOrEqual(4.5)
  })
})
