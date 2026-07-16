import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import type {
  AuthResponse,
  AuthTokens,
  Booking,
  BookingCheckout,
  HealthProfile,
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
 *  1. an explicit `extra.apiUrl` in app.json (use this for staging/prod), else
 *  2. in dev, the LAN IP of the Metro host + port 4000, so a physical device
 *     running Expo Go can reach the backend on your machine, else
 *  3. localhost (simulator).
 */
function resolveApiUrl(): string {
  const configured = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  if (configured) return configured;

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
 * In-memory token cache backed by SecureStore. `request` reads synchronously
 * from memory; persistence happens asynchronously. Call `load()` once at startup.
 */
export const tokenStore = {
  access: null as string | null,
  refresh: null as string | null,

  async load() {
    this.access = await SecureStore.getItemAsync(ACCESS_KEY);
    this.refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  },
  async set(tokens: AuthTokens) {
    this.access = tokens.accessToken;
    this.refresh = tokens.refreshToken;
    await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
  },
  async clear() {
    this.access = null;
    this.refresh = null;
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false } = options;

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
  refresh: (refreshToken: string) =>
    request<AuthTokens>("/auth/refresh", { method: "POST", body: { refreshToken } }),
  profile: () => request<UserProfile>("/auth/profile", { auth: true }),
  updateUser: (id: string, data: { fullName?: string; phone?: string; avatarUrl?: string }) =>
    request<UserProfile>(`/users/${id}`, { method: "PUT", body: data, auth: true }),

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
};

export function formatMoney(value: string | number | null | undefined, currency = "USD"): string {
  const n = Number(value ?? 0);
  const fractionDigits = Number.isInteger(n) ? 0 : 2;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(n);
  } catch {
    return `$${n.toFixed(fractionDigits)}`;
  }
}
