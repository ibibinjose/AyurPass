import { ForbiddenException } from '@nestjs/common';
import { AuthedUser } from './jwt-auth.guard';

/**
 * Consumer-scoped resources (bookings, orders, health profiles, treatment
 * plans, consents) may only be accessed by the owning consumer or a platform
 * admin. Guards authentication; this adds authorization (prevents IDOR — a
 * valid token reading another consumer's data by changing the :id).
 */
export function assertSelfOrAdmin(user: AuthedUser, consumerId: string): void {
  if (user.role === 'PLATFORM_ADMIN') return;
  if (user.sub === consumerId) return;
  throw new ForbiddenException('You can only access your own data');
}
