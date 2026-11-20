// Resolución — botón de tema del encabezado: alterna claro/oscuro sobre
// data-theme, persiste en la clave propia del diseño ("sb-theme") y anuncia
// el cambio por el evento "themechange" (lo escucha el campo de puntos).
// Puerto de la parte de tema de design/resolucion/common.js. El esquema
// inicial lo aplica el script inline de Layout.astro antes del primer paint.
import { sound } from "./sound/engine"

const THEME_KEY = "sb-theme"

let themeCleanup: (() => void) | null = null

export function initThemeToggle(): void {
  const button = document.getElementById("theme")
  if (!(button instanceof HTMLButtonElement)) return
  // Astro:page-load también dispara en la carga inicial: si el botón ya está
  // atado, no re-limpiar (borraría el listener vivo) ni re-atarse.
  if (button.dataset.themeBound === "true") return

  // Limpiar listeners de una navegación anterior (View Transitions)
  themeCleanup?.()
  themeCleanup = null

  button.dataset.themeBound = "true"

  const onToggle = (): void => {
    const root = document.documentElement
    const next = root.dataset.theme === "light" ? "dark" : "light"
    root.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* sin persistencia: el tema vive solo en esta página */
    }
    sound.play("press")
    window.dispatchEvent(new Event("themechange"))
  }

  button.addEventListener("click", onToggle)

  themeCleanup = () => {
    button.removeEventListener("click", onToggle)
  }
}
