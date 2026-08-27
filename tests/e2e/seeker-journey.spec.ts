import { expect, test } from "@playwright/test";

test.describe("Seeker registration and wellness journey", () => {
  test("a new seeker can register, complete the Prakriti quiz, and discover practices", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Desktop-only seeker journey verification");

    // 1. Go to register page
    await page.goto("/register");
    const nameInput = page.getByLabel("Full name");
    await nameInput.waitFor();

    const uniqueEmail = `seeker-${Date.now()}@ayurpass.test`;

    // Fill in registration form
    await nameInput.fill("Ananya Seeker");
    await page.getByLabel("Email address").fill(uniqueEmail);
    await page.getByLabel("City").fill("Melbourne");
    await page.getByLabel("State / Region").fill("VIC");
    await page.locator('input[type="password"]').fill("SecurePass123!");

    // Submit form
    await page.getByRole("button", { name: "Create account" }).click();

    // 2. Expect redirect to email verification notice or dashboard assessment
    await expect(page).toHaveURL(/\/verify-email|\/dashboard\/assessment/, { timeout: 15000 });

    // Go to Prakriti assessment page directly
    await page.goto("/dashboard/assessment");
    await expect(page).toHaveURL(/\/dashboard\/assessment/);

    // Verify introduction screen and begin assessment
    const beginBtn = page.getByRole("button", { name: "Begin the assessment" });
    await beginBtn.waitFor();
    await beginBtn.click();

    // 3. Step through 12 questions
    for (let i = 1; i <= 12; i++) {
      // Wait for question indicators
      await expect(page.getByText(`Question ${i} of 12`)).toBeVisible();
      
      // Select first option for each question
      const options = page.locator("button.w-full.rounded-2xl.border");
      await expect(options.first()).toBeVisible();
      await options.first().click();
    }

    // 4. Expect results stage
    await expect(page.getByText("Your constitution")).toBeVisible();
    await expect(page.getByText("Balanced by:")).toBeVisible();

    // Click navigation button from results
    const discoverBtn = page.getByRole("button", { name: "Discover practices" });
    await expect(discoverBtn).toBeVisible();
    await discoverBtn.click();

    // 5. Expect redirect to discover page and perform location query
    await expect(page).toHaveURL(/\/discover/);
    await page.locator('header[data-hydrated="true"]').waitFor();

    // Proximity / Location search input
    const locationInput = page.getByPlaceholder("City, region or country");
    await expect(locationInput).toBeVisible();
    await locationInput.fill("Sydney");
    await locationInput.press("Enter");

    // Verify url matches query
    await expect(page).toHaveURL(/\/discover/);
  });
});
