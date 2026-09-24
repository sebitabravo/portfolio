import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layout = readFileSync("src/layouts/Layout.astro", "utf8");
const spanishArticle = readFileSync("src/pages/blog/[slug].astro", "utf8");
const englishArticle = readFileSync("src/pages/en/blog/[slug].astro", "utf8");
const articleTemplate = readFileSync("src/components/blog/LocalizedBlogPost.astro", "utf8");

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

  it.each([
    ["Spanish", spanishArticle, 'locale="es" post={post} translationId={translationId}'],
    ["English", englishArticle, 'locale="en" post={post} isFallback={isFallback} translationId={translationId}'],
  ])(
    "preserves the %s Article schema without a duplicate WebPage schema",
    (_locale, route, props) => {
      expect(route).toContain(`<LocalizedBlogPost ${props} />`);
      expect(articleTemplate.match(/"@type": "Article"/g)).toHaveLength(1);
      expect(articleTemplate).toContain('type="application/ld+json" set:html={articleJsonLd}');
      expect(articleTemplate).not.toContain('"@type": "WebPage"');
      expect(articleTemplate).not.toContain("dateModified");
    },
  );

  it("preserves the existing Person and WebSite schemas", () => {
    expect(layout.match(/"@type": "Person"/g)).toHaveLength(1);
    expect(layout.match(/"@type": "WebSite"/g)).toHaveLength(1);
  });
});
