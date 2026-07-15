import { ServiceCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    createService(data: CreateServiceDto): Promise<{
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
            code: never;
        };
        professional: {
            id: string;
            user: {
                id: string;
                fullName: string | null;
            };
            title: string | null;
            specializations: string[];
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        } | null;
    } & {
        id: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        createdAt: Date;
        providerId: string;
        professionalId: string | null;
    }>;
    findAll(category?: ServiceCategory): Promise<({
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
            code: never;
        };
        professional: {
            id: string;
            user: {
                id: string;
                fullName: string | null;
            };
            title: string | null;
            specializations: string[];
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        } | null;
    } & {
        id: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        createdAt: Date;
        providerId: string;
        professionalId: string | null;
    })[]>;
    findByProvider(providerId: string): Promise<({
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
            code: never;
        };
        professional: {
            id: string;
            user: {
                id: string;
                fullName: string | null;
            };
            title: string | null;
            specializations: string[];
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        } | null;
    } & {
        id: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        createdAt: Date;
        providerId: string;
        professionalId: string | null;
    })[]>;
    findOne(id: string): Promise<({
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
            code: never;
        };
        professional: {
            id: string;
            user: {
                id: string;
                fullName: string | null;
            };
            title: string | null;
            specializations: string[];
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        } | null;
    } & {
        id: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        createdAt: Date;
        providerId: string;
        professionalId: string | null;
    }) | null>;
    updateService(id: string, data: UpdateServiceDto): Promise<{
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
            code: never;
        };
        professional: {
            id: string;
            user: {
                id: string;
                fullName: string | null;
            };
            title: string | null;
            specializations: string[];
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        } | null;
    } & {
        id: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        createdAt: Date;
        providerId: string;
        professionalId: string | null;
    }>;
    removeService(id: string): Promise<{
        id: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        createdAt: Date;
        providerId: string;
        professionalId: string | null;
    }>;
}
