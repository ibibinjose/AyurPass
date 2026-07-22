import { resolveDashboardEnv } from "@ayurpass/shared";

/** Public dashboard client env (Next.js). */
export const dashboardEnv = resolveDashboardEnv({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

export const API_URL = dashboardEnv.apiUrl;
