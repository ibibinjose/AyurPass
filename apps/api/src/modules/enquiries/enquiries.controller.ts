import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from '../../dtos/enquiry.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly service: EnquiriesService) {}

  /** Public — anyone can send a provider an enquiry from their listing page. */
  @Public()
  @Post()
  create(@Body() dto: CreateEnquiryDto) {
    return this.service.create(dto);
  }

  /** The acting provider's leads (identity from the token). */
  @Get()
  listMine(@Req() req: AuthedRequest) {
    return this.service.listMine(req.user.sub);
  }

  @Patch(':id')
  updateStatus(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateEnquiryDto,
  ) {
    return this.service.updateStatus(req.user.sub, id, dto);
  }
}
