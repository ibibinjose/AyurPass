import { Controller, Get, Post, Body, Param, Put, Query, Req } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from '../../dtos/booking.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import {
  assertSelfOrAdmin,
  assertProviderAccess,
  assertBookingParty,
} from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly prisma: PrismaService,
  ) {}

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
  async findByProvider(
    @Param('id') providerId: string,
    @Req() req: AuthedRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('professionalId') professionalId?: string,
    @Query('roomId') roomId?: string,
  ) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.bookingsService.findByProvider(providerId, {
      from,
      to,
      professionalId,
      roomId,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertBookingParty(this.prisma, req.user, id);
    return this.bookingsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req: AuthedRequest,
  ) {
    await assertBookingParty(this.prisma, req.user, id);
    return this.bookingsService.updateBooking(id, updateBookingDto);
  }
}