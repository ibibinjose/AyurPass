import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from '../../dtos/professional.dto';
import { UpdateListingStatusDto } from '../../dtos/listing-status.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import {
  assertProviderAccess,
  assertProfessionalProviderAccess,
  assertProviderOwnerOrManager,
} from '../../common/ownership';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('professionals')
export class ProfessionalsController {
  constructor(
    private readonly professionalsService: ProfessionalsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(
    @Body() createProfessionalDto: CreateProfessionalDto,
    @Req() req: AuthedRequest,
  ) {
    await assertProviderAccess(this.prisma, req.user, createProfessionalDto.providerId);
    return this.professionalsService.createProfessional(createProfessionalDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.professionalsService.findAll();
  }

  @Public()
  @Get('provider/:id')
  async findByProvider(@Param('id') providerId: string, @Req() req: AuthedRequest) {
    // Authenticated practice managers see paused/closed team members; public callers only live.
    const authed = Boolean((req as { user?: { sub?: string } }).user?.sub);
    if (authed) {
      try {
        await assertProviderAccess(this.prisma, req.user!, providerId);
        return this.professionalsService.findByProvider(providerId, { includeNonLive: true });
      } catch {
        /* fall through to public filter */
      }
    }
    return this.professionalsService.findByProvider(providerId, { includeNonLive: false });
  }

  @Public()
  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.professionalsService.findBySlug(slug);
  }

  /** /professionals/handle/ayur/anita */
  @Public()
  @Get('handle/:namespace/:handle')
  byHandle(
    @Param('namespace') namespace: string,
    @Param('handle') handle: string,
  ) {
    return this.professionalsService.findByHandle(namespace, handle);
  }

  /** /professionals/vanity/deepak — root vanity (admin-approved) */
  @Public()
  @Get('vanity/:handle')
  byVanity(@Param('handle') handle: string) {
    return this.professionalsService.findByVanity(handle);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professionalsService.findOnePublic(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfessionalDto: UpdateProfessionalDto,
    @Req() req: AuthedRequest,
  ) {
    await assertProfessionalProviderAccess(this.prisma, req.user, id);
    return this.professionalsService.updateProfessional(id, updateProfessionalDto);
  }

  /** Pause / close / reopen practitioner listing. OWNER or MANAGER only. */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateListingStatusDto,
    @Req() req: AuthedRequest,
  ) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
      select: { providerId: true },
    });
    if (!professional) {
      await assertProfessionalProviderAccess(this.prisma, req.user, id);
    } else {
      await assertProviderOwnerOrManager(this.prisma, req.user, professional.providerId);
    }
    return this.professionalsService.updateListingStatus(id, dto.status, dto.reason, req.user.sub);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    await assertProfessionalProviderAccess(this.prisma, req.user, id);
    return this.professionalsService.removeFromPractice(id);
  }
}
