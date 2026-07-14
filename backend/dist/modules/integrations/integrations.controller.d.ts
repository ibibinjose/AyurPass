import { IntegrationsService } from './integrations.service';
export declare class ConnectChannelDto {
    providerId: string;
    type: string;
}
export declare class IntegrationsController {
    private readonly service;
    constructor(service: IntegrationsService);
    channels(providerId: string): Promise<({
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
    connect(dto: ConnectChannelDto): Promise<{
        providerId: string;
        status: string;
        type: string;
        id: string;
        createdAt: Date;
        externalAccountId: string | null;
        config: import("@prisma/client/runtime/library").JsonValue | null;
        connectedAt: Date | null;
        lastSyncAt: Date | null;
    }>;
    disconnect(id: string): Promise<{
        providerId: string;
        status: string;
        type: string;
        id: string;
        createdAt: Date;
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
