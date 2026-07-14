import { IntegrationsService } from './integrations.service';
export declare class ConnectChannelDto {
    providerId: string;
    type: string;
}
export declare class IntegrationsController {
    private readonly service;
    constructor(service: IntegrationsService);
    channels(providerId: string): Promise<({
        status: any;
        integrationId: any;
        externalAccountId: any;
        connectedAt: any;
        lastSyncAt: any;
        mock: boolean;
        type: "SQUARE_POS";
        name: "Square POS";
        description: "Sync your catalog, inventory and appointments with Square Point of Sale.";
        connectable: true;
    } | {
        status: any;
        integrationId: any;
        externalAccountId: any;
        connectedAt: any;
        lastSyncAt: any;
        mock: boolean;
        type: "STRIPE_PAYMENTS";
        name: "Stripe Payments";
        description: "Online card payments and marketplace payouts (currently in test mode).";
        connectable: true;
    } | {
        status: any;
        integrationId: any;
        externalAccountId: any;
        connectedAt: any;
        lastSyncAt: any;
        mock: boolean;
        type: "GOOGLE_CALENDAR";
        name: "Google Calendar";
        description: "Two-way appointment sync. Booking exports (.ics) work today without connecting.";
        connectable: true;
    } | {
        status: any;
        integrationId: any;
        externalAccountId: any;
        connectedAt: any;
        lastSyncAt: any;
        mock: boolean;
        type: "AYURPASS_STORE";
        name: "AyurPass Online Store";
        description: "Your products and sessions, bookable and buyable on ayurpass.com.";
        connectable: false;
    })[]>;
    connect(dto: ConnectChannelDto): Promise<any>;
    disconnect(id: string): Promise<any>;
    sync(id: string): Promise<{
        integrationId: string;
        type: any;
        syncedAt: string;
        report: {
            catalogItemsPushed: number;
            inventoryCountsPulled: number;
            appointmentsMirrored: number;
        };
        mock: boolean;
    }>;
}
