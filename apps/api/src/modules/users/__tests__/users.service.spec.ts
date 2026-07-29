import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'CONSUMER' as const,
    passwordHash: null,
    phone: null,
    avatarUrl: null,
    emailVerifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    consumer: null,
    provider: null,
    professional: null,
    staffMemberships: [],
    devicePushTokens: [],
    jobApplications: [],
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user with relations when found', async () => {
      const userWithRelations = {
        ...mockUser,
        consumer: { userId: 'user-1', code: 'ABC123', prakritiScores: {}, preferences: {}, location: null },
        provider: null,
        professional: null,
      };
      mockPrisma.user.findUnique.mockResolvedValue(userWithRelations);

      const result = await service.findById('user-1');

      expect(result).toEqual(userWithRelations);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          consumer: true,
          provider: true,
          professional: { include: { provider: true } },
        },
      });
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user with provided data', async () => {
      const createData = {
        email: 'new@example.com',
        fullName: 'New User',
        role: 'CONSUMER' as const,
        passwordHash: '$2b$10$hashed',
      };
      const createdUser = { ...mockUser, ...createData };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await service.createUser(createData);

      expect(result).toEqual(createdUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({ data: createData });
    });

    it('should pass proper Prisma types to createUser', async () => {
      const createData = {
        email: 'typed@example.com',
        fullName: 'Typed User',
        role: 'PROFESSIONAL' as const,
      };
      mockPrisma.user.create.mockResolvedValue({ ...mockUser, ...createData });

      const result = await service.createUser(createData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({ data: createData });
    });
  });

  describe('updateUser', () => {
    it('should update user with provided data', async () => {
      const updateData = { fullName: 'Updated Name' };
      const updatedUser = { ...mockUser, fullName: 'Updated Name' };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser('user-1', updateData);

      expect(result.fullName).toBe('Updated Name');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateData,
      });
    });
  });
});