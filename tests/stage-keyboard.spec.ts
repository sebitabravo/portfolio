// Resolución — selección por teclado del escenario (§2: roving tabindex con activación
// automática, ↑ ↓ Home End). Contrato: mover el foco con el teclado debe dejar la misma
// marca que un click: pestaña seleccionada y panel visible con su screenshot (el
// currentSrc del `.shot img` del panel visible, no el de un panel oculto: la marca
// renderiza un panel por proyecto y alterna `hidden`).
import { expect, test, type Page } from "@playwright/test"

const PROJECTS = ["copiloto", "wenuke", "vulcania", "manttoai"] as const
type Slug = (typeof PROJECTS)[number]

test.describe("Stage keyboard selection", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "contrato de teclado sólo en chromium")

  async function visibleStage(page: Page): Promise<{ tab: string | null; panel: string | null; img: string }> {
    return page.evaluate(() => {
      const tab = document.querySelector('[role="tab"][aria-selected="true"]')
      const panel = document.querySelector("[role='tabpanel']:not([hidden])")
      const img = panel?.querySelector<HTMLImageElement>(".shot img")
      return {
        tab: tab?.id ?? null,
        panel: panel?.id ?? null,
        img: (img?.currentSrc || img?.getAttribute("src")) ?? "",
      }
    })
  }

  /** La pestaña y la imagen visible llegan al proyecto dado dentro de una espera acotada. */
  async function expectSelected(page: Page, slug: Slug): Promise<void> {
    await expect
      .poll(() => visibleStage(page), { timeout: 2000 })
      .toEqual({
        tab: `tab-${slug}`,
        panel: `panel-${slug}`,
        img: expect.stringContaining(slug),
      })
  }

  async function focusFirstTab(page: Page): Promise<void> {
    await page.goto("/", { waitUntil: "networkidle" })
    await page.locator('[role="tab"]').first().focus()
    await expectSelected(page, "copiloto")
  }

  test("ArrowDown mueve selección, panel e imagen al segundo proyecto", async ({ page }) => {
    await focusFirstTab(page)
    await page.keyboard.press("ArrowDown")
    await expectSelected(page, "wenuke")
  })

  test("ArrowUp desde la primera pestaña envuelve a la última", async ({ page }) => {
    await focusFirstTab(page)
    await page.keyboard.press("ArrowUp")
    await expectSelected(page, "manttoai")
  })

  test("Home vuelve al primer proyecto tras avanzar", async ({ page }) => {
    await focusFirstTab(page)
    await page.keyboard.press("ArrowDown")
    await expectSelected(page, "wenuke")
    await page.keyboard.press("Home")
    await expectSelected(page, "copiloto")
  })

  test("End salta al último proyecto", async ({ page }) => {
    await focusFirstTab(page)
    await page.keyboard.press("End")
    await expectSelected(page, "manttoai")
  })
})
