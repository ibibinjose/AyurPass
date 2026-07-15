import { PaymentsService } from './payments.service';
export declare class RedemptionDto {
    giftCardCode?: string;
    redeemPoints?: number;
}
export declare class PaymentsController {
    private readonly service;
    constructor(service: PaymentsService);
    mode(): {
        provider: string;
        mock: boolean;
    };
    checkout(bookingId: string, body?: RedemptionDto): Promise<{
        service: {
            id: string;
            createdAt: Date;
            name: string;
            professionalId: string | null;
            providerId: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            description: string | null;
            durationMinutes: number;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        room: {
            id: string;
            createdAt: Date;
            name: string;
            providerId: string;
            description: string | null;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    }>;
    refund(bookingId: string): Promise<{
        service: {
            id: string;
            createdAt: Date;
            name: string;
            professionalId: string | null;
            providerId: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            description: string | null;
            durationMinutes: number;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        room: {
            id: string;
            createdAt: Date;
            name: string;
            providerId: string;
            description: string | null;
            capacity: number;
            hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
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
    }>;
    checkoutOrder(orderId: string, body?: RedemptionDto): Promise<{
        items: ({
            product: {
                id: string;
                createdAt: Date;
                name: string;
                providerId: string;
                category: string | null;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                inventoryQuantity: number | null;
                doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        consumerId: string;
        providerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        notes: string | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    refundOrder(orderId: string): Promise<{
        items: ({
            product: {
                id: string;
                createdAt: Date;
                name: string;
                providerId: string;
                category: string | null;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                inventoryQuantity: number | null;
                doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        consumerId: string;
        providerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        notes: string | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
