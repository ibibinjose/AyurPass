import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { LISTING_STATUSES } from '../common/listing-status';

export class UpdateListingStatusDto {
  @IsString()
  @IsIn([...LISTING_STATUSES])
  status!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
