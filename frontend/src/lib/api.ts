import type {
  AdminOverview,
  AdminProvider,
  AuthResponse,
  AuthTokens,
  Booking,
  BookingCheckout,
  BookingStatus,
  BrandProfile,
  BusinessAddress,
  Channel,
  Enquiry,
  GiftCard,
  GiftCardLookup,
  Offer,
  OfferInput,
  HealthProfile,
  LoyaltySummary,
  Order,
  OrderCheckout,
  OrderStatus,
  PaymentModeConfig,
  StripeConnectStatus,
  Product,
  Professional,
  ProfessionalDetail,
  Provider,
  ProviderType,
  RegisterPayload,
  Retreat,
  RetreatCategory,
  RetreatInput,
  Room,
  Service,
  ServiceCategory,
  SyncReport,
  TreatmentPlan,
  UserProfile,
  WellnessPackage,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const ACCESS_KEY = "ayurpass.accessToken";
const REFRESH_KEY = "ayurpass.refreshToken";

export const tokenStore = {
  get access() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: AuthTokens) {
    window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
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

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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
  return res.json() as Promise<T>;
}

export const api = {
  // --- auth ---
  register: (payload: RegisterPayload) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: payload }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: { email, password } }),
  refresh: (refreshToken: string) =>
    request<AuthTokens>("/auth/refresh", { method: "POST", body: { refreshToken } }),
  profile: () => request<UserProfile>("/auth/profile", { auth: true }),

  // --- users ---
  userByEmail: (email: string) =>
    request<UserProfile | null>(`/users/email/${encodeURIComponent(email)}`),
  updateUser: (id: string, data: { fullName?: string; phone?: string; avatarUrl?: string }) =>
    request<UserProfile>(`/users/${id}`, { method: "PUT", body: data, auth: true }),

  // --- packages ---
  packages: () => request<WellnessPackage[]>("/packages"),
  packagesByProvider: (providerId: string) =>
    request<WellnessPackage[]>(`/packages/provider/${providerId}`),
  createPackage: (data: Partial<WellnessPackage> & { providerId: string; name: string; totalPrice: number }) =>
    request<WellnessPackage>("/packages", { method: "POST", body: data, auth: true }),
  updatePackage: (id: string, data: Partial<WellnessPackage>) =>
    request<WellnessPackage>(`/packages/${id}`, { method: "PUT", body: data, auth: true }),
  deletePackage: (id: string) =>
    request<WellnessPackage>(`/packages/${id}`, { method: "DELETE", auth: true }),

  // --- services ---
  services: (category?: ServiceCategory) =>
    request<Service[]>(`/services${category ? `?category=${category}` : ""}`),
  service: (id: string) => request<Service | null>(`/services/${id}`),
  servicesByProvider: (providerId: string) =>
    request<Service[]>(`/services/provider/${providerId}`),
  createService: (data: {
    providerId: string;
    professionalId?: string;
    category: ServiceCategory;
    name: string;
    description?: string;
    durationMinutes: number;
    price: number;
    imageUrl?: string;
    isVirtual?: boolean;
    maxParticipants?: number;
  }) => request<Service>("/services", { method: "POST", body: data, auth: true }),
  updateService: (id: string, data: Partial<Omit<Service, "id" | "provider" | "professional">>) =>
    request<Service>(`/services/${id}`, { method: "PUT", body: data, auth: true }),
  deleteService: (id: string) =>
    request<Service>(`/services/${id}`, { method: "DELETE", auth: true }),

  // --- bookings ---
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
  bookingsByProvider: (providerId: string) =>
    request<Booking[]>(`/bookings/provider/${providerId}`, { auth: true }),
  updateBooking: (
    id: string,
    data: {
      status?: BookingStatus;
      notes?: string;
      roomId?: string | null;
      professionalId?: string | null;
      startTime?: string;
      endTime?: string;
    },
  ) => request<Booking>(`/bookings/${id}`, { method: "PUT", body: data, auth: true }),

  // --- rooms ---
  roomsByProvider: (providerId: string) =>
    request<Room[]>(`/rooms/provider/${providerId}`, { auth: true }),
  createRoom: (data: {
    providerId: string;
    name: string;
    description?: string;
    capacity?: number;
    hourlyCost?: number;
  }) => request<Room>("/rooms", { method: "POST", body: data, auth: true }),
  updateRoom: (
    id: string,
    data: { name?: string; description?: string; capacity?: number; hourlyCost?: number },
  ) => request<Room>(`/rooms/${id}`, { method: "PUT", body: data, auth: true }),
  deleteRoom: (id: string) => request<Room>(`/rooms/${id}`, { method: "DELETE", auth: true }),

  // --- payments (Stripe Connect) ---
  paymentMode: () => request<PaymentModeConfig>("/payments/mode"),
  payBooking: (bookingId: string, redemption?: { giftCardCode?: string; redeemPoints?: number }) =>
    request<BookingCheckout>(`/payments/checkout/${bookingId}`, {
      method: "POST",
      body: redemption ?? {},
      auth: true,
    }),
  confirmBookingPayment: (bookingId: string) =>
    request<Booking>(`/payments/confirm/${bookingId}`, { method: "POST", auth: true }),
  refundBooking: (bookingId: string) =>
    request<Booking>(`/payments/refund/${bookingId}`, { method: "POST", auth: true }),
  stripeConnectOnboard: (
    providerId: string,
    urls: { returnUrl: string; refreshUrl: string },
  ) =>
    request<{ mock: boolean; url: string; accountId: string; message?: string }>(
      `/payments/connect/${providerId}/onboard`,
      { method: "POST", body: urls, auth: true },
    ),
  stripeConnectStatus: (providerId: string) =>
    request<StripeConnectStatus>(`/payments/connect/${providerId}/status`, { auth: true }),

  // --- providers (business profile) ---
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
  providerBySlug: (slug: string) =>
    request<Provider>(`/providers/slug/${encodeURIComponent(slug)}`),
  updateProvider: (
    id: string,
    data: {
      businessName?: string;
      type?: ProviderType;
      brandProfile?: BrandProfile;
      address?: BusinessAddress;
      timezone?: string;
      listingTier?: string;
    },
  ) => request<Provider>(`/providers/${id}`, { method: "PUT", body: data, auth: true }),

  // --- enquiries (leads from listing / retreat pages) ---
  createEnquiry: (data: {
    providerId: string;
    retreatId?: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) => request<Enquiry>("/enquiries", { method: "POST", body: data }),
  myEnquiries: () => request<Enquiry[]>("/enquiries", { auth: true }),
  updateEnquiry: (id: string, status: Enquiry["status"]) =>
    request<Enquiry>(`/enquiries/${id}`, { method: "PATCH", body: { status }, auth: true }),

  // --- retreats & trainings directory ---
  retreats: (params?: {
    q?: string;
    category?: RetreatCategory;
    city?: string;
    country?: string;
    month?: string;
    maxPrice?: number;
    maxDuration?: number;
    featured?: boolean;
  }) => {
    const s = new URLSearchParams();
    if (params?.q) s.set("q", params.q);
    if (params?.category) s.set("category", params.category);
    if (params?.city) s.set("city", params.city);
    if (params?.country) s.set("country", params.country);
    if (params?.month) s.set("month", params.month);
    if (params?.maxPrice != null) s.set("maxPrice", String(params.maxPrice));
    if (params?.maxDuration != null) s.set("maxDuration", String(params.maxDuration));
    if (params?.featured) s.set("featured", "true");
    const qs = s.toString();
    return request<Retreat[]>(`/retreats${qs ? `?${qs}` : ""}`);
  },
  retreatBySlug: (slug: string) => request<Retreat>(`/retreats/slug/${slug}`),
  retreatsByProvider: (providerId: string) =>
    request<Retreat[]>(`/retreats/provider/${providerId}`),
  myRetreats: () => request<Retreat[]>("/retreats/mine", { auth: true }),
  createRetreat: (data: RetreatInput) =>
    request<Retreat>("/retreats", { method: "POST", body: data, auth: true }),
  updateRetreat: (id: string, data: Partial<RetreatInput>) =>
    request<Retreat>(`/retreats/${id}`, { method: "PUT", body: data, auth: true }),
  deleteRetreat: (id: string) =>
    request<Retreat>(`/retreats/${id}`, { method: "DELETE", auth: true }),
  curateRetreat: (id: string, data: { featured?: boolean; verificationStatus?: string }) =>
    request<Retreat>(`/retreats/${id}/curation`, { method: "PATCH", body: data, auth: true }),

  // --- offers & promotions ---
  offers: (discipline?: string) =>
    request<Offer[]>(`/offers${discipline ? `?discipline=${encodeURIComponent(discipline)}` : ""}`),
  offer: (id: string) => request<Offer>(`/offers/${id}`),
  adminOffers: () => request<Offer[]>("/offers/admin/all", { auth: true }),
  createOffer: (data: OfferInput) =>
    request<Offer>("/offers", { method: "POST", body: data, auth: true }),
  updateOffer: (id: string, data: Partial<OfferInput>) =>
    request<Offer>(`/offers/${id}`, { method: "PUT", body: data, auth: true }),
  deleteOffer: (id: string) =>
    request<Offer>(`/offers/${id}`, { method: "DELETE", auth: true }),

  // --- products ---
  products: (category?: string) =>
    request<Product[]>(`/products${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  product: (id: string) => request<Product | null>(`/products/${id}`),
  productsByProvider: (providerId: string) => request<Product[]>(`/products/provider/${providerId}`),
  createProduct: (data: {
    providerId: string;
    name: string;
    category?: string;
    description?: string;
    price: number;
    inventoryQuantity?: number;
    images?: string[];
  }) => request<Product>("/products", { method: "POST", body: data, auth: true }),
  updateProduct: (
    id: string,
    data: {
      name?: string;
      category?: string;
      description?: string;
      price?: number;
      inventoryQuantity?: number;
      images?: string[];
    },
  ) => request<Product>(`/products/${id}`, { method: "PUT", body: data, auth: true }),
  deleteProduct: (id: string) =>
    request<Product>(`/products/${id}`, { method: "DELETE", auth: true }),

  // --- orders ---
  createOrder: (data: {
    consumerId: string;
    items: { productId: string; quantity: number }[];
    shippingAddress?: BusinessAddress;
    notes?: string;
  }) => request<Order>("/orders", { method: "POST", body: data, auth: true }),
  ordersByConsumer: (consumerId: string) =>
    request<Order[]>(`/orders/consumer/${consumerId}`, { auth: true }),
  ordersByProvider: (providerId: string) =>
    request<Order[]>(`/orders/provider/${providerId}`, { auth: true }),
  updateOrder: (id: string, data: { status?: OrderStatus; notes?: string }) =>
    request<Order>(`/orders/${id}`, { method: "PUT", body: data, auth: true }),
  payOrder: (orderId: string, redemption?: { giftCardCode?: string; redeemPoints?: number }) =>
    request<OrderCheckout>(`/payments/checkout-order/${orderId}`, {
      method: "POST",
      body: redemption ?? {},
      auth: true,
    }),
  confirmOrderPayment: (orderId: string) =>
    request<Order>(`/payments/confirm-order/${orderId}`, { method: "POST", auth: true }),
  refundOrder: (orderId: string) =>
    request<Order>(`/payments/refund-order/${orderId}`, { method: "POST", auth: true }),

  // --- loyalty (AyurPass Rewards) ---
  loyalty: () => request<LoyaltySummary>("/loyalty/me", { auth: true }),

  // --- gift cards ---
  purchaseGiftCard: (data: { amount: number; recipientEmail?: string; message?: string }) =>
    request<GiftCard>("/gift-cards/purchase", { method: "POST", body: data, auth: true }),
  myGiftCards: () => request<GiftCard[]>("/gift-cards/mine", { auth: true }),
  lookupGiftCard: (code: string) =>
    request<GiftCardLookup>(`/gift-cards/lookup/${encodeURIComponent(code)}`, { auth: true }),

  // --- channels / integrations ---
  channels: (providerId: string) =>
    request<Channel[]>(`/integrations/provider/${providerId}`, { auth: true }),
  connectChannel: (providerId: string, type: string) =>
    request<{ id: string }>("/integrations/connect", {
      method: "POST",
      body: { providerId, type },
      auth: true,
    }),
  disconnectChannel: (integrationId: string) =>
    request<{ id: string }>(`/integrations/${integrationId}/disconnect`, {
      method: "POST",
      auth: true,
    }),
  syncChannel: (integrationId: string) =>
    request<SyncReport>(`/integrations/${integrationId}/sync`, { method: "POST", auth: true }),

  // --- admin ---
  adminOverview: () => request<AdminOverview>("/admin/overview", { auth: true }),
  adminProviders: () => request<AdminProvider[]>("/admin/providers", { auth: true }),
  adminSetVerification: (providerId: string, status: "pending" | "verified" | "rejected") =>
    request<AdminProvider>(`/admin/providers/${providerId}/verification`, {
      method: "PUT",
      body: { status },
      auth: true,
    }),
  adminBookings: () => request<Booking[]>("/admin/bookings", { auth: true }),
  adminUsers: () =>
    request<(UserProfile & { provider?: { id: string; businessName: string } | null })[]>(
      "/admin/users",
      { auth: true },
    ),

  // --- treatment plans ---
  plansByConsumer: (consumerId: string) =>
    request<TreatmentPlan[]>(`/treatment-plans/consumer/${consumerId}`, { auth: true }),

  // --- health profiles ---
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

  // --- professionals ---
  professionals: () => request<Professional[]>('/professionals'),
  professionalBySlug: (slug: string) =>
    request<ProfessionalDetail>(`/professionals/slug/${encodeURIComponent(slug)}`),
  professionalsByProvider: (providerId: string) =>
    request<Professional[]>(`/professionals/provider/${providerId}`, { auth: true }),
  publicProfessionalsByProvider: (providerId: string) =>
    request<Professional[]>(`/professionals/provider/${providerId}`),
  createProfessional: (data: {
    userId: string;
    providerId: string;
    title?: string;
    specializations?: string[];
    bio?: string;
    yearsExperience?: number;
    hourlyRate?: number;
  }) => request<Professional>("/professionals", { method: "POST", body: data, auth: true }),
};

export function formatMoney(value: string | number | null | undefined, currency = "USD"): string {
  const n = Number(value ?? 0);
  // Whole amounts stay clean ($45); fractional amounts show cents ($0.05, $2.80).
  const fractionDigits = Number.isInteger(n) ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}
