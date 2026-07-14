import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from '../../dtos/order.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrder(data: CreateOrderDto): Promise<any>;
    findByConsumer(consumerId: string): Promise<any>;
    findByProvider(providerId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    updateOrder(id: string, data: UpdateOrderDto): Promise<any>;
}
