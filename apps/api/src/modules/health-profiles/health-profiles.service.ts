import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthProfileDto, UpdateHealthProfileDto } from '../../dtos/health-profile.dto';

@Injectable()
export class HealthProfilesService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateProfile(consumerId: string, data: CreateHealthProfileDto) {
    const existing = await this.prisma.healthProfile.findFirst({ where: { consumerId } });
    if (existing) {
      return this.prisma.healthProfile.update({ 
        where: { id: existing.id }, 
        data: { ...data, consumerId } 
      });
    }
    return this.prisma.healthProfile.create({ data: { ...data, consumerId } });
  }

  async getProfile(consumerId: string) {
    return this.prisma.healthProfile.findFirst({ where: { consumerId } });
  }

  async updateProfile(consumerId: string, data: UpdateHealthProfileDto) {
    const existing = await this.prisma.healthProfile.findFirst({ where: { consumerId } });
    if (!existing) {
      throw new NotFoundException('Health profile not found');
    }
    return this.prisma.healthProfile.update({ 
      where: { id: existing.id }, 
      data 
    });
  }
}