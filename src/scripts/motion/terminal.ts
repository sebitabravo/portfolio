import type { MotionContext, MotionModule } from "./types"

const ROOT_SELECTOR = "[data-terminal]"
const COMMAND_SELECTOR = "[data-terminal-cmd]"
const OUTPUT_SELECTOR = "[data-terminal-out]"
const START_DELAY = 650
const KEY_DELAY = 42
const OUTPUT_DELAY = 260
const LINE_DELAY = 420

export interface TerminalStep {
  readonly at: number
  readonly line: number
  readonly kind: "type" | "output"
  readonly text: string
}

// Guion puro de la terminal: cuándo aparece cada tecla y cada salida.
export function planTerminal(commands: readonly string[]): TerminalStep[] {
  const steps: TerminalStep[] = []
  let at = START_DELAY
  commands.forEach((command, line) => {
    for (let index = 1; index <= command.length; index += 1) {
      at += KEY_DELAY
      steps.push({ at, line, kind: "type", text: command.slice(0, index) })
    }
    at += OUTPUT_DELAY
    steps.push({ at, line, kind: "output", text: "" })
    at += LINE_DELAY
  })
  return steps
}

export function createTerminalModule(): MotionModule {
  let timers: ReturnType<typeof setTimeout>[] = []
  let commands: HTMLElement[] = []
  let outputs: HTMLElement[] = []
  let originals: string[] = []

  const destroy = () => {
    timers.forEach((timer) => clearTimeout(timer))
    timers = []
    // Sin movimiento la terminal queda escrita completa: el estado final es la fuente de verdad.
    commands.forEach((command, index) => {
      command.textContent = originals[index] ?? command.textContent
    })
    outputs.forEach((output) => output.style.removeProperty("visibility"))
    commands = []
    outputs = []
    originals = []
  }

  return {
    id: "terminal",
    init(context: MotionContext) {
      destroy()
      const root = context.scope.querySelector<HTMLElement>(ROOT_SELECTOR)
      if (!root) return
      commands = Array.from(root.querySelectorAll<HTMLElement>(COMMAND_SELECTOR))
      outputs = Array.from(root.querySelectorAll<HTMLElement>(OUTPUT_SELECTOR))
      if (commands.length === 0) return

      originals = commands.map((command) => command.textContent ?? "")
      commands.forEach((command) => {
        command.textContent = ""
      })
      outputs.forEach((output) => {
        output.style.visibility = "hidden"
      })

      for (const step of planTerminal(originals)) {
        timers.push(
          setTimeout(() => {
            if (step.kind === "type") commands[step.line].textContent = step.text
            else outputs[step.line]?.style.removeProperty("visibility")
          }, step.at),
        )
      }
    },
    refresh() {},
    destroy,
    cleanup: destroy,
  }
}
