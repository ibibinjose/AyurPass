import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseGiftCardDto } from '../../dtos/gift-card.dto';

// Unambiguous alphabet — no O/0/I/1 to avoid transcription errors.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomGroup(len: number): string {
  let out = '';
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}

@Injectable()
export class GiftCardsService {
  constructor(private prisma: PrismaService) {}

  /** AYUR-XXXX-XXXX-XXXX, retrying on the vanishingly rare collision. */
  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = `AYUR-${randomGroup(4)}-${randomGroup(4)}-${randomGroup(4)}`;
      const existing = await this.prisma.giftCard.findUnique({ where: { code } });
      if (!existing) return code;
    }
    throw new BadRequestException('Could not allocate a gift card code, please retry');
  }

  async purchase(purchaserId: string, dto: PurchaseGiftCardDto) {
    const code = await this.generateUniqueCode();
    return this.prisma.giftCard.create({
      data: {
        code,
        initialBalance: dto.amount,
        balance: dto.amount,
        purchaserId,
        recipientEmail: dto.recipientEmail,
        message: dto.message,
        transactions: {
          create: { type: 'ISSUE', amount: dto.amount, reason: 'Gift card purchased' },
        },
      },
      include: { transactions: true },
    });
  }

  async myCards(purchaserId: string) {
    return this.prisma.giftCard.findMany({
      where: { purchaserId },
      include: { transactions: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private normalise(code: string): string {
    return code.trim().toUpperCase();
  }

  /** Public-safe lookup for a redemption preview — balance and status only. */
  async lookup(code: string) {
    const card = await this.prisma.giftCard.findUnique({
      where: { code: this.normalise(code) },
      select: { code: true, balance: true, status: true },
    });
    if (!card) throw new NotFoundException('No gift card with that code');
    return card;
  }

  /**
   * Redeem up to `maxDollars` from the card. Atomic guarded decrement so the
   * same card can never be spent twice concurrently. Returns dollars applied.
   */
  async redeem(code: string, maxDollars: number, reason: string): Promise<number> {
    if (maxDollars <= 0) return 0;
    const card = await this.prisma.giftCard.findUnique({ where: { code: this.normalise(code) } });
    if (!card) throw new NotFoundException('No gift card with that code');
    if (card.status === 'void') throw new BadRequestException('This gift card is no longer valid');

    const applied = Math.min(Number(card.balance), maxDollars);
    if (applied <= 0) throw new BadRequestException('This gift card has no remaining balance');

    // Only decrements if the balance still covers the amount (race-safe).
    const result = await this.prisma.giftCard.updateMany({
      where: { id: card.id, balance: { gte: applied } },
      data: { balance: { decrement: applied } },
    });
    if (result.count !== 1) {
      throw new BadRequestException('Gift card balance changed, please retry');
    }

    const remaining = Number(card.balance) - applied;
    await this.prisma.$transaction([
      this.prisma.giftCardTransaction.create({
        data: { giftCardId: card.id, type: 'REDEEM', amount: applied, reason },
      }),
      this.prisma.giftCard.update({
        where: { id: card.id },
        data: { status: remaining <= 0 ? 'depleted' : 'active' },
      }),
    ]);
    return applied;
  }
}
