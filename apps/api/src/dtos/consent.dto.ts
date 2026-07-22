import {
  IsString,
  IsDateString,
  IsOptional,
  IsIn,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { PERMISSION_TYPES } from '../common/consent';

const PERMISSION_TYPE_VALUES = [...PERMISSION_TYPES];
const CONSENT_STATUSES = ['active', 'revoked', 'expired'] as const;

export class CreateConsentDto {
  @IsString()
  @IsNotEmpty()
  consumerId: string;

  @IsString()
  @IsOptional()
  granteeId?: string;

  @IsString()
  @IsIn(PERMISSION_TYPE_VALUES)
  permissionType: string;

  @IsOptional()
  @IsObject()
  scope?: Record<string, unknown>;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

export class UpdateConsentDto {
  @IsString()
  @IsIn([...CONSENT_STATUSES])
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsObject()
  scope?: Record<string, unknown>;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
