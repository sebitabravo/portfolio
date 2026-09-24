// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import WebGL from "three/addons/capabilities/WebGL.js"
import {
  createHeroScene,
  createSignalLines,
  createSignalPositions,
} from "../src/scripts/hero-webgl"

const heroHarness = vi.hoisted(() => {
  const renderer = {
    setPixelRatio: vi.fn(),
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    forceContextLoss: vi.fn(),
  }

  return {
    renderer,
    WebGLRenderer: vi.fn(() => renderer),
  }
})

vi.mock("three", async () => {
  const actual = await vi.importActual<typeof import("three")>("three")
  return {
    ...actual,
    WebGLRenderer: heroHarness.WebGLRenderer,
  }
})

vi.mock("three/addons/capabilities/WebGL.js", () => ({
  default: {
    isWebGL2Available: vi.fn(),
  },
}))

describe("hero WebGL primitives", () => {
  let matchMediaDescriptor: PropertyDescriptor | undefined
  let devicePixelRatioDescriptor: PropertyDescriptor | undefined

  beforeEach(() => {
    matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, "matchMedia")
    devicePixelRatioDescriptor = Object.getOwnPropertyDescriptor(window, "devicePixelRatio")
    vi.clearAllMocks()
    heroHarness.WebGLRenderer.mockImplementation(() => heroHarness.renderer)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    if (matchMediaDescriptor) {
      Object.defineProperty(window, "matchMedia", matchMediaDescriptor)
    } else {
      Reflect.deleteProperty(window, "matchMedia")
    }
    if (devicePixelRatioDescriptor) {
      Object.defineProperty(window, "devicePixelRatio", devicePixelRatioDescriptor)
    } else {
      Reflect.deleteProperty(window, "devicePixelRatio")
    }
  })

  it("generates deterministic constellation positions with the requested shape", () => {
    const first = createSignalPositions(4)
    const second = createSignalPositions(4)

    expect(first).toHaveLength(12)
    expect([...first]).toEqual([...second])
    expect([...first].every(Number.isFinite)).toBe(true)
  })

  it("connects consecutive points without changing their coordinates", () => {
    const positions = new Float32Array([
      1, 2, 3,
      4, 5, 6,
      7, 8, 9,
    ])

    expect([...createSignalLines(positions)]).toEqual([
      1, 2, 3, 4, 5, 6,
      4, 5, 6, 7, 8, 9,
    ])
  })

  it("fails closed when WebGL2 is unavailable", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(false)
    const canvas = document.createElement("canvas")
    const root = document.createElement("div")
    root.append(canvas)

    const cleanup = createHeroScene(
      canvas,
      root as Parameters<typeof createHeroScene>[1],
    )

    expect(cleanup).toBeNull()
    expect(canvas.dataset.webglStatus).toBe("fallback")
  })

  it("runs the scene lifecycle, observers and pointer handlers before disposing", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)

    const frameCallbacks = new Map<number, FrameRequestCallback>()
    let nextFrame = 1
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      const id = nextFrame++
      frameCallbacks.set(id, callback)
      return id
    })
    const cancelAnimationFrame = vi.fn((id: number) => {
      frameCallbacks.delete(id)
    })
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame)
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame)
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 2 })

    const bounds = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 320,
      bottom: 180,
      width: 320,
      height: 180,
      toJSON: () => ({}),
    } as DOMRect
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(bounds)
    vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue(bounds)

    let resizeCallback: ResizeObserverCallback | undefined
    let intersectionCallback: IntersectionObserverCallback | undefined
    const resizeObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
    }
    const intersectionObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
    }
    class TestResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback
      }

      observe = resizeObserver.observe
      disconnect = resizeObserver.disconnect
    }
    class TestIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback
      }

      observe = intersectionObserver.observe
      disconnect = intersectionObserver.disconnect
    }
    vi.stubGlobal("ResizeObserver", TestResizeObserver)
    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver)

    let compactChange: ((event: MediaQueryListEvent) => void) | undefined
    const compactQuery = {
      matches: false,
      addEventListener: vi.fn((_type: string, listener: EventListenerOrEventListenerObject) => {
        compactChange = listener as (event: MediaQueryListEvent) => void
      }),
      removeEventListener: vi.fn(),
    }
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => compactQuery),
    })

    const root = document.createElement("section")
    const canvas = document.createElement("canvas")
    root.append(canvas)
    document.body.append(root)

    const cleanup = createHeroScene(
      canvas,
      root as Parameters<typeof createHeroScene>[1],
    )

    expect(cleanup).toEqual(expect.any(Function))
    expect(canvas.dataset.webglStatus).toBe("ready")
    expect(root.dataset.motionStatus).toBe("active")
    expect(heroHarness.renderer.setPixelRatio).toHaveBeenCalledWith(1.5)
    expect(heroHarness.renderer.setSize).toHaveBeenCalledWith(320, 180, false)
    expect(resizeObserver.observe).toHaveBeenCalledWith(canvas)
    expect(intersectionObserver.observe).toHaveBeenCalledWith(root)

    const firstFrame = requestAnimationFrame.mock.results[0]?.value as number
    frameCallbacks.get(firstFrame)?.(64)
    expect(heroHarness.renderer.render).toHaveBeenCalled()

    root.dispatchEvent(new PointerEvent("pointermove", { clientX: 240, clientY: 45 }))
    root.dispatchEvent(new PointerEvent("pointerleave"))
    document.dispatchEvent(new Event("visibilitychange"))
    resizeCallback?.([] as ResizeObserverEntry[], {} as ResizeObserver)
    compactChange?.({ matches: true } as MediaQueryListEvent)
    expect(heroHarness.renderer.setPixelRatio).toHaveBeenCalledWith(1.2)

    intersectionCallback?.(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    intersectionCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    cleanup?.()

    expect(resizeObserver.disconnect).toHaveBeenCalled()
    expect(intersectionObserver.disconnect).toHaveBeenCalled()
    expect(compactQuery.removeEventListener).toHaveBeenCalled()
    expect(heroHarness.renderer.dispose).toHaveBeenCalled()
    expect(heroHarness.renderer.forceContextLoss).toHaveBeenCalled()
    expect(canvas.dataset.webglStatus).toBe("disposed")
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it("ignores queued observer, media and animation callbacks after cleanup", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)

    let queuedFrame: FrameRequestCallback | undefined
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      queuedFrame = callback
      return 1
    })
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame)
    vi.stubGlobal("cancelAnimationFrame", vi.fn())

    let resizeCallback: ResizeObserverCallback | undefined
    let intersectionCallback: IntersectionObserverCallback | undefined
    class TestResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback
      }
      observe = vi.fn()
      disconnect = vi.fn()
    }
    class TestIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback
      }
      observe = vi.fn()
      disconnect = vi.fn()
    }
    vi.stubGlobal("ResizeObserver", TestResizeObserver)
    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver)

    let visibilityCallback: EventListener | undefined
    const addDocumentListener = document.addEventListener.bind(document)
    vi.spyOn(document, "addEventListener").mockImplementation((type, listener, options) => {
      if (type === "visibilitychange") visibilityCallback = listener as EventListener
      addDocumentListener(type, listener, options)
    })

    let compactChange: ((event: MediaQueryListEvent) => void) | undefined
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn((_type: string, listener: EventListenerOrEventListenerObject) => {
        compactChange = listener as (event: MediaQueryListEvent) => void
      }),
      removeEventListener: vi.fn(),
    })))

    const root = document.createElement("section")
    const canvas = document.createElement("canvas")
    root.append(canvas)
    const cleanup = createHeroScene(canvas, root as Parameters<typeof createHeroScene>[1])
    expect(cleanup).toEqual(expect.any(Function))
    expect(resizeCallback).toEqual(expect.any(Function))
    expect(compactChange).toEqual(expect.any(Function))
    expect(intersectionCallback).toEqual(expect.any(Function))
    expect(visibilityCallback).toEqual(expect.any(Function))
    expect(queuedFrame).toEqual(expect.any(Function))

    const savedFrame = queuedFrame
    cleanup?.()
    const sizeCalls = heroHarness.renderer.setSize.mock.calls.length
    const renderCalls = heroHarness.renderer.render.mock.calls.length
    const frameCalls = requestAnimationFrame.mock.calls.length

    resizeCallback?.([] as ResizeObserverEntry[], {} as ResizeObserver)
    compactChange?.({ matches: true } as MediaQueryListEvent)
    intersectionCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    visibilityCallback?.(new Event("visibilitychange"))
    savedFrame?.(64)

    expect(heroHarness.renderer.setSize).toHaveBeenCalledTimes(sizeCalls)
    expect(heroHarness.renderer.render).toHaveBeenCalledTimes(renderCalls)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(frameCalls)
  })

  it("ignores a queued window resize callback after cleanup without ResizeObserver", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)
    vi.stubGlobal("ResizeObserver", undefined)
    vi.stubGlobal("IntersectionObserver", undefined)
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
    const requestAnimationFrame = vi.fn(() => 1)
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame)
    vi.stubGlobal("cancelAnimationFrame", vi.fn())

    let resizeCallback: EventListener | undefined
    const addWindowListener = window.addEventListener.bind(window)
    vi.spyOn(window, "addEventListener").mockImplementation((type, listener, options) => {
      if (type === "resize") resizeCallback = listener as EventListener
      addWindowListener(type, listener, options)
    })

    const root = document.createElement("section")
    const canvas = document.createElement("canvas")
    root.append(canvas)
    const cleanup = createHeroScene(canvas, root as Parameters<typeof createHeroScene>[1])
    expect(cleanup).toEqual(expect.any(Function))
    expect(resizeCallback).toEqual(expect.any(Function))

    const sizeCalls = heroHarness.renderer.setSize.mock.calls.length
    const renderCalls = heroHarness.renderer.render.mock.calls.length
    const frameCalls = requestAnimationFrame.mock.calls.length
    cleanup?.()
    resizeCallback?.(new Event("resize"))

    expect(heroHarness.renderer.setSize).toHaveBeenCalledTimes(sizeCalls)
    expect(heroHarness.renderer.render).toHaveBeenCalledTimes(renderCalls)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(frameCalls)
  })

  it("falls back when renderer initialization throws", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)
    heroHarness.WebGLRenderer.mockImplementationOnce(() => {
      throw new Error("WebGL unavailable")
    })
    const canvas = document.createElement("canvas")
    const root = document.createElement("div")
    root.append(canvas)

    const cleanup = createHeroScene(
      canvas,
      root as Parameters<typeof createHeroScene>[1],
    )

    expect(cleanup).toBeNull()
    expect(canvas.dataset.webglStatus).toBe("fallback")
  })
})
