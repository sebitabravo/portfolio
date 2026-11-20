import { describe, expect, it } from "vitest"

import { hubContent } from "@/lib/data/links"

// El hub de /links es la única página cuyas URLs las pega un humano en una
// descripción de YouTube, donde solo se auto-enlazan direcciones completas. Si
// un href se relativiza o un bloque queda sin URL entera, el enlace deja de
// funcionar fuera del sitio y nadie se entera.

const locales = ["es", "en"] as const

describe("hub content", () => {
  it.each(locales)("declares the required copy for %s", (locale) => {
    const content = hubContent[locale]

    for (const value of [
      content.metaTitle,
      content.metaDescription,
      content.role,
      content.lead,
      content.emailTitle,
      content.emailAria,
      content.youtubeHeading,
      content.youtubeNote,
      content.previewHeading,
      content.previewAlt,
    ]) {
      expect(value.trim()).not.toBe("")
    }

    expect(content.links.length).toBeGreaterThan(0)
    expect(content.blocks.length).toBeGreaterThan(0)
  })

  it.each(locales)("points every %s hub link at an absolute destination", (locale) => {
    for (const link of hubContent[locale].links) {
      expect(link.title.trim()).not.toBe("")
      expect(link.display.trim()).not.toBe("")
      // Rutas internas del sitio o destinos absolutos; nunca rutas relativas sueltas.
      expect(link.href, `${link.title} en ${locale}`).toMatch(/^(https:\/\/|mailto:|\/)/)
    }
  })

  it.each(locales)("keeps %s copy blocks identifiable and paste-ready", (locale) => {
    const { blocks } = hubContent[locale]
    const ids = blocks.map((block) => block.id)

    expect(new Set(ids).size).toBe(ids.length)

    for (const block of blocks) {
      expect(block.id.trim()).not.toBe("")
      expect(block.label.trim()).not.toBe("")
      expect(block.button.trim()).not.toBe("")
      expect(block.content.trim()).not.toBe("")
      // YouTube solo auto-enlaza la URL completa dentro del texto pegado.
      expect(block.content).toMatch(/https:\/\//)
    }
  })
})
