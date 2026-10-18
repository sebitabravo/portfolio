import { describe, expect, it } from "vitest"
import { shouldLoadWebGLEnhancement } from "../src/scripts/motion/environment"

describe("motion environment WebGL gate", () => {
  it("keeps Three.js off touch devices", () => {
    expect(shouldLoadWebGLEnhancement({}, 8, 1)).toBe(false)
    expect(shouldLoadWebGLEnhancement({}, 8, 5)).toBe(false)
  })

  it("keeps the existing network and memory gates", () => {
    expect(shouldLoadWebGLEnhancement({ saveData: true }, 8, 0)).toBe(false)
    expect(shouldLoadWebGLEnhancement({ effectiveType: "2g" }, 8, 0)).toBe(false)
    expect(shouldLoadWebGLEnhancement({}, 1, 0)).toBe(false)
    expect(shouldLoadWebGLEnhancement({}, 2, 0)).toBe(true)
  })
})
