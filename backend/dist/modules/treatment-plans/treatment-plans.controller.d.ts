import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from '../../dtos/treatment-plan.dto';
export declare class TreatmentPlansController {
    private readonly service;
    constructor(service: TreatmentPlansService);
    create(createTreatmentPlanDto: CreateTreatmentPlanDto): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        consumerId: string;
        professionalId: string | null;
        providerId: string;
        status: string;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }>;
    findByConsumer(consumerId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        consumerId: string;
        professionalId: string | null;
        providerId: string;
        status: string;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        consumerId: string;
        professionalId: string | null;
        providerId: string;
        status: string;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    } | null>;
    update(id: string, updateTreatmentPlanDto: UpdateTreatmentPlanDto): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        consumerId: string;
        professionalId: string | null;
        providerId: string;
        status: string;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        consumerId: string;
        professionalId: string | null;
        providerId: string;
        status: string;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }>;
}
