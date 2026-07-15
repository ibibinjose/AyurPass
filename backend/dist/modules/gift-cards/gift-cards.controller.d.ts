import { GiftCardsService } from './gift-cards.service';
import { PurchaseGiftCardDto } from '../../dtos/gift-card.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
export declare class GiftCardsController {
    private readonly service;
    constructor(service: GiftCardsService);
    purchase(req: AuthedRequest, dto: PurchaseGiftCardDto): Promise<{
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
    mine(req: AuthedRequest): Promise<({
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
    lookup(code: string): Promise<{
        status: string;
        code: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
}
