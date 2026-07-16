import { Controller, Get, Post, Param, Body, Put, Delete, Req } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto } from '../../dtos/package.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import {
  assertProviderAccess,
  assertPackageProviderAccess,
} from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('packages')
export class PackagesController {
  constructor(
    private readonly service: PackagesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() createPackageDto: CreatePackageDto, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, createPackageDto.providerId);
    return this.service.createPackage(createPackageDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get('provider/:id')
  findByProvider(@Param('id') providerId: string) {
    return this.service.findByProvider(providerId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
    @Req() req: AuthedRequest,
  ) {
    await assertPackageProviderAccess(this.prisma, req.user, id);
    return this.service.updatePackage(id, updatePackageDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertPackageProviderAccess(this.prisma, req.user, id);
    return this.service.removePackage(id);
  }
}