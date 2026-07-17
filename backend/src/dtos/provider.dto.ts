import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProviderType } from '@prisma/client';

/** Authenticated free-directory listing — for users who already have an account. */
export class CreateFreeListingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  businessName: string;

  @IsEnum(ProviderType)
  type: ProviderType;

  /** About, contact email/phone, website, media, tags, etc. */
  @IsObject()
  @IsOptional()
  brandProfile?: Record<string, unknown>;

  /** Street, city, state, postcode, country. */
  @IsObject()
  @IsOptional()
  address?: Record<string, unknown>;

  /** "FREE_LISTING" (default) | "BOOKING" */
  @IsString()
  @IsOptional()
  listingTier?: string;
}

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

  /**
   * Request root vanity URL (ayurpass.com/:handle).
   * Requires platform admin approval before it is live.
   */
  @IsString()
  @IsOptional()
  @MaxLength(32)
  vanityHandle?: string | null;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  requestVanity?: boolean;
}
