import { expect, test } from "@playwright/test";

const expectedEmail = "sebitabravocontacto@gmail.com";
const expectedHref = `mailto:${expectedEmail}`;

for (const { locale, route, heading } of [
  { locale: "Spanish", route: "/privacy", heading: "Política de Privacidad" },
  { locale: "English", route: "/en/privacy", heading: "Privacy Policy" },
]) {
  test(`${locale} privacy renders eight sections with no active analytics copy`, async ({
    page,
  }) => {
    await page.goto(route);

    await expect(page.locator("main h1")).toHaveText(heading);
    await expect(page.locator("main section")).toHaveCount(8);
    await expect(page.locator("main")).not.toContainText("Vercel");
  });
  test(`${locale} privacy email links use the configured recipient`, async ({
    page,
  }) => {
    await page.goto(route);

    const links = page.getByRole("main").getByRole("link", {
      name: expectedEmail,
      exact: true,
    });

    await expect(links).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expect(links.nth(index)).toHaveAttribute("href", expectedHref);
    }

    await expect(
      page.locator('main a[href*="{personalInfo.email}"]'),
    ).toHaveCount(0);
  });
}
