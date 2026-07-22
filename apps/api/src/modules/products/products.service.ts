import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../../dtos/product.dto';

const PROVIDER_SELECT = {
  select: { id: true, code: true, businessName: true, type: true, verificationStatus: true, brandProfile: true },
} as const;

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: CreateProductDto) {
    return this.prisma.product.create({ data, include: { provider: PROVIDER_SELECT } });
  }

  async findAll(category?: string) {
    return this.prisma.product.findMany({
      where: category ? { category } : undefined,
      include: { provider: PROVIDER_SELECT },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProvider(providerId: string) {
    return this.prisma.product.findMany({
      where: { providerId },
      include: { provider: PROVIDER_SELECT },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { provider: PROVIDER_SELECT },
    });
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: { provider: PROVIDER_SELECT },
    });
  }

  async removeProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async adjustInventory(
    id: string,
    quantity: number,
    type: 'ADJUSTMENT' | 'RESTOCK' | 'RETURN' | 'SALE',
    reason?: string,
    userId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) throw new Error('Product not found');

      const currentQty = product.inventoryQuantity ?? 0;
      const newQty = currentQty + quantity;
      if (newQty < 0) {
        throw new Error('Stock quantity cannot be negative');
      }

      await tx.product.update({
        where: { id },
        data: { inventoryQuantity: newQty },
      });

      return tx.inventoryTransaction.create({
        data: {
          productId: id,
          type,
          quantity,
          reason: reason || 'Manual adjustment',
          userId,
        },
      });
    });
  }

  async getInventoryTransactions(productId: string) {
    return this.prisma.inventoryTransaction.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
