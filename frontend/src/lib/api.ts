import type {
  AdminOverview,
  AdminProvider,
  AccessAuditEntry,
  AuthResponse,
  AuthTokens,
  Booking,
  ClientConsent,
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
  HealthAuthorityBadge,
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
  ProviderProfileBundle,
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
  ClientRecord,
  ClientNote,
} from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type UploadedImage = {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
};

async function uploadImageRequest(file: File, retried = false): Promise<UploadedImage> {
  const body = new FormData();
  body.append("file", file);
  const headers: Record<string, string> = {};
  if (tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;
  const res = await fetch(`${API_URL}/uploads`, { method: "POST", headers, body });
  if (res.status === 401 && !retried) {
    const ok = await tryRefreshAccessToken();
    if (ok) return uploadImageRequest(file, true);
  }
  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.message === "string") message = data.message;
      else if (Array.isArray(data?.message)) message = data.message.join(", ");
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<UploadedImage>;
}

async function uploadImagesRequest(
  files: File[],
  retried = false,
): Promise<{ urls: string[]; files: UploadedImage[] }> {
  const body = new FormData();
  for (const f of files) body.append("files", f);
  const headers: Record<string, string> = {};
  if (tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;
  const res = await fetch(`${API_URL}/uploads/batch`, { method: "POST", headers, body });
  if (res.status === 401 && !retried) {
    const ok = await tryRefreshAccessToken();
    if (ok) return uploadImagesRequest(files, true);
  }
  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.message === "string") message = data.message;
      else if (Array.isArray(data?.message)) message = data.message.join(", ");
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<{ urls: string[]; files: UploadedImage[] }>;
}

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
  /** Internal: skip the single automatic refresh retry. */
  _retried?: boolean;
}

let refreshInFlight: Promise<boolean> | null = null;

