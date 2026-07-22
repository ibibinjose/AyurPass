import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../../dtos/user.dto';
import { sanitizeUser } from '../../common/sanitize-user';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertPlatformAdmin, assertSelfOrAdmin } from '../../common/ownership';

/**
 * User directory endpoints. Email lookup is used by provider dashboards
 * (team invite, calendar walk-in, virtual terminal) — restricted to
 * authenticated staff, not the public internet.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('email/:email')
  async findByEmail(@Param('email') email: string, @Req() req: AuthedRequest) {
    this.assertStaffOrAdmin(req);
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    return sanitizeUser(user);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: AuthedRequest) {
    // Self, platform admin, or provider staff looking up a client.
    if (req.user.sub !== id && req.user.role !== 'PLATFORM_ADMIN') {
      this.assertStaffOrAdmin(req);
    }
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return sanitizeUser(user);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: AuthedRequest) {
    assertPlatformAdmin(req.user);
    return sanitizeUser(await this.usersService.createUser(createUserDto));
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthedRequest,
  ) {
    assertSelfOrAdmin(req.user, id);
    return sanitizeUser(await this.usersService.updateUser(id, updateUserDto));
  }

  private assertStaffOrAdmin(req: AuthedRequest): void {
    const role = req.user.role;
    if (
      role === 'PLATFORM_ADMIN' ||
      role === 'PROVIDER_ADMIN' ||
      role === 'PROFESSIONAL'
    ) {
      return;
    }
    throw new ForbiddenException('Staff access required');
  }
}
