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

    const memory = await this.agentMemory.buildAgentMemory(userId);

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
    const hasDosha = dosha !== 'Not assessed yet';
    const name = memory.semantic.fullName ? ` ${memory.semantic.fullName}` : '';
    const lastSession = memory.episodes[0];

    if (q.includes('reschedule') || q.includes('cancel')) {
      return (
        `Namaste${name}. Appointments can usually be rescheduled or cancelled online up to 24 hours prior to the session from your Bookings tab. ` +
        `If your session is within 24 hours, please reach out directly to the clinic front desk so they can adjust room turnaround and treatment preparations.`
      );
    }

    if (q.includes('food') || q.includes('eat') || q.includes('diet') || q.includes('detox')) {
      const constitutionHint = hasDosha
        ? `Based on your recorded ${dosha} profile, `
        : 'As general Ayurvedic guidance, ';
      const aftercare = lastSession
        ? `Following ${lastSession.serviceName}, `
        : '';
      return (
        `${constitutionHint}${aftercare}it is helpful to support digestive Agni with freshly prepared, warm meals. ` +
        `Sipping warm water with ginger or cumin, avoiding cold drinks, and favoring light kitchari or steamed greens are common post-care suggestions. ` +
        `This is general wellness guidance — not a personal diagnosis.`
      );
    }

    if (q.includes('stiff') || q.includes('pain') || q.includes('stress') || q.includes('next') || q.includes('book')) {
      const contextBits = [
        hasDosha ? `your ${dosha} profile` : null,
        lastSession ? `your last session (${lastSession.serviceName})` : null,
      ].filter(Boolean);
      const lead =
        contextBits.length > 0
          ? `Given ${contextBits.join(' and ')}, `
          : '';
      return (
        `${lead}a therapeutic Abhyanga (warm medicated oil massage) followed by herbal Swedana steam or a soothing Shirodhara is often helpful for stiffness and grounding. ` +
        `You can browse and book sessions through the AyurPass catalog or with your preferred practitioner.`
      );
    }

    const memoryHint = hasDosha
      ? `I can see your recorded ${dosha} constitution${lastSession ? ' and past treatments' : ''} on file. `
      : lastSession
        ? 'I can see your past treatments on file. '
        : 'I do not yet have a dosha assessment or treatment history on file for you. ';

    return (
      `Namaste${name}. ${memoryHint}` +
      `How can I assist you with Ayurvedic wellness guidance or your appointment schedule today?`
    );
  }
}
