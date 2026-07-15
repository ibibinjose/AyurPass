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
        id: string;
        code: string;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: Prisma.JsonValue | null;
        address: Prisma.JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
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
        id: string;
        code: string;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: Prisma.JsonValue | null;
        address: Prisma.JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
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
        id: string;
        code: string;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: Prisma.JsonValue | null;
        address: Prisma.JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        verificationStatus: string;
        createdAt: Date;
    }>;
}
