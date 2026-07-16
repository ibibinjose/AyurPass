import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from '../../dtos/booking.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto, req: AuthedRequest): Promise<{
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        professional: {
            id: string;
            user: {
                id: string;
                fullName: string | null;
            };
            title: string | null;
        } | null;
        service: {
            id: string;
            code: string;
            createdAt: Date;
            name: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            professionalId: string | null;
            durationMinutes: number;
            currency: string;
            imageUrl: string | null;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        room: {
            id: string;
            name: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    }>;
    findByConsumer(consumerId: string, req: AuthedRequest): Promise<({
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        professional: {
            id: string;
            user: {
                id: string;
                fullName: string | null;
            };
            title: string | null;
        } | null;
        service: {
            id: string;
            code: string;
            createdAt: Date;
            name: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            professionalId: string | null;
            durationMinutes: number;
            currency: string;
            imageUrl: string | null;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        room: {
            id: string;
            name: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    findByProvider(providerId: string): Promise<({
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        consumer: {
            userId: string;
            user: {
                id: string;
                email: string;
                fullName: string | null;
            };
        };
        professional: {
            id: string;
            user: {
                id: string;
                fullName: string | null;
            };
            title: string | null;
        } | null;
        service: {
            id: string;
            code: string;
            createdAt: Date;
            name: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            professionalId: string | null;
            durationMinutes: number;
            currency: string;
            imageUrl: string | null;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        room: {
            id: string;
            name: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    findOne(id: string): Promise<({
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        professional: {
            id: string;
            user: {
                id: string;
                fullName: string | null;
            };
            title: string | null;
        } | null;
        service: {
            id: string;
            code: string;
            createdAt: Date;
            name: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            professionalId: string | null;
            durationMinutes: number;
            currency: string;
            imageUrl: string | null;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        room: {
            id: string;
            name: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    }) | null>;
    update(id: string, updateBookingDto: UpdateBookingDto): Promise<{
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        professional: {
            id: string;
            user: {
                id: string;
                fullName: string | null;
            };
            title: string | null;
        } | null;
        service: {
            id: string;
            code: string;
            createdAt: Date;
            name: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            professionalId: string | null;
            durationMinutes: number;
            currency: string;
            imageUrl: string | null;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        room: {
            id: string;
            name: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    }>;
}
