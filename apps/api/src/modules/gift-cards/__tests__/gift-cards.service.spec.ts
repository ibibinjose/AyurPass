import { Test, TestingModule } from '@nestjs/testing';
import { GiftCardsService } from '../gift-cards.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('GiftCardsService', () => {
  let service: GiftCardsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    giftCard: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    giftCardTransaction: { create: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiftCardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GiftCardsService>(GiftCardsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('generateUniqueCode', () => {
    it('should generate a code with AYUR prefix', async () => {
      mockPrisma.giftCard.findUnique.mockResolvedValue(null);

      const code = await (service as any).generateUniqueCode();

      expect(code).toMatch(/^AYUR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    });

    it('should retry on collision', async () => {
      mockPrisma.giftCard.findUnique
        .mockResolvedValueOnce({ id: 'existing' })
        .mockResolvedValueOnce(null);

      const code = await (service as any).generateUniqueCode();

      expect(mockPrisma.giftCard.findUnique).toHaveBeenCalledTimes(2);
      expect(code).toMatch(/^AYUR-/);
    });

    it('should throw BadRequestException after 5 failed attempts', async () => {
      mockPrisma.giftCard.findUnique.mockResolvedValue({ id: 'collision' });

      await expect((service as any).generateUniqueCode()).rejects.toThrow(BadRequestException);
      expect(mockPrisma.giftCard.findUnique).toHaveBeenCalledTimes(5);
    });
  });

  describe('lookup', () => {
    it('should return card details when found', async () => {
      const card = { code: 'AYUR-TEST-CODE', balance: 100, status: 'active' as const };
      mockPrisma.giftCard.findUnique.mockResolvedValue(card);

      const result = await service.lookup('AYUR-TEST-CODE');

      expect(result).toEqual(card);
    });

    it('should throw NotFoundException when card not found', async () => {
      mockPrisma.giftCard.findUnique.mockResolvedValue(null);

      await expect(service.lookup('INVALID')).rejects.toThrow(NotFoundException);
    });

    it('should normalize code to uppercase', async () => {
      mockPrisma.giftCard.findUnique.mockResolvedValue({ code: 'AYUR-TEST', balance: 50, status: 'active' as const });

      await service.lookup('ayur-test');

      expect(mockPrisma.giftCard.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { code: 'AYUR-TEST' } }));
    });
  });

  describe('redeem', () => {
    const mockCard = { id: 'card-1', code: 'AYUR-TEST', balance: 100, status: 'active' as const };

    it('should return 0 for zero maxDollars', async () => {
      const result = await service.redeem('AYUR-TEST', 0, 'test');

      expect(result).toBe(0);
      expect(mockPrisma.giftCard.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent card', async () => {
      mockPrisma.giftCard.findUnique.mockResolvedValue(null);

      await expect(service.redeem('INVALID', 50, 'test')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for voided card', async () => {
      mockPrisma.giftCard.findUnique.mockResolvedValue({ ...mockCard, status: 'void' as const });

      await expect(service.redeem('AYUR-TEST', 50, 'test')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for fully depleted card', async () => {
      mockPrisma.giftCard.findUnique.mockResolvedValue({ ...mockCard, balance: 0, status: 'depleted' as const });

      await expect(service.redeem('AYUR-TEST', 50, 'test')).rejects.toThrow(BadRequestException);
    });

    it('should apply partial redemption when balance is less than requested', async () => {
      mockPrisma.giftCard.findUnique.mockResolvedValue({ ...mockCard, balance: 30 });
      mockPrisma.giftCard.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.$transaction.mockImplementation(async (operations: unknown[]) => {
        return operations;
      });

      const result = await service.redeem('AYUR-TEST', 50, 'test');

      expect(result).toBe(30);
    });

    it('should throw on concurrent race condition (updateMany count !== 1)', async () => {
      mockPrisma.giftCard.findUnique.mockResolvedValue({ ...mockCard, balance: 100 });
      mockPrisma.giftCard.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.redeem('AYUR-TEST', 50, 'test')).rejects.toThrow(BadRequestException);
    });
  });

  describe('myCards', () => {
    it('should return all cards for purchaser', async () => {
      const cards = [
        { id: 'card-1', code: 'AYUR-ONE', balance: 100, status: 'active' },
        { id: 'card-2', code: 'AYUR-TWO', balance: 50, status: 'depleted' },
      ];
      mockPrisma.giftCard.findMany.mockResolvedValue(cards);

      const result = await service.myCards('user-1');

      expect(result).toEqual(cards);
      expect(mockPrisma.giftCard.findMany).toHaveBeenCalledWith({
        where: { purchaserId: 'user-1' },
        include: { transactions: { orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});