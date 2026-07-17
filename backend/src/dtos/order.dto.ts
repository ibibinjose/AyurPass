import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export class OrderItemInputDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class OrderItemDto {
  @IsString()
  id: string;

  @IsString()
  orderId: string;

  @IsString()
  productId: string;

  @IsInt()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  totalPrice: number;
}

export class Order {
  @IsString()
  id: string;

  @IsString()
  consumerId: string;

  @IsString()
  providerId: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNumber()
  subtotal: number;

  @IsNumber()
  @IsOptional()
  platformCommission?: number;

  @IsNumber()
  @IsOptional()
  providerPayout?: number;

  @IsString()
  @IsOptional()
  paymentStatus?: string;

  @IsString()
  @IsOptional()
  paymentIntentId?: string;

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

  @IsObject()
  @IsOptional()
  shippingAddress?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;
}

export class CreateOrderDto {
  @IsString()
  consumerId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @IsObject()
  @IsOptional()
  shippingAddress?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  posTransactionId?: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  paymentStatus?: string;
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  notes?: string;

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