import {
	AdditiveBlending,
	BufferGeometry,
	Float32BufferAttribute,
	Group,
	IcosahedronGeometry,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	WebGLRenderer,
} from "three"
import WebGL from "three/addons/capabilities/WebGL.js"

type MotionRoot = HTMLElement & {
	dataset: DOMStringMap & {
		motionStatus?: string
	}
}

type Cleanup = () => void

export function createHeroScene(
	canvas: HTMLCanvasElement,
	root: MotionRoot,
): Cleanup | null {
	if (!WebGL.isWebGL2Available()) {
		canvas.dataset.webglStatus = "fallback"
		return null
	}

	let renderer: WebGLRenderer
	try {
		renderer = new WebGLRenderer({
			canvas,
			alpha: true,
			antialias: false,
			powerPreference: "low-power",
		})
	} catch {
		canvas.dataset.webglStatus = "fallback"
		return null
	}

	const scene = new Scene()
	const camera = new PerspectiveCamera(35, 1, 0.1, 10)
	camera.position.z = 4.2

	const group = new Group()
	scene.add(group)

	const compactQuery = window.matchMedia("(max-width: 767px)")
	let isCompact = compactQuery.matches
	const pointCount = isCompact ? 42 : 78
	const positions = createSignalPositions(pointCount)
	const pointsGeometry = new BufferGeometry()
	pointsGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3))

	const pointsMaterial = new PointsMaterial({
		color: 0xc7b7ff,
		size: isCompact ? 0.035 : 0.042,
		transparent: true,
		opacity: 0.76,
		depthWrite: false,
		blending: AdditiveBlending,
	})
	const points = new Points(pointsGeometry, pointsMaterial)
	group.add(points)

	const lineGeometry = new BufferGeometry()
	lineGeometry.setAttribute("position", new Float32BufferAttribute(createSignalLines(positions), 3))
	const lineMaterial = new LineBasicMaterial({
		color: 0x9b82ff,
		transparent: true,
		opacity: 0.17,
		depthWrite: false,
		blending: AdditiveBlending,
	})
	const lines = new LineSegments(lineGeometry, lineMaterial)
	group.add(lines)

	const wireGeometry = new IcosahedronGeometry(0.82, 1)
	const wireMaterial = new MeshBasicMaterial({
		color: 0x8bbcff,
		wireframe: true,
		transparent: true,
		opacity: 0.15,
	})
	const wire = new Mesh(wireGeometry, wireMaterial)
	group.add(wire)

	const pointer = { x: 0, y: 0 }
	const target = { x: 0, y: 0 }
	let animationFrame = 0
	let lastFrame = 0
	let isVisible = true
	let isRunning = false
	const pointerTarget = canvas.parentElement ?? canvas
	let pointerBounds = pointerTarget.getBoundingClientRect()

	const resize = () => {
		const bounds = canvas.getBoundingClientRect()
		pointerBounds = pointerTarget.getBoundingClientRect()
		const width = Math.max(1, Math.round(bounds.width))
		const height = Math.max(1, Math.round(bounds.height))
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact ? 1.2 : 1.5))
		renderer.setSize(width, height, false)
		camera.aspect = width / height
		camera.updateProjectionMatrix()
	}
	const onCompactChange = (event: MediaQueryListEvent) => {
		isCompact = event.matches
		pointsMaterial.size = isCompact ? 0.035 : 0.042
		resize()
	}

	const render = (time: number) => {
		if (!isRunning) return
		animationFrame = requestAnimationFrame(render)
		if (!isVisible || document.visibilityState === "hidden" || time - lastFrame < 32) return

		lastFrame = time
		pointer.x += (target.x - pointer.x) * 0.045
		pointer.y += (target.y - pointer.y) * 0.045
		group.rotation.y += 0.0013
		group.rotation.x += (pointer.y * 0.22 - group.rotation.x) * 0.03
		group.rotation.z += (pointer.x * 0.12 - group.rotation.z) * 0.03
		wire.rotation.y -= 0.0018
		wire.rotation.x += 0.0009
		group.position.x += (pointer.x * 0.08 - group.position.x) * 0.035
		group.position.y += (-pointer.y * 0.08 - group.position.y) * 0.035
		renderer.render(scene, camera)
	}

	const start = () => {
		if (isRunning || !isVisible) return
		isRunning = true
		animationFrame = requestAnimationFrame(render)
	}
	const stop = () => {
		isRunning = false
		cancelAnimationFrame(animationFrame)
		animationFrame = 0
	}
	const setVisibility = (visible: boolean) => {
		isVisible = visible
		if (visible) start()
		else stop()
	}
	const onPointerMove = (event: PointerEvent) => {
		target.x = ((event.clientX - pointerBounds.left) / pointerBounds.width - 0.5) * 2
		target.y = ((event.clientY - pointerBounds.top) / pointerBounds.height - 0.5) * 2
	}
	const resetPointer = () => {
		target.x = 0
		target.y = 0
	}
	const onVisibilityChange = () => setVisibility(document.visibilityState !== "hidden")

	const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize)
	const visibilityObserver = typeof IntersectionObserver === "undefined"
		? null
		: new IntersectionObserver(
			([entry]) => setVisibility(Boolean(entry?.isIntersecting)),
			{ threshold: 0.05 },
		)

	resizeObserver?.observe(canvas)
	if (!resizeObserver) window.addEventListener("resize", resize)
	compactQuery.addEventListener("change", onCompactChange)
	visibilityObserver?.observe(root)
	pointerTarget.addEventListener("pointermove", onPointerMove)
	pointerTarget.addEventListener("pointerleave", resetPointer)
	document.addEventListener("visibilitychange", onVisibilityChange)
	resize()
	canvas.dataset.webglStatus = "ready"
	root.dataset.motionStatus = "active"
	start()

	return () => {
		stop()
		resizeObserver?.disconnect()
		if (!resizeObserver) window.removeEventListener("resize", resize)
		compactQuery.removeEventListener("change", onCompactChange)
		visibilityObserver?.disconnect()
		pointerTarget.removeEventListener("pointermove", onPointerMove)
		pointerTarget.removeEventListener("pointerleave", resetPointer)
		document.removeEventListener("visibilitychange", onVisibilityChange)
		group.traverse((object) => {
			const mesh = object as Mesh
			if (mesh.geometry) mesh.geometry.dispose()
			if (mesh.material) {
				const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
				materials.forEach((material) => material.dispose())
			}
		})
		renderer.dispose()
		renderer.forceContextLoss()
		canvas.dataset.webglStatus = "disposed"
	}
}

