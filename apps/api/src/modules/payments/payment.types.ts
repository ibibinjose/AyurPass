export interface RedemptionInput {
  giftCardCode?: string;
  redeemPoints?: number;
}

export interface Settlement {
  total: number;
  giftCardApplied: number;
  pointsRedeemed: number;
  pointsValue: number;
  cardCharge: number;
  pointsEarned: number;
}

export interface PaymentIntentPayload {
  mock: boolean;
  clientSecret?: string;
  publishableKey?: string | null;
  paymentIntentId?: string;
}