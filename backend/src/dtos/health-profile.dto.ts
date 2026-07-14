import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateHealthProfileDto {
  @IsString()
  consumerId: string;

  @IsNumber()
  @IsOptional()
  vataScore?: number;

  @IsNumber()
  @IsOptional()
  pittaScore?: number;

  @IsNumber()
  @IsOptional()
  kaphaScore?: number;

  @IsOptional()
  questionnaireResponses?: any;

  @IsOptional()
  currentImbalances?: any;

  @IsDateString()
  @IsOptional()
  lastAssessment?: string;
}

export class UpdateHealthProfileDto {
  @IsNumber()
  @IsOptional()
  vataScore?: number;

  @IsNumber()
  @IsOptional()
  pittaScore?: number;

  @IsNumber()
  @IsOptional()
  kaphaScore?: number;

  @IsOptional()
  questionnaireResponses?: any;

  @IsOptional()
  currentImbalances?: any;

  @IsDateString()
  @IsOptional()
  lastAssessment?: string;
}