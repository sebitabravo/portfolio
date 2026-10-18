// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  clamp,
  computeDragBounds,
  formatClock,
  readOffset,
  setupOsDesktop,
  teardownOsDesktop,
} from "../src/scripts/os-desktop"

const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect

function renderDesktop() {
  document.documentElement.lang = "es"
  document.body.innerHTML = `
    <div data-os-screen>
      <time data-os-clock>Chile</time>
      <div data-os-window id="portrait"><div data-os-window-handle id="handle">bar</div></div>
      <div data-os-window id="terminal"></div>
    </div>
  `
  const screen = document.querySelector<HTMLElement>("[data-os-screen]")!
  const portrait = document.querySelector<HTMLElement>("#portrait")!
  const handle = document.querySelector<HTMLElement>("#handle")!
  vi.spyOn(screen, "getBoundingClientRect").mockReturnValue(rect(0, 0, 800, 450))
  vi.spyOn(portrait, "getBoundingClientRect").mockReturnValue(rect(400, 60, 200, 250))
  return { screen, portrait, handle, terminal: document.querySelector<HTMLElement>("#terminal")! }
}

describe("desktop geometry", () => {
  it("clamps values and collapses inverted ranges to the minimum", () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
    expect(clamp(3, 8, 2)).toBe(8)
  })

  it("keeps the title bar inside the screen whatever the current offset", () => {
    const bounds = computeDragBounds(rect(0, 0, 800, 450), rect(420, 80, 200, 250), { x: 20, y: 20 })
    // La base sin desplazamiento está en (400, 60).
    expect(bounds).toEqual({ minX: -528, maxX: 328, minY: -30, maxY: 354 })
  })

  it("reads numeric offsets and treats missing values as zero", () => {
    const element = document.createElement("div")
    expect(readOffset(element)).toEqual({ x: 0, y: 0 })
    element.style.setProperty("--drag-x", "12px")
    element.style.setProperty("--drag-y", "-8px")
    expect(readOffset(element)).toEqual({ x: 12, y: -8 })
  })

  it("formats the Chile clock in 24h for both locales", () => {
    const date = new Date("2026-10-18T23:05:00Z")
    expect(formatClock(date, "es")).toMatch(/^\d{2}:\d{2}$/)
    expect(formatClock(date, "en", "UTC")).toBe("23:05")
  })
})

describe("desktop interactions", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-18T12:00:00Z"))
  })

  afterEach(() => {
    teardownOsDesktop()
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ""
  })

  it("does nothing without a screen", () => {
    document.body.innerHTML = "<main></main>"
    expect(() => setupOsDesktop()).not.toThrow()
  })

  it("ticks the clock and stops on teardown", () => {
    renderDesktop()
    const clock = document.querySelector<HTMLElement>("[data-os-clock]")!
    setupOsDesktop()
    expect(clock.textContent).toMatch(/^\d{2}:\d{2}$/)
    clock.textContent = "stale"
    vi.advanceTimersByTime(30_000)
    expect(clock.textContent).toMatch(/^\d{2}:\d{2}$/)
    teardownOsDesktop()
    clock.textContent = "stopped"
    vi.advanceTimersByTime(60_000)
    expect(clock.textContent).toBe("stopped")
  })

  it("drags a window by its handle within bounds and raises it", () => {
    const { portrait, handle, terminal } = renderDesktop()
    setupOsDesktop()

    terminal.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
    handle.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, clientX: 450, clientY: 70 }))
    expect(Number(portrait.style.zIndex)).toBeGreaterThan(Number(terminal.style.zIndex))
    expect(portrait.classList.contains("is-dragging")).toBe(true)

    handle.dispatchEvent(new PointerEvent("pointermove", { clientX: 470, clientY: 100 }))
    expect(portrait.style.getPropertyValue("--drag-x")).toBe("20px")
    expect(portrait.style.getPropertyValue("--drag-y")).toBe("30px")

    handle.dispatchEvent(new PointerEvent("pointermove", { clientX: 5000, clientY: -5000 }))
    expect(portrait.style.getPropertyValue("--drag-x")).toBe("328px")
    expect(portrait.style.getPropertyValue("--drag-y")).toBe("-30px")

    handle.dispatchEvent(new PointerEvent("pointerup"))
    expect(portrait.classList.contains("is-dragging")).toBe(false)
    handle.dispatchEvent(new PointerEvent("pointermove", { clientX: 0, clientY: 0 }))
    expect(portrait.style.getPropertyValue("--drag-x")).toBe("328px")
  })

  it("ignores secondary buttons and releases on cancel", () => {
    const { portrait, handle } = renderDesktop()
    setupOsDesktop()
    handle.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 2, clientX: 10, clientY: 10 }))
    expect(portrait.classList.contains("is-dragging")).toBe(false)
    handle.dispatchEvent(new PointerEvent("pointerup"))

    handle.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, clientX: 10, clientY: 10 }))
    handle.dispatchEvent(new PointerEvent("pointercancel"))
    expect(portrait.classList.contains("is-dragging")).toBe(false)
  })

  it("removes every listener on teardown", () => {
    const { portrait, handle } = renderDesktop()
    setupOsDesktop()
    teardownOsDesktop()
    handle.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, clientX: 10, clientY: 10 }))
    expect(portrait.classList.contains("is-dragging")).toBe(false)
    expect(portrait.style.zIndex).toBe("")
  })
})
