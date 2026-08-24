import Constants from "expo-constants";
import { Platform } from "react-native";
import { formatMoneyGlobal } from "@ayurpass/shared";
import type {

  AuthResponse,
  AuthTokens,
  Booking,
  BookingCheckout,
  HealthProfile,
  JobApplication,
  JobListing,
  LoyaltySummary,
  Offer,
  PaymentModeConfig,
  Provider,
  ProviderType,
  RegisterPayload,
  Service,
  ServiceCategory,
  UserProfile,
  WellnessPackage,
} from "./types";

/**
 * Resolve the API base URL:
 *  1. EXPO_PUBLIC_API_URL (EAS build / shell — AWS API Gateway / ALB URL)
 *  2. extra.apiUrl from app.config.ts / app.json
 *  3. Dev: LAN IP of Metro host + :4000 (physical device on same Wi‑Fi)
 *  4. localhost (iOS Simulator / Android emulator with adb reverse)
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const configured = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig?.debuggerHost as string | undefined);
  const host = hostUri?.split(":")[0];
  if (host) return `http://${host}:4000`;

  return "http://localhost:4000";
}

export const API_URL = resolveApiUrl();

const ACCESS_KEY = "ayurpass.accessToken";
const REFRESH_KEY = "ayurpass.refreshToken";

/**
 * Platform storage:
 * - iOS / Android: expo-secure-store (Keychain / Keystore)
 * - Web: localStorage (SecureStore has no web native module)
 */
const kv = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    }
    const SecureStore = await import("expo-secure-store");
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
      } catch {
        /* private mode / blocked */
      }
      return;
    }
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      return;
    }
    const SecureStore = await import("expo-secure-store");
    await SecureStore.deleteItemAsync(key);
  },
};

/**
 * In-memory token cache backed by SecureStore (native) or localStorage (web).
 * Call `load()` once at startup.
 */
export const tokenStore = {
  access: null as string | null,
  refresh: null as string | null,

  async load() {
    try {
      this.access = await kv.get(ACCESS_KEY);
      this.refresh = await kv.get(REFRESH_KEY);
    } catch {
      this.access = null;
      this.refresh = null;
    }
  },
  async set(tokens: AuthTokens) {
    this.access = tokens.accessToken;
    this.refresh = tokens.refreshToken;
    try {
      await kv.set(ACCESS_KEY, tokens.accessToken);
      await kv.set(REFRESH_KEY, tokens.refreshToken);
    } catch {
      /* memory tokens still work for this session */
    }
  },
  async clear() {
    this.access = null;
    this.refresh = null;
    try {
      await kv.remove(ACCESS_KEY);
      await kv.remove(REFRESH_KEY);
    } catch {
      /* ignore */
    }
  },
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  /** Internal: skip the one automatic access-token refresh retry. */
  _retried?: boolean;
}

type RefreshOutcome = "refreshed" | "rejected" | "unavailable";

let refreshInFlight: Promise<RefreshOutcome> | null = null;

