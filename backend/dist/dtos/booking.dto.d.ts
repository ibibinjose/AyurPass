import { BookingStatus } from '@prisma/client';
export declare class CreateBookingDto {
    consumerId: string;
    serviceId: string;
    professionalId?: string;
    providerId: string;
    startTime: Date;
    endTime: Date;
    timezone?: string;
    status?: BookingStatus;
    totalAmount?: number;
    notes?: string;
}
export declare class UpdateBookingDto {
    status?: BookingStatus;
    notes?: string;
    roomId?: string | null;
    professionalId?: string | null;
    startTime?: Date;
    endTime?: Date;
}
