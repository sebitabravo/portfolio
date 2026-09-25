import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
const dictionaries = await Promise.all(["es", "en"].map(async (locale) =>
  JSON.parse(await readFile(new URL(`../src/lib/i18n/${locale}.json`, import.meta.url), "utf8"))
));
const [es, en] = dictionaries;

test.use({ contextOptions: { reducedMotion: "reduce" } });

const routes = [
  {
    name: "Spanish list",
    path: "/blog",
    heading: "Blog",
    dateSelector: "main#main-content article time",
    dateCount: "at-least-one",
  },
  {
    name: "English list",
    path: "/en/blog",
    heading: "Blog",
    dateSelector: "main#main-content article time",
    dateCount: "at-least-one",
  },
  {
    name: "Spanish article",
    path: "/blog/manttoai-ml-iot-random-forest",
    heading: /^Lo que aprendí construyendo/,
    dateSelector: "main#main-content article > header time",
    dateCount: "exactly-one",
  },
  {
    name: "English article",
    path: "/en/blog/manttoai-ml-iot-random-forest-en",
    heading: /^ManttoAI: building/,
    dateSelector: "main#main-content article > header time",
    dateCount: "exactly-one",
  },
] as const;

const themes = ["light", "dark"] as const;
const blogSurfaceSelector = "main#main-content";
const blogOrigin = "https://sebita.dev";

async function expectBlogAlternates(page: Page, expected: Array<{ hreflang: string; href: string }>) {
  const alternates = page.locator('head link[rel="alternate"][hreflang]');
  expect(await alternates.evaluateAll((links) => links.map((link) => ({
    hreflang: link.getAttribute("hreflang"),
    href: link.getAttribute("href"),
  })))).toEqual(expected);
}

