import { Module } from '@nestjs/common';
import { RetreatsService } from './retreats.service';
import { RetreatsController } from './retreats.controller';

@Module({
  controllers: [RetreatsController],
  providers: [RetreatsService],
  exports: [RetreatsService],
})
export class RetreatsModule {}
