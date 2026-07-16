/** Fallback publishable key from frontend env (checkout also returns one from the API). */
export function stripePublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  if (!key || key.endsWith("...") || key.includes("REPLACE")) return null;
  return key;
}