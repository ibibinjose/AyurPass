import { Module } from '@nestjs/common';
import { HealthProfilesService } from './health-profiles.service';
import { HealthProfilesController } from './health-profiles.controller';

@Module({
  controllers: [HealthProfilesController],
  providers: [HealthProfilesService],
  exports: [HealthProfilesService],
})
export class HealthProfilesModule {}