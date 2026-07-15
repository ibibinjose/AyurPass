export declare enum ChannelType {
    WEB = "web",
    MOBILE = "mobile",
    API = "api",
    POS = "pos",
    EMAIL = "email",
    SMS = "sms"
}
export declare class Channel {
    id: string;
    type: ChannelType;
    name: string;
    description?: string;
    isActive: boolean;
    apiKey?: string;
    webhookUrl?: string;
    lastSyncAt?: Date;
    syncFrequency?: number;
    config?: any;
}
export declare class LoyaltySummary {
    accountId: string;
    pointsBalance: number;
    lifetimePoints: number;
    pointsToNextReward?: number;
    tier?: string;
    tierProgress?: number;
    totalRewardsRedeemed?: number;
    totalValueRedeemed?: number;
    lastActivityDate?: Date;
    tierExpirationDate?: Date;
    rewardsAvailable?: any[];
}
export declare class SyncReport {
    id: string;
    integrationId: string;
    status: string;
    syncStartAt: Date;
    syncEndAt?: Date;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsFailed: number;
    errors?: any[];
    summary?: any;
    message?: string;
}
