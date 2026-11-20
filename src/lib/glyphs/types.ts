/** Un glifo ya listo para pintar: trazo (Tabler) o relleno (Simple Icons), ambos en viewBox 24. */
export interface IconDef {
  style: "stroke" | "fill"
  paths: readonly string[]
}
