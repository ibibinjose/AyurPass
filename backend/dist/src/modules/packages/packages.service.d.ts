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
    updatePackage(id: string, data: UpdatePackageDto): Promise<{
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
    removePackage(id: string): Promise<{
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
