// Resolución — switch de sonido del encabezado: role="switch" que lee
// "sonido: off/on" (o "sound: off/on" según el idioma del documento) y
// persiste en la clave propia del diseño. Puerto de la parte de sonido de
// design/resolucion/common.js; la etiqueta se deriva de
// document.documentElement.lang (corrección v1.3 del prototipo).
import { sound } from "./engine"

const esLabel = (on: boolean): string => (on ? "sonido: on" : "sonido: off")
const enLabel = (on: boolean): string => (on ? "sound: on" : "sound: off")

export function initSoundToggle(): void {
  const root = document.documentElement
  const button = document.getElementById("sound")
  const label = document.getElementById("sound-label")
  if (!(button instanceof HTMLButtonElement) || button.dataset.soundBound === "true") return
  button.dataset.soundBound = "true"

  const isSpanish = (root.getAttribute("lang") || "es").toLowerCase().startsWith("es")
  const labelText = isSpanish ? esLabel : enLabel

  const paint = (): void => {
    button.setAttribute("aria-checked", String(sound.on))
    if (label) label.textContent = labelText(sound.on)
  }

  paint()
  button.addEventListener("click", () => {
    sound.set(!sound.on)
    paint()
    sound.play("press")
  })
}
