import { IsString, IsNumber, IsInt, IsOptional, Min } from 'class-validator';

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

  @IsOptional()
  images?: any;
}
