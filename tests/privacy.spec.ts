import { expect, test } from "@playwright/test";

const expectedEmail = "sebitabravocontacto@gmail.com";
const expectedHref = `mailto:${expectedEmail}`;

for (const { locale, route } of [
  { locale: "Spanish", route: "/privacy" },
  { locale: "English", route: "/en/privacy" },
]) {
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
