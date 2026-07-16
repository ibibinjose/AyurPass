import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/** Public payload — a visitor reaching out to a provider from their listing page. */
export class CreateEnquiryDto {
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}

export class UpdateEnquiryDto {
  @IsIn(['new', 'read', 'archived'])
  status: string;
}
