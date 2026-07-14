import { OrderStatus } from '@prisma/client';
export declare class OrderItemInputDto {
    productId: string;
    quantity: number;
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
