import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from '../../dtos/booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.createBooking(createBookingDto);
  }

  @Get('consumer/:id')
  findByConsumer(@Param('id') consumerId: string) {
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