import { OrderStatus } from '@prisma/client';
export declare class OrderItemInputDto {
    productId: string;
    quantity: number;
}
export declare class OrderItemDto {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export declare class Order {
    id: string;
    consumerId: string;
    providerId: string;
    status: OrderStatus;
    subtotal: number;
    platformCommission?: number;
    providerPayout?: number;
    paymentStatus?: string;
    paymentIntentId?: string;
    giftCardRedeemed?: number;
    pointsRedeemed?: number;
    pointsEarned?: number;
    shippingAddress?: Record<string, unknown>;
    notes?: string;
    items: OrderItemDto[];
    createdAt: Date;
    updatedAt?: Date;
}
export declare class CreateOrderDto {
    consumerId: string;
    items: OrderItemInputDto[];
    shippingAddress?: Record<string, unknown>;
    notes?: string;
}
export declare class UpdateOrderDto {
    status?: OrderStatus;
    notes?: string;
}
export declare class OrderStatus {
    static readonly PENDING = "PENDING";
    static readonly PAID = "PAID";
    static readonly FULFILLED = "FULFILLED";
    static readonly CANCELLED = "CANCELLED";
    static readonly REFUNDED = "REFUNDED";
}
