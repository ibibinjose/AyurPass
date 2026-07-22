import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class Professional {
  @IsString()
  id: string;

  @IsString()
  code: string;

  @IsString()
  userId: string;

  @IsString()
  providerId: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @IsOptional()
  specializations?: string[];

  @IsOptional()
  doshaExpertise?: any;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  certifications?: any;

  @IsNumber()
  @IsOptional()
  yearsExperience?: number;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsOptional()
  availabilityPreferences?: any;

  @IsOptional()
  verificationDocuments?: any;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsNumber()
  @IsOptional()
  reviewCount?: number;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  languages?: string;

  @IsString()
  @IsOptional()
  education?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseState?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  specialties?: any;

  @IsOptional()
  approach?: any;

  @IsOptional()
  modalities?: any;

  @IsOptional()
  insuranceAccepted?: any;

  @IsOptional()
  consultationTypes?: any; // In-person, virtual, hybrid

  @IsOptional()
  pricing?: any; // Different pricing tiers/packages
}

export class CreateProfessionalDto {
  @IsString()
  userId: string;

  @IsString()
  providerId: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @IsOptional()
  specializations?: string[];

  @IsOptional()
  doshaExpertise?: any;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  certifications?: any;

  @IsNumber()
  @IsOptional()
  yearsExperience?: number;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsOptional()
  availabilityPreferences?: any;

  @IsOptional()
  verificationDocuments?: any;
}

export class UpdateProfessionalDto {
  @IsString()
  @IsOptional()
  title?: string;

  /** Structured title kind — AYURVEDA_DOCTOR, YOGA_INSTRUCTOR, … */
  @IsString()
  @IsOptional()
  @MaxLength(40)
  titleKind?: string | null;

  /**
   * Public username for /:namespace/:handle paths.
   * Empty string clears the handle.
   */
  @IsString()
  @IsOptional()
  @MaxLength(32)
  handle?: string | null;

  /** pro | ayur | yoga | spa | meditation | fitness | nutrition | coach */
  @IsString()
  @IsOptional()
  @MaxLength(20)
  handleNamespace?: string | null;

  /**
   * Request a root vanity URL (ayurpass.com/:handle).
   * Requires platform admin approval before it goes live.
   */
  @IsString()
  @IsOptional()
  @MaxLength(32)
  vanityHandle?: string | null;

  /** When true with vanityHandle, sets vanityStatus to pending. */
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  requestVanity?: boolean;

  @IsArray()
  @IsOptional()
  specializations?: string[];

  @IsOptional()
  doshaExpertise?: any;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  certifications?: any;

  @IsNumber()
  @IsOptional()
  yearsExperience?: number;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsOptional()
  availabilityPreferences?: any;

  @IsOptional()
  verificationDocuments?: any;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  registrationNumber?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  licenceNumber?: string | null;

  @IsArray()
  @IsOptional()
  healthAuthorities?: Record<string, unknown>[];
}