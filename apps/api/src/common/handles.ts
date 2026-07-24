/**
 * Server-side handle validation (mirrors packages/shared/src/handles.ts).
 * Keep RESERVED_ROOT_HANDLES in sync with the shared package.
 */

export type HandleNamespace =
  | 'pro'
  | 'ayur'
  | 'yoga'
  | 'spa'
  | 'meditation'
  | 'fitness'
  | 'nutrition'
  | 'coach';

export const HANDLE_NAMESPACES = new Set<string>([
  'pro',
  'ayur',
  'yoga',
  'spa',
  'meditation',
  'fitness',
  'nutrition',
  'coach',
]);

/**
 * First-path segments reserved for product / discipline routes.
 * Never available as root vanity, practice slug, or professional handle.
 */
export const RESERVED_ROOT_HANDLES = new Set([
  'api',
  'admin',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'verify-email',
  'dashboard',
  'discover',
  'explore',
  'retreats',
  'offers',
  'shop',
  'packages',
  'wellness',
  'book',
  'providers',
  'practice',
  'me',
  'events',
  'careers',
  'jobs',
  'list-your-business',
  'pro',
  'ayur',
  'yoga',
  'spa',
  'meditation',
  'fitness',
  'nutrition',
  'coach',
  // Discipline landings — /ayurveda, /yoga, /spa, /meditation, …
  'ayurveda',
  'ayurvedic',
  'ayurved',
  'panchakarma',
  'wellbeing',
  'yogi',
  'spas',
  'mindfulness',
  'health-club',
  'healthclub',
  'cooking',
  'kitchen',
  'coaching',
  'retreat',
  'help',
  'faq',
  'contact',
  'privacy',
  'terms',
  'cookies',
  'accessibility',
  'partners',
  'sitemap',
  'robots',
  'manifest',
  'icon',
  'apple-icon',
  'favicon',
  'assets',
  'static',
  'uploads',
  'files',
  'auth',
  'www',
  'app',
  'apps',
  'mobile',
  'support',
  'about',
  'blog',
  'press',
  'legal',
  'status',
  'cdn',
  'docs',
  'username',
  'handle',
  'profile',
  'profiles',
  'user',
  'users',
  'settings',
  'account',
  'null',
  'undefined',
  'ayurpass',
  'home',
  'search',
  'new',
  'create',
  'edit',
  'delete',
  'pass',
  'rewards',
  'loyalty',
]);

export const TITLE_KINDS = new Set([
  'AYURVEDA_DOCTOR',
  'AYURVEDA_PRACTITIONER',
  'AYURVEDA_THERAPIST',
  'PANCHAKARMA_THERAPIST',
  'YOGA_INSTRUCTOR',
  'YOGA_TEACHER',
  'YOGA_THERAPIST',
  'SPA_THERAPIST',
  'MASSAGE_THERAPIST',
  'MEDITATION_TEACHER',
  'MINDFULNESS_COACH',
  'NUTRITIONIST',
  'DIETITIAN',
  'WELLNESS_COACH',
  'FITNESS_TRAINER',
  'NATUROPATH',
  'OTHER',
]);

export const TITLE_TO_NAMESPACE: Record<string, HandleNamespace> = {
  AYURVEDA_DOCTOR: 'ayur',
  AYURVEDA_PRACTITIONER: 'ayur',
  AYURVEDA_THERAPIST: 'ayur',
  PANCHAKARMA_THERAPIST: 'ayur',
  YOGA_INSTRUCTOR: 'yoga',
  YOGA_TEACHER: 'yoga',
  YOGA_THERAPIST: 'yoga',
  SPA_THERAPIST: 'spa',
  MASSAGE_THERAPIST: 'spa',
  MEDITATION_TEACHER: 'meditation',
  MINDFULNESS_COACH: 'meditation',
  NUTRITIONIST: 'nutrition',
  DIETITIAN: 'nutrition',
  WELLNESS_COACH: 'coach',
  FITNESS_TRAINER: 'fitness',
  NATUROPATH: 'pro',
  OTHER: 'pro',
};

export function normalizeHandle(raw: string): string {
  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '')
    .replace(/^[._-]+|[._-]+$/g, '')
    .slice(0, 32);
}

export function isValidHandle(handle: string): boolean {
  if (!handle || handle.length < 3 || handle.length > 32) return false;
  if (!/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/.test(handle)) return false;
  if (/[._-]{2,}/.test(handle)) return false;
  return true;
}

export function isReservedRoot(handle: string): boolean {
  const h = handle
    .toLowerCase()
    .replace(/^@+/, '')
    .trim()
    .replace(/^[._-]+|[._-]+$/g, '');
  if (!h) return true;
  if (RESERVED_ROOT_HANDLES.has(h)) return true;
  const compact = h.replace(/[._-]+/g, '');
  if (compact !== h && RESERVED_ROOT_HANDLES.has(compact)) return true;
  return false;
}

export function assertHandle(raw: string): string {
  const h = normalizeHandle(raw);
  if (!isValidHandle(h)) {
    throw new Error(
      'Handle must be 3–32 characters: letters, numbers, dots, underscores or hyphens.',
    );
  }
  if (isReservedRoot(h)) {
    throw new Error(
      'That name is reserved for AyurPass (e.g. ayurveda, yoga, spa, meditation). Choose another.',
    );
  }
  return h;
}
