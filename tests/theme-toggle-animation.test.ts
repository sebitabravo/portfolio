// @vitest-environment happy-dom

import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { initThemeToggle } from "../src/scripts/theme-toggle"

function createMediaQueryList() {
  let listener: (() => void) | null = null
  const media = {
    matches: false,
    addEventListener: (_type: string, callback: EventListenerOrEventListenerObject) => {
      listener = callback as () => void
    },
    removeEventListener: () => undefined,
    emitChange: () => listener?.(),
  }

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
        <button class="theme-option" role="menuitemradio" data-theme="light" aria-checked="false">Claro<span class="check-light hidden"></span></button>
        <button class="theme-option" role="menuitemradio" data-theme="dark" aria-checked="false">Oscuro<span class="check-dark hidden"></span></button>
        <button class="theme-option" role="menuitemradio" data-theme="system" aria-checked="true">Sistema<span class="check-system hidden"></span></button>
      </div>
    </div>
  `
}

describe("theme toggle icon animation", () => {
  let media: ReturnType<typeof createMediaQueryList>

  beforeEach(() => {
    renderThemeToggle()
    media = createMediaQueryList()
    Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => media) })
    localStorage.clear()
    document.documentElement.className = ""
  })

  afterEach(() => {
    document.body.innerHTML = ""
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("flags only a user-selected theme for the CSS icon animation", () => {
    initThemeToggle()
    const wrapper = document.querySelector<HTMLElement>("#theme-toggle-wrapper")!
    const toggle = document.querySelector<HTMLButtonElement>("#theme-toggle")!
    const dark = document.querySelector<HTMLButtonElement>('[data-theme="dark"]')!

    expect(wrapper.hasAttribute("data-theme-icon-animate")).toBe(false)

    toggle.click()
    dark.click()

    expect(wrapper.getAttribute("data-theme-icon-animate")).toBe("true")
    expect(document.querySelector(".theme-icon-dark")?.classList.contains("hidden")).toBe(false)
  })

  it("clears the flag when the system theme changes without a user selection", () => {
    initThemeToggle()
    const wrapper = document.querySelector<HTMLElement>("#theme-toggle-wrapper")!
    const toggle = document.querySelector<HTMLButtonElement>("#theme-toggle")!
    const system = document.querySelector<HTMLButtonElement>('[data-theme="system"]')!

    toggle.click()
    system.click()
    expect(wrapper.getAttribute("data-theme-icon-animate")).toBe("true")

    media.matches = true
    media.emitChange()

    expect(wrapper.hasAttribute("data-theme-icon-animate")).toBe(false)
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("keeps the icon animation behind the no-preference media query", () => {
    const css = readFileSync("src/styles/header.css", "utf8")

    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\)[\s\S]*theme-icon-enter/)
    expect(css).toContain("@keyframes theme-icon-enter")
  })
})
