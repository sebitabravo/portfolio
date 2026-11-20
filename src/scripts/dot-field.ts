// Resolución — ambiente (§2): campo de puntos detrás del hero que se enciende cerca del cursor
// en 4 niveles cuantizados. Puerto del bloque #field en design/resolucion/index.html. Solo corre
// bajo html.ambient (puntero fino, sin Save-Data, sin reduced motion: el boot inline decide),
// redibuja solo cuando el pointer cambia de celda de la grilla y queda pausado fuera de pantalla.

import { saveData } from "./compat"

let cleanup: (() => void) | null = null

export function setupDotField(): void {
  // astro:page-load también dispara en la carga inicial: sin guardia los listeners del
  // pointer se duplican.
  const guard = document.getElementById("field")
  if (!(guard instanceof HTMLCanvasElement)) return
  if (guard.dataset.fieldBound === "true") return
  guard.dataset.fieldBound = "true"

  teardownDotField()

  const field = guard
  if (!(field instanceof HTMLCanvasElement)) return
  // Solo corre bajo html.ambient (puntero fino, sin Save-Data, sin reduced motion: el boot
  // inline decide). Defensa en profundidad: si Save-Data se activó sin la clase, se salta
  // igual y el canvas queda con su dibujo inicial.
  if (!document.documentElement.classList.contains("ambient") || saveData()) return
  const ctx = field.getContext("2d")
  if (!ctx) return

  const GAP = 24
  const RADIUS = 6
  let w = 0
  let h = 0
  let cx = -999
  let cy = -999
  let visible = true
  let base = ""
  let lit = ""
  let resizeHandler: (() => void) | null = null
  let themeHandler: (() => void) | null = null
  let observer: IntersectionObserver | null = null
  let moveHandler: ((e: PointerEvent) => void) | null = null
  let leaveHandler: (() => void) | null = null

  const colors = (): void => {
    const cs = getComputedStyle(field)
    base = cs.color
    lit = cs.borderTopColor
  }

  const paint = (): void => {
    ctx.clearRect(0, 0, w, h)
    for (let y = GAP / 2; y < h; y += GAP) {
      for (let x = GAP / 2; x < w; x += GAP) {
        const d = Math.hypot((x - cx) / GAP, (y - cy) / GAP)
        const level = d < RADIUS ? Math.ceil(((RADIUS - d) / RADIUS) * 4) : 0
        ctx.fillStyle = level ? lit : base
        ctx.globalAlpha = level ? level / 4 : 1
        const s = 2 + level * 2
        ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s)
      }
    }
    ctx.globalAlpha = 1
  }

  const size = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = field.clientWidth
    h = field.clientHeight
    field.width = w * dpr
    field.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    paint()
  }

  colors()
  size()

  resizeHandler = size
  window.addEventListener("resize", resizeHandler)

  themeHandler = () => {
    colors()
    paint()
  }
  window.addEventListener("themechange", themeHandler)

  // Sin IntersectionObserver: sin pausa fuera de pantalla (fallback documentado); el
  // campo sigue pintando con visible=true (valor inicial) y el dibujo inicial se conserva.
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(field)
  }

  moveHandler = (e) => {
    if (!visible) return
    const r = field.getBoundingClientRect()
    const nx = Math.floor((e.clientX - r.left) / GAP) * GAP + GAP / 2
    const ny = Math.floor((e.clientY - r.top) / GAP) * GAP + GAP / 2
    if (nx === cx && ny === cy) return
    cx = nx
    cy = ny
    paint()
  }
  leaveHandler = () => {
    cx = -999
    cy = -999
    paint()
  }
  field.parentElement?.addEventListener("pointermove", moveHandler)
  field.parentElement?.addEventListener("pointerleave", leaveHandler)

  cleanup = () => {
    if (resizeHandler) window.removeEventListener("resize", resizeHandler)
    if (themeHandler) window.removeEventListener("themechange", themeHandler)
    observer?.disconnect()
    field.parentElement?.removeEventListener("pointermove", moveHandler)
    field.parentElement?.removeEventListener("pointerleave", leaveHandler)
  }
}

export function teardownDotField(): void {
  cleanup?.()
  cleanup = null
}
