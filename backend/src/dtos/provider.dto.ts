import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ProviderType } from '@prisma/client';

export class UpdateProviderDto {
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsEnum(ProviderType)
  @IsOptional()
  type?: ProviderType;

  /** About, contact email/phone, website, opening hours, social links. */
  @IsObject()
  @IsOptional()
  brandProfile?: Record<string, unknown>;

  /** Street, city, state, postcode, country. */
  @IsObject()
  @IsOptional()
  address?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  timezone?: string;
}
