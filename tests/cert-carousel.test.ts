// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { initCertCarousel, teardownCertCarousel } from "../src/scripts/cert-carousel"

type FrameQueue = {
  raf: ReturnType<typeof vi.fn>
  caf: ReturnType<typeof vi.fn>
  flush: (timestamp: number) => void
  isScheduled: () => boolean
}

function createFrameQueue(): FrameQueue {
  let pending: FrameRequestCallback | null = null
  let nextId = 0
  const raf = vi.fn((callback: FrameRequestCallback) => {
    pending = callback
    return ++nextId
  })
  const caf = vi.fn(() => {
    pending = null
  })
  vi.stubGlobal("requestAnimationFrame", raf)
  vi.stubGlobal("cancelAnimationFrame", caf)
  return {
    raf,
    caf,
    flush: (timestamp: number) => {
      const callback = pending
      pending = null
      callback?.(timestamp)
    },
    isScheduled: () => pending !== null,
  }
}

type MotionQuery = MediaQueryList & { emitChange: () => void }

function createMotionQuery(initialMatches: boolean): MotionQuery {
  let matches = initialMatches
  const listeners = new Set<() => void>()
  return {
    get matches() {
      return matches
    },
    set matches(value: boolean) {
      matches = value
    },
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions) => {
      const fn = listener as () => void
      listeners.add(fn)
      options?.signal?.addEventListener("abort", () => listeners.delete(fn))
    },
    removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.delete(listener as () => void)
    },
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => true,
    onchange: null,
    emitChange: () => listeners.forEach((listener) => listener()),
  } as MotionQuery
}

class FakeIntersectionObserver {
  callback: IntersectionObserverCallback
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    intersectionInstances.push(this)
  }
}

let intersectionInstances: FakeIntersectionObserver[]

function renderCarousel() {
  document.body.innerHTML = `
    <div id="certCarouselContainer">
      <div id="certCarouselWrapper">
        <div id="certCarousel"></div>
      </div>
      <button id="certNavPrev" type="button">Prev</button>
      <button id="certNavNext" type="button">Next</button>
    </div>
    <button id="outsideControl" type="button">Outside</button>
  `
}

function setScrollMetrics(wrapper: HTMLElement, scrollWidth: number, scrollLeft = 0) {
  Object.defineProperty(wrapper, "scrollWidth", { configurable: true, value: scrollWidth })
  wrapper.scrollLeft = scrollLeft
  wrapper.scrollBy = vi.fn(({ left = 0 }: ScrollToOptions) => {
    wrapper.scrollLeft += left
  })
}

function stubHover(container: HTMLElement, hovered: () => boolean) {
  container.matches = vi.fn(() => hovered()) as typeof container.matches
}

