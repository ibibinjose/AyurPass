import { AdminService } from './admin.service';
export declare class SetVerificationDto {
    status: string;
}
export declare class AdminController {
    private readonly service;
    constructor(service: AdminService);
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
    providers(): Promise<({
        user: {
            id: string;
            createdAt: Date;
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        _count: {
            professionals: number;
            services: number;
            bookings: number;
            rooms: number;
        };
    } & {
        id: string;
        code: string;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        listingTier: string;
        verificationStatus: string;
        createdAt: Date;
    })[]>;
    setVerification(id: string, dto: SetVerificationDto): Promise<{
        user: {
            id: string;
            createdAt: Date;
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        code: string;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        listingTier: string;
        verificationStatus: string;
        createdAt: Date;
    }>;
    bookings(): Promise<({
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
        id: string;
        timezone: string | null;
        createdAt: Date;
        providerId: string;
        consumerId: string;
        serviceId: string;
        professionalId: string | null;
        roomId: string | null;
        startTime: Date;
        endTime: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    users(): Promise<{
        provider: {
            id: string;
            businessName: string;
        } | null;
        id: string;
        createdAt: Date;
        email: string;
        fullName: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
}
