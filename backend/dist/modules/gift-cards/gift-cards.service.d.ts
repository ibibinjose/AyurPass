import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseGiftCardDto } from '../../dtos/gift-card.dto';
export declare class GiftCardsService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateUniqueCode;
    purchase(purchaserId: string, dto: PurchaseGiftCardDto): Promise<{
        transactions: {
            id: string;
            createdAt: Date;
            type: string;
            reason: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            giftCardId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        code: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        purchaserId: string | null;
        recipientEmail: string | null;
        message: string | null;
    }>;
    myCards(purchaserId: string): Promise<({
        transactions: {
            id: string;
            createdAt: Date;
            type: string;
            reason: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            giftCardId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        status: string;
        code: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        purchaserId: string | null;
        recipientEmail: string | null;
        message: string | null;
    })[]>;
    private normalise;
    lookup(code: string): Promise<{
        status: string;
        code: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    redeem(code: string, maxDollars: number, reason: string): Promise<number>;
}
