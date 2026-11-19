// Contrato del escenario antiguo que sobrevive a la limpieza: las capturas rotas se ocultan
// y los listeners se desmontan. Antes delegaba en el stack de motion (borrado con el port a
// Resolución); hoy es autónomo y solo conservan vivo su test de contrato.

let eagerCleanup: (() => void) | null = null

export function setupProjects(scope: Document = document): void {
  teardownProjects()
  const controller = new AbortController()
  const images = Array.from(scope.querySelectorAll<HTMLImageElement>("img[data-img-fallback]"))
  for (const image of images) {
    image.addEventListener("error", () => image.classList.add("hidden"), { signal: controller.signal })
  }
  eagerCleanup = () => {
    controller.abort()
    eagerCleanup = null
  }
}

export function teardownProjects(): void {
  eagerCleanup?.()
  eagerCleanup = null
}
