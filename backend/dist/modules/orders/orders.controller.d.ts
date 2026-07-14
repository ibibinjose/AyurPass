import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from '../../dtos/order.dto';
export declare class OrdersController {
    private readonly service;
    constructor(service: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<any>;
    findByConsumer(consumerId: string): Promise<any>;
    findByProvider(providerId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<any>;
}
