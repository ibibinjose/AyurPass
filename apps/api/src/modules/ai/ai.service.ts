import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import { AiChatMessageDto } from '../../dtos/ai-chat.dto';
import { AgentMemoryService, AgentMemoryPackage } from './agent-memory.service';

const DEFAULT_MODEL = 'MiniMax-M2.7';
const DEFAULT_BASE_URL = 'https://api.scx.ai/v1';

@Injectable()
export class AiService {
  private readonly client: OpenAI | null;
  private readonly defaultModel: string;

  constructor(private readonly agentMemory: AgentMemoryService) {
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

  async getMemoryProfile(userId: string): Promise<AgentMemoryPackage> {
    return this.agentMemory.buildAgentMemory(userId);
  }

  async conciergeChat(
    userId: string,
    userMessage: string,
    history: AiChatMessageDto[] = [],
    model?: string,
  ) {
    if (!userMessage?.trim()) {
      throw new BadRequestException('Message is required.');
    }

    // 1. Compile Agent Memory: Semantic (Facts/Dosha) + Episodic (Past Sessions) + Procedural (Policies)
    const memory = await this.agentMemory.buildAgentMemory(userId);

    // 2. Prepare Working Memory: Sliding context window (last 6 turns)
    const trimmedHistory = (history || []).slice(-6);
    const messages: AiChatMessageDto[] = [
      { role: 'system', content: memory.formattedSystemPrompt },
      ...trimmedHistory,
      { role: 'user', content: userMessage.trim() },
    ];

    let replyText = '';

    if (this.client) {
      try {
        const completion = await this.client.chat.completions.create({
          model: model || this.defaultModel,
          messages,
          temperature: 0.7,
        });
        replyText = completion.choices[0]?.message?.content ?? '';
      } catch {
        replyText = this.generateClinicalFallback(memory, userMessage);
      }
    } else {
      replyText = this.generateClinicalFallback(memory, userMessage);
    }

    return {
      reply: replyText,
      memorySnapshot: {
        dosha: memory.semantic.primaryDosha,
        clientName: memory.semantic.fullName,
        episodesCount: memory.episodes.length,
        upcomingCount: memory.upcomingAppointments.length,
        guardrailsCount: memory.proceduralGuardrails.length,
      },
    };
  }

  private generateClinicalFallback(memory: AgentMemoryPackage, query: string): string {
    const q = query.toLowerCase();
    const dosha = memory.semantic.primaryDosha;
    const name = memory.semantic.fullName ? ` ${memory.semantic.fullName}` : '';
    const lastSession = memory.episodes[0];

    if (q.includes('reschedule') || q.includes('cancel')) {
      return (
        `Namaste${name}. As per our practice cancellation policy, appointments can be easily rescheduled or cancelled online up to 24 hours prior to the session from your Bookings tab. ` +
        `If your session is within 24 hours, our therapists kindly request you reach out directly to the clinic front desk so we can adjust room turnaround and treatment preparations.`
      );
    }

    if (q.includes('food') || q.includes('eat') || q.includes('diet') || q.includes('detox')) {
      return (
        `Based on your ${dosha} constitution, it is best to support your digestive Agni with freshly prepared, warm meals. ` +
        `Following sessions like ${lastSession?.serviceName ?? 'your recent treatment'}, we recommend sipping warm water with ginger or cumin, avoiding cold or iced drinks, and favoring light kitchari, steamed greens, and spiced mung dal to allow your tissues (dhatus) to gently integrate the therapeutic oils.`
      );
    }

    if (q.includes('stiff') || q.includes('pain') || q.includes('stress') || q.includes('next') || q.includes('book')) {
      return (
        `Given your ${dosha} profile and your last session (${lastSession?.serviceName ?? 'Ayurvedic session'}), ` +
        `a therapeutic Abhyanga (warm medicated oil massage) followed by herbal Swedana steam or a soothing Shirodhara would be deeply rejuvenating for pacifying physical stiffness and grounding nervous energy. ` +
        `You can easily book your next session through our online catalog or with your preferred practitioner.`
      );
    }

    return (
      `Namaste${name}. I am keeping your ${dosha} constitution and past treatment history in mind. ` +
      `How can I assist you with your personalized Ayurvedic wellness, herbal lifestyle, or appointment schedule today?`
    );
  }
}
