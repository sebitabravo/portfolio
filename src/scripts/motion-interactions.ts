export type Cleanup = () => void

export type MotionRoot = HTMLElement & {
  dataset: DOMStringMap & {
    motionStatus?: string
  }
}

export function createPointerMotion(
	gsap: typeof import("gsap")['gsap'],
	root: MotionRoot,
): Cleanup {
	const frame = root.querySelector<HTMLElement>(".hero-art-frame")
	if (!frame) return () => undefined

	const rotateX = gsap.quickTo(frame, "--hero-tilt-x", {
		duration: 0.55,
		ease: "power3.out",
	})
	const rotateY = gsap.quickTo(frame, "--hero-tilt-y", {
		duration: 0.55,
		ease: "power3.out",
	})
	const glowX = gsap.quickTo(frame, "--hero-glow-x", {
		duration: 0.8,
		ease: "power3.out",
	})
	const glowY = gsap.quickTo(frame, "--hero-glow-y", {
		duration: 0.8,
		ease: "power3.out",
	})

	let bounds = frame.getBoundingClientRect()
	let latestPointer: PointerEvent | null = null
	let pointerFrame = 0
	const updateBounds = () => {
		bounds = frame.getBoundingClientRect()
	}
	const applyPointer = () => {
		pointerFrame = 0
		if (!latestPointer) return
		const x = (latestPointer.clientX - bounds.left) / bounds.width - 0.5
		const y = (latestPointer.clientY - bounds.top) / bounds.height - 0.5

		rotateX(x * 4.5)
		rotateY(y * -4.5)
		glowX((x + 0.5) * 100)
		glowY((y + 0.5) * 100)
	}
	const onPointerMove = (event: PointerEvent) => {
		latestPointer = event
		if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer)
	}

	const reset = () => {
		latestPointer = null
		if (pointerFrame) cancelAnimationFrame(pointerFrame)
		pointerFrame = 0
		rotateX(0)
		rotateY(0)
		glowX(50)
		glowY(50)
	}

	const interactionController = new AbortController()
	const boundsObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateBounds)
	boundsObserver?.observe(frame)
	if (!boundsObserver) window.addEventListener("resize", updateBounds, { signal: interactionController.signal })
	frame.addEventListener("pointerenter", updateBounds, { signal: interactionController.signal })
	frame.addEventListener("pointermove", onPointerMove, { signal: interactionController.signal })
	frame.addEventListener("pointerleave", reset, { signal: interactionController.signal })

	return () => {
		interactionController.abort()
		boundsObserver?.disconnect()
		reset()
		gsap.killTweensOf(frame)
	}
}

export function createCardTilt(
	gsap: typeof import("gsap")['gsap'],
	card: HTMLElement,
): Cleanup {
	const rotateX = gsap.quickTo(card, "--card-rotate-x", {
		duration: 0.45,
		ease: "power3.out",
	})
	const rotateY = gsap.quickTo(card, "--card-rotate-y", {
		duration: 0.45,
		ease: "power3.out",
	})

	let bounds = card.getBoundingClientRect()
	let latestPointer: PointerEvent | null = null
	let pointerFrame = 0
	const updateBounds = () => {
		bounds = card.getBoundingClientRect()
	}
	const applyPointer = () => {
		pointerFrame = 0
		if (!latestPointer) return
		const x = (latestPointer.clientX - bounds.left) / bounds.width - 0.5
		const y = (latestPointer.clientY - bounds.top) / bounds.height - 0.5
		rotateX(y * -2.5)
		rotateY(x * 2.5)
	}
	const onPointerMove = (event: PointerEvent) => {
		latestPointer = event
		if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer)
	}
	const reset = () => {
		latestPointer = null
		if (pointerFrame) cancelAnimationFrame(pointerFrame)
		pointerFrame = 0
		rotateX(0)
		rotateY(0)
	}

	const controller = new AbortController()
	const boundsObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateBounds)
	boundsObserver?.observe(card)
	if (!boundsObserver) window.addEventListener("resize", updateBounds, { signal: controller.signal })
	card.addEventListener("pointerenter", updateBounds, { signal: controller.signal })
	card.addEventListener("pointermove", onPointerMove, { signal: controller.signal })
	card.addEventListener("pointerleave", reset, { signal: controller.signal })

	return () => {
		controller.abort()
		boundsObserver?.disconnect()
		reset()
		gsap.killTweensOf(card)
	}
}
