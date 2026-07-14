import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from '../../dtos/auth.dto';
import { sanitizeUser } from '../../common/sanitize-user';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Create the user with basic data
    const user = await this.usersService.createUser({
      email: registerDto.email,
      fullName: registerDto.fullName,
      role: registerDto.role || 'CONSUMER',
      passwordHash: hashedPassword,
      phone: registerDto.phone,
    });

    // Create corresponding profile based on role
    if (registerDto.role === 'CONSUMER') {
      await this.prisma.consumer.create({
        data: {
          userId: user.id,
          prakritiScores: registerDto.prakritiScores || {},
          preferences: registerDto.preferences || {},
        },
      });
    } else if (registerDto.role === 'PROFESSIONAL' || registerDto.role === 'PROVIDER_ADMIN') {
      const provider = await this.prisma.provider.create({
        data: {
          userId: user.id,
          businessName: registerDto.businessName || `${registerDto.fullName}'s Practice`,
          type: registerDto.providerType || 'AYURVEDA_CLINIC',
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
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: sanitizeUser(user), ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: sanitizeUser(user), ...tokens };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async getProfile(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      return sanitizeUser(await this.usersService.findById(payload.sub));
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES ||
        '15m') as JwtSignOptions['expiresIn'],
      secret: process.env.JWT_ACCESS_SECRET,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES ||
        '7d') as JwtSignOptions['expiresIn'],
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}