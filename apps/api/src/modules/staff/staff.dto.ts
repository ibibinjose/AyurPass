import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StaffRole } from '@prisma/client';

export class InviteStaffDto {
  @IsEmail()
  email: string;

  @IsEnum(StaffRole)
  role: StaffRole;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;

  @IsObject()
  @IsOptional()
  permissions?: Record<string, boolean>;
}

export class UpdateStaffDto {
  @IsEnum(StaffRole)
  @IsOptional()
  role?: StaffRole;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;

  @IsObject()
  @IsOptional()
  permissions?: Record<string, boolean>;
}

export class AcceptInviteDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
