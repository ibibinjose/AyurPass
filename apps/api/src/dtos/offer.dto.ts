import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsString() @IsOptional() @MaxLength(2000) description?: string;
  @IsString() @IsOptional() discipline?: string;
  @IsString() @IsOptional() @MaxLength(40) discountLabel?: string;
  @IsString() @IsOptional() @MaxLength(40) code?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsString() @IsOptional() @MaxLength(60) ctaLabel?: string;
  @IsString() @IsOptional() ctaUrl?: string;
  @IsBoolean() @IsOptional() featured?: boolean;
  @IsBoolean() @IsOptional() active?: boolean;
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
}

export class UpdateOfferDto {
  @IsString() @IsOptional() @MaxLength(160) title?: string;
  @IsString() @IsOptional() @MaxLength(2000) description?: string;
  @IsString() @IsOptional() discipline?: string;
  @IsString() @IsOptional() @MaxLength(40) discountLabel?: string;
  @IsString() @IsOptional() @MaxLength(40) code?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsString() @IsOptional() @MaxLength(60) ctaLabel?: string;
  @IsString() @IsOptional() ctaUrl?: string;
  @IsBoolean() @IsOptional() featured?: boolean;
  @IsBoolean() @IsOptional() active?: boolean;
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
}
