import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackageDto, UpdatePackageDto } from '../../dtos/package.dto';
export declare class PackagesService {
    private prisma;
    constructor(prisma: PrismaService);
    createPackage(data: CreatePackageDto): Promise<{
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
    } & {
        serviceId: string | null;
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
    }>;
    findAll(): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
    } & {
        serviceId: string | null;
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
    })[]>;
    findByProvider(providerId: string): Promise<{
        serviceId: string | null;
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
    }[]>;
    findOne(id: string): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
    } & {
        serviceId: string | null;
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
    }) | null>;
    updatePackage(id: string, data: UpdatePackageDto): Promise<{
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
    } & {
        serviceId: string | null;
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
    }>;
    removePackage(id: string): Promise<{
        serviceId: string | null;
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
    }>;
}
