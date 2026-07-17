import { Controller, Get, Param, Body, Put, Query, Req } from '@nestjs/common';
import { ProviderType } from '@prisma/client';
import { ProvidersService } from './providers.service';
import { UpdateProviderDto } from '../../dtos/provider.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertProviderAccess } from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly service: ProvidersService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('type') type?: ProviderType,
    @Query('city') city?: string,
    @Query('country') country?: string,
  ) {
    return this.service.findAll({ q, type, city, country });
  }

  @Public()
  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  /** Root vanity — ayurpass.com/:handle for approved practices. */
  @Public()
  @Get('vanity/:handle')
  byVanity(@Param('handle') handle: string) {
    return this.service.findByVanity(handle);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
    @Req() req: AuthedRequest,
  ) {
    await assertProviderAccess(this.prisma, req.user, id);
    return this.service.updateProvider(id, updateProviderDto);
  }
}