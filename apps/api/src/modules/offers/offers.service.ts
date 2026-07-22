import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfferDto, UpdateOfferDto } from '../../dtos/offer.dto';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  /** Public deals — active, within their date window, handpicked first. */
  async findPublic(discipline?: string) {
    const now = new Date();
    const where: Prisma.OfferWhereInput = {
      active: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    };
    if (discipline?.trim()) where.discipline = discipline.trim();
    return this.prisma.offer.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /** Admin view — every offer regardless of status. */
  findAllAdmin() {
    return this.prisma.offer.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  private toData(dto: CreateOfferDto | UpdateOfferDto) {
    return {
      title: dto.title,
      description: dto.description,
      discipline: dto.discipline,
      discountLabel: dto.discountLabel,
      code: dto.code,
      imageUrl: dto.imageUrl,
      ctaLabel: dto.ctaLabel,
      ctaUrl: dto.ctaUrl,
      featured: dto.featured,
      active: dto.active,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    };
  }

  create(dto: CreateOfferDto) {
    return this.prisma.offer.create({
      data: { ...this.toData(dto), title: dto.title },
    });
  }

  async update(id: string, dto: UpdateOfferDto) {
    await this.findOne(id);
    return this.prisma.offer.update({ where: { id }, data: this.toData(dto) });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.offer.delete({ where: { id } });
  }
}
