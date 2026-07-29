import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Helper to ensure a ClientRecord exists between a Provider and a Consumer.
   * Auto-created when a client is viewed or booked.
   */
  async findOrCreateClientRecord(providerId: string, consumerId: string) {
    const existing = await this.prisma.clientRecord.findUnique({
      where: {
        providerId_consumerId: { providerId, consumerId },
      },
    });

    if (existing) return existing;

    return this.prisma.clientRecord.create({
      data: {
        providerId,
        consumerId,
        tags: [],
      },
    });
  }

  async getClientsForProvider(providerId: string) {
    const records = await this.prisma.clientRecord.findMany({
      where: { providerId, status: { not: 'archived' } },
      include: {
        consumer: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Let's aggregate booking counts and order counts for each record
    return Promise.all(
      records.map(async (rec) => {
        const bookingsCount = await this.prisma.booking.count({
          where: { providerId, consumerId: rec.consumerId },
        });
        const ordersCount = await this.prisma.order.count({
          where: { providerId, consumerId: rec.consumerId },
        });

        return {
          ...rec,
          bookingsCount,
          ordersCount,
        };
      }),
    );
  }

  async getClientDetail(providerId: string, consumerId: string) {
    const record = await this.findOrCreateClientRecord(providerId, consumerId);

    const clientRecord = await this.prisma.clientRecord.findUnique({
      where: { id: record.id },
      include: {
        consumer: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!clientRecord) throw new NotFoundException('Client record not found');

    const bookings = await this.prisma.booking.findMany({
      where: { providerId, consumerId },
      include: { service: true, professional: { include: { user: { select: { fullName: true } } } } },
      orderBy: { startTime: 'desc' },
    });

    const orders = await this.prisma.order.findMany({
      where: { providerId, consumerId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...clientRecord,
      bookings,
      orders,
    };
  }

  async updateClientRecord(
    providerId: string,
    consumerId: string,
    data: { tags?: string[]; customFields?: Prisma.InputJsonValue; status?: string },
  ) {
    const record = await this.findOrCreateClientRecord(providerId, consumerId);

    return this.prisma.clientRecord.update({
      where: { id: record.id },
      data: {
        tags: data.tags,
        customFields: data.customFields,
        status: data.status,
        updatedAt: new Date(),
      },
    });
  }

  async addNote(providerId: string, consumerId: string, authorId: string, note: string) {
    const record = await this.findOrCreateClientRecord(providerId, consumerId);

    return this.prisma.clientNote.create({
      data: {
        clientRecordId: record.id,
        authorId,
        note,
      },
    });
  }

  async deleteNote(noteId: string) {
    return this.prisma.clientNote.delete({
      where: { id: noteId },
    });
  }

  async sendEmailCampaign(providerId: string, subject: string, _body: string) {
    const clients = await this.prisma.clientRecord.findMany({
      where: { providerId, status: { not: 'archived' } },
      include: {
        consumer: {
          include: {
            user: { select: { email: true, fullName: true } },
          },
        },
      },
    });

    const emails = clients
      .map((c) => c.consumer?.user?.email)
      .filter(Boolean) as string[];

    this.logger.log(`[Email Campaign] Provider ${providerId} — sending to ${emails.length} clients. Subject: "${subject}"`);

    const integration = await this.prisma.integration.findFirst({
      where: { providerId, type: { in: ['MAILCHIMP', 'SENDGRID'] }, status: 'connected' },
    });

    let sentCount = 0;
    if (integration) {
      this.logger.log(`[Email Campaign] Integration ${integration.type} connected — would send via API (integration not yet implemented)`);
    } else if (emails.length > 0) {
      this.logger.warn(`[Email Campaign] No email integration connected for provider ${providerId}. Emails would be logged only.`);
    }

    return {
      sentCount,
      emails,
      providerId,
      subject,
      success: true,
    };
  }
}
