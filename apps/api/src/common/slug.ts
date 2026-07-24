import { isReservedRoot } from './handles';

/** Build a URL-safe slug from a display name. */
export function slugifyName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/**
 * Practice / professional slug that never collides with reserved routes
 * (ayurveda, yoga, spa, meditation, events, …).
 */
export function slugifyPublicName(name: string, fallback = 'practice'): string {
  let base = slugifyName(name) || fallback;
  if (isReservedRoot(base)) {
    base = `${base}-studio`;
  }
  return base.slice(0, 64);
}

/** Ensure uniqueness by appending a numeric suffix when needed. */
export function withSlugSuffix(base: string, suffix: string | number): string {
  let clean = base || 'practitioner';
  if (isReservedRoot(clean)) {
    clean = `${clean}-studio`;
  }
  const tail = String(suffix).replace(/[^a-z0-9-]/gi, '');
  return `${clean}-${tail}`.slice(0, 80);
}