import { Controller, Get, Post, Param, Body, Put, Delete, Req } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from '../../dtos/room.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertProviderAccess, assertRoomProviderAccess } from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly service: RoomsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, createRoomDto.providerId);
    return this.service.createRoom(createRoomDto);
  }

  @Get('provider/:id')
  async findByProvider(@Param('id') providerId: string, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, providerId);
    return this.service.findByProvider(providerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertRoomProviderAccess(this.prisma, req.user, id);
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @Req() req: AuthedRequest,
  ) {
    await assertRoomProviderAccess(this.prisma, req.user, id);
    return this.service.updateRoom(id, updateRoomDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertRoomProviderAccess(this.prisma, req.user, id);
    return this.service.removeRoom(id);
  }
}