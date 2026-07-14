import { IsString, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreatePackageDto {
  @IsString()
  providerId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  totalPrice: number;

  @IsNumber()
  @IsOptional()
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
}

export class UpdatePackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @IsNumber()
  @IsOptional()
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
}