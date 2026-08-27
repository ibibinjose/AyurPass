import { expect, test } from "@playwright/test";

test.describe("Public account entry", () => {
  test("clarifies sign-in context and lets a visitor select an account starting point", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: /Practitioner \/ Practice/ })
      .click();
    await expect(page.getByText("Practitioner or practice:")).toBeVisible();
    await expect(
      page.getByText("Access your schedule, services, and business workspace."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Reset your password" }),
    ).toBeVisible();

    await page.goto("/account-type");

    const logo = page.getByRole("link", { name: "AyurPass home" });
    await expect(logo).toBeVisible();
    await expect(logo).toContainText("AyurPass");

    const providerRole = page.getByRole("radio", {
      name: "Choose Provider account",
    });
    await expect(providerRole).toHaveAttribute("aria-checked", "false");
    await providerRole.click();
    await expect(providerRole).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("Selected starting point")).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Continue to create a Provider account",
      }),
    ).toBeVisible();

    await providerRole.press("ArrowLeft");
    const professionalRole = page.getByRole("radio", {
      name: "Choose Professional account",
    });
    await expect(professionalRole).toHaveAttribute("aria-checked", "true");
    await expect(professionalRole).toBeFocused();

    await page
      .getByRole("button", {
        name: "Continue to create a Professional account",
      })
      .click();
    await expect(page).toHaveURL(/\/register\?role=PROFESSIONAL$/);
  });

  test("publishes accurate share metadata while protecting account routes from indexing", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(
      "AyurPass — Find and Book Ayurveda, Yoga and Wellness",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://www.ayurpass.com",
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "AyurPass — Find and Book Ayurveda, Yoga and Wellness",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/opengraph-image/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );

    const shareImage = await page.request.get("/opengraph-image");
    expect(shareImage.status()).toBe(200);
    expect(shareImage.headers()["content-type"]).toContain("image/png");

    for (const path of ["/login", "/account-type"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex.*nofollow/,
      );
    }
  });
});
