import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from '../../dtos/booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto): Promise<{
        service: {
            id: string;
            createdAt: Date;
            professionalId: string | null;
            providerId: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            name: string;
            description: string | null;
            durationMinutes: number;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        professional: {
            id: string;
            title: string | null;
            user: {
                id: string;
                fullName: string | null;
            };
        } | null;
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        room: {
            id: string;
            name: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
    } & {
        id: string;
        startTime: Date;
        endTime: Date;
        timezone: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        notes: string | null;
        createdAt: Date;
        consumerId: string;
        serviceId: string;
        professionalId: string | null;
        providerId: string;
        roomId: string | null;
    }>;
    findByConsumer(consumerId: string): Promise<({
        service: {
            id: string;
            createdAt: Date;
            professionalId: string | null;
            providerId: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            name: string;
            description: string | null;
            durationMinutes: number;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        professional: {
            id: string;
            title: string | null;
            user: {
                id: string;
                fullName: string | null;
            };
        } | null;
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        room: {
            id: string;
            name: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
    } & {
        id: string;
        startTime: Date;
        endTime: Date;
        timezone: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        notes: string | null;
        createdAt: Date;
        consumerId: string;
        serviceId: string;
        professionalId: string | null;
        providerId: string;
        roomId: string | null;
    })[]>;
    findByProvider(providerId: string): Promise<({
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
            createdAt: Date;
            professionalId: string | null;
            providerId: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            name: string;
            description: string | null;
            durationMinutes: number;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        professional: {
            id: string;
            title: string | null;
            user: {
                id: string;
                fullName: string | null;
            };
        } | null;
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        room: {
            id: string;
            name: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
    } & {
        id: string;
        startTime: Date;
        endTime: Date;
        timezone: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        notes: string | null;
        createdAt: Date;
        consumerId: string;
        serviceId: string;
        professionalId: string | null;
        providerId: string;
        roomId: string | null;
    })[]>;
    findOne(id: string): Promise<({
        service: {
            id: string;
            createdAt: Date;
            professionalId: string | null;
            providerId: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            name: string;
            description: string | null;
            durationMinutes: number;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        professional: {
            id: string;
            title: string | null;
            user: {
                id: string;
                fullName: string | null;
            };
        } | null;
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        room: {
            id: string;
            name: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
    } & {
        id: string;
        startTime: Date;
        endTime: Date;
        timezone: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        notes: string | null;
        createdAt: Date;
        consumerId: string;
        serviceId: string;
        professionalId: string | null;
        providerId: string;
        roomId: string | null;
    }) | null>;
    update(id: string, updateBookingDto: UpdateBookingDto): Promise<{
        service: {
            id: string;
            createdAt: Date;
            professionalId: string | null;
            providerId: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            name: string;
            description: string | null;
            durationMinutes: number;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        professional: {
            id: string;
            title: string | null;
            user: {
                id: string;
                fullName: string | null;
            };
        } | null;
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        room: {
            id: string;
            name: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
    } & {
        id: string;
        startTime: Date;
        endTime: Date;
        timezone: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        notes: string | null;
        createdAt: Date;
        consumerId: string;
        serviceId: string;
        professionalId: string | null;
        providerId: string;
        roomId: string | null;
    }>;
}
