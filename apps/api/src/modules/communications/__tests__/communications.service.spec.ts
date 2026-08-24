import { CommunicationKind, CommunicationStatus } from '@prisma/client';
import { CommunicationsService } from '../communications.service';

describe('CommunicationsService', () => {
  const booking = {
    id: 'booking-1',
    consumerId: 'consumer-1',
    providerId: 'provider-1',
    startTime: new Date('2030-01-02T10:00:00.000Z'),
    endTime: new Date('2030-01-02T11:00:00.000Z'),
    timezone: 'Australia/Sydney',
    totalAmount: 120,
    paymentStatus: 'unpaid',
    provider: { businessName: 'Ayur Wellness', currency: 'AUD' },
    service: { name: 'Initial consultation', currency: 'AUD' },
    consumer: { user: { fullName: 'Asha Seeker', email: 'asha@example.com' } },
  };

  const setup = () => {
    const prisma = {
      booking: { findUnique: jest.fn().mockResolvedValue(booking) },
      provider: { findUnique: jest.fn().mockResolvedValue({ user: { email: 'owner@example.com', fullName: 'Provider Owner' } }) },
      providerStaff: { findMany: jest.fn().mockResolvedValue([]) },
      communicationDelivery: {
        upsert: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      receipt: { findUnique: jest.fn(), create: jest.fn() },
      enquiry: { findUnique: jest.fn() },
    };
    const mail = { sendTransactionalEmail: jest.fn().mockResolvedValue(undefined) };
    return { prisma, mail, service: new CommunicationsService(prisma as never, mail as never) };
  };

  it('queues customer confirmation, provider alert, and both future reminders once', async () => {
    const { service, prisma } = setup();

    await service.queueBookingCreated('booking-1');

    expect(prisma.communicationDelivery.upsert).toHaveBeenCalledTimes(4);
    expect(prisma.communicationDelivery.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { idempotencyKey: 'booking-confirmation:booking-1' },
      create: expect.objectContaining({ kind: CommunicationKind.BOOKING_CONFIRMATION }),
    }));
    expect(prisma.communicationDelivery.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { idempotencyKey: 'provider-new-booking:booking-1:owner@example.com' },
      create: expect.objectContaining({ kind: CommunicationKind.PROVIDER_NEW_BOOKING }),
    }));
  });

  it('claims and marks a due delivery as sent after managed email accepts it', async () => {
    const { service, prisma, mail } = setup();
    prisma.communicationDelivery.findMany.mockResolvedValue([{
      id: 'delivery-1',
      kind: CommunicationKind.BOOKING_CONFIRMATION,
      recipientEmail: 'asha@example.com',
      subject: 'Booking confirmed',
      payload: {
        consumerName: 'Asha Seeker',
        serviceName: 'Initial consultation',
        providerName: 'Ayur Wellness',
        bookingId: 'booking-1',
        startTime: '2030-01-02T10:00:00.000Z',
      },
      attemptCount: 0,
      scheduledFor: new Date(),
    }]);
    prisma.communicationDelivery.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.dispatchDue('test-worker');

    expect(result).toEqual({ sent: 1, retried: 0, failed: 0 });
    expect(mail.sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'asha@example.com' }));
    expect(prisma.communicationDelivery.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'delivery-1' },
      data: expect.objectContaining({ status: CommunicationStatus.SENT }),
    }));
  });
});
