import { IsString, IsNumber, IsInt, IsOptional, Min, IsArray, IsDateString } from 'class-validator';

export class Product {
  @IsString()
  id: string;

  @IsString()
  code: string;

  @IsString()
  providerId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  inventoryQuantity?: number;

  @IsOptional()
  doshaRecommendations?: any;

  @IsArray()
  @IsOptional()
  images?: any;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsString()
  @IsOptional()
  dimensions?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;

  @IsOptional()
  nutritionalInfo?: any;

  @IsOptional()
  ingredients?: any;

  @IsOptional()
  benefits?: any;

  @IsOptional()
  usageInstructions?: any;
}

export class CreateProductDto {
  @IsString()
  providerId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  inventoryQuantity?: number;

  @IsOptional()
  doshaRecommendations?: any;

  @IsArray()
  @IsOptional()
  images?: any;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  inventoryQuantity?: number;

  @IsOptional()
  doshaRecommendations?: any;

  @IsArray()
  @IsOptional()
  images?: any;
}