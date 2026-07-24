import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProviderType } from '@prisma/client';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from '../../dtos/auth.dto';
import { CreateFreeListingDto } from '../../dtos/provider.dto';
import { sanitizeUser } from '../../common/sanitize-user';
import { accessSecret, refreshSecret } from '../../common/env';
import { slugifyPublicName, withSlugSuffix } from '../../common/slug';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Logged-in user claims a free directory listing without re-registering.
   * Creates Provider (+ Professional when missing), promotes role to PROVIDER_ADMIN,
   * and returns fresh tokens so the JWT role matches.
   */
  async listBusiness(userId: string, dto: CreateFreeListingDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { provider: true, professional: true },
    });
    if (!existing) throw new NotFoundException('User not found');
    if (existing.provider) {
      throw new ConflictException(
        'You already have a practice listing. Open the dashboard to manage it.',
      );
    }

    const businessName = dto.businessName.trim();
    if (!businessName) {
      throw new ConflictException('Business name is required.');
    }

    const listingTier =
      dto.listingTier === 'BOOKING' ? 'BOOKING' : 'FREE_LISTING';
    const type = (dto.type || 'AYURVEDA_CLINIC') as ProviderType;
    const slug = await this.uniqueProviderSlug(businessName);

    const provider = await this.prisma.provider.create({
      data: {
        userId: existing.id,
        businessName,
        type,
        listingTier,
        slug,
        currency: dto.currency?.trim().toUpperCase().slice(0, 3) || 'AUD',
        brandProfile: (dto.brandProfile ?? undefined) as object | undefined,
        address: (dto.address ?? undefined) as object | undefined,
      },
    });

    if (!existing.professional) {
      await this.prisma.professional.create({
        data: {
          userId: existing.id,
          providerId: provider.id,
          title: 'Founder',
          specializations: [],
        },
      });
    }

    // Seekers and pros who claim a practice become practice admins.
    if (existing.role === 'CONSUMER' || existing.role === 'PROFESSIONAL') {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: { role: 'PROVIDER_ADMIN' },
      });
    }

    // Create OWNER staff record for the provider creator
    await this.prisma.providerStaff.create({
      data: {
        providerId: provider.id,
        userId: existing.id,
        role: 'OWNER',
        inviteStatus: 'ACCEPTED',
        acceptedAt: new Date(),
        displayName: existing.fullName || null,
      },
    });

    const user = await this.usersService.findById(existing.id);
    if (!user) throw new NotFoundException('User not found');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      provider,
      user: sanitizeUser(user),
      ...tokens,
    };
  }

  private async uniqueProviderSlug(businessName: string): Promise<string> {
    const base = slugifyPublicName(businessName, 'practice');
    let n = 0;
    while (true) {
      const slug = n === 0 ? base : withSlugSuffix(base, n);
      const hit = await this.prisma.provider.findFirst({
        where: { slug },
        select: { id: true },
      });
      if (!hit) return slug;
      n += 1;
    }
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const role = registerDto.role || 'CONSUMER';

    const user = await this.usersService.createUser({
      email: registerDto.email,
      fullName: registerDto.fullName,
      role,
      passwordHash: hashedPassword,
      phone: registerDto.phone,
      emailVerifiedAt: null,
    });

    const locationPrefs: Record<string, unknown> = {};
    if (registerDto.city?.trim()) locationPrefs.city = registerDto.city.trim();
    if (registerDto.country?.trim()) locationPrefs.country = registerDto.country.trim();
    if (registerDto.countryCode?.trim()) {
      locationPrefs.countryCode = registerDto.countryCode.trim().toUpperCase().slice(0, 2);
    }
    if (typeof registerDto.lat === 'number' && Number.isFinite(registerDto.lat)) {
      locationPrefs.lat = registerDto.lat;
    }
    if (typeof registerDto.lng === 'number' && Number.isFinite(registerDto.lng)) {
      locationPrefs.lng = registerDto.lng;
    }

    if (role === 'CONSUMER') {
      const basePrefs =
        registerDto.preferences && typeof registerDto.preferences === 'object'
          ? (registerDto.preferences as Record<string, unknown>)
          : {};
      const preferences: Record<string, unknown> = { ...basePrefs };
      if (Object.keys(locationPrefs).length) {
        preferences.location = locationPrefs;
      }
      await this.prisma.consumer.create({
        data: {
          userId: user.id,
          prakritiScores: registerDto.prakritiScores || {},
          preferences: preferences as object,
        },
      });
    } else if (role === 'PROFESSIONAL' || role === 'PROVIDER_ADMIN') {
      const address =
        Object.keys(locationPrefs).length > 0
          ? {
              city: (locationPrefs.city as string) || undefined,
              country: (locationPrefs.country as string) || undefined,
              countryCode: (locationPrefs.countryCode as string) || undefined,
              lat: locationPrefs.lat as number | undefined,
              lng: locationPrefs.lng as number | undefined,
            }
          : undefined;

      const provider = await this.prisma.provider.create({
        data: {
          userId: user.id,
          businessName: registerDto.businessName || `${registerDto.fullName}'s Practice`,
          type: registerDto.providerType || 'AYURVEDA_CLINIC',
          listingTier: registerDto.listingTier === 'FREE_LISTING' ? 'FREE_LISTING' : 'BOOKING',
          ...(address ? { address } : {}),
        },
      });

      await this.prisma.professional.create({
        data: {
          userId: user.id,
          providerId: provider.id,
          title: registerDto.title,
          specializations: registerDto.specializations || [],
          bio: registerDto.bio,
        },
      });

      await this.prisma.providerStaff.create({
        data: {
          providerId: provider.id,
          userId: user.id,
          role: 'OWNER',
          inviteStatus: 'ACCEPTED',
          acceptedAt: new Date(),
          displayName: registerDto.fullName || null,
        },
      });
    }

    // Fire-and-forget verification email (never block registration).
    void this.sendVerificationEmail(user.id, user.email, user.fullName || 'there');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user: sanitizeUser(user),
      ...tokens,
      emailVerificationSent: true,
    };
  }

  private emailVerifySecret(userId: string, email: string) {
    return `${accessSecret()}:email-verify:${userId}:${email.toLowerCase()}`;
  }

  private async sendVerificationEmail(userId: string, email: string, fullName: string) {
    try {
      const token = this.jwtService.sign(
        { sub: userId, email, purpose: 'email_verify' },
        {
          expiresIn: '48h',
          secret: this.emailVerifySecret(userId, email),
        },
      );
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verifyLink = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
      await this.mailService.sendEmailVerification(email, fullName, verifyLink);
    } catch (err) {
      // Logged in mail service; registration must still succeed.
    }
  }

  async verifyEmail(token: string) {
    type VerifyPayload = { sub?: string; email?: string; purpose?: string };
    let decoded: VerifyPayload | null = null;
    try {
      decoded = this.jwtService.decode(token) as VerifyPayload | null;
    } catch {
      throw new UnauthorizedException('Invalid verification link');
    }
    if (!decoded?.sub || !decoded?.email || decoded.purpose !== 'email_verify') {
      throw new UnauthorizedException('Invalid verification link');
    }

    const user = await this.usersService.findById(decoded.sub);
    if (!user) throw new NotFoundException('User not found');
    if (user.email.toLowerCase() !== decoded.email.toLowerCase()) {
      throw new UnauthorizedException('Verification link does not match this account');
    }
    if (user.emailVerifiedAt) {
      return {
        message: 'Email already verified',
        user: sanitizeUser(user),
      };
    }

    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.emailVerifySecret(user.id, user.email),
      });
    } catch {
      throw new UnauthorizedException('Verification link is invalid or has expired');
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
      include: {
        consumer: true,
        provider: true,
        professional: { include: { provider: true } },
      },
    });

    return {
      message: 'Email verified successfully',
      user: sanitizeUser(updated),
    };
  }

  async resendVerification(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.emailVerifiedAt) {
      return { message: 'Email is already verified' };
    }
    await this.sendVerificationEmail(user.id, user.email, user.fullName || 'there');
    return { message: 'Verification email sent' };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: sanitizeUser(user), ...tokens };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: refreshSecret(),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES ||
        '15m') as JwtSignOptions['expiresIn'],
      secret: accessSecret(),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES ||
        '7d') as JwtSignOptions['expiresIn'],
      secret: refreshSecret(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Standard security practice: return a generic success message
    // even if the user is not found to prevent email enumeration attacks.
    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    const payload = { sub: user.id };
    const secret = accessSecret() + (user.passwordHash || '');
    const token = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.fullName || 'User',
      resetLink,
    );

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub: string } | null = null;
    try {
      payload = this.jwtService.decode(token) as { sub: string } | null;
    } catch (err) {
      throw new UnauthorizedException('Invalid token format');
    }

    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const secret = accessSecret() + (user.passwordHash || '');
      await this.jwtService.verifyAsync(token, { secret });
    } catch (err) {
      throw new UnauthorizedException('Password reset token is invalid or has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    return { message: 'Password has been reset successfully' };
  }
}