/**
 * Public URL namespaces and professional title kinds.
 *
 * Path shapes:
 *  - /pro/:handle          generic professional
 *  - /ayur/:handle         Ayurveda practitioner
 *  - /yoga/:handle         Yoga instructor / teacher
 *  - /spa/:handle          Spa therapist
 *  - /meditation/:handle   Meditation teacher
 *  - /fitness/:handle      Health-club / fitness coach
 *  - /nutrition/:handle    Nutritionist
 *  - /coach/:handle        Wellness coach
 *  - /:handle              Root vanity (admin-approved only — brands & notable figures)
 *
 * Legacy (still supported):
 *  - /me/:slug
 *  - /practice/:slug
 *  - /providers/:id
 */

export type HandleNamespace =
  | "pro"
  | "ayur"
  | "yoga"
  | "spa"
  | "meditation"
  | "fitness"
  | "nutrition"
  | "coach";

export type VanityStatus = "none" | "pending" | "approved" | "rejected";

export type ProfessionalTitleKind =
  | "AYURVEDA_DOCTOR"
  | "AYURVEDA_PRACTITIONER"
  | "AYURVEDA_THERAPIST"
  | "PANCHAKARMA_THERAPIST"
  | "YOGA_INSTRUCTOR"
  | "YOGA_TEACHER"
  | "YOGA_THERAPIST"
  | "SPA_THERAPIST"
  | "MASSAGE_THERAPIST"
  | "MEDITATION_TEACHER"
  | "MINDFULNESS_COACH"
  | "NUTRITIONIST"
  | "DIETITIAN"
  | "WELLNESS_COACH"
  | "FITNESS_TRAINER"
  | "NATUROPATH"
  | "OTHER";

export const HANDLE_NAMESPACES: {
  id: HandleNamespace;
  label: string;
  path: string;
  description: string;
}[] = [
  { id: "pro", label: "Professional", path: "/pro", description: "General practitioner profile" },
  { id: "ayur", label: "Ayurveda", path: "/ayur", description: "Ayurvedic doctors & therapists" },
  { id: "yoga", label: "Yoga", path: "/yoga", description: "Yoga instructors & teachers" },
  { id: "spa", label: "Spa", path: "/spa", description: "Spa & bodywork therapists" },
  { id: "meditation", label: "Meditation", path: "/meditation", description: "Meditation teachers" },
  { id: "fitness", label: "Fitness", path: "/fitness", description: "Trainers & health clubs" },
  { id: "nutrition", label: "Nutrition", path: "/nutrition", description: "Nutritionists & dietitians" },
  { id: "coach", label: "Coaching", path: "/coach", description: "Wellness coaches" },
];

export const PROFESSIONAL_TITLE_KINDS: {
  id: ProfessionalTitleKind;
  label: string;
  /** Suggested URL namespace */
  namespace: HandleNamespace;
  group: string;
}[] = [
  { id: "AYURVEDA_DOCTOR", label: "Ayurvedic Doctor (Vaidya)", namespace: "ayur", group: "Ayurveda" },
  {
    id: "AYURVEDA_PRACTITIONER",
    label: "Ayurveda Practitioner",
    namespace: "ayur",
    group: "Ayurveda",
  },
  { id: "AYURVEDA_THERAPIST", label: "Ayurveda Therapist", namespace: "ayur", group: "Ayurveda" },
  {
    id: "PANCHAKARMA_THERAPIST",
    label: "Panchakarma Therapist",
    namespace: "ayur",
    group: "Ayurveda",
  },
  { id: "YOGA_INSTRUCTOR", label: "Yoga Instructor", namespace: "yoga", group: "Yoga" },
  { id: "YOGA_TEACHER", label: "Yoga Teacher", namespace: "yoga", group: "Yoga" },
  { id: "YOGA_THERAPIST", label: "Yoga Therapist", namespace: "yoga", group: "Yoga" },
  { id: "SPA_THERAPIST", label: "Spa Therapist", namespace: "spa", group: "Spa" },
  { id: "MASSAGE_THERAPIST", label: "Massage Therapist", namespace: "spa", group: "Spa" },
  {
    id: "MEDITATION_TEACHER",
    label: "Meditation Teacher",
    namespace: "meditation",
    group: "Meditation",
  },
  {
    id: "MINDFULNESS_COACH",
    label: "Mindfulness Coach",
    namespace: "meditation",
    group: "Meditation",
  },
  { id: "NUTRITIONIST", label: "Nutritionist", namespace: "nutrition", group: "Nutrition" },
  { id: "DIETITIAN", label: "Dietitian", namespace: "nutrition", group: "Nutrition" },
  { id: "WELLNESS_COACH", label: "Wellness Coach", namespace: "coach", group: "Coaching" },
  { id: "FITNESS_TRAINER", label: "Fitness Trainer", namespace: "fitness", group: "Fitness" },
  { id: "NATUROPATH", label: "Naturopath", namespace: "pro", group: "Other" },
  { id: "OTHER", label: "Other / Custom title", namespace: "pro", group: "Other" },
];

