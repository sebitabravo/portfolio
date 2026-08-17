// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { trackEvent } from "@/lib/analytics"
import { setupProjects, teardownProjects } from "../src/scripts/projects"

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}))

function pointerEvent(type: string, clientX: number, clientY: number): Event {
  const event = new Event(type, { bubbles: true })
  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
  })
  return event
}

describe("project interaction lifecycle", () => {
  beforeEach(() => {
    teardownProjects()
    document.body.innerHTML = `
      <article data-project-card>
        <button data-track-project="vulcania" data-track-action="live">Demo</button>
        <img data-img-fallback src="/missing.webp" />
      </article>
    `
    const card = document.querySelector<HTMLElement>("[data-project-card]")!
    Object.defineProperty(card, "getBoundingClientRect", {
      configurable: true,
      value: vi.fn(() => ({ left: 10, top: 20, width: 200, height: 100, right: 210, bottom: 120 })),
    })
    vi.stubGlobal("ResizeObserver", undefined)
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal("cancelAnimationFrame", vi.fn())
    vi.clearAllMocks()
  })

  afterEach(() => {
    teardownProjects()
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  it("tracks project actions once even when setup runs again", () => {
    setupProjects()
    setupProjects()

    document.querySelector<HTMLButtonElement>("[data-track-project]")!.click()

    expect(trackEvent).toHaveBeenCalledTimes(1)
    expect(trackEvent).toHaveBeenCalledWith({
      name: "project_view",
      props: { project: "vulcania", action: "live" },
    })
  })

  it("updates the cached spotlight coordinates on pointer movement", () => {
    setupProjects()
    const card = document.querySelector<HTMLElement>("[data-project-card]")!

    card.dispatchEvent(pointerEvent("pointerenter", 160, 70))
    card.dispatchEvent(pointerEvent("pointermove", 160, 70))

    expect(card.style.getPropertyValue("--spotlight-x")).toBe("150px")
    expect(card.style.getPropertyValue("--spotlight-y")).toBe("50px")
  })

  it("hides broken screenshots and tears down listeners", () => {
    setupProjects()
    const card = document.querySelector<HTMLElement>("[data-project-card]")!
    const image = document.querySelector<HTMLImageElement>("[data-img-fallback]")!

    image.dispatchEvent(new Event("error"))
    expect(image.style.display).toBe("none")

    teardownProjects()
    card.style.removeProperty("--spotlight-x")
    card.dispatchEvent(pointerEvent("pointermove", 160, 70))
    expect(card.style.getPropertyValue("--spotlight-x")).toBe("")
  })
})
