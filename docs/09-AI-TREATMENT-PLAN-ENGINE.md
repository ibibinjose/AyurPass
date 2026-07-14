# AyurPass – AI Treatment Plan Generator

## Overview
The AI layer generates personalized, multi-week Ayurvedic treatment plans that professionals can review, edit, and approve.

## Input Signals
- Prakriti scores (`health_profiles.prakriti_scores`)
- Current imbalances (`health_profiles.current_imbalances`)
- Consumer goals and lifestyle data
- Booking history + adherence
- Optional wearable data (sleep, HRV, stress)

## Output Structure
```json
{
  "planName": "8-Week Pitta-Pacifying Rejuvenation",
  "durationWeeks": 8,
  "phases": [
    {
      "phase": 1,
      "name": "Detox & Reset",
      "durationWeeks": 2,
      "focus": ["panchakarma", "diet"],
      "recommendedServices": ["uuid1", "uuid2"],
      "recommendedProducts": ["product-uuid"]
    },
    {
      "phase": 2,
      "name": "Rejuvenation & Balance",
      "durationWeeks": 4,
      ...
    }
  ],
  "milestones": [...],
  "doshaTarget": { "vata": 30, "pitta": 25, "kapha": 45 }
}
```

## Recommended Architecture

### Layer 1: Rules Engine (Deterministic)
- Strong Vedic knowledge base (dosha qualities, contraindicated practices, seasonal rules)
- Hard constraints (e.g., never recommend heating therapies for high Pitta)

### Layer 2: LLM / Fine-tuned Model
- Fine-tuned on Ayurvedic texts + anonymized successful treatment plans
- Prompt includes:
  - Consumer profile
  - Current imbalances
  - Goals
  - Previous plans + outcomes (if available)
  - Safety guardrails

### Layer 3: Professional Review Layer
- AI always produces a **draft**
- Professional must review, adjust, and approve before it becomes active
- All AI-generated plans are marked `aiGenerated: true`

## Safety & Compliance
- Never give medical advice without professional oversight
- All AI output includes disclaimer
- Full audit trail of AI suggestions vs. final approved plan

---

*AI Treatment Plan Engine specification*