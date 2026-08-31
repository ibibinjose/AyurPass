import { Body, Controller, Get, NotFoundException, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  SocialAuthDto,
  SocialCredentialsDto,
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

  /** Tight limits on credential endpoints to slow brute-force and stuffing attacks. */
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
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    const result = await this.authService.login(loginDto.email, loginDto.password);
    const user = result.user as { id?: string; role?: string } | undefined;
    if (user?.id) {
      this.amplitude.track(user.id, 'User Signed In', {
        auth_method: 'email',
        role: user.role,
      });
      this.amplitude.identifyUser(user.id, { role: user.role });
    }
    return result;
  }

  /**
   * A persisted client session begins with this route. It is intentionally a
   * lightweight authenticated lookup so web and mobile restore the user once
   * per application start rather than re-authenticate on every navigation.
   */
  @Get('profile')
  async profile(@Req() req: AuthedRequest) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) throw new NotFoundException('User not found');
    return sanitizeUser(user);
  }

  /** Refresh an expired access token without interrupting a valid 7-day session. */
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('social')
  social(@Body() dto: SocialAuthDto): Promise<any> {
    return this.socialSignIn(dto.provider, dto);
  }

  /** Backwards-compatible aliases used by the dashboard social buttons. */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('google')
  google(@Body() dto: SocialCredentialsDto): Promise<any> {
    return this.socialSignIn('google', dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('apple')
  apple(@Body() dto: SocialCredentialsDto): Promise<any> {
    return this.socialSignIn('apple', dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('change-password')
  changePassword(
    @Body() dto: { currentPassword?: string; newPassword: string },
    @Req() req: AuthedRequest,
  ) {
    return this.authService.changePassword(
      req.user.sub,
      dto.currentPassword ?? '',
      dto.newPassword,
    );
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
  resendVerification(@Req() req: AuthedRequest) {
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

  /** Upgrade a signed-in seeker or professional to a practice owner without another registration flow. */
  @Post('list-business')
  async listBusiness(@Req() req: AuthedRequest, @Body() dto: CreateFreeListingDto): Promise<any> {
    const result = await this.authService.listBusiness(req.user.sub, dto);
    this.amplitude.track(req.user.sub, 'Practice Listing Created', {
      provider_id: result.provider?.id,
      listing_tier: result.provider?.listingTier,
    });
    return result;
  }

  private async socialSignIn(
    provider: 'google' | 'apple',
    dto: SocialCredentialsDto,
  ): Promise<any> {
    const result = await this.authService.socialLogin(provider, dto.email, dto.name, dto.idToken);
    const user = result.user as { id?: string; role?: string } | undefined;
    if (user?.id) {
      this.amplitude.track(user.id, 'User Signed In', {
        auth_method: provider,
        role: user.role,
      });
      this.amplitude.identifyUser(user.id, { role: user.role });
    }
    return result;
  }
}
