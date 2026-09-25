export function setupSignalStrip(): void {
  const strip = document.querySelector<HTMLElement>(".signal-strip")
  const toggle = strip?.querySelector<HTMLButtonElement>("[data-signal-toggle]")
  if (!strip || !toggle || toggle.dataset.bound === "true") return

  toggle.dataset.bound = "true"
  toggle.addEventListener("click", () => {
    const paused = strip.classList.toggle("is-paused")
    const label = paused ? strip.dataset.signalResume : strip.dataset.signalPause
    toggle.setAttribute("aria-pressed", String(paused))
    if (label) toggle.setAttribute("aria-label", label)
    const srText = toggle.querySelector(".sr-only")
    if (srText && label) srText.textContent = label
    const icon = toggle.querySelector('[aria-hidden="true"]')
    if (icon) icon.textContent = paused ? "▶" : "Ⅱ"
  })
}
