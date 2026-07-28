import { Body, Controller, Post } from '@nestjs/common';
import { AiChatDto } from '../../dtos/ai-chat.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('chat')
  chat(@Body() dto: AiChatDto) {
    return this.ai.chat(dto.messages, dto.model);
  }
}
