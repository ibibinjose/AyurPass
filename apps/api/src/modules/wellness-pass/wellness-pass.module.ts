import { Module } from '@nestjs/common';
import { WellnessPassController } from './wellness-pass.controller';
import { WellnessPassService } from './wellness-pass.service';

@Module({
  controllers: [WellnessPassController],
  providers: [WellnessPassService],
  exports: [WellnessPassService],
})
export class WellnessPassModule {}
