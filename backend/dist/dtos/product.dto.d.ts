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
