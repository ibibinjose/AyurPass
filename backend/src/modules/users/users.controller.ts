import { Controller, Get, Param, Post, Body, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../../dtos/user.dto';
import { sanitizeUser } from '../../common/sanitize-user';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertPlatformAdmin, assertSelfOrAdmin } from '../../common/ownership';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return sanitizeUser(await this.usersService.findById(id));
  }

  @Public()
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return sanitizeUser(await this.usersService.findByEmail(email));
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
}