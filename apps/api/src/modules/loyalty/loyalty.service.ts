import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  POINT_REDEMPTION_VALUE,
  POINTS_PER_DOLLAR,
  pointsForSpend,
  pointsToDollars,
  tierFor,
  TIERS,
} from './loyalty.constants';

/** Redeemable catalog (points → account credit / perks). Real balances stay on LoyaltyAccount. */
const REWARD_CATALOG = [
  {
    id: 'credit-5',
    title: '$5 booking credit',
    description: 'Apply at checkout on your next session (100 points).',
    pointsCost: 100,
    dollarValue: 5,
    kind: 'booking_credit' as const,
  },
  {
    id: 'credit-10',
    title: '$10 booking credit',
    description: 'Bigger save on treatments and classes (200 points).',
    pointsCost: 200,
    dollarValue: 10,
    kind: 'booking_credit' as const,
  },
  {
    id: 'shop-5',
    title: '$5 shop credit',
    description: 'Use toward oils, teas and wellness products (100 points).',
    pointsCost: 100,
    dollarValue: 5,
    kind: 'shop_credit' as const,
  },
  {
    id: 'credit-25',
    title: '$25 wellness credit',
    description: 'Premium credit for packages or longer programmes (500 points).',
    pointsCost: 500,
    dollarValue: 25,
    kind: 'booking_credit' as const,
  },
];

const EARN_RULES = [
  {
    label: 'Book & pay',
    detail: `Earn ${POINTS_PER_DOLLAR} point per $1 paid by card on sessions.`,
  },
  {
    label: 'Shop',
    detail: 'Earn the same rate on product orders paid by card.',
  },
  {
    label: 'Redeem',
    detail: `Every point is worth $${POINT_REDEMPTION_VALUE.toFixed(2)} at checkout.`,
  },
  {
    label: 'Tiers',
    detail: `Bloom at ${TIERS[1].threshold} lifetime points · Radiance at ${TIERS[2].threshold}.`,
  },
];

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  /** Ensure Consumer + LoyaltyAccount exist for this user id. */
  private async ensureConsumerAndAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let consumer = await this.prisma.consumer.findUnique({ where: { userId } });
    if (!consumer) {
      consumer = await this.prisma.consumer.create({
        data: {
          userId,
          preferences: {},
          prakritiScores: {},
        },
      });
    }

    const account = await this.prisma.loyaltyAccount.upsert({
      where: { consumerId: userId },
      create: { consumerId: userId },
      update: {},
    });

    return { user, consumer, account };
  }

  async summary(userId: string) {
    const { account } = await this.ensureConsumerAndAccount(userId);
    const transactions = await this.prisma.loyaltyTransaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const { current, next, pointsToNext } = tierFor(account.lifetimePoints);

    return {
      pointsBalance: account.pointsBalance,
      lifetimePoints: account.lifetimePoints,
      pointsValue: pointsToDollars(account.pointsBalance),
      pointRedemptionValue: POINT_REDEMPTION_VALUE,
      tier: current.name,
      tierKey: current.key,
      nextTier: next?.name ?? null,
      pointsToNextTier: pointsToNext,
      transactions,
      catalog: REWARD_CATALOG,
      earnRules: EARN_RULES,
      tiers: TIERS.map((t) => ({
        key: t.key,
        name: t.name,
        threshold: t.threshold,
      })),
    };
  }

  /** Award points for a card-paid amount. Returns points earned. */
  async award(consumerId: string, dollarsPaid: number, reason: string): Promise<number> {
    const points = pointsForSpend(dollarsPaid);
    if (points <= 0) return 0;
    await this.ensureConsumerAndAccount(consumerId);
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { consumerId },
    });
    if (!account) return 0;
    await this.prisma.$transaction([
      this.prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          pointsBalance: { increment: points },
          lifetimePoints: { increment: points },
        },
      }),
      this.prisma.loyaltyTransaction.create({
        data: { accountId: account.id, type: 'EARN', points, reason },
      }),
    ]);
    return points;
  }

  /**
   * Redeem up to `requestedPoints`, capped by balance and by the dollar value
   * still owed. Atomic conditional decrement prevents double-spend under races.
   */
  async redeem(
    consumerId: string,
    requestedPoints: number,
    maxDollars: number,
    reason: string,
  ): Promise<{ pointsUsed: number; value: number }> {
    if (requestedPoints <= 0 || maxDollars <= 0) return { pointsUsed: 0, value: 0 };
    await this.ensureConsumerAndAccount(consumerId);
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { consumerId },
    });
    if (!account) return { pointsUsed: 0, value: 0 };

    const maxByDollars = Math.floor(maxDollars / POINT_REDEMPTION_VALUE);
    const pointsUsed = Math.min(requestedPoints, account.pointsBalance, maxByDollars);
    if (pointsUsed <= 0) return { pointsUsed: 0, value: 0 };

    const result = await this.prisma.loyaltyAccount.updateMany({
      where: { id: account.id, pointsBalance: { gte: pointsUsed } },
      data: { pointsBalance: { decrement: pointsUsed } },
    });
    if (result.count !== 1) {
      throw new BadRequestException('Insufficient points balance');
    }
    await this.prisma.loyaltyTransaction.create({
      data: { accountId: account.id, type: 'REDEEM', points: -pointsUsed, reason },
    });
    return { pointsUsed, value: pointsToDollars(pointsUsed) };
  }

  /**
   * Redeem a catalog reward into a ledger entry.
   * Booking/shop credits are applied at checkout via remaining balance;
   * here we convert points into a redeem transaction with clear reason.
   */
  async redeemCatalog(userId: string, rewardId: string) {
    const item = REWARD_CATALOG.find((r) => r.id === rewardId);
    if (!item) throw new BadRequestException('Unknown reward.');

    const { account } = await this.ensureConsumerAndAccount(userId);
    if (account.pointsBalance < item.pointsCost) {
      throw new BadRequestException(
        `You need ${item.pointsCost} points (you have ${account.pointsBalance}).`,
      );
    }

    const result = await this.prisma.loyaltyAccount.updateMany({
      where: { id: account.id, pointsBalance: { gte: item.pointsCost } },
      data: { pointsBalance: { decrement: item.pointsCost } },
    });
    if (result.count !== 1) {
      throw new BadRequestException('Insufficient points balance');
    }

    await this.prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: 'REDEEM',
        points: -item.pointsCost,
        reason: `Redeemed · ${item.title}`,
      },
    });

    // Soft wallet: store pending credit on consumer preferences
    const consumer = await this.prisma.consumer.findUnique({ where: { userId } });
    const prefs =
      consumer?.preferences && typeof consumer.preferences === 'object'
        ? (consumer.preferences as Record<string, unknown>)
        : {};
    const credits = Array.isArray(prefs.rewardCredits)
      ? [...(prefs.rewardCredits as object[])]
      : [];
    credits.push({
      id: `${item.id}-${Date.now()}`,
      rewardId: item.id,
      title: item.title,
      dollarValue: item.dollarValue,
      kind: item.kind,
      createdAt: new Date().toISOString(),
      status: 'available',
    });
    await this.prisma.consumer.update({
      where: { userId },
      data: { preferences: { ...prefs, rewardCredits: credits } },
    });

    return this.summary(userId);
  }
}
