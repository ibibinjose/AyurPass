/**
 * TanStack Query key factory — shared between dashboard and mobile.
 */
export const queryKeys = {
  all: ["ayurpass"] as const,

  health: () => [...queryKeys.all, "health"] as const,
  healthReady: () => [...queryKeys.all, "health", "ready"] as const,

  profile: () => [...queryKeys.all, "profile"] as const,

  healthProfile: (userId: string) => [...queryKeys.all, "health-profile", userId] as const,

  providers: {
    all: () => [...queryKeys.all, "providers"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.providers.all(), "list", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.providers.all(), "detail", id] as const,
  },

  professionals: {
    all: () => [...queryKeys.all, "professionals"] as const,
    byProvider: (providerId: string) =>
      [...queryKeys.professionals.all(), "provider", providerId] as const,
    detail: (id: string) => [...queryKeys.professionals.all(), "detail", id] as const,
  },

  services: {
    all: () => [...queryKeys.all, "services"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.services.all(), "list", filters ?? {}] as const,
    byProvider: (providerId: string) =>
      [...queryKeys.services.all(), "provider", providerId] as const,
    detail: (id: string) => [...queryKeys.services.all(), "detail", id] as const,
  },

  bookings: {
    all: () => [...queryKeys.all, "bookings"] as const,
    mine: () => [...queryKeys.bookings.all(), "mine"] as const,
    byConsumer: (userId: string) =>
      [...queryKeys.bookings.all(), "consumer", userId] as const,
    byProvider: (providerId: string) =>
      [...queryKeys.bookings.all(), "provider", providerId] as const,
    detail: (id: string) => [...queryKeys.bookings.all(), "detail", id] as const,
  },

  offers: {
    all: () => [...queryKeys.all, "offers"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.offers.all(), "list", filters ?? {}] as const,
  },

  products: {
    all: () => [...queryKeys.all, "products"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.products.all(), "list", filters ?? {}] as const,
    byProvider: (providerId: string) =>
      [...queryKeys.products.all(), "provider", providerId] as const,
    detail: (id: string) => [...queryKeys.products.all(), "detail", id] as const,
  },

  orders: {
    all: () => [...queryKeys.all, "orders"] as const,
    byProvider: (providerId: string) =>
      [...queryKeys.orders.all(), "provider", providerId] as const,
  },

  enquiries: {
    all: () => [...queryKeys.all, "enquiries"] as const,
    mine: () => [...queryKeys.enquiries.all(), "mine"] as const,
  },

  staff: {
    all: () => [...queryKeys.all, "staff"] as const,
    byProvider: (providerId: string) =>
      [...queryKeys.staff.all(), "provider", providerId] as const,
  },

  payments: {
    mode: () => [...queryKeys.all, "payments", "mode"] as const,
  },

  loyalty: () => [...queryKeys.all, "loyalty"] as const,

  admin: {
    overview: () => [...queryKeys.all, "admin", "overview"] as const,
    providers: () => [...queryKeys.all, "admin", "providers"] as const,
  },
} as const;
