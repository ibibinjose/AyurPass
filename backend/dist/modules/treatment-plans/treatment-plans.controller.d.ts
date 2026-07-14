import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from '../../dtos/treatment-plan.dto';
export declare class TreatmentPlansController {
    private readonly service;
    constructor(service: TreatmentPlansService);
    create(createTreatmentPlanDto: CreateTreatmentPlanDto): Promise<{
        consumerId: string;
        professionalId: string | null;
        providerId: string;
        status: string;
        name: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }>;
    findByConsumer(consumerId: string): Promise<{
        consumerId: string;
        professionalId: string | null;
        providerId: string;
        status: string;
        name: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }[]>;
    findOne(id: string): Promise<{
        consumerId: string;
        professionalId: string | null;
        providerId: string;
        status: string;
        name: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    } | null>;
    update(id: string, updateTreatmentPlanDto: UpdateTreatmentPlanDto): Promise<{
        consumerId: string;
        professionalId: string | null;
        providerId: string;
        status: string;
        name: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }>;
    remove(id: string): Promise<{
        consumerId: string;
        professionalId: string | null;
        providerId: string;
        status: string;
        name: string | null;
        description: string | null;
        id: string;
        createdAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }>;
}
