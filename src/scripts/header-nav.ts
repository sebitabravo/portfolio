// Resolución — sección activa en el nav: un solo IntersectionObserver sobre
// main > section[data-nav], banda 40%–45% del viewport, aria-current="location".
// Se desconecta en pagehide y se re-crea al restaurar bfcache (pageshow
// persistido). Puerto de la parte de nav de design/resolucion/common.js.
// Los enlaces de ruta (blog) llevan aria-current="page" renderizado en el
// servidor; el observer solo gobierna los enlaces ancla.

let navTeardown: (() => void) | null = null

export function setupHeaderNav(): void {
  teardownHeaderNav()

  const navLinks = new Map(
    Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav-main a[href^='#']")).map((link) => [
      (link.getAttribute("href") ?? "").slice(1),
      link,
    ]),
  )
  if (navLinks.size === 0) return

  // Sin IntersectionObserver: sin seguimiento de sección activa, sin lanzar;
  // aria-current queda ausente (los enlaces siguen navegando igual).
  if (!("IntersectionObserver" in window)) return

  const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[data-nav]"))
  const inBand = new Set<HTMLElement>()

  const paintNav = (): void => {
    const active = sections.filter((section) => inBand.has(section)).pop()
    const key = active ? (active.dataset.nav ?? null) : null
    navLinks.forEach((link, id) => {
      if (id === key) link.setAttribute("aria-current", "location")
      else link.removeAttribute("aria-current")
    })
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inBand.add(entry.target as HTMLElement)
        else inBand.delete(entry.target as HTMLElement)
      }
      paintNav()
    },
    { rootMargin: "-40% 0px -55% 0px" },
  )
  sections.forEach((section) => observer.observe(section))

  const stop = (): void => {
    observer.disconnect()
    inBand.clear()
  }
  const onPageHide = (): void => stop()
  const onPageShow = (event: PageTransitionEvent): void => {
    if (event.persisted) setupHeaderNav()
  }
  window.addEventListener("pagehide", onPageHide)
  window.addEventListener("pageshow", onPageShow)

  navTeardown = () => {
    stop()
    window.removeEventListener("pagehide", onPageHide)
    window.removeEventListener("pageshow", onPageShow)
  }
}

export function teardownHeaderNav(): void {
  navTeardown?.()
  navTeardown = null
}
