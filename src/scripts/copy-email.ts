// Copia el email al portapapeles; sin Clipboard API el botón sigue oculto y
// el enlace mailto continúa siendo la vía principal de contacto.

let copyController: AbortController | null = null
let resetTimer: ReturnType<typeof setTimeout> | null = null

const RESET_DELAY = 2200

export async function copyEmail(
  button: HTMLElement,
  status: HTMLElement | null,
  clipboard: Clipboard,
): Promise<boolean> {
  const email = button.dataset.copyEmail
  if (!email) return false
  try {
    await clipboard.writeText(email)
  } catch {
    return false
  }
  const original = button.dataset.labelIdle ?? button.textContent?.trim() ?? ""
  button.dataset.labelIdle = original
  button.textContent = button.dataset.labelCopied ?? original
  button.dataset.copied = "true"
  if (status) status.textContent = button.dataset.labelCopied ?? ""
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    button.textContent = original
    delete button.dataset.copied
    if (status) status.textContent = ""
  }, RESET_DELAY)
  return true
}

export function setupCopyEmail(scope: Document = document): void {
  teardownCopyEmail()
  const clipboard = scope.defaultView?.navigator.clipboard
  if (!clipboard || typeof clipboard.writeText !== "function") return

  const controller = new AbortController()
  copyController = controller
  const status = scope.querySelector<HTMLElement>("[data-copy-status]")
  for (const button of scope.querySelectorAll<HTMLElement>("[data-copy-email]")) {
    button.hidden = false
    button.addEventListener("click", () => void copyEmail(button, status, clipboard), { signal: controller.signal })
  }
}

export function teardownCopyEmail(): void {
  copyController?.abort()
  copyController = null
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = null
}
