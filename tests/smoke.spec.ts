import { test, expect } from "@playwright/test"

const BASE = "http://localhost:4321"

test.describe("Hero — wins y social", () => {
  test("renderiza 3 bullet points de wins", async ({ page }) => {
    await page.goto(BASE)
    const winItems = page.locator("section").first().locator("ul li")
    await expect(winItems).toHaveCount(3)

    const firstWin = winItems.nth(0)
    await expect(firstWin).toContainText("94.1%")
  })

  test("botón de LinkedIn visible", async ({ page }) => {
    await page.goto(BASE)
    const linkedinBtn = page.locator("a[data-track-social='linkedin']")
    await expect(linkedinBtn).toBeVisible()
    await expect(linkedinBtn).toHaveAttribute("href", /linkedin\.com/)
  })
})

test.describe("Projects — screenshots con fallback", () => {
  test("Wenuke tiene imagen de screenshot", async ({ page }) => {
    await page.goto(BASE)
    const wenukeCard = page.locator("[data-project='wenuke']")
    await wenukeCard.scrollIntoViewIfNeeded()
    const img = wenukeCard.locator("img").first()
    await expect(img).toHaveAttribute("src", "/screenshots/wenuke.webp")
  })

  test("4 project cards renderizados", async ({ page }) => {
    await page.goto(BASE)
    const cards = page.locator("[data-project-card]")
    await expect(cards).toHaveCount(4)
  })

  test("cada card tiene gradiente de fondo", async ({ page }) => {
    await page.goto(BASE)
    const cards = page.locator("[data-project-card]")
    const count = await cards.count()
    for (let i = 0; i < count; i++) {
      const bgDiv = cards.nth(i).locator("[style*='linear-gradient']").first()
      await expect(bgDiv).toBeVisible()
    }
  })
})

test.describe("Temutel — descripción reducida", () => {
  test("descripción corta sin detalles extensos", async ({ page }) => {
    await page.goto(BASE)
    const experiencia = page.locator("#experiencia")
    await experiencia.scrollIntoViewIfNeeded()
    // No debe contener la descripción larga anterior
    await expect(experiencia).not.toContainText("decodificadores")
    await expect(experiencia).not.toContainText("sistemas telefónicos")
  })
})

test.describe("Layout general", () => {
  test("no hay sección de testimonios", async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator("#testimonios")).not.toBeAttached()
  })

  test("5 certificaciones", async ({ page }) => {
    await page.goto(BASE)
    const certSection = page.locator("#certificaciones")
    await certSection.scrollIntoViewIfNeeded()
    // El carousel debería tener los certs
    const certs = page.locator(".cert-item")
    const count = await certs.count()
    // El carrusel duplica los certs para el loop infinito, así que contamos la mitad
    expect(count).toBe(10) // 5 certs × 2 (loop infinito)
  })

  test("página carga sin errores de consola", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto(BASE)
    await page.waitForTimeout(2000)
    expect(errors).toHaveLength(0)
  })
})