/** Attempt a single shared token refresh. Returns true when a new access token is stored. */
async function tryRefreshAccessToken(): Promise<boolean> {
  const refresh = tokenStore.refresh;
  if (!refresh) return false;
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const tokens = await request<AuthTokens>("/auth/refresh", {
          method: "POST",
          body: { refreshToken: refresh },
          _retried: true,
        });
        tokenStore.set(tokens);
        return true;
      } catch {
        tokenStore.clear();
        return false;
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

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Transparent access-token refresh for authenticated calls.
  if (res.status === 401 && auth && !_retried) {
    const ok = await tryRefreshAccessToken();
    if (ok) {
      return request<T>(path, { ...options, _retried: true });
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
  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>("/auth/reset-password", { method: "POST", body: { token, password } }),
  /**
   * Create a free directory listing for the currently signed-in user
   * (no second account / password). Returns tokens when role is upgraded.
   */
  listBusiness: (data: {
    businessName: string;
    type: ProviderType;
    listingTier?: string;
    brandProfile?: BrandProfile;
    address?: BusinessAddress;
  }) =>
    request<AuthResponse & { provider: Provider }>("/auth/list-business", {
      method: "POST",
      body: data,
      auth: true,
    }),

  // --- users ---
  userByEmail: (email: string) =>
    request<UserProfile | null>(`/users/email/${encodeURIComponent(email)}`, { auth: true }),
  /** Authenticated image upload (JPEG/PNG/WebP/GIF, max 5 MB). */
  uploadImage: (file: File) => uploadImageRequest(file),

  /** Batch image upload (up to 8 files). */
  uploadImages: (files: File[]) => uploadImagesRequest(files),

  updateUser: (id: string, data: { fullName?: string; phone?: string; avatarUrl?: string }) =>
    request<UserProfile>(`/users/${id}`, { method: "PUT", body: data, auth: true }),

  // --- consents / health permissions ---
  myConsents: (activeOnly = false) =>
    request<ClientConsent[]>(`/consents/me${activeOnly ? "?activeOnly=true" : ""}`, {
      auth: true,
    }),
  myAccessAudit: () => request<AccessAuditEntry[]>("/consents/me/audit", { auth: true }),
  createConsent: (data: {
    consumerId: string;
    granteeId?: string;
    permissionType: string;
    scope?: Record<string, unknown>;
    expiresAt?: string;
  }) => request<ClientConsent>("/consents", { method: "POST", body: data, auth: true }),
  revokeConsent: (id: string) =>
    request<ClientConsent>(`/consents/${id}`, { method: "DELETE", auth: true }),

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
    roomId?: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    notes?: string;
    status?: BookingStatus;
  }) => request<Booking>("/bookings", { method: "POST", body: data, auth: true }),
  bookingsByConsumer: (consumerId: string) =>
    request<Booking[]>(`/bookings/consumer/${consumerId}`, { auth: true }),
  bookingsByProvider: (
    providerId: string,
    opts?: { from?: string; to?: string; professionalId?: string; roomId?: string },
  ) => {
    const q = new URLSearchParams();
    if (opts?.from) q.set("from", opts.from);
    if (opts?.to) q.set("to", opts.to);
    if (opts?.professionalId) q.set("professionalId", opts.professionalId);
    if (opts?.roomId) q.set("roomId", opts.roomId);
    const qs = q.toString();
    return request<Booking[]>(
      `/bookings/provider/${providerId}${qs ? `?${qs}` : ""}`,
      { auth: true },
    );
  },
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
  payBookingCounter: (bookingId: string, paymentMethod: string, posTransactionId?: string) =>
    request<Booking>(`/payments/pay-counter/${bookingId}`, {
      method: "POST",
      body: { paymentMethod, posTransactionId },
      auth: true,
    }),
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
  providerProfile: (id: string) =>
    request<ProviderProfileBundle>(`/providers/${encodeURIComponent(id)}/profile`),
  providerBySlug: (slug: string) =>
    request<Provider>(`/providers/slug/${encodeURIComponent(slug)}`),
  providerProfileBySlug: (slug: string) =>
    request<ProviderProfileBundle>(`/providers/slug/${encodeURIComponent(slug)}/profile`),
  /** Root vanity practice — only when admin-approved. */
  providerByVanity: (handle: string) =>
    request<Provider>(`/providers/vanity/${encodeURIComponent(handle)}`),
  providerProfileByVanity: (handle: string) =>
    request<ProviderProfileBundle>(`/providers/vanity/${encodeURIComponent(handle)}/profile`),
  updateProvider: (
    id: string,
    data: {
      businessName?: string;
      type?: ProviderType;
      brandProfile?: BrandProfile;
      address?: BusinessAddress;
      timezone?: string;
      listingTier?: string;
      registrationNumber?: string | null;
      licenceNumber?: string | null;
      healthAuthorities?: HealthAuthorityBadge[];
      vanityHandle?: string | null;
      requestVanity?: boolean;
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
  adjustInventory: (id: string, data: { quantity: number; type: "ADJUSTMENT" | "RESTOCK"; reason?: string }) =>
    request<unknown>(`/products/${id}/inventory`, { method: "POST", body: data, auth: true }),
  getInventoryTransactions: (id: string) =>
    request<unknown[]>(`/products/${id}/inventory`, { auth: true }),

  // --- orders ---
  createOrder: (data: {
    consumerId: string;
    items: { productId: string; quantity: number }[];
    shippingAddress?: BusinessAddress;
    notes?: string;
    paymentMethod?: string;
    posTransactionId?: string;
    status?: string;
    paymentStatus?: string;
  }) => request<Order>("/orders", { method: "POST", body: data, auth: true }),
  ordersByConsumer: (consumerId: string) =>
    request<Order[]>(`/orders/consumer/${consumerId}`, { auth: true }),
  ordersByProvider: (providerId: string) =>
    request<Order[]>(`/orders/provider/${providerId}`, { auth: true }),
  updateOrder: (id: string, data: { status?: OrderStatus; notes?: string; paymentStatus?: string; paymentMethod?: string; posTransactionId?: string }) =>
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
  payOrderCounter: (orderId: string, paymentMethod: string, posTransactionId?: string) =>
    request<Order>(`/payments/pay-order-counter/${orderId}`, {
      method: "POST",
      body: { paymentMethod, posTransactionId },
      auth: true,
    }),

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
  plansByProvider: (providerId: string) =>
    request<TreatmentPlan[]>(`/treatment-plans/provider/${providerId}`, { auth: true }),
  createPlan: (data: {
    consumerId: string;
    providerId: string;
    professionalId?: string;
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    phases?: unknown;
    status?: string;
    aiGenerated?: boolean;
  }) => request<TreatmentPlan>("/treatment-plans", { method: "POST", body: data, auth: true }),
  updatePlan: (
    id: string,
    data: {
      name?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      phases?: unknown;
      status?: string;
    },
  ) => request<TreatmentPlan>(`/treatment-plans/${id}`, { method: "PATCH", body: data, auth: true }),
  deletePlan: (id: string) =>
    request<void>(`/treatment-plans/${id}`, { method: "DELETE", auth: true }),

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
  professionals: () => request<Professional[]>("/professionals"),
  professional: (id: string) =>
    request<ProfessionalDetail>(`/professionals/${encodeURIComponent(id)}`),
  professionalBySlug: (slug: string) =>
    request<ProfessionalDetail>(`/professionals/slug/${encodeURIComponent(slug)}`),
  /** Namespaced handle — /ayur/anita, /yoga/maya, /pro/dr-sharma */
  professionalByHandle: (namespace: string, handle: string) =>
    request<ProfessionalDetail>(
      `/professionals/handle/${encodeURIComponent(namespace)}/${encodeURIComponent(handle)}`,
    ),
  /** Root vanity — only when admin-approved. */
  professionalByVanity: (handle: string) =>
    request<ProfessionalDetail>(`/professionals/vanity/${encodeURIComponent(handle)}`),
  professionalsByProvider: (providerId: string) =>
    request<Professional[]>(`/professionals/provider/${providerId}`, { auth: true }),
  publicProfessionalsByProvider: (providerId: string) =>
    request<Professional[]>(`/professionals/provider/${providerId}`),
  createProfessional: (data: {
    userId: string;
    providerId: string;
    title?: string;
    titleKind?: string;
    specializations?: string[];
    bio?: string;
    yearsExperience?: number;
    hourlyRate?: number;
  }) =>
    request<Professional>("/professionals", { method: "POST", body: data, auth: true }),
  updateProfessional: (
    id: string,
    data: {
      title?: string;
      titleKind?: string | null;
      handle?: string | null;
      handleNamespace?: string | null;
      vanityHandle?: string | null;
      requestVanity?: boolean;
      bio?: string;
      specializations?: string[];
      yearsExperience?: number;
      hourlyRate?: number;
      registrationNumber?: string | null;
      licenceNumber?: string | null;
      healthAuthorities?: HealthAuthorityBadge[];
      verificationDocuments?: Professional["verificationDocuments"];
    },
  ) => request<Professional>(`/professionals/${id}`, { method: "PUT", body: data, auth: true }),
  removeProfessional: (id: string) =>
    request<{ id: string; removed: boolean }>(`/professionals/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  // --- admin vanity ---
  adminVanityRequests: () =>
    request<
      {
        kind: "professional" | "provider";
        id: string;
        handle: string | null;
        status: string;
        requestedAt: string | null;
        reviewedAt: string | null;
        reviewNote: string | null;
        displayName: string;
        subtitle: string;
        pathPreview: string | null;
        namespacedPath: string | null;
      }[]
    >("/admin/vanity", { auth: true }),
  adminReviewVanity: (
    kind: "professional" | "provider",
    id: string,
    status: "approved" | "rejected" | "pending",
    note?: string,
  ) =>
    request<unknown>(`/admin/vanity/${kind}/${id}`, {
      method: "PUT",
      body: { status, note },
      auth: true,
    }),

  // --- quality control (rate / review / like / dislike) ---
  qualitySummary: (targetType: QualityTargetType, targetId: string) =>
    // Public route; send token when present so myReview / myReaction are included.
    request<QualitySummary>(
      `/quality/summary?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
      { auth: Boolean(tokenStore.access) },
    ),
  qualityReviews: (targetType: QualityTargetType, targetId: string, take = 20) =>
    request<QualityReview[]>(
      `/quality/reviews?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}&take=${take}`,
    ),
  upsertReview: (data: {
    targetType: QualityTargetType;
    targetId: string;
    rating: number;
    title?: string;
    body?: string;
  }) => request<QualityReview>("/quality/reviews", { method: "PUT", body: data, auth: true }),
  deleteReview: (targetType: QualityTargetType, targetId: string) =>
    request<{ deleted: boolean }>(
      `/quality/reviews/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`,
      { method: "DELETE", auth: true },
    ),
  setReaction: (data: {
    targetType: QualityTargetType;
    targetId: string;
    value: "like" | "dislike" | "none";
  }) => request<QualitySummary>("/quality/reactions", { method: "PUT", body: data, auth: true }),

  /** Report abuse or send a product suggestion (guests OK with email). */
  submitFeedback: (data: {
    kind: "abuse" | "suggestion";
    category: string;
    message: string;
    targetType?: string;
    targetId?: string;
    targetLabel?: string;
    pageUrl?: string;
    contactEmail?: string;
    contactName?: string;
  }) =>
    request<{
      id: string;
      kind: string;
      status: string;
      category?: string;
      createdAt?: string;
      duplicate?: boolean;
    }>("/quality/feedback", {
      method: "POST",
      body: data,
      auth: Boolean(tokenStore.access),
    }),

  adminFeedback: (params?: { status?: string; kind?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.kind) q.set("kind", params.kind);
    const qs = q.toString();
    return request<FeedbackReportRow[]>(`/quality/feedback${qs ? `?${qs}` : ""}`, {
      auth: true,
    });
  },

  adminFeedbackCounts: () =>
    request<FeedbackCounts>("/quality/feedback/counts", { auth: true }),

  adminUpdateFeedback: (
    id: string,
    data: { status: "open" | "reviewing" | "resolved" | "dismissed"; adminNote?: string },
  ) =>
    request<FeedbackReportRow>(`/quality/feedback/${id}`, {
      method: "PUT",
      body: data,
      auth: true,
    }),

  // --- crm ---
  crmClients: (providerId: string) =>
    request<ClientRecord[]>(`/crm/provider/${providerId}`, { auth: true }),
  crmClientDetail: (providerId: string, consumerId: string) =>
    request<ClientRecord>(`/crm/provider/${providerId}/client/${consumerId}`, { auth: true }),
  updateCrmClient: (
    providerId: string,
    consumerId: string,
    data: { tags?: string[]; customFields?: unknown; status?: string },
  ) =>
    request<ClientRecord>(`/crm/provider/${providerId}/client/${consumerId}`, {
      method: "PUT",
      body: data,
      auth: true,
    }),
  addCrmClientNote: (providerId: string, consumerId: string, data: { note: string }) =>
    request<ClientNote>(`/crm/provider/${providerId}/client/${consumerId}/notes`, {
      method: "POST",
      body: data,
      auth: true,
    }),
  deleteCrmClientNote: (noteId: string) =>
    request<unknown>(`/crm/notes/${noteId}`, { method: "DELETE", auth: true }),
  sendCrmCampaign: (providerId: string, data: { subject: string; body: string }) =>
    request<{ sentCount: number; platform: string }>(`/crm/provider/${providerId}/campaign`, {
      method: "POST",
      body: data,
      auth: true,
    }),
};

export type FeedbackCounts = {
  open: number;
  reviewing: number;
  abuseOpen: number;
  suggestionOpen: number;
  total: number;
};

export type FeedbackReportRow = {
  id: string;
  kind: string;
  category: string;
  message: string;
  targetType?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  pageUrl?: string | null;
  userId?: string | null;
  contactEmail?: string | null;
  contactName?: string | null;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  reporter?: { id: string; fullName: string | null; email: string } | null;
};

export type QualityTargetType =
  | "provider"
  | "professional"
  | "service"
  | "product"
  | "retreat"
  | "offer";

export type QualitySummary = {
  targetType: string;
  targetId: string;
  rating: number;
  reviewCount: number;
  likeCount: number;
  dislikeCount: number;
  stars: Record<string, number>;
  myReview: {
    id: string;
    rating: number;
    title?: string | null;
    body?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  myReaction: "like" | "dislike" | null;
};

export type QualityReview = {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
};

export function formatMoney(value: string | number | null | undefined, currency = "AUD"): string {
  const n = Number(value ?? 0);
  // Whole amounts stay clean ($45); fractional amounts show cents ($0.05, $2.80).
  const fractionDigits = Number.isInteger(n) ? 0 : 2;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}
