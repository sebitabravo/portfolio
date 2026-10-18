// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { copyEmail, setupCopyEmail, teardownCopyEmail } from "../src/scripts/copy-email"

function renderButton() {
  document.body.innerHTML = `
    <button data-copy-email="hola@sebita.dev" data-label-copied="Email copiado" hidden>Copiar email</button>
    <p data-copy-status></p>
  `
  return {
    button: document.querySelector<HTMLButtonElement>("[data-copy-email]")!,
    status: document.querySelector<HTMLElement>("[data-copy-status]")!,
  }
}

describe("copy email button", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    teardownCopyEmail()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.body.innerHTML = ""
  })

  it("stays hidden when the Clipboard API is unavailable", () => {
    const { button } = renderButton()
    Object.defineProperty(window.navigator, "clipboard", { configurable: true, value: undefined })
    setupCopyEmail()
    expect(button.hidden).toBe(true)
  })

  it("copies the address, announces it and restores the label", async () => {
    const { button, status } = renderButton()
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) } as unknown as Clipboard
    expect(await copyEmail(button, status, clipboard)).toBe(true)
    expect(clipboard.writeText).toHaveBeenCalledWith("hola@sebita.dev")
    expect(button.textContent).toBe("Email copiado")
    expect(button.dataset.copied).toBe("true")
    expect(status.textContent).toBe("Email copiado")

    expect(await copyEmail(button, status, clipboard)).toBe(true)
    vi.advanceTimersByTime(2200)
    expect(button.textContent).toBe("Copiar email")
    expect(button.dataset.copied).toBeUndefined()
    expect(status.textContent).toBe("")
  })

  it("fails softly when writing is rejected or no address is set", async () => {
    const { button, status } = renderButton()
    const rejecting = { writeText: vi.fn().mockRejectedValue(new Error("denied")) } as unknown as Clipboard
    expect(await copyEmail(button, status, rejecting)).toBe(false)
    expect(button.textContent).toBe("Copiar email")
    delete button.dataset.copyEmail
    expect(await copyEmail(button, null, rejecting)).toBe(false)
  })

  it("reveals the button with a clipboard and copies on click until teardown", async () => {
    const { button } = renderButton()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, "clipboard", { configurable: true, value: { writeText } })
    setupCopyEmail()
    expect(button.hidden).toBe(false)
    button.click()
    await Promise.resolve()
    expect(writeText).toHaveBeenCalledTimes(1)

    teardownCopyEmail()
    button.click()
    expect(writeText).toHaveBeenCalledTimes(1)
  })
})
