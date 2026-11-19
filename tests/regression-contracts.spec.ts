import { expect, test } from "@playwright/test"

test.describe("Regression contracts", () => {
  test("English blog and project case studies never render the empty state", async ({ page }) => {
    await page.goto("/en/blog")
    await expect(page.locator("article")).not.toHaveCount(0)
    await expect(page.getByText("No articles published yet.")).not.toBeVisible()

    for (const slug of [
      "vulcania-monitoreo-volcanico-comunitario",
      "wenuke-asistente-climatico-whatsapp",
      "manttoai-ml-iot-random-forest",
      "rapido-sur-erp-mantenimiento-flotas",
      "vulcania-monitoreo-volcanico-comunitario-en",
      "manttoai-ml-iot-random-forest-en",
    ]) {
      const response = await page.request.get(`/en/blog/${slug}`)
      expect(response.status(), slug).toBe(200)
    }

    for (const slug of [
      "vulcania-monitoreo-volcanico-comunitario-en",
      "manttoai-ml-iot-random-forest-en",
    ]) {
      await page.goto(`/en/blog/${slug}`)
      await expect(page.locator("article[lang='en']")).toBeVisible()
      await expect(page.getByText("This article is currently available in Spanish.")).not.toBeVisible()
    }
  })
})
