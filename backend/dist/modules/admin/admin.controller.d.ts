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
    setVerification(id: string, dto: SetVerificationDto): Promise<{
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
    bookings(): Promise<({
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
    users(): Promise<{
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
