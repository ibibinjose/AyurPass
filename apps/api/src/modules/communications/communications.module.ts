import { Module } from '@nestjs/common';
import { CommunicationsScheduler } from './communications.scheduler';
import { CommunicationsService } from './communications.service';

@Module({
  providers: [CommunicationsService, CommunicationsScheduler],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
