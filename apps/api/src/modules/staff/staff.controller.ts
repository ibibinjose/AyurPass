import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { StaffService } from './staff.service';
import { InviteStaffDto, UpdateStaffDto, AcceptInviteDto } from './staff.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
import { Public } from '../../common/public.decorator';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * List all staff for a provider.
   * Access: platform admin, accepted staff member, or provider account owner.
   * Legacy providers without an OWNER staff row are backfilled on access.
   */
  @Get('provider/:providerId')
  async listStaff(@Param('providerId') providerId: string, @Req() req: AuthedRequest) {
    await this.staffService.assertCanViewStaff(providerId, req.user.sub, req.user.role);
    return this.staffService.listStaff(providerId);
  }

  /** Get the current user's staff membership for a provider. */
  @Get('provider/:providerId/me')
  async myMembership(@Param('providerId') providerId: string, @Req() req: AuthedRequest) {
    // Backfill OWNER row for practice owners who predate the staff table
    await this.staffService.ensureOwnerIfPracticeOwner(providerId, req.user.sub);

    const membership = await this.staffService.getMembership(req.user.sub, providerId);
    if (!membership) return null;
    return {
      ...membership,
      effectivePermissions: this.staffService.getPermissions(
        membership.role,
        membership.permissions as Record<string, boolean> | null,
      ),
    };
  }

  /** Get all providers the current user is staff at. */
  @Get('my-memberships')
  async myMemberships(@Req() req: AuthedRequest) {
    const memberships = await this.staffService['prisma'].providerStaff.findMany({
      where: { userId: req.user.sub, inviteStatus: 'ACCEPTED' },
      include: {
        provider: {
          select: { id: true, businessName: true, slug: true, type: true, brandProfile: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return memberships.map((m) => ({
      id: m.id,
      role: m.role,
      displayName: m.displayName,
      provider: m.provider,
      effectivePermissions: this.staffService.getPermissions(
        m.role,
        m.permissions as Record<string, boolean> | null,
      ),
    }));
  }

  /** Invite a staff member. Requires manage_staff. */
  @Post('provider/:providerId/invite')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async invite(
    @Param('providerId') providerId: string,
    @Body() dto: InviteStaffDto,
    @Req() req: AuthedRequest,
  ) {
    return this.staffService.invite(providerId, req.user.sub, dto);
  }

  /** Accept a staff invitation (authenticated — user must be logged in). */
  @Post('accept-invite')
  async acceptInvite(@Body() dto: AcceptInviteDto, @Req() req: AuthedRequest) {
    return this.staffService.acceptInvite(dto.token, req.user.sub);
  }

  /** Public endpoint to view invite details before accepting (no auth required). */
  @Public()
  @Get('invite/:token')
  async viewInvite(@Param('token') token: string) {
    const invite = await this.staffService['prisma'].providerStaff.findUnique({
      where: { inviteToken: token },
      include: { provider: { select: { businessName: true, type: true, brandProfile: true } } },
    });
    if (!invite || invite.inviteStatus !== 'PENDING') {
      return { valid: false, message: 'This invitation is no longer valid.' };
    }
    return {
      valid: true,
      role: invite.role,
      displayName: invite.displayName,
      provider: invite.provider,
      inviteEmail: invite.inviteEmail,
    };
  }

  /** Update a staff member's role or permissions. */
  @Put('provider/:providerId/:staffId')
  async updateStaff(
    @Param('providerId') providerId: string,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffDto,
    @Req() req: AuthedRequest,
  ) {
    return this.staffService.updateStaff(providerId, staffId, req.user.sub, dto);
  }

  /** Remove (revoke) a staff member. */
  @Delete('provider/:providerId/:staffId')
  async removeStaff(
    @Param('providerId') providerId: string,
    @Param('staffId') staffId: string,
    @Req() req: AuthedRequest,
  ) {
    return this.staffService.removeStaff(providerId, staffId, req.user.sub);
  }
}
