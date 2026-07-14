export declare class CreateTreatmentPlanDto {
    consumerId: string;
    professionalId?: string;
    providerId: string;
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    phases?: any;
    status?: string;
    aiGenerated?: boolean;
}
export declare class UpdateTreatmentPlanDto {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    phases?: any;
    status?: string;
}
