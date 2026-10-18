// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  createNavIndicatorModule,
  setupNavIndicator,
  teardownNavIndicator,
} from "../src/scripts/motion/nav-indicator"
import {
  HEADER_NAV_CHANGE_EVENT,
  type HeaderNavChangeDetail,
  type MotionContext,
  type MotionFlip,
  type MotionGsap,
} from "../src/scripts/motion/types"

function rect(left: number, width: number, height = 40): DOMRect {
  return {
    x: left,
    y: 0,
    left,
    top: 0,
    right: left + width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect
}

function renderHeader() {
  document.body.innerHTML = `
    <header class="site-header">
      <nav class="site-nav">
        <div class="desktop-nav" data-nav-list>
          <span data-nav-indicator aria-hidden="true"></span>
          <a class="nav-link" href="/">Inicio</a>
          <a class="nav-link" href="/#proyectos">Proyectos</a>
        </div>
      </nav>
    </header>
  `

  const container = document.querySelector<HTMLElement>("[data-nav-list]")!
  const [home, projects] = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav-link"))
  vi.spyOn(container, "getBoundingClientRect").mockReturnValue(rect(10, 300))
  vi.spyOn(home!, "getBoundingClientRect").mockReturnValue(rect(10, 60))
  vi.spyOn(projects!, "getBoundingClientRect").mockReturnValue(rect(80, 70))
  for (const link of [home!, projects!]) {
    link.getClientRects = () => [rect(0, 1)] as unknown as DOMRectList
  }

  return { container, home: home!, projects: projects! }
}

function announce(link: HTMLAnchorElement) {
  document.dispatchEvent(
    new CustomEvent<HeaderNavChangeDetail>(HEADER_NAV_CHANGE_EVENT, {
      detail: { link },
    }),
  )
}

function createContext(flip: MotionFlip | null): MotionContext {
  return {
    scope: document,
    libraries: {
      gsap: { killTweensOf: vi.fn() } as unknown as MotionGsap,
      ScrollTrigger: {} as MotionContext["libraries"]["ScrollTrigger"],
      Flip: flip,
      createHeroScene: null,
    },
    capabilities: {
      reducedMotion: false,
      finePointer: true,
      canHover: true,
      webgl2: true,
      saveData: false,
      lowPower: false,
    },
    signal: new AbortController().signal,
  }
}

describe("nav indicator", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", undefined)
  })

  afterEach(() => {
    teardownNavIndicator()
    vi.unstubAllGlobals()
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  it("fits the active pill instantly without GSAP or Flip", () => {
    const { projects } = renderHeader()
    const indicator = document.querySelector<HTMLElement>("[data-nav-indicator]")!

    setupNavIndicator(document)
    projects.classList.add("nav-active")
    announce(projects)

    expect(indicator.classList.contains("nav-indicator-visible")).toBe(true)
    expect(indicator.style.width).toBe("70px")
    expect(indicator.style.height).toBe("40px")
    expect(indicator.style.transform).toBe("translate3d(70px, 0px, 0)")
  })

  it("hides the pill when the active link has no visible box", () => {
    const { projects } = renderHeader()
    const indicator = document.querySelector<HTMLElement>("[data-nav-indicator]")!

    setupNavIndicator(document)
    projects.getClientRects = () => [] as unknown as DOMRectList
    announce(projects)

    expect(indicator.classList.contains("nav-indicator-visible")).toBe(false)
  })

  it("uses Flip only when the motion controller injected it", () => {
    const { projects } = renderHeader()
    const indicator = document.querySelector<HTMLElement>("[data-nav-indicator]")!
    const fit = vi.fn()
    const flip = { fit } as unknown as MotionFlip
    const context = createContext(flip)

    setupNavIndicator(document)
    const module = createNavIndicatorModule()
    module.init(context)
    projects.classList.add("nav-active")
    announce(projects)

    expect((context.libraries.gsap.killTweensOf as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(indicator)
    expect(fit).toHaveBeenCalledWith(indicator, projects, {
      duration: 0.35,
      ease: "power3.out",
      absolute: true,
    })
  })

  it("keeps the eager geometry when the module releases and on teardown clears it", () => {
    const { projects } = renderHeader()
    const indicator = document.querySelector<HTMLElement>("[data-nav-indicator]")!
    const context = createContext({ fit: vi.fn() } as unknown as MotionFlip)

    setupNavIndicator(document)
    const module = createNavIndicatorModule()
    module.init(context)
    projects.classList.add("nav-active")
    announce(projects)
    module.destroy()

    expect(indicator.classList.contains("nav-indicator-visible")).toBe(true)
    expect(indicator.style.width).toBe("70px")

    teardownNavIndicator()
    expect(indicator.classList.contains("nav-indicator-visible")).toBe(false)
    expect(indicator.getAttribute("style")).toBeNull()
  })

  it("does nothing without an indicator or links", () => {
    document.body.innerHTML = `<div data-nav-list></div>`

    expect(() => setupNavIndicator(document)).not.toThrow()
    expect(createNavIndicatorModule()).toBeDefined()
  })
})
