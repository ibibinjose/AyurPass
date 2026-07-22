import { IsString, IsNumber, IsInt, IsBoolean, IsOptional, IsEnum, Min, IsArray, IsDateString } from 'class-validator';
import { ServiceCategory } from '@prisma/client';

export class WellnessPackage {
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
  description?: string;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  includedServices?: any; // Array of service IDs or service objects

  @IsOptional()
  includedProducts?: any; // Array of product IDs or product objects

  @IsOptional()
  doshaFocus?: any; // Object containing VPK scores

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsOptional()
  benefits?: any; // Array of package benefits

  @IsOptional()
  requirements?: any; // Prerequisites for the package

  @IsOptional()
  schedule?: any; // Detailed schedule for the package

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;
}

export class CreatePackageDto {
  @IsString()
  providerId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  includedServices?: any;

  @IsOptional()
  includedProducts?: any;

  @IsOptional()
  doshaFocus?: any;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsOptional()
  benefits?: any;

  @IsOptional()
  requirements?: any;

  @IsOptional()
  schedule?: any;
}

export class UpdatePackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  includedServices?: any;

  @IsOptional()
  includedProducts?: any;

  @IsOptional()
  doshaFocus?: any;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsOptional()
  benefits?: any;

  @IsOptional()
  requirements?: any;

  @IsOptional()
  schedule?: any;
}