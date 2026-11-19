/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config"

export default getViteConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // src/scripts son módulos de navegador (DOM, Web Audio, canvas, View
      // Transitions): vitest corre en node, así que medirlos acá cuenta líneas
      // que ningún unitario puede ejecutar y hunde el total. Su cobertura real
      // es la suite e2e, que los ejercita en Chromium.
      include: ["src/lib/**/*.ts"],
      thresholds: {
        statements: 90,
        branches: 70,
        functions: 90,
        lines: 90,
      },
    },
  },
})
