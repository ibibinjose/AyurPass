import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from '../../dtos/order.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrder(data: CreateOrderDto): Promise<{
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
        items: ({
            product: {
                id: string;
                name: string;
                category: string | null;
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
    findByConsumer(consumerId: string): Promise<({
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
        items: ({
            product: {
                id: string;
                name: string;
                category: string | null;
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
        items: ({
            product: {
                id: string;
                name: string;
                category: string | null;
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
    })[]>;
    findOne(id: string): Promise<({
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
        items: ({
            product: {
                id: string;
                name: string;
                category: string | null;
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
    }) | null>;
    updateOrder(id: string, data: UpdateOrderDto): Promise<{
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
        items: ({
            product: {
                id: string;
                name: string;
                category: string | null;
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
