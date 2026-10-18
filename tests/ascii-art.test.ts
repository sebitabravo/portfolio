import { describe, expect, it } from "vitest"
import { ASCII_RAMP, luminanceToChar, pixelsToAscii } from "../src/lib/ascii-art"

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
