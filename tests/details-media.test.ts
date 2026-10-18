// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest"
import { revivePendingImages, setupDetailsMedia, teardownDetailsMedia } from "../src/scripts/details-media"

function renderRow() {
  document.body.innerHTML = `
    <details id="row">
      <summary>Temutel</summary>
      <picture><img id="pending" loading="lazy" src="/_astro/temutel.webp" alt="Temutel" /></picture>
      <img id="loaded" loading="lazy" src="/_astro/telsur.webp" alt="Telsur" />
      <img id="eager" src="/_astro/eager.webp" alt="" />
      <img id="empty" loading="lazy" alt="" />
    </details>`
  const loaded = document.querySelector<HTMLImageElement>("#loaded")!
  Object.defineProperty(loaded, "complete", { value: true })
  Object.defineProperty(loaded, "naturalWidth", { value: 48 })
  return document.querySelector<HTMLDetailsElement>("#row")!
}

afterEach(() => {
  teardownDetailsMedia()
  document.body.innerHTML = ""
})

describe("details media", () => {
  it("re-assigns the source of pending lazy images only", () => {
    const row = renderRow()
    const pending = document.querySelector<HTMLImageElement>("#pending")!
    const setAttribute = vi.spyOn(pending, "setAttribute")

    expect(revivePendingImages(row)).toBe(1)
    expect(setAttribute).toHaveBeenCalledWith("src", "/_astro/temutel.webp")
    expect(pending.getAttribute("loading")).toBe("lazy")
  })

  it("revives images when a row opens and ignores rows that close", () => {
    const row = renderRow()
    const pending = document.querySelector<HTMLImageElement>("#pending")!
    const setAttribute = vi.spyOn(pending, "setAttribute")
    setupDetailsMedia()

    row.open = true
    row.dispatchEvent(new Event("toggle"))
    expect(setAttribute).toHaveBeenCalledWith("src", "/_astro/temutel.webp")

    setAttribute.mockClear()
    row.open = false
    row.dispatchEvent(new Event("toggle"))
    expect(setAttribute).not.toHaveBeenCalled()
  })

  it("stops listening after teardown", () => {
    const row = renderRow()
    const pending = document.querySelector<HTMLImageElement>("#pending")!
    const setAttribute = vi.spyOn(pending, "setAttribute")
    setupDetailsMedia()
    teardownDetailsMedia()

    row.open = true
    row.dispatchEvent(new Event("toggle"))
    expect(setAttribute).not.toHaveBeenCalled()
  })
})
