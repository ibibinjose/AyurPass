import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthedUser } from './jwt-auth.guard';

/**
 * Permission types that gate health-profile reads.
 * Keep in sync with docs/08-API-CONTRACTS.md and the frontend permission catalog.
 */
export const HEALTH_CONSENT_TYPES = ['view_health_profile', 'view_dosha_history'] as const;

/** All grantable permission types (extend carefully — these are part of the public contract). */
export const PERMISSION_TYPES = [
  ...HEALTH_CONSENT_TYPES,
  'view_treatment_plans',
  'edit_notes',
  'full_health_access',
] as const;

export type PermissionType = (typeof PERMISSION_TYPES)[number];

export function isPermissionType(value: string): value is PermissionType {
  return (PERMISSION_TYPES as readonly string[]).includes(value);
}

export type HealthAccessPurpose =
  | 'self_access'
  | 'admin_review'
  | 'provider_care'
  | 'practitioner_care';

export interface HealthAccessContext {
  purpose: HealthAccessPurpose;
}

/** Returns true when an active, unexpired consent exists for any of the grantee ids. */
export async function hasActiveHealthConsent(
  prisma: PrismaService,
  consumerId: string,
  granteeIds: string[],
): Promise<boolean> {
  if (!granteeIds.length) return false;
  const now = new Date();
  const consent = await prisma.clientConsent.findFirst({
    where: {
      consumerId,
      granteeId: { in: granteeIds },
      permissionType: { in: [...HEALTH_CONSENT_TYPES] },
      status: 'active',
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { id: true },
  });
  return Boolean(consent);
}

/**
 * Consumer, platform admin, or grantee with active health consent may read a profile.
 * Used before returning PHI and before writing AccessAuditLog.
 */
export async function assertHealthProfileAccess(
  prisma: PrismaService,
  user: AuthedUser,
  consumerId: string,
): Promise<HealthAccessContext> {
  if (user.role === 'PLATFORM_ADMIN') {
    return { purpose: 'admin_review' };
  }
  if (user.sub === consumerId) {
    return { purpose: 'self_access' };
  }

  const granteeIds: string[] = [];
  let purpose: HealthAccessPurpose | null = null;

  if (user.role === 'PROVIDER_ADMIN') {
    const provider = await prisma.provider.findFirst({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (provider) {
      granteeIds.push(provider.id);
      purpose = 'provider_care';
    }
  }

  if (user.role === 'PROFESSIONAL' || user.role === 'PROVIDER_ADMIN') {
    const professional = await prisma.professional.findFirst({
      where: { userId: user.sub },
      select: { id: true, providerId: true },
    });
    if (professional) {
      granteeIds.push(professional.id, professional.providerId);
      purpose = purpose ?? 'practitioner_care';
    }
  }

  if (granteeIds.length && (await hasActiveHealthConsent(prisma, consumerId, granteeIds))) {
    return { purpose: purpose! };
  }

  throw new ForbiddenException('Active consent is required to access this health profile');
}
