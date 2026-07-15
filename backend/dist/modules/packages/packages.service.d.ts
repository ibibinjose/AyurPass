import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackageDto, UpdatePackageDto } from '../../dtos/package.dto';
export declare class PackagesService {
    private prisma;
    constructor(prisma: PrismaService);
    createPackage(data: CreatePackageDto): Promise<{
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        serviceId: string | null;
        providerId: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
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
        createdAt: Date;
        name: string;
        serviceId: string | null;
        providerId: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
    })[]>;
    findByProvider(providerId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        serviceId: string | null;
        providerId: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
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
        createdAt: Date;
        name: string;
        serviceId: string | null;
        providerId: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
    }) | null>;
    updatePackage(id: string, data: UpdatePackageDto): Promise<{
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        serviceId: string | null;
        providerId: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
    }>;
    removePackage(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        serviceId: string | null;
        providerId: string;
        description: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        includedProducts: import("@prisma/client/runtime/library").JsonValue | null;
        doshaFocus: import("@prisma/client/runtime/library").JsonValue | null;
        isRecurring: boolean;
    }>;
}
