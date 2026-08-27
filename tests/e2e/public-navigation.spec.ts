import { expect, test } from "@playwright/test";

test.describe("public discovery and navigation", () => {
  test("global search routes a desktop visitor into directory discovery", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Desktop-only search field");

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.goto("/");
    await page.locator('header[data-hydrated="true"]').waitFor();
    const search = page.getByRole("searchbox", {
      name: "Search practices, sessions, and retreats",
    });
    await expect(search).toBeVisible();
    await search.fill("Yoga Flow");
    await search.press("Enter");

    await expect(page).toHaveURL(/\/discover\?q=Yoga%20Flow$/);
  });

  test("compact navigation exposes discovery and provider entry points", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Compact navigation coverage");

    await page.goto("/");
    await page.locator('header[data-hydrated="true"]').waitFor();
    await page.getByRole("button", { name: "Open menu" }).click();

    const mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Discover" })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "List Your Practice" })).toBeVisible();

    await mobileNav.getByRole("link", { name: "Discover" }).click();
    await expect(page).toHaveURL(/\/discover$/);
  });
});
