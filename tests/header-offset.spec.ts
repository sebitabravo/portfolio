import { expect, test } from "@playwright/test"

// El header de Resolución NO es fixed y no reserva espacio con un offset del
// body: es sticky a partir de 720px (src/styles/components.css) y estático en
// flujo por debajo. El destino de los anclas lo protege el scroll-padding-top
// de <html> (src/styles/base.css: var(--header) + 24px), no un padding del main.
//
// Anchos: 390 es el viewport móvil del diseño (rama estática); 768 es el caso
// sticky inmediatamente sobre el quiebre de 720px; 1280 cubre el régimen
// desktop sticky (medido idéntico a 1440). Se descarta 640 porque ejercita
// exactamente la misma rama estática que 390 (medido: header en flujo, el
// contenido arranca en su borde inferior).
//
// Medido con Chromium a 390/640/768/1280/1440: el contenido nunca queda tapado
// por el header — al cargar arranca en o bajo su borde inferior, tras hacer
// scroll el header queda pegado en top: 0, y los anclas caen bajo el header.
const routes = [
  "/blog",
  "/en/blog",
  "/blog/manttoai-ml-iot-random-forest",
  "/en/blog/manttoai-ml-iot-random-forest-en",
  "/privacy",
  "/en/privacy",
]

// Destinos de ancla reales por ruta; privacy no tiene secciones con id.
const anchors: Partial<Record<(typeof routes)[number], string>> = {
  "/blog": "#posts",
  "/en/blog": "#posts",
  "/blog/manttoai-ml-iot-random-forest": "#el-stack",
  "/en/blog/manttoai-ml-iot-random-forest-en": "#the-stack",
}

for (const width of [390, 768, 1280]) {
  for (const route of routes) {
    test(`${route} at ${width}px keeps its content below the header`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(route)

      // La rama del header corresponde al ancho: en flujo bajo 720px, sticky encima.
      const position = await page
        .locator(".site-header")
        .evaluate((header) => getComputedStyle(header).position)
      expect(position, "header under 720px is in flow, sticky from 720px up").toBe(width < 720 ? "static" : "sticky")

      // Al cargar, ningún bloque de contenido arranca bajo el header.
      const { headerBottom, contentTop } = await page.evaluate(() => {
        const header = document.querySelector(".site-header")!.getBoundingClientRect()
        const first = document.querySelector("#main-content h1, #main-content ol")!.getBoundingClientRect()
        return { headerBottom: header.bottom, contentTop: first.top }
      })
      expect(contentTop).toBeGreaterThanOrEqual(headerBottom)

      if (width >= 720) {
        // Sticky: tras hacer scroll el header sigue visible y pegado arriba.
        await page.mouse.wheel(0, 800)
        await page.waitForTimeout(150)
        const pinned = await page.evaluate(() => {
          const rect = document.querySelector(".site-header")!.getBoundingClientRect()
          return { top: rect.top, visible: rect.bottom > 0 }
        })
        expect(pinned.top).toBe(0)
        expect(pinned.visible).toBe(true)

        // scroll-padding-top: el destino del ancla cae bajo el header, nunca tapado.
        const anchor = anchors[route as (typeof routes)[number]]
        if (anchor) {
          await page.goto(`${route}${anchor}`)
          const landed = await page.evaluate((selector) => {
            const headerBottom = document.querySelector(".site-header")!.getBoundingClientRect().bottom
            const targetTop = document.querySelector(selector)!.getBoundingClientRect().top
            return { headerBottom, targetTop }
          }, anchor)
          expect(landed.targetTop).toBeGreaterThanOrEqual(landed.headerBottom)
        }
      }
    })
  }
}
