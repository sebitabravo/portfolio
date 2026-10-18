import { AdditiveBlending, BoxGeometry, EdgesGeometry, Group, LineBasicMaterial, LineSegments } from "three"

type EdgeOptions = {
  color?: number
  opacity?: number
}

// La escena isométrica vive aparte para mantener hero-webgl.ts dentro del límite de 300 líneas.
export function createIsometricWorkstation(): Group {
  const workstation = new Group()
  workstation.position.set(0.75, -0.3, 0)
  workstation.scale.setScalar(0.55)
  workstation.rotation.set(0.35, Math.PI / 4, 0)

  const addBoxEdges = (
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    { color = 0xe7a23c, opacity = 0.3 }: EdgeOptions = {},
  ) => {
    const box = new BoxGeometry(width, height, depth)
    const geometry = new EdgesGeometry(box)
    // El sólido temporal no pertenece al árbol que libera los recursos al salir.
    box.dispose()
    const material = new LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    const edges = new LineSegments(geometry, material)
    edges.position.set(x, y, z)
    workstation.add(edges)
    return edges
  }

  for (let index = -3; index <= 3; index += 1) {
    addBoxEdges(3, 0.003, 0.003, 0, -0.95, index * 0.5, { color: 0xf2efe8, opacity: 0.1 })
    addBoxEdges(0.003, 0.003, 3, index * 0.5, -0.95, 0, { color: 0xf2efe8, opacity: 0.1 })
  }

  addBoxEdges(1.8, 0.08, 0.9, 0, -0.05, 0)
  for (const x of [-0.78, 0.78]) {
    for (const z of [-0.33, 0.33]) addBoxEdges(0.06, 0.85, 0.06, x, -0.52, z)
  }
  addBoxEdges(0.95, 0.58, 0.06, 0, 0.48, -0.2, { color: 0xf2efe8, opacity: 0.35 })
  addBoxEdges(0.07, 0.22, 0.07, 0, 0.1, -0.2)
  addBoxEdges(0.4, 0.035, 0.25, 0, 0.01, -0.2)
  addBoxEdges(0.55, 0.035, 0.2, 0, 0.01, 0.24, { color: 0xf2efe8, opacity: 0.2 })

  addBoxEdges(0.6, 0.08, 0.58, 0, -0.48, 0.95, { color: 0xf2efe8, opacity: 0.25 })
  addBoxEdges(0.6, 0.65, 0.06, 0, -0.12, 1.22)
  for (const x of [-0.24, 0.24]) {
    for (const z of [0.72, 1.18]) addBoxEdges(0.04, 0.42, 0.04, x, -0.73, z)
  }

  const cubes = [
    addBoxEdges(0.28, 0.28, 0.28, -1.1, 0.7, 0.2, { opacity: 0.22 }),
    addBoxEdges(0.2, 0.2, 0.2, 0.9, 0.95, -0.5, { color: 0xf2efe8, opacity: 0.2 }),
    addBoxEdges(0.16, 0.16, 0.16, 1.25, 0.25, 0.6, { opacity: 0.18 }),
  ]
  cubes.forEach((cube, index) => cube.rotation.set(0.2 + index * 0.15, 0.4, 0.15))

  return workstation
}
