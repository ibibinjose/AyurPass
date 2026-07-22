import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { POINT_REDEMPTION_VALUE, pointsForSpend, pointsToDollars, tierFor } from './loyalty.constants';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateAccount(consumerId: string) {
    return this.prisma.loyaltyAccount.upsert({
      where: { consumerId },
      create: { consumerId },
      update: {},
    });
  }

  async summary(consumerId: string) {
    const account = await this.getOrCreateAccount(consumerId);
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
    };
  }

  /** Award points for a card-paid amount. Returns points earned. */
  async award(consumerId: string, dollarsPaid: number, reason: string): Promise<number> {
    const points = pointsForSpend(dollarsPaid);
    if (points <= 0) return 0;
    const account = await this.getOrCreateAccount(consumerId);
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
   * Returns the points actually used and their dollar value.
   */
  async redeem(
    consumerId: string,
    requestedPoints: number,
    maxDollars: number,
    reason: string,
  ): Promise<{ pointsUsed: number; value: number }> {
    if (requestedPoints <= 0 || maxDollars <= 0) return { pointsUsed: 0, value: 0 };
    const account = await this.getOrCreateAccount(consumerId);

    const maxByDollars = Math.floor(maxDollars / POINT_REDEMPTION_VALUE);
    const pointsUsed = Math.min(requestedPoints, account.pointsBalance, maxByDollars);
    if (pointsUsed <= 0) return { pointsUsed: 0, value: 0 };

    // Atomic guarded decrement: only succeeds if the balance still covers it.
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
}
