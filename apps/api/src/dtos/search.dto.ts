import { IsString, IsOptional, IsNumber, IsEnum, MaxLength, MinLength } from 'class-validator';

export enum SearchTypeFilter {
  ALL = 'all',
  AYURVEDA = 'AYURVEDA_CLINIC',
  YOGA = 'YOGA_STUDIO',
  SPA = 'LUXURY_SPA',
  MEDITATION = 'MEDITATION_CENTER',
  HEALTH_CLUB = 'HEALTH_CLUB',
}

export class AiSearchDto {
  @IsString()
  @MinLength(1, { message: 'Search query must not be empty.' })
  @MaxLength(300, { message: 'Search query is too long. Max 300 characters.' })
  q: string;

  @IsOptional()
  @IsEnum(SearchTypeFilter)
  type?: SearchTypeFilter;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
