/**
 * Shared API types — mirrors the backend contract (kept in sync with
 * frontend/src/lib/types.ts). When the `shared/` package lands, both apps
 * will import from there instead.
 */
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

export type ServiceCategory =
  | "AYURVEDA"
  | "YOGA"
  | "SPA"
  | "MEDITATION"
  | "FITNESS"
  | "COACHING"
  | "CONSULTATION"
  | "PACKAGE";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

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
  logoUrl?: string;
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
  code?: string;
  userId: string;
  providerId: string;
  title?: string | null;
  specializations: string[];
  bio?: string | null;
  yearsExperience?: number | null;
  hourlyRate?: string | number | null;
  rating: string | number;
  reviewCount: number;
  createdAt: string;
  provider?: Pick<Provider, "id" | "businessName" | "type">;
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

export interface LoyaltySummary {
  pointsBalance: number;
  lifetimePoints: number;
  pointsValue: number;
  tier: string;
  tierKey: string;
  nextTier: string | null;
  pointsToNextTier: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type AuthResponse = AuthTokens & { user: User };

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: Role;
}
