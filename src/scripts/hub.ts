// Resolución — hub de enlaces (/links, §12): el botón #mail copia la dirección con chirp y
// swap de texto (el prototipo no resuelve aquí), y los bloques data-copy escriben su
// <pre> al portapapeles. Los resultados viven en líneas role="status".

import { sound } from "./sound/engine"
import { copyText } from "./clipboard"

const CONFIRM_HOLD_MS = 1600

export function setupHub(): void {
  const main = document.querySelector("main")
  if (!main || main.dataset.hubBound === "true") return
  main.dataset.hubBound = "true"

  const mail = document.getElementById("mail")
  const mailDisplay = document.getElementById("mail-u")
  const mailStatus = document.getElementById("mail-status")
  if (mail instanceof HTMLButtonElement && mailDisplay && !mail.dataset.hubMailBound) {
    mail.dataset.hubMailBound = "true"
    const email = mail.dataset.email ?? ""
    const original = mailDisplay.textContent ?? ""
    const copied = mail.dataset.copied ?? original
    const failed = mail.dataset.failed ?? original
    mail.addEventListener("click", async () => {
      const ok = await copyText(email)
      sound.play("chirp")
      if (mailStatus) mailStatus.textContent = ok ? mail.dataset.ok ?? "" : mail.dataset.error ?? ""
      mailDisplay.textContent = ok ? copied : failed
      setTimeout(() => {
        mailDisplay.textContent = original
      }, CONFIRM_HOLD_MS)
    })
  }

  for (const button of main.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
    if (button.dataset.hubCopyBound === "true") continue
    button.dataset.hubCopyBound = "true"
    const block = document.getElementById(button.dataset.copy ?? "")
    const status = document.getElementById("copy-status")
    if (!block) continue
    const was = button.textContent ?? ""
    button.addEventListener("click", async () => {
      const ok = await copyText(block.textContent ?? "")
      sound.play("chirp")
      if (status) status.textContent = button.dataset.ok ?? ""
      button.textContent = ok ? button.dataset.copied ?? was : button.dataset.retry ?? was
      setTimeout(() => {
        button.textContent = was
      }, CONFIRM_HOLD_MS)
    })
  }
}
