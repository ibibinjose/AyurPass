import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto, UpdateOfferDto } from '../../dtos/offer.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';

@Controller('offers')
export class OffersController {
  constructor(private readonly service: OffersService) {}

  @Public()
  @Get()
  findPublic(@Query('discipline') discipline?: string) {
    return this.service.findPublic(discipline);
  }

  /** Admin listing (all statuses) — must precede the :id route. */
  @Get('admin/all')
  findAllAdmin(@Req() req: AuthedRequest) {
    this.assertAdmin(req);
    return this.service.findAllAdmin();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateOfferDto) {
    this.assertAdmin(req);
    return this.service.create(dto);
  }

  @Put(':id')
  update(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
  ) {
    this.assertAdmin(req);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    this.assertAdmin(req);
    return this.service.remove(id);
  }

  private assertAdmin(req: AuthedRequest) {
    if (req.user.role !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException('Platform admin access required');
    }
  }
}
