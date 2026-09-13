import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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
const affectedSurfaceSelector =
  'main#main-content nav[aria-label="Breadcrumb"], main#main-content article time';

test.describe("Blog accessibility", () => {
  for (const theme of themes) {
    for (const route of routes) {
      test(`${route.name} has no affected-surface Axe violations in ${theme} theme`, async ({
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
          .include(affectedSurfaceSelector)
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
