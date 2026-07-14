import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto } from '../../dtos/package.dto';

@Controller('packages')
export class PackagesController {
  constructor(private readonly service: PackagesService) {}

  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.service.createPackage(createPackageDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('provider/:id')
  findByProvider(@Param('id') providerId: string) {
    return this.service.findByProvider(providerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.service.updatePackage(id, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removePackage(id);
  }
}