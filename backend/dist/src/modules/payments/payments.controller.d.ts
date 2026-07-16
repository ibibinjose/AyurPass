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
            code: string;
            createdAt: Date;
            name: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            professionalId: string | null;
            currency: string;
            durationMinutes: number;
            imageUrl: string | null;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        room: {
            id: string;
            createdAt: Date;
            name: string;
            description: string | null;
            providerId: string;
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
    refund(bookingId: string): Promise<{
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
            currency: string;
            durationMinutes: number;
            imageUrl: string | null;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        };
        room: {
            id: string;
            createdAt: Date;
            name: string;
            description: string | null;
            providerId: string;
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
    checkoutOrder(orderId: string, body?: RedemptionDto): Promise<{
        items: ({
            product: {
                id: string;
                code: string;
                createdAt: Date;
                name: string;
                category: string | null;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                inventoryQuantity: number | null;
                doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
                images: import("@prisma/client/runtime/library").JsonValue | null;
                providerId: string;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            orderId: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        providerId: string;
        consumerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        notes: string | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    refundOrder(orderId: string): Promise<{
        items: ({
            product: {
                id: string;
                code: string;
                createdAt: Date;
                name: string;
                category: string | null;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                inventoryQuantity: number | null;
                doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
                images: import("@prisma/client/runtime/library").JsonValue | null;
                providerId: string;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            orderId: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        providerId: string;
        consumerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        notes: string | null;
        paymentIntentId: string | null;
        paymentStatus: string;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
