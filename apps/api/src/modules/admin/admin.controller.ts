import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

export class SetVerificationDto {
  @IsIn(['pending', 'verified', 'rejected'])
  status: string;
}

export class ReviewVanityDto {
  @IsIn(['approved', 'rejected', 'pending'])
  status: 'approved' | 'rejected' | 'pending';

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('overview')
  overview() {
    return this.service.overview();
  }

  @Get('providers')
  providers() {
    return this.service.listProviders();
  }

  @Put('providers/:id/verification')
  setVerification(@Param('id') id: string, @Body() dto: SetVerificationDto) {
    return this.service.setVerification(id, dto.status);
  }

  /** Root vanity handle requests — protect brands & celebrities. */
  @Get('vanity')
  vanityRequests() {
    return this.service.listVanityRequests();
  }

  @Put('vanity/:kind/:id')
  reviewVanity(
    @Param('kind') kind: string,
    @Param('id') id: string,
    @Body() dto: ReviewVanityDto,
  ) {
    const k = kind === 'provider' ? 'provider' : 'professional';
    return this.service.reviewVanity(k, id, dto.status, dto.note);
  }

  @Get('bookings')
  bookings() {
    return this.service.listBookings();
  }

  @Get('users')
  users() {
    return this.service.listUsers();
  }
}