export function createSignalPositions(count: number): Float32Array {
	const positions = new Float32Array(count * 3)
	let seed = 731

	for (let index = 0; index < count; index += 1) {
		seed = (seed * 9301 + 49297) % 233280
		const randomA = seed / 233280
		seed = (seed * 9301 + 49297) % 233280
		const randomB = seed / 233280
		const angle = (index / count) * Math.PI * 2 + randomA * 0.35
		const radius = 0.72 + randomB * 0.48
		positions[index * 3] = Math.cos(angle) * radius
		positions[index * 3 + 1] = Math.sin(angle) * radius
		positions[index * 3 + 2] = (randomA - 0.5) * 0.7
	}

	return positions
}

export function createSignalLines(positions: Float32Array): Float32Array {
	const count = positions.length / 3
	const linePositions = new Float32Array((count - 1) * 6)

	for (let index = 0; index < count - 1; index += 1) {
		const source = index * 3
		const target = (index + 1) * 3
		const line = index * 6
		linePositions[line] = positions[source]
		linePositions[line + 1] = positions[source + 1]
		linePositions[line + 2] = positions[source + 2]
		linePositions[line + 3] = positions[target]
		linePositions[line + 4] = positions[target + 1]
		linePositions[line + 5] = positions[target + 2]
	}

	return linePositions
}
