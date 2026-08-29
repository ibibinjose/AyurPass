import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AgentMemoryService } from './agent-memory.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, AgentMemoryService],
  exports: [AiService, AgentMemoryService],
})
export class AiModule {}
