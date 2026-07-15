import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from '../../dtos/product.dto';
export declare class ProductsController {
    private readonly service;
    constructor(service: ProductsService);
    create(createProductDto: CreateProductDto): Promise<{
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
    update(id: string, updateProductDto: UpdateProductDto): Promise<{
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
    remove(id: string): Promise<{
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
