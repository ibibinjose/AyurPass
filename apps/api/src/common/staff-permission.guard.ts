import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StaffService } from '../modules/staff/staff.service';

/**
 * Decorator to require a specific staff permission on the provider route.
 * Usage: @RequireStaffPermission('manage_bookings')
 *
 * The guard reads `providerId` from req.params (route must have :providerId).
 * Platform admins bypass all staff permission checks.
 */
export const STAFF_PERMISSION_KEY = 'staff_permission';
export const RequireStaffPermission = (...permissions: string[]) =>
  SetMetadata(STAFF_PERMISSION_KEY, permissions);

@Injectable()
export class StaffPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private staffService: StaffService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      STAFF_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permission decorator → allow (guard only activates when decorator present)
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('Authentication required.');

    // Platform admins bypass staff checks
    if (user.role === 'PLATFORM_ADMIN') return true;

    // Extract providerId from route params
    const providerId = request.params.providerId || request.params.id;
    if (!providerId) {
      throw new ForbiddenException('Provider context required for this action.');
    }

    // Check each required permission
    for (const permission of requiredPermissions) {
      const has = await this.staffService.hasPermission(user.sub, providerId, permission);
      if (!has) {
        // Also check if the user is the provider owner (legacy userId on Provider)
        const provider = await this.staffService['prisma'].provider.findUnique({
          where: { id: providerId },
          select: { userId: true },
        });
        if (provider?.userId === user.sub) return true; // Legacy owner fallback
        throw new ForbiddenException(`You lack the '${permission}' permission for this practice.`);
      }
    }

    return true;
  }
}
