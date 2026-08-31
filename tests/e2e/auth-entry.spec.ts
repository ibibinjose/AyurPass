import { expect, test } from "@playwright/test";

test.describe("Public account entry", () => {
  test("clarifies sign-in context and lets a visitor select an account starting point", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
    await expect(
      page.getByText("Sign in to your AyurPass account"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Forgot password?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in" }),
    ).toBeVisible();

    await page.goto("/account-type");

    await expect(
      page.getByRole("heading", { name: "How will you use AyurPass?" }),
    ).toBeVisible();

    const providerRole = page.getByRole("radio", {
      name: /Provider/,
    });
    await expect(providerRole).toHaveAttribute("aria-checked", "false");
    await providerRole.click();
    await expect(providerRole).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByRole("button", {
        name: "Continue as Provider",
      }),
    ).toBeVisible();

    await providerRole.press("ArrowLeft");
    const professionalRole = page.getByRole("radio", {
      name: /Practitioner/,
    });
    await expect(professionalRole).toHaveAttribute("aria-checked", "true");
    await expect(professionalRole).toBeFocused();

    await page
      .getByRole("button", {
        name: "Continue as Practitioner",
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
