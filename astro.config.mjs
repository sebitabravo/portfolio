// @ts-check
import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"
import mdx from "@astrojs/mdx"

// https://astro.build/config
export default defineConfig({
  site: "https://sebita.dev",
  output: "static",
  integrations: [sitemap({ filter: (page) => !page.includes("/404") }), mdx()],
  devToolbar: {
    enabled: false,
  },
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    build: {
      cssCodeSplit: true,
      minify: "oxc",
      // The lazy WebGL enhancement is 523 KiB raw / about 129 KiB gzip.
      // Keep Vite's advisory aligned with that intentional optional chunk;
      // verify:bundle enforces both raw and compressed budgets separately.
      chunkSizeWarningLimit: 600,
      // S4: el presupuesto de compatibilidad es el mismo de los scripts: sin
      // downleveling a `esnext`, motores de la clase Chrome 87/Safari 13.1
      // ejecutan el bundle tal cual.
      target: ["chrome87", "edge88", "firefox78", "safari13.1"],
    },
  },
})
