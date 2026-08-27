import { expect, test } from "@playwright/test";

const productId = "abhyanga-oil";

test.describe("Product WhatsApp enquiry", () => {
  test("provides a safe, product-specific WhatsApp message draft", async ({
    page,
  }) => {
    await page.route(`**/products/${productId}`, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          id: productId,
          providerId: "local-wellness-studio",
          name: "Abhyanga Massage Oil",
          category: "Ayurveda",
          description: "A nourishing massage oil for self-care rituals.",
          price: "39.00",
          inventoryQuantity: 8,
          createdAt: "2026-08-27T00:00:00.000Z",
          provider: {
            id: "local-wellness-studio",
            code: "LWS",
            businessName: "Local Wellness Studio",
            type: "SPA",
            verificationStatus: "VERIFIED",
            brandProfile: null,
            currency: "AUD",
          },
        }),
      });
    });

    await page.goto(`/shop/${productId}`);

    const enquiry = page.getByRole("link", {
      name: "Ask about Abhyanga Massage Oil on WhatsApp",
    });
    await expect(enquiry).toBeVisible();
    await expect(enquiry).toHaveAttribute("target", "_blank");

    const href = await enquiry.getAttribute("href");
    expect(href).not.toBeNull();
    const whatsappUrl = new URL(href!);
    expect(whatsappUrl.origin).toBe("https://api.whatsapp.com");
    expect(whatsappUrl.searchParams.get("phone")).toBe("61469304711");

    const message = whatsappUrl.searchParams.get("text") ?? "";
    expect(message).toContain("Product: Abhyanga Massage Oil");
    expect(message).toContain("Listed by: Local Wellness Studio");
    expect(message).toContain("Quantity: 1");
    expect(message).toContain("https://www.ayurpass.com/shop/abhyanga-oil");
    expect(message).not.toContain("Delivery street");
    expect(message).not.toContain("payment");
  });
});
