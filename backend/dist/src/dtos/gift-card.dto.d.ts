export declare enum GiftCardStatus {
    ACTIVE = "active",
    DEPLETED = "depleted",
    VOID = "void",
    EXPIRED = "expired"
}
export declare class GiftCard {
    id: string;
    code: string;
    initialBalance: number;
    balance: number;
    status: GiftCardStatus;
    purchaserId?: string;
    recipientEmail?: string;
    message?: string;
    createdAt: Date;
    updatedAt?: Date;
    expiryDate?: Date;
}
export declare class GiftCardLookup {
    code: string;
}
export declare class PurchaseGiftCardDto {
    amount: number;
    recipientEmail?: string;
    message?: string;
}
export declare class RedeemGiftCardDto {
    code: string;
    amount: number;
}
export declare class CreateGiftCardDto {
    initialBalance: number;
    purchaserId?: string;
    recipientEmail?: string;
    message?: string;
    expiryDate?: Date;
}
