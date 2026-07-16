import { ServiceCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    createService(data: CreateServiceDto): Promise<{
        provider: {
            id: string;
            code: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
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
        code: string;
        createdAt: Date;
        name: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        professionalId: string | null;
        currency: string;
        durationMinutes: number;
        imageUrl: string | null;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
    }>;
    findAll(category?: ServiceCategory): Promise<({
        provider: {
            id: string;
            code: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
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
        code: string;
        createdAt: Date;
        name: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        professionalId: string | null;
        currency: string;
        durationMinutes: number;
        imageUrl: string | null;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
    })[]>;
    findByProvider(providerId: string): Promise<({
        provider: {
            id: string;
            code: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
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
        code: string;
        createdAt: Date;
        name: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        professionalId: string | null;
        currency: string;
        durationMinutes: number;
        imageUrl: string | null;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
    })[]>;
    findOne(id: string): Promise<({
        provider: {
            id: string;
            code: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
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
        code: string;
        createdAt: Date;
        name: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        professionalId: string | null;
        currency: string;
        durationMinutes: number;
        imageUrl: string | null;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
    }) | null>;
    updateService(id: string, data: UpdateServiceDto): Promise<{
        provider: {
            id: string;
            code: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
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
        code: string;
        createdAt: Date;
        name: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        professionalId: string | null;
        currency: string;
        durationMinutes: number;
        imageUrl: string | null;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
    }>;
    removeService(id: string): Promise<{
        id: string;
        code: string;
        createdAt: Date;
        name: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        professionalId: string | null;
        currency: string;
        durationMinutes: number;
        imageUrl: string | null;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
    }>;
}
