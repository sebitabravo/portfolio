// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { initReadingProgress } from "../src/scripts/reading-progress"

function renderBar() {
  document.body.innerHTML = `<div class="reading-progress" aria-hidden="true"><span data-reading-progress></span></div>`
}

function setScrollState({ scrollY, innerHeight, scrollHeight }: { scrollY: number; innerHeight: number; scrollHeight: number }) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: scrollY })
  Object.defineProperty(window, "innerHeight", { configurable: true, value: innerHeight })
  Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: scrollHeight })
}

function createFrameQueue() {
  let pending: FrameRequestCallback | null = null
  const raf = vi.fn((callback: FrameRequestCallback) => {
    pending = callback
    return 1
  })
  vi.stubGlobal("requestAnimationFrame", raf)
  vi.stubGlobal("cancelAnimationFrame", vi.fn(() => {
    pending = null
  }))
  return {
    raf,
    // requestAnimationFrame is genuinely async in browsers, so the frame only fires
    // when the test explicitly flushes it — a synchronous stub would let the
    // `progressFrame = requestAnimationFrame(...)` assignment race its own callback.
    flush: () => {
      const callback = pending
      pending = null
      callback?.(0)
    },
  }
}

describe("reading progress bar", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  it("does not throw when the progress bar element is absent", () => {
    document.body.innerHTML = ""
    createFrameQueue()
    expect(() => initReadingProgress()).not.toThrow()
  })

  it("sets scaleX from the current scroll ratio on init", () => {
    renderBar()
    const frames = createFrameQueue()
    setScrollState({ scrollY: 100, innerHeight: 800, scrollHeight: 1800 })

    initReadingProgress()
    frames.flush()

    const bar = document.querySelector<HTMLElement>("[data-reading-progress]")!
    expect(bar.style.transform).toBe("scaleX(0.1)")
  })

  it("updates scaleX in response to scroll events", () => {
    renderBar()
    const frames = createFrameQueue()
    setScrollState({ scrollY: 100, innerHeight: 800, scrollHeight: 1800 })
    initReadingProgress()
    frames.flush()

    setScrollState({ scrollY: 500, innerHeight: 800, scrollHeight: 1800 })
    window.dispatchEvent(new Event("scroll"))
    frames.flush()

    const bar = document.querySelector<HTMLElement>("[data-reading-progress]")!
    expect(bar.style.transform).toBe("scaleX(0.5)")
  })

  it("clamps the ratio to 1 when scroll position exceeds the scrollable range", () => {
    renderBar()
    const frames = createFrameQueue()
    setScrollState({ scrollY: 5000, innerHeight: 800, scrollHeight: 1800 })

    initReadingProgress()
    frames.flush()

    const bar = document.querySelector<HTMLElement>("[data-reading-progress]")!
    expect(bar.style.transform).toBe("scaleX(1)")
  })

  it("reports zero progress on a page shorter than the viewport", () => {
    renderBar()
    const frames = createFrameQueue()
    setScrollState({ scrollY: 0, innerHeight: 800, scrollHeight: 500 })

    initReadingProgress()
    frames.flush()

    const bar = document.querySelector<HTMLElement>("[data-reading-progress]")!
    expect(bar.style.transform).toBe("scaleX(0)")
  })

  it("coalesces rapid scroll events into a single pending animation frame", () => {
    renderBar()
    const frames = createFrameQueue()
    setScrollState({ scrollY: 100, innerHeight: 800, scrollHeight: 1800 })
    initReadingProgress()
    frames.flush()
    frames.raf.mockClear()

    setScrollState({ scrollY: 200, innerHeight: 800, scrollHeight: 1800 })
    window.dispatchEvent(new Event("scroll"))
    setScrollState({ scrollY: 300, innerHeight: 800, scrollHeight: 1800 })
    window.dispatchEvent(new Event("scroll"))
    setScrollState({ scrollY: 400, innerHeight: 800, scrollHeight: 1800 })
    window.dispatchEvent(new Event("scroll"))

    expect(frames.raf).toHaveBeenCalledTimes(1)

    frames.flush()
    const bar = document.querySelector<HTMLElement>("[data-reading-progress]")!
    expect(bar.style.transform).toBe("scaleX(0.4)")
  })

  it("re-initializing cancels a still-pending animation frame from the previous listener", () => {
    renderBar()
    const frames = createFrameQueue()
    setScrollState({ scrollY: 0, innerHeight: 800, scrollHeight: 1800 })
    initReadingProgress()
    frames.flush()

    setScrollState({ scrollY: 200, innerHeight: 800, scrollHeight: 1800 })
    window.dispatchEvent(new Event("scroll"))
    expect(frames.raf).toHaveBeenCalledTimes(2)

    initReadingProgress()
    frames.flush()

    const bar = document.querySelector<HTMLElement>("[data-reading-progress]")!
    expect(bar.style.transform).toBe("scaleX(0.2)")
  })

  it("re-initializing removes the previous scroll listener instead of stacking it", () => {
    renderBar()
    const frames = createFrameQueue()
    setScrollState({ scrollY: 0, innerHeight: 800, scrollHeight: 1800 })
    initReadingProgress()
    frames.flush()

    initReadingProgress()
    frames.flush()
    frames.raf.mockClear()

    setScrollState({ scrollY: 100, innerHeight: 800, scrollHeight: 1800 })
    window.dispatchEvent(new Event("scroll"))

    expect(frames.raf).toHaveBeenCalledTimes(1)
  })
})
