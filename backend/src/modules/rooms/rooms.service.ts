import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from '../../dtos/room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(data: CreateRoomDto) {
    return this.prisma.room.create({ data });
  }

  async findByProvider(providerId: string) {
    return this.prisma.room.findMany({
      where: { providerId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.room.findUnique({ where: { id } });
  }

  async updateRoom(id: string, data: UpdateRoomDto) {
    return this.prisma.room.update({ where: { id }, data });
  }

  async removeRoom(id: string) {
    // Detach the room from bookings so history survives the room's removal.
    await this.prisma.booking.updateMany({ where: { roomId: id }, data: { roomId: null } });
    return this.prisma.room.delete({ where: { id } });
  }
}
