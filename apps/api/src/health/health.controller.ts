import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'AyurPass Backend API',
      version: '1.1.0',
    };
  }

  @Public()
  @Get('ready')
  async getReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'ok', timestamp: new Date().toISOString() };
    } catch {
      throw new ServiceUnavailableException({
        status: 'degraded',
        database: 'unreachable',
        timestamp: new Date().toISOString(),
      });
    }
  }
}