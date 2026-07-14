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
    }>;
    listProviders(): Promise<({
        _count: {
            professionals: number;
            services: number;
            bookings: number;
            rooms: number;
        };
        user: {
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            createdAt: Date;
        } | null;
    } & {
        businessName: string;
        timezone: string | null;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        verificationStatus: string;
        id: string;
        userId: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        createdAt: Date;
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
        businessName: string;
        timezone: string | null;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        verificationStatus: string;
        id: string;
        userId: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        createdAt: Date;
    }>;
    listBookings(): Promise<({
        provider: {
            businessName: string;
            id: string;
        };
        consumer: {
            userId: string;
            user: {
                email: string;
                fullName: string | null;
                id: string;
            };
        };
        service: {
            category: import(".prisma/client").$Enums.ServiceCategory;
            name: string;
            id: string;
        };
        room: {
            name: string;
            id: string;
        } | null;
    } & {
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
        paymentStatus: string;
        id: string;
        createdAt: Date;
        paymentIntentId: string | null;
    })[]>;
    listUsers(): Promise<{
        email: string;
        fullName: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        provider: {
            businessName: string;
            id: string;
        } | null;
        id: string;
        createdAt: Date;
    }[]>;
}
