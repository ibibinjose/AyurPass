import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { GiftCardsService } from '../gift-cards/gift-cards.service';
export interface RedemptionInput {
    giftCardCode?: string;
    redeemPoints?: number;
}
export declare class PaymentsService {
    private prisma;
    private loyalty;
    private giftCards;
    constructor(prisma: PrismaService, loyalty: LoyaltyService, giftCards: GiftCardsService);
    get mockMode(): boolean;
    private settle;
    checkout(bookingId: string, redemption?: RedemptionInput): Promise<{
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
            durationMinutes: number;
            currency: string;
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
    checkoutOrder(orderId: string, redemption?: RedemptionInput): Promise<{
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
            orderId: string;
            productId: string;
            quantity: number;
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
            orderId: string;
            productId: string;
            quantity: number;
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
