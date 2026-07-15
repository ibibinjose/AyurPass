import { IsEmail, IsNumber, IsOptional, IsString, Max, Min, IsDateString, IsEnum } from 'class-validator';

export enum GiftCardStatus {
  ACTIVE = 'active',
  DEPLETED = 'depleted',
  VOID = 'void',
  EXPIRED = 'expired'
}

export class GiftCard {
  @IsString()
  id: string;

  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  initialBalance: number;

  @IsNumber()
  @Min(0)
  balance: number;

  @IsEnum(GiftCardStatus)
  status: GiftCardStatus;

  @IsString()
  @IsOptional()
  purchaserId?: string;

  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;
}

export class GiftCardLookup {
  @IsString()
  code: string;
}

export class PurchaseGiftCardDto {
  @IsNumber()
  @Min(10)
  @Max(1000)
  amount: number;

  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class RedeemGiftCardDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateGiftCardDto {
  @IsNumber()
  @Min(0)
  initialBalance: number;

  @IsString()
  @IsOptional()
  purchaserId?: string;

  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;
}