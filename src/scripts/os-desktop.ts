// Escritorio SB-OS: ventanas arrastrables dentro de la pantalla y reloj local.
// No depende de GSAP: arrastrar es interacción directa, no animación decorativa.

const SCREEN_SELECTOR = "[data-os-screen]"
const WINDOW_SELECTOR = "[data-os-window]"
const HANDLE_SELECTOR = "[data-os-window-handle]"
const CLOCK_SELECTOR = "[data-os-clock]"
const MENUBAR_HEIGHT = 30
const VISIBLE_EDGE = 72
const CLOCK_INTERVAL = 30_000

export interface DragBounds {
  readonly minX: number
  readonly maxX: number
  readonly minY: number
  readonly maxY: number
}

interface Offset {
  readonly x: number
  readonly y: number
}

type RectLike = Pick<DOMRect, "left" | "top" | "right" | "bottom" | "width">

let desktopController: AbortController | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

export function clamp(value: number, min: number, max: number): number {
  if (min > max) return min
  return Math.min(max, Math.max(min, value))
}

// Límites del desplazamiento: la barra de título nunca sale de la pantalla.
export function computeDragBounds(screen: RectLike, windowRect: RectLike, offset: Offset): DragBounds {
  const baseLeft = windowRect.left - offset.x
  const baseTop = windowRect.top - offset.y
  return {
    minX: screen.left - windowRect.width + VISIBLE_EDGE - baseLeft,
    maxX: screen.right - VISIBLE_EDGE - baseLeft,
    minY: screen.top + MENUBAR_HEIGHT - baseTop,
    maxY: screen.bottom - VISIBLE_EDGE / 2 - baseTop,
  }
}

export function readOffset(element: HTMLElement): Offset {
  const x = Number.parseFloat(element.style.getPropertyValue("--drag-x"))
  const y = Number.parseFloat(element.style.getPropertyValue("--drag-y"))
  return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 }
}

export function formatClock(date: Date, locale: string, timeZone = "America/Santiago"): string {
  const localeCode = locale.startsWith("en") ? "en-GB" : "es-CL"
  return new Intl.DateTimeFormat(localeCode, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(
    date,
  )
}

function bindWindow(screen: HTMLElement, element: HTMLElement, raise: () => number, signal: AbortSignal): void {
  const handle = element.querySelector<HTMLElement>(HANDLE_SELECTOR) ?? element
  let drag: { x: number; y: number; origin: Offset; bounds: DragBounds } | null = null

  element.addEventListener(
    "pointerdown",
    () => {
      element.style.zIndex = String(raise())
    },
    { signal },
  )

  handle.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return
      const origin = readOffset(element)
      drag = {
        x: event.clientX,
        y: event.clientY,
        origin,
        bounds: computeDragBounds(screen.getBoundingClientRect(), element.getBoundingClientRect(), origin),
      }
      handle.setPointerCapture?.(event.pointerId)
      element.classList.add("is-dragging")
    },
    { signal },
  )

  handle.addEventListener(
    "pointermove",
    (event) => {
      if (!drag) return
      const x = clamp(drag.origin.x + event.clientX - drag.x, drag.bounds.minX, drag.bounds.maxX)
      const y = clamp(drag.origin.y + event.clientY - drag.y, drag.bounds.minY, drag.bounds.maxY)
      element.style.setProperty("--drag-x", `${Math.round(x)}px`)
      element.style.setProperty("--drag-y", `${Math.round(y)}px`)
    },
    { signal },
  )

  const release = (event: PointerEvent) => {
    if (!drag) return
    drag = null
    element.classList.remove("is-dragging")
    if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture(event.pointerId)
  }
  handle.addEventListener("pointerup", release, { signal })
  handle.addEventListener("pointercancel", release, { signal })
}

export function setupOsDesktop(scope: Document = document): void {
  teardownOsDesktop()
  const screen = scope.querySelector<HTMLElement>(SCREEN_SELECTOR)
  if (!screen) return

  const controller = new AbortController()
  desktopController = controller
  const clock = screen.querySelector<HTMLElement>(CLOCK_SELECTOR)
  if (clock) {
    const locale = scope.documentElement.lang || "es"
    const tick = () => {
      clock.textContent = formatClock(new Date(), locale)
    }
    tick()
    clockTimer = setInterval(tick, CLOCK_INTERVAL)
  }

  let layer = 10
  const raise = () => {
    layer += 1
    return layer
  }
  for (const element of screen.querySelectorAll<HTMLElement>(WINDOW_SELECTOR)) {
    bindWindow(screen, element, raise, controller.signal)
  }
}

export function teardownOsDesktop(): void {
  desktopController?.abort()
  desktopController = null
  if (clockTimer) clearInterval(clockTimer)
  clockTimer = null
}
