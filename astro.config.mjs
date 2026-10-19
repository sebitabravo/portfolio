// @ts-check
import { defineConfig, fontProviders } from "astro/config"
import sitemap from "@astrojs/sitemap"
import mdx from "@astrojs/mdx"

import tailwindcss from "@tailwindcss/vite"

// https://astro.build/config
export default defineConfig({
  site: "https://sebita.dev",
  output: "static",
  integrations: [sitemap({ filter: (page) => !page.includes("/404") }), mdx()],
  devToolbar: {
    enabled: false,
  },
  fonts: [
    {
      name: "Instrument Serif",
      cssVariable: "--font-instrument",
      provider: fontProviders.fontsource(),
      weights: [400],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      name: "Geist",
      cssVariable: "--font-geist",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      provider: fontProviders.fontsource(),
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
    {
      name: "VT323",
      cssVariable: "--font-vt323",
      provider: fontProviders.fontsource(),
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
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
      target: "esnext",
    },
  },
})
