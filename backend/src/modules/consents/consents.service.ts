import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsentDto, UpdateConsentDto } from '../../dtos/consent.dto';

@Injectable()
export class ConsentsService {
  constructor(private prisma: PrismaService) {}

  async createConsent(data: CreateConsentDto) {
    return this.prisma.clientConsent.create({ data });
  }

  async getConsentsForConsumer(consumerId: string) {
    return this.prisma.clientConsent.findMany({
      where: { consumerId, status: 'active' },
    });
  }

  async findOne(id: string) {
    return this.prisma.clientConsent.findUnique({
      where: { id },
    });
  }

  async updateConsent(id: string, data: UpdateConsentDto) {
    return this.prisma.clientConsent.update({
      where: { id },
      data,
    });
  }

  async revokeConsent(id: string) {
    return this.prisma.clientConsent.update({
      where: { id },
      data: { status: 'revoked' },
    });
  }
}