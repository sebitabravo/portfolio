// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest"
import { createExperienceTimelineModule } from "../src/scripts/motion/experience-timeline"
import type {
  MotionContext,
  MotionGsap,
  MotionScrollTrigger,
} from "../src/scripts/motion/types"

function createHarness() {
  const trigger = { kill: vi.fn(), refresh: vi.fn() }
  const tween = {
    kill: vi.fn(),
    scrollTrigger: { kill: vi.fn(), refresh: vi.fn() },
  }
  return {
    trigger,
    tween,
    create: vi.fn((_options: unknown) => trigger),
    fromTo: vi.fn((_targets: unknown, _fromVars: unknown, _toVars: unknown) => tween),
  }
}

function renderExperience() {
  document.body.innerHTML = `
    <section>
      <span data-experience-progress aria-hidden="true"></span>
      <ol data-experience-list>
        <li data-experience-item><article data-animate>Uno</article></li>
        <li data-experience-item><article data-animate>Dos</article></li>
      </ol>
    </section>
  `
}

function createContext(harness: ReturnType<typeof createHarness>): MotionContext {
  return {
    scope: document,
    libraries: {
      gsap: { fromTo: harness.fromTo } as unknown as MotionGsap,
      ScrollTrigger: { create: harness.create } as unknown as MotionScrollTrigger,
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

describe("experience timeline module", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  it("scrubs the progress variable without pinning or changing layout", () => {
    renderExperience()
    const harness = createHarness()
    const module = createExperienceTimelineModule()
    const progress = document.querySelector<HTMLElement>("[data-experience-progress]")!

    module.init(createContext(harness))

    const options = harness.create.mock.calls[0]?.[0] as {
      start: string
      end: string
      scrub: boolean
      pin?: boolean
      onUpdate: (instance: { progress: number }) => void
      onRefresh: (instance: { progress: number }) => void
    }
    expect(progress.style.getPropertyValue("--timeline-progress")).toBe("0")
    expect(options).toMatchObject({ start: "top 80%", end: "bottom 60%", scrub: true })
    expect(options).not.toHaveProperty("pin")

    options.onUpdate({ progress: 0.625 })
    expect(progress.style.getPropertyValue("--timeline-progress")).toBe("0.625")
    options.onRefresh({ progress: 0.4 })
    expect(progress.style.getPropertyValue("--timeline-progress")).toBe("0.400")
  })

  it("reveals each item once through its own tween", () => {
    renderExperience()
    const harness = createHarness()
    const module = createExperienceTimelineModule()

    module.init(createContext(harness))

    const targets = harness.fromTo.mock.calls[0]?.[0] as HTMLElement[]
    const options = harness.fromTo.mock.calls[0]?.[2] as {
      scrollTrigger: { trigger: HTMLElement; start: string; once: boolean; pin?: boolean }
    }
    expect(targets).toEqual(Array.from(document.querySelectorAll("[data-experience-item] [data-animate]")))
    expect(options.scrollTrigger.trigger).toBe(document.querySelector("[data-experience-list]"))
    expect(options.scrollTrigger).toMatchObject({ start: "top 85%", once: true })
    expect(options.scrollTrigger).not.toHaveProperty("pin")
  })

  it("refreshes both triggers and releases all inline state on destroy", () => {
    renderExperience()
    const harness = createHarness()
    const module = createExperienceTimelineModule()
    const progress = document.querySelector<HTMLElement>("[data-experience-progress]")!
    const target = document.querySelector<HTMLElement>("[data-animate]")!

    module.init(createContext(harness))
    target.style.opacity = "0"
    target.style.transform = "translateY(18px)"
    target.style.visibility = "hidden"
    module.refresh(createContext(harness), "viewport")

    expect(harness.trigger.refresh).toHaveBeenCalled()
    expect(harness.tween.scrollTrigger.refresh).toHaveBeenCalled()

    module.destroy()

    expect(harness.trigger.kill).toHaveBeenCalled()
    expect(harness.tween.scrollTrigger.kill).toHaveBeenCalled()
    expect(harness.tween.kill).toHaveBeenCalled()
    expect(progress.style.getPropertyValue("--timeline-progress")).toBe("")
    expect(target.style.opacity).toBe("")
    expect(target.style.transform).toBe("")
    expect(target.style.visibility).toBe("")
  })

  it("does nothing when the list is absent", () => {
    document.body.innerHTML = `<section></section>`
    const harness = createHarness()
    const module = createExperienceTimelineModule()

    module.init(createContext(harness))

    expect(harness.create).not.toHaveBeenCalled()
    expect(harness.fromTo).not.toHaveBeenCalled()
  })
})
