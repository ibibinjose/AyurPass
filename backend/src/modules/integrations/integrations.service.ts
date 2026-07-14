import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * POS / channel integrations. Square is the reference connector; the same
 * shape extends to Clover, Zettle, etc.
 *
 * Placeholder mode (no SQUARE_ACCESS_TOKEN in env): connect/sync succeed
 * instantly with mock identifiers so the whole product flow can be exercised.
 *
 * The real Square integration replaces the mock blocks:
 *   connect():  redirect the merchant to
 *               https://connect.squareup.com/oauth2/authorize?client_id=…&scope=
 *               MERCHANT_PROFILE_READ ITEMS_READ ITEMS_WRITE INVENTORY_READ
 *               INVENTORY_WRITE APPOINTMENTS_READ APPOINTMENTS_WRITE, then
 *               exchange the callback code via POST /oauth2/token and store
 *               access_token/refresh_token in `config`.
 *   sync():     push Services/Products to the Square Catalog API
 *               (POST /v2/catalog/batch-upsert), pull inventory counts
 *               (POST /v2/inventory/counts/batch-retrieve), and mirror
 *               bookings via the Square Bookings API (/v2/bookings).
 *   webhooks:   catalog.version.updated, inventory.count.updated,
 *               booking.created → keep both sides consistent.
 */
export const AVAILABLE_CHANNELS = [
  {
    type: 'SQUARE_POS',
    name: 'Square POS',
    description: 'Sync your catalog, inventory and appointments with Square Point of Sale.',
    connectable: true,
  },
  {
    type: 'STRIPE_PAYMENTS',
    name: 'Stripe Payments',
    description: 'Online card payments and marketplace payouts (currently in test mode).',
    connectable: true,
  },
  {
    type: 'GOOGLE_CALENDAR',
    name: 'Google Calendar',
    description: 'Two-way appointment sync. Booking exports (.ics) work today without connecting.',
    connectable: true,
  },
  {
    type: 'AYURPASS_STORE',
    name: 'AyurPass Online Store',
    description: 'Your products and sessions, bookable and buyable on ayurpass.com.',
    connectable: false, // always on
  },
] as const;

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  get mockMode(): boolean {
    return !process.env.SQUARE_ACCESS_TOKEN;
  }

  /** The channel catalog merged with this provider's connection state. */
  async channelsForProvider(providerId: string) {
    const connections = await this.prisma.integration.findMany({ where: { providerId } });
    return AVAILABLE_CHANNELS.map((channel) => {
      const connection = connections.find((c) => c.type === channel.type);
      return {
        ...channel,
        status: channel.connectable ? (connection?.status ?? 'disconnected') : 'active',
        integrationId: connection?.id ?? null,
        externalAccountId: connection?.externalAccountId ?? null,
        connectedAt: connection?.connectedAt ?? null,
        lastSyncAt: connection?.lastSyncAt ?? null,
        mock: this.mockMode,
      };
    });
  }

  async connect(providerId: string, type: string) {
    if (!AVAILABLE_CHANNELS.some((c) => c.type === type && c.connectable)) {
      throw new BadRequestException('Unknown or non-connectable channel');
    }
    // --- MOCK: real mode returns an OAuth authorize URL instead.
    const externalAccountId = `${type === 'SQUARE_POS' ? 'sq' : type.slice(0, 2).toLowerCase()}_merchant_${randomUUID().slice(0, 8)}`;
    return this.prisma.integration.upsert({
      where: { providerId_type: { providerId, type } },
      create: {
        providerId,
        type,
        status: 'connected',
        externalAccountId,
        connectedAt: new Date(),
      },
      update: { status: 'connected', externalAccountId, connectedAt: new Date() },
    });
  }

  async disconnect(id: string) {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException('Integration not found');
    // Real mode also revokes the token: POST /oauth2/revoke.
    return this.prisma.integration.update({
      where: { id },
      data: { status: 'disconnected', externalAccountId: null, connectedAt: null },
    });
  }

  /** Pretends to push the catalog and pull inventory; returns a sync report. */
  async sync(id: string) {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException('Integration not found');
    if (integration.status !== 'connected') {
      throw new BadRequestException('Connect the channel before syncing');
    }

    const [services, products, bookings] = await this.prisma.$transaction([
      this.prisma.service.count({ where: { providerId: integration.providerId } }),
      this.prisma.product.count({ where: { providerId: integration.providerId } }),
      this.prisma.booking.count({ where: { providerId: integration.providerId } }),
    ]);

    // --- MOCK: real mode runs the Catalog/Inventory/Bookings API calls here.
    await this.prisma.integration.update({ where: { id }, data: { lastSyncAt: new Date() } });

    return {
      integrationId: id,
      type: integration.type,
      syncedAt: new Date().toISOString(),
      report: {
        catalogItemsPushed: services + products,
        inventoryCountsPulled: products,
        appointmentsMirrored: bookings,
      },
      mock: this.mockMode,
    };
  }
}
