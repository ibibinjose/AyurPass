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
  async register(@Body() registerDto: RegisterDto): Promise<any> {
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
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<any> {
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

  @Post('instant-verify')
  async instantVerify(@Req() req: AuthedRequest) {
    const result = await this.authService.verifyCurrentEmail(req.user.sub);
    if (result.user?.id) {
      this.amplitude.track(result.user.id, 'Email Verified', { method: 'instant' });
    }
    return result;
  }
}
