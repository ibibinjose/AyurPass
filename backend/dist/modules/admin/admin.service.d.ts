import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    overview(): Promise<{
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
        grossVolume: number;
        platformRevenue: number;
        paidVolume: number;
        giftCards: number;
        giftCardOutstanding: number | import("@prisma/client/runtime/library").Decimal;
        pointsOutstanding: number;
    }>;
    listProviders(): Promise<({
        _count: {
            professionals: number;
            services: number;
            bookings: number;
            rooms: number;
        };
        user: {
            id: string;
            createdAt: Date;
            email: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            fullName: string | null;
        } | null;
    } & {
        verificationStatus: string;
        id: string;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        createdAt: Date;
    })[]>;
    setVerification(providerId: string, status: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            email: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            fullName: string | null;
        } | null;
    } & {
        verificationStatus: string;
        id: string;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        createdAt: Date;
    }>;
    listBookings(): Promise<({
        provider: {
            id: string;
            businessName: string;
        };
        consumer: {
            userId: string;
            user: {
                id: string;
                email: string;
                fullName: string | null;
            };
        };
        service: {
            id: string;
            name: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
        };
        room: {
            id: string;
            name: string;
        } | null;
    } & {
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        paymentStatus: string;
        id: string;
        timezone: string | null;
        createdAt: Date;
        consumerId: string;
        serviceId: string;
        professionalId: string | null;
        providerId: string;
        roomId: string | null;
        startTime: Date;
        endTime: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        paymentIntentId: string | null;
        notes: string | null;
    })[]>;
    listUsers(): Promise<{
        provider: {
            id: string;
            businessName: string;
        } | null;
        id: string;
        createdAt: Date;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        fullName: string | null;
    }[]>;
}
