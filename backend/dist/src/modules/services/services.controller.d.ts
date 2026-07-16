import { ServiceCategory } from '@prisma/client';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';
export declare class ServicesController {
    private readonly service;
    constructor(service: ServicesService);
    create(createServiceDto: CreateServiceDto): Promise<{
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
        durationMinutes: number;
        currency: string;
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
        durationMinutes: number;
        currency: string;
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
        durationMinutes: number;
        currency: string;
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
        durationMinutes: number;
        currency: string;
        imageUrl: string | null;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
    }) | null>;
    update(id: string, updateServiceDto: UpdateServiceDto): Promise<{
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
        durationMinutes: number;
        currency: string;
        imageUrl: string | null;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        code: string;
        createdAt: Date;
        name: string;
        category: import(".prisma/client").$Enums.ServiceCategory;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        providerId: string;
        professionalId: string | null;
        durationMinutes: number;
        currency: string;
        imageUrl: string | null;
        doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
        isVirtual: boolean;
        maxParticipants: number;
    }>;
}
