export type {
  Role,
  ProviderType,
  BookingStatus,
  ServiceCategory,
  PaymentStatus,
  User,
  Consumer,
  BrandProfile,
  BrandSocialLinks,
  SocialPlatform,
  SocialCustomLink,
  BusinessAddress,
  Provider,
  HealthAuthorityBadge,
  AuthTokens,
  AuthResponse,
  JobListing,
  JobApplication,
  EmploymentType,
  JobStatus,
  ApplicationStatus,
  Offer,
  PaymentCheckout,
  PaymentModeConfig,
  StripeConnectStatus,
  EventCategory,
  EventStatus,
  TicketStatus,
  WellnessEvent,
  EventTicket,
  WellnessPass,
} from "@ayurpass/shared";

import type {
  Booking as SharedBooking,
  BusinessAddress,
  HealthProfile as SharedHealthProfile,
  LoyaltySummary as SharedLoyaltySummary,
  PaymentCheckout,
  PaymentStatus,
  Professional as SharedProfessional,
  RegisterPayload as SharedRegisterPayload,
  Room,
  Service,
  User,
  WellnessPackage as SharedWellnessPackage,
} from "@ayurpass/shared";

export interface Professional extends SharedProfessional {
  doshaExpertise?: Record<string, unknown> | null;
  certifications?: unknown;
  availabilityPreferences?: unknown;
  updatedAt: string;
}

/** Full public profile returned by GET /professionals/slug/:slug */
export interface ProfessionalDetail extends Professional {
  services?: Service[];
  provider?: import("@ayurpass/shared").Provider;
  user?: Pick<User, "id" | "fullName" | "email" | "phone" | "avatarUrl">;
}

export interface ProviderProfileBundle {
  provider: import("@ayurpass/shared").Provider;
  services: Service[];
  products: Product[];
  retreats: Retreat[];
  team: Professional[];
}

/** User as returned by GET /auth/profile — includes linked profiles. */
export interface UserProfile extends User {
  consumer?: import("@ayurpass/shared").Consumer | null;
  provider?: import("@ayurpass/shared").Provider | null;
  professional?: (Professional & { provider?: import("@ayurpass/shared").Provider }) | null;
}

export type { Service, Room };

export interface Booking extends SharedBooking {
  platformCommission?: string | number | null;
  providerPayout?: string | number | null;
  giftCardRedeemed?: string | number;
  pointsRedeemed?: number;
  room?: Pick<Room, "id" | "name" | "capacity" | "hourlyCost"> | null;
  consumer?: {
    userId: string;
    user?: { id: string; fullName?: string | null; email?: string };
  } | null;
  paymentMethod?: string | null;
  posTransactionId?: string | null;
}

export interface WellnessPackage extends SharedWellnessPackage {
  includedServices?: unknown;
  includedProducts?: unknown;
  doshaFocus?: Record<string, unknown> | null;
}

export interface TreatmentPlanPhase {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  durationDays?: number;
  focus?: string;
  therapies?: string[];
  lifestyle?: string[];
  diet?: string[];
  notes?: string;
  [key: string]: unknown;
}

export interface TreatmentPlan {
  id: string;
  consumerId: string;
  professionalId?: string | null;
  providerId: string;
  name?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  phases?: TreatmentPlanPhase[] | unknown;
  status: string;
  aiGenerated: boolean;
  createdAt: string;
  provider?: {
    id: string;
    businessName: string;
    type?: string;
    slug?: string | null;
    brandProfile?: { logoUrl?: string } | null;
  } | null;
  professional?: {
    id: string;
    title?: string | null;
    titleKind?: string | null;
    slug?: string | null;
    handle?: string | null;
    handleNamespace?: string | null;
    user?: { id: string; fullName?: string | null; avatarUrl?: string | null } | null;
  } | null;
  consumer?: {
    userId: string;
    user?: {
      id: string;
      fullName?: string | null;
      email?: string | null;
      avatarUrl?: string | null;
    } | null;
  } | null;
}

export interface HealthProfile extends SharedHealthProfile {
  questionnaireResponses?: unknown;
  currentImbalances?: unknown;
}

