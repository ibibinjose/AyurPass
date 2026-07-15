import { ProviderType } from '@prisma/client';
export declare class UpdateProviderDto {
    businessName?: string;
    type?: ProviderType;
    brandProfile?: Record<string, unknown>;
    address?: Record<string, unknown>;
    timezone?: string;
}
