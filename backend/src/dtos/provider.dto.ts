import { IsString, IsOptional, IsEnum, IsObject, IsArray, MaxLength } from 'class-validator';
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

  /** "FREE_LISTING" | "BOOKING" — flips when a listing upgrades to accept bookings. */
  @IsString()
  @IsOptional()
  listingTier?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  registrationNumber?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  licenceNumber?: string | null;

  /** Local health-authority approval marks (AAA, AHPRA, NMC, custom…). */
  @IsArray()
  @IsOptional()
  healthAuthorities?: Record<string, unknown>[];
}
