import { Controller, Get, Post, Delete, Param, Body, Put } from '@nestjs/common';
import { ConsentsService } from './consents.service';
import { CreateConsentDto, UpdateConsentDto } from '../../dtos/consent.dto';

@Controller('consents')
export class ConsentsController {
  constructor(private readonly consentsService: ConsentsService) {}

  @Post()
  create(@Body() createConsentDto: CreateConsentDto) {
    return this.consentsService.createConsent(createConsentDto);
  }

  @Get('consumer/:id')
  findByConsumer(@Param('id') consumerId: string) {
    return this.consentsService.getConsentsForConsumer(consumerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consentsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateConsentDto: UpdateConsentDto) {
    return this.consentsService.updateConsent(id, updateConsentDto);
  }

  @Delete(':id')
  revoke(@Param('id') id: string) {
    return this.consentsService.revokeConsent(id);
  }
}