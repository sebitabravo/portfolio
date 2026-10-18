// Imágenes lazy dentro de <details>: si la fila estaba cerrada al cargar, Firefox puede no volver a
// evaluarlas al abrirse. Reasignar el src es una "mutación relevante" que reinicia la carga diferida
// sin tocar loading="lazy"; las que ya cargaron no se tocan.

const LAZY_IMAGE_SELECTOR = 'img[loading="lazy"]'

let controller: AbortController | null = null

export function revivePendingImages(details: HTMLDetailsElement): number {
  let revived = 0
  for (const image of details.querySelectorAll<HTMLImageElement>(LAZY_IMAGE_SELECTOR)) {
    if (image.complete && image.naturalWidth > 0) continue
    const source = image.getAttribute("src")
    if (!source) continue
    image.setAttribute("src", source)
    revived += 1
  }
  return revived
}

export function setupDetailsMedia(scope: Document = document): void {
  teardownDetailsMedia()
  const next = new AbortController()
  controller = next
  // "toggle" no burbujea: se escucha en captura para cubrir todas las filas con un solo listener.
  scope.addEventListener(
    "toggle",
    (event) => {
      const target = event.target
      if (target instanceof HTMLDetailsElement && target.open) revivePendingImages(target)
    },
    { capture: true, signal: next.signal },
  )
}

export function teardownDetailsMedia(): void {
  controller?.abort()
  controller = null
}
