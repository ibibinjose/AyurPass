import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { QualityService } from '../quality.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('QualityService follow persistence', () => {
  let service: QualityService;

  const mockPrisma = {
    provider: { findUnique: jest.fn(), update: jest.fn() },
    professional: { findUnique: jest.fn(), update: jest.fn() },
    service: { findUnique: jest.fn(), update: jest.fn() },
    product: { findUnique: jest.fn() },
    retreat: { findUnique: jest.fn() },
    offer: { findUnique: jest.fn() },
    review: { aggregate: jest.fn(), count: jest.fn(), groupBy: jest.fn(), findUnique: jest.fn() },
    reaction: { count: jest.fn(), findUnique: jest.fn(), deleteMany: jest.fn(), upsert: jest.fn() },
    follow: { findMany: jest.fn(), deleteMany: jest.fn(), upsert: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QualityService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<QualityService>(QualityService);
  });

  it('lists follows newest first for the signed-in member', async () => {
    const rows = [
      { targetType: 'provider', targetId: 'practice-1', createdAt: new Date('2026-08-24') },
    ];
    mockPrisma.follow.findMany.mockResolvedValue(rows);

    await expect(service.listFollows('member-1')).resolves.toEqual(rows);
    expect(mockPrisma.follow.findMany).toHaveBeenCalledWith({
      where: { userId: 'member-1' },
      orderBy: { createdAt: 'desc' },
      select: { targetType: true, targetId: true, createdAt: true },
    });
  });

  it('persists a valid provider follow and returns the refreshed list', async () => {
    const rows = [{ targetType: 'provider', targetId: 'practice-1', createdAt: new Date() }];
    mockPrisma.provider.findUnique.mockResolvedValue({ id: 'practice-1' });
    mockPrisma.follow.upsert.mockResolvedValue({ id: 'follow-1' });
    mockPrisma.follow.findMany.mockResolvedValue(rows);

    const result = await service.setFollow('member-1', {
      targetType: 'provider',
      targetId: 'practice-1',
      value: true,
    });

    expect(mockPrisma.follow.upsert).toHaveBeenCalledWith({
      where: {
        userId_targetType_targetId: {
          userId: 'member-1',
          targetType: 'provider',
          targetId: 'practice-1',
        },
      },
      create: { userId: 'member-1', targetType: 'provider', targetId: 'practice-1' },
      update: {},
    });
    expect(result).toMatchObject({ following: true, targetType: 'provider', targetId: 'practice-1' });
    expect(result.follows).toEqual(rows);
  });

  it('removes an existing practitioner follow without failing when it is already absent', async () => {
    mockPrisma.professional.findUnique.mockResolvedValue({ id: 'pro-1' });
    mockPrisma.follow.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.follow.findMany.mockResolvedValue([]);

    const result = await service.setFollow('member-1', {
      targetType: 'professional',
      targetId: 'pro-1',
      value: false,
    });

    expect(mockPrisma.follow.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'member-1', targetType: 'professional', targetId: 'pro-1' },
    });
    expect(result).toEqual({
      following: false,
      targetType: 'professional',
      targetId: 'pro-1',
      follows: [],
    });
  });

  it('rejects follows for a removed provider', async () => {
    mockPrisma.provider.findUnique.mockResolvedValue(null);

    await expect(
      service.setFollow('member-1', {
        targetType: 'provider',
        targetId: 'missing-practice',
        value: true,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(mockPrisma.follow.upsert).not.toHaveBeenCalled();
  });
});
