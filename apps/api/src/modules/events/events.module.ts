import { Module, forwardRef } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { WellnessPassModule } from '../wellness-pass/wellness-pass.module';

@Module({
  imports: [forwardRef(() => WellnessPassModule)],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
