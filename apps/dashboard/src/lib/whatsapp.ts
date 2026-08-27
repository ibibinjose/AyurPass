import { SITE_URL } from "@/lib/seo";

/**
 * Public business WhatsApp contact supplied by the AyurPass owner.
 * An environment override allows the public business contact to change without code changes.
 */
export const WHATSAPP_PRODUCT_ENQUIRY_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_PRODUCT_ENQUIRY_PHONE || "61469304711";

type ProductEnquiryInput = {
  productId: string;
  productName: string;
  providerName?: string | null;
  quantity: number;
};

/**
 * Opens a customer-composed WhatsApp message; it never sends a message automatically.
 * The message includes only public product context, never account, delivery, or payment information.
 */
export function productWhatsAppEnquiryUrl({
  productId,
  productName,
  providerName,
  quantity,
}: ProductEnquiryInput): string {
  const productUrl = `${SITE_URL}/shop/${encodeURIComponent(productId)}`;
  const providerLine = providerName ? `\nListed by: ${providerName}` : "";
  const message = [
    "Hello AyurPass, I have a question about a product.",
    "",
    `Product: ${productName}${providerLine}`,
    `Quantity: ${quantity}`,
    `Product page: ${productUrl}`,
    "",
    "Could you please help with availability, delivery, or product details?",
  ].join("\n");

  const params = new URLSearchParams({
    phone: WHATSAPP_PRODUCT_ENQUIRY_PHONE,
    text: message,
    type: "phone_number",
    app_absent: "0",
  });

  return `https://api.whatsapp.com/send/?${params.toString()}`;
}
