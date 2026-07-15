/** Prakriti assessment — identical logic to the web (frontend/src/lib/dosha.ts). */
export type Dosha = "vata" | "pitta" | "kapha";

export interface DoshaQuestion {
  id: string;
  prompt: string;
  options: { label: string; dosha: Dosha }[];
}

export const DOSHA_INFO: Record<
  Dosha,
  { name: string; element: string; qualities: string; balancedBy: string }
> = {
  vata: {
    name: "Vata",
    element: "Air & Ether",
    qualities: "Creative, quick, energetic — governs movement, breath and the nervous system.",
    balancedBy: "Warm routines, grounding foods, restorative yoga and oil therapies (Abhyanga).",
  },
  pitta: {
    name: "Pitta",
    element: "Fire & Water",
    qualities: "Focused, driven, sharp — governs digestion, metabolism and transformation.",
    balancedBy:
      "Cooling practices, moonlight meditation, coconut-oil treatments and gentle flow yoga.",
  },
  kapha: {
    name: "Kapha",
    element: "Earth & Water",
    qualities: "Calm, steady, nurturing — governs structure, stability and immunity.",
    balancedBy:
      "Invigorating movement, dry massage (Garshana), warming spices and energising breathwork.",
  },
};

export const DOSHA_QUESTIONS: DoshaQuestion[] = [
  {
    id: "frame",
    prompt: "Which best describes your natural body frame?",
    options: [
      { label: "Slim and light — I find it hard to gain weight", dosha: "vata" },
      { label: "Medium and athletic — I build muscle easily", dosha: "pitta" },
      { label: "Broad and solid — I gain weight easily", dosha: "kapha" },
    ],
  },
  {
    id: "skin",
    prompt: "How would you describe your skin?",
    options: [
      { label: "Dry, thin, cool to the touch", dosha: "vata" },
      { label: "Warm, prone to redness or sensitivity", dosha: "pitta" },
      { label: "Smooth, thick, naturally moist", dosha: "kapha" },
    ],
  },
  {
    id: "appetite",
    prompt: "What is your appetite like?",
    options: [
      { label: "Irregular — I sometimes forget to eat", dosha: "vata" },
      { label: "Strong — I get irritable when hungry", dosha: "pitta" },
      { label: "Steady but mild — I can skip meals comfortably", dosha: "kapha" },
    ],
  },
  {
    id: "sleep",
    prompt: "How do you usually sleep?",
    options: [
      { label: "Lightly — I wake often and dream vividly", dosha: "vata" },
      { label: "Soundly but short — I wake up alert", dosha: "pitta" },
      { label: "Deeply and long — mornings are slow for me", dosha: "kapha" },
    ],
  },
  {
    id: "weather",
    prompt: "Which weather bothers you the most?",
    options: [
      { label: "Cold, windy and dry days", dosha: "vata" },
      { label: "Hot and humid days", dosha: "pitta" },
      { label: "Cool, damp and grey days", dosha: "kapha" },
    ],
  },
  {
    id: "mind",
    prompt: "Under pressure, your mind tends to become…",
    options: [
      { label: "Anxious, restless or scattered", dosha: "vata" },
      { label: "Intense, critical or impatient", dosha: "pitta" },
      { label: "Withdrawn, stubborn or lethargic", dosha: "kapha" },
    ],
  },
  {
    id: "energy",
    prompt: "How does your energy flow through the day?",
    options: [
      { label: "In bursts — quick highs, quick crashes", dosha: "vata" },
      { label: "Strong and purposeful until I overheat", dosha: "pitta" },
      { label: "Slow to start, but remarkably enduring", dosha: "kapha" },
    ],
  },
  {
    id: "decisions",
    prompt: "How do you make decisions?",
    options: [
      { label: "Quickly, but I often change my mind", dosha: "vata" },
      { label: "Decisively, after sharp analysis", dosha: "pitta" },
      { label: "Slowly and deliberately — then I commit", dosha: "kapha" },
    ],
  },
  {
    id: "memory",
    prompt: "Which describes your memory best?",
    options: [
      { label: "Quick to learn, quick to forget", dosha: "vata" },
      { label: "Sharp and precise", dosha: "pitta" },
      { label: "Slow to absorb, but I never forget", dosha: "kapha" },
    ],
  },
  {
    id: "speech",
    prompt: "How do others describe the way you speak?",
    options: [
      { label: "Fast, animated, wandering between topics", dosha: "vata" },
      { label: "Clear, persuasive, sometimes cutting", dosha: "pitta" },
      { label: "Calm, measured and soothing", dosha: "kapha" },
    ],
  },
  {
    id: "digestion",
    prompt: "After a large meal you usually feel…",
    options: [
      { label: "Bloated or gassy", dosha: "vata" },
      { label: "Acidic or overheated", dosha: "pitta" },
      { label: "Heavy and sleepy", dosha: "kapha" },
    ],
  },
  {
    id: "spending",
    prompt: "Your relationship with money is…",
    options: [
      { label: "Impulsive — it comes and goes", dosha: "vata" },
      { label: "Strategic — I spend on quality", dosha: "pitta" },
      { label: "Conservative — I save and accumulate", dosha: "kapha" },
    ],
  },
];

export interface DoshaScores {
  vata: number;
  pitta: number;
  kapha: number;
  primary: Dosha;
}

/** answers: questionId -> selected option index */
export function scoreAssessment(answers: Record<string, number>): DoshaScores {
  const counts: Record<Dosha, number> = { vata: 0, pitta: 0, kapha: 0 };
  let total = 0;

  for (const q of DOSHA_QUESTIONS) {
    const picked = answers[q.id];
    if (picked === undefined) continue;
    counts[q.options[picked].dosha] += 1;
    total += 1;
  }

  if (total === 0) return { vata: 0, pitta: 0, kapha: 0, primary: "vata" };

  const pct = (d: Dosha) => Math.round((counts[d] / total) * 100);
  const scores = { vata: pct("vata"), pitta: pct("pitta"), kapha: pct("kapha") };
  const primary = (Object.entries(scores) as [Dosha, number][]).sort((a, b) => b[1] - a[1])[0][0];
  return { ...scores, primary };
}
