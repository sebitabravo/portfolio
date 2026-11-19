// Resolución — título de página que se resuelve al cargar: los h1/p con data-load-resolve de
// blog, links y 404 reutilizan el motor de resolución una vez al cargar (design/resolucion
// common.js). El texto es real server-side y visible sin JS; sin fuentes de formas o con
// reduced motion el elemento simplemente queda en su estado final. Los elementos con
// post-title (artículos y privacidad) no se resuelven: un título de 100 caracteres tardaría
// 8 s (§12 del diseño).

import { motion, resolve, shapesReady, type ResolveTarget } from "./resolve"

export function setupPageResolve(): void {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-load-resolve]")).filter(
    (el) => el.dataset.resolved !== "true",
  )
  if (targets.length === 0) return
  for (const el of targets) el.dataset.resolved = "true"

  void shapesReady.then((ok) => {
    if (!ok || !motion()) return
    const plans: ResolveTarget[] = targets.map((el) => {
      const text = el.textContent ?? ""
      return { el, from: text, to: text }
    })
    void resolve(plans, { stagger: 1 })
  })
}
