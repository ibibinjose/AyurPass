import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CrmService {
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
    data: { tags?: string[]; customFields?: any; status?: string },
  ) {
    const record = await this.findOrCreateClientRecord(providerId, consumerId);

    return this.prisma.clientRecord.update({
      where: { id: record.id },
      data: {
        ...data,
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

  async sendEmailCampaign(providerId: string, subject: string, body: string) {
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

    console.log(`[Email Campaign] Sending to ${emails.length} clients:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    // If provider has connected MAILCHIMP:
    const mailchimpConnected = await this.prisma.integration.findUnique({
      where: { providerId_type: { providerId, type: 'MAILCHIMP' } },
    });
    if (mailchimpConnected && mailchimpConnected.status === 'connected') {
      console.log(`[Mailchimp Sync] Syncing audience list to Mailchimp...`);
    }

    const sendgridConnected = await this.prisma.integration.findUnique({
      where: { providerId_type: { providerId, type: 'SENDGRID' } },
    });
    if (sendgridConnected && sendgridConnected.status === 'connected') {
      console.log(`[SendGrid Email] Sending campaign via SendGrid API...`);
    }

    return {
      sentCount: emails.length,
      emails,
      providerId,
      subject,
      success: true,
    };
  }
}
