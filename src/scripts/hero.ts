// Resolución — momento 1 (§2): el nombre del hero se resuelve al cargar, y el reloj de Chile
// de hero-meta. Puerto del bloque del hero en design/resolucion/index.html. El h1 es texto
// real server-side: sin JS, sin fuentes de formas o con reduced motion, queda en su estado final.

import { motion, resolve, shapesReady, type ResolveTarget } from "./resolve"

let teardown: (() => void) | null = null

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
  const clock = document.getElementById("clock")
  let clockTimer: ReturnType<typeof setInterval> | null = null
  if (clock) {
    const locale = (document.documentElement.getAttribute("lang") || "es").toLowerCase().startsWith("es")
      ? "es-CL"
      : "en-GB"
    const fmt = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Santiago",
    })
    const tick = (): void => {
      clock.textContent = fmt.format(new Date())
    }
    tick()
    clockTimer = setInterval(tick, 15000)
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
