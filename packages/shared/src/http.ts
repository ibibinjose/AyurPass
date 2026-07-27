/**
 * Platform-agnostic HTTP helpers for AyurPass API clients.
 * Token storage and platform headers are injected by web/mobile adapters.
 */

import { endpoints } from "./endpoints";
import { assertApiUrl, normalizeBaseUrl } from "./env";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type TokenStore = {
  getAccess: () => string | null | Promise<string | null>;
  getRefresh: () => string | null | Promise<string | null>;
  set: (tokens: TokenPair) => void | Promise<void>;
  clear: () => void | Promise<void>;
};

export type HttpClientOptions = {
  baseUrl: string;
  tokens?: TokenStore;
  /** Called after a successful refresh so apps can sync state. */
  onTokensRefreshed?: (tokens: TokenPair) => void;
  defaultHeaders?: Record<string, string>;
  fetchImpl?: typeof fetch;
};

export type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** Skip Authorization header */
  public?: boolean;
  /** Do not attempt refresh on 401 */
  skipRefresh?: boolean;
  signal?: AbortSignal;
};

function messageFromBody(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const msg = (data as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.join(", ");
  }
  return `Request failed (${status})`;
}

export function createHttpClient(options: HttpClientOptions) {
  const baseUrl = assertApiUrl(options.baseUrl);
  const fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);

  async function refreshAccessToken(): Promise<boolean> {
    if (!options.tokens) return false;
    const refresh = await options.tokens.getRefresh();
    if (!refresh) return false;
    try {
      const res = await fetchImpl(`${baseUrl}${endpoints.auth.refresh}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...options.defaultHeaders },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) {
        await options.tokens.clear();
        return false;
      }
      const data = (await res.json()) as TokenPair;
      if (!data.accessToken || !data.refreshToken) {
        await options.tokens.clear();
        return false;
      }
      await options.tokens.set(data);
      options.onTokensRefreshed?.(data);
      return true;
    } catch {
      await options.tokens.clear();
      return false;
    }
  }

  async function request<T>(path: string, opts: RequestOptions = {}, retried = false): Promise<T> {
    const headers: Record<string, string> = {
      ...options.defaultHeaders,
      ...opts.headers,
    };

    const isFormData =
      typeof FormData !== "undefined" && opts.body instanceof FormData;
    if (opts.body !== undefined && !isFormData) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    }

    if (!opts.public && options.tokens) {
      const access = await options.tokens.getAccess();
      if (access) headers.Authorization = `Bearer ${access}`;
    }

    const res = await fetchImpl(`${baseUrl}${path}`, {
      method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
      headers,
      body:
        opts.body === undefined
          ? undefined
          : isFormData
            ? (opts.body as FormData)
            : JSON.stringify(opts.body),
      signal: opts.signal,
    });

    if (res.status === 401 && !opts.public && !opts.skipRefresh && !retried) {
      const ok = await refreshAccessToken();
      if (ok) return request<T>(path, opts, true);
    }

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      throw new ApiError(messageFromBody(data, res.status), res.status, data);
    }

    return data as T;
  }

  return {
    baseUrl,
    request,
    get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...opts, method: "GET" }),
    post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...opts, method: "POST", body }),
    put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...opts, method: "PUT", body }),
    patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...opts, method: "PATCH", body }),
    delete: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...opts, method: "DELETE" }),
    health: () => request<{ status: string; timestamp: string }>(endpoints.health, { public: true }),
    healthReady: () =>
      request<{ status: string; database: string }>(endpoints.healthReady, { public: true }),
    verifyEmail: (token: string) =>
      request(endpoints.auth.verifyEmail, { method: "POST", body: { token } }, false),
    resendVerification: () =>
      request(endpoints.auth.resendVerification, { method: "POST" }, false),
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;

export { normalizeBaseUrl, assertApiUrl };
