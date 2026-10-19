import { describe, expect, it } from "vitest"
import { sealRingSvg, sealRingText } from "../src/lib/seal"

describe("seal ring", () => {
  it("repeats the uppercase text to fill the circumference without cutting words", () => {
    expect(sealRingText("aws · ")).toBe("AWS · ".repeat(11))
    expect(sealRingText("x".repeat(90))).toBe("X".repeat(90))
    expect(sealRingText("")).toBe("")
  })

  it("respects the locale when uppercasing", () => {
    expect(sealRingText("académico · ", "es")).toContain("ACADÉMICO · ")
  })

  it("renders a white luminance mask with escaped text on the ring path", () => {
    const svg = sealRingSvg('R&D <"lab"> · ')
    expect(svg).toContain('fill="#fff"')
    expect(svg).toContain('href="#ring"')
    expect(svg).toContain("R&amp;D &lt;&quot;LAB&quot;&gt; · ")
    expect(svg).not.toMatch(/<(?!\/?(svg|defs|path|text|textPath)\b)/)
  })
})
