import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { RetreatCategory } from '@prisma/client';

export class CreateRetreatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsEnum(RetreatCategory)
  category: RetreatCategory;

  @IsString()
  @IsOptional()
  @MaxLength(240)
  summary?: string;

  @IsString()
  @IsOptional()
  @MaxLength(6000)
  description?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsObject()
  @IsOptional()
  address?: Record<string, unknown>;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationDays?: number;

  @IsNumber()
  @IsOptional()
  priceFrom?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  skillLevel?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  highlights?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inclusions?: string[];

  @IsString()
  @IsOptional()
  externalBookingUrl?: string;

  @IsIn(['draft', 'published'])
  @IsOptional()
  status?: string;
}

/** All fields optional — mutate any subset of a retreat you own. */
export class UpdateRetreatDto {
  @IsString() @IsOptional() @MaxLength(160) title?: string;
  @IsEnum(RetreatCategory) @IsOptional() category?: RetreatCategory;
  @IsString() @IsOptional() @MaxLength(240) summary?: string;
  @IsString() @IsOptional() @MaxLength(6000) description?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() country?: string;
  @IsObject() @IsOptional() address?: Record<string, unknown>;
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsInt() @Min(1) @IsOptional() durationDays?: number;
  @IsNumber() @IsOptional() priceFrom?: number;
  @IsString() @IsOptional() currency?: string;
  @IsInt() @Min(1) @IsOptional() capacity?: number;
  @IsString() @IsOptional() skillLevel?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() images?: string[];
  @IsArray() @IsString({ each: true }) @IsOptional() highlights?: string[];
  @IsArray() @IsString({ each: true }) @IsOptional() inclusions?: string[];
  @IsString() @IsOptional() externalBookingUrl?: string;
  @IsIn(['draft', 'published']) @IsOptional() status?: string;
}

/** Platform-admin only — "handpick" a retreat and set its verification. */
export class CurateRetreatDto {
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsIn(['pending', 'verified', 'rejected'])
  @IsOptional()
  verificationStatus?: string;
}
