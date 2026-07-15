import { LoyaltyService } from './loyalty.service';
import { AuthedRequest } from '../../common/jwt-auth.guard';
export declare class LoyaltyController {
    private readonly service;
    constructor(service: LoyaltyService);
    me(req: AuthedRequest): Promise<{
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
            type: string;
            createdAt: Date;
            accountId: string;
            points: number;
            reason: string;
        }[];
    }>;
}
