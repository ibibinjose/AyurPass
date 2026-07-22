/**
 * TanStack Query key factory — shared between dashboard and mobile.
 */
export const queryKeys = {
  all: ["ayurpass"] as const,

  health: () => [...queryKeys.all, "health"] as const,
  healthReady: () => [...queryKeys.all, "health", "ready"] as const,

  profile: () => [...queryKeys.all, "profile"] as const,

  providers: {
    all: () => [...queryKeys.all, "providers"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.providers.all(), "list", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.providers.all(), "detail", id] as const,
  },

  professionals: {
    all: () => [...queryKeys.all, "professionals"] as const,
    detail: (id: string) => [...queryKeys.professionals.all(), "detail", id] as const,
  },

  services: {
    all: () => [...queryKeys.all, "services"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.services.all(), "list", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.services.all(), "detail", id] as const,
  },

  bookings: {
    all: () => [...queryKeys.all, "bookings"] as const,
    mine: () => [...queryKeys.bookings.all(), "mine"] as const,
    detail: (id: string) => [...queryKeys.bookings.all(), "detail", id] as const,
  },

  offers: {
    all: () => [...queryKeys.all, "offers"] as const,
    list: () => [...queryKeys.offers.all(), "list"] as const,
  },

  products: {
    all: () => [...queryKeys.all, "products"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.products.all(), "list", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.products.all(), "detail", id] as const,
  },

  loyalty: () => [...queryKeys.all, "loyalty"] as const,

  admin: {
    overview: () => [...queryKeys.all, "admin", "overview"] as const,
  },
} as const;
