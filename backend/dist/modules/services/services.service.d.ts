import { ServiceCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    createService(data: CreateServiceDto): Promise<{
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
        professional: {
            title: string | null;
            specializations: string[];
            id: string;
            user: {
                fullName: string | null;
                id: string;
            };
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        } | null;
    } & {
        professionalId: string | null;
        providerId: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        id: string;
        createdAt: Date;
    }>;
    findAll(category?: ServiceCategory): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
        professional: {
            title: string | null;
            specializations: string[];
            id: string;
            user: {
                fullName: string | null;
                id: string;
            };
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        } | null;
    } & {
        professionalId: string | null;
        providerId: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        id: string;
        createdAt: Date;
    })[]>;
    findByProvider(providerId: string): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
        professional: {
            title: string | null;
            specializations: string[];
            id: string;
            user: {
                fullName: string | null;
                id: string;
            };
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        } | null;
    } & {
        professionalId: string | null;
        providerId: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        id: string;
        createdAt: Date;
    })[]>;
    findOne(id: string): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
        professional: {
            title: string | null;
            specializations: string[];
            id: string;
            user: {
                fullName: string | null;
                id: string;
            };
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        } | null;
    } & {
        professionalId: string | null;
        providerId: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        id: string;
        createdAt: Date;
    }) | null>;
    updateService(id: string, data: UpdateServiceDto): Promise<{
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
        professional: {
            title: string | null;
            specializations: string[];
            id: string;
            user: {
                fullName: string | null;
                id: string;
            };
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        } | null;
    } & {
        professionalId: string | null;
        providerId: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        id: string;
        createdAt: Date;
    }>;
    removeService(id: string): Promise<{
        professionalId: string | null;
        providerId: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        name: string;
        description: string | null;
        durationMinutes: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
        id: string;
        createdAt: Date;
    }>;
}