/**
 * First-path segments reserved for product / discipline routes.
 * Never available as root vanity, practice slug, or professional handle.
 * Protects paths like /ayurveda, /yoga, /spa, /meditation, /events, …
 */
export const RESERVED_ROOT_HANDLES = new Set([
  // Core product
  "api",
  "admin",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "dashboard",
  "discover",
  "explore",
  "retreats",
  "offers",
  "shop",
  "packages",
  "wellness",
  "book",
  "providers",
  "practice",
  "me",
  "events",
  "careers",
  "jobs",
  "list-your-business",
  // Professional namespaces
  "pro",
  "ayur",
  "yoga",
  "spa",
  "meditation",
  "fitness",
  "nutrition",
  "coach",
  // Discipline landing pages (must never be claimed as vanity)
  "ayurveda",
  "ayurvedic",
  "ayurved",
  "ayur",
  "panchakarma",
  "wellbeing",
  "wellness",
  "yoga",
  "yogi",
  "spa",
  "spas",
  "meditation",
  "mindfulness",
  "fitness",
  "health-club",
  "healthclub",
  "nutrition",
  "cooking",
  "kitchen",
  "coaching",
  "coach",
  "retreat",
  "retreats",
  // Legal / marketing / system
  "help",
  "faq",
  "contact",
  "privacy",
  "terms",
  "cookies",
  "accessibility",
  "partners",
  "sitemap",
  "robots",
  "manifest",
  "icon",
  "apple-icon",
  "favicon",
  "assets",
  "static",
  "uploads",
  "files",
  "auth",
  "www",
  "app",
  "apps",
  "mobile",
  "support",
  "about",
  "blog",
  "press",
  "legal",
  "status",
  "cdn",
  "docs",
  "username",
  "handle",
  "profile",
  "profiles",
  "user",
  "users",
  "settings",
  "account",
  "null",
  "undefined",
  "ayurpass",
  "home",
  "search",
  "new",
  "create",
  "edit",
  "delete",
  "pass",
  "rewards",
  "loyalty",
]);

export const HANDLE_NAMESPACES_SET = new Set<string>(HANDLE_NAMESPACES.map((n) => n.id));

export function normalizeHandle(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 32);
}

export function isValidHandle(handle: string): boolean {
  if (!handle || handle.length < 3 || handle.length > 32) return false;
  if (!/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/.test(handle)) return false;
  if (/[._-]{2,}/.test(handle)) return false;
  return true;
}

export function isReservedRootHandle(handle: string): boolean {
  const h = handle
    .toLowerCase()
    .replace(/^@+/, "")
    .trim()
    .replace(/^[._-]+|[._-]+$/g, "");
  if (!h) return true;
  if (RESERVED_ROOT_HANDLES.has(h)) return true;
  // Block "ayur-veda" / "ayur.veda" when the compacted form is reserved
  const compact = h.replace(/[._-]+/g, "");
  if (compact !== h && RESERVED_ROOT_HANDLES.has(compact)) return true;
  return false;
}

export function isHandleNamespace(value: string): value is HandleNamespace {
  return HANDLE_NAMESPACES_SET.has(value);
}

export function titleKindLabel(kind?: string | null): string | null {
  if (!kind) return null;
  return PROFESSIONAL_TITLE_KINDS.find((t) => t.id === kind)?.label ?? null;
}

export function defaultNamespaceForTitleKind(kind?: string | null): HandleNamespace {
  if (!kind) return "pro";
  return PROFESSIONAL_TITLE_KINDS.find((t) => t.id === kind)?.namespace ?? "pro";
}

/** Canonical public path for a practitioner. */
export function practitionerPublicPath(pro: {
  vanityHandle?: string | null;
  vanityStatus?: string | null;
  handle?: string | null;
  handleNamespace?: string | null;
  slug?: string | null;
  id: string;
}): string {
  if (pro.vanityStatus === "approved" && pro.vanityHandle) {
    return `/${pro.vanityHandle}`;
  }
  if (pro.handle && pro.handleNamespace && isHandleNamespace(pro.handleNamespace)) {
    return `/${pro.handleNamespace}/${pro.handle}`;
  }
  if (pro.slug) return `/me/${pro.slug}`;
  return `/providers/${pro.id}`;
}

/** Canonical public path for a practice. */
export function practicePublicPath(provider: {
  vanityHandle?: string | null;
  vanityStatus?: string | null;
  slug?: string | null;
  id: string;
}): string {
  if (provider.vanityStatus === "approved" && provider.vanityHandle) {
    return `/${provider.vanityHandle}`;
  }
  if (provider.slug) return `/practice/${provider.slug}`;
  return `/providers/${provider.id}`;
}
