import { IsEmail, IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { Role, ProviderType } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
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
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}