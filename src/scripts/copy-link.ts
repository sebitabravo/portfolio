// Resolución — "copiar enlace" del artículo (design/resolucion/post.html): copia la URL
// canónica, suena chirp, anuncia el resultado en una línea role="status" y el botón se
// re-resuelve a "copiado"/"reintentar" durante 1.6 s antes de volver a su rótulo.

import { sound } from "./sound/engine"
import { copyText } from "./clipboard"

const CONFIRM_HOLD_MS = 1600

export function setupCopyLink(): void {
  const button = document.getElementById("share")
  if (!(button instanceof HTMLButtonElement) || button.dataset.shareBound === "true") return
  button.dataset.shareBound = "true"

  const status = document.getElementById("share-status")
  const url = button.dataset.url ?? window.location.href
  const linkLabel = button.dataset.link ?? button.textContent ?? ""
  const copiedLabel = button.dataset.copied ?? ""
  const retryLabel = button.dataset.retry ?? ""
  const okText = button.dataset.linkCopied ?? ""
  const errorText = button.dataset.error ?? ""

  button.addEventListener("click", async () => {
    const ok = await copyText(url)
    sound.play("chirp")
    if (status) status.textContent = ok ? okText : errorText
    button.textContent = ok ? copiedLabel : retryLabel
    setTimeout(() => {
      button.textContent = linkLabel
    }, CONFIRM_HOLD_MS)
  })
}
