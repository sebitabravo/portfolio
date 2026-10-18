// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from "vitest"
import { setupMarquee, syncMarquee, teardownMarquee } from "../src/scripts/marquee"

function renderMarquee(paused = false) {
  document.body.innerHTML = `
    <div data-marquee ${paused ? 'data-paused="true"' : ""}>
      <button data-marquee-toggle data-label-pause="Pausar" data-label-resume="Reanudar"></button>
    </div>
    <div data-marquee><span>sin botón</span></div>
  `
  return {
    root: document.querySelector<HTMLElement>("[data-marquee]")!,
    toggle: document.querySelector<HTMLElement>("[data-marquee-toggle]")!,
  }
}

describe("stack marquee pause control", () => {
  afterEach(() => {
    teardownMarquee()
    document.body.innerHTML = ""
  })

  it("labels the button with the next action", () => {
    const { root, toggle } = renderMarquee()
    syncMarquee(root, toggle, true)
    expect(root.dataset.paused).toBe("true")
    expect(toggle.getAttribute("aria-label")).toBe("Reanudar")
    syncMarquee(root, toggle, false)
    expect(toggle.getAttribute("aria-label")).toBe("Pausar")
  })

  it("keeps the existing label when a template is missing", () => {
    const { root, toggle } = renderMarquee()
    toggle.setAttribute("aria-label", "Original")
    delete toggle.dataset.labelResume
    syncMarquee(root, toggle, true)
    expect(toggle.getAttribute("aria-label")).toBe("Original")
  })

  it("toggles pause on click and restores the initial state from markup", () => {
    const { root, toggle } = renderMarquee(true)
    setupMarquee()
    expect(toggle.getAttribute("aria-label")).toBe("Reanudar")
    toggle.click()
    expect(root.dataset.paused).toBe("false")
    toggle.click()
    expect(root.dataset.paused).toBe("true")
  })

  it("stops listening after teardown", () => {
    const { root, toggle } = renderMarquee()
    setupMarquee()
    teardownMarquee()
    toggle.click()
    expect(root.dataset.paused).toBe("false")
  })
})
