// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createCardTilt, createPointerMotion } from "../src/scripts/motion-interactions"

type FakeGsap = Parameters<typeof createPointerMotion>[0]

function createGsapMock() {
  const quickTo = vi.fn((element: HTMLElement, property: string) => {
    return (value: number) => element.style.setProperty(property, String(value))
  })
  const killTweensOf = vi.fn()
  return { quickTo, killTweensOf, value: { quickTo, killTweensOf } as unknown as FakeGsap }
}

function pointerEvent(type: string, clientX: number, clientY: number): Event {
  const event = new Event(type, { bubbles: true })
  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
  })
  return event
}

function setBounds(element: HTMLElement) {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: vi.fn(() => ({ left: 10, top: 20, width: 200, height: 100, right: 210, bottom: 120 })),
  })
}

describe("GSAP pointer interaction helpers", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", undefined)
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal("cancelAnimationFrame", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("applies hero tilt/glow values and resets them on pointer leave", () => {
    const root = document.createElement("div")
    const frame = document.createElement("div")
    frame.className = "hero-art-frame"
    root.append(frame)
    setBounds(frame)
    const gsap = createGsapMock()

    const cleanup = createPointerMotion(gsap.value, root as Parameters<typeof createPointerMotion>[1])
    frame.dispatchEvent(pointerEvent("pointerenter", 160, 70))
    frame.dispatchEvent(pointerEvent("pointermove", 160, 70))

    expect(frame.style.getPropertyValue("--hero-tilt-x")).toBe("1.125")
    expect(frame.style.getPropertyValue("--hero-tilt-y")).toBe("0")
    expect(frame.style.getPropertyValue("--hero-glow-x")).toBe("75")
    expect(frame.style.getPropertyValue("--hero-glow-y")).toBe("50")

    frame.dispatchEvent(pointerEvent("pointerleave", 160, 70))
    expect(frame.style.getPropertyValue("--hero-tilt-x")).toBe("0")
    expect(frame.style.getPropertyValue("--hero-glow-x")).toBe("50")
    cleanup()
    expect(gsap.killTweensOf).toHaveBeenCalledWith(frame)
  })

  it("applies card tilt values and cancels its listener lifecycle", () => {
    const card = document.createElement("article")
    setBounds(card)
    const gsap = createGsapMock()

    const cleanup = createCardTilt(gsap.value, card)
    card.dispatchEvent(pointerEvent("pointerenter", 160, 70))
    card.dispatchEvent(pointerEvent("pointermove", 160, 70))

    expect(card.style.getPropertyValue("--card-rotate-x")).toBe("0")
    expect(card.style.getPropertyValue("--card-rotate-y")).toBe("0.625")

    cleanup()
    expect(gsap.killTweensOf).toHaveBeenCalledWith(card)
    card.style.removeProperty("--card-rotate-y")
    card.dispatchEvent(pointerEvent("pointermove", 200, 100))
    expect(card.style.getPropertyValue("--card-rotate-y")).toBe("")
  })
})
