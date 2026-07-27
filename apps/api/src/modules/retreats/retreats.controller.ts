import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { RetreatCategory } from '@prisma/client';
import { RetreatsService } from './retreats.service';
import {
  CreateRetreatDto,
  CurateRetreatDto,
  UpdateRetreatDto,
} from '../../dtos/retreat.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { AmplitudeService } from '../../amplitude/amplitude.service';

@Controller('retreats')
export class RetreatsController {
  constructor(
    private readonly service: RetreatsService,
    private readonly amplitude: AmplitudeService,
  ) {}

  @Public()
  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('category') category?: RetreatCategory,
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('month') month?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('maxDuration') maxDuration?: string,
    @Query('featured') featured?: string,
  ) {
    return this.service.findAll({
      q,
      category,
      city,
      country,
      month,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      maxDuration: maxDuration ? Number(maxDuration) : undefined,
      featured: featured === 'true',
    });
  }

  /** The acting provider's own retreats (any status). */
  @Get('mine')
  listMine(@Req() req: AuthedRequest) {
    return this.service.listMine(req.user.sub);
  }

  @Public()
  @Get('provider/:providerId')
  byProvider(@Param('providerId') providerId: string) {
    return this.service.findByProvider(providerId);
  }

  @Public()
  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post()
  async create(@Req() req: AuthedRequest, @Body() dto: CreateRetreatDto) {
    const result = await this.service.create(req.user.sub, dto);
    this.amplitude.track(req.user.sub, 'Retreat Created', {
      retreat_id: result.id,
      category: result.category,
      duration_days: result.durationDays,
    });
    return result;
  }

  @Put(':id')
  update(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateRetreatDto,
  ) {
    return this.service.update(req.user.sub, req.user.role, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.service.remove(req.user.sub, req.user.role, id);
  }

  /** Platform-admin "handpick" + verification. */
  @Patch(':id/curation')
  curate(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: CurateRetreatDto,
  ) {
    if (req.user.role !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException('Platform admin access required');
    }
    return this.service.curate(id, dto);
  }
}
