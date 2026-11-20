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

  // aria-checked refleja la preferencia persistida; el texto refleja la verdad
  // audible: con el audio bloqueado la etiqueta no reclama "on" en silencio.
  const paint = (preference: boolean, audible = preference): void => {
    button.setAttribute("aria-checked", String(preference))
    if (label) label.textContent = labelText(audible)
  }

  paint(sound.on)

  button.addEventListener("click", () => {
    if (sound.on) {
      // OFF: press suena mientras el sonido sigue habilitado, después desactiva.
      sound.play("press")
      sound.set(false)
      paint(false)
      return
    }
    // ON: pintura inmediata de la preferencia; la verdad audible llega tras el await.
    paint(true)
    void (async () => {
      sound.set(true)
      const ok = await sound.unlock()
      if (!sound.on) return // el usuario apagó durante el await: no repintar encima
      if (ok) {
        sound.play("press") // el switch se confirma a sí mismo ya audible
        paint(true)
        return
      }
      // Sin audio real (política o sin dispositivo) la preferencia vuelve a off:
      // un switch encendido con la etiqueta "off" se contradice a sí mismo.
      sound.set(false)
      paint(false)
    })()
  })
}
