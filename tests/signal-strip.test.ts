// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from "vitest"
import { setupSignalStrip } from "../src/scripts/signal-strip"

function renderStrip() {
  document.body.innerHTML = `
    <div class="signal-strip" data-signal-pause="Pausar" data-signal-resume="Reanudar">
      <button type="button" data-signal-toggle aria-pressed="false" aria-label="Pausar">
        <span aria-hidden="true">Ⅱ</span>
        <span class="sr-only">Pausar</span>
      </button>
    </div>
  `
}

describe("signal strip toggle", () => {
  beforeEach(() => {
    renderStrip()
  })

  it("pauses the marquee and updates aria state, label and icon on click", () => {
    setupSignalStrip()
    const strip = document.querySelector(".signal-strip")!
    const toggle = document.querySelector<HTMLButtonElement>("[data-signal-toggle]")!

    toggle.click()

    expect(strip.classList.contains("is-paused")).toBe(true)
    expect(toggle.getAttribute("aria-pressed")).toBe("true")
    expect(toggle.getAttribute("aria-label")).toBe("Reanudar")
    expect(toggle.querySelector(".sr-only")?.textContent).toBe("Reanudar")
    expect(toggle.querySelector('[aria-hidden="true"]')?.textContent).toBe("▶")
  })

  it("resumes the marquee, aria state, label and icon on a second click", () => {
    setupSignalStrip()
    const strip = document.querySelector(".signal-strip")!
    const toggle = document.querySelector<HTMLButtonElement>("[data-signal-toggle]")!

    toggle.click()
    toggle.click()

    expect(strip.classList.contains("is-paused")).toBe(false)
    expect(toggle.getAttribute("aria-pressed")).toBe("false")
    expect(toggle.getAttribute("aria-label")).toBe("Pausar")
    expect(toggle.querySelector(".sr-only")?.textContent).toBe("Pausar")
    expect(toggle.querySelector('[aria-hidden="true"]')?.textContent).toBe("Ⅱ")
  })

  it("binds the click handler only once across repeated setup calls", () => {
    setupSignalStrip()
    setupSignalStrip()
    const strip = document.querySelector(".signal-strip")!
    const toggle = document.querySelector<HTMLButtonElement>("[data-signal-toggle]")!
    const toggleSpy = vi.spyOn(strip.classList, "toggle")

    toggle.click()

    expect(toggleSpy).toHaveBeenCalledTimes(1)
  })

  it("does nothing when the toggle button is missing from the markup", () => {
    document.body.innerHTML = '<div class="signal-strip" data-signal-pause="Pausar"></div>'
    expect(() => setupSignalStrip()).not.toThrow()
  })
})
