// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest"
import { createHeroModule } from "../src/scripts/motion/hero"
import type { MotionContext, MotionGsap } from "../src/scripts/motion/types"

const harness = vi.hoisted(() => {
  const tween = {
    scrollTrigger: { kill: vi.fn(), refresh: vi.fn() },
    kill: vi.fn(),
  }
  return {
    tween,
    sceneCleanup: vi.fn(),
    pointerCleanup: vi.fn(),
    magneticCleanup: vi.fn(),
    createHeroScene: vi.fn(() => harness.sceneCleanup),
    createPointerMotion: vi.fn(() => harness.pointerCleanup),
    createMagneticTarget: vi.fn(() => harness.magneticCleanup),
    fromTo: vi.fn((_targets: unknown, _fromVars: unknown, _toVars: unknown) => tween),
  }
})

vi.mock("../src/scripts/hero-webgl", () => ({
  createHeroScene: harness.createHeroScene,
}))

vi.mock("../src/scripts/motion-interactions", () => ({
  createPointerMotion: harness.createPointerMotion,
}))

vi.mock("../src/scripts/motion/interactions", () => ({
  createMagneticTarget: harness.createMagneticTarget,
}))

function renderHero() {
  document.body.innerHTML = `
    <section data-portfolio-motion>
      <p class="hero-topline">[00] Portfolio</p>
      <h1 id="hero-title" class="hero-title hero-reveal">Sebastian Bravo</h1>
      <div class="hero-aside">
        <div class="hero-actions">
          <a class="hero-btn-primary" href="/#contacto">Contactar</a>
        </div>
        <ul class="hero-meta"></ul>
      </div>
      <div class="hero-art-frame"><canvas data-hero-webgl></canvas></div>
    </section>
  `
}

function createContext(): MotionContext {
  return {
    scope: document,
    libraries: {
      gsap: { fromTo: harness.fromTo } as unknown as MotionGsap,
      ScrollTrigger: {} as MotionContext["libraries"]["ScrollTrigger"],
      Flip: null,
      createHeroScene: harness.createHeroScene as unknown as MotionContext["libraries"]["createHeroScene"],
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

describe("hero motion module", () => {
  afterEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ""
  })

  it("never targets the LCP heading or the screen and wires pointer, magnet and scroll handoff", () => {
    renderHero()
    const module = createHeroModule()
    const context = createContext()

    module.init(context)

    const root = document.querySelector<HTMLElement>("[data-portfolio-motion]")!
    const canvas = document.querySelector<HTMLCanvasElement>("[data-hero-webgl]")!
    const title = document.querySelector<HTMLElement>("#hero-title")!
    const targets = harness.fromTo.mock.calls[0]?.[0] as HTMLElement[]
    const options = harness.fromTo.mock.calls[0]?.[2] as {
      scrollTrigger: { start: string; end: string; pin?: boolean }
    }

    expect(harness.createHeroScene).toHaveBeenCalledWith(canvas, root)
    expect(harness.createPointerMotion).toHaveBeenCalledWith(
      context.libraries.gsap,
      root,
    )
    expect(harness.createMagneticTarget).toHaveBeenCalledWith(
      context.libraries.gsap,
      document.querySelector(".hero-btn-primary"),
      { maxOffset: 7, signal: context.signal },
    )
    expect(targets).toEqual([
      document.querySelector(".hero-topline"),
      document.querySelector(".hero-aside"),
    ])
    expect(targets).not.toContain(title)
    // La pantalla escala con un scroll timeline CSS; GSAP nunca la desvanece.
    expect(targets).not.toContain(document.querySelector(".hero-art-frame"))
    expect(options.scrollTrigger).toMatchObject({
      start: "top top",
      end: "bottom 30%",
    })
    expect(options.scrollTrigger).not.toHaveProperty("pin")
    expect(title.getAttribute("style")).toBeNull()
  })

  it("releases every enhancement and restores handoff properties on destroy", () => {
    renderHero()
    const module = createHeroModule()
    module.init(createContext())

    const art = document.querySelector<HTMLElement>(".hero-aside")!
    art.style.setProperty("--hero-exit-y", "-2rem")
    art.style.setProperty("--hero-exit-opacity", "0.4")

    module.destroy()

    expect(harness.tween.scrollTrigger.kill).toHaveBeenCalled()
    expect(harness.tween.kill).toHaveBeenCalled()
    expect(harness.magneticCleanup).toHaveBeenCalled()
    expect(harness.pointerCleanup).toHaveBeenCalled()
    expect(harness.sceneCleanup).toHaveBeenCalled()
    expect(art.style.getPropertyValue("--hero-exit-y")).toBe("")
    expect(art.style.getPropertyValue("--hero-exit-opacity")).toBe("")
  })
})
