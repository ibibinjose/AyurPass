/**
 * Environment helpers. Production must never fall back to dev secrets or open CORS.
 */

const DEV_ACCESS_SECRET = 'ayurpass_access_secret';
const DEV_REFRESH_SECRET = 'ayurpass_refresh_secret';

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** True when we are not in a local/dev-friendly environment. */
export function isStrictEnv(): boolean {
  return isProduction() || process.env.AYURPASS_STRICT === '1';
}

export function accessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (secret) return secret;
  if (isStrictEnv()) {
    throw new Error('JWT_ACCESS_SECRET is required in production');
  }
  return DEV_ACCESS_SECRET;
}

export function refreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (secret) return secret;
  if (isStrictEnv()) {
    throw new Error('JWT_REFRESH_SECRET is required in production');
  }
  return DEV_REFRESH_SECRET;
}

/**
 * Call once at process bootstrap. Throws if production is misconfigured.
 */
export function assertProductionConfig(): void {
  if (!isStrictEnv()) return;

  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL', 'CORS_ORIGIN'] as const;
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    throw new Error(
      `Missing required environment variable(s) in production: ${missing.join(', ')}`,
    );
  }

  if (process.env.JWT_ACCESS_SECRET === DEV_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET must not use the development default in production');
  }
  if (process.env.JWT_REFRESH_SECRET === DEV_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET must not use the development default in production');
  }

  const cors = process.env.CORS_ORIGIN!.trim();
  if (cors === '*' || cors === '') {
    throw new Error('CORS_ORIGIN must be an explicit allowlist in production (not *)');
  }
}

/** Parse CORS_ORIGIN into a Nest-compatible origin option. */
export function corsOrigins(): string | string[] | boolean {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) {
    if (isStrictEnv()) {
      throw new Error('CORS_ORIGIN is required in production');
    }
    // Dev default: local web app only (never * with credentials).
    return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  }
  if (raw === '*') {
    if (isStrictEnv()) {
      throw new Error('CORS_ORIGIN=* is not allowed in production');
    }
    // Explicit * only in non-strict dev — still no credentials wildcard ambiguity.
    return true;
  }
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}