export interface Product {
  id: string;
  code?: string;
  providerId: string;
  name: string;
  category?: string | null;
  description?: string | null;
  price: string | number | null;
  inventoryQuantity?: number | null;
  images?: string[] | null;
  createdAt: string;
  provider?: Pick<
    import("@ayurpass/shared").Provider,
    "id" | "code" | "businessName" | "type" | "verificationStatus" | "brandProfile" | "currency"
  >;
}

export type OrderStatus = "PENDING" | "PAID" | "FULFILLED" | "CANCELLED" | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  product?: Pick<Product, "id" | "name" | "category">;
}

export interface BookingCheckout extends Booking {
  payment?: PaymentCheckout;
}

export interface OrderCheckout extends Order {
  payment?: PaymentCheckout;
}

export interface Order {
  id: string;
  consumerId: string;
  providerId: string;
  status: OrderStatus;
  subtotal: string | number;
  taxAmount?: string | number | null;
  taxRate?: string | number | null;
  taxName?: string | null;
  taxExclusive?: boolean | null;
  platformCommission?: string | number | null;
  providerPayout?: string | number | null;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string | null;
  paymentMethod?: string | null;
  posTransactionId?: string | null;
  giftCardRedeemed?: string | number;
  pointsRedeemed?: number;
  pointsEarned?: number;
  shippingAddress?: BusinessAddress | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
  provider?: Pick<import("@ayurpass/shared").Provider, "id" | "businessName" | "type">;
  consumer?: { userId: string; user?: { id: string; fullName?: string | null; email?: string } };
}

export interface Channel {
  type: string;
  name: string;
  description: string;
  connectable: boolean;
  status: "connected" | "disconnected" | "active";
  integrationId: string | null;
  externalAccountId: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  mock: boolean;
}

export interface SyncReport {
  integrationId: string;
  type: string;
  syncedAt: string;
  report: {
    catalogItemsPushed: number;
    inventoryCountsPulled: number;
    appointmentsMirrored: number;
  };
  mock: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  type: "EARN" | "REDEEM" | "ADJUST";
  points: number;
  reason: string;
  createdAt: string;
}

export interface LoyaltySummary extends SharedLoyaltySummary {
  pointRedemptionValue: number;
  transactions: LoyaltyTransaction[];
}

export interface GiftCardTransaction {
  id: string;
  type: "ISSUE" | "REDEEM" | "REFUND";
  amount: string | number;
  reason?: string | null;
  createdAt: string;
}

export interface GiftCard {
  id: string;
  code: string;
  initialBalance: string | number;
  balance: string | number;
  status: "active" | "depleted" | "void";
  recipientEmail?: string | null;
  message?: string | null;
  createdAt: string;
  transactions?: GiftCardTransaction[];
}

export interface GiftCardLookup {
  code: string;
  balance: string | number;
  status: "active" | "depleted" | "void";
}

export interface AdminOverview {
  users: number;
  consumers: number;
  providers: number;
  professionals: number;
  services: number;
  packages: number;
  bookings: number;
  products: number;
  orders: number;
  pendingVerifications: number;
  grossVolume: string | number;
  platformRevenue: string | number;
  paidVolume: string | number;
  giftCards: number;
  giftCardOutstanding: string | number;
  pointsOutstanding: number;
  jobs?: number;
  jobApplications?: number;
}

export interface AdminProvider extends Omit<import("@ayurpass/shared").Provider, "_count"> {
  user?: User | null;
  _count: { professionals: number; services: number; bookings: number; rooms: number };
}

