import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto } from '../../dtos/package.dto';
export declare class PackagesController {
    private readonly service;
    constructor(service: PackagesService);
    create(createPackageDto: CreatePackageDto): Promise<{
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
        createdAt: Date;
        providerId: string;
        serviceId: string | null;
    }>;
    findAll(): Promise<({
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
        createdAt: Date;
        providerId: string;
        serviceId: string | null;
    })[]>;
    findByProvider(providerId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
        createdAt: Date;
        providerId: string;
        serviceId: string | null;
    }[]>;
    findOne(id: string): Promise<({
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
        createdAt: Date;
        providerId: string;
        serviceId: string | null;
    }) | null>;
    update(id: string, updatePackageDto: UpdatePackageDto): Promise<{
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
        createdAt: Date;
        providerId: string;
        serviceId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
        createdAt: Date;
        providerId: string;
        serviceId: string | null;
    }>;
}
