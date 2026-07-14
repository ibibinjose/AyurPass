import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTreatmentPlanDto {
  @IsString()
  consumerId: string;

  @IsString()
  @IsOptional()
  professionalId?: string;

  @IsString()
  providerId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsOptional()
  phases?: any;

  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  aiGenerated?: boolean;
}

export class UpdateTreatmentPlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsOptional()
  phases?: any;

  @IsString()
  @IsOptional()
  status?: string;
}