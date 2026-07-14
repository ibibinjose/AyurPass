import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

export class SetVerificationDto {
  @IsIn(['pending', 'verified', 'rejected'])
  status: string;
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

  @Get('bookings')
  bookings() {
    return this.service.listBookings();
  }

  @Get('users')
  users() {
    return this.service.listUsers();
  }
}
