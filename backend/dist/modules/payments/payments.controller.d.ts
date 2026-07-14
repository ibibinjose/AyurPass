import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly service;
    constructor(service: PaymentsService);
    mode(): {
        provider: string;
        mock: boolean;
    };
    checkout(bookingId: string): Promise<{
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
            providerId: string;
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
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
    refund(bookingId: string): Promise<{
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
            providerId: string;
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
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
    checkoutOrder(orderId: string): Promise<{
        items: ({
            product: {
                providerId: string;
                category: string | null;
                name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                id: string;
                createdAt: Date;
                inventoryQuantity: number | null;
                doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            productId: string;
            quantity: number;
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        consumerId: string;
        providerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        notes: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentStatus: string;
        id: string;
        createdAt: Date;
        paymentIntentId: string | null;
    }>;
    refundOrder(orderId: string): Promise<{
        items: ({
            product: {
                providerId: string;
                category: string | null;
                name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                id: string;
                createdAt: Date;
                inventoryQuantity: number | null;
                doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            productId: string;
            quantity: number;
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        consumerId: string;
        providerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        notes: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentStatus: string;
        id: string;
        createdAt: Date;
        paymentIntentId: string | null;
    }>;
}
