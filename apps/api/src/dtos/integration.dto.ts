import { IsString, IsNumber, IsOptional, IsBoolean, IsDate, IsEnum } from 'class-validator';

export enum ChannelType {
  WEB = 'web',
  MOBILE = 'mobile',
  API = 'api',
  POS = 'pos',
  EMAIL = 'email',
  SMS = 'sms'
}

export class Channel {
  @IsString()
  id: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  webhookUrl?: string;

  @IsDate()
  @IsOptional()
  lastSyncAt?: Date;

  @IsNumber()
  @IsOptional()
  syncFrequency?: number; // in minutes

  @IsOptional()
  config?: any; // Channel-specific configuration
}

export class LoyaltySummary {
  @IsString()
  accountId: string;

  @IsNumber()
  pointsBalance: number;

  @IsNumber()
  lifetimePoints: number;

  @IsNumber()
  @IsOptional()
  pointsToNextReward?: number;

  @IsString()
  @IsOptional()
  tier?: string;

  @IsNumber()
  @IsOptional()
  tierProgress?: number; // Progress toward next tier (0-100)

  @IsNumber()
  @IsOptional()
  totalRewardsRedeemed?: number;

  @IsNumber()
  @IsOptional()
  totalValueRedeemed?: number;

  @IsDate()
  @IsOptional()
  lastActivityDate?: Date;

  @IsDate()
  @IsOptional()
  tierExpirationDate?: Date;

  @IsOptional()
  rewardsAvailable?: any[]; // List of available rewards
}

export class SyncReport {
  @IsString()
  id: string;

  @IsString()
  integrationId: string;

  @IsString()
  status: string; // 'success', 'failed', 'in_progress'

  @IsDate()
  syncStartAt: Date;

  @IsDate()
  @IsOptional()
  syncEndAt?: Date;

  @IsNumber()
  recordsProcessed: number;

  @IsNumber()
  recordsCreated: number;

  @IsNumber()
  recordsUpdated: number;

  @IsNumber()
  recordsFailed: number;

  @IsOptional()
  errors?: any[]; // Array of error objects

  @IsOptional()
  summary?: any; // Additional sync summary data

  @IsString()
  @IsOptional()
  message?: string;
}