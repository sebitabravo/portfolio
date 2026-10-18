import { expect, test } from "@playwright/test"

test.describe("SB-OS interactions", () => {
  test("automation never sees the boot intro, while ?boot forces it and any key skips it", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("html")).not.toHaveClass(/boot-armed/)
    await expect(page.locator("[data-boot]")).toBeHidden()

    await page.goto("/?boot")
    await expect(page.locator("html")).toHaveClass(/boot-armed/)
    await expect(page.locator("[data-boot]")).toBeVisible()
    await expect(page.locator("[data-boot]")).toHaveAttribute("aria-hidden", "true")
    await page.keyboard.press("Space")
    await expect(page.locator("html")).not.toHaveClass(/boot-armed/, { timeout: 3000 })
    await expect(page.locator("[data-boot]")).toBeHidden()
    // La sesión queda marcada: la próxima visita sin ?boot no repite la intro.
    expect(await page.evaluate(() => sessionStorage.getItem("sb-os-booted"))).toBe("1")
  })

  test("the retro TV switches channels with native radios", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")
    const tv = page.getByRole("group", { name: "Televisor retro con tres canales" })
    await tv.scrollIntoViewIfNeeded()
    const portrait = tv.locator('.tv-channel[data-channel="0"]')
    const ascii = tv.locator('.tv-channel[data-channel="1"]')
    const bars = tv.locator('.tv-channel[data-channel="2"]')
    await expect(portrait).toBeVisible()
    await expect(ascii).toBeHidden()

    await tv.locator('label[for="tv-es-1"]').click()
    await expect(tv.getByRole("radio", { name: "Canal 2: ASCII" })).toBeChecked()
    await expect(ascii).toBeVisible()
    await expect(portrait).toBeHidden()
    expect((await ascii.locator("pre").textContent())?.split("\n").length).toBe(24)

    await tv.getByRole("radio", { name: "Canal 2: ASCII" }).focus()
    await page.keyboard.press("ArrowRight")
    await expect(tv.getByRole("radio", { name: "Canal 3: Sin señal" })).toBeChecked()
    await expect(bars).toBeVisible()
    await expect(bars).toContainText("Sin señal")
  })

  test("desktop windows can be dragged by their title bar inside the screen", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/")
    const terminal = page.locator(".os-window-terminal")
    const handle = terminal.locator("[data-os-window-handle]")
    await handle.scrollIntoViewIfNeeded()
    const box = await handle.boundingBox()
    expect(box).not.toBeNull()

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await page.mouse.move(box!.x + box!.width / 2 + 120, box!.y + box!.height / 2 - 40, { steps: 6 })
    await expect(terminal).toHaveClass(/is-dragging/)
    await page.mouse.up()

    await expect(terminal).not.toHaveClass(/is-dragging/)
    await expect.poll(() => terminal.evaluate((element) => element.style.getPropertyValue("--drag-x"))).toBe("120px")
    await expect.poll(() => terminal.evaluate((element) => element.style.getPropertyValue("--drag-y"))).toBe("-40px")
  })

  test("desktop shortcuts are real links to the chapters and the CV", async ({ page }) => {
    await page.goto("/en/")
    const shortcuts = page.getByRole("navigation", { name: "Desktop shortcuts" })
    await expect(shortcuts.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "#projects")
    await expect(shortcuts.getByRole("link", { name: "CV.pdf" })).toHaveAttribute("href", "/cv/Sebastian_Bravo_CV.pdf")
    await expect(shortcuts.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "#contact")
  })
})
