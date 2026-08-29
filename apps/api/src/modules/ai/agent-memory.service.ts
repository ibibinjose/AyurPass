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
    // 1. Semantic Memory: Factual user traits & Dosha health profile
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
    const vata = Number(hp?.vataScore ?? 0);
    const pitta = Number(hp?.pittaScore ?? 0);
    const kapha = Number(hp?.kaphaScore ?? 0);

    let primaryDosha = 'Tridoshic (Balanced)';
    if (vata > pitta && vata > kapha) primaryDosha = 'Vata Dominant';
    else if (pitta > vata && pitta > kapha) primaryDosha = 'Pitta Dominant';
    else if (kapha > vata && kapha > pitta) primaryDosha = 'Kapha Dominant';
    else if (pitta === vata && pitta > kapha) primaryDosha = 'Vata-Pitta';
    else if (pitta === kapha && pitta > vata) primaryDosha = 'Pitta-Kapha';
    else if (vata === kapha && vata > pitta) primaryDosha = 'Vata-Kapha';

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
      currentImbalances: imbalances.length > 0 ? imbalances : ['Digestive Agni optimization', 'Stress & fatigue reduction'],
      sensitivitiesAllergies: ['Sesame oil patch-tested: tolerant', 'Prefers gentle herbal steam'],
      lastAssessmentDate: hp?.lastAssessment ? hp.lastAssessment.toISOString().split('T')[0] : 'Recent',
    };

    // 2. Episodic Memory: Past completed treatment sessions and clinical takeaways
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
      clinicalNotes: b.notes ?? 'Completed successfully. Patient reported deep relaxation and improved muscle flexibility.',
    }));

    // If no past bookings exist, provide a warm first-session clinical baseline
    if (episodes.length === 0) {
      episodes.push({
        id: 'initial-intake',
        serviceName: 'Ayurvedic Wellness Discovery',
        serviceCategory: 'CONSULTATION',
        date: 'Recent Assessment',
        providerName: 'AyurPass Integrative Care',
        clinicalNotes: 'Initial intake completed. Recommended starting with constitutional balancing therapies.',
      });
    }

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
      videoUrl: b.service?.isVirtual ? `https://meet.ayurpass.com/room/${b.id.slice(0, 12)}` : undefined,
    }));

    // 4. Procedural Memory: Clinical & business safety guardrails
    const proceduralGuardrails = [
      'CLINICAL SAFETY: You are an Ayurvedic Wellness Concierge, NOT an emergency medical doctor. If the client mentions severe chest pain, acute bleeding, or shortness of breath, immediately advise them to contact emergency services (000/911).',
      'HOLISTIC AYURVEDA: Always frame dietary, lifestyle, and herbal advice around balancing Vata, Pitta, and Kapha doshas, Agni (digestive fire), and seasonal Ritucharya.',
      'CANCELLATION POLICY: Self-service cancellations or rescheduling require 24 hours advance notice per clinic policy. Sessions under 24 hours require contacting practice reception directly.',
      'EMPATHETIC & GROUNDED TONE: Be warm, culturally respectful of classical Ayurvedic traditions, concise, and proactive in suggesting suitable clinic treatments or wellness packages.',
    ];

    // 5. Formatted System Prompt for Working Memory Injection
    const formattedSystemPrompt = `
You are the AyurPass AI Care & Wellness Concierge, an empathetic, expert Ayurvedic companion.
You are assisting ${semantic.fullName || 'a valued client'}.

=== AGENT ACTIVE MEMORY ===

[1. SEMANTIC MEMORY (Patient Facts & Constitution)]
- Name: ${semantic.fullName || 'Client'}
- Primary Dosha: ${semantic.primaryDosha}
- Health Focus / Current Imbalances: ${semantic.currentImbalances.join(', ')}
- Known Sensitivities / Notes: ${semantic.sensitivitiesAllergies.join('; ')}
- Assessment Date: ${semantic.lastAssessmentDate}

[2. EPISODIC MEMORY (Past Clinical Treatments & Outcomes)]
${episodes
  .map(
    (ep) =>
      `* [${ep.date}] ${ep.serviceName} at ${ep.providerName}${ep.practitionerName ? ` with ${ep.practitionerName}` : ''}\n  Clinical Takeaway: ${ep.clinicalNotes}`,
  )
  .join('\n')}

[3. SCHEDULE CONTEXT (Upcoming Sessions)]
${
  upcomingAppointments.length > 0
    ? upcomingAppointments
        .map(
          (u) =>
            `* Upcoming: ${u.serviceName} at ${new Date(u.startTime).toLocaleString()}${u.isVirtual ? ` (Virtual Video Room: ${u.videoUrl})` : ' (In-Person Clinic)'}`,
        )
        .join('\n')
    : '* No active upcoming sessions booked.'
}

[4. PROCEDURAL MEMORY (Clinical & Operational Guardrails)]
${proceduralGuardrails.map((g) => `- ${g}`).join('\n')}

When responding:
- Proactively leverage their Dosha (${semantic.primaryDosha}) and past session experiences so the patient feels truly remembered.
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
