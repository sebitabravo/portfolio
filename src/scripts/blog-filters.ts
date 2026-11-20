// Resolución — filtros del índice del blog: chips con aria-pressed que ocultan filas por
// data-topic (tema de src/lib/blog-topics.ts) y actualizan el contador role="status". Puerto
// del script de design/resolucion/blog.html; cada cambio de filtro suena un tick (§4:
// hover/click del índice). Sin JS, las filas salen visibles en el HTML.

import { sound } from "./sound/engine"

export function setupBlogFilters(): void {
  const list = document.getElementById("posts")
  if (!list || list.dataset.filtersBound === "true") return
  list.dataset.filtersBound = "true"

  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>(".filters .chip"))
  const rows = Array.from(list.querySelectorAll<HTMLElement>(".row"))
  const count = document.getElementById("count")
  const countLabel = count?.dataset.label ?? ""

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.f
      for (const other of chips) other.setAttribute("aria-pressed", String(other === chip))
      let visible = 0
      for (const row of rows) {
        const on = filter === "all" || row.dataset.topic === filter
        row.hidden = !on
        if (on) visible++
      }
      if (count) count.textContent = `${visible} ${countLabel}`
      sound.play("tick")
    })
  }
}