export interface RegisterPayload extends SharedRegisterPayload {
  businessName?: string;
  providerType?: import("@ayurpass/shared").ProviderType;
  /** "FREE_LISTING" for directory-only provider signups. */
  listingTier?: string;
  title?: string;
  specializations?: string[];
  bio?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

/** A lead captured from a provider's public listing page. */
export interface Enquiry {
  id: string;
  providerId: string;
  retreatId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
  /** Present on the provider inbox — which retreat the lead is about, if any. */
  retreat?: { title: string; slug: string } | null;
}

export type RetreatCategory =
  | "YOGA_RETREAT"
  | "YOGA_TEACHER_TRAINING"
  | "MEDITATION_RETREAT"
  | "AYURVEDA_PANCHAKARMA"
  | "DETOX_CLEANSE"
  | "SPA_WELLNESS"
  | "FITNESS_ADVENTURE"
  | "SILENT_RETREAT"
  | "WOMENS_RETREAT"
  | "HEALING_RETREAT"
  | "NUTRITION_DETOX";

/** A dated, multi-day retreat or training program in the /retreats directory. */
export interface Retreat {
  id: string;
  slug: string;
  providerId: string;
  title: string;
  category: RetreatCategory;
  summary?: string | null;
  description?: string | null;
  city?: string | null;
  country?: string | null;
  address?: BusinessAddress | null;
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number | null;
  priceFrom?: string | number | null;
  currency: string;
  capacity?: number | null;
  skillLevel?: string | null;
  images?: string[] | null;
  highlights?: string[] | null;
  inclusions?: string[] | null;
  externalBookingUrl?: string | null;
  featured: boolean;
  verificationStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  provider?: Pick<
    import("@ayurpass/shared").Provider,
    "id" | "code" | "businessName" | "type" | "verificationStatus" | "brandProfile"
  >;
}

/** Health-data permission types granted via ClientConsent. */
export type PermissionType =
  | "view_health_profile"
  | "view_dosha_history"
  | "view_treatment_plans"
  | "edit_notes"
  | "full_health_access";

export type ConsentEffectiveStatus = "active" | "revoked" | "expired";

export interface ConsentGrantee {
  id: string;
  kind: "provider" | "professional" | "unknown";
  name: string;
  title?: string | null;
}

/** Consent row returned by GET /consents/me (enriched with grantee). */
export interface ClientConsent {
  id: string;
  consumerId: string;
  granteeId?: string | null;
  permissionType: string;
  scope?: {
    bookingId?: string;
    dataCategories?: string[];
    [key: string]: unknown;
  } | null;
  expiresAt?: string | null;
  status: string;
  createdAt: string;
  grantee?: ConsentGrantee | null;
  isExpired: boolean;
  effectiveStatus: ConsentEffectiveStatus;
}

export interface AccessAuditEntry {
  id: string | number;
  consumerId?: string | null;
  accessorId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  purpose?: string | null;
  timestamp: string;
  ipAddress?: string | null;
}

export interface OfferInput {
  title: string;
  description?: string;
  discipline?: string;
  discountLabel?: string;
  code?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  featured?: boolean;
  active?: boolean;
  startDate?: string;
  endDate?: string;
}

/** Payload for creating/updating a retreat from the provider dashboard. */
export interface RetreatInput {
  title: string;
  category: RetreatCategory;
  summary?: string;
  description?: string;
  city?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  priceFrom?: number;
  currency?: string;
  capacity?: number;
  skillLevel?: string;
  images?: string[];
  highlights?: string[];
  inclusions?: string[];
  externalBookingUrl?: string;
  status?: string;
}

export interface ClientNote {
  id: string;
  clientRecordId: string;
  authorId?: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRecord {
  id: string;
  providerId: string;
  consumerId: string;
  tags?: string[];
  status?: string;
  createdAt: string;
  updatedAt: string;
  consumer?: {
    userId: string;
    user?: {
      id: string;
      fullName?: string | null;
      email: string;
      phone?: string | null;
      avatarUrl?: string | null;
    };
  };
  notes?: ClientNote[];
  bookings?: Booking[];
  orders?: Order[];
  bookingsCount?: number;
  ordersCount?: number;
}

// --- Staff ---

export type StaffRole = "OWNER" | "MANAGER" | "RECEPTIONIST" | "PRACTITIONER";
export type StaffInviteStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "REVOKED";

export interface StaffMember {
  id: string;
  providerId: string;
  userId?: string | null;
  role: StaffRole;
  displayName?: string | null;
  permissions?: Record<string, boolean> | null;
  effectivePermissions: Record<string, boolean>;
  inviteEmail?: string | null;
  inviteStatus: StaffInviteStatus;
  invitedAt: string;
  acceptedAt?: string | null;
  user?: {
    id: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    role?: string;
  } | null;
}

export interface StaffMembershipSummary {
  id: string;
  role: StaffRole;
  displayName?: string | null;
  effectivePermissions: Record<string, boolean>;
  provider: {
    id: string;
    businessName: string;
    slug?: string | null;
    type: string;
    brandProfile?: Record<string, unknown> | null;
  };
}
