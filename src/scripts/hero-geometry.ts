import { BufferGeometry, Float32BufferAttribute, PlaneGeometry } from "three"

// Un solo triángulo cubre la pantalla completa: la pasada CRT no necesita un quad de dos triángulos.
export function createFullscreenTriangle(): BufferGeometry {
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3))
  geometry.setAttribute("uv", new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2))
  return geometry
}

// En pantallas compactas el terreno usa menos vértices por cuadro.
export function createTerrainGeometry(compact: boolean): PlaneGeometry {
  const geometry = new PlaneGeometry(46, 66, compact ? 110 : 184, compact ? 160 : 264)
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, 0, -27)
  return geometry
}
