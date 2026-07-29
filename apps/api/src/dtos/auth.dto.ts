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
  prakritiScores?: Record<string, unknown>;

  @IsOptional()
  preferences?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  state?: string;

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