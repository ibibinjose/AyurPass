import { PrismaService } from '../../prisma/prisma.service';
export declare const AVAILABLE_CHANNELS: readonly [{
    readonly type: "SQUARE_POS";
    readonly name: "Square POS";
    readonly description: "Sync your catalog, inventory and appointments with Square Point of Sale.";
    readonly connectable: true;
}, {
    readonly type: "STRIPE_PAYMENTS";
    readonly name: "Stripe Payments";
    readonly description: "Online card payments and marketplace payouts (currently in test mode).";
    readonly connectable: true;
}, {
    readonly type: "GOOGLE_CALENDAR";
    readonly name: "Google Calendar";
    readonly description: "Two-way appointment sync. Booking exports (.ics) work today without connecting.";
    readonly connectable: true;
}, {
    readonly type: "AYURPASS_STORE";
    readonly name: "AyurPass Online Store";
    readonly description: "Your products and sessions, bookable and buyable on ayurpass.com.";
    readonly connectable: false;
}];
export declare class IntegrationsService {
    private prisma;
    constructor(prisma: PrismaService);
    get mockMode(): boolean;
    channelsForProvider(providerId: string): Promise<({
        status: string;
        integrationId: string | null;
        externalAccountId: string | null;
        connectedAt: Date | null;
        lastSyncAt: Date | null;
        mock: boolean;
        type: "SQUARE_POS";
        name: "Square POS";
        description: "Sync your catalog, inventory and appointments with Square Point of Sale.";
        connectable: true;
    } | {
        status: string;
        integrationId: string | null;
        externalAccountId: string | null;
        connectedAt: Date | null;
        lastSyncAt: Date | null;
        mock: boolean;
        type: "STRIPE_PAYMENTS";
        name: "Stripe Payments";
        description: "Online card payments and marketplace payouts (currently in test mode).";
        connectable: true;
    } | {
        status: string;
        integrationId: string | null;
        externalAccountId: string | null;
        connectedAt: Date | null;
        lastSyncAt: Date | null;
        mock: boolean;
        type: "GOOGLE_CALENDAR";
        name: "Google Calendar";
        description: "Two-way appointment sync. Booking exports (.ics) work today without connecting.";
        connectable: true;
    } | {
        status: string;
        integrationId: string | null;
        externalAccountId: string | null;
        connectedAt: Date | null;
        lastSyncAt: Date | null;
        mock: boolean;
        type: "AYURPASS_STORE";
        name: "AyurPass Online Store";
        description: "Your products and sessions, bookable and buyable on ayurpass.com.";
        connectable: false;
    })[]>;
    connect(providerId: string, type: string): Promise<{
        id: string;
        createdAt: Date;
        providerId: string;
        status: string;
        type: string;
        externalAccountId: string | null;
        config: import("@prisma/client/runtime/library").JsonValue | null;
        connectedAt: Date | null;
        lastSyncAt: Date | null;
    }>;
    disconnect(id: string): Promise<{
        id: string;
        createdAt: Date;
        providerId: string;
        status: string;
        type: string;
        externalAccountId: string | null;
        config: import("@prisma/client/runtime/library").JsonValue | null;
        connectedAt: Date | null;
        lastSyncAt: Date | null;
    }>;
    sync(id: string): Promise<{
        integrationId: string;
        type: string;
        syncedAt: string;
        report: {
            catalogItemsPushed: number;
            inventoryCountsPulled: number;
            appointmentsMirrored: number;
        };
        mock: boolean;
    }>;
}
