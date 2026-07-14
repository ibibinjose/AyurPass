import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from '../../dtos/order.dto';

/** Marketplace commission on product sales (docs: 10–15%). */
const PRODUCT_COMMISSION_RATE = 0.12;

const ORDER_INCLUDES = {
  items: { include: { product: { select: { id: true, name: true, category: true } } } },
  provider: { select: { id: true, businessName: true, type: true } },
  consumer: {
    select: { userId: true, user: { select: { id: true, fullName: true, email: true } } },
  },
} as const;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates the order atomically: validates stock, decrements inventory,
   * snapshots unit prices, and computes the marketplace split.
   * All items must belong to one provider (one order per shop, like Square).
   */
  async createOrder(data: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: data.items.map((i) => i.productId) } },
      });
      if (products.length !== data.items.length) {
        throw new NotFoundException('One or more products no longer exist');
      }

      const providerIds = new Set(products.map((p) => p.providerId));
      if (providerIds.size !== 1) {
        throw new BadRequestException('All items in an order must be from the same provider');
      }

      let subtotal = 0;
      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId)!;
        if (product.inventoryQuantity != null && product.inventoryQuantity < item.quantity) {
          throw new BadRequestException(`“${product.name}” has only ${product.inventoryQuantity} in stock`);
        }
        subtotal += Number(product.price ?? 0) * item.quantity;
        if (product.inventoryQuantity != null) {
          await tx.product.update({
            where: { id: product.id },
            data: { inventoryQuantity: { decrement: item.quantity } },
          });
        }
      }

      const platformCommission = Math.round(subtotal * PRODUCT_COMMISSION_RATE * 100) / 100;

      return tx.order.create({
        data: {
          consumerId: data.consumerId,
          providerId: products[0].providerId,
          subtotal,
          platformCommission,
          providerPayout: Math.round((subtotal - platformCommission) * 100) / 100,
          shippingAddress: data.shippingAddress as object | undefined,
          notes: data.notes,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: products.find((p) => p.id === item.productId)!.price ?? 0,
            })),
          },
        },
        include: ORDER_INCLUDES,
      });
    });
  }

  async findByConsumer(consumerId: string) {
    return this.prisma.order.findMany({
      where: { consumerId },
      include: ORDER_INCLUDES,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProvider(providerId: string) {
    return this.prisma.order.findMany({
      where: { providerId },
      include: ORDER_INCLUDES,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDES });
  }

  async updateOrder(id: string, data: UpdateOrderDto) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) throw new NotFoundException('Order not found');

    // Cancelling an order puts the stock back on the shelf.
    if (data.status === 'CANCELLED' && existing.status !== 'CANCELLED') {
      await this.prisma.$transaction(
        existing.items.map((item) =>
          this.prisma.product.update({
            where: { id: item.productId },
            data: { inventoryQuantity: { increment: item.quantity } },
          }),
        ),
      );
    }

    return this.prisma.order.update({ where: { id }, data, include: ORDER_INCLUDES });
  }
}
