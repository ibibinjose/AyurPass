import { IsString, IsArray, IsNumber, IsOptional, IsBoolean, IsDecimal } from 'class-validator';

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