import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from '../../dtos/order.dto';
export declare class OrdersController {
    private readonly service;
    constructor(service: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<{
        items: ({
            product: {
                category: string | null;
                name: string;
                id: string;
            };
        } & {
            productId: string;
            quantity: number;
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
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
    findByConsumer(consumerId: string): Promise<({
        items: ({
            product: {
                category: string | null;
                name: string;
                id: string;
            };
        } & {
            productId: string;
            quantity: number;
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
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
    })[]>;
    findByProvider(providerId: string): Promise<({
        items: ({
            product: {
                category: string | null;
                name: string;
                id: string;
            };
        } & {
            productId: string;
            quantity: number;
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
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
    })[]>;
    findOne(id: string): Promise<({
        items: ({
            product: {
                category: string | null;
                name: string;
                id: string;
            };
        } & {
            productId: string;
            quantity: number;
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
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
    }) | null>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<{
        items: ({
            product: {
                category: string | null;
                name: string;
                id: string;
            };
        } & {
            productId: string;
            quantity: number;
            id: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
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
