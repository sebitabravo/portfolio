// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  setupPortfolioMotion,
  shouldLoadWebGLEnhancement,
  teardownPortfolioMotion,
} from "../src/scripts/portfolio-motion"

const motionHarness = vi.hoisted(() => {
  const media = {
    add: vi.fn(),
    revert: vi.fn(),
  }
  const timeline = {
    scrollTrigger: { kill: vi.fn() },
    kill: vi.fn(),
  }
  const sectionTrigger = { kill: vi.fn() }
  const sceneCleanup = vi.fn()
  const pointerCleanup = vi.fn()
  const cardCleanup = vi.fn()

  return {
    conditions: { reduceMotion: false, finePointer: true },
    media,
    timeline,
    sectionTrigger,
    sceneCleanup,
    pointerCleanup,
    cardCleanup,
    gsap: {
      registerPlugin: vi.fn(),
      matchMedia: vi.fn(() => media),
      fromTo: vi.fn(() => timeline),
    },
    ScrollTrigger: {
      create: vi.fn((_options: unknown) => sectionTrigger),
    },
    createHeroScene: vi.fn((_canvas: HTMLCanvasElement) => {
      _canvas.dataset.webglStatus = "ready"
      return sceneCleanup
    }),
    createPointerMotion: vi.fn(() => pointerCleanup),
    createCardTilt: vi.fn(() => cardCleanup),
  }
})

vi.mock("gsap", () => ({
  gsap: motionHarness.gsap,
  default: motionHarness.gsap,
}))

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: motionHarness.ScrollTrigger,
  default: motionHarness.ScrollTrigger,
}))

vi.mock("../src/scripts/hero-webgl", () => ({
  createHeroScene: motionHarness.createHeroScene,
}))

vi.mock("../src/scripts/motion-interactions", () => ({
  createPointerMotion: motionHarness.createPointerMotion,
  createCardTilt: motionHarness.createCardTilt,
}))

