import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailService: jest.Mocked<MailService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'CONSUMER' as const,
    passwordHash: '$2b$10$hashedpassword',
    emailVerifiedAt: null,
    phone: null,
    avatarUrl: null,
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
      update: jest.fn(),
      create: jest.fn(),
    },
    provider: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    consumer: { create: jest.fn() },
    professional: { create: jest.fn() },
    providerStaff: { create: jest.fn() },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  };

  const mockMailService = {
    sendEmailVerification: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
  });

  describe('login', () => {
    beforeEach(() => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return tokens for valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.login('test@example.com', 'password123');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('notfound@example.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should indicate email verification is needed when not verified', async () => {
      const unverifiedUser = { ...mockUser, emailVerifiedAt: null };
      mockUsersService.findByEmail.mockResolvedValue(unverifiedUser);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.login('test@example.com', 'password123');

      expect(result.needsEmailVerification).toBe(true);
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'password123',
      fullName: 'New User',
      role: 'CONSUMER' as const,
    };

    it('should create a new user and return tokens', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue({ ...mockUser, email: registerDto.email });
      mockUsersService.findById.mockResolvedValue({ ...mockUser, email: registerDto.email });
      jwtService.sign.mockReturnValue('token');

      const result = await service.register(registerDto);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(mockUsersService.createUser).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should send verification email asynchronously', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue({ ...mockUser, email: registerDto.email });
      mockUsersService.findById.mockResolvedValue({ ...mockUser, email: registerDto.email });
      jwtService.sign.mockReturnValue('token');

      await service.register(registerDto);

      await new Promise((r) => setTimeout(r, 100));
      expect(mailService.sendEmailVerification).toHaveBeenCalled();
    });
  });

  describe('uniqueProviderSlug', () => {
    it('should return base slug when no collision exists', async () => {
      mockPrisma.provider.findFirst.mockResolvedValue(null);

      const slug = await (service as any).uniqueProviderSlug('My Business');

      expect(slug).toBe('my-business');
      expect(mockPrisma.provider.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should append suffix on collision', async () => {
      mockPrisma.provider.findFirst
        .mockResolvedValueOnce({ id: 'existing-1' })
        .mockResolvedValueOnce(null);

      const slug = await (service as any).uniqueProviderSlug('My Business');

      expect(slug).toBe('my-business-1');
      expect(mockPrisma.provider.findFirst).toHaveBeenCalledTimes(2);
    });

    it('should throw after MAX_RETRIES attempts', async () => {
      mockPrisma.provider.findFirst.mockResolvedValue({ id: 'collision' });

      await expect((service as any).uniqueProviderSlug('Test')).rejects.toThrow(/Could not generate unique slug/);
    });
  });

  describe('verifyEmail', () => {
    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.decode.mockReturnValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockJwtService.decode.mockReturnValue({ sub: 'user-1', email: 'test@example.com', purpose: 'email_verify' });
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.verifyEmail('some-token')).rejects.toThrow(NotFoundException);
    });

    it('should return already verified message if already verified', async () => {
      const verifiedUser = { ...mockUser, emailVerifiedAt: new Date() };
      mockJwtService.decode.mockReturnValue({ sub: 'user-1', email: 'test@example.com', purpose: 'email_verify' });
      mockUsersService.findById.mockResolvedValue(verifiedUser);

      const result = await service.verifyEmail('some-token');

      expect(result.message).toBe('Email already verified');
    });
  });

  describe('forgotPassword', () => {
    it('should return generic message even for non-existent user (security)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('notexist@example.com');

      expect(result.message).toContain('If the email exists');
    });

    it('should send password reset email for existing user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('reset-token');
      mockMailService.sendPasswordResetEmail.mockResolvedValue(true);

      const result = await service.forgotPassword('test@example.com');

      expect(result.message).toContain('If the email exists');
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        expect.stringContaining('reset-token'),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens for valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      mockUsersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});