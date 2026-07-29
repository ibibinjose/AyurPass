import { Test, TestingModule } from '@nestjs/testing';
import { CrmService } from '../crm.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('CrmService', () => {
  let service: CrmService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    clientRecord: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    clientNote: { create: jest.fn(), delete: jest.fn() },
    booking: { count: jest.fn() },
    order: { count: jest.fn() },
    integration: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CrmService>(CrmService);
    prisma = module.get(PrismaService);
  });

  describe('findOrCreateClientRecord', () => {
    it('should return existing record if found', async () => {
      const existing = { id: 'rec-1', providerId: 'prov-1', consumerId: 'cons-1', tags: [], status: 'active', createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.clientRecord.findUnique.mockResolvedValue(existing);

      const result = await service.findOrCreateClientRecord('prov-1', 'cons-1');

      expect(result).toEqual(existing);
      expect(mockPrisma.clientRecord.create).not.toHaveBeenCalled();
    });

    it('should create record if not found', async () => {
      const created = { id: 'rec-new', providerId: 'prov-1', consumerId: 'cons-1', tags: [], status: 'active', createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.clientRecord.findUnique.mockResolvedValue(null);
      mockPrisma.clientRecord.create.mockResolvedValue(created);

      const result = await service.findOrCreateClientRecord('prov-1', 'cons-1');

      expect(result).toEqual(created);
      expect(mockPrisma.clientRecord.create).toHaveBeenCalledWith({
        data: { providerId: 'prov-1', consumerId: 'cons-1', tags: [] },
      });
    });
  });

  describe('getClientsForProvider', () => {
    it('should return clients with booking and order counts', async () => {
      const records = [
        { id: 'rec-1', providerId: 'prov-1', consumerId: 'cons-1', tags: [], status: 'active', createdAt: new Date(), updatedAt: new Date(), consumer: { user: { id: 'u1', fullName: 'John', email: 'john@test.com', phone: null, avatarUrl: null } } },
      ];
      mockPrisma.clientRecord.findMany.mockResolvedValue(records);
      mockPrisma.booking.count.mockResolvedValue(5);
      mockPrisma.order.count.mockResolvedValue(2);

      const result = await service.getClientsForProvider('prov-1');

      expect(result[0].bookingsCount).toBe(5);
      expect(result[0].ordersCount).toBe(2);
    });
  });

  describe('sendEmailCampaign', () => {
    it('should return success with email count when no integration connected', async () => {
      const clients = [
        { id: 'rec-1', consumer: { user: { email: 'client1@test.com', fullName: 'Client 1' } } },
        { id: 'rec-2', consumer: { user: { email: 'client2@test.com', fullName: 'Client 2' } } },
      ];
      mockPrisma.clientRecord.findMany.mockResolvedValue(clients as any);
      mockPrisma.integration.findFirst.mockResolvedValue(null);

      const result = await service.sendEmailCampaign('prov-1', 'Test Subject', 'Body content');

      expect(result.success).toBe(true);
      expect(result.emails).toContain('client1@test.com');
      expect(result.emails).toContain('client2@test.com');
    });

    it('should handle clients without email', async () => {
      const clients = [
        { id: 'rec-1', consumer: { user: { email: 'valid@test.com', fullName: 'Valid' } } },
        { id: 'rec-2', consumer: { user: null } },
        { id: 'rec-3', consumer: null },
      ];
      mockPrisma.clientRecord.findMany.mockResolvedValue(clients as any);
      mockPrisma.integration.findFirst.mockResolvedValue(null);

      const result = await service.sendEmailCampaign('prov-1', 'Subject', 'Body');

      expect(result.emails).toEqual(['valid@test.com']);
    });

    it('should indicate integration connected when present', async () => {
      const clients = [{ id: 'rec-1', consumer: { user: { email: 'test@test.com', fullName: 'Test' } } }];
      mockPrisma.clientRecord.findMany.mockResolvedValue(clients as any);
      mockPrisma.integration.findFirst.mockResolvedValue({ id: 'int-1', type: 'MAILCHIMP', status: 'connected' });

      const result = await service.sendEmailCampaign('prov-1', 'Subject', 'Body');

      expect(result.success).toBe(true);
    });
  });

  describe('updateClientRecord', () => {
    it('should update tags', async () => {
      mockPrisma.clientRecord.findUnique.mockResolvedValue({ id: 'rec-1', providerId: 'prov-1', consumerId: 'cons-1', tags: [], status: 'active', createdAt: new Date(), updatedAt: new Date() });
      mockPrisma.clientRecord.update.mockResolvedValue({ id: 'rec-1', providerId: 'prov-1', consumerId: 'cons-1', tags: ['vip'], status: 'active', createdAt: new Date(), updatedAt: new Date() });

      const result = await service.updateClientRecord('prov-1', 'cons-1', { tags: ['vip'] });

      expect(mockPrisma.clientRecord.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ tags: ['vip'], updatedAt: expect.any(Date) }),
      }));
    });
  });

  describe('addNote', () => {
    it('should create a client note', async () => {
      mockPrisma.clientRecord.findUnique.mockResolvedValue({ id: 'rec-1', providerId: 'prov-1', consumerId: 'cons-1', tags: [], status: 'active', createdAt: new Date(), updatedAt: new Date() });
      const note = { id: 'note-1', clientRecordId: 'rec-1', authorId: 'user-1', note: 'Test note', createdAt: new Date() };
      mockPrisma.clientNote.create.mockResolvedValue(note);

      const result = await service.addNote('prov-1', 'cons-1', 'user-1', 'Test note');

      expect(result).toEqual(note);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', async () => {
      const note = { id: 'note-1', clientRecordId: 'rec-1', authorId: 'user-1', note: 'To delete', createdAt: new Date() };
      mockPrisma.clientNote.delete.mockResolvedValue(note);

      const result = await service.deleteNote('note-1');

      expect(result).toEqual(note);
    });
  });
});