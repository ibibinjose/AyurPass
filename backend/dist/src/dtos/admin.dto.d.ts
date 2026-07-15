import { ProviderType } from '@prisma/client';
export declare class AdminOverview {
    totalUsers?: number;
    totalProviders?: number;
    totalBookings?: number;
    totalRevenue?: number;
    monthlyGrowth?: number;
    activeSubscriptions?: number;
    pendingVerifications?: number;
    avgRating?: number;
    recentActivity?: any[];
}
export declare class AdminProvider {
    id: string;
    code: string;
    businessName: string;
    type: ProviderType;
    userId?: string;
    brandProfile?: any;
    address?: any;
    timezone?: string;
    stripeAccountId?: string;
    subscriptionTier?: string;
    verificationStatus: string;
    createdAt: Date;
    isActive?: boolean;
    totalProfessionals?: number;
    totalServices?: number;
    totalBookings?: number;
    totalRevenue?: number;
}
