import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layout = readFileSync("src/layouts/Layout.astro", "utf8");
const spanishArticle = readFileSync("src/pages/blog/[slug].astro", "utf8");
const englishArticle = readFileSync("src/pages/en/blog/[slug].astro", "utf8");

describe("JSON-LD contracts", () => {
  it("emits one WebPage node for indexable pages from canonical page metadata", () => {
    expect(layout).toContain("const canonical = canonicalUrl ?? profileUrl");
    expect(layout).toMatch(
      /\.\.\.\(!noindex \? \[\{[\s\S]*?"@type": "WebPage"/,
    );
    expect(layout).toContain("name: title");
    expect(layout).toContain("description: description");
    expect(layout).toContain("url: canonical");
    expect(layout).toContain("inLanguage: locale");
    expect(layout.match(/"@type": "WebPage"/g)).toHaveLength(1);
  });

  it("does not emit a WebPage node for noindex pages", () => {
    expect(layout).toContain("!noindex ?");
  });

  it.each([
    ["Spanish", spanishArticle],
    ["English", englishArticle],
  ])(
    "preserves the %s Article schema without a duplicate WebPage schema",
    (_locale, article) => {
      expect(article.match(/"@type": "Article"/g)).toHaveLength(1);
      expect(article).not.toContain('"@type": "WebPage"');
      expect(article).not.toContain("dateModified");
    },
  );

  it("preserves the existing Person and WebSite schemas", () => {
    expect(layout.match(/"@type": "Person"/g)).toHaveLength(1);
    expect(layout.match(/"@type": "WebSite"/g)).toHaveLength(1);
  });
});
