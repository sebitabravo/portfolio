// Resolución — pase de contenido sin JavaScript (S4, T12). Con JS deshabilitado el
// contenido debe seguir legible y navegable: el h1 del hero es texto real, las cinco
// cabeceras de sección del CV son visibles con opacidad > 0 (un reveal oculto por CSS
// falla aquí en voz alta), todos los títulos del índice del escenario de proyectos son
// visibles, el header expone los dos enlaces de idioma y en /links cada fila del hub es
// visible con href no vacío. La visibilidad se afirma con toBeVisible() más un chequeo de
// computed style, porque toBeVisible() por sí solo no considera opacity: 0.
import { expect, test, type Locator } from "@playwright/test"

test.use({ javaScriptEnabled: false })

const SECTION_IDS = {
  es: ["#proyectos", "#experiencia", "#sobre-mi", "#formacion", "#contacto"],
  en: ["#projects", "#experience", "#about", "#education", "#contact"],
} as const

async function assertVisibleWithOpacity(locator: Locator, label: string): Promise<void> {
  await expect(locator, `${label}: debe ser visible`).toBeVisible()
  const opacity = Number(await locator.evaluate((el) => getComputedStyle(el).opacity))
  expect(opacity, `${label}: opacity computada debe ser > 0 (reveal oculto por CSS)`).toBeGreaterThan(0)
}

test.describe("No-JS content pass", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "contrato de contenido sólo en chromium")

  for (const path of ["/", "/en/"] as const) {
    const locale = path === "/" ? ("es" as const) : ("en" as const)

    test(`hero y secciones del CV legibles sin JS: ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "load" })

      const heroTitle = page.locator("section.hero h1")
      const heroText = ((await heroTitle.textContent()) ?? "").trim()
      expect(heroText, `${path}: el h1 del hero tiene texto no vacío`).not.toBe("")
      await assertVisibleWithOpacity(heroTitle, `${path}: h1 del hero`)

      for (const id of SECTION_IDS[locale]) {
        const section = page.locator(id)
        await assertVisibleWithOpacity(section, `${path}: sección ${id}`)
        await assertVisibleWithOpacity(section.locator("h2"), `${path}: cabecera h2 de ${id}`)
      }
    })

    test(`índice del escenario de proyectos y enlaces de idioma sin JS: ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "load" })

      const tabs = page.locator(".stage .index [role='tab'] .t")
      const tabCount = await tabs.count()
      expect(tabCount, `${path}: el índice del escenario tiene proyectos`).toBeGreaterThan(0)
      for (let i = 0; i < tabCount; i++) {
        const title = tabs.nth(i)
        const text = ((await title.textContent()) ?? "").trim()
        expect(text, `${path}: el título del proyecto ${i} no está vacío`).not.toBe("")
        await assertVisibleWithOpacity(title, `${path}: título de proyecto "${text}"`)
      }

      const langLinks = page.locator(".lang[role='group'] a")
      await expect(langLinks, `${path}: el header expone dos enlaces de idioma`).toHaveCount(2)
      for (let i = 0; i < 2; i++) {
        const link = langLinks.nth(i)
        const href = await link.getAttribute("href")
        expect(href, `${path}: el enlace de idioma ${i} tiene href`).not.toBeNull()
        expect((href ?? "").trim(), `${path}: el enlace de idioma ${i} tiene href no vacío`).not.toBe("")
        await assertVisibleWithOpacity(link, `${path}: enlace de idioma "${href}"`)
      }
    })
  }

  test("filas del hub visibles con href no vacío sin JS: /links", async ({ page }) => {
    await page.goto("/links", { waitUntil: "load" })

    const rows = page.locator(".hub-list .lk")
    const rowCount = await rows.count()
    expect(rowCount, "/links: el hub tiene filas").toBeGreaterThan(0)

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      await assertVisibleWithOpacity(row, `/links: fila del hub ${i}`)
      const tag = (await row.evaluate((el) => el.tagName.toLowerCase())) as string
      if (tag === "a") {
        const href = await row.getAttribute("href")
        expect((href ?? "").trim(), `/links: la fila del hub ${i} tiene href no vacío`).not.toBe("")
      }
    }

    // El hub debe exponer al menos las filas enlazadas (no sólo el botón de email).
    const linkRows = page.locator(".hub-list a.lk")
    const linkCount = await linkRows.count()
    expect(linkCount, "/links: el hub tiene filas <a> enlazadas").toBeGreaterThan(0)
    for (let i = 0; i < linkCount; i++) {
      const href = await linkRows.nth(i).getAttribute("href")
      expect((href ?? "").trim(), `/links: la fila <a> del hub ${i} tiene href no vacío`).not.toBe("")
    }
  })
})
