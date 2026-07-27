import { Controller, Post, Body, Get, Req, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../../dtos/auth.dto';
import { CreateFreeListingDto } from '../../dtos/provider.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { sanitizeUser } from '../../common/sanitize-user';
import { AmplitudeService } from '../../amplitude/amplitude.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private amplitude: AmplitudeService,
  ) {}

  /** Tight limits on credential endpoints to slow brute-force / stuffing. */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    if (result.user) {
      this.amplitude.track(result.user.id, 'User Registered', {
        role: result.user.role,
        auth_method: 'email',
      });
      this.amplitude.identifyUser(result.user.id, { role: result.user.role });
    }
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(dto.token);
    if (result.user?.id) {
      this.amplitude.track(result.user.id, 'Email Verified', {});
    }
    return result;
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('resend-verification')
  async resendVerification(@Req() req: AuthedRequest) {
    return this.authService.resendVerification(req.user.sub);
  }

  /**
   * Authenticated free listing — skip re-register when the user is already signed in.
   * Returns provider + refreshed tokens (role may promote to PROVIDER_ADMIN).
   */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('list-business')
  async listBusiness(@Body() dto: CreateFreeListingDto, @Req() req: AuthedRequest) {
    const result = await this.authService.listBusiness(req.user.sub, dto);
    this.amplitude.track(req.user.sub, 'Business Listed', {
      listing_tier: result.provider.listingTier,
      provider_type: result.provider.type,
    });
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto.email, loginDto.password);
    if (result.user) {
      this.amplitude.track(result.user.id, 'User Logged In', { auth_method: 'email' });
      this.amplitude.identifyUser(result.user.id, { role: result.user.role });
    }
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('google')
  async googleAuth(@Body() body: { email: string; name?: string; idToken?: string; googleId?: string }) {
    const result = await this.authService.socialLogin('google', body.email, body.name, body.googleId || body.idToken);
    if (result.user) {
      this.amplitude.track(result.user.id, 'User Logged In', { auth_method: 'google' });
      this.amplitude.identifyUser(result.user.id, { role: result.user.role });
    }
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('apple')
  async appleAuth(@Body() body: { email: string; name?: string; idToken?: string; appleId?: string }) {
    const result = await this.authService.socialLogin('apple', body.email, body.name, body.appleId || body.idToken);
    if (result.user) {
      this.amplitude.track(result.user.id, 'User Logged In', { auth_method: 'apple' });
      this.amplitude.identifyUser(result.user.id, { role: result.user.role });
    }
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  async getProfile(@Req() req: AuthedRequest) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) throw new NotFoundException('User not found');
    return sanitizeUser(user);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(dto.token, dto.password);
    // Check if the result has a user property (which would be the case for successful login after reset)
    // Otherwise, it's just a success message from the reset itself
    const res = result as { message: string; user?: { id: string } };
    if (res.user?.id) {
      this.amplitude.track(res.user.id, 'Password Reset Completed', {});
    }
    return result;
  }
}