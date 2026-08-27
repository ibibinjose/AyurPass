import { Module } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { EnquiriesController } from './enquiries.controller';
import { CommunicationsModule } from '../communications/communications.module';

@Module({
  imports: [CommunicationsModule],
  controllers: [EnquiriesController],
  providers: [EnquiriesService],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}
