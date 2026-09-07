import { Controller, Get, Post, Param, Body, Put, Patch, Delete, Query, Req } from '@nestjs/common';
import { ServiceCategory } from '@prisma/client';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';
import { UpdateListingStatusDto } from '../../dtos/listing-status.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import {
  assertProviderAccess,
  assertServiceProviderAccess,
  assertProviderOwnerOrManager,
} from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly service: ServicesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() createServiceDto: CreateServiceDto, @Req() req: AuthedRequest) {
    await assertProviderAccess(this.prisma, req.user, createServiceDto.providerId);
    return this.service.createService(createServiceDto);
  }

  @Public()
  @Get()
  findAll(@Query('category') category?: ServiceCategory) {
    return this.service.findAll(category);
  }

  @Public()
  @Get('provider/:id')
  async findByProvider(@Param('id') providerId: string, @Req() req: AuthedRequest) {
    const authed = Boolean((req as { user?: { sub?: string } }).user?.sub);
    if (authed) {
      try {
        await assertProviderAccess(this.prisma, req.user!, providerId);
        return this.service.findByProvider(providerId, { includeNonLive: true });
      } catch {
        /* public filter */
      }
    }
    return this.service.findByProvider(providerId, { includeNonLive: false });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOnePublic(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Req() req: AuthedRequest,
  ) {
    await assertServiceProviderAccess(this.prisma, req.user, id);
    return this.service.updateService(id, updateServiceDto);
  }

  /** Pause / close / reopen a treatment. OWNER or MANAGER only. */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateListingStatusDto,
    @Req() req: AuthedRequest,
  ) {
    const row = await this.prisma.service.findUnique({
      where: { id },
      select: { providerId: true },
    });
    if (!row) {
      await assertServiceProviderAccess(this.prisma, req.user, id);
    } else {
      await assertProviderOwnerOrManager(this.prisma, req.user, row.providerId);
    }
    return this.service.updateListingStatus(id, dto.status, dto.reason, req.user.sub);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertServiceProviderAccess(this.prisma, req.user, id);
    return this.service.removeService(id);
  }
}