describe("portfolio motion gates", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
    vi.clearAllMocks()
    motionHarness.conditions.reduceMotion = false
    motionHarness.conditions.finePointer = true
    motionHarness.media.add.mockImplementation((_queries, callback) => {
      const contextCleanup = callback({ conditions: motionHarness.conditions })
      motionHarness.media.revert.mockImplementation(() => contextCleanup?.())
    })
  })

  afterEach(() => {
    teardownPortfolioMotion()
    vi.unstubAllGlobals()
    document.body.innerHTML = ""
  })

  it("does not load WebGL on data-saving, slow or low-memory devices", () => {
    expect(shouldLoadWebGLEnhancement({ saveData: true }, 8)).toBe(false)
    expect(shouldLoadWebGLEnhancement({ effectiveType: "2g" }, 8)).toBe(false)
    expect(shouldLoadWebGLEnhancement({ effectiveType: "slow-2g" }, 8)).toBe(false)
    expect(shouldLoadWebGLEnhancement({}, 1)).toBe(false)
    expect(shouldLoadWebGLEnhancement({}, undefined)).toBe(true)
    expect(shouldLoadWebGLEnhancement({}, 2)).toBe(true)
  })

  it("keeps the HTML state visible and cancels deferred loading on teardown", () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `
    const idleCallback = vi.fn()
    const cancelIdleCallback = vi.fn()
    vi.stubGlobal("requestIdleCallback", (callback: () => void) => {
      idleCallback.mockImplementationOnce(callback)
      return 42
    })
    vi.stubGlobal("cancelIdleCallback", cancelIdleCallback)

    setupPortfolioMotion()

    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!
    const canvas = document.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!
    expect(root.dataset.motionStatus).toBe("loading")
    expect(canvas.dataset.webglStatus).toBe("pending")

    teardownPortfolioMotion()

    expect(cancelIdleCallback).toHaveBeenCalledWith(42)
    expect(root.dataset.motionStatus).toBe("loading")
  })

  it("does nothing when the motion root is not present", () => {
    expect(() => setupPortfolioMotion()).not.toThrow()
  })

  it("loads the active motion layer and tears down GSAP, WebGL and scroll state", async () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
      <section id="projects">
        <div data-project-scroll-meter><span></span></div>
        <div data-projects-list>
          <article data-project-card></article>
        </div>
      </section>
    `
    let idleCallback: (() => void) | undefined
    const cancelIdleCallback = vi.fn()
    Object.defineProperty(window, "requestIdleCallback", {
      configurable: true,
      value: vi.fn((callback: () => void) => {
        idleCallback = callback
        return 101
      }),
    })
    Object.defineProperty(window, "cancelIdleCallback", {
      configurable: true,
      value: cancelIdleCallback,
    })
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: false })),
    })

    setupPortfolioMotion()
    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!
    const canvas = document.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!
    const grid = document.querySelector<HTMLElement>("[data-projects-list]")!
    const meter = document.querySelector<HTMLElement>("[data-project-scroll-meter] span")!
    expect(root.dataset.motionStatus).toBe("loading")
    expect(canvas.dataset.webglStatus).toBe("pending")

    idleCallback?.()
    await vi.waitFor(() => expect(root.dataset.motionStatus).toBe("active"))

    expect(motionHarness.gsap.registerPlugin).toHaveBeenCalledWith(motionHarness.ScrollTrigger)
    expect(motionHarness.createHeroScene).toHaveBeenCalledWith(canvas, root)
    expect(motionHarness.createPointerMotion).toHaveBeenCalledWith(motionHarness.gsap, root)
    expect(motionHarness.gsap.fromTo).toHaveBeenCalledWith(
      [expect.any(HTMLElement)],
      expect.objectContaining({ "--motion-y": "1.2rem" }),
      expect.objectContaining({ "--motion-scale": 1 }),
    )

    const scrollOptions = motionHarness.ScrollTrigger.create.mock.calls[0]?.[0] as {
      onUpdate: (instance: { progress: number }) => void
    }
    scrollOptions.onUpdate({ progress: 0.625 })
    expect(grid.style.getPropertyValue("--project-progress")).toBe("0.625")
    expect(meter.style.transform).toBe("scaleX(0.625)")

    teardownPortfolioMotion()

    expect(cancelIdleCallback).not.toHaveBeenCalled()
    expect(motionHarness.media.revert).toHaveBeenCalled()
    expect(motionHarness.timeline.scrollTrigger.kill).toHaveBeenCalled()
    expect(motionHarness.timeline.kill).toHaveBeenCalled()
    expect(motionHarness.sectionTrigger.kill).toHaveBeenCalled()
    expect(motionHarness.sceneCleanup).toHaveBeenCalled()
    expect(motionHarness.pointerCleanup).toHaveBeenCalled()
    expect(motionHarness.cardCleanup).toHaveBeenCalled()
    expect(grid.style.getPropertyValue("--project-progress")).toBe("")
    expect(meter.style.transform).toBe("scaleX(0)")
  })

  it("marks the layer reduced and skips enhancements when reduced motion is active", async () => {
    document.body.innerHTML = `
      <section data-portfolio-motion>
        <canvas data-hero-webgl></canvas>
      </section>
    `
    motionHarness.conditions.reduceMotion = true
    motionHarness.conditions.finePointer = false
    let idleCallback: (() => void) | undefined
    Object.defineProperty(window, "requestIdleCallback", {
      configurable: true,
      value: vi.fn((callback: () => void) => {
        idleCallback = callback
        return 202
      }),
    })
    Object.defineProperty(window, "cancelIdleCallback", {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    })

    setupPortfolioMotion()
    idleCallback?.()
    await vi.waitFor(() => {
      expect(document.querySelector<HTMLElement>("[data-portfolio-motion]")?.dataset.motionStatus).toBe("reduced")
    })

    expect(document.querySelector<HTMLCanvasElement>("[data-hero-webgl]")?.dataset.webglStatus).toBe("reduced")
    expect(motionHarness.createHeroScene).not.toHaveBeenCalled()
    expect(motionHarness.createPointerMotion).not.toHaveBeenCalled()
  })
})
