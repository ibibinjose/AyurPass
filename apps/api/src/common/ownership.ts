import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

/** Provider admin, linked professional, or platform admin may manage a practice. */
export async function assertProviderAccess(
  prisma: PrismaService,
  user: AuthedUser,
  providerId: string,
): Promise<void> {
  if (user.role === 'PLATFORM_ADMIN') return;

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { userId: true },
  });
  if (!provider) throw new NotFoundException('Provider not found');

  if (provider.userId === user.sub) return;

  const professional = await prisma.professional.findFirst({
    where: { providerId, userId: user.sub },
    select: { id: true },
  });
  if (professional) return;

  throw new ForbiddenException('You do not manage this practice');
}

/** Clinic billing changes are restricted to the practice owner or a platform administrator. */
export async function assertProviderOwner(
  prisma: PrismaService,
  user: AuthedUser,
  providerId: string,
): Promise<void> {
  if (user.role === 'PLATFORM_ADMIN') return;
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { userId: true },
  });
  if (!provider) throw new NotFoundException('Provider not found');
  if (provider.userId !== user.sub) {
    throw new ForbiddenException('Only the practice owner can manage subscription billing');
  }
}

export async function assertServiceProviderAccess(
  prisma: PrismaService,
  user: AuthedUser,
  serviceId: string,
): Promise<void> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { providerId: true },
  });
  if (!service) throw new NotFoundException('Service not found');
  await assertProviderAccess(prisma, user, service.providerId);
}

export async function assertProductProviderAccess(
  prisma: PrismaService,
  user: AuthedUser,
  productId: string,
): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { providerId: true },
  });
  if (!product) throw new NotFoundException('Product not found');
  await assertProviderAccess(prisma, user, product.providerId);
}

export async function assertPackageProviderAccess(
  prisma: PrismaService,
  user: AuthedUser,
  packageId: string,
): Promise<void> {
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { providerId: true },
  });
  if (!pkg) throw new NotFoundException('Package not found');
  await assertProviderAccess(prisma, user, pkg.providerId);
}

export async function assertRoomProviderAccess(
  prisma: PrismaService,
  user: AuthedUser,
  roomId: string,
): Promise<void> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { providerId: true },
  });
  if (!room) throw new NotFoundException('Room not found');
  await assertProviderAccess(prisma, user, room.providerId);
}

export async function assertBookingParty(
  prisma: PrismaService,
  user: AuthedUser,
  bookingId: string,
): Promise<void> {
  if (user.role === 'PLATFORM_ADMIN') return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { consumerId: true, providerId: true },
  });
  if (!booking) throw new NotFoundException('Booking not found');

  if (booking.consumerId === user.sub) return;

  try {
    await assertProviderAccess(prisma, user, booking.providerId);
  } catch (err) {
    if (err instanceof ForbiddenException) {
      throw new ForbiddenException('You are not a party to this booking');
    }
    throw err;
  }
}

/**
 * Only the booking's consumer (or platform admin) may initiate checkout / confirm.
 * Providers must not redeem a client's gift card or loyalty points on their behalf.
 */
export async function assertBookingPayer(
  prisma: PrismaService,
  user: AuthedUser,
  bookingId: string,
): Promise<void> {
  if (user.role === 'PLATFORM_ADMIN') return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { consumerId: true },
  });
  if (!booking) throw new NotFoundException('Booking not found');
  if (booking.consumerId !== user.sub) {
    throw new ForbiddenException('Only the booking owner can pay for this booking');
  }
}

/**
 * Only the order's consumer (or platform admin) may initiate checkout / confirm.
 */
export async function assertOrderPayer(
  prisma: PrismaService,
  user: AuthedUser,
  orderId: string,
): Promise<void> {
  if (user.role === 'PLATFORM_ADMIN') return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { consumerId: true },
  });
  if (!order) throw new NotFoundException('Order not found');
  if (order.consumerId !== user.sub) {
    throw new ForbiddenException('Only the order owner can pay for this order');
  }
}

export async function assertProfessionalProviderAccess(
  prisma: PrismaService,
  user: AuthedUser,
  professionalId: string,
): Promise<void> {
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { providerId: true },
  });
  if (!professional) throw new NotFoundException('Professional not found');
  await assertProviderAccess(prisma, user, professional.providerId);
}

export function assertPlatformAdmin(user: AuthedUser): void {
  if (user.role === 'PLATFORM_ADMIN') return;
  throw new ForbiddenException('Platform admin access required');
}

export async function assertTreatmentPlanParty(
  prisma: PrismaService,
  user: AuthedUser,
  planId: string,
): Promise<void> {
  if (user.role === 'PLATFORM_ADMIN') return;

  const plan = await prisma.treatmentPlan.findUnique({
    where: { id: planId },
    select: { consumerId: true, providerId: true },
  });
  if (!plan) throw new NotFoundException('Treatment plan not found');

  if (plan.consumerId === user.sub) return;

  try {
    await assertProviderAccess(prisma, user, plan.providerId);
  } catch (err) {
    if (err instanceof ForbiddenException) {
      throw new ForbiddenException('You are not a party to this treatment plan');
    }
    throw err;
  }
}

export async function assertOrderParty(
  prisma: PrismaService,
  user: AuthedUser,
  orderId: string,
): Promise<void> {
  if (user.role === 'PLATFORM_ADMIN') return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { consumerId: true, providerId: true },
  });
  if (!order) throw new NotFoundException('Order not found');

  if (order.consumerId === user.sub) return;

  try {
    await assertProviderAccess(prisma, user, order.providerId);
  } catch (err) {
    if (err instanceof ForbiddenException) {
      throw new ForbiddenException('You are not a party to this order');
    }
    throw err;
  }
}
