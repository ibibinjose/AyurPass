/**
 * Ayurvedic therapies, conditions, and education topics for AyurPass discovery.
 * Used for search, provider tags, and service specialisations.
 */

export type AyurvedaItemKind = "therapy" | "condition" | "topic";

export type AyurvedaCatalogItem = {
  /** Stable slug id */
  id: string;
  /** Display name */
  label: string;
  kind: AyurvedaItemKind;
  /** Extra search terms (synonyms, common misspellings) */
  aliases?: string[];
};

function item(
  id: string,
  label: string,
  kind: AyurvedaItemKind,
  aliases: string[] = [],
): AyurvedaCatalogItem {
  return { id, label, kind, aliases };
}

/** Classical therapies & bodywork */
export const AYURVEDA_THERAPIES: AyurvedaCatalogItem[] = [
  item("abhyanga", "Abhyanga", "therapy", ["full body oil massage", "ayurvedic oil massage"]),
  item("champi", "Champi", "therapy", ["indian head massage", "head massage"]),
  item("full-body-massage", "Full Body Massage", "therapy", ["ayurvedic full body massage"]),
  item("nasya", "Nasya", "therapy", ["ayurveda nasya treatment", "nasal therapy"]),
  item("ayurveda-nasya-treatment", "Ayurveda Nasya Treatment", "therapy", ["nasya"]),
  item("ayurveda-rasayan-therapy", "Ayurveda Rasayan Therapy", "therapy", [
    "rasayana",
    "rejuvenation",
  ]),
  item("ayurvedic-detox-cleanse", "Ayurvedic Detox Cleanse", "therapy", [
    "detox",
    "cleanse",
    "panchakarma lite",
  ]),
  item("greeva-basti", "Greeva Basti", "therapy", ["neck basti", "cervical basti"]),
  item("heart-basti", "Heart Basti", "therapy", ["hridaya basti", "uro basti"]),
  item("janu-basti", "Janu Basti", "therapy", ["knee basti"]),
  item("kati-basti", "Kati Basti", "therapy", ["lower back basti", "lumbar basti"]),
  item("kizhi", "Kizhi", "therapy", ["pinda", "herbal bolus", "potli"]),
  item("panchakarma-detox", "Panchakarma – Detox", "therapy", [
    "panchakarma",
    "pancha karma",
    "detox",
  ]),
  item("pinda-sweda", "Pinda Sweda", "therapy", ["pinda swedana", "bolus fomentation"]),
  item("pizzichil", "Pizzichil", "therapy", ["pizhichil", "oil bath", "kayaseka"]),
  item("shirodhara", "Shirodhara", "therapy", ["shiro dhara", "oil forehead pour"]),
  item("takradhara", "Takradhara", "therapy", ["buttermilk dhara", "takra dhara"]),
  item("udvartana", "Udvartana", "therapy", ["herbal powder massage", "dry massage"]),
  item("vagus-nerve", "Vagus Nerve Therapy", "therapy", [
    "vagus nerve",
    "nervous system regulation",
    "ayurvedic treatments for vagus nerve",
  ]),
];

/** Conditions commonly supported in Ayurvedic care */
export const AYURVEDA_CONDITIONS: AyurvedaCatalogItem[] = [
  item("allergies", "Allergies", "condition"),
  item("anxiety-and-stress", "Anxiety and Stress", "condition", ["stress", "anxiety"]),
  item("asthma", "Asthma", "condition", ["respiratory"]),
  item("chronic-fatigue", "Chronic Fatigue", "condition", ["cfs", "fatigue"]),
  item("chronic-pain", "Chronic Pain", "condition", ["pain management"]),
  item("crohns-disease", "Crohn’s Disease", "condition", ["crohn", "ibd"]),
  item("depression-and-ocd", "Depression and OCD", "condition", ["depression", "ocd"]),
  item("diabetes", "Diabetes", "condition", ["blood sugar", "madhumeha"]),
  item("fatty-liver-disease", "Fatty Liver Disease", "condition", ["nafld", "liver"]),
  item("foot-problems", "Foot Problems", "condition", ["feet", "plantar"]),
  item("gastritis", "Gastritis", "condition", ["stomach inflammation"]),
  item("high-blood-pressure", "High Blood Pressure", "condition", [
    "hypertension",
    "bp",
  ]),
  item("infertility", "Infertility", "condition", ["fertility", "conception"]),
  item("insomnia", "Insomnia", "condition", ["sleep", "sleeplessness"]),
  item("irritable-bowel-syndrome", "Irritable Bowel Syndrome", "condition", [
    "ibs",
    "gut",
  ]),
  item("joint-problems", "Joint Problems", "condition", ["arthritis", "joints"]),
  item("menopause", "Menopause", "condition"),
  item("menstruation-and-pms", "Menstruation and PMS Treatment", "condition", [
    "pms",
    "periods",
    "menstrual",
  ]),
  item("migraines-and-headaches", "Migraines and Headaches", "condition", [
    "migraine",
    "headache",
  ]),
  item("sinusitis", "Sinusitis", "condition", ["sinus", "congestion"]),
  item("skin-problems", "Skin Problems", "condition", [
    "skin diseases",
    "dermatology",
    "eczema",
    "psoriasis",
  ]),
  item("ulcerative-colitis", "Ulcerative Colitis", "condition", [
    "colitis",
    "ibd",
    "ulcerative colitis treatment",
  ]),
  item("ulcers", "Ulcers", "condition", ["stomach ulcer", "peptic ulcer"]),
  item("constipation", "Constipation", "condition", [
    "ayurvedic treatment for constipation",
  ]),
];

