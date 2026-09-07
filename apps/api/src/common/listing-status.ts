import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

export const LISTING_STATUSES = ['live', 'paused', 'closed'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export function parseListingStatus(value: unknown): ListingStatus {
  if (typeof value !== 'string' || !LISTING_STATUSES.includes(value as ListingStatus)) {
    throw new BadRequestException('status must be one of: live, paused, closed');
  }
  return value as ListingStatus;
}

export function isListingLive(status?: string | null): boolean {
  return (status ?? 'live') === 'live';
}

/** Hide paused/closed entities from public detail responses. */
export function assertPubliclyVisible(
  entity: { listingStatus?: string | null } | null | undefined,
  label: string,
): void {
  if (!entity) throw new NotFoundException(`${label} not found`);
  if (!isListingLive(entity.listingStatus)) {
    throw new NotFoundException(`${label} not found`);
  }
}

/** Block new bookings / enquiries against non-live listings. */
export function assertBookableListing(
  entity: { listingStatus?: string | null } | null | undefined,
  label: string,
): void {
  if (!entity) throw new NotFoundException(`${label} not found`);
  const status = entity.listingStatus ?? 'live';
  if (status === 'paused') {
    throw new ConflictException(
      `${label} is temporarily paused and is not accepting new bookings or enquiries.`,
    );
  }
  if (status === 'closed') {
    throw new ConflictException(
      `${label} is closed and is not accepting new bookings or enquiries.`,
    );
  }
}

export const LIVE_LISTING_WHERE = { listingStatus: 'live' as const };

/** Service is publicly bookable only when it, its practice, and linked practitioner (if any) are live. */
export const PUBLIC_SERVICE_WHERE = {
  listingStatus: 'live' as const,
  provider: { listingStatus: 'live' as const },
  OR: [{ professionalId: null }, { professional: { listingStatus: 'live' as const } }],
};

export const PUBLIC_PROFESSIONAL_WHERE = {
  listingStatus: 'live' as const,
  provider: { listingStatus: 'live' as const },
};
