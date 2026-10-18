// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest"
import {
  createNavIndicatorModule,
  setupNavIndicator,
  teardownNavIndicator,
} from "../src/scripts/motion/nav-indicator"
import {
  HEADER_NAV_CHANGE_EVENT,
  type HeaderNavChangeDetail,
  type MotionContext,
  type MotionGsap,
} from "../src/scripts/motion/types"

const flipHarness = vi.hoisted(() => ({ fit: vi.fn() }))

vi.mock("gsap/Flip", () => ({
  Flip: { fit: flipHarness.fit },
}))

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

  return { projects: projects! }
}

function announce(link: HTMLAnchorElement) {
  document.dispatchEvent(
    new CustomEvent<HeaderNavChangeDetail>(HEADER_NAV_CHANGE_EVENT, {
      detail: { link },
    }),
  )
}

function createContext(): MotionContext {
  return {
    scope: document,
    libraries: {
      gsap: { killTweensOf: vi.fn(), registerPlugin: vi.fn() } as unknown as MotionGsap,
      ScrollTrigger: {} as MotionContext["libraries"]["ScrollTrigger"],
      Flip: null,
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

describe("nav indicator lazy Flip", () => {
  afterEach(() => {
    teardownNavIndicator()
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  it("loads Flip on the first nav change and uses it on the next one", async () => {
    const { projects } = renderHeader()
    setupNavIndicator(document)
    const context = createContext()
    const module = createNavIndicatorModule()
    module.init(context)
    projects.classList.add("nav-active")

    announce(projects)
    await vi.waitFor(() => {
      expect(context.libraries.gsap.registerPlugin).toHaveBeenCalledWith({ fit: flipHarness.fit })
    })

    announce(projects)
    expect(flipHarness.fit).toHaveBeenCalledWith(
      document.querySelector("[data-nav-indicator]"),
      projects,
      { duration: 0.35, ease: "power3.out", absolute: true },
    )
  })
})
