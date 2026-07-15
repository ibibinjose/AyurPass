import { ProvidersService } from './providers.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';
export declare class ProvidersController {
    private readonly service;
    constructor(service: ProvidersService);
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
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        verificationStatus: string;
    }) | null>;
    update(id: string, updateProviderDto: UpdateProviderDto): Promise<{
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
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        verificationStatus: string;
    }>;
}
