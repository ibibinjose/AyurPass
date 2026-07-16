import { Prisma, ProviderType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';
export interface ProviderQuery {
    q?: string;
    type?: ProviderType;
    city?: string;
    country?: string;
}
export declare class ProvidersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: ProviderQuery): Promise<({
        _count: {
            professionals: number;
            services: number;
            products: number;
            packages: number;
            rooms: number;
        };
    } & {
        type: import(".prisma/client").$Enums.ProviderType;
        id: string;
        code: string;
        userId: string | null;
        businessName: string;
        brandProfile: Prisma.JsonValue | null;
        address: Prisma.JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        listingTier: string;
        verificationStatus: string;
        createdAt: Date;
    })[]>;
    findOne(id: string): Promise<({
        _count: {
            professionals: number;
            services: number;
            products: number;
            packages: number;
            rooms: number;
        };
    } & {
        type: import(".prisma/client").$Enums.ProviderType;
        id: string;
        code: string;
        userId: string | null;
        businessName: string;
        brandProfile: Prisma.JsonValue | null;
        address: Prisma.JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        listingTier: string;
        verificationStatus: string;
        createdAt: Date;
    }) | null>;
    updateProvider(id: string, data: UpdateProviderDto): Promise<{
        _count: {
            professionals: number;
            services: number;
            products: number;
            packages: number;
            rooms: number;
        };
    } & {
        type: import(".prisma/client").$Enums.ProviderType;
        id: string;
        code: string;
        userId: string | null;
        businessName: string;
        brandProfile: Prisma.JsonValue | null;
        address: Prisma.JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        listingTier: string;
        verificationStatus: string;
        createdAt: Date;
    }>;
}
