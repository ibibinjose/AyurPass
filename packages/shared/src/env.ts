/**
 * Environment contracts for AyurPass clients and API.
 * Runtime validation is intentionally lightweight (no zod dependency in shared).
 */

export type AppEnvironment = "development" | "staging" | "production";

export interface PublicClientEnv {
  apiUrl: string;
  siteUrl?: string;
  stripePublishableKey?: string;
  environment?: AppEnvironment;
}

export interface ApiServerEnv {
  databaseUrl: string;
  port: number;
  corsOrigin: string;
  frontendUrl: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  stripeWebhookSecret?: string;
}

const DEFAULT_API_URL = "http://localhost:4000";
const DEFAULT_SITE_URL = "http://localhost:3000";

export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

/** Resolve web dashboard / public site client env (Next.js). */
export function resolveDashboardEnv(input?: {
  apiUrl?: string | null;
  siteUrl?: string | null;
  stripePublishableKey?: string | null;
}): PublicClientEnv {
  return {
    apiUrl: normalizeBaseUrl(input?.apiUrl || processEnv("NEXT_PUBLIC_API_URL") || DEFAULT_API_URL),
    siteUrl: normalizeBaseUrl(
      input?.siteUrl || processEnv("NEXT_PUBLIC_SITE_URL") || DEFAULT_SITE_URL,
    ),
    stripePublishableKey:
      input?.stripePublishableKey ||
      processEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") ||
      undefined,
    environment: inferEnvironment(),
  };
}

/** Resolve mobile client env (Expo). Does not resolve LAN hosts — apps do that. */
export function resolveMobileEnv(input?: {
  apiUrl?: string | null;
}): Pick<PublicClientEnv, "apiUrl" | "environment"> {
  const fromEnv = input?.apiUrl || processEnv("EXPO_PUBLIC_API_URL");
  return {
    apiUrl: fromEnv ? normalizeBaseUrl(fromEnv) : DEFAULT_API_URL,
    environment: inferEnvironment(),
  };
}

export function assertApiUrl(url: string): string {
  const normalized = normalizeBaseUrl(url);
  if (!normalized) throw new Error("API URL is required");
  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error(`API URL must be absolute (got: ${url})`);
  }
  return normalized;
}

function processEnv(key: string): string | undefined {
  try {
    // eslint-disable-next-line no-undef
    const value = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
      ?.env?.[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  } catch {
    return undefined;
  }
}

function inferEnvironment(): AppEnvironment {
  const nodeEnv = processEnv("NODE_ENV");
  const appEnv = processEnv("AYURPASS_ENV") || processEnv("EXPO_PUBLIC_APP_ENV");
  if (appEnv === "staging" || appEnv === "production" || appEnv === "development") return appEnv;
  if (nodeEnv === "production") return "production";
  return "development";
}
