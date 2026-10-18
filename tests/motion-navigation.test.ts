// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest"

import { createMotionBootstrap } from "../src/scripts/motion/bootstrap"
import type { MotionController } from "../src/scripts/motion/types"

function createController() {
  return {
    status: "idle" as const,
    init: vi.fn(),
    refresh: vi.fn(),
    destroy: vi.fn(),
    cleanup: vi.fn(),
  } satisfies MotionController
}

function createScope() {
  return document.implementation.createHTMLDocument("navigation")
}

describe("motion bootstrap navigation lifecycle", () => {
  it("leaves the initial page-load to the deferred hero startup", () => {
    const scope = createScope()
    const factory = vi.fn(() => createController())

    createMotionBootstrap(factory, { scope })
    scope.dispatchEvent(new Event("astro:page-load"))

    expect(factory).not.toHaveBeenCalled()
  })

  it("destroys and cleans before the swap, then builds a fresh controller on page-load", () => {
    const scope = createScope()
    const first = createController()
    const second = createController()
    const factory = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second)
    const bootstrap = createMotionBootstrap(factory, { scope })

    bootstrap.start()
    expect(first.init).toHaveBeenCalledTimes(1)

    scope.dispatchEvent(new Event("astro:before-swap"))

    expect(first.destroy).toHaveBeenCalledTimes(1)
    expect(first.cleanup).toHaveBeenCalledTimes(1)
    expect(bootstrap.controller).toBeNull()

    scope.dispatchEvent(new Event("astro:page-load"))

    expect(factory).toHaveBeenCalledTimes(2)
    expect(second.init).toHaveBeenCalledTimes(1)
    expect(first.destroy.mock.invocationCallOrder[0]).toBeLessThan(
      second.init.mock.invocationCallOrder[0],
    )
    expect(bootstrap.controller).toBe(second)
  })

  it("starts only once per navigation", () => {
    const scope = createScope()
    const factory = vi.fn(() => createController())
    createMotionBootstrap(factory, { scope })

    scope.dispatchEvent(new Event("astro:before-swap"))
    scope.dispatchEvent(new Event("astro:page-load"))
    scope.dispatchEvent(new Event("astro:page-load"))

    expect(factory).toHaveBeenCalledTimes(1)
  })

  it("releases the active controller even if no page-load follows the swap", () => {
    const scope = createScope()
    const controller = createController()
    const bootstrap = createMotionBootstrap(() => controller, { scope })

    bootstrap.start()
    scope.dispatchEvent(new Event("astro:before-swap"))

    expect(controller.destroy).toHaveBeenCalledTimes(1)
    expect(controller.cleanup).toHaveBeenCalledTimes(1)
  })
})
