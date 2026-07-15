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
        user: {
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            createdAt: Date;
        } | null;
        _count: {
            bookings: number;
            services: number;
            professionals: number;
            rooms: number;
        };
    } & {
        id: string;
        createdAt: Date;
        timezone: string | null;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        verificationStatus: string;
    })[]>;
    setVerification(providerId: string, status: string): Promise<{
        user: {
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            createdAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        timezone: string | null;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        verificationStatus: string;
    }>;
    listBookings(): Promise<({
        consumer: {
            user: {
                email: string;
                fullName: string | null;
                id: string;
            };
            userId: string;
        };
        provider: {
            id: string;
            businessName: string;
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
        id: string;
        createdAt: Date;
        consumerId: string;
        serviceId: string;
        professionalId: string | null;
        providerId: string;
        startTime: Date;
        endTime: Date;
        timezone: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        roomId: string | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
    })[]>;
    listUsers(): Promise<{
        provider: {
            id: string;
            businessName: string;
        } | null;
        email: string;
        fullName: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        createdAt: Date;
    }[]>;
}
