// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest"
import { loadMotionLayer } from "../src/scripts/motion/loaders"

const harness = vi.hoisted(() => ({
  gsap: {
    registerPlugin: vi.fn((..._plugins: unknown[]) => {}),
  },
  ScrollTrigger: { create: vi.fn() },
  Flip: { fit: vi.fn() },
}))

vi.mock("gsap", () => ({
  gsap: harness.gsap,
  default: harness.gsap,
}))

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: harness.ScrollTrigger,
  default: harness.ScrollTrigger,
}))

vi.mock("gsap/Flip", () => ({
  Flip: harness.Flip,
  default: harness.Flip,
}))

describe("motion plugin registration", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("registers Flip before returning it to the controller", async () => {
    const libraries = await loadMotionLayer({ webgl: false, flip: true })

    expect(libraries.Flip).toBe(harness.Flip)
    expect(harness.gsap.registerPlugin).toHaveBeenCalledWith(harness.Flip)
  })

  it("does not register Flip when the layer does not load it", async () => {
    const libraries = await loadMotionLayer({ webgl: false, flip: false })

    expect(libraries.Flip).toBeNull()
    expect(harness.gsap.registerPlugin).not.toHaveBeenCalled()
  })
})
