import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../../dtos/user.dto';
import { sanitizeUser } from '../../common/sanitize-user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return sanitizeUser(await this.usersService.findById(id));
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return sanitizeUser(await this.usersService.findByEmail(email));
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return sanitizeUser(await this.usersService.createUser(createUserDto));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return sanitizeUser(await this.usersService.updateUser(id, updateUserDto));
  }
}
