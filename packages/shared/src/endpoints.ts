/**
 * Canonical API path map — keep clients and docs aligned with Nest routes.
 * Paths are relative to the API base URL (no trailing slash on base).
 */
export const endpoints = {
  health: "/health",
  healthReady: "/health/ready",

  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    social: (provider: string) => `/auth/${provider}` as const,
  },

  profile: "/users/me",
  users: "/users",

  providers: "/providers",
  provider: (id: string) => `/providers/${id}` as const,
  professionals: "/professionals",
  professional: (id: string) => `/professionals/${id}` as const,

  services: "/services",
  service: (id: string) => `/services/${id}` as const,

  bookings: "/bookings",
  booking: (id: string) => `/bookings/${id}` as const,
  bookingCheckout: (id: string) => `/bookings/${id}/checkout` as const,

  products: "/products",
  product: (id: string) => `/products/${id}` as const,
  orders: "/orders",
  order: (id: string) => `/orders/${id}` as const,

  packages: "/packages",
  offers: "/offers",
  rooms: "/rooms",
  giftCards: "/gift-cards",
  consents: "/consents",
  healthProfiles: "/health-profiles",
  treatmentPlans: "/treatment-plans",
  loyalty: "/loyalty",

  payments: {
    config: "/payments/config",
    webhook: "/payments/webhook",
    connectStatus: "/payments/connect/status",
  },

  admin: {
    overview: "/admin/overview",
    providers: "/admin/providers",
  },

  uploads: "/uploads",
  uploadsBatch: "/uploads/batch",

  search: "/search",

  notifications: {
    devices: "/notifications/devices",
  },

  jobs: {
    list: "/jobs",
    detail: (id: string) => `/jobs/${id}` as const,
    apply: (id: string) => `/jobs/${id}/apply` as const,
    applications: (id: string) => `/jobs/${id}/applications` as const,
    providerJobs: (providerId: string) => `/providers/${providerId}/jobs` as const,
    myApplications: "/jobs/my-applications",
  },

  events: {
    list: "/events",
    mine: "/events/mine",
    myTickets: "/events/tickets/mine",
    detail: (id: string) => `/events/${id}` as const,
    bySlug: (slug: string) => `/events/slug/${slug}` as const,
    register: (id: string) => `/events/${id}/register` as const,
    tickets: (id: string) => `/events/${id}/tickets` as const,
  },

  wellnessPass: {
    me: "/wellness-pass/me",
    issue: "/wellness-pass/issue",
    apple: "/wellness-pass/wallet/apple",
    google: "/wellness-pass/wallet/google",
    scan: "/wellness-pass/scan",
  },
} as const;

export type EndpointTree = typeof endpoints;