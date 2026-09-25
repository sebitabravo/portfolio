import { describe, expect, it } from "vitest";
import { createBlogAlternates, getBlogTranslationId } from "../src/lib/blog-alternates";

type BlogPost = Parameters<typeof getBlogTranslationId>[0];

function post(id: string, locale: string, translationKey: string): BlogPost {
  return { id, data: { locale, translationKey } } as BlogPost;
}

describe("getBlogTranslationId", () => {
  it("rejects two posts with the same translation key and locale", () => {
    const spanish = post("spanish", "es", "pair");
    const duplicate = post("duplicate", "es", "pair");

    expect(getBlogTranslationId(spanish, [spanish, duplicate])).toBeUndefined();
  });

  it("rejects unsupported locale values even when translation keys match", () => {
    const spanish = post("spanish", "es", "pair");
    const unsupported = post("unsupported", "fr", "pair");
    const otherUnsupported = post("other-unsupported", "de", "other-pair");
    const english = post("english", "en", "other-pair");

    expect(getBlogTranslationId(spanish, [spanish, unsupported])).toBeUndefined();
    expect(getBlogTranslationId(unsupported, [spanish, unsupported])).toBeUndefined();
    expect(getBlogTranslationId(otherUnsupported, [otherUnsupported, english])).toBeUndefined();
  });

  it("does not advertise opposite-locale posts with different translation keys", () => {
    const spanish = post("spanish", "es", "spanish-key");
    const english = post("english", "en", "english-key");
    const posts = [spanish, english];

    const spanishTranslationId = getBlogTranslationId(spanish, posts);
    const englishTranslationId = getBlogTranslationId(english, posts);

    expect(spanishTranslationId).toBeUndefined();
    expect(englishTranslationId).toBeUndefined();
    expect(createBlogAlternates({ locale: "es", postId: spanish.id, translationId: spanishTranslationId })).toEqual([
      { hreflang: "es", href: "https://sebita.dev/blog/spanish" },
      { hreflang: "x-default", href: "https://sebita.dev/blog/spanish" },
    ]);
    expect(createBlogAlternates({ locale: "en", postId: english.id, translationId: englishTranslationId })).toEqual([
      { hreflang: "en", href: "https://sebita.dev/en/blog/english" },
      { hreflang: "x-default", href: "https://sebita.dev/en/blog/english" },
    ]);
  });

  it("returns only the explicitly keyed opposite-locale post", () => {
    const spanish = post("spanish", "es", "pair");
    const english = post("english", "en", "pair");

    expect(getBlogTranslationId(spanish, [spanish, english])).toBe("english");
    expect(getBlogTranslationId(english, [spanish, english])).toBe("spanish");
  });
});

describe("createBlogAlternates", () => {
  it("lists the Spanish post, its translated English ID, and Spanish as default", () => {
    expect(
      createBlogAlternates({
        locale: "es",
        postId: "manttoai-ml-iot-random-forest",
        translationId: "manttoai-ml-iot-random-forest-en",
      }),
    ).toEqual([
      { hreflang: "es", href: "https://sebita.dev/blog/manttoai-ml-iot-random-forest" },
      { hreflang: "en", href: "https://sebita.dev/en/blog/manttoai-ml-iot-random-forest-en" },
      { hreflang: "x-default", href: "https://sebita.dev/blog/manttoai-ml-iot-random-forest" },
    ]);
  });

  it("lists the English post, its differently named Spanish translation, and Spanish as default", () => {
    expect(
      createBlogAlternates({
        locale: "en",
        postId: "vulcania-monitoreo-volcanico-comunitario-en",
        translationId: "vulcania-monitoreo-volcanico-comunitario",
      }),
    ).toEqual([
      { hreflang: "en", href: "https://sebita.dev/en/blog/vulcania-monitoreo-volcanico-comunitario-en" },
      { hreflang: "es", href: "https://sebita.dev/blog/vulcania-monitoreo-volcanico-comunitario" },
      { hreflang: "x-default", href: "https://sebita.dev/blog/vulcania-monitoreo-volcanico-comunitario" },
    ]);
  });

  it("advertises only the Spanish route for a Spanish-only post", () => {
    expect(
      createBlogAlternates({ locale: "es", postId: "bot-discord-moderacion-musica" }),
    ).toEqual([
      { hreflang: "es", href: "https://sebita.dev/blog/bot-discord-moderacion-musica" },
      { hreflang: "x-default", href: "https://sebita.dev/blog/bot-discord-moderacion-musica" },
    ]);
  });

  it("advertises only the English route for an English-only post", () => {
    expect(
      createBlogAlternates({ locale: "en", postId: "english-only-post" }),
    ).toEqual([
      { hreflang: "en", href: "https://sebita.dev/en/blog/english-only-post" },
      { hreflang: "x-default", href: "https://sebita.dev/en/blog/english-only-post" },
    ]);
  });

  it("advertises Spanish content rather than an English translation on a fallback route", () => {
    expect(
      createBlogAlternates({
        locale: "en",
        postId: "bot-discord-moderacion-musica",
        isFallback: true,
      }),
    ).toEqual([
      { hreflang: "es", href: "https://sebita.dev/blog/bot-discord-moderacion-musica" },
      { hreflang: "x-default", href: "https://sebita.dev/blog/bot-discord-moderacion-musica" },
    ]);
  });
});
