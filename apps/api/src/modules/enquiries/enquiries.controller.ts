import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from '../../dtos/enquiry.dto';
import { Public } from '../../common/public.decorator';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { AmplitudeService } from '../../amplitude/amplitude.service';

@Controller('enquiries')
export class EnquiriesController {
  constructor(
    private readonly service: EnquiriesService,
    private readonly amplitude: AmplitudeService,
  ) {}

  /** Public — anyone can send a provider an enquiry from their listing page. */
  @Public()
  @Post()
  async create(@Body() dto: CreateEnquiryDto) {
    const result = await this.service.create(dto);
    this.amplitude.track(result.id, 'Enquiry Submitted', {
      enquiry_id: result.id,
      provider_id: result.providerId,
      has_retreat: !!result.retreatId,
    });
    return result;
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
