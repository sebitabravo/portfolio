// Resolución — compatibilidad S4: helpers que nunca lanzan en navegadores viejos.
// matchMedia y requestIdleCallback solo se consumen por acá; los constructores
// IntersectionObserver/ResizeObserver se guardan inline en cada módulo con el
// patrón literal `!("IntersectionObserver" in window)`.

export interface SafeMediaQueryList {
  readonly matches: boolean
  addEventListener(): void
  removeEventListener(): void
}

const noopList = (matches: boolean): SafeMediaQueryList => ({
  matches,
  addEventListener() {},
  removeEventListener() {},
})

/** matchMedia con fallback: sin API o con query inválida devuelve
 * `{ matches: false, addEventListener() {}, removeEventListener() {} }`, el mismo
 * objeto no-op para navegadores que solo traen el addListener legado. */
export function safeMatchMedia(query: string): SafeMediaQueryList {
  try {
    if (typeof window.matchMedia !== "function") return noopList(false)
    const mql = window.matchMedia(query)
    if (!mql || typeof mql.matches !== "boolean") return noopList(false)
    return {
      get matches() {
        return mql.matches
      },
      addEventListener() {},
      removeEventListener() {},
    }
  } catch {
    return noopList(false)
  }
}

/** requestIdleCallback con fallback a setTimeout(fn, 200) cuando el navegador no lo trae. */
export function requestIdle(fn: () => void): void {
  const w = window as Window & { requestIdleCallback?: (callback: () => void) => number }
  if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(() => fn())
  else setTimeout(fn, 200)
}

/** Igual que requestIdle pero devuelve el resultado: el trabajo caro (bajar fuentes de
 *  formas, arrancar el campo de puntos) se agenda fuera del camino crítico del LCP. */
export function idle<T>(work: () => Promise<T>): Promise<T> {
  return new Promise<T>((done) => requestIdle(() => done(work())))
}

/** prefers-reduced-motion: reduce, leído sin lanzar (helper de matchMedia). */
export function reducedMotion(): boolean {
  return safeMatchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Save-Data del Client Hints de red (navigator.connection es opcional). */
export function saveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}
