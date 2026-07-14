import { ProvidersService } from './providers.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';
export declare class ProvidersController {
    private readonly service;
    constructor(service: ProvidersService);
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
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        verificationStatus: string;
        id: string;
        userId: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        createdAt: Date;
    }) | null>;
    update(id: string, updateProviderDto: UpdateProviderDto): Promise<{
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
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        verificationStatus: string;
        id: string;
        userId: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        createdAt: Date;
    }>;
}
