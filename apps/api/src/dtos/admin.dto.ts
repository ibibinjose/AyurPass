import { IsString, IsNumber, IsOptional, IsBoolean, IsDate, IsEnum } from 'class-validator';
import { ProviderType } from '@prisma/client';

export class AdminOverview {
  @IsNumber()
  @IsOptional()
  totalUsers?: number;

  @IsNumber()
  @IsOptional()
  totalProviders?: number;

  @IsNumber()
  @IsOptional()
  totalBookings?: number;

  @IsNumber()
  @IsOptional()
  totalRevenue?: number;

  @IsNumber()
  @IsOptional()
  monthlyGrowth?: number;

  @IsNumber()
  @IsOptional()
  activeSubscriptions?: number;

  @IsNumber()
  @IsOptional()
  pendingVerifications?: number;

  @IsNumber()
  @IsOptional()
  avgRating?: number;

  @IsOptional()
  recentActivity?: any[];
}

export class AdminProvider {
  @IsString()
  id: string;

  @IsString()
  code: string;

  @IsString()
  businessName: string;

  @IsEnum(ProviderType)
  type: ProviderType;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsOptional()
  brandProfile?: any;

  @IsOptional()
  address?: any;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  stripeAccountId?: string;

  @IsString()
  @IsOptional()
  subscriptionTier?: string;

  @IsString()
  verificationStatus: string;

  @IsDate()
  createdAt: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  totalProfessionals?: number;

  @IsNumber()
  @IsOptional()
  totalServices?: number;

  @IsNumber()
  @IsOptional()
  totalBookings?: number;

  @IsNumber()
  @IsOptional()
  totalRevenue?: number;
}