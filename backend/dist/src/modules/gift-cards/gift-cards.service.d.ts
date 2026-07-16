import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseGiftCardDto } from '../../dtos/gift-card.dto';
export declare class GiftCardsService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateUniqueCode;
    purchase(purchaserId: string, dto: PurchaseGiftCardDto): Promise<{
        transactions: {
            id: string;
            type: string;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            reason: string | null;
            giftCardId: string;
        }[];
    } & {
        id: string;
        code: string;
        createdAt: Date;
        message: string | null;
        status: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        purchaserId: string | null;
        recipientEmail: string | null;
    }>;
    myCards(purchaserId: string): Promise<({
        transactions: {
            id: string;
            type: string;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            reason: string | null;
            giftCardId: string;
        }[];
    } & {
        id: string;
        code: string;
        createdAt: Date;
        message: string | null;
        status: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        purchaserId: string | null;
        recipientEmail: string | null;
    })[]>;
    private normalise;
    lookup(code: string): Promise<{
        code: string;
        status: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    redeem(code: string, maxDollars: number, reason: string): Promise<number>;
}
