import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const QUALITY_TARGET_TYPES = [
  'provider',
  'professional',
  'service',
  'product',
  'retreat',
  'offer',
  'review',
  'user',
  'other',
] as const;

export type QualityTargetType = (typeof QUALITY_TARGET_TYPES)[number];

export const ABUSE_CATEGORIES = [
  'spam',
  'harassment',
  'fake',
  'safety',
  'copyright',
  'scam',
  'inappropriate',
  'other',
] as const;

export const SUGGESTION_CATEGORIES = [
  'feature',
  'improvement',
  'content',
  'ux',
  'bug',
  'other',
] as const;

export class UpsertReviewDto {
  @IsIn(QUALITY_TARGET_TYPES)
  targetType: QualityTargetType;

  @IsString()
  @MaxLength(64)
  targetId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  body?: string;
}

export class SetReactionDto {
  @IsIn(QUALITY_TARGET_TYPES)
  targetType: QualityTargetType;

  @IsString()
  @MaxLength(64)
  targetId: string;

  /** like | dislike | none (clear) */
  @IsIn(['like', 'dislike', 'none'])
  value: 'like' | 'dislike' | 'none';
}

export const FEEDBACK_STATUSES = ['open', 'reviewing', 'resolved', 'dismissed'] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export class CreateFeedbackDto {
  @IsIn(['abuse', 'suggestion'])
  kind: 'abuse' | 'suggestion';

  @IsString()
  @MaxLength(40)
  category: string;

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  message: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  targetType?: string;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  targetId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  targetLabel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  pageUrl?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  contactName?: string;
}

export class UpdateFeedbackStatusDto {
  @IsIn(FEEDBACK_STATUSES)
  status: FeedbackStatus;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  adminNote?: string;
}
