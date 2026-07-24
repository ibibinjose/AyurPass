import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EventCategory, EventStatus } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(280)
  summary?: string;

  @IsString()
  @IsOptional()
  @MaxLength(8000)
  description?: string;

  @IsEnum(EventCategory)
  category: EventCategory;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsBoolean()
  @IsOptional()
  isVirtual?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  meetingUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  venueName?: string;

  @IsOptional()
  address?: Record<string, unknown>;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsBoolean()
  @IsOptional()
  waitlistEnabled?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsOptional()
  @IsArray()
  whatToBring?: string[];

  @IsOptional()
  @IsArray()
  inclusions?: string[];

  @IsString()
  @IsOptional()
  skillLevel?: string;

  @IsString()
  @IsOptional()
  hostProfessionalId?: string;

  /** draft | published */
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(160)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(280)
  summary?: string;

  @IsString()
  @IsOptional()
  @MaxLength(8000)
  description?: string;

  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsBoolean()
  @IsOptional()
  isVirtual?: boolean;

  @IsString()
  @IsOptional()
  meetingUrl?: string;

  @IsString()
  @IsOptional()
  venueName?: string;

  @IsOptional()
  address?: Record<string, unknown> | null;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number | null;

  @IsBoolean()
  @IsOptional()
  waitlistEnabled?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsString()
  @IsOptional()
  coverImageUrl?: string | null;

  @IsOptional()
  @IsArray()
  whatToBring?: string[];

  @IsOptional()
  @IsArray()
  inclusions?: string[];

  @IsString()
  @IsOptional()
  skillLevel?: string | null;

  @IsString()
  @IsOptional()
  hostProfessionalId?: string | null;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}

export class RegisterEventDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ScanPassDto {
  /** Raw QR / barcode payload from the seeker's pass or ticket. */
  @IsString()
  @MinLength(4)
  payload: string;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsOptional()
  bookingId?: string;
}
