// Resolución — chips del filtro y contador role="status" del índice del blog (S2, B4). Los
// chips son la taxonomía de temas de src/lib/blog-topics.ts más "todos": cinco chips por
// índice. El render de servidor pega la etiqueta con la cifra cuando quedan en líneas
// separadas (Astro colapsa el whitespace con salto de línea): "ia y datos7". Contrato: chip
// y contador llevan un espacio explícito entre etiqueta y cifra, al cargar y tras filtrar
// (el contador lo reescribe blog-filters con `${visible} ${countLabel}`).
import { expect, test } from "@playwright/test"

const CHIP_PATTERN: Record<string, RegExp> = {
  "/blog/": /^(todos|web|ia y datos|apps|infra) \d+$/,
  "/en/blog/": /^(all|web|ai & data|apps|infra) \d+$/,
}

for (const [route, chipPattern] of Object.entries(CHIP_PATTERN)) {
  const countPattern = route === "/blog/" ? /^\d+ artículos$/ : /^\d+ articles$/

  test(`chips y contador con espacio explícito: ${route}`, async ({ page }) => {
    await page.goto(route)
    const chips = page.locator(".filters .chip")
    await expect(chips).toHaveCount(5)

    for (const chip of await chips.all()) {
      await expect(chip).toHaveText(chipPattern)
    }
    await expect(page.locator("#count")).toHaveText(countPattern)

    // Tras filtrar, el contador reescrito por JS conserva etiqueta y cifra separadas.
    await chips.nth(1).click()
    await expect(page.locator("#count")).toHaveText(countPattern)
  })
}
