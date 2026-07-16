import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../../dtos/user.dto';
import { sanitizeUser } from '../../common/sanitize-user';
import { Public } from '../../common/public.decorator';

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

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return sanitizeUser(await this.usersService.createUser(createUserDto));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return sanitizeUser(await this.usersService.updateUser(id, updateUserDto));
  }
}
