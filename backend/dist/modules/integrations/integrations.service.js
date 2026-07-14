"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = exports.AVAILABLE_CHANNELS = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
exports.AVAILABLE_CHANNELS = [
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
        connectable: false,
    },
];
let IntegrationsService = class IntegrationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    get mockMode() {
        return !process.env.SQUARE_ACCESS_TOKEN;
    }
    async channelsForProvider(providerId) {
        const connections = await this.prisma.integration.findMany({ where: { providerId } });
        return exports.AVAILABLE_CHANNELS.map((channel) => {
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
    async connect(providerId, type) {
        if (!exports.AVAILABLE_CHANNELS.some((c) => c.type === type && c.connectable)) {
            throw new common_1.BadRequestException('Unknown or non-connectable channel');
        }
        const externalAccountId = `${type === 'SQUARE_POS' ? 'sq' : type.slice(0, 2).toLowerCase()}_merchant_${(0, crypto_1.randomUUID)().slice(0, 8)}`;
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
    async disconnect(id) {
        const integration = await this.prisma.integration.findUnique({ where: { id } });
        if (!integration)
            throw new common_1.NotFoundException('Integration not found');
        return this.prisma.integration.update({
            where: { id },
            data: { status: 'disconnected', externalAccountId: null, connectedAt: null },
        });
    }
    async sync(id) {
        const integration = await this.prisma.integration.findUnique({ where: { id } });
        if (!integration)
            throw new common_1.NotFoundException('Integration not found');
        if (integration.status !== 'connected') {
            throw new common_1.BadRequestException('Connect the channel before syncing');
        }
        const [services, products, bookings] = await this.prisma.$transaction([
            this.prisma.service.count({ where: { providerId: integration.providerId } }),
            this.prisma.product.count({ where: { providerId: integration.providerId } }),
            this.prisma.booking.count({ where: { providerId: integration.providerId } }),
        ]);
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
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map