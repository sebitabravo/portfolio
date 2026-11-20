import { expect, test } from "@playwright/test"

// El switch de sonido del encabezado: aria-checked y data-audio honestos,
// etiqueta localizada y sin errores de consola. Puerto verificado en chromium.
test.skip(({ browserName }) => browserName !== "chromium", "puerto de sonido verificado en chromium")

test.describe("Sonido", () => {
  test("el switch arranca off/idle, confirma on con data-audio ready y vuelve a off", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    await page.goto("/")
    const button = page.locator("#sound")
    await expect(button).toHaveAttribute("aria-checked", "false")
    await expect(page.locator("html")).toHaveAttribute("data-audio", "idle")
    await expect(page.locator("#sound-label")).toHaveText("sonido: off")

    await button.click()
    await expect(button).toHaveAttribute("aria-checked", "true")
    await expect(page.locator("html")).toHaveAttribute("data-audio", "ready")
    await expect(page.locator("#sound-label")).toHaveText("sonido: on")

    await button.click()
    await expect(button).toHaveAttribute("aria-checked", "false")
    await expect(page.locator("#sound-label")).toHaveText("sonido: off")

    expect(errors).toHaveLength(0)
  })
})
