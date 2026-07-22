import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  phone: true,
  createdAt: true,
} as const;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /** Pending + recent root vanity requests (professionals + practices). */
  async listVanityRequests() {
    const [professionals, providers] = await Promise.all([
      this.prisma.professional.findMany({
        where: { vanityStatus: { in: ['pending', 'approved', 'rejected'] }, vanityHandle: { not: null } },
        include: {
          user: { select: SAFE_USER_SELECT },
          provider: { select: { id: true, businessName: true } },
        },
        orderBy: { vanityRequestedAt: 'desc' },
        take: 100,
      }),
      this.prisma.provider.findMany({
        where: { vanityStatus: { in: ['pending', 'approved', 'rejected'] }, vanityHandle: { not: null } },
        include: { user: { select: SAFE_USER_SELECT } },
        orderBy: { vanityRequestedAt: 'desc' },
        take: 100,
      }),
    ]);

    const rows = [
      ...professionals.map((p) => ({
        kind: 'professional' as const,
        id: p.id,
        handle: p.vanityHandle,
        status: p.vanityStatus,
        requestedAt: p.vanityRequestedAt,
        reviewedAt: p.vanityReviewedAt,
        reviewNote: p.vanityReviewNote,
        displayName: p.user?.fullName || p.title || p.handle || p.id,
        subtitle: p.titleKind || p.title || 'Practitioner',
        pathPreview: p.vanityHandle ? `/${p.vanityHandle}` : null,
        namespacedPath:
          p.handle && p.handleNamespace ? `/${p.handleNamespace}/${p.handle}` : p.slug ? `/me/${p.slug}` : null,
      })),
      ...providers.map((p) => ({
        kind: 'provider' as const,
        id: p.id,
        handle: p.vanityHandle,
        status: p.vanityStatus,
        requestedAt: p.vanityRequestedAt,
        reviewedAt: p.vanityReviewedAt,
        reviewNote: p.vanityReviewNote,
        displayName: p.businessName,
        subtitle: p.type,
        pathPreview: p.vanityHandle ? `/${p.vanityHandle}` : null,
        namespacedPath: p.slug ? `/practice/${p.slug}` : null,
      })),
    ];

    rows.sort((a, b) => {
      const ta = a.requestedAt ? new Date(a.requestedAt).getTime() : 0;
      const tb = b.requestedAt ? new Date(b.requestedAt).getTime() : 0;
      return tb - ta;
    });
    return rows;
  }

  async reviewVanity(
    kind: 'professional' | 'provider',
    id: string,
    status: 'approved' | 'rejected' | 'pending',
    note?: string,
  ) {
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      throw new BadRequestException('Invalid vanity status.');
    }
    const reviewedAt = new Date();
    const reviewNote = note?.trim().slice(0, 500) || null;

    if (kind === 'professional') {
      const row = await this.prisma.professional.findUnique({ where: { id } });
      if (!row) throw new NotFoundException('Professional not found');
      if (!row.vanityHandle && status === 'approved') {
        throw new BadRequestException('No vanity handle to approve.');
      }
      return this.prisma.professional.update({
        where: { id },
        data: {
          vanityStatus: status,
          vanityReviewedAt: reviewedAt,
          vanityReviewNote: reviewNote,
        },
        include: { user: { select: SAFE_USER_SELECT } },
      });
    }

    const row = await this.prisma.provider.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Provider not found');
    if (!row.vanityHandle && status === 'approved') {
      throw new BadRequestException('No vanity handle to approve.');
    }
    return this.prisma.provider.update({
      where: { id },
      data: {
        vanityStatus: status,
        vanityReviewedAt: reviewedAt,
        vanityReviewNote: reviewNote,
      },
      include: { user: { select: SAFE_USER_SELECT } },
    });
  }

  async overview() {
    const [users, consumers, providers, professionals, services, packages, bookings, products, orders, pendingVerifications, bookingRevenue, orderRevenue] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.consumer.count(),
        this.prisma.provider.count(),
        this.prisma.professional.count(),
        this.prisma.service.count(),
        this.prisma.package.count(),
        this.prisma.booking.count(),
        this.prisma.product.count(),
        this.prisma.order.count(),
        this.prisma.provider.count({ where: { verificationStatus: 'pending' } }),
        this.prisma.booking.aggregate({
          where: { status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
          _sum: { totalAmount: true, platformCommission: true },
        }),
        this.prisma.order.aggregate({
          where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
          _sum: { subtotal: true, platformCommission: true },
        }),
      ]);

    const [paidBookings, paidOrders, giftCards, giftCardOutstanding, pointsOutstanding] = await this.prisma.$transaction([
      this.prisma.booking.aggregate({ where: { paymentStatus: 'paid' }, _sum: { totalAmount: true } }),
      this.prisma.order.aggregate({ where: { paymentStatus: 'paid' }, _sum: { subtotal: true } }),
      this.prisma.giftCard.count(),
      this.prisma.giftCard.aggregate({ where: { status: { not: 'void' } }, _sum: { balance: true } }),
      this.prisma.loyaltyAccount.aggregate({ _sum: { pointsBalance: true } }),
    ]);

    const grossVolume = Number(bookingRevenue._sum.totalAmount ?? 0) + Number(orderRevenue._sum.subtotal ?? 0);
    const platformRevenue =
      Number(bookingRevenue._sum.platformCommission ?? 0) + Number(orderRevenue._sum.platformCommission ?? 0);
    const paidVolume = Number(paidBookings._sum.totalAmount ?? 0) + Number(paidOrders._sum.subtotal ?? 0);

    return {
      users,
      consumers,
      providers,
      professionals,
      services,
      packages,
      bookings,
      products,
      orders,
      pendingVerifications,
      grossVolume,
      platformRevenue,
      paidVolume,
      giftCards,
      giftCardOutstanding: giftCardOutstanding._sum.balance ?? 0,
      pointsOutstanding: pointsOutstanding._sum.pointsBalance ?? 0,
    };
  }

  async listProviders() {
    return this.prisma.provider.findMany({
      include: {
        user: { select: SAFE_USER_SELECT },
        _count: { select: { professionals: true, services: true, bookings: true, rooms: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setVerification(providerId: string, status: string) {
    return this.prisma.provider.update({
      where: { id: providerId },
      data: { verificationStatus: status },
      include: { user: { select: SAFE_USER_SELECT } },
    });
  }

  async listBookings() {
    return this.prisma.booking.findMany({
      take: 200,
      include: {
        service: { select: { id: true, name: true, category: true } },
        provider: { select: { id: true, businessName: true } },
        room: { select: { id: true, name: true } },
        consumer: { select: { userId: true, user: { select: { id: true, fullName: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listUsers() {
    return this.prisma.user.findMany({
      select: { ...SAFE_USER_SELECT, provider: { select: { id: true, businessName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
