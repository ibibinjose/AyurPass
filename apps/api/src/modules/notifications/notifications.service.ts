import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertDeviceToken(userId: string, token: string, platform?: string) {
    return this.prisma.devicePushToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform },
    });
  }

  async removeDeviceToken(userId: string, token: string) {
    const existing = await this.prisma.devicePushToken.findUnique({ where: { token } });
    if (!existing || existing.userId !== userId) return { removed: false };
    await this.prisma.devicePushToken.delete({ where: { token } });
    return { removed: true };
  }

  async listTokensForUser(userId: string) {
    return this.prisma.devicePushToken.findMany({
      where: { userId },
      select: { id: true, token: true, platform: true, updatedAt: true },
    });
  }
}
