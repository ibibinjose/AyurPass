import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { accessSecret } from './env';

export interface AuthedUser {
  sub: string;
  email: string;
  role: string;
}

export interface AuthedRequest extends Request {
  user: AuthedUser;
}

/**
 * Registered as the global APP_GUARD: every route requires a valid Bearer
 * access token unless explicitly marked `@Public()`. The decoded identity is
 * attached to `req.user`, so handlers derive the acting user from
 * `req.user.sub` rather than trusting a client-supplied id.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Authentication token required');
    try {
      req.user = await this.jwtService.verifyAsync<AuthedUser>(token, {
        secret: accessSecret(),
      });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
