import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

const routes = [
  { path: "/privacy", locale: "es", heading: "Política de Privacidad", notFound: false },
  { path: "/en/privacy", locale: "en", heading: "Privacy Policy", notFound: false },
  { path: "/404", locale: "es", heading: "Esta página se perdió en el deploy", notFound: true },
  { path: "/en/404", locale: "en", heading: "This page got lost in deployment", notFound: true },
] as const;

for (const theme of ["light", "dark"] as const) {
  for (const route of routes) {
    test(`${route.path} has localized main content and no Axe violations in ${theme} theme`, async ({ page }) => {
      await page.addInitScript((selectedTheme) => {
        localStorage.setItem("theme", selectedTheme);
      }, theme);
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      const html = page.locator("html");
      await expect(html).toHaveAttribute("lang", route.locale);
      if (theme === "dark") {
        await expect(html).toHaveClass(/\bdark\b/);
      } else {
        await expect(html).not.toHaveClass(/\bdark\b/);
      }

      const main = page.getByRole("main");
      await expect(main).toHaveCount(1);
      await expect(main).toHaveAttribute("id", "main-content");
      await expect(main.getByRole("heading", { level: 1 })).toHaveText(route.heading);
      if (route.notFound) {
        await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /\bnoindex\b/i);
        await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", `https://sebita.dev${route.path}`);

        const jsonLd = page.locator('head script[type="application/ld+json"]');
        await expect(jsonLd).toHaveCount(1);
        const graph = (JSON.parse((await jsonLd.textContent()) ?? "") as { "@graph": { "@type": string }[] })["@graph"];
        const nodeTypes = graph.map((node) => node["@type"]);
        expect(nodeTypes).toEqual(expect.arrayContaining(["Person", "WebSite"]));
        expect(nodeTypes).not.toContain("WebPage");
      }

      const results = await new AxeBuilder({ page })
        .include("main#main-content")
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
