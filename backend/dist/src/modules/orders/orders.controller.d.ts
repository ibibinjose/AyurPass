import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from '../../dtos/order.dto';
export declare class OrdersController {
    private readonly service;
    constructor(service: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<{
        consumer: {
            user: {
                id: string;
                email: string;
                fullName: string | null;
            };
            userId: string;
        };
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        items: ({
            product: {
                name: string;
                id: string;
                category: string | null;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        consumerId: string;
        providerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentStatus: string;
        paymentIntentId: string | null;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        createdAt: Date;
    }>;
    findByConsumer(consumerId: string): Promise<({
        consumer: {
            user: {
                id: string;
                email: string;
                fullName: string | null;
            };
            userId: string;
        };
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        items: ({
            product: {
                name: string;
                id: string;
                category: string | null;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        consumerId: string;
        providerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentStatus: string;
        paymentIntentId: string | null;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        createdAt: Date;
    })[]>;
    findByProvider(providerId: string): Promise<({
        consumer: {
            user: {
                id: string;
                email: string;
                fullName: string | null;
            };
            userId: string;
        };
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        items: ({
            product: {
                name: string;
                id: string;
                category: string | null;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        consumerId: string;
        providerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentStatus: string;
        paymentIntentId: string | null;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        createdAt: Date;
    })[]>;
    findOne(id: string): Promise<({
        consumer: {
            user: {
                id: string;
                email: string;
                fullName: string | null;
            };
            userId: string;
        };
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        items: ({
            product: {
                name: string;
                id: string;
                category: string | null;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        consumerId: string;
        providerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentStatus: string;
        paymentIntentId: string | null;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        createdAt: Date;
    }) | null>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<{
        consumer: {
            user: {
                id: string;
                email: string;
                fullName: string | null;
            };
            userId: string;
        };
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
        };
        items: ({
            product: {
                name: string;
                id: string;
                category: string | null;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        consumerId: string;
        providerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        platformCommission: import("@prisma/client/runtime/library").Decimal | null;
        providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        paymentStatus: string;
        paymentIntentId: string | null;
        giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
        pointsRedeemed: number;
        pointsEarned: number;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        createdAt: Date;
    }>;
}
