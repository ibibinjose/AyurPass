/** Canonical API contract types shared by web and mobile clients. */

export type Role = "CONSUMER" | "PROFESSIONAL" | "PROVIDER_ADMIN" | "PLATFORM_ADMIN";

export type ProviderType =
  | "AYURVEDA_CLINIC"
  | "AYURVEDA_RESORT"
  | "PANCHAKARMA_CENTER"
  | "WELLNESS_RETREAT"
  | "YOGA_STUDIO"
  | "LUXURY_SPA"
  | "MEDITATION_CENTER"
  | "HEALTH_CLUB"
  | "NUTRITIONIST"
  | "COACHING"
  | "WELLNESS_KITCHEN"
  | "HYBRID";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type ServiceCategory =
  | "AYURVEDA"
  | "YOGA"
  | "SPA"
  | "MEDITATION"
  | "FITNESS"
  | "NUTRITION"
  | "COACHING"
  | "CONSULTATION"
  | "PACKAGE"
  | "COOKING";

/** Short-form wellness events (workshops, cooking classes, open days…). */
export type EventCategory =
  | "AYURVEDA"
  | "YOGA"
  | "SPA"
  | "MEDITATION"
  | "FITNESS"
  | "NUTRITION"
  | "COACHING"
  | "COOKING_CLASS"
  | "SOUND_HEALING"
  | "COMMUNITY"
  | "WORKSHOP"
  | "OPEN_DAY"
  | "RETREAT_PREVIEW"
  | "OTHER";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type TicketStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CANCELLED"
  | "REFUNDED"
  | "NO_SHOW"
  | "WAITLISTED";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  role: Role;
  fullName?: string | null;
  avatarUrl?: string | null;
  /** Set when the user has confirmed their email. Null = pending verification. */
  emailVerifiedAt?: string | null;
  createdAt: string;
}

export interface Consumer {
  userId: string;
  code?: string;
  prakritiPrimary?: string | null;
  prakritiScores?: Record<string, number> | null;
  preferences?: Record<string, unknown> | null;
}

/**
 * Local health-authority / professional-body approval mark
 * (e.g. AAA Australia, AHPRA, NMC India, CQC UK, custom).
 */
export interface HealthAuthorityBadge {
  /** Short code shown on chips — AAA, AHPRA, NMC, etc. */
  code: string;
  /** Full authority name */
  name: string;
  /** ISO country or region code — AU, IN, UK, US, NZ… */
  region?: string;
  /** Membership / registration id with that authority */
  registrationNumber?: string;
  /** Public directory URL for verification */
  profileUrl?: string;
  /** Platform or authority has confirmed the mark */
  verified?: boolean;
}

/** Named social / web profile on a practice brand. */
export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "x"
  | "linkedin"
  | "tiktok"
  | "threads"
  | "whatsapp"
  | "pinterest"
  | "google"
  | "tripadvisor"
  | "yelp"
  | "other";

export interface SocialCustomLink {
  label: string;
  url: string;
}

export interface BrandSocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  x?: string;
  linkedin?: string;
  tiktok?: string;
  threads?: string;
  whatsapp?: string;
  pinterest?: string;
  google?: string;
  tripadvisor?: string;
  yelp?: string;
  /** Free-form extra links (label + url). */
  custom?: SocialCustomLink[];
}

export interface BrandProfile {
  about?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  openingHours?: string;
  /** Practice brand mark / logo — cards, profile header, share cards */
  logoUrl?: string | null;
  /** Wide cover / hero banner on the public practice page */
  coverImageUrl?: string | null;
  gallery?: string[];
  tags?: string[];
  amenities?: string[];
  socialLinks?: BrandSocialLinks;
  externalBookingUrl?: string;
  priceBand?: "$" | "$$" | "$$$" | "$$$$";
}

export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  /** Optional WGS84 coordinates for map / Near Me. */
  lat?: number | null;
  lng?: number | null;
}

export interface Provider {
  id: string;
  code?: string;
  /** Public vanity URL — /practice/:slug */
  slug?: string | null;
  /**
   * Root vanity handle (ayurpass.com/:handle) — only live when vanityStatus === "approved".
   * Requires platform admin approval to protect brands & celebrities.
   */
  vanityHandle?: string | null;
  vanityStatus?: "none" | "pending" | "approved" | "rejected" | string | null;
  vanityRequestedAt?: string | null;
  vanityReviewedAt?: string | null;
  vanityReviewNote?: string | null;
  userId?: string | null;
  businessName: string;
  type: ProviderType;
  brandProfile?: BrandProfile | null;
  address?: BusinessAddress | null;
  timezone?: string | null;
  /** ISO 4217 currency code — AUD, USD, GBP, INR, EUR, NZD, etc. */
  currency?: string;
  subscriptionTier?: string | null;
  listingTier?: string | null;
  verificationStatus: string;
  /** Business / clinic registration number */
  registrationNumber?: string | null;
  /** Operating licence / permit */
  licenceNumber?: string | null;
  /** Local health-authority approval marks */
  healthAuthorities?: HealthAuthorityBadge[] | null;
  /** Aggregated 1–5 star average */
  rating?: string | number | null;
  reviewCount?: number | null;
  likeCount?: number | null;
  dislikeCount?: number | null;
  createdAt: string;
  _count?: {
    professionals: number;
    services: number;
    products: number;
    packages: number;
    rooms: number;
  };
}

