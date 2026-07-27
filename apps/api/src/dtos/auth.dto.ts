import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Role, ProviderType } from '@prisma/client';

/** Minimum password length enforced API-side (UI already hints 8+). */
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(PASSWORD_MIN, { message: 'Password must be at least 8 characters' })
  @MaxLength(PASSWORD_MAX)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsEnum(ProviderType)
  @IsOptional()
  providerType?: ProviderType;

  /** "FREE_LISTING" for directory-only signups, "BOOKING" (default) for full merchants. */
  @IsString()
  @IsOptional()
  listingTier?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  specializations?: string[];

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  prakritiScores?: any;

  @IsOptional()
  preferences?: any;

  /** Seeker / provider home city for Near Me defaults. */
  @IsString()
  @IsOptional()
  @MaxLength(120)
  city?: string;

  /** Country name (e.g. Australia) — required for seekers in UI; optional for legacy clients. */
  @IsString()
  @IsOptional()
  @MaxLength(120)
  country?: string;

  /** ISO 3166-1 alpha-2 when available (AU, IN, …). */
  @IsString()
  @IsOptional()
  @MaxLength(2)
  countryCode?: string;

  @IsOptional()
  lat?: number;

  @IsOptional()
  lng?: number;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class AuthTokens {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  tokenType: string;

  @IsOptional()
  expiresIn?: number;
}

export class AuthResponse {
  @IsString()
  message: string;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  user?: any;

  @IsOptional()
  tokens?: AuthTokens;

  @IsOptional()
  needsEmailVerification?: boolean;

  @IsOptional()
  emailVerificationSent?: boolean;
}

export class LoginResponse {
  @IsOptional()
  user?: any;

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  tokenType: string;

  @IsOptional()
  expiresIn?: number;

  @IsOptional()
  needsEmailVerification?: boolean;

  @IsOptional()
  message?: string;
}

export class RegisterPayload {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(PASSWORD_MIN, { message: 'Password must be at least 8 characters' })
  @MaxLength(PASSWORD_MAX)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsEnum(ProviderType)
  @IsOptional()
  providerType?: ProviderType;

  /** "FREE_LISTING" for directory-only signups, "BOOKING" (default) for full merchants. */
  @IsString()
  @IsOptional()
  listingTier?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  specializations?: string[];

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  prakritiScores?: any;

  @IsOptional()
  preferences?: any;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  country?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  countryCode?: string;

  @IsOptional()
  lat?: number;

  @IsOptional()
  lng?: number;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(PASSWORD_MIN, { message: 'Password must be at least 8 characters' })
  @MaxLength(PASSWORD_MAX)
  password: string;
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
