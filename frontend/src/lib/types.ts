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
  | "COACHING"
  | "HYBRID";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  role: Role;
  fullName?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Consumer {
  userId: string;
  code?: string;
  prakritiPrimary?: string | null;
  prakritiScores?: Record<string, number> | null;
  preferences?: Record<string, unknown> | null;
}

export interface BrandProfile {
  about?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  openingHours?: string;
  /** Brand mark / logo — data URL or hosted URL, shown across the marketplace. */
  logoUrl?: string;
  /** Wide banner shown on the provider profile. */
  coverImageUrl?: string;
}

export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface Provider {
  id: string;
  code?: string;
  userId?: string | null;
  businessName: string;
  type: ProviderType;
  brandProfile?: BrandProfile | null;
  address?: BusinessAddress | null;
  timezone?: string | null;
  subscriptionTier?: string | null;
  verificationStatus: string;
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
  userId: string;
  providerId: string;
  title?: string | null;
  specializations: string[];
  bio?: string | null;
  yearsExperience?: number | null;
  hourlyRate?: string | number | null;
  rating: string | number;
  reviewCount: number;
  user?: User;
  provider?: Provider;
}

/** User as returned by GET /auth/profile — includes linked profiles. */
export interface UserProfile extends User {
  consumer?: Consumer | null;
  provider?: Provider | null;
  professional?: (Professional & { provider?: Provider }) | null;
}

export type ServiceCategory =
  | "AYURVEDA"
  | "YOGA"
  | "SPA"
  | "MEDITATION"
  | "FITNESS"
  | "COACHING"
  | "CONSULTATION"
  | "PACKAGE";

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
  createdAt: string;
  provider?: Pick<Provider, "id" | "code" | "businessName" | "type" | "verificationStatus" | "brandProfile">;
  professional?: {
    id: string;
    title?: string | null;
    specializations: string[];
    rating: string | number;
    reviewCount: number;
    user?: { id: string; fullName?: string | null };
  } | null;
}

export type PaymentStatus = "unpaid" | "paid" | "refunded";

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
  platformCommission?: string | number | null;
  providerPayout?: string | number | null;
  paymentStatus: PaymentStatus;
  giftCardRedeemed?: string | number;
  pointsRedeemed?: number;
  pointsEarned?: number;
  notes?: string | null;
  createdAt: string;
  room?: Pick<Room, "id" | "name" | "capacity" | "hourlyCost"> | null;
  service?: Service;
  professional?: {
    id: string;
    title?: string | null;
    user?: { id: string; fullName?: string | null };
  } | null;
  provider?: Pick<Provider, "id" | "businessName" | "type">;
  consumer?: {
    userId: string;
    user?: { id: string; fullName?: string | null; email?: string };
  } | null;
}

export interface WellnessPackage {
  id: string;
  providerId: string;
  name: string;
  description?: string | null;
  totalPrice: string | number;
  durationDays?: number | null;
  includedServices?: unknown;
  includedProducts?: unknown;
  doshaFocus?: Record<string, unknown> | null;
  isRecurring: boolean;
  createdAt: string;
  /** Linked bookable service (category PACKAGE), managed by the backend. */
  serviceId?: string | null;
  provider?: Pick<Provider, "id" | "businessName" | "type" | "verificationStatus">;
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
  phases?: unknown;
  status: string;
  aiGenerated: boolean;
  createdAt: string;
}

export interface HealthProfile {
  id: string;
  consumerId: string;
  vataScore?: string | number | null;
  pittaScore?: string | number | null;
  kaphaScore?: string | number | null;
  questionnaireResponses?: unknown;
  currentImbalances?: unknown;
  lastAssessment?: string | null;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type AuthResponse = AuthTokens & { user: User };

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
  provider?: Pick<Provider, "id" | "code" | "businessName" | "type" | "verificationStatus" | "brandProfile">;
}

export type OrderStatus = "PENDING" | "PAID" | "FULFILLED" | "CANCELLED" | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  product?: Pick<Product, "id" | "name" | "category">;
}

export interface Order {
  id: string;
  consumerId: string;
  providerId: string;
  status: OrderStatus;
  subtotal: string | number;
  platformCommission?: string | number | null;
  providerPayout?: string | number | null;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string | null;
  giftCardRedeemed?: string | number;
  pointsRedeemed?: number;
  pointsEarned?: number;
  shippingAddress?: BusinessAddress | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
  provider?: Pick<Provider, "id" | "businessName" | "type">;
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
}

export interface AdminProvider extends Omit<Provider, "_count"> {
  user?: User | null;
  _count: { professionals: number; services: number; bookings: number; rooms: number };
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: Role;
  businessName?: string;
  providerType?: ProviderType;
  title?: string;
  specializations?: string[];
  bio?: string;
}