export interface Professional {
  id: string;
  code?: string;
  /** Legacy public URL — /me/:slug */
  slug?: string | null;
  /** Username segment for namespaced URLs — /ayur/:handle, /yoga/:handle, /pro/:handle */
  handle?: string | null;
  /** Namespace for handle path (ayur | yoga | pro | …) */
  handleNamespace?: string | null;
  /**
   * Root vanity (ayurpass.com/:handle) — admin-approved only.
   */
  vanityHandle?: string | null;
  vanityStatus?: "none" | "pending" | "approved" | "rejected" | string | null;
  vanityRequestedAt?: string | null;
  vanityReviewedAt?: string | null;
  vanityReviewNote?: string | null;
  userId: string;
  providerId: string;
  /** Free-text professional title (display) */
  title?: string | null;
  /** Structured title kind — Ayurvedic Doctor, Yoga Instructor, etc. */
  titleKind?: string | null;
  specializations: string[];
  languagesSpoken?: string[];
  bio?: string | null;
  yearsExperience?: number | null;
  hourlyRate?: string | number | null;
  rating: string | number;
  reviewCount: number;
  likeCount?: number | null;
  dislikeCount?: number | null;
  createdAt: string;
  registrationNumber?: string | null;
  licenceNumber?: string | null;
  healthAuthorities?: HealthAuthorityBadge[] | null;
  verificationDocuments?: {
    source?: string;
    externalProfileId?: number;
    profileUrl?: string;
    membership?: string | null;
  } | null;
  provider?: Pick<
    Provider,
    | "id"
    | "businessName"
    | "type"
    | "verificationStatus"
    | "address"
    | "registrationNumber"
    | "licenceNumber"
    | "healthAuthorities"
    | "slug"
    | "vanityHandle"
    | "vanityStatus"
    | "brandProfile"
  >;
  user?: Pick<User, "id" | "fullName" | "email" | "avatarUrl">;
}

export interface UserProfile extends User {
  consumer?: Consumer | null;
  provider?: Provider | null;
  professional?: (Professional & { provider?: Provider }) | null;
}

export interface Service {
  id: string;
  code?: string;
  providerId: string;
  professionalId?: string | null;
  category: ServiceCategory;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: string | number;
  currency: string;
  imageUrl?: string | null;
  isVirtual: boolean;
  maxParticipants: number;
  /** Denormalized service-level quality (not the practitioner's). */
  rating?: string | number | null;
  reviewCount?: number | null;
  likeCount?: number | null;
  dislikeCount?: number | null;
  createdAt: string;
  provider?: Pick<
    Provider,
    "id" | "code" | "businessName" | "type" | "verificationStatus" | "brandProfile"
  >;
  professional?: {
    id: string;
    title?: string | null;
    specializations: string[];
    rating: string | number;
    reviewCount: number;
    user?: { id: string; fullName?: string | null };
  } | null;
}

export interface Room {
  id: string;
  providerId: string;
  name: string;
  description?: string | null;
  capacity: number;
  hourlyCost?: string | number | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  consumerId: string;
  serviceId: string;
  professionalId?: string | null;
  providerId: string;
  roomId?: string | null;
  startTime: string;
  endTime: string;
  timezone?: string | null;
  status: BookingStatus;
  totalAmount?: string | number | null;
  taxAmount?: string | number | null;
  taxRate?: string | number | null;
  taxName?: string | null;
  taxExclusive?: boolean | null;
  paymentStatus: PaymentStatus;
  pointsEarned?: number;
  notes?: string | null;
  createdAt: string;
  service?: Service;
  provider?: Pick<Provider, "id" | "businessName" | "type">;
  professional?: {
    id: string;
    title?: string | null;
    user?: { id: string; fullName?: string | null };
  } | null;
}

export interface WellnessPackage {
  id: string;
  providerId: string;
  name: string;
  description?: string | null;
  totalPrice: string | number;
  durationDays?: number | null;
  isRecurring: boolean;
  createdAt: string;
  serviceId?: string | null;
  provider?: Pick<Provider, "id" | "businessName" | "type" | "verificationStatus">;
}

export interface HealthProfile {
  id: string;
  consumerId: string;
  vataScore?: string | number | null;
  pittaScore?: string | number | null;
  kaphaScore?: string | number | null;
  lastAssessment?: string | null;
  updatedAt: string;
}

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

