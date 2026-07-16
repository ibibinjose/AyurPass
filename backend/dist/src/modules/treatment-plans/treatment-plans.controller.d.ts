import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from '../../dtos/treatment-plan.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
export declare class TreatmentPlansController {
    private readonly service;
    constructor(service: TreatmentPlansService);
    create(createTreatmentPlanDto: CreateTreatmentPlanDto): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        description: string | null;
        providerId: string;
        consumerId: string;
        professionalId: string | null;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }>;
    findByConsumer(consumerId: string, req: AuthedRequest): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        description: string | null;
        providerId: string;
        consumerId: string;
        professionalId: string | null;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        description: string | null;
        providerId: string;
        consumerId: string;
        professionalId: string | null;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    } | null>;
    update(id: string, updateTreatmentPlanDto: UpdateTreatmentPlanDto): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        description: string | null;
        providerId: string;
        consumerId: string;
        professionalId: string | null;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        description: string | null;
        providerId: string;
        consumerId: string;
        professionalId: string | null;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        phases: import("@prisma/client/runtime/library").JsonValue | null;
        aiGenerated: boolean;
    }>;
}
