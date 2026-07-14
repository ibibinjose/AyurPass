import { IsString, IsNumber, IsInt, IsBoolean, IsOptional, IsEnum, Min } from 'class-validator';
import { ServiceCategory } from '@prisma/client';

export class CreateServiceDto {
  @IsString()
  providerId: string;

  @IsString()
  @IsOptional()
  professionalId?: string;

  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(5)
  durationMinutes: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsOptional()
  doshaCompatibility?: any;

  @IsBoolean()
  @IsOptional()
  isVirtual?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  professionalId?: string;

  @IsEnum(ServiceCategory)
  @IsOptional()
  category?: ServiceCategory;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(5)
  @IsOptional()
  durationMinutes?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsOptional()
  doshaCompatibility?: any;

  @IsBoolean()
  @IsOptional()
  isVirtual?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;
}
