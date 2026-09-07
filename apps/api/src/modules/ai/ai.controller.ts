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

  /** Memory-backed care concierge — requires a signed-in user. */
  @Post('concierge')
  concierge(
    @Body() dto: { message: string; history?: any[]; model?: string },
    @Req() req: AuthedRequest,
  ) {
    return this.ai.conciergeChat(req.user.sub, dto.message, dto.history, dto.model);
  }

  /** Structured care memory for the signed-in user only. */
  @Get('memory-profile')
  memoryProfile(@Req() req: AuthedRequest) {
    return this.ai.getMemoryProfile(req.user.sub);
  }
}
