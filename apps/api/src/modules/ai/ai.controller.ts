import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AiChatDto } from '../../dtos/ai-chat.dto';
import { AiService } from './ai.service';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { Public } from '../../common/public.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Public()
  @Post('chat')
  chat(@Body() dto: AiChatDto) {
    return this.ai.chat(dto.messages, dto.model);
  }

  @Public()
  @Post('concierge')
  concierge(
    @Body() dto: { message: string; history?: any[]; model?: string },
    @Req() req: AuthedRequest,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      return this.ai.conciergeChat('guest', dto.message, dto.history, dto.model);
    }
    return this.ai.conciergeChat(userId, dto.message, dto.history, dto.model);
  }

  @Public()
  @Get('memory-profile')
  memoryProfile(@Req() req: AuthedRequest) {
    const userId = req.user?.sub;
    if (!userId) {
      return this.ai.getMemoryProfile('guest');
    }
    return this.ai.getMemoryProfile(userId);
  }
}
