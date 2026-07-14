import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';
export declare class ProvidersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<({
        _count: {
            professionals: number;
            services: number;
            products: number;
            packages: number;
            rooms: number;
        };
    } & {
        businessName: string;
        timezone: string | null;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: Prisma.JsonValue | null;
        address: Prisma.JsonValue | null;
        verificationStatus: string;
        id: string;
        userId: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
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
        businessName: string;
        timezone: string | null;
        type: import(".prisma/client").$Enums.ProviderType;
        brandProfile: Prisma.JsonValue | null;
        address: Prisma.JsonValue | null;
        verificationStatus: string;
        id: string;
        userId: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        createdAt: Date;
    }>;
}
