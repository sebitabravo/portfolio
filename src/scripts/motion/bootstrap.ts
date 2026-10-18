import type { MotionController } from "./types"

export interface MotionBootstrap {
  readonly controller: MotionController | null
  start(): void
  stop(): void
}

export interface MotionBootstrapOptions {
  readonly scope?: Document
}

export function createMotionBootstrap(
  createController: () => MotionController,
  options: MotionBootstrapOptions = {},
): MotionBootstrap {
  const scope = options.scope ?? document
  let controller: MotionController | null = null
  let navigating = false

  const stop = () => {
    const current = controller
    controller = null
    current?.destroy()
    current?.cleanup()
  }

  const start = () => {
    stop()
    controller = createController()
    controller.init()
  }

  // El primer `page-load` pertenece a la carga inicial y lo arranca Hero desde
  // `requestIdleCallback`. Solo una navegación del router justifica recrear el
  // controller; arrancar antes competiría con el LCP del hero.
  scope.addEventListener("astro:before-swap", () => {
    navigating = true
    stop()
  })
  scope.addEventListener("astro:page-load", () => {
    if (!navigating) return
    navigating = false
    start()
  })

  return {
    get controller() {
      return controller
    },
    start,
    stop,
  }
}
