import { Controller, Get, Post, Body, Param, Put, Req } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from '../../dtos/booking.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertSelfOrAdmin } from '../../common/ownership';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: AuthedRequest) {
    assertSelfOrAdmin(req.user, createBookingDto.consumerId);
    return this.bookingsService.createBooking(createBookingDto);
  }

  @Get('consumer/:id')
  findByConsumer(@Param('id') consumerId: string, @Req() req: AuthedRequest) {
    assertSelfOrAdmin(req.user, consumerId);
    return this.bookingsService.findByConsumer(consumerId);
  }

  @Get('provider/:id')
  findByProvider(@Param('id') providerId: string) {
    return this.bookingsService.findByProvider(providerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.updateBooking(id, updateBookingDto);
  }
}