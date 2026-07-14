import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../../dtos/product.dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    createProduct(data: CreateProductDto): Promise<{
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
    } & {
        providerId: string;
        category: string | null;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        id: string;
        createdAt: Date;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(category?: string): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
    } & {
        providerId: string;
        category: string | null;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        id: string;
        createdAt: Date;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findByProvider(providerId: string): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
    } & {
        providerId: string;
        category: string | null;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        id: string;
        createdAt: Date;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<({
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
    } & {
        providerId: string;
        category: string | null;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        id: string;
        createdAt: Date;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }) | null>;
    updateProduct(id: string, data: UpdateProductDto): Promise<{
        provider: {
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            verificationStatus: string;
            id: string;
        };
    } & {
        providerId: string;
        category: string | null;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        id: string;
        createdAt: Date;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    removeProduct(id: string): Promise<{
        providerId: string;
        category: string | null;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        id: string;
        createdAt: Date;
        inventoryQuantity: number | null;
        doshaRecommendations: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
