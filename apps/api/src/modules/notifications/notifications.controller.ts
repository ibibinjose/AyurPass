import { Body, Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

class RegisterDeviceDto {
  @IsString()
  @MinLength(10)
  token!: string;

  @IsOptional()
  @IsString()
  @IsIn(['ios', 'android', 'web'])
  platform?: string;
}

class RemoveDeviceDto {
  @IsString()
  @MinLength(10)
  token!: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  /** Register Expo push token for the authenticated user. */
  @Post('devices')
  async register(@Req() req: AuthedRequest, @Body() body: RegisterDeviceDto) {
    const row = await this.notifications.upsertDeviceToken(
      req.user.sub,
      body.token.trim(),
      body.platform,
    );
    return { id: row.id, token: row.token, platform: row.platform };
  }

  @Delete('devices')
  async remove(@Req() req: AuthedRequest, @Body() body: RemoveDeviceDto) {
    return this.notifications.removeDeviceToken(req.user.sub, body.token.trim());
  }

  @Get('devices')
  async list(@Req() req: AuthedRequest) {
    return this.notifications.listTokensForUser(req.user.sub);
  }
}
