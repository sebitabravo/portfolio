// Resolución — barrido responsive 320–1920 (S4, T12). Ninguna ruta del portafolio puede
// desbordar horizontalmente en ningún viewport del contrato. Para cada ruta × viewport se
// verifican dos cosas: documentElement.scrollWidth <= innerWidth+1, y que ningún elemento
// con caja no nula sobrepase el borde derecho en más de 1px. Se ignoran los elementos
// dentro de [aria-hidden="true"] y los descendientes de un contenedor con
// overflow-x: auto|scroll (el scroll horizontal local es legítimo). El mensaje de cada
// aserción nombra la ruta, el viewport y el selector ofensor.
import { expect, test } from "@playwright/test"

const ROUTES = ["/", "/en/", "/blog/", "/en/blog/", "/privacy/", "/en/privacy/", "/links/", "/en/links/", "/404"] as const

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 360, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const

test.describe("Responsive sweep 320–1920", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "barrido contratado sólo en chromium")

  for (const route of ROUTES) {
    test(`no horizontal overflow: ${route}`, async ({ page }) => {
      test.setTimeout(120_000)
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(route, { waitUntil: "load" })
        const label = `${route} @ ${viewport.width}x${viewport.height}`
        const sweep = await page.evaluate(() => {
          const innerWidth = window.innerWidth
          const limit = innerWidth + 1
          const insideAriaHidden = (el: Element): boolean => {
            for (let node: Element | null = el; node; node = node.parentElement) {
              if (node.getAttribute("aria-hidden") === "true") return true
            }
            return false
          }
          const scrollDescendant = (el: Element): boolean => {
            for (let node: Element | null = el.parentElement; node; node = node.parentElement) {
              const overflowX = getComputedStyle(node).overflowX
              if (overflowX === "auto" || overflowX === "scroll") return true
            }
            return false
          }
          const selectorFor = (el: Element): string => {
            const tag = el.tagName.toLowerCase()
            const id = el.id ? `#${el.id}` : ""
            const classes = el.classList.length > 0 ? `.${Array.from(el.classList).join(".")}` : ""
            return `${tag}${id}${classes}`
          }
          const offenders: Array<{ selector: string; right: number }> = []
          for (const el of document.querySelectorAll<Element>("body, body *")) {
            if (insideAriaHidden(el) || scrollDescendant(el)) continue
            const rect = el.getBoundingClientRect()
            if (rect.width <= 0 && rect.height <= 0) continue
            if (rect.right > limit) offenders.push({ selector: selectorFor(el), right: rect.right })
          }
          return { innerWidth, scrollWidth: document.documentElement.scrollWidth, offenders }
        })

        expect(
          sweep.scrollWidth,
          `${label}: documentElement.scrollWidth (${sweep.scrollWidth}) supera innerWidth+1 (${sweep.innerWidth + 1})`,
        ).toBeLessThanOrEqual(sweep.innerWidth + 1)

        expect(
          sweep.offenders,
          `${label}: elementos que sobrepasan el borde derecho en más de 1px (límite=${sweep.innerWidth + 1}px) — ${sweep.offenders.map((o) => `${o.selector} (right=${o.right.toFixed(1)}px)`).join("; ")}`,
        ).toEqual([])
      }
    })
  }
})
