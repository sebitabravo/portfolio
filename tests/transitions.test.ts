import { describe, expect, it } from "vitest"

import { articleTitleTransitionName } from "../src/scripts/transitions"

describe("article title transition names", () => {
  it("keeps an already valid post id stable", () => {
    expect(articleTitleTransitionName("vulcania-monitoreo-volcanico-comunitario")).toBe(
      "vt-article-title-vulcania-monitoreo-volcanico-comunitario",
    )
  })

  it("normalizes casing and separators that are invalid in a custom ident", () => {
    expect(articleTitleTransitionName("CRM Backend/v2")).toBe("vt-article-title-crm-backend-v2")
    expect(articleTitleTransitionName("  --My Post--  ")).toBe("vt-article-title-my-post")
  })

  it("keeps distinct content ids distinct", () => {
    const names = [
      "crm-backend",
      "crm-native",
      "manttoai-ml-iot-random-forest",
      "manttoai-ml-iot-random-forest-en",
    ].map(articleTitleTransitionName)

    expect(new Set(names).size).toBe(names.length)
  })

  it("falls back to a non-empty token for ids made only of separators", () => {
    expect(articleTitleTransitionName("///")).toBe("vt-article-title-article")
    expect(articleTitleTransitionName("")).toBe("vt-article-title-article")
  })
})
