import { RetreatCategory } from '@prisma/client';
export declare class CreateRetreatDto {
    title: string;
    category: RetreatCategory;
    summary?: string;
    description?: string;
    city?: string;
    country?: string;
    address?: Record<string, unknown>;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    priceFrom?: number;
    currency?: string;
    capacity?: number;
    skillLevel?: string;
    images?: string[];
    highlights?: string[];
    inclusions?: string[];
    externalBookingUrl?: string;
    status?: string;
}
export declare class UpdateRetreatDto {
    title?: string;
    category?: RetreatCategory;
    summary?: string;
    description?: string;
    city?: string;
    country?: string;
    address?: Record<string, unknown>;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    priceFrom?: number;
    currency?: string;
    capacity?: number;
    skillLevel?: string;
    images?: string[];
    highlights?: string[];
    inclusions?: string[];
    externalBookingUrl?: string;
    status?: string;
}
export declare class CurateRetreatDto {
    featured?: boolean;
    verificationStatus?: string;
}
