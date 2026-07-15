import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';
export declare class ProvidersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<({
        _count: {
            services: number;
            professionals: number;
            products: number;
            packages: number;
            rooms: number;
        };
    } & {
        id: string;
        createdAt: Date;
        timezone: string | null;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: Prisma.JsonValue | null;
        address: Prisma.JsonValue | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        verificationStatus: string;
    }) | null>;
    updateProvider(id: string, data: UpdateProviderDto): Promise<{
        _count: {
            services: number;
            professionals: number;
            products: number;
            packages: number;
            rooms: number;
        };
    } & {
        id: string;
        createdAt: Date;
        timezone: string | null;
        userId: string | null;
        businessName: string;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: Prisma.JsonValue | null;
        address: Prisma.JsonValue | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        verificationStatus: string;
    }>;
}
