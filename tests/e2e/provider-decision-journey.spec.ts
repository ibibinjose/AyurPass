import { expect, test } from "@playwright/test";

test.describe("Provider decision journey", () => {
  test("a bookable practice guides a visitor to choose a concrete session", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chromium",
      "Desktop-only profile journey verification",
    );

    // `npm run dev:local` seeds this deterministic, internally bookable practice.
    await page.goto("/practice/local-wellness-studio");
    await expect(
      page.getByRole("heading", { name: "Local Wellness Studio" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Choose a session" })
      .first()
      .click();

    await expect(
      page.getByText("Services & sessions", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Abhyanga" })).toBeVisible();
  });
});
