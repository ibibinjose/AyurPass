import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import { AiChatMessageDto } from '../../dtos/ai-chat.dto';

const DEFAULT_MODEL = 'MiniMax-M2.7';
const DEFAULT_BASE_URL = 'https://api.scx.ai/v1';

@Injectable()
export class AiService {
  private readonly client: OpenAI | null;
  private readonly defaultModel: string;

  constructor() {
    const apiKey = process.env.SCX_API_KEY;
    this.defaultModel = process.env.SCX_MODEL || DEFAULT_MODEL;

    this.client = apiKey
      ? new OpenAI({
          apiKey,
          baseURL: process.env.SCX_BASE_URL || DEFAULT_BASE_URL,
        })
      : null;
  }

  async chat(messages: AiChatMessageDto[], model?: string) {
    if (!this.client) {
      throw new ServiceUnavailableException('AI provider is not configured.');
    }
    if (!messages.length) {
      throw new BadRequestException('At least one message is required.');
    }

    const completion = await this.client.chat.completions.create({
      model: model || this.defaultModel,
      messages,
    });

    return {
      model: completion.model,
      message: completion.choices[0]?.message ?? null,
      usage: completion.usage ?? null,
    };
  }
}
