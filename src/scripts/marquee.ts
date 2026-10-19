// Pausa accesible de la marquesina del stack (WCAG 2.2.2): el botón alterna
// el estado en la raíz y su etiqueta describe siempre la próxima acción.

let marqueeController: AbortController | null = null

export function syncMarquee(root: HTMLElement, toggle: HTMLElement, paused: boolean): void {
  root.dataset.paused = String(paused)
  const label = paused ? toggle.dataset.labelResume : toggle.dataset.labelPause
  if (label) toggle.setAttribute("aria-label", label)
}

export function setupMarquee(scope: Document = document): void {
  teardownMarquee()
  const controller = new AbortController()
  marqueeController = controller

  for (const root of scope.querySelectorAll<HTMLElement>("[data-marquee]")) {
    const toggle = root.querySelector<HTMLElement>("[data-marquee-toggle]")
    if (!toggle) continue
    syncMarquee(root, toggle, root.dataset.paused === "true")
    toggle.addEventListener("click", () => syncMarquee(root, toggle, root.dataset.paused !== "true"), {
      signal: controller.signal,
    })
  }
}

export function teardownMarquee(): void {
  marqueeController?.abort()
  marqueeController = null
}
