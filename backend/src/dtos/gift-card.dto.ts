import { IsEmail, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class PurchaseGiftCardDto {
  @IsNumber()
  @Min(10)
  @Max(1000)
  amount: number;

  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  message?: string;
}
