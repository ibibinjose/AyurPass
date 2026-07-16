import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../../dtos/auth.dto';
import { Public } from '../../common/public.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  async getProfile(@Req() req: Request) {
    // Extract user info from request (would come from JWT middleware in a real implementation)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Authentication token required');
    }
    return this.authService.getProfile(token);
  }
}