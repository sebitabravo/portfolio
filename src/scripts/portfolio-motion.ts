import { createCardTilt, createPointerMotion } from "./motion-interactions"

type Cleanup = () => void

export type MotionConnection = {
	effectiveType?: string
	saveData?: boolean
}

type MotionRoot = HTMLElement & {
	dataset: DOMStringMap & {
		motionStatus?: string
	}
}

let activeCleanup: Cleanup | null = null
let setupSequence = 0

/**
 * Progressive motion layer for the home page.
 *
 * The HTML/CSS experience remains complete without this module. WebGL and
 * GSAP are loaded only after the page is available, and every listener,
 * ScrollTrigger and WebGL resource is released before an Astro view swap.
 */
export function setupPortfolioMotion(): void {
	const sequence = ++setupSequence
	activeCleanup?.()
	activeCleanup = null

	const root = document.querySelector<MotionRoot>("[data-portfolio-motion]")
	const canvas = root?.querySelector<HTMLCanvasElement>("[data-hero-webgl]")
	if (!root || !canvas) return

	let matchMediaCleanup: Cleanup | null = null
	let disposed = false
	let loadTimer: number | null = null
	let idleHandle: number | null = null

	root.dataset.motionStatus = "loading"
	canvas.dataset.webglStatus = "pending"

	activeCleanup = () => {
		disposed = true
		if (loadTimer !== null) {
			window.clearTimeout(loadTimer)
			loadTimer = null
		}
		if (idleHandle !== null) {
			const idleWindow = window as Window & { cancelIdleCallback?: (handle: number) => void }
			idleWindow.cancelIdleCallback?.(idleHandle)
			idleHandle = null
		}
		matchMediaCleanup?.()
		matchMediaCleanup = null
		if (sequence === setupSequence) {
			root.dataset.motionStatus = "idle"
		}
	}

	const load = () => {
		loadTimer = null
		idleHandle = null
		const shouldLoadWebGL = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && canLoadWebGLEnhancement()
		void loadMotionLayer(shouldLoadWebGL).then(({ gsap, ScrollTrigger, webgl }) => {
			if (disposed || sequence !== setupSequence) return

			gsap.registerPlugin(ScrollTrigger)
			const media = gsap.matchMedia()

			media.add(
				{
					reduceMotion: "(prefers-reduced-motion: reduce)",
					finePointer: "(pointer: fine)",
				},
				(context) => {
					const conditions = context.conditions as {
						reduceMotion?: boolean
						finePointer?: boolean
					}

					if (conditions.reduceMotion) {
						root.dataset.motionStatus = "reduced"
						canvas.dataset.webglStatus = "reduced"
						return undefined
					}

					root.dataset.motionStatus = "active"
					let sceneCleanup: Cleanup | null = null
					let callbackDisposed = false
					if (webgl) {
						if (!callbackDisposed && !disposed && sequence === setupSequence) {
							sceneCleanup = webgl.createHeroScene(canvas, root)
						}
					} else {
						canvas.dataset.webglStatus = "fallback"
					}
					const interactionCleanup = conditions.finePointer
						? createPointerMotion(gsap, root)
						: null
					const scrollCleanup = createScrollMotion(gsap, ScrollTrigger)

					return () => {
						callbackDisposed = true
						scrollCleanup?.()
						interactionCleanup?.()
						sceneCleanup?.()
					}
				},
			)

			matchMediaCleanup = () => media.revert()
		}).catch(() => {
			if (disposed || sequence !== setupSequence) return
			root.dataset.motionStatus = "fallback"
			canvas.dataset.webglStatus = "fallback"
		})
	}

	const idleWindow = window as Window & {
		requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
	}
	if (idleWindow.requestIdleCallback) {
		idleHandle = idleWindow.requestIdleCallback(load, { timeout: 2500 })
	} else {
		loadTimer = window.setTimeout(load, 2500)
	}
}

export function teardownPortfolioMotion(): void {
	setupSequence += 1
	activeCleanup?.()
	activeCleanup = null
}

async function loadMotionLayer(shouldLoadWebGL: boolean) {
	const webglPromise = shouldLoadWebGL
		? import("./hero-webgl").catch(() => null)
		: Promise.resolve(null)
	const [{ gsap }, { ScrollTrigger }, webgl] = await Promise.all([
		import("gsap"),
		import("gsap/ScrollTrigger"),
		webglPromise,
	])

	return { gsap, ScrollTrigger, webgl }
}

function canLoadWebGLEnhancement(): boolean {
	const connection = (navigator as Navigator & { connection?: MotionConnection }).connection
	const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
	return shouldLoadWebGLEnhancement(connection, deviceMemory)
}

export function shouldLoadWebGLEnhancement(
	connection?: MotionConnection,
	deviceMemory?: number,
): boolean {
	if (connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") {
		return false
	}

	return typeof deviceMemory !== "number" || deviceMemory >= 2
}

function createScrollMotion(
	gsap: typeof import("gsap")['gsap'],
	ScrollTrigger: typeof import("gsap/ScrollTrigger")['ScrollTrigger'],
): Cleanup {
	const projectGrid = document.querySelector<HTMLElement>("[data-projects-list]")
	if (!projectGrid) return () => undefined

	const cards = Array.from(projectGrid.querySelectorAll<HTMLElement>("[data-project-card]"))
	if (cards.length === 0) return () => undefined

	const projectSection = projectGrid.closest<HTMLElement>("section[id]") ?? projectGrid
	const meter = projectGrid.parentElement?.querySelector<HTMLElement>("[data-project-scroll-meter] span")
	const projectTimeline = gsap.fromTo(
		cards,
		{
			"--motion-y": "1.2rem",
			"--motion-scale": 0.985,
		},
		{
			"--motion-y": "0rem",
			"--motion-scale": 1,
			duration: 0.9,
			ease: "power2.out",
			stagger: 0.09,
			scrollTrigger: {
				trigger: projectSection,
				start: "top 88%",
				end: "top 36%",
				scrub: 0.75,
			},
		},
	)

	const sectionTrigger = ScrollTrigger.create({
		trigger: projectSection,
		start: "top bottom",
		end: "bottom top",
		scrub: true,
		onUpdate: (instance) => {
			projectGrid.style.setProperty("--project-progress", instance.progress.toFixed(3))
			if (meter) meter.style.transform = `scaleX(${instance.progress})`
		},
	})

	const cardCleanups = cards.map((card) => createCardTilt(gsap, card))

	return () => {
		projectTimeline.scrollTrigger?.kill()
		projectTimeline.kill()
		sectionTrigger.kill()
		cardCleanups.forEach((cleanup) => cleanup())
		projectGrid.style.removeProperty("--project-progress")
		if (meter) meter.style.transform = "scaleX(0)"
	}
}
