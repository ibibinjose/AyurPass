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
    mine(req: AuthedRequest): Promise<({
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
    lookup(code: string): Promise<{
        code: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }>;
}
