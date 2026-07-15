import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface AuthedUser {
  sub: string;
  email: string;
  role: string;
}

export interface AuthedRequest extends Request {
  user: AuthedUser;
}

/**
 * Verifies the Bearer access token and attaches the decoded identity to the
 * request. Downstream handlers derive the acting user from `req.user.sub`
 * rather than trusting a client-supplied id — so a caller can only ever act
 * on their own loyalty balance / gift cards.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Authentication token required');
    try {
      req.user = await this.jwtService.verifyAsync<AuthedUser>(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'ayurpass_access_secret',
      });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
