// Resolución — utilidad de portapapeles compartida por las superficies que copian texto
// (artículo, hub de enlaces). Clipboard API primero; sin permiso o sin API cae a un textarea
// oculto, el mismo fallback del prototipo. El resultado se anuncia en líneas role="status".

export async function copyText(text: string): Promise<boolean> {
  // Clipboard API solo con la API presente y en contexto seguro; si no, el fallback
  // del prototipo (textarea oculto + execCommand).
  const clipboard = navigator.clipboard
  if (clipboard && typeof clipboard.writeText === "function" && window.isSecureContext) {
    try {
      await clipboard.writeText(text)
      return true
    } catch {
      /* sin permiso: se intenta el fallback */
    }
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
