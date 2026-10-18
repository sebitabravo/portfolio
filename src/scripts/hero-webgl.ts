import {
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three"
import WebGL from "three/addons/capabilities/WebGL.js"
import { BASE_FOV, approach, computeHeroCamera, heroScrollProgress, storyProgress } from "./hero-camera"
import { CRT_FRAGMENT, CRT_VERTEX, SKY_FRAGMENT, SKY_VERTEX, TERRAIN_FRAGMENT, TERRAIN_VERTEX } from "./hero-shaders"

type MotionRoot = HTMLElement & {
  dataset: DOMStringMap & {
    motionStatus?: string
  }
}

type Cleanup = () => void

const FRAME_INTERVAL = 32
// Distancia que recorre el terreno a lo largo de la historia: el scroll avanza y retrocede el vuelo.
const STORY_TRAVEL = 46

function createFullscreenTriangle(): BufferGeometry {
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3))
  geometry.setAttribute("uv", new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2))
  return geometry
}

export function createHeroScene(canvas: HTMLCanvasElement, root: MotionRoot): Cleanup | null {
  if (!WebGL.isWebGL2Available()) {
    canvas.dataset.webglStatus = "fallback"
    return null
  }

  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: "low-power" })
  } catch {
    canvas.dataset.webglStatus = "fallback"
    return null
  }
  renderer.setClearColor(0x07060d, 1)

  const compactQuery = window.matchMedia("(max-width: 1023px)")
  const compact = compactQuery.matches
  const scene = new Scene()
  const camera = new PerspectiveCamera(BASE_FOV, 1, 0.1, 140)

  const skyMaterial = new ShaderMaterial({
    vertexShader: SKY_VERTEX,
    fragmentShader: SKY_FRAGMENT,
    uniforms: { uSunDirection: { value: new Vector3(0, 0.2, -1) }, uTime: { value: 0 } },
    side: BackSide,
    depthWrite: false,
  })
  const sky = new Mesh(new SphereGeometry(100, 32, 16), skyMaterial)
  sky.renderOrder = -1
  scene.add(sky)

  const terrainGeometry = new PlaneGeometry(46, 66, compact ? 110 : 184, compact ? 160 : 264)
  terrainGeometry.rotateX(-Math.PI / 2)
  terrainGeometry.translate(0, 0, -27)
  const terrainMaterial = new ShaderMaterial({
    vertexShader: TERRAIN_VERTEX,
    fragmentShader: TERRAIN_FRAGMENT,
    uniforms: {
      uOffset: { value: 0 },
      uPulse: { value: 0 },
      uFogColor: { value: new Color(0.62, 0.2, 0.5) },
      uFogNear: { value: 12 },
      uFogFar: { value: 58 },
    },
  })
  scene.add(new Mesh(terrainGeometry, terrainMaterial))

  const target = new WebGLRenderTarget(1, 1, { minFilter: LinearFilter, magFilter: LinearFilter })
  const postScene = new Scene()
  const postCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const postMaterial = new ShaderMaterial({
    vertexShader: CRT_VERTEX,
    fragmentShader: CRT_FRAGMENT,
    uniforms: {
      tScene: { value: target.texture },
      uResolution: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uAberration: { value: 0.0024 },
    },
    depthTest: false,
    depthWrite: false,
  })
  const postGeometry = createFullscreenTriangle()
  postScene.add(new Mesh(postGeometry, postMaterial))

  const screen = canvas.closest<HTMLElement>("[data-os-screen]") ?? canvas.parentElement ?? canvas
  const pointer = { x: 0, y: 0 }
  const pointerTarget = { x: 0, y: 0 }
  const state = { scroll: 0, scrollTarget: 0, turbo: 0, turboTarget: 0, offset: 0, x: 0, y: 2.15, lookY: 1.05, roll: 0 }
  const size = new Vector2()
  let bounds = root.getBoundingClientRect()
  const track = root.querySelector<HTMLElement>("[data-hero-story]")
  let headerHeight = 0
  let animationFrame = 0
  let lastFrame = 0
  let disposed = false
  let isVisible = true
  let isRunning = false
  let painted = false

  const resize = () => {
    if (disposed) return
    const rect = canvas.getBoundingClientRect()
    bounds = root.getBoundingClientRect()
    headerHeight = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.5))
    renderer.setSize(width, height, false)
    renderer.getDrawingBufferSize(size)
    target.setSize(size.x, size.y)
    postMaterial.uniforms.uResolution.value.copy(size)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const render = (time: number) => {
    if (disposed || !isRunning) return
    animationFrame = requestAnimationFrame(render)
    if (!isVisible || document.visibilityState === "hidden" || time - lastFrame < FRAME_INTERVAL) return

    const delta = lastFrame === 0 ? FRAME_INTERVAL / 1000 : Math.min(0.1, (time - lastFrame) / 1000)
    lastFrame = time
    pointer.x = approach(pointer.x, pointerTarget.x, 0.05)
    pointer.y = approach(pointer.y, pointerTarget.y, 0.05)
    state.scroll = approach(state.scroll, state.scrollTarget, 0.08)
    state.turbo = approach(state.turbo, state.turboTarget, 0.06)
    const next = computeHeroCamera(pointer, state.scroll, state.turbo)

    state.offset += delta * next.speed
    state.x = approach(state.x, next.x, 0.06)
    state.y = approach(state.y, next.y, 0.06)
    state.lookY = approach(state.lookY, next.lookY, 0.06)
    state.roll = approach(state.roll, next.roll, 0.06)
    camera.position.set(state.x, state.y, 6)
    camera.lookAt(state.x * 0.35, state.lookY, -24)
    camera.rotation.z += state.roll
    if (Math.abs(camera.fov - next.fov) > 0.01) {
      camera.fov = approach(camera.fov, next.fov, 0.08)
      camera.updateProjectionMatrix()
    }
    sky.position.copy(camera.position)

    terrainMaterial.uniforms.uOffset.value = state.offset + state.scroll * STORY_TRAVEL
    terrainMaterial.uniforms.uPulse.value = state.turbo
    skyMaterial.uniforms.uTime.value = time / 1000
    postMaterial.uniforms.uTime.value = time / 1000
    postMaterial.uniforms.uAberration.value = 0.0024 + state.turbo * 0.006

    renderer.setRenderTarget(target)
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    renderer.render(postScene, postCamera)

    if (!painted) {
      painted = true
      canvas.dataset.webglStatus = "ready"
    }
  }

  const start = () => {
    if (disposed || isRunning || !isVisible) return
    isRunning = true
    animationFrame = requestAnimationFrame(render)
  }
  const stop = () => {
    isRunning = false
    cancelAnimationFrame(animationFrame)
    animationFrame = 0
  }
  const setVisibility = (visible: boolean) => {
    if (disposed) return
    isVisible = visible
    if (visible) start()
    else stop()
  }

  const onPointerMove = (event: PointerEvent) => {
    pointerTarget.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2))
    pointerTarget.y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2))
  }
  const resetPointer = () => {
    pointerTarget.x = 0
    pointerTarget.y = 0
    state.turboTarget = 0
  }
  // Mantener presionado el paisaje acelera el vuelo; ventanas y accesos quedan fuera.
  const onPointerDown = (event: PointerEvent) => {
    const origin = event.target instanceof Element ? event.target : null
    if (origin?.closest("[data-os-window], .os-shortcut, a, button")) return
    state.turboTarget = 1
  }
  const releaseTurbo = () => {
    state.turboTarget = 0
  }
  const onVisibilityChange = () => setVisibility(document.visibilityState !== "hidden")
  const onScroll = () => {
    // La caja de la pista se lee en coordenadas de viewport: sigue correcta aunque cambie el alto del hero.
    const trackRect = track?.getBoundingClientRect()
    const story = trackRect ? storyProgress(0, trackRect, window.innerHeight, headerHeight) : null
    state.scrollTarget = story ?? heroScrollProgress(window.scrollY || 0, root.offsetHeight)
    bounds = root.getBoundingClientRect()
  }
  const onContextLost = (event: Event) => {
    event.preventDefault()
    stop()
    canvas.dataset.webglStatus = "fallback"
  }

  const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize)
  const visibilityObserver =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(([entry]) => setVisibility(Boolean(entry?.isIntersecting)), { threshold: 0.02 })

  resizeObserver?.observe(canvas)
  if (!resizeObserver) window.addEventListener("resize", resize)
  visibilityObserver?.observe(root)
  root.addEventListener("pointermove", onPointerMove)
  root.addEventListener("pointerleave", resetPointer)
  screen.addEventListener("pointerdown", onPointerDown)
  window.addEventListener("pointerup", releaseTurbo)
  window.addEventListener("pointercancel", releaseTurbo)
  document.addEventListener("visibilitychange", onVisibilityChange)
  window.addEventListener("scroll", onScroll, { passive: true })
  canvas.addEventListener("webglcontextlost", onContextLost)
  resize()
  onScroll()
  root.dataset.motionStatus = "active"
  start()

  return () => {
    disposed = true
    stop()
    resizeObserver?.disconnect()
    if (!resizeObserver) window.removeEventListener("resize", resize)
    visibilityObserver?.disconnect()
    root.removeEventListener("pointermove", onPointerMove)
    root.removeEventListener("pointerleave", resetPointer)
    screen.removeEventListener("pointerdown", onPointerDown)
    window.removeEventListener("pointerup", releaseTurbo)
    window.removeEventListener("pointercancel", releaseTurbo)
    document.removeEventListener("visibilitychange", onVisibilityChange)
    window.removeEventListener("scroll", onScroll)
    canvas.removeEventListener("webglcontextlost", onContextLost)
    for (const disposable of [
      terrainGeometry,
      terrainMaterial,
      sky.geometry,
      skyMaterial,
      postGeometry,
      postMaterial,
      target,
    ]) {
      disposable.dispose()
    }
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.dataset.webglStatus = "disposed"
  }
}