export interface ClientConsent {
  id: string;
  consumerId: string;
  granteeId?: string | null;
  permissionType: string;
  scope?: Record<string, unknown> | null;
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

export interface LoyaltyTransaction {
  id: string;
  type: string;
  points: number;
  reason: string;
  createdAt: string;
}

export interface LoyaltyRewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  dollarValue: number;
  kind: "booking_credit" | "shop_credit" | "perk";
}

export interface LoyaltySummary {
  pointsBalance: number;
  lifetimePoints: number;
  pointsValue: number;
  pointRedemptionValue: number;
  tier: string;
  tierKey: string;
  nextTier: string | null;
  pointsToNextTier: number;
  transactions: LoyaltyTransaction[];
  catalog?: LoyaltyRewardItem[];
  earnRules?: { label: string; detail: string }[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  success: boolean;
  user?: any;
  tokens?: AuthTokens;
  needsEmailVerification?: boolean;
  emailVerificationSent?: boolean;
}

export type AuthResponseSimple = AuthTokens & { user: User };

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: Role;
  /** City / suburb for seekers (stored on consumer preferences). */
  city?: string;
  /** Country name (e.g. Australia). */
  country?: string;
  /** ISO 3166-1 alpha-2 (AU, IN, …). */
  countryCode?: string;
  lat?: number;
  lng?: number;
}

export interface PaymentCheckout {
  mock: boolean;
  clientSecret?: string;
  publishableKey?: string | null;
  paymentIntentId?: string;
}

export interface PaymentModeConfig {
  provider: string;
  mock: boolean;
  publishableKey: string | null;
  keysConfigured: boolean;
  webhookConfigured: boolean;
  connectEnabled: boolean;
  frontendUrl: string;
}

export interface StripeConnectStatus {
  mock: boolean;
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  accountId: string | null;
  country?: string;
  defaultCurrency?: string;
}

export interface BookingCheckout extends Booking {
  payment?: PaymentCheckout;
}

export interface Offer {
  id: string;
  title: string;
  description?: string | null;
  discipline?: string | null;
  discountLabel?: string | null;
  code?: string | null;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  featured: boolean;
  active: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "LOCUM" | "CASUAL";
export type JobStatus = "OPEN" | "CLOSED" | "DRAFT";
export type ApplicationStatus = "SUBMITTED" | "REVIEWING" | "SHORTLISTED" | "REJECTED" | "HIRED";

export interface JobListing {
  id: string;
  code?: string;
  providerId: string;
  provider?: Partial<Provider> | null;
  title: string;
  category: ServiceCategory;
  employmentType: EmploymentType;
  locationType: "on_site" | "hybrid" | "remote" | string;
  city?: string | null;
  country?: string | null;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  currency: string;
  experienceYears?: number | null;
  description: string;
  requirements?: string | null;
  status: JobStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  applicationCount?: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  job?: Partial<JobListing> | null;
  applicantUserId: string;
  applicantUser?: Partial<User> | null;
  fullName: string;
  email: string;
  phone?: string | null;
  coverNote?: string | null;
  resumeUrl?: string | null;
  experienceYears?: number | null;
  status: ApplicationStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Permanent seeker identity pass for Apple/Google Wallet + venue scan. */
export interface WellnessPass {
  id: string;
  consumerId: string;
  serialNumber: string;
  publicToken: string;
  status: string;
  holderName?: string | null;
  qrPayload?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WellnessEvent {
  id: string;
  code?: string;
  slug: string;
  providerId: string;
  hostProfessionalId?: string | null;
  title: string;
  summary?: string | null;
  description?: string | null;
  category: EventCategory;
  tags?: string[] | null;
  startTime: string;
  endTime: string;
  timezone?: string | null;
  isVirtual: boolean;
  meetingUrl?: string | null;
  venueName?: string | null;
  address?: BusinessAddress | null;
  capacity?: number | null;
  waitlistEnabled: boolean;
  price: string | number;
  currency: string;
  isFree: boolean;
  images?: string[] | null;
  coverImageUrl?: string | null;
  whatToBring?: string[] | null;
  inclusions?: string[] | null;
  skillLevel?: string | null;
  status: EventStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: Provider | null;
  _count?: { tickets?: number };
}

export interface EventTicket {
  id: string;
  code: string;
  eventId: string;
  consumerId: string;
  wellnessPassId?: string | null;
  status: TicketStatus;
  quantity: number;
  totalAmount: string | number;
  currency: string;
  paymentStatus: string;
  checkInToken: string;
  checkedInAt?: string | null;
  notes?: string | null;
  createdAt: string;
  event?: WellnessEvent | null;
  wellnessPass?: Pick<WellnessPass, "id" | "serialNumber" | "publicToken"> | null;
}