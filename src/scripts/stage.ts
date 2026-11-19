// Resolución — momento 2 (§2): los productos enfocan. Escenario del home: pestañas con roving
// tabindex (↑ ↓ Home End, activación automática), secuencia de foco del screenshot en cuatro
// resoluciones (24 → 96 → 384 → original, 80ms por frame, image-rendering: pixelated) y métricas
// que cuentan en 8 pasos solo cuando el valor empieza con un dígito. Puerto del escenario de
// design/resolucion/index.html. Los paneles y las métricas llegan renderizados del servidor:
// sin JS, el escenario muestra el primer proyecto completo y estático.

import { sound } from "./sound/engine"
import { FRAME, motion } from "./resolve"

const FOCUS_SIZES = [24, 96, 384]

interface StageContext {
  tabs: HTMLButtonElement[]
  panels: HTMLElement[]
  focusTimers: Map<HTMLElement, ReturnType<typeof setInterval>>
  counted: Set<HTMLElement>
}

let teardown: (() => void) | null = null

/** Contador en 8 pasos de 60ms; los valores que no empiezan con dígito quedan fijos.
 *  El valor final viene de data-value server-side: nunca del textContent mutable. */
function countUp(el: HTMLElement, final: string): void {
  if (!motion() || !/^\d/.test(final)) {
    el.textContent = final
    return
  }
  const re = /\d+(?:[.,]\d+)?/g
  const nums = [...final.matchAll(re)].map((m) => m[0])
  let step = 0
  if (window.innerWidth >= 720) el.style.minWidth = `${final.length}ch`
  const draw = (): void => {
    let i = 0
    el.textContent = final.replace(re, () => {
      const raw = nums[i++] ?? "0"
      const decimals = (raw.split(/[.,]/)[1] ?? "").length
      const separator = raw.includes(",") ? "," : "."
      const value = (Number.parseFloat(raw.replace(",", ".")) * step) / 8
      return value.toFixed(decimals).replace(".", separator)
    })
  }
  const timer = setInterval(() => {
    step++
    draw()
    if (step >= 8) clearInterval(timer)
  }, 60)
  draw()
}

function countMetrics(panel: HTMLElement, ctx: StageContext): void {
  if (ctx.counted.has(panel)) return
  ctx.counted.add(panel)
  for (const value of panel.querySelectorAll<HTMLElement>(".metrics .v")) {
    countUp(value, value.dataset.value ?? value.textContent ?? "")
  }
}

/** Secuencia de foco: el canvas pinta el frame de baja resolución sobre la imagen final. */
function focusShot(panel: HTMLElement, ctx: StageContext): void {
  const img = panel.querySelector<HTMLImageElement>(".shot img")
  const canvas = panel.querySelector<HTMLCanvasElement>(".shot canvas")
  const c2d = canvas?.getContext("2d")
  const previous = ctx.focusTimers.get(panel)
  if (previous) clearInterval(previous)

  const stop = (): void => {
    if (canvas) canvas.hidden = true
    const timer = ctx.focusTimers.get(panel)
    if (timer) clearInterval(timer)
    ctx.focusTimers.delete(panel)
  }

  if (!img || !canvas || !c2d) return
  const src = img.currentSrc || img.src
  if (!src) return
  if (!motion()) {
    stop()
    return
  }
  const im = new Image()
  im.decoding = "async"
  im.src = src
  void im
    .decode()
    .catch(() => undefined)
    .then(() => {
      // El usuario pudo cambiar de pestaña mientras decodificaba: solo enfoca si sigue visible.
      if (panel.hidden) return
      let frame = 0
      const draw = (): void => {
        if (frame >= FOCUS_SIZES.length || panel.hidden) {
          stop()
          return
        }
        const w = FOCUS_SIZES[frame]
        canvas.width = w
        canvas.height = Math.round(w * 0.625)
        c2d.imageSmoothingQuality = "high"
        c2d.drawImage(im, 0, 0, canvas.width, canvas.height)
        canvas.hidden = false
        frame++
      }
      draw()
      ctx.focusTimers.set(panel, setInterval(draw, FRAME))
    })
}

function select(slug: string, ctx: StageContext, user: boolean): void {
  const index = ctx.tabs.findIndex((tab) => tab.dataset.slug === slug)
  if (index === -1) return
  ctx.tabs.forEach((tab, i) => {
    const on = i === index
    tab.setAttribute("aria-selected", String(on))
    tab.tabIndex = on ? 0 : -1
  })
  const panel = ctx.panels[index]
  ctx.panels.forEach((p, i) => {
    p.hidden = i !== index
  })
  if (user) sound.play("shutter")
  countMetrics(panel, ctx)
  focusShot(panel, ctx)
}

export function setupStage(): void {
  // astro:page-load también dispara en la carga inicial: si el escenario ya está atado,
  // no re-atarse (duplicaría listeners y el contador leería textContent a medio contar).
  const firstTab = document.querySelector<HTMLButtonElement>('[role="tab"][data-slug]')
  if (!firstTab || firstTab.dataset.stageBound === "true") return
  firstTab.dataset.stageBound = "true"

  teardownStage()

  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"][data-slug]'))
  const panels = Array.from(document.querySelectorAll<HTMLElement>("[role='tabpanel'][data-panel]"))
  if (tabs.length === 0 || panels.length !== tabs.length) return

  const ctx: StageContext = { tabs, panels, focusTimers: new Map(), counted: new Set() }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab.dataset.slug ?? "", ctx, true))
    // §5: hover del índice suena tick; click selecciona (el prototipo descartó hover-select).
    tab.addEventListener("pointerenter", () => sound.play("tick"))
    tab.addEventListener("focus", () => select(tab.dataset.slug ?? "", ctx, false))
    tab.addEventListener("keydown", (e) => {
      const delta = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0
      if (delta === 0 && e.key !== "Home" && e.key !== "End") return
      e.preventDefault()
      const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + delta + tabs.length) % tabs.length
      tabs[next].focus()
    })
  })

  // Estado inicial: primer proyecto visible, métricas cuentan solo si hay motion.
  const first = ctx.panels[0]
  if (first && !first.hidden) countMetrics(first, ctx)

  teardown = () => {
    for (const timer of ctx.focusTimers.values()) clearInterval(timer)
    ctx.focusTimers.clear()
  }
}

export function teardownStage(): void {
  teardown?.()
  teardown = null
}
