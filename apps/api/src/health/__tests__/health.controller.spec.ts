import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from '../health.controller';
import { PrismaService } from '../../prisma/prisma.service';

describe('HealthController readiness', () => {
  const prisma = { $queryRaw: jest.fn() } as unknown as PrismaService;
  const controller = new HealthController(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('returns ready only when the database query succeeds', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

    await expect(controller.getReady()).resolves.toMatchObject({
      status: 'ready',
      database: 'ok',
    });
  });

  it('returns a 503-compatible exception when the database is unreachable', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('connection refused'));

    await expect(controller.getReady()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
