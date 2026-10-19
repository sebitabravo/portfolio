// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import WebGL from "three/addons/capabilities/WebGL.js"
import { approach, computeHeroCamera } from "../src/scripts/hero-camera"
import { createHeroScene } from "../src/scripts/hero-webgl"

const heroHarness = vi.hoisted(() => {
  const renderer = {
    setClearColor: vi.fn(),
    setPixelRatio: vi.fn(),
    setSize: vi.fn(),
    getDrawingBufferSize: vi.fn((target: { set: (x: number, y: number) => void }) => {
      target.set(480, 270)
      return target
    }),
    setRenderTarget: vi.fn(),
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

type FrameQueue = Map<number, FrameRequestCallback>

function stubFrames(): { queue: FrameQueue; request: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn> } {
  const queue: FrameQueue = new Map()
  let next = 1
  const request = vi.fn((callback: FrameRequestCallback) => {
    const id = next++
    queue.set(id, callback)
    return id
  })
  const cancel = vi.fn((id: number) => queue.delete(id))
  vi.stubGlobal("requestAnimationFrame", request)
  vi.stubGlobal("cancelAnimationFrame", cancel)
  return { queue, request, cancel }
}

function runLatestFrame(queue: FrameQueue, time: number): void {
  const [id, callback] = [...queue.entries()].at(-1) ?? []
  if (id === undefined || !callback) return
  queue.delete(id)
  callback(time)
}

function renderScreen() {
  const root = document.createElement("section")
  const screen = document.createElement("div")
  screen.dataset.osScreen = ""
  const windowElement = document.createElement("div")
  windowElement.dataset.osWindow = ""
  const canvas = document.createElement("canvas")
  screen.append(canvas, windowElement)
  root.append(screen)
  document.body.append(root)
  return { root, screen, windowElement, canvas }
}

// happy-dom no hace layout: la caja de layout del canvas se fija a mano.
function setLayoutSize(element: HTMLElement, width: number, height: number): void {
  Object.defineProperty(element, "clientWidth", { configurable: true, value: width })
  Object.defineProperty(element, "clientHeight", { configurable: true, value: height })
}

function rect(width: number, height: number): DOMRect {
  return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON: () => ({}) } as DOMRect
}

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

describe("hero camera model", () => {
  it("rests centered with the base speed and field of view", () => {
    expect(computeHeroCamera({ x: 0, y: 0 }, 0, 0)).toEqual({
      x: 0,
      y: 2.15,
      lookY: 1.05,
      roll: -0,
      fov: 55,
      speed: 2.1,
    })
  })

  it("follows the pointer, rises with scroll and widens the lens in turbo", () => {
    const camera = computeHeroCamera({ x: 1, y: -1 }, 1, 1)
    expect(camera.x).toBeCloseTo(1.35)
    expect(camera.y).toBeCloseTo(2.15 + 2.4 + 0.45)
    expect(camera.lookY).toBeLessThan(1.05)
    expect(camera.roll).toBeLessThan(0)
    expect(camera.fov).toBe(65)
    expect(camera.speed).toBeCloseTo(2.1 + 1.6 + 6)
  })

  it("eases values toward their target", () => {
    expect(approach(0, 10, 0.5)).toBe(5)
    expect(approach(10, 10, 0.2)).toBe(10)
  })
})

describe("hero WebGL landscape", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    heroHarness.WebGLRenderer.mockImplementation(() => heroHarness.renderer)
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })))
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 2 })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ""
  })

  it("fails closed when WebGL2 is unavailable", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(false)
    const { root, canvas } = renderScreen()

    expect(createHeroScene(canvas, root)).toBeNull()
    expect(canvas.dataset.webglStatus).toBe("fallback")
  })

  it("falls back when renderer initialization throws", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)
    heroHarness.WebGLRenderer.mockImplementationOnce(() => {
      throw new Error("WebGL unavailable")
    })
    const { root, canvas } = renderScreen()

    expect(createHeroScene(canvas, root)).toBeNull()
    expect(canvas.dataset.webglStatus).toBe("fallback")
  })

  it("renders the scene and the CRT pass, reacts to input and disposes everything", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)
    const frames = stubFrames()
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(bounds)

    let resizeCallback: ResizeObserverCallback | undefined
    let intersectionCallback: IntersectionObserverCallback | undefined
    const resizeObserver = { observe: vi.fn(), disconnect: vi.fn() }
    const intersectionObserver = { observe: vi.fn(), disconnect: vi.fn() }
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback
      }
      observe = resizeObserver.observe
      disconnect = resizeObserver.disconnect
    })
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback
      }
      observe = intersectionObserver.observe
      disconnect = intersectionObserver.disconnect
    })

    const { root, screen, windowElement, canvas } = renderScreen()
    setLayoutSize(canvas, 320, 180)
    const cleanup = createHeroScene(canvas, root)

    expect(cleanup).toEqual(expect.any(Function))
    expect(root.dataset.motionStatus).toBe("active")
    expect(canvas.dataset.webglStatus).toBeUndefined()
    expect(heroHarness.renderer.setPixelRatio).toHaveBeenCalledWith(1.5)
    expect(heroHarness.renderer.setSize).toHaveBeenCalledWith(320, 180, false)
    expect(resizeObserver.observe).toHaveBeenCalledWith(canvas)
    expect(intersectionObserver.observe).toHaveBeenCalledWith(root)

    // El primer cuadro pinta la escena en el render target y luego la pasada CRT.
    runLatestFrame(frames.queue, 64)
    expect(heroHarness.renderer.render).toHaveBeenCalledTimes(2)
    expect(heroHarness.renderer.setRenderTarget).toHaveBeenLastCalledWith(null)
    expect(canvas.dataset.webglStatus).toBe("ready")

    // Un cuadro antes del intervalo de 30 fps no vuelve a renderizar.
    runLatestFrame(frames.queue, 70)
    expect(heroHarness.renderer.render).toHaveBeenCalledTimes(2)

    root.dispatchEvent(new PointerEvent("pointermove", { clientX: 240, clientY: 45 }))
    windowElement.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
    screen.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
    window.dispatchEvent(new PointerEvent("pointerup"))
    root.dispatchEvent(new PointerEvent("pointerleave"))
    window.dispatchEvent(new Event("scroll"))
    document.dispatchEvent(new Event("visibilitychange"))
    resizeCallback?.([] as ResizeObserverEntry[], {} as ResizeObserver)

    runLatestFrame(frames.queue, 140)
    expect(heroHarness.renderer.render).toHaveBeenCalledTimes(4)

    intersectionCallback?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver)
    expect(frames.cancel).toHaveBeenCalled()
    intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)

    cleanup?.()

    expect(resizeObserver.disconnect).toHaveBeenCalled()
    expect(intersectionObserver.disconnect).toHaveBeenCalled()
    expect(heroHarness.renderer.dispose).toHaveBeenCalled()
    expect(heroHarness.renderer.forceContextLoss).toHaveBeenCalled()
    expect(canvas.dataset.webglStatus).toBe("disposed")
  })

  it("stops and falls back when the WebGL context is lost", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)
    const frames = stubFrames()
    vi.stubGlobal("ResizeObserver", undefined)
    vi.stubGlobal("IntersectionObserver", undefined)
    const { root, canvas } = renderScreen()
    const cleanup = createHeroScene(canvas, root)

    const lost = new Event("webglcontextlost", { cancelable: true })
    canvas.dispatchEvent(lost)

    expect(lost.defaultPrevented).toBe(true)
    expect(canvas.dataset.webglStatus).toBe("fallback")
    expect(frames.cancel).toHaveBeenCalled()
    cleanup?.()
  })

  it("sizes the drawing buffer from the layout box, not the stage-scaled rect", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)
    stubFrames()
    vi.stubGlobal("ResizeObserver", undefined)
    vi.stubGlobal("IntersectionObserver", undefined)
    const { root, canvas } = renderScreen()
    // El escenario escala la pantalla a 0.9: el rect visual es menor que la caja de layout.
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(rect(288, 162))
    setLayoutSize(canvas, 320, 180)

    const cleanup = createHeroScene(canvas, root)

    expect(heroHarness.renderer.setSize).toHaveBeenLastCalledWith(320, 180, false)
    cleanup?.()
  })

  it("steers from the visible screen, not from the tall story track", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)
    const frames = stubFrames()
    vi.stubGlobal("ResizeObserver", undefined)
    vi.stubGlobal("IntersectionObserver", undefined)
    const { root, screen, canvas } = renderScreen()
    // La pista mide varias pantallas; la pantalla visible es solo su primer tramo.
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue(rect(400, 2400))
    vi.spyOn(screen, "getBoundingClientRect").mockReturnValue(rect(400, 600))
    const cleanup = createHeroScene(canvas, root)

    root.dispatchEvent(new PointerEvent("pointermove", { clientX: 200, clientY: 300 }))
    runLatestFrame(frames.queue, 64)

    // Al centro de la pantalla el puntero es neutro y la cámara conserva su altura de reposo.
    const camera = heroHarness.renderer.render.mock.calls[0]?.[1] as { position: { y: number } }
    expect(camera.position.y).toBe(2.15)
    cleanup?.()
  })

  it("resumes rendering when the WebGL context is restored", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)
    const frames = stubFrames()
    vi.stubGlobal("ResizeObserver", undefined)
    vi.stubGlobal("IntersectionObserver", undefined)
    const { root, canvas } = renderScreen()
    const cleanup = createHeroScene(canvas, root)
    runLatestFrame(frames.queue, 64)
    expect(canvas.dataset.webglStatus).toBe("ready")

    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }))
    expect(canvas.dataset.webglStatus).toBe("fallback")
    expect(frames.queue.size).toBe(0)

    canvas.dispatchEvent(new Event("webglcontextrestored"))
    const renders = heroHarness.renderer.render.mock.calls.length
    runLatestFrame(frames.queue, 128)

    expect(heroHarness.renderer.render.mock.calls.length).toBe(renders + 2)
    expect(canvas.dataset.webglStatus).toBe("ready")
    cleanup?.()
  })

  it("follows the compact breakpoint live: terrain density and pixel-ratio cap", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)
    const frames = stubFrames()
    vi.stubGlobal("ResizeObserver", undefined)
    vi.stubGlobal("IntersectionObserver", undefined)
    let onChange: ((event: MediaQueryListEvent) => void) | undefined
    const compactQuery = {
      matches: false,
      addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
        onChange = listener
      }),
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal("matchMedia", vi.fn(() => compactQuery))
    const { root, canvas } = renderScreen()
    const cleanup = createHeroScene(canvas, root)
    runLatestFrame(frames.queue, 64)

    type TerrainMesh = { geometry: { type: string; parameters?: { widthSegments: number }; dispose: () => void } }
    const scene = heroHarness.renderer.render.mock.calls[0]?.[0] as { children: TerrainMesh[] }
    const terrain = scene.children.find((child) => child.geometry.type === "PlaneGeometry")!
    const desktopGeometry = terrain.geometry
    const dispose = vi.spyOn(desktopGeometry, "dispose")
    expect(desktopGeometry.parameters?.widthSegments).toBe(184)
    expect(heroHarness.renderer.setPixelRatio).toHaveBeenLastCalledWith(1.5)

    onChange?.({ matches: true } as MediaQueryListEvent)

    expect(dispose).toHaveBeenCalled()
    expect(terrain.geometry.parameters?.widthSegments).toBe(110)
    expect(heroHarness.renderer.setPixelRatio).toHaveBeenLastCalledWith(1)
    cleanup?.()
    expect(compactQuery.removeEventListener).toHaveBeenCalledWith("change", onChange)
  })

  it("ignores queued callbacks after cleanup without ResizeObserver", () => {
    vi.mocked(WebGL.isWebGL2Available).mockReturnValue(true)
    const frames = stubFrames()
    vi.stubGlobal("ResizeObserver", undefined)
    vi.stubGlobal("IntersectionObserver", undefined)

    let resizeCallback: EventListener | undefined
    const addWindowListener = window.addEventListener.bind(window)
    vi.spyOn(window, "addEventListener").mockImplementation((type, listener, options) => {
      if (type === "resize") resizeCallback = listener as EventListener
      addWindowListener(type, listener, options)
    })

    const { root, canvas } = renderScreen()
    const cleanup = createHeroScene(canvas, root)
    expect(resizeCallback).toEqual(expect.any(Function))
    const [savedFrame] = [...frames.queue.values()]

    cleanup?.()
    const sizeCalls = heroHarness.renderer.setSize.mock.calls.length
    resizeCallback?.(new Event("resize"))
    savedFrame?.(500)

    expect(heroHarness.renderer.setSize).toHaveBeenCalledTimes(sizeCalls)
    expect(heroHarness.renderer.render).not.toHaveBeenCalled()
  })
})