async function tryRefreshAccessToken(): Promise<RefreshOutcome> {
  const refresh = tokenStore.refresh;
  if (!refresh) return "rejected";
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const tokens = await request<AuthTokens>("/auth/refresh", {
          method: "POST",
          body: { refreshToken: refresh },
          _retried: true,
        });
        await tokenStore.set(tokens);
        return "refreshed";
      } catch (error) {
        // Do not sign the user out for a temporary offline/server error.
        if (error instanceof ApiError && [400, 401, 403].includes(error.status)) {
          await tokenStore.clear();
          return "rejected";
        }
        return "unavailable";
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, _retried = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      `Can't reach the server at ${API_URL}. Make sure the backend is running and reachable from this device.`,
      0,
    );
  }

  if (res.status === 401 && auth && !_retried) {
    const refreshOutcome = await tryRefreshAccessToken();
    if (refreshOutcome === "refreshed") {
      return request<T>(path, { ...options, _retried: true });
    }
    if (refreshOutcome === "unavailable") {
      throw new ApiError(
        "Unable to restore your saved session right now. Please check your connection and try again.",
        0,
      );
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.message === "string") message = data.message;
      else if (Array.isArray(data?.message)) message = data.message.join(", ");
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // auth
  register: (payload: RegisterPayload) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: payload }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: { email, password } }),
  socialAuth: (
    provider: "google" | "apple",
    payload: { email?: string; name?: string; idToken?: string },
  ) =>
    request<AuthResponse>("/auth/social", {
      method: "POST",
      body: { provider, ...payload },
    }),
  refresh: (refreshToken: string) =>
    request<AuthTokens>("/auth/refresh", { method: "POST", body: { refreshToken } }),
  profile: () => request<UserProfile>("/auth/profile", { auth: true }),
  verifyEmail: (token: string) =>
    request<AuthResponse>("/auth/verify-email", { method: "POST", body: { token } }),
  resendVerification: () =>
    request<{ message: string }>("/auth/resend-verification", { method: "POST", auth: true }),
  instantVerify: () =>
    request<{ message: string; user?: UserProfile }>("/auth/instant-verify", { method: "POST", auth: true }),
  updateUser: (id: string, data: { fullName?: string; phone?: string; avatarUrl?: string }) =>
    request<UserProfile>(`/users/${id}`, { method: "PUT", body: data, auth: true }),

  /**
   * Authenticated image upload (JPEG/PNG/WebP/GIF, max 5 MB).
   * On React Native pass `{ uri, name, type }` as the file parts of FormData.
   */
  uploadImage: async (file: {
    uri: string;
    name?: string;
    type?: string;
  }): Promise<{ url: string; filename: string; mimeType: string; size: number }> => {
    const body = new FormData();
    body.append("file", {
      uri: file.uri,
      name: file.name ?? "photo.jpg",
      type: file.type ?? "image/jpeg",
    } as unknown as Blob);

    const headers: Record<string, string> = {};
    if (tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;

    let res: Response;
    try {
      res = await fetch(`${API_URL}/uploads`, { method: "POST", headers, body });
    } catch {
      throw new ApiError(
        `Can't reach the server at ${API_URL}. Make sure the backend is running.`,
        0,
      );
    }
    if (!res.ok) {
      let message = `Upload failed (${res.status})`;
      try {
        const data = await res.json();
        if (typeof data?.message === "string") message = data.message;
      } catch {
        /* ignore */
      }
      throw new ApiError(message, res.status);
    }
    const data = (await res.json()) as {
      url: string;
      path?: string;
      filename: string;
      mimeType: string;
      size: number;
    };
    // Rewrite accidental localhost file URLs to the configured API base
    const preferred = data.path || data.url;
    let url = preferred;
    try {
      if (preferred.startsWith("/files/") || preferred.startsWith("/uploads/")) {
        url = `${API_URL.replace(/\/$/, "")}${preferred}`;
      } else {
        const parsed = new URL(preferred);
        if (
          (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
          (parsed.pathname.startsWith("/files/") || parsed.pathname.startsWith("/uploads/"))
        ) {
          url = `${API_URL.replace(/\/$/, "")}${parsed.pathname}${parsed.search}`;
        }
      }
    } catch {
      /* keep preferred */
    }
    return { ...data, url };
  },

  // discovery
  providers: (params?: { q?: string; type?: ProviderType; city?: string; country?: string }) => {
    const search = new URLSearchParams();
    if (params?.q) search.set("q", params.q);
    if (params?.type) search.set("type", params.type);
    if (params?.city) search.set("city", params.city);
    if (params?.country) search.set("country", params.country);
    const qs = search.toString();
    return request<Provider[]>(`/providers${qs ? `?${qs}` : ""}`);
  },
  provider: (id: string) => request<Provider>(`/providers/${id}`),
  services: (category?: ServiceCategory) =>
    request<Service[]>(`/services${category ? `?category=${category}` : ""}`),
  service: (id: string) => request<Service | null>(`/services/${id}`),
  servicesByProvider: (providerId: string) =>
    request<Service[]>(`/services/provider/${providerId}`),
  packages: () => request<WellnessPackage[]>("/packages"),
  offers: (discipline?: string) =>
    request<Offer[]>(`/offers${discipline ? `?discipline=${encodeURIComponent(discipline)}` : ""}`),
  offer: (id: string) => request<Offer>(`/offers/${id}`),

  // jobs & career listings
  jobs: (params?: { category?: string; employmentType?: string; q?: string; providerId?: string }) => {
    const search = new URLSearchParams();
    if (params?.category) search.append("category", params.category);
    if (params?.employmentType) search.append("employmentType", params.employmentType);
    if (params?.q) search.append("q", params.q);
    if (params?.providerId) search.append("providerId", params.providerId);
    const queryStr = search.toString();
    return request<JobListing[]>(`/jobs${queryStr ? `?${queryStr}` : ""}`);
  },
  job: (id: string) => request<JobListing>(`/jobs/${id}`),
  providerJobs: (providerId: string) => request<JobListing[]>(`/providers/${providerId}/jobs`),
  applyJob: (
    jobId: string,
    data: {
      fullName: string;
      email: string;
      phone?: string;
      coverNote?: string;
      resumeUrl?: string;
      experienceYears?: number;
    },
  ) =>
    request<JobApplication>(`/jobs/${jobId}/apply`, {
      method: "POST",
      body: data,
      auth: true,
    }),
  myApplications: () => request<JobApplication[]>("/jobs/my-applications", { auth: true }),

  // bookings
  createBooking: (data: {
    consumerId: string;
    serviceId: string;
    providerId: string;
    professionalId?: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    notes?: string;
    contactPhone?: string;
  }) => request<Booking>("/bookings", { method: "POST", body: data, auth: true }),
  bookingsByConsumer: (consumerId: string) =>
    request<Booking[]>(`/bookings/consumer/${consumerId}`, { auth: true }),

  // payments
  paymentMode: () => request<PaymentModeConfig>("/payments/mode"),
  payBooking: (bookingId: string) =>
    request<BookingCheckout>(`/payments/checkout/${bookingId}`, {
      method: "POST",
      body: {},
      auth: true,
    }),
  confirmBookingPayment: (bookingId: string) =>
    request<BookingCheckout>(`/payments/confirm/${bookingId}`, { method: "POST", auth: true }),

  // health / loyalty
  healthProfile: (consumerId: string) =>
    request<HealthProfile | null>(`/health-profiles/consumer/${consumerId}`, { auth: true }),
  saveHealthProfile: (
    consumerId: string,
    data: {
      consumerId: string;
      vataScore: number;
      pittaScore: number;
      kaphaScore: number;
      questionnaireResponses?: unknown;
      lastAssessment?: string;
    },
  ) =>
    request<HealthProfile>(`/health-profiles/consumer/${consumerId}`, {
      method: "POST",
      body: data,
      auth: true,
    }),
  loyalty: () => request<LoyaltySummary>("/loyalty/me", { auth: true }),
  redeemLoyaltyReward: (rewardId: string) =>
    request<LoyaltySummary>("/loyalty/redeem", {
      method: "POST",
      body: { rewardId },
      auth: true,
    }),
  myEventTickets: () =>
    request<
      {
        id: string;
        status: string;
        code: string;
        event?: {
          id: string;
          title: string;
          category?: string;
          startTime: string;
          endTime?: string;
          slug?: string;
          provider?: { businessName?: string };
        } | null;
      }[]
    >("/events/tickets/mine", { auth: true }),
  myWellnessPass: () => request<Record<string, unknown>>("/wellness-pass/me", { auth: true }),
  issueWellnessPass: () =>
    request<Record<string, unknown>>("/wellness-pass/issue", { method: "POST", auth: true }),

  // push devices
  registerDevice: (token: string, platform?: "ios" | "android" | "web") =>
    request<{ id: string; token: string }>("/notifications/devices", {
      method: "POST",
      body: { token, platform },
      auth: true,
    }),
  unregisterDevice: (token: string) =>
    request<{ removed: boolean }>("/notifications/devices", {
      method: "DELETE",
      body: { token },
      auth: true,
    }),
};

export function formatMoney(value: string | number | null | undefined, currency = "AUD"): string {
  const n = Number(value ?? 0);
  return formatMoneyGlobal(n, currency);
}

/**
 * Format a date in the provider's timezone so consumers see the practice's local time.
 */
export function formatDate(
  iso: string | Date | null | undefined,
  timezone?: string | null,
): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(timezone ? { timeZone: timezone } : {}),
  };
  return d.toLocaleDateString(undefined, opts);
}

/**
 * Format a time in the provider's timezone.
 */
export function formatTime(
  iso: string | Date | null | undefined,
  timezone?: string | null,
): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    ...(timezone ? { timeZone: timezone } : {}),
  };
  return d.toLocaleTimeString(undefined, opts);
}

/**
 * Format full date + time in the provider's timezone.
 */
export function formatDateTime(
  iso: string | Date | null | undefined,
  timezone?: string | null,
): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(timezone ? { timeZone: timezone } : {}),
  };
  return d.toLocaleString(undefined, opts);
}
