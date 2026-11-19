// Resolución — momento 3 (§2): el email del contacto se copia. El botón .mail lleva la dirección
// partida en dos líneas de Geist Pixel; al copiar, el texto se re-resuelve a la confirmación y
// después vuelve a la dirección. Puerto del bloque #mail de design/resolucion/index.html.
// Sin Clipboard API cae a un textarea oculto (el prototipo usa el mismo fallback); el resultado
// se anuncia en una línea role="status". Sin reduced motion las líneas se intercambian sin motor.

import { sound } from "./sound/engine"
import { motion, resolve, hasShapes, type ResolveTarget } from "./resolve"

const CONFIRM_HOLD_MS = 1600

let teardown: (() => void) | null = null

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    /* sin permiso o sin API: se intenta el fallback */
  }
  const ta = document.createElement("textarea")
  ta.value = text
  ta.style.cssText = "position:fixed;opacity:0"
  document.body.append(ta)
  ta.select()
  let ok = false
  try {
    ok = document.execCommand("copy")
  } catch {
    ok = false
  }
  ta.remove()
  return ok
}

export function setupMail(): void {
  // astro:page-load también dispara en la carga inicial: sin guardia el click copiaría dos veces.
  const mail = document.getElementById("mail")
  if (!(mail instanceof HTMLButtonElement)) return
  if (mail.dataset.mailBound === "true") return
  mail.dataset.mailBound = "true"

  teardownMail()
  const lines = Array.from(mail.querySelectorAll<HTMLElement>(".l"))
  const status = document.getElementById("mail-status")
  const email = mail.dataset.email ?? ""
  const copiedLine = mail.dataset.copied ?? ""
  const errorText = mail.dataset.error ?? ""
  if (lines.length === 0 || !email) return

  const originals = lines.map((l) => l.textContent ?? "")
  const copiedTexts = [copiedLine, ""]
  let busy = false

  const setLines = (to: string[], from: string[]): Promise<void> =>
    motion() && hasShapes()
      ? resolve(
          lines.map((el, i): ResolveTarget => ({ el, from: from[i], to: to[i] })),
          { stagger: 0.3 },
        )
      : Promise.resolve(
          lines.forEach((el, i) => {
            el.textContent = to[i]
          }),
        )

  const onClick = async (): Promise<void> => {
    if (busy) return
    busy = true
    const ok = await copyText(email)
    sound.play("chirp")
    if (status) status.textContent = ok ? copiedLine : errorText
    if (!ok) {
      busy = false
      return
    }
    await setLines(copiedTexts, originals)
    await new Promise((r) => setTimeout(r, CONFIRM_HOLD_MS))
    await setLines(originals, copiedTexts)
    busy = false
  }

  mail.addEventListener("click", onClick)
  teardown = () => {
    mail.removeEventListener("click", onClick)
  }
}

export function teardownMail(): void {
  teardown?.()
  teardown = null
}
