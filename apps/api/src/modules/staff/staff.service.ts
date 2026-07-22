import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StaffRole, StaffInviteStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { InviteStaffDto, UpdateStaffDto } from './staff.dto';

/** Role hierarchy — higher index = more permissions. */
const ROLE_RANK: Record<StaffRole, number> = {
  PRACTITIONER: 0,
  RECEPTIONIST: 1,
  MANAGER: 2,
  OWNER: 3,
};

/** Default permissions by role. Used when permissions JSON is null. */
export const DEFAULT_PERMISSIONS: Record<StaffRole, Record<string, boolean>> = {
  OWNER: {
    manage_staff: true,
    manage_services: true,
    manage_bookings: true,
    manage_products: true,
    manage_calendar: true,
    manage_clients: true,
    manage_financials: true,
    manage_settings: true,
    view_reports: true,
    process_pos: true,
  },
  MANAGER: {
    manage_staff: true,
    manage_services: true,
    manage_bookings: true,
    manage_products: true,
    manage_calendar: true,
    manage_clients: true,
    manage_financials: false,
    manage_settings: false,
    view_reports: true,
    process_pos: true,
  },
  RECEPTIONIST: {
    manage_staff: false,
    manage_services: false,
    manage_bookings: true,
    manage_products: false,
    manage_calendar: true,
    manage_clients: true,
    manage_financials: false,
    manage_settings: false,
    view_reports: false,
    process_pos: true,
  },
  PRACTITIONER: {
    manage_staff: false,
    manage_services: false,
    manage_bookings: false, // only own bookings
    manage_products: false,
    manage_calendar: false, // only own availability
    manage_clients: false,  // only own clients
    manage_financials: false,
    manage_settings: false,
    view_reports: false,
    process_pos: false,
  },
};

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  /** Get resolved permissions for a staff member (role defaults + overrides). */
  getPermissions(role: StaffRole, overrides?: Record<string, boolean> | null): Record<string, boolean> {
    const base = { ...DEFAULT_PERMISSIONS[role] };
    if (overrides && typeof overrides === 'object') {
      for (const [key, val] of Object.entries(overrides)) {
        if (typeof val === 'boolean' && key in base) {
          base[key] = val;
        }
      }
    }
    return base;
  }

  /** Check if a user has a specific permission on a provider. */
  async hasPermission(userId: string, providerId: string, permission: string): Promise<boolean> {
    const membership = await this.prisma.providerStaff.findUnique({
      where: { providerId_userId: { providerId, userId } },
    });
    if (!membership || membership.inviteStatus !== 'ACCEPTED') return false;
    const perms = this.getPermissions(membership.role, membership.permissions as Record<string, boolean> | null);
    return perms[permission] === true;
  }

  /** Get the staff membership for a user at a provider (or null). */
  async getMembership(userId: string, providerId: string) {
    return this.prisma.providerStaff.findUnique({
      where: { providerId_userId: { providerId, userId } },
      include: { user: { select: { id: true, email: true, fullName: true, avatarUrl: true } } },
    });
  }

  /** Get all staff for a provider. */
  async listStaff(providerId: string) {
    const staff = await this.prisma.providerStaff.findMany({
      where: { providerId },
      include: { user: { select: { id: true, email: true, fullName: true, avatarUrl: true, role: true } } },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });
    return staff.map((s) => ({
      ...s,
      effectivePermissions: this.getPermissions(s.role, s.permissions as Record<string, boolean> | null),
    }));
  }

  /** Invite a new staff member. Only OWNER/MANAGER can invite. */
  async invite(providerId: string, inviterId: string, dto: InviteStaffDto) {
    // Verify inviter has manage_staff permission
    const inviter = await this.getMembership(inviterId, providerId);
    if (!inviter || inviter.inviteStatus !== 'ACCEPTED') {
      throw new ForbiddenException('You are not a staff member of this practice.');
    }
    const inviterPerms = this.getPermissions(inviter.role, inviter.permissions as Record<string, boolean> | null);
    if (!inviterPerms.manage_staff) {
      throw new ForbiddenException('You do not have permission to manage staff.');
    }

    // Cannot invite a role higher than your own
    if (ROLE_RANK[dto.role] >= ROLE_RANK[inviter.role]) {
      throw new ForbiddenException('You cannot invite someone with an equal or higher role than yours.');
    }

    // Cannot invite OWNER (only one owner, set at creation)
    if (dto.role === 'OWNER') {
      throw new BadRequestException('Cannot invite as OWNER. Transfer ownership instead.');
    }

    // Check if already invited or is staff
    const existing = await this.prisma.providerStaff.findFirst({
      where: {
        providerId,
        OR: [
          { inviteEmail: dto.email.toLowerCase() },
          { user: { email: dto.email.toLowerCase() } },
        ],
      },
    });
    if (existing) {
      if (existing.inviteStatus === 'ACCEPTED') {
        throw new ConflictException('This person is already a staff member.');
      }
      if (existing.inviteStatus === 'PENDING') {
        throw new ConflictException('An invitation is already pending for this email.');
      }
    }

    const token = randomBytes(32).toString('hex');

    const staff = await this.prisma.providerStaff.create({
      data: {
        providerId,
        role: dto.role,
        displayName: dto.displayName?.trim() || null,
        permissions: dto.permissions || undefined,
        inviteEmail: dto.email.toLowerCase(),
        inviteToken: token,
        inviteStatus: 'PENDING',
      },
      include: { provider: { select: { businessName: true } } },
    });

    return {
      id: staff.id,
      inviteEmail: staff.inviteEmail,
      role: staff.role,
      displayName: staff.displayName,
      inviteStatus: staff.inviteStatus,
      inviteToken: token,
      invitedAt: staff.invitedAt,
    };
  }

  /** Accept a staff invitation using the token. */
  async acceptInvite(token: string, userId: string) {
    const invite = await this.prisma.providerStaff.findUnique({
      where: { inviteToken: token },
      include: { provider: { select: { id: true, businessName: true } } },
    });

    if (!invite) throw new NotFoundException('Invitation not found or expired.');
    if (invite.inviteStatus !== 'PENDING') {
      throw new BadRequestException(`This invitation has already been ${invite.inviteStatus.toLowerCase()}.`);
    }

    // Verify the user's email matches the invite
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.email.toLowerCase() !== invite.inviteEmail?.toLowerCase()) {
      throw new ForbiddenException('This invitation was sent to a different email address.');
    }

    // Accept the invitation
    const accepted = await this.prisma.providerStaff.update({
      where: { id: invite.id },
      data: {
        userId,
        inviteStatus: 'ACCEPTED',
        acceptedAt: new Date(),
        inviteToken: null, // Invalidate the token
      },
      include: {
        provider: { select: { id: true, businessName: true } },
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    return {
      id: accepted.id,
      role: accepted.role,
      provider: accepted.provider,
      user: accepted.user,
      acceptedAt: accepted.acceptedAt,
    };
  }

  /** Update a staff member's role or permissions. */
  async updateStaff(providerId: string, staffId: string, updaterId: string, dto: UpdateStaffDto) {
    const updater = await this.getMembership(updaterId, providerId);
    if (!updater || updater.inviteStatus !== 'ACCEPTED') {
      throw new ForbiddenException('You are not a staff member of this practice.');
    }
    const updaterPerms = this.getPermissions(updater.role, updater.permissions as Record<string, boolean> | null);
    if (!updaterPerms.manage_staff) {
      throw new ForbiddenException('You do not have permission to manage staff.');
    }

    const target = await this.prisma.providerStaff.findFirst({
      where: { id: staffId, providerId },
    });
    if (!target) throw new NotFoundException('Staff member not found.');

    // Cannot modify someone with equal or higher role
    if (ROLE_RANK[target.role] >= ROLE_RANK[updater.role]) {
      throw new ForbiddenException('You cannot modify a staff member with an equal or higher role.');
    }

    // Cannot promote to equal or higher than your own role
    if (dto.role && ROLE_RANK[dto.role] >= ROLE_RANK[updater.role]) {
      throw new ForbiddenException('You cannot promote someone to your role level or higher.');
    }

    if (dto.role === 'OWNER') {
      throw new BadRequestException('Cannot promote to OWNER. Use ownership transfer.');
    }

    return this.prisma.providerStaff.update({
      where: { id: staffId },
      data: {
        role: dto.role,
        displayName: dto.displayName?.trim(),
        permissions: dto.permissions || undefined,
        updatedAt: new Date(),
      },
      include: { user: { select: { id: true, email: true, fullName: true, avatarUrl: true } } },
    });
  }

  /** Remove a staff member (revoke access). */
  async removeStaff(providerId: string, staffId: string, removerId: string) {
    const remover = await this.getMembership(removerId, providerId);
    if (!remover || remover.inviteStatus !== 'ACCEPTED') {
      throw new ForbiddenException('You are not a staff member of this practice.');
    }
    const removerPerms = this.getPermissions(remover.role, remover.permissions as Record<string, boolean> | null);
    if (!removerPerms.manage_staff) {
      throw new ForbiddenException('You do not have permission to manage staff.');
    }

    const target = await this.prisma.providerStaff.findFirst({
      where: { id: staffId, providerId },
    });
    if (!target) throw new NotFoundException('Staff member not found.');

    // Cannot remove OWNER
    if (target.role === 'OWNER') {
      throw new ForbiddenException('Cannot remove the owner. Transfer ownership first.');
    }

    // Cannot remove someone with equal or higher role
    if (ROLE_RANK[target.role] >= ROLE_RANK[remover.role]) {
      throw new ForbiddenException('You cannot remove a staff member with an equal or higher role.');
    }

    return this.prisma.providerStaff.update({
      where: { id: staffId },
      data: {
        inviteStatus: 'REVOKED',
        revokedAt: new Date(),
        inviteToken: null,
      },
    });
  }

  /** Get the user's staff role for a provider (for permission checks in guards). */
  async getStaffRole(userId: string, providerId: string): Promise<StaffRole | null> {
    const membership = await this.prisma.providerStaff.findUnique({
      where: { providerId_userId: { providerId, userId } },
    });
    if (!membership || membership.inviteStatus !== 'ACCEPTED') return null;
    return membership.role;
  }

  /** Ensure the provider owner has an OWNER staff record (called on provider creation). */
  async ensureOwnerRecord(providerId: string, userId: string, displayName?: string) {
    const existing = await this.prisma.providerStaff.findUnique({
      where: { providerId_userId: { providerId, userId } },
    });
    if (existing) return existing;

    return this.prisma.providerStaff.create({
      data: {
        providerId,
        userId,
        role: 'OWNER',
        inviteStatus: 'ACCEPTED',
        acceptedAt: new Date(),
        displayName: displayName || null,
      },
    });
  }
}
