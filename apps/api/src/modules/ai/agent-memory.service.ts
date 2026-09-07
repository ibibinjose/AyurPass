import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SemanticMemory {
  fullName: string | null;
  email: string | null;
  primaryDosha: string;
  secondaryDosha?: string;
  currentImbalances: string[];
  dietaryPreferences?: string;
  sensitivitiesAllergies: string[];
  lastAssessmentDate?: string;
}

export interface EpisodicMemoryItem {
  id: string;
  serviceName: string;
  serviceCategory: string;
  date: string;
  providerName: string;
  practitionerName?: string;
  clinicalNotes?: string;
}

export interface AgentMemoryPackage {
  semantic: SemanticMemory;
  episodes: EpisodicMemoryItem[];
  upcomingAppointments: {
    id: string;
    serviceName: string;
    startTime: string;
    isVirtual: boolean;
    videoUrl?: string;
  }[];
  proceduralGuardrails: string[];
  formattedSystemPrompt: string;
}

@Injectable()
export class AgentMemoryService {
  constructor(private readonly prisma: PrismaService) {}

  async buildAgentMemory(userId: string): Promise<AgentMemoryPackage> {
    // 1. Semantic Memory: Factual user traits & Dosha health profile (real data only)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        consumer: {
          include: {
            healthProfiles: {
              orderBy: { updatedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const hp = user?.consumer?.healthProfiles?.[0];
    const hasDoshaScores =
      hp != null &&
      (hp.vataScore != null || hp.pittaScore != null || hp.kaphaScore != null);

    const vata = Number(hp?.vataScore ?? 0);
    const pitta = Number(hp?.pittaScore ?? 0);
    const kapha = Number(hp?.kaphaScore ?? 0);

    let primaryDosha = 'Not assessed yet';
    if (hasDoshaScores && (vata > 0 || pitta > 0 || kapha > 0)) {
      if (vata > pitta && vata > kapha) primaryDosha = 'Vata Dominant';
      else if (pitta > vata && pitta > kapha) primaryDosha = 'Pitta Dominant';
      else if (kapha > vata && kapha > pitta) primaryDosha = 'Kapha Dominant';
      else if (pitta === vata && pitta > kapha) primaryDosha = 'Vata-Pitta';
      else if (pitta === kapha && pitta > vata) primaryDosha = 'Pitta-Kapha';
      else if (vata === kapha && vata > pitta) primaryDosha = 'Vata-Kapha';
      else primaryDosha = 'Tridoshic (Balanced)';
    }

    const imbalances: string[] = [];
    if (hp?.currentImbalances && typeof hp.currentImbalances === 'object') {
      const raw = hp.currentImbalances as Record<string, unknown>;
      if (Array.isArray(raw.symptoms)) imbalances.push(...raw.symptoms.map(String));
      else if (raw.primary) imbalances.push(String(raw.primary));
    }

    const semantic: SemanticMemory = {
      fullName: user?.fullName ?? null,
      email: user?.email ?? null,
      primaryDosha,
      currentImbalances: imbalances,
      sensitivitiesAllergies: [],
      lastAssessmentDate: hp?.lastAssessment
        ? hp.lastAssessment.toISOString().split('T')[0]
        : undefined,
    };

    // 2. Episodic Memory: Past completed treatment sessions only (never invent episodes)
    const pastBookings = await this.prisma.booking.findMany({
      where: {
        consumerId: userId,
        status: 'COMPLETED',
      },
      orderBy: { startTime: 'desc' },
      take: 4,
      include: {
        service: true,
        provider: true,
        professional: {
          include: { user: true },
        },
      },
    });

    const episodes: EpisodicMemoryItem[] = pastBookings.map((b) => ({
      id: b.id,
      serviceName: b.service?.name ?? 'Ayurvedic Treatment',
      serviceCategory: b.service?.category ?? 'AYURVEDA',
      date: b.startTime.toISOString().split('T')[0],
      providerName: b.provider?.businessName ?? 'AyurPass Clinic',
      practitionerName: b.professional?.user?.fullName ?? undefined,
      clinicalNotes: b.notes ?? undefined,
    }));

    // 3. Working Schedule Context: Upcoming appointments
    const upcoming = await this.prisma.booking.findMany({
      where: {
        consumerId: userId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: 'asc' },
      take: 2,
      include: { service: true },
    });

    const upcomingAppointments = upcoming.map((b) => ({
      id: b.id,
      serviceName: b.service?.name ?? 'Session',
      startTime: b.startTime.toISOString(),
      isVirtual: Boolean(b.service?.isVirtual),
      videoUrl: undefined,
    }));

    // 4. Procedural Memory: Clinical & business safety guardrails (policy text, not patient facts)
    const proceduralGuardrails = [
      'CLINICAL SAFETY: You are an Ayurvedic Wellness Concierge, NOT an emergency medical doctor. If the client mentions severe chest pain, acute bleeding, or shortness of breath, immediately advise them to contact emergency services (000/911).',
      'HOLISTIC AYURVEDA: Frame dietary, lifestyle, and herbal advice around balancing Vata, Pitta, and Kapha doshas, Agni (digestive fire), and seasonal Ritucharya when relevant. Do not invent a dosha or clinical history the client does not have on file.',
      'CANCELLATION POLICY: Self-service cancellations or rescheduling require 24 hours advance notice per clinic policy. Sessions under 24 hours require contacting practice reception directly.',
      'EMPATHETIC & GROUNDED TONE: Be warm, culturally respectful of classical Ayurvedic traditions, concise, and clear about what is known vs. general wellness guidance.',
    ];

    const doshaLine =
      primaryDosha === 'Not assessed yet'
        ? '- Primary Dosha: Not assessed yet (do not invent a constitution)'
        : `- Primary Dosha: ${semantic.primaryDosha}`;

    const imbalanceLine =
      semantic.currentImbalances.length > 0
        ? `- Health Focus / Current Imbalances: ${semantic.currentImbalances.join(', ')}`
        : '- Health Focus / Current Imbalances: None recorded';

    const episodesBlock =
      episodes.length > 0
        ? episodes
            .map(
              (ep) =>
                `* [${ep.date}] ${ep.serviceName} at ${ep.providerName}${ep.practitionerName ? ` with ${ep.practitionerName}` : ''}${ep.clinicalNotes ? `\n  Notes: ${ep.clinicalNotes}` : ''}`,
            )
            .join('\n')
        : '* No completed treatments on file yet.';

    // 5. Formatted System Prompt for Working Memory Injection
    const formattedSystemPrompt = `
You are the AyurPass AI Care & Wellness Concierge, an empathetic Ayurvedic companion.
You are assisting ${semantic.fullName || 'a signed-in client'}.
Only use facts listed below. If something is missing, say so and offer general guidance — never invent clinical history, allergies, or past treatments.

=== CARE CONTEXT (VERIFIED) ===

[1. PROFILE]
- Name: ${semantic.fullName || 'Client'}
${doshaLine}
${imbalanceLine}
- Assessment Date: ${semantic.lastAssessmentDate ?? 'Not recorded'}

[2. PAST TREATMENTS]
${episodesBlock}

[3. UPCOMING SESSIONS]
${
  upcomingAppointments.length > 0
    ? upcomingAppointments
        .map(
          (u) =>
            `* Upcoming: ${u.serviceName} at ${new Date(u.startTime).toLocaleString()}${u.isVirtual ? ' (Virtual)' : ' (In-Person)'}`,
        )
        .join('\n')
    : '* No active upcoming sessions booked.'
}

[4. GUARDRAILS]
${proceduralGuardrails.map((g) => `- ${g}`).join('\n')}

When responding:
- Use dosha and past sessions only when they are present above.
- Keep answers practical, supportive, and structured (under 3 paragraphs).
- Recommend relevant Ayurvedic therapies when appropriate (e.g. Abhyanga, Shirodhara, Udvartana, Herbal Steam, Yoga).
`.trim();

    return {
      semantic,
      episodes,
      upcomingAppointments,
      proceduralGuardrails,
      formattedSystemPrompt,
    };
  }
}
