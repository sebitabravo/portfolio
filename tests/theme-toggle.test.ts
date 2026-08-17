// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { initThemeToggle } from "../src/scripts/theme-toggle"

type MediaController = Omit<MediaQueryList, "matches"> & {
  matches: boolean
  emitChange: () => void
}

function createMediaQueryList(matches = false): MediaController {
  const listeners = new Set<(event: Event) => void>()
  const media = {
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.add(listener as (event: Event) => void)
    },
    removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.delete(listener as (event: Event) => void)
    },
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => true,
    emitChange: () => listeners.forEach((listener) => listener(new Event("change"))),
  } as MediaController

  return media
}

function renderThemeToggle() {
  document.body.innerHTML = `
    <div id="theme-toggle-wrapper" data-i18n-light="Claro" data-i18n-dark="Oscuro" data-i18n-system="Sistema">
      <button id="theme-toggle" type="button" aria-expanded="false">
        <span class="theme-icon-light hidden"></span>
        <span class="theme-icon-dark hidden"></span>
        <span class="theme-icon-system"></span>
        <span id="current-theme">Sistema</span>
      </button>
      <div id="theme-menu" class="hidden" role="menu">
        <button class="theme-option" data-theme="light" aria-checked="false">Claro<span class="check-light hidden"></span></button>
        <button class="theme-option" data-theme="dark" aria-checked="false">Oscuro<span class="check-dark hidden"></span></button>
        <button class="theme-option" data-theme="system" aria-checked="true">Sistema<span class="check-system hidden"></span></button>
      </div>
    </div>
  `
}

describe("theme toggle lifecycle", () => {
  let media: MediaController

  beforeEach(() => {
    renderThemeToggle()
    media = createMediaQueryList(false)
    vi.stubGlobal("matchMedia", vi.fn(() => media))
    Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => media) })
    localStorage.clear()
    document.documentElement.className = ""
  })

  afterEach(() => {
    document.body.innerHTML = ""
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it("initializes a persisted dark preference and updates ARIA state", () => {
    localStorage.setItem("theme", "dark")

    initThemeToggle()

    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.querySelector("#current-theme")?.textContent).toBe("Oscuro")
    expect(document.querySelector('[data-theme="dark"]')?.getAttribute("aria-checked")).toBe("true")
    expect(document.querySelector('[data-theme="light"]')?.getAttribute("aria-checked")).toBe("false")
    expect(document.querySelector(".theme-icon-dark")?.classList.contains("hidden")).toBe(false)
  })

  it("opens, selects and closes a theme without duplicating listeners", () => {
    initThemeToggle()
    initThemeToggle()

    const toggle = document.querySelector<HTMLButtonElement>("#theme-toggle")!
    const menu = document.querySelector<HTMLElement>("#theme-menu")!
    const light = document.querySelector<HTMLButtonElement>('[data-theme="light"]')!

    toggle.click()
    expect(menu.classList.contains("hidden")).toBe(false)
    expect(toggle.getAttribute("aria-expanded")).toBe("true")

    light.click()
    expect(localStorage.getItem("theme")).toBe("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(menu.classList.contains("hidden")).toBe(true)
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
  })

  it("supports keyboard navigation and reacts to system theme changes", () => {
    localStorage.setItem("theme", "system")
    initThemeToggle()

    const toggle = document.querySelector<HTMLButtonElement>("#theme-toggle")!
    const menu = document.querySelector<HTMLElement>("#theme-menu")!
    const options = [...document.querySelectorAll<HTMLButtonElement>(".theme-option")]

    toggle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    expect(document.activeElement).toBe(options[0])
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    expect(document.activeElement).toBe(options[1])
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    expect(document.activeElement).toBe(toggle)
    expect(menu.classList.contains("hidden")).toBe(true)

    media.matches = true
    media.emitChange()
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("fails closed when the toggle markup is absent", () => {
    document.body.innerHTML = ""

    expect(() => initThemeToggle()).not.toThrow()
  })
})
