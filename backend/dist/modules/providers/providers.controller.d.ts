import { ProviderType } from '@prisma/client';
import { ProvidersService } from './providers.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';
export declare class ProvidersController {
    private readonly service;
    constructor(service: ProvidersService);
    findAll(q?: string, type?: ProviderType, city?: string, country?: string): Promise<({
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
        userId: string | null;
        businessName: string;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
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
        type: import(".prisma/client").$Enums.ProviderType;
        id: string;
        userId: string | null;
        businessName: string;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        verificationStatus: string;
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
        type: import(".prisma/client").$Enums.ProviderType;
        id: string;
        userId: string | null;
        businessName: string;
        brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
        address: import("@prisma/client/runtime/library").JsonValue | null;
        timezone: string | null;
        stripeAccountId: string | null;
        subscriptionTier: string | null;
        verificationStatus: string;
        createdAt: Date;
    }>;
}
