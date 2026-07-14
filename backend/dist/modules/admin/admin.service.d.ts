import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    overview(): Promise<{
        users: any;
        consumers: any;
        providers: any;
        professionals: any;
        services: any;
        packages: any;
        bookings: any;
        products: any;
        orders: any;
        pendingVerifications: any;
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
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
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
