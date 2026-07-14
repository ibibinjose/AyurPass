import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from '../../dtos/booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto): Promise<{
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            id: string;
        };
        professional: {
            title: string | null;
            id: string;
            user: {
                fullName: string | null;
                id: string;
            };
        } | null;
        service: {
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
            id: string;
            createdAt: Date;
        };
        room: {
            name: string;
            id: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    }>;
    findByConsumer(consumerId: string): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            id: string;
        };
        professional: {
            title: string | null;
            id: string;
            user: {
                fullName: string | null;
                id: string;
            };
        } | null;
        service: {
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
            id: string;
            createdAt: Date;
        };
        room: {
            name: string;
            id: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    findByProvider(providerId: string): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
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
        professional: {
            title: string | null;
            id: string;
            user: {
                fullName: string | null;
                id: string;
            };
        } | null;
        service: {
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
            id: string;
            createdAt: Date;
        };
        room: {
            name: string;
            id: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    findOne(id: string): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            id: string;
        };
        professional: {
            title: string | null;
            id: string;
            user: {
                fullName: string | null;
                id: string;
            };
        } | null;
        service: {
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
            id: string;
            createdAt: Date;
        };
        room: {
            name: string;
            id: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    }) | null>;
    update(id: string, updateBookingDto: UpdateBookingDto): Promise<{
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            id: string;
        };
        professional: {
            title: string | null;
            id: string;
            user: {
                fullName: string | null;
                id: string;
            };
        } | null;
        service: {
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
            id: string;
            createdAt: Date;
        };
        room: {
            name: string;
            id: string;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    }>;
}
