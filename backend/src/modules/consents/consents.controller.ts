import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Put,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ConsentsService } from './consents.service';
import { CreateConsentDto, UpdateConsentDto } from '../../dtos/consent.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { assertSelfOrAdmin } from '../../common/ownership';

@Controller('consents')
export class ConsentsController {
  constructor(private readonly consentsService: ConsentsService) {}

  @Post()
  create(@Body() createConsentDto: CreateConsentDto, @Req() req: AuthedRequest) {
    assertSelfOrAdmin(req.user, createConsentDto.consumerId);
    return this.consentsService.createConsent(createConsentDto);
  }

  @Get('consumer/:id')
  findByConsumer(@Param('id') consumerId: string, @Req() req: AuthedRequest) {
    assertSelfOrAdmin(req.user, consumerId);
    return this.consentsService.getConsentsForConsumer(consumerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthedRequest) {
    const consent = await this.consentsService.findOne(id);
    if (!consent) throw new NotFoundException('Consent not found');
    assertSelfOrAdmin(req.user, consent.consumerId);
    return consent;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateConsentDto: UpdateConsentDto,
    @Req() req: AuthedRequest,
  ) {
    const consent = await this.consentsService.findOne(id);
    if (!consent) throw new NotFoundException('Consent not found');
    assertSelfOrAdmin(req.user, consent.consumerId);
    return this.consentsService.updateConsent(id, updateConsentDto);
  }

  @Delete(':id')
  async revoke(@Param('id') id: string, @Req() req: AuthedRequest) {
    const consent = await this.consentsService.findOne(id);
    if (!consent) throw new NotFoundException('Consent not found');
    assertSelfOrAdmin(req.user, consent.consumerId);
    return this.consentsService.revokeConsent(id);
  }
}