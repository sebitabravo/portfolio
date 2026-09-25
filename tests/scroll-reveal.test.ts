// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { initScrollReveal } from "../src/scripts/scroll-reveal"

class FakeIntersectionObserver {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit | undefined
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    instances.push(this)
  }
}

let instances: FakeIntersectionObserver[]

function renderTargets(count: number) {
  document.body.innerHTML = Array.from({ length: count }, (_, i) => `<div data-animate id="el-${i}"></div>`).join("")
}

function setTop(element: HTMLElement, top: number) {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: vi.fn(() => ({ top, left: 0, right: 0, bottom: top, width: 0, height: 0 })),
  })
}

describe("scroll reveal lifecycle", () => {
  beforeEach(() => {
    instances = []
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver)
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 })
  })

  afterEach(() => {
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  it("does not throw on a page with no [data-animate] elements", () => {
    document.body.innerHTML = ""
    expect(() => initScrollReveal()).not.toThrow()
  })

  it("marks in-viewport elements as reveal-pending and observes every target", () => {
    renderTargets(2)
    const [inView, belowFold] = [document.getElementById("el-0")!, document.getElementById("el-1")!]
    setTop(inView, 100)
    setTop(belowFold, 2000)

    initScrollReveal()

    expect(inView.classList.contains("reveal-pending")).toBe(true)
    expect(belowFold.classList.contains("reveal-pending")).toBe(false)
    expect(instances[0].observe).toHaveBeenCalledWith(inView)
    expect(instances[0].observe).toHaveBeenCalledWith(belowFold)
  })

  it("clears stale animation classes before re-evaluating visibility", () => {
    renderTargets(1)
    const el = document.getElementById("el-0")!
    el.classList.add("animate-in", "reveal-pending")
    setTop(el, 2000)

    initScrollReveal()

    expect(el.classList.contains("animate-in")).toBe(false)
    expect(el.classList.contains("reveal-pending")).toBe(false)
  })

  it("reveals an intersecting element and stops observing it", () => {
    renderTargets(1)
    const el = document.getElementById("el-0")!
    setTop(el, 2000)
    initScrollReveal()

    instances[0].callback(
      [{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry],
      instances[0] as unknown as IntersectionObserver,
    )

    expect(el.classList.contains("reveal-pending")).toBe(true)
    expect(el.classList.contains("animate-in")).toBe(true)
    expect(instances[0].unobserve).toHaveBeenCalledWith(el)
  })

  it("ignores entries that are not yet intersecting", () => {
    renderTargets(1)
    const el = document.getElementById("el-0")!
    setTop(el, 2000)
    initScrollReveal()

    instances[0].callback(
      [{ isIntersecting: false, target: el } as unknown as IntersectionObserverEntry],
      instances[0] as unknown as IntersectionObserver,
    )

    expect(el.classList.contains("animate-in")).toBe(false)
    expect(instances[0].unobserve).not.toHaveBeenCalled()
  })

  it("leaves elements in their default state when IntersectionObserver is unavailable", () => {
    renderTargets(1)
    const el = document.getElementById("el-0")!
    setTop(el, 100)
    // @ts-expect-error simulating an environment without IntersectionObserver support
    delete window.IntersectionObserver

    expect(() => initScrollReveal()).not.toThrow()
    expect(el.classList.contains("reveal-pending")).toBe(false)
    expect(el.classList.contains("animate-in")).toBe(false)
    expect(instances).toHaveLength(0)
  })

  it("re-initializing disconnects the previous observer", () => {
    renderTargets(1)
    setTop(document.getElementById("el-0")!, 100)

    initScrollReveal()
    initScrollReveal()

    expect(instances).toHaveLength(2)
    expect(instances[0].disconnect).toHaveBeenCalled()
    expect(instances[1].disconnect).not.toHaveBeenCalled()
  })

  it("does not throw on a zero-height page where every element sits at the top", () => {
    renderTargets(1)
    const el = document.getElementById("el-0")!
    setTop(el, 0)
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 0 })

    expect(() => initScrollReveal()).not.toThrow()
    expect(el.classList.contains("reveal-pending")).toBe(true)
  })
})
