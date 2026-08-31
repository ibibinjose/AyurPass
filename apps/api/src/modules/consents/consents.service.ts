import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsentDto, UpdateConsentDto } from '../../dtos/consent.dto';
import { isPermissionType } from '../../common/consent';

export interface ConsentGranteeSummary {
  id: string;
  kind: 'provider' | 'professional' | 'unknown';
  name: string;
  title?: string | null;
}

export interface ConsentView {
  id: string;
  consumerId: string;
  granteeId: string | null;
  permissionType: string;
  scope: unknown;
  expiresAt: Date | null;
  status: string;
  createdAt: Date;
  grantee: ConsentGranteeSummary | null;
  isExpired: boolean;
  effectiveStatus: 'active' | 'revoked' | 'expired';
}

@Injectable()
export class ConsentsService {
  constructor(private prisma: PrismaService) {}

  async createConsent(data: CreateConsentDto) {
    if (!isPermissionType(data.permissionType)) {
      throw new BadRequestException(`Unknown permission type: ${data.permissionType}`);
    }

    // Upsert-style: if an identical active grant already exists, extend/update it.
    if (data.granteeId) {
      const existing = await this.prisma.clientConsent.findFirst({
        where: {
          consumerId: data.consumerId,
          granteeId: data.granteeId,
          permissionType: data.permissionType,
          status: 'active',
        },
      });
      if (existing) {
        return this.prisma.clientConsent.update({
          where: { id: existing.id },
          data: {
            scope:
              data.scope !== undefined
                ? (data.scope as Prisma.InputJsonValue)
                : undefined,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : existing.expiresAt,
          },
        });
      }
    }

    return this.prisma.clientConsent.create({
      data: {
        consumerId: data.consumerId,
        granteeId: data.granteeId,
        permissionType: data.permissionType,
        scope: data.scope !== undefined ? (data.scope as Prisma.InputJsonValue) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        status: 'active',
      },
    });
  }

  async getConsentsForConsumer(consumerId: string, includeInactive = true) {
    const rows = await this.prisma.clientConsent.findMany({
      where: includeInactive
        ? { consumerId }
        : { consumerId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    return this.enrichConsents(rows);
  }

  async findOne(id: string): Promise<ConsentView | null> {
    const row = await this.prisma.clientConsent.findUnique({ where: { id } });
    if (!row) return null;
    const [view] = await this.enrichConsents([row]);
    return view;
  }

  async updateConsent(id: string, data: UpdateConsentDto) {
    const existing = await this.prisma.clientConsent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Consent not found');

    return this.prisma.clientConsent.update({
      where: { id },
      data: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.scope !== undefined
          ? { scope: data.scope as Prisma.InputJsonValue }
          : {}),
        ...(data.expiresAt !== undefined
          ? { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }
          : {}),
      },
    });
  }

  async revokeConsent(id: string) {
    const existing = await this.prisma.clientConsent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Consent not found');
    if (existing.status === 'revoked') return existing;

    return this.prisma.clientConsent.update({
      where: { id },
      data: { status: 'revoked' },
    });
  }

  async getAuditForConsent(consentId: string, consumerId: string) {
    const consent = await this.prisma.clientConsent.findUnique({ where: { id: consentId } });
    if (!consent || consent.consumerId !== consumerId) {
      throw new NotFoundException('Consent not found');
    }

    const rows = await this.prisma.accessAuditLog.findMany({
      where: {
        consumerId,
        ...(consent.granteeId
          ? {
              OR: [
                { accessorId: consent.granteeId },
                // Practitioners access with their user id; grantee is professional/provider id.
                // Surface all access for this consumer so the owner can review activity.
              ],
            }
          : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    return rows.map((r) => ({
      ...r,
      id: r.id.toString(),
    }));
  }

  async getAccessAuditForConsumer(consumerId: string) {
    const rows = await this.prisma.accessAuditLog.findMany({
      where: { consumerId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    return rows.map((r) => ({
      ...r,
      id: r.id.toString(),
    }));
  }

  private async enrichConsents(
    rows: {
      id: string;
      consumerId: string;
      granteeId: string | null;
      permissionType: string;
      scope: unknown;
      expiresAt: Date | null;
      status: string;
      createdAt: Date;
    }[],
  ): Promise<ConsentView[]> {
    const granteeIds = [
      ...new Set(rows.map((r) => r.granteeId).filter((id): id is string => Boolean(id))),
    ];

    const [providers, professionals] = await Promise.all([
      granteeIds.length
        ? this.prisma.provider.findMany({
            where: { id: { in: granteeIds } },
            select: { id: true, businessName: true },
          })
        : Promise.resolve([]),
      granteeIds.length
        ? this.prisma.professional.findMany({
            where: { id: { in: granteeIds } },
            select: {
              id: true,
              title: true,
              user: { select: { fullName: true } },
            },
          })
        : Promise.resolve([]),
    ]);

    const providerMap = new Map(providers.map((p) => [p.id, p]));
    const professionalMap = new Map(professionals.map((p) => [p.id, p]));
    const now = Date.now();

    return rows.map((row) => {
      const expiredByTime =
        row.status === 'active' &&
        row.expiresAt != null &&
        new Date(row.expiresAt).getTime() <= now;

      let effectiveStatus: ConsentView['effectiveStatus'] =
        row.status === 'revoked' ? 'revoked' : expiredByTime ? 'expired' : 'active';
      if (row.status !== 'active' && row.status !== 'revoked') {
        effectiveStatus = row.status === 'expired' ? 'expired' : 'revoked';
      }

      let grantee: ConsentGranteeSummary | null = null;
      if (row.granteeId) {
        const provider = providerMap.get(row.granteeId);
        const professional = professionalMap.get(row.granteeId);
        if (provider) {
          grantee = { id: provider.id, kind: 'provider', name: provider.businessName };
        } else if (professional) {
          grantee = {
            id: professional.id,
            kind: 'professional',
            name: professional.user?.fullName || professional.title || 'Practitioner',
            title: professional.title,
          };
        } else {
          grantee = { id: row.granteeId, kind: 'unknown', name: 'Unknown grantee' };
        }
      }

      return {
        id: row.id,
        consumerId: row.consumerId,
        granteeId: row.granteeId,
        permissionType: row.permissionType,
        scope: row.scope,
        expiresAt: row.expiresAt,
        status: row.status,
        createdAt: row.createdAt,
        grantee,
        isExpired: expiredByTime || effectiveStatus === 'expired',
        effectiveStatus,
      };
    });
  }
}
