// Resolución — contrato de desborde de prosa (S4). Ocho posts desbordaban el documento
// en móvil: las URLs largas dentro de `.prose a` y el código inline (`.prose code`) son
// cadenas indivisibles que empujan scrollWidth más allá del viewport, y los bloques
// resaltados (`span.line` dentro de `pre`) sólo son legítimos si el `pre` hace scroll
// local. Este spec fija las tres reglas para las rutas que fallaban y seis posts
// representativos (URLs largas, código inline, tabla y `pre`), a 320 y 390 px:
//   1. documentElement.scrollWidth <= innerWidth + 1,
//   2. cada `pre` cabe o tiene overflow-x: auto|scroll (scroll local dentro de su caja),
//   3. ninguna caja de `.prose a` ni `.prose code` cruza el borde derecho — salvo los
//      descendientes de un contenedor con overflow-x: auto|scroll (el código dentro de
//      un `pre` con scroll local cruza el viewport por diseño, como en responsive.spec).
import { expect, test } from "@playwright/test"

const FAILING_ROUTES = [
  "/blog/datawarehouse-defunciones-covid-chile/",
  "/blog/manttoai-ml-iot-random-forest/",
  "/blog/masterdots-game-html-css/",
  "/blog/seguroapp-cotizador-seguros-android/",
  "/blog/copiloto-recepcion-hotel-ia-local/",
] as const

const REPRESENTATIVE_ROUTES = [
  "/blog/mineria-datos-r-educacion-superior/",
  "/blog/dea-app-defibrilladores-crowdsourcing/",
  "/blog/correo-servidor-posteio-dokploy/",
  "/blog/reducir-ruido-webaudio-dsp/",
  "/blog/redp-registro-experiencias-django/",
  "/blog/sistembiblio-inventario-libreria-django/",
] as const

const ROUTES = [...FAILING_ROUTES, ...REPRESENTATIVE_ROUTES] as const

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
] as const

test.describe("Contrato de desborde de prosa", () => {
  for (const route of ROUTES) {
    test(`la prosa no desborda: ${route}`, async ({ page }) => {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(route, { waitUntil: "load" })
        const label = `${route} @ ${viewport.width}x${viewport.height}`
        const check = await page.evaluate(() => {
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
            const classes = el.classList.length > 0 ? `.${Array.from(el.classList).slice(0, 2).join(".")}` : ""
            const text = (el.textContent || "").trim().slice(0, 30)
            return `${tag}${classes} "${text}"`
          }
          const badPre: string[] = []
          for (const pre of document.querySelectorAll("pre")) {
            const fits = pre.scrollWidth <= pre.clientWidth + 1
            const overflowX = getComputedStyle(pre).overflowX
            if (!fits && overflowX !== "auto" && overflowX !== "scroll") badPre.push(selectorFor(pre))
          }
          const wideInline: string[] = []
          for (const el of document.querySelectorAll(".prose a, .prose code")) {
            if (insideAriaHidden(el) || scrollDescendant(el)) continue
            const rect = el.getBoundingClientRect()
            if (rect.width <= 0 && rect.height <= 0) continue
            if (rect.right > limit) wideInline.push(`${selectorFor(el)} (right=${rect.right.toFixed(1)})`)
          }
          return { innerWidth, scrollWidth: document.documentElement.scrollWidth, badPre, wideInline }
        })

        expect(
          check.scrollWidth,
          `${label}: documentElement.scrollWidth (${check.scrollWidth}) supera innerWidth+1 (${check.innerWidth + 1})`,
        ).toBeLessThanOrEqual(check.innerWidth + 1)

        expect(
          check.badPre,
          `${label}: bloques <pre> que no caben ni hacen scroll local — ${check.badPre.join("; ")}`,
        ).toEqual([])

        expect(
          check.wideInline,
          `${label}: cajas de .prose a / .prose code que cruzan el borde derecho (límite=${check.innerWidth + 1}px) — ${check.wideInline.join("; ")}`,
        ).toEqual([])
      }
    })
  }
})
