// Anillo de texto de los sellos, generado en build como imagen: es textura, no texto que leer.

const RING_PATH = "M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0"
const RING_CHARACTERS = 70
const XML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }

const escapeXml = (value: string) => value.replace(/[&<>"]/g, (char) => XML_ESCAPES[char])

// Repite el texto hasta cubrir la circunferencia sin cortar palabras.
export function sealRingText(text: string, locale = "es"): string {
  const unit = text.toLocaleUpperCase(locale)
  return unit.repeat(Math.max(1, Math.floor(RING_CHARACTERS / Math.max(unit.length, 1))))
}

// SVG blanco sobre transparente: sirve como máscara de luminancia y el color lo pone el tema.
export function sealRingSvg(text: string, locale = "es"): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><path id="ring" d="${RING_PATH}"/></defs><text fill="#fff" font-family="ui-monospace,Menlo,Consolas,'DejaVu Sans Mono',monospace" font-size="7.4" font-weight="500" letter-spacing="0.89"><textPath href="#ring" textLength="292" lengthAdjust="spacing">${escapeXml(sealRingText(text, locale))}</textPath></text></svg>`
}
