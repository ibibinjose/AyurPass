import { IsString, IsDate, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus, PaymentMethod } from '@prisma/client';

export class Booking {
  @IsString()
  id: string;

  @IsString()
  consumerId: string;

  @IsString()
  serviceId: string;

  @IsString()
  @IsOptional()
  professionalId?: string;

  @IsString()
  providerId: string;

  @IsString()
  @IsOptional()
  roomId?: string;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  paymentIntentId?: string;

  @IsString()
  @IsOptional()
  paymentStatus?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  posTransactionId?: string;

  @IsNumber()
  @IsOptional()
  giftCardRedeemed?: number;

  @IsNumber()
  @IsOptional()
  pointsRedeemed?: number;

  @IsNumber()
  @IsOptional()
  pointsEarned?: number;

  @IsNumber()
  @IsOptional()
  platformCommission?: number;

  @IsNumber()
  @IsOptional()
  providerPayout?: number;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;
}

export class CreateBookingDto {
  @IsString()
  consumerId: string;

  @IsString()
  serviceId: string;

  @IsString()
  @IsOptional()
  professionalId?: string;

  @IsString()
  providerId: string;

  @IsString()
  @IsOptional()
  roomId?: string;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  /** International contact phone for this booking (e.g. +61412345678). */
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  posTransactionId?: string;

  @IsString()
  @IsOptional()
  paymentStatus?: string;

  /** Recurrence frequency: 'none' | 'weekly' | 'biweekly' | 'monthly' */
  @IsString()
  @IsOptional()
  recurrence?: string;

  /** Number of occurrences to create in a recurring series (e.g. 4, 8, 12) */
  @IsNumber()
  @IsOptional()
  recurrenceCount?: number;
}

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  roomId?: string | null;

  @IsString()
  @IsOptional()
  professionalId?: string | null;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startTime?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endTime?: Date;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  posTransactionId?: string;

  @IsString()
  @IsOptional()
  paymentStatus?: string;
}
