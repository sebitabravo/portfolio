// Resolución — motor de resolución: baja de baja resolución a nítido en pasos de 80ms.
// Puerto de la parte del motor de design/resolucion/common.js (§2 y §4 de DESIGN.md).
// Cada celda recorre Line → Triangle → Grid → Circle y se asienta en Square. Las celdas
// son aria-hidden y el texto real vive en un span .sr mientras dura la animación; al
// terminar, el DOM vuelve a texto plano.

import { idle, reducedMotion, saveData } from "./compat"
import { sound } from "./sound/engine"

export const FRAME = 80

const SHAPES = ["s0", "s1", "s2", "s3"] as const

/** El motion vive en una clase del <html> que el boot inline decide antes del primer paint.
 *  Defensa en profundidad S4: si reduce o Save-Data se activaron sin la clase (o cambian en
 *  caliente), el trabajo de animación se salta igual y el contenido queda en su estado final. */
export const motion = (): boolean =>
  document.documentElement.classList.contains("motion") && !reducedMotion() && !saveData()

export interface ResolveTarget {
  el: HTMLElement
  from: string
  to: string
}

export interface ResolveOptions {
  stagger?: number
  settle?: boolean
}

function buildCells(el: HTMLElement, text: string): HTMLElement {
  const sr = document.createElement("span")
  sr.className = "sr"
  sr.textContent = text
  const cells = document.createElement("span")
  cells.setAttribute("aria-hidden", "true")
  el.textContent = ""
  el.append(sr, cells)
  return cells
}

/** La animación es aditiva: sin las fuentes de formas cargadas, el nombre simplemente queda final.
 *  Sin document.fonts o sin fonts.load (navegadores viejos) se resuelve true síncronamente;
 *  cada load individual que rechaza cuenta como fuente no cargada en vez de romper el race. */
export function fontsReady(): Promise<boolean> {
  const fonts = document.fonts
  if (!fonts || typeof fonts.load !== "function") return Promise.resolve(true)
  const loads = ["GP Line", "GP Triangle", "GP Grid", "GP Circle", "Geist Pixel"].map((family) =>
    fonts.load(`1em "${family}"`, "Sebastián Bravo trabajo").catch(() => false),
  )
  return Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 1200))]).then(() => {
    if (typeof fonts.check !== "function") return false
    return fonts.check('1em "GP Line"') && fonts.check('1em "GP Circle"')
  })
}

let shapes = false
/** S4/perf: las cuatro fuentes de formas (~140 KB) solo se bajan cuando el motion está
 *  activo y fuera del camino crítico (idle). Sin motion el nombre queda en su estado
 *  final y no se descarga una sola fuente de formas. */
export const shapesReady: Promise<boolean> = motion()
  ? idle(fontsReady).then((ok) => {
      shapes = ok
      return ok
    })
  : Promise.resolve(false)
export const hasShapes = (): boolean => shapes

export function resolve(targets: ResolveTarget[], { stagger = 1 }: ResolveOptions = {}): Promise<void> {
  return new Promise((done) => {
    const plan: Array<{ spans: Array<{ s: HTMLElement; to: string; start: number }> }> = []
    let idx = 0
    for (const t of targets) {
      const len = Math.max(t.from.length, t.to.length)
      const cells = buildCells(t.el, t.to)
      const spans: Array<{ s: HTMLElement; to: string; start: number }> = []
      for (let i = 0; i < len; i++) {
        const s = document.createElement("span")
        s.className = "cell"
        s.textContent = t.from[i] ?? " "
        cells.append(s)
        spans.push({ s, to: t.to[i] ?? " ", start: idx++ * stagger })
      }
      plan.push({ spans })
    }
    const total = Math.ceil(idx * stagger) + SHAPES.length
    let tick = 0
    const step = (): void => {
      for (const { spans } of plan) {
        for (const c of spans) {
          const k = Math.floor(tick - c.start)
          if (k < 0) continue
          if (k < SHAPES.length) {
            c.s.className = `cell ${SHAPES[k]}`
            c.s.textContent = c.to
          } else if (k === SHAPES.length) {
            c.s.className = "cell"
            c.s.textContent = c.to
            if (c.to.trim()) sound.play("tick")
          }
        }
      }
      if (++tick > total) {
        clearInterval(timer)
        for (const t of targets) t.el.textContent = t.to
        done()
      }
    }
    const timer = setInterval(step, FRAME)
    step()
  })
}
