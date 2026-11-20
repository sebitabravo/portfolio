// Resolución — momento 1 (§2): el nombre del hero se resuelve al cargar, y el reloj de Chile
// de hero-meta. Puerto del bloque del hero en design/resolucion/index.html. El h1 es texto
// real server-side: sin JS, sin fuentes de formas o con reduced motion, queda en su estado final.

import { motion, resolve, shapesReady, type ResolveTarget } from "./resolve"

let teardown: (() => void) | null = null

const CONFIRM_CLOCK_MS = 15000
const CLOCK_PLACEHOLDER = "--:--"

/** Formato del reloj: con la zona de Chile; si la zona no está soportada (o el locale
 *  falla) reintenta sin timeZone; si Intl mismo no está disponible devuelve null y el
 *  reloj queda en el placeholder del prototipo ("--:--"). */
function makeFormatter(locale: string): Intl.DateTimeFormat | null {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Santiago",
    })
  } catch {
    /* zona u otro parámetro no soportado: reintenta sin timeZone */
  }
  try {
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false })
  } catch {
    return null
  }
}

export function setupHero(): void {
  // astro:page-load también dispara en la carga inicial: sin guardia se duplican los
  // listeners del reloj y la resolución se programa dos veces.
  const hero = document.querySelector<HTMLElement>("section.hero")
  if (!hero || hero.dataset.heroBound === "true") return
  hero.dataset.heroBound = "true"

  teardownHero()

  const lines = Array.from(document.querySelectorAll<HTMLElement>("#name .line"))
  if (lines.length > 0) {
    const texts = lines.map((line) => line.textContent ?? "")
    void shapesReady.then((ok) => {
      if (!ok || !motion()) return
      const targets: ResolveTarget[] = lines.map((el, i) => ({ el, from: texts[i], to: texts[i] }))
      void resolve(targets, { stagger: 1 })
    })
  }

  // Reloj de Chile: actualiza cada 15s; el formato sigue el idioma del documento.
  // Cada formato va en try/catch: ante cualquier fallo se pinta el placeholder existente.
  const clock = document.getElementById("clock")
  let clockTimer: ReturnType<typeof setInterval> | null = null
  if (clock) {
    const locale = (document.documentElement.getAttribute("lang") || "es").toLowerCase().startsWith("es")
      ? "es-CL"
      : "en-GB"
    const fmt = makeFormatter(locale)
    const tick = (): void => {
      let text = CLOCK_PLACEHOLDER
      if (fmt) {
        try {
          text = fmt.format(new Date())
        } catch {
          text = CLOCK_PLACEHOLDER
        }
      }
      clock.textContent = text
    }
    tick()
    if (fmt) clockTimer = setInterval(tick, CONFIRM_CLOCK_MS)
  }

  teardown = () => {
    if (clockTimer) clearInterval(clockTimer)
    clockTimer = null
  }
}

export function teardownHero(): void {
  teardown?.()
  teardown = null
}
