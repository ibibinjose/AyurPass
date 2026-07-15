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
        status: import(".prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        consumerId: string;
        serviceId: string;
        professionalId: string | null;
        providerId: string;
        roomId: string | null;
        startTime: Date;
        endTime: Date;
        timezone: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        notes: string | null;
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
        status: import(".prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        consumerId: string;
        serviceId: string;
        professionalId: string | null;
        providerId: string;
        roomId: string | null;
        startTime: Date;
        endTime: Date;
        timezone: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        notes: string | null;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        consumerId: string;
        providerId: string;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        notes: string | null;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        consumerId: string;
        providerId: string;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        notes: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
