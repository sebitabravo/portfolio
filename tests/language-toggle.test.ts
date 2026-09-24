// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { initLanguageToggle } from "../src/scripts/language-toggle"

function renderLanguageToggle() {
  document.body.innerHTML = `
    <div id="language-toggle-wrapper" data-label-template-es="Idioma: {code}" data-label-template-en="Language: {code}">
      <button id="language-toggle" type="button" aria-label="Language: EN" aria-haspopup="menu" aria-controls="language-menu" aria-expanded="false">
        <span id="current-language">EN</span>
      </button>
      <div id="language-menu" class="hidden" role="menu">
        <button class="language-option" type="button" role="menuitemradio" data-lang="es" aria-checked="false" tabindex="-1">
          Español <span class="check-es hidden" aria-hidden="true">✓</span>
        </button>
        <button class="language-option" type="button" role="menuitemradio" data-lang="en" aria-checked="true" tabindex="0">
          English <span class="check-en" aria-hidden="true">✓</span>
        </button>
      </div>
    </div>
    <input id="outside-input" />
  `
}

function elements() {
  const toggle = document.querySelector<HTMLButtonElement>("#language-toggle")!
  const menu = document.querySelector<HTMLElement>("#language-menu")!
  const options = [...menu.querySelectorAll<HTMLButtonElement>(".language-option")]
  return { toggle, menu, options }
}

describe("language toggle lifecycle", () => {
  beforeEach(() => {
    renderLanguageToggle()
    localStorage.clear()
  })

  afterEach(() => {
    document.body.innerHTML = ""
    localStorage.clear()
  })

  it("initializes the Spanish label, checked state, and one roving tab stop from the URL", () => {
    initLanguageToggle()

    const { toggle, options } = elements()
    expect(document.querySelector("#current-language")?.textContent).toBe("ES")
    expect(toggle.getAttribute("aria-label")).toBe("Idioma: ES")
    expect(options.map((option) => option.getAttribute("aria-checked"))).toEqual(["true", "false"])
    expect(options.map((option) => option.tabIndex)).toEqual([0, -1])
    expect(options.filter((option) => option.tabIndex === 0)).toHaveLength(1)
  })

  it("moves focus and the roving tab stop with ArrowDown and ArrowUp", () => {
    initLanguageToggle()

    const { toggle, menu, options } = elements()
    toggle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    expect(menu.classList.contains("hidden")).toBe(false)
    expect(document.activeElement).toBe(options[0])
    expect(options.map((option) => option.tabIndex)).toEqual([0, -1])

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    expect(document.activeElement).toBe(options[1])
    expect(options.map((option) => option.tabIndex)).toEqual([-1, 0])

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }))
    expect(document.activeElement).toBe(options[0])
    expect(options.map((option) => option.tabIndex)).toEqual([0, -1])
  })

  it("closes on focusout without stealing focus from an outside input", () => {
    initLanguageToggle()

    const { toggle, menu } = elements()
    toggle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    const outsideInput = document.querySelector<HTMLInputElement>("#outside-input")!
    outsideInput.focus()

    expect(document.activeElement).toBe(outsideInput)
    expect(menu.classList.contains("hidden")).toBe(true)
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
  })

  it("closes and restores trigger focus without navigating when selecting current Spanish", () => {
    initLanguageToggle()

    const { toggle, menu, options } = elements()
    const initialUrl = window.location.href
    toggle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    options[0].click()

    expect(menu.classList.contains("hidden")).toBe(true)
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(toggle)
    expect(window.location.href).toBe(initialUrl)
  })

  it("does not persist language preference on initialization or current Spanish selection", () => {
    initLanguageToggle()
    expect(localStorage.getItem("language-preference")).toBeNull()

    const { options } = elements()
    options[0].click()
    expect(localStorage.getItem("language-preference")).toBeNull()
  })

  it("aborts old listeners when initialized twice so one click opens once", () => {
    initLanguageToggle()
    initLanguageToggle()

    const { toggle, menu } = elements()
    toggle.click()

    expect(menu.classList.contains("hidden")).toBe(false)
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
  })
})
