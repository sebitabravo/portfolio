// Resolución — una revelación por sección (§2): el h2 con data-resolve reutiliza el motor de
// resolución una vez al entrar en el viewport y el cuerpo (.reveal) entra en 8 pasos. Puerto del
// IntersectionObserver final de design/resolucion/common.js. Sin motion, el observador solo
// marca .in: el contenido ya es visible por CSS (html.motion es el que oculta).

import { saveData } from "./compat"
import { motion, resolve, hasShapes, type ResolveTarget } from "./resolve"

let observer: IntersectionObserver | null = null

/** Misma interacción que la entrada del observer: resolver el h2 (solo con motion y
 * formas) y marcar .in en cada .reveal de la sección. */
const revealSection = (section: HTMLElement): void => {
  const heading = section.querySelector<HTMLElement>("[data-resolve]")
  if (heading && motion() && hasShapes()) {
    const text = heading.textContent ?? ""
    const target: ResolveTarget = { el: heading, from: text, to: text }
    void resolve([target], { stagger: 1 })
  }
  for (const reveal of section.querySelectorAll<HTMLElement>(".reveal")) {
    reveal.classList.add("in")
  }
}

export function setupReveal(): void {
  // astro:page-load también dispara en la carga inicial: sin guardia las secciones ya
  // resueltas se re-observan y el título vuelve a parpadear con sonido.
  const main = document.querySelector("main")
  if (!main || main.dataset.revealBound === "true") return
  main.dataset.revealBound = "true"

  teardownReveal()

  const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section:not(.hero)"))
  if (sections.length === 0) return

  // Sin IntersectionObserver (o Save-Data): revelar todo síncronamente para que el
  // contenido sea visible sin observador ni animación, y no construir el observer.
  if (!("IntersectionObserver" in window) || saveData()) {
    for (const section of sections) revealSection(section)
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer?.unobserve(entry.target)
        revealSection(entry.target as HTMLElement)
      }
    },
    { threshold: 0.12 },
  )
  for (const section of sections) observer.observe(section)
}

export function teardownReveal(): void {
  observer?.disconnect()
  observer = null
}
