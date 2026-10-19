import { describe, expect, it } from "vitest"
import { ASCII_RAMP, asciiToSvg, luminanceToChar, pixelsToAscii, svgDataUri } from "../src/lib/ascii-art"

describe("ASCII portrait", () => {
  it("maps luminance from empty to dense characters", () => {
    expect(luminanceToChar(0)).toBe(" ")
    expect(luminanceToChar(255)).toBe("@")
    expect(luminanceToChar(128)).toBe(ASCII_RAMP[5])
  })

  it("clamps invalid and out-of-range values", () => {
    expect(luminanceToChar(Number.NaN)).toBe(" ")
    expect(luminanceToChar(-20)).toBe(" ")
    expect(luminanceToChar(999)).toBe("@")
    expect(luminanceToChar(100, "")).toBe("")
    expect(luminanceToChar(200, "ab")).toBe("b")
  })

  it("builds one line per row and trims trailing blanks", () => {
    const pixels = [255, 0, 0, 0, 255, 0]
    expect(pixelsToAscii(pixels, 3, 2)).toBe("@\n @")
  })

  it("returns an empty portrait for invalid dimensions or short buffers", () => {
    expect(pixelsToAscii([1, 2, 3], 0, 2)).toBe("")
    expect(pixelsToAscii([1, 2, 3], 2, 2)).toBe("")
  })
})

describe("ASCII portrait as an image", () => {
  it("sizes the canvas from the widest row and pads every row to it", () => {
    const svg = asciiToSvg("@@\n@", { color: "#7dffa0" })
    expect(svg).toContain('viewBox="0 0 12 24"')
    expect(svg.match(/<text /g)).toHaveLength(2)
    expect(svg).toContain(">@ </text>")
    expect(svg.match(/textLength="12"/g)).toHaveLength(2)
    expect(svg).toContain('xml:space="preserve"')
    expect(svg).not.toContain("filter")
  })

  it("escapes markup characters and adds the phosphor glow on request", () => {
    const svg = asciiToSvg('<&">', { color: '"red"', glow: true })
    expect(svg).toContain("&lt;&amp;&quot;&gt;")
    expect(svg).toContain('fill="&quot;red&quot;"')
    expect(svg).toContain('filter="url(#glow)"')
  })

  it("returns an empty canvas for an empty portrait", () => {
    expect(asciiToSvg("", { color: "#fff" })).toContain('viewBox="0 0 0 0"')
  })

  it("encodes the SVG as a data URI", () => {
    expect(svgDataUri("<svg/>")).toBe("data:image/svg+xml,%3Csvg%2F%3E")
  })
})
