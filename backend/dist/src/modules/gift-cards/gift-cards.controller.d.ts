import { GiftCardsService } from './gift-cards.service';
import { PurchaseGiftCardDto } from '../../dtos/gift-card.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
export declare class GiftCardsController {
    private readonly service;
    constructor(service: GiftCardsService);
    purchase(req: AuthedRequest, dto: PurchaseGiftCardDto): Promise<{
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
    mine(req: AuthedRequest): Promise<({
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
    lookup(code: string): Promise<{
        code: string;
        status: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
}