/** Educational / seasonal topics (content + discovery tags) */
export const AYURVEDA_TOPICS: AyurvedaCatalogItem[] = [
  item("healthiest-winter", "Healthiest Winter with Ayurvedic Medicine", "topic", [
    "winter",
    "seasonal",
    "four ways to have your healthiest winter ever with ayurvedic medicine",
  ]),
];

/** Full catalog (therapies → conditions → topics) */
export const AYURVEDA_CATALOG: AyurvedaCatalogItem[] = [
  ...AYURVEDA_THERAPIES,
  ...AYURVEDA_CONDITIONS,
  ...AYURVEDA_TOPICS,
];

export const AYURVEDA_CATALOG_BY_ID: Record<string, AyurvedaCatalogItem> = Object.fromEntries(
  AYURVEDA_CATALOG.map((x) => [x.id, x]),
);

/** Labels only — handy for multi-select UIs */
export const AYURVEDA_TREATMENT_LABELS: string[] = AYURVEDA_CATALOG.map((x) => x.label);

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''']/g, "'")
    .replace(/[^a-z0-9\s+–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build a searchable blob for one catalog item */
export function ayurvedaItemSearchBlob(item: AyurvedaCatalogItem): string {
  return normalize([item.label, item.id, ...(item.aliases ?? [])].join(" "));
}

/**
 * True if free text (query or listing copy) matches this treatment/condition.
 */
export function matchesAyurvedaItem(haystack: string, item: AyurvedaCatalogItem): boolean {
  const h = normalize(haystack);
  if (!h) return false;
  const terms = [item.label, item.id.replace(/-/g, " "), ...(item.aliases ?? [])].map(normalize);
  return terms.some((t) => t && (h.includes(t) || t.includes(h)));
}

/**
 * Find catalog items that match a user search query (for typeahead / chips).
 */
export function searchAyurvedaCatalog(query: string, limit = 12): AyurvedaCatalogItem[] {
  const q = normalize(query);
  if (!q) return AYURVEDA_CATALOG.slice(0, limit);
  const scored = AYURVEDA_CATALOG.map((item) => {
    const blob = ayurvedaItemSearchBlob(item);
    let score = 0;
    if (blob === q) score = 100;
    else if (blob.startsWith(q)) score = 80;
    else if (blob.includes(q)) score = 50;
    else if (q.split(" ").every((w) => w.length < 2 || blob.includes(w))) score = 20;
    return { item, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.item);
}

/**
 * Does listing free-text match any of the selected treatment ids / a free query?
 */
export function listingMatchesAyurveda(
  haystack: string,
  opts: { treatmentId?: string | null; query?: string | null },
): boolean {
  const h = normalize(haystack);
  if (!h) return false;
  if (opts.treatmentId) {
    const item = AYURVEDA_CATALOG_BY_ID[opts.treatmentId];
    if (!item) return false;
    return matchesAyurvedaItem(h, item);
  }
  if (opts.query?.trim()) {
    // Expand query via catalog: if query matches a known treatment, require that treatment
    const hits = searchAyurvedaCatalog(opts.query, 3);
    if (hits.length && normalize(hits[0].label).includes(normalize(opts.query))) {
      return matchesAyurvedaItem(h, hits[0]);
    }
    return h.includes(normalize(opts.query));
  }
  return true;
}

export const AYURVEDA_KIND_LABEL: Record<AyurvedaItemKind, string> = {
  therapy: "Therapies",
  condition: "Conditions",
  topic: "Guides",
};