test.describe("Blog accessibility", () => {
  for (const [locale, t, indexPath, articlePath, homePath] of [
    ["es", es, "/blog", "/blog/manttoai-ml-iot-random-forest", "/"],
    ["en", en, "/en/blog", "/en/blog/manttoai-ml-iot-random-forest-en", "/en"],
  ] as const) {
    test(`${locale} blog uses locale dictionary on index and article navigation`, async ({ page }) => {
      await page.goto(indexPath);
      await expect(page.locator("main#main-content h1")).toHaveText(t.blog.title);
      await expect(page.locator('head meta[name="description"]')).toHaveAttribute("content", t.blog.description);
      await expect(page.locator("main#main-content > p")).toHaveText(t.blog.intro);
      const breadcrumb = page.getByRole("navigation", { name: t.nav.breadcrumb });
      await expect(breadcrumb.getByRole("link", { name: t.nav.home })).toHaveAttribute("href", homePath);
      await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(t.blog.title);

      await page.goto(articlePath);
      const articleBreadcrumb = page.getByRole("navigation", { name: t.nav.breadcrumb });
      await expect(articleBreadcrumb.getByRole("link", { name: t.nav.home })).toHaveAttribute("href", homePath);
      await expect(articleBreadcrumb.getByRole("link", { name: t.blog.title })).toHaveAttribute("href", indexPath);
      const postNavigation = page.getByRole("navigation", { name: t.blog.postNavigation });
      await expect(postNavigation.getByRole("link", { name: `← ${t.blog.back}` })).toHaveAttribute("href", indexPath);
      await expect(postNavigation.getByRole("link", { name: `${t.nav.home} →` })).toHaveAttribute("href", homePath);
    });
  }

  test("both locale variants delegate blog index and post composition to shared templates", async () => {
    for (const [path, template, locale] of [
      ["blog/index.astro", "LocalizedBlogIndex", "es"],
      ["en/blog/index.astro", "LocalizedBlogIndex", "en"],
      ["blog/[slug].astro", "LocalizedBlogPost", "es"],
      ["en/blog/[slug].astro", "LocalizedBlogPost", "en"],
    ] as const) {
      const route = await readFile(new URL(`../src/pages/${path}`, import.meta.url), "utf8");
      expect(route).toMatch(new RegExp(`import ${template} from ["']@/components/blog/${template}\\.astro["']`));
      expect(route).toMatch(new RegExp(`<${template}\\s+locale=["']${locale}["']`));
    }
  });

  for (const [name, spanishId, englishId] of [
    ["ManttoAI", "manttoai-ml-iot-random-forest", "manttoai-ml-iot-random-forest-en"],
    ["Vulcania", "vulcania-monitoreo-volcanico-comunitario", "vulcania-monitoreo-volcanico-comunitario-en"],
  ] as const) {
    test(`${name} article routes advertise only their actual translated IDs`, async ({ page }) => {
      const spanishUrl = `${blogOrigin}/blog/${spanishId}`;
      const englishUrl = `${blogOrigin}/en/blog/${englishId}`;

      await page.goto(`/blog/${spanishId}`);
      await expectBlogAlternates(page, [
        { hreflang: "es", href: spanishUrl },
        { hreflang: "en", href: englishUrl },
        { hreflang: "x-default", href: spanishUrl },
      ]);
      await expect(page.locator(`head link[rel="alternate"][href="${blogOrigin}/en/blog/${spanishId}"]`)).toHaveCount(0);

      await page.goto(`/en/blog/${englishId}`);
      await expectBlogAlternates(page, [
        { hreflang: "en", href: englishUrl },
        { hreflang: "es", href: spanishUrl },
        { hreflang: "x-default", href: spanishUrl },
      ]);
      await expect(page.locator(`head link[rel="alternate"][href="${blogOrigin}/blog/${englishId}"]`)).toHaveCount(0);
    });
  }

  test("English fallback article advertises Spanish content without an English alternate", async ({ page }) => {
    const postId = "bot-discord-moderacion-musica";
    const spanishUrl = `${blogOrigin}/blog/${postId}`;
    await page.goto(`/en/blog/${postId}`);
    await expect(page.locator("main#main-content article")).toHaveAttribute("lang", "es");
    await expectBlogAlternates(page, [
      { hreflang: "es", href: spanishUrl },
      { hreflang: "x-default", href: spanishUrl },
    ]);
    await expect(page.locator('head link[rel="alternate"][hreflang="en"]')).toHaveCount(0);
    await expect(page.locator(`head link[rel="alternate"][href="${blogOrigin}/en/blog/${postId}"]`)).toHaveCount(0);
  });

  test("English index identifies fallback and native card content languages", async ({ page }) => {
    await page.goto("/en/blog");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/en");

    const fallback = page.locator('main#main-content article:has(> a[href="/en/blog/bot-discord-moderacion-musica"])');
    const english = page.locator('main#main-content article:has(> a[href="/en/blog/manttoai-ml-iot-random-forest-en"])');
    await expect(fallback).toHaveCount(1);
    await expect(english).toHaveCount(1);
    await expect(fallback.locator("h2")).toHaveText(/^Un bot de Discord/);
    await expect(english.locator("h2")).toHaveText(/^ManttoAI: building/);
    await expect(fallback.locator("a > p").last()).toContainText("Bot de Discord profesional");
    await expect(english.locator("a > p").last()).toContainText("FastAPI, React 18");

    for (const [card, language] of [[fallback, "es"], [english, "en"]] as const) {
      for (const content of [card.locator("h2"), card.locator("a > p").last()]) {
        expect(await content.evaluate((element) => element.closest("[lang]")?.getAttribute("lang"))).toBe(language);
      }
    }

    const fallbackLabel = fallback.getByText("Available in Spanish", { exact: true });
    await expect(fallbackLabel).toBeVisible();
    expect(await fallbackLabel.evaluate((element) => element.closest("[lang]")?.getAttribute("lang"))).toBe("en");
    await expect(english.getByText("Available in Spanish", { exact: true })).toHaveCount(0);
    await expect(fallback.locator("time")).toContainText("November");
    await expect(english.locator("time")).toContainText("May");
    for (const card of [fallback, english]) {
      expect(await card.locator("time").evaluate((element) => element.closest("[lang]")?.getAttribute("lang"))).toBe("en");
    }
  });

  test("English article routes keep content language distinct from UI copy and dates", async ({ page }) => {
    for (const [path, language] of [
      ["/en/blog/bot-discord-moderacion-musica", "es"],
      ["/en/blog/manttoai-ml-iot-random-forest-en", "en"],
    ] as const) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator("main#main-content article")).toHaveAttribute("lang", language);
      const date = page.locator("main#main-content article > header time");
      await expect(date).toHaveAttribute("lang", "en");
      if (language === "es") {
        await expect(page.locator("main#main-content article aside")).toHaveAttribute("lang", "en");
        await expect(date).toContainText("November");
      }
    }
  });

  for (const theme of themes) {
    for (const route of routes) {
      test(`${route.name} has no full-main Axe violations in ${theme} theme`, async ({
        page,
      }) => {
        await page.addInitScript((selectedTheme) => {
          localStorage.setItem("theme", selectedTheme);
        }, theme);
        await page.goto(route.path);
        await page.waitForLoadState("networkidle");
        await page.evaluate(async () => {
          await document.fonts.ready;
        });

        const html = page.locator("html");
        if (theme === "dark") {
          await expect(html).toHaveClass(/\bdark\b/);
        } else {
          await expect(html).not.toHaveClass(/\bdark\b/);
        }

        await expect(page.locator("main#main-content h1")).toHaveText(
          route.heading,
        );
        const dates = page.locator(route.dateSelector);
        if (route.dateCount === "exactly-one") {
          await expect(dates).toHaveCount(1);
        } else {
          expect(await dates.count()).toBeGreaterThan(0);
        }

        const results = await new AxeBuilder({ page })
          .include(blogSurfaceSelector)
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