describe("certification carousel lifecycle", () => {
  let frames: FrameQueue
  let motion: MotionQuery

  beforeEach(() => {
    teardownCertCarousel()
    intersectionInstances = []
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver)
    frames = createFrameQueue()
    motion = createMotionQuery(false)
    vi.stubGlobal("matchMedia", vi.fn(() => motion))
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" })
    renderCarousel()
  })

  afterEach(() => {
    teardownCertCarousel()
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  it("does not throw when the carousel markup is entirely absent", () => {
    document.body.innerHTML = ""
    expect(() => initCertCarousel()).not.toThrow()
  })

  it("does not throw and attaches no listeners when only the nav buttons are missing", () => {
    document.body.innerHTML = `
      <div id="certCarouselContainer">
        <div id="certCarouselWrapper"><div id="certCarousel"></div></div>
      </div>
    `
    expect(() => initCertCarousel()).not.toThrow()
    expect(intersectionInstances).toHaveLength(0)
  })

  it("auto-scrolls the track once intersecting, unhovered and unfocused", () => {
    const wrapper = document.getElementById("certCarouselWrapper")!
    setScrollMetrics(wrapper, 1000)
    initCertCarousel()

    intersectionInstances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], intersectionInstances[0] as unknown as IntersectionObserver)
    expect(frames.isScheduled()).toBe(true)

    frames.flush(16)
    frames.flush(1016)

    expect(wrapper.scrollLeft).toBe(40)
  })

  it("wraps the scroll position back to zero after crossing the halfway duplicate point", () => {
    const wrapper = document.getElementById("certCarouselWrapper")!
    setScrollMetrics(wrapper, 60)
    initCertCarousel()

    intersectionInstances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], intersectionInstances[0] as unknown as IntersectionObserver)
    frames.flush(16)
    frames.flush(1016)

    expect(wrapper.scrollLeft).toBe(0)
  })

  it("stops auto-scroll once the carousel leaves the viewport", () => {
    const container = document.getElementById("certCarouselContainer")!
    const wrapper = document.getElementById("certCarouselWrapper")!
    stubHover(container, () => false)
    setScrollMetrics(wrapper, 1000)
    initCertCarousel()
    intersectionInstances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], intersectionInstances[0] as unknown as IntersectionObserver)
    expect(frames.isScheduled()).toBe(true)

    intersectionInstances[0].callback([{ isIntersecting: false } as IntersectionObserverEntry], intersectionInstances[0] as unknown as IntersectionObserver)
    expect(frames.isScheduled()).toBe(false)
  })

  it("pauses auto-scroll on mouseenter and resumes on mouseleave", () => {
    const container = document.getElementById("certCarouselContainer")!
    const wrapper = document.getElementById("certCarouselWrapper")!
    setScrollMetrics(wrapper, 1000)
    let hovered = false
    stubHover(container, () => hovered)
    initCertCarousel()
    intersectionInstances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], intersectionInstances[0] as unknown as IntersectionObserver)
    expect(frames.isScheduled()).toBe(true)

    hovered = true
    container.dispatchEvent(new Event("mouseenter"))
    expect(frames.caf).toHaveBeenCalled()
    expect(frames.isScheduled()).toBe(false)

    hovered = false
    container.dispatchEvent(new Event("mouseleave"))
    expect(frames.isScheduled()).toBe(true)
  })

  it("pauses auto-scroll while a nav button has keyboard focus and resumes after focus leaves", async () => {
    const container = document.getElementById("certCarouselContainer")!
    const wrapper = document.getElementById("certCarouselWrapper")!
    const nextBtn = document.getElementById("certNavNext") as HTMLButtonElement
    const outside = document.getElementById("outsideControl") as HTMLButtonElement
    setScrollMetrics(wrapper, 1000)
    stubHover(container, () => false)
    initCertCarousel()
    intersectionInstances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], intersectionInstances[0] as unknown as IntersectionObserver)
    expect(frames.isScheduled()).toBe(true)

    nextBtn.focus()
    expect(frames.isScheduled()).toBe(false)

    outside.focus()
    await Promise.resolve()
    expect(frames.isScheduled()).toBe(true)
  })

  it("never starts auto-scroll while reduced motion is preferred", () => {
    const wrapper = document.getElementById("certCarouselWrapper")!
    setScrollMetrics(wrapper, 1000)
    motion.matches = true
    initCertCarousel()

    intersectionInstances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], intersectionInstances[0] as unknown as IntersectionObserver)

    expect(frames.isScheduled()).toBe(false)
    expect(wrapper.scrollLeft).toBe(0)
  })

  it("stops a running auto-scroll when reduced motion is toggled on, and resumes when toggled off", () => {
    const container = document.getElementById("certCarouselContainer")!
    const wrapper = document.getElementById("certCarouselWrapper")!
    stubHover(container, () => false)
    setScrollMetrics(wrapper, 1000)
    initCertCarousel()
    intersectionInstances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], intersectionInstances[0] as unknown as IntersectionObserver)
    expect(frames.isScheduled()).toBe(true)

    motion.matches = true
    motion.emitChange()
    expect(frames.isScheduled()).toBe(false)

    motion.matches = false
    motion.emitChange()
    expect(frames.isScheduled()).toBe(true)
  })

  it("pauses when the document becomes hidden and resumes when it becomes visible again", () => {
    const container = document.getElementById("certCarouselContainer")!
    const wrapper = document.getElementById("certCarouselWrapper")!
    stubHover(container, () => false)
    setScrollMetrics(wrapper, 1000)
    initCertCarousel()
    intersectionInstances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], intersectionInstances[0] as unknown as IntersectionObserver)
    expect(frames.isScheduled()).toBe(true)

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" })
    document.dispatchEvent(new Event("visibilitychange"))
    expect(frames.isScheduled()).toBe(false)

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" })
    document.dispatchEvent(new Event("visibilitychange"))
    expect(frames.isScheduled()).toBe(true)
  })

  it("moves the track left and right through the nav buttons", () => {
    const wrapper = document.getElementById("certCarouselWrapper")!
    const prevBtn = document.getElementById("certNavPrev") as HTMLButtonElement
    const nextBtn = document.getElementById("certNavNext") as HTMLButtonElement
    setScrollMetrics(wrapper, 1000, 400)
    initCertCarousel()

    prevBtn.click()
    expect(wrapper.scrollBy).toHaveBeenCalledWith({ left: -350, behavior: "smooth" })
    expect(wrapper.scrollLeft).toBe(50)

    nextBtn.click()
    expect(wrapper.scrollBy).toHaveBeenCalledWith({ left: 350, behavior: "smooth" })
    expect(wrapper.scrollLeft).toBe(400)
  })

  it("wraps the scroll position back after the next button crosses the duplicate boundary", () => {
    const wrapper = document.getElementById("certCarouselWrapper")!
    const nextBtn = document.getElementById("certNavNext") as HTMLButtonElement
    setScrollMetrics(wrapper, 1000, 160)
    initCertCarousel()

    nextBtn.click()
    expect(wrapper.scrollLeft).toBe(510)

    wrapper.dispatchEvent(new Event("scrollend"))
    expect(wrapper.scrollLeft).toBe(10)
  })

  it("does not adjust scroll position on scrollend when the boundary was not crossed", () => {
    const wrapper = document.getElementById("certCarouselWrapper")!
    const nextBtn = document.getElementById("certNavNext") as HTMLButtonElement
    setScrollMetrics(wrapper, 1000, 0)
    initCertCarousel()

    nextBtn.click()
    expect(wrapper.scrollLeft).toBe(350)

    wrapper.dispatchEvent(new Event("scrollend"))
    expect(wrapper.scrollLeft).toBe(350)
  })

  it("re-initializing tears down the previous listeners instead of stacking them", () => {
    const wrapper = document.getElementById("certCarouselWrapper")!
    const nextBtn = document.getElementById("certNavNext") as HTMLButtonElement
    setScrollMetrics(wrapper, 1000, 0)
    initCertCarousel()
    initCertCarousel()

    nextBtn.click()
    expect(wrapper.scrollBy).toHaveBeenCalledTimes(1)
    expect(wrapper.scrollLeft).toBe(350)
  })

  it("teardownCertCarousel cancels the animation frame and removes listeners", () => {
    const container = document.getElementById("certCarouselContainer")!
    const wrapper = document.getElementById("certCarouselWrapper")!
    const nextBtn = document.getElementById("certNavNext") as HTMLButtonElement
    stubHover(container, () => false)
    setScrollMetrics(wrapper, 1000, 0)
    initCertCarousel()
    intersectionInstances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], intersectionInstances[0] as unknown as IntersectionObserver)
    expect(frames.isScheduled()).toBe(true)

    teardownCertCarousel()
    expect(frames.caf).toHaveBeenCalled()
    expect(frames.isScheduled()).toBe(false)
    expect(intersectionInstances[0].disconnect).toHaveBeenCalled()

    nextBtn.click()
    expect(wrapper.scrollBy).not.toHaveBeenCalled()
  })
})
