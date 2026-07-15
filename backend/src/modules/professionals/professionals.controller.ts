import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from '../../dtos/professional.dto';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post()
  create(@Body() createProfessionalDto: CreateProfessionalDto) {
    return this.professionalsService.createProfessional(createProfessionalDto);
  }

  @Get()
  findAll() {
    return this.professionalsService.findAll();
  }

  @Get('provider/:id')
  findByProvider(@Param('id') providerId: string) {
    return this.professionalsService.findByProvider(providerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professionalsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProfessionalDto: UpdateProfessionalDto) {
    return this.professionalsService.updateProfessional(id, updateProfessionalDto);
  }
}