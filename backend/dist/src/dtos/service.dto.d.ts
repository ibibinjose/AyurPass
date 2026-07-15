import { ServiceCategory } from '@prisma/client';
export declare class CreateServiceDto {
    providerId: string;
    professionalId?: string;
    category: ServiceCategory;
    name: string;
    description?: string;
    durationMinutes: number;
    price: number;
    currency?: string;
    imageUrl?: string;
    doshaCompatibility?: any;
    isVirtual?: boolean;
    maxParticipants?: number;
}
export declare class UpdateServiceDto {
    professionalId?: string;
    category?: ServiceCategory;
    name?: string;
    description?: string;
    durationMinutes?: number;
    price?: number;
    currency?: string;
    imageUrl?: string;
    doshaCompatibility?: any;
    isVirtual?: boolean;
    maxParticipants?: number;
}
