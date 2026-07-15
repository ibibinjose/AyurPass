export declare class Product {
    id: string;
    code: string;
    providerId: string;
    name: string;
    category?: string;
    description?: string;
    price: number;
    inventoryQuantity?: number;
    doshaRecommendations?: any;
    images?: any;
    createdAt: Date;
    updatedAt?: Date;
    sku?: string;
    weight?: string;
    dimensions?: string;
    brand?: string;
    manufacturer?: string;
    tags?: string[];
    currency?: string;
    costPrice?: number;
    discountPercentage?: number;
    expiryDate?: Date;
    nutritionalInfo?: any;
    ingredients?: any;
    benefits?: any;
    usageInstructions?: any;
}
export declare class CreateProductDto {
    providerId: string;
    name: string;
    category?: string;
    description?: string;
    price: number;
    inventoryQuantity?: number;
    doshaRecommendations?: any;
    images?: any;
}
export declare class UpdateProductDto {
    name?: string;
    category?: string;
    description?: string;
    price?: number;
    inventoryQuantity?: number;
    doshaRecommendations?: any;
    images?: any;
}
