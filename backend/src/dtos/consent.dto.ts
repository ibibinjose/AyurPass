import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateConsentDto {
  @IsString()
  consumerId: string;

  @IsString()
  @IsOptional()
  granteeId?: string;

  @IsString()
  permissionType: string;

  @IsOptional()
  scope?: any;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateConsentDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  scope?: any;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}