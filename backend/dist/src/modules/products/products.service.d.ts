import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../../dtos/product.dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    createProduct(data: CreateProductDto): Promise<{
        provider: {
            id: string;
            code: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
        };
    } & {
        id: string;
        code: string;
        createdAt: Date;
        name: string;
        category: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        providerId: string;
    }>;
    findAll(category?: string): Promise<({
        provider: {
            id: string;
            code: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
        };
    } & {
        id: string;
        code: string;
        createdAt: Date;
        name: string;
        category: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        providerId: string;
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
    } & {
        id: string;
        code: string;
        createdAt: Date;
        name: string;
        category: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        providerId: string;
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
    } & {
        id: string;
        code: string;
        createdAt: Date;
        name: string;
        category: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        providerId: string;
    }) | null>;
    updateProduct(id: string, data: UpdateProductDto): Promise<{
        provider: {
            id: string;
            code: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
        };
    } & {
        id: string;
        code: string;
        createdAt: Date;
        name: string;
        category: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        providerId: string;
    }>;
    removeProduct(id: string): Promise<{
        id: string;
        code: string;
        createdAt: Date;
        name: string;
        category: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        providerId: string;
    }>;
}
