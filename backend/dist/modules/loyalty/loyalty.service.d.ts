import { PrismaService } from '../../prisma/prisma.service';
export declare class LoyaltyService {
    private prisma;
    constructor(prisma: PrismaService);
    private getOrCreateAccount;
    summary(consumerId: string): Promise<{
        pointsBalance: number;
        lifetimePoints: number;
        pointsValue: number;
        pointRedemptionValue: number;
        tier: string;
        tierKey: string;
        nextTier: string | null;
        pointsToNextTier: number;
        transactions: {
            id: string;
            createdAt: Date;
            accountId: string;
            type: string;
            points: number;
            reason: string;
        }[];
    }>;
    award(consumerId: string, dollarsPaid: number, reason: string): Promise<number>;
    redeem(consumerId: string, requestedPoints: number, maxDollars: number, reason: string): Promise<{
        pointsUsed: number;
        value: number;
    }>;
}
