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
            amount: import("@prisma/client/runtime/library").Decimal;
            reason: string | null;
            giftCardId: string;
        }[];
    } & {
        id: string;
        code: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        purchaserId: string | null;
        recipientEmail: string | null;
        message: string | null;
        createdAt: Date;
    }>;
    myCards(purchaserId: string): Promise<({
        transactions: {
            id: string;
            createdAt: Date;
            type: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            reason: string | null;
            giftCardId: string;
        }[];
    } & {
        id: string;
        code: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        purchaserId: string | null;
        recipientEmail: string | null;
        message: string | null;
        createdAt: Date;
    })[]>;
    private normalise;
    lookup(code: string): Promise<{
        code: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }>;
    redeem(code: string, maxDollars: number, reason: string): Promise<number>;
}
