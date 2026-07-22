import { IsString, IsNumber, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class HealthProfile {
  @IsString()
  id: string;

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

  @IsOptional()
  primaryDosha?: string; // Calculated primary dosha

  @IsOptional()
  secondaryDosha?: string; // Calculated secondary dosha

  @IsOptional()
  tertiaryDosha?: string; // Calculated tertiary dosha

  @IsOptional()
  constitution?: string; // Overall constitution (e.g., Vata-Pitta)

  @IsOptional()
  currentState?: any; // Current imbalances beyond baseline

  @IsOptional()
  recommendations?: any; // Personalized recommendations

  @IsOptional()
  lifestyleFactors?: any; // Diet, sleep, exercise patterns

  @IsOptional()
  medicalHistory?: any; // Relevant medical history

  @IsOptional()
  allergies?: any; // Known allergies

  @IsOptional()
  medications?: any; // Current medications

  @IsDateString()
  updatedAt: Date;
}

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