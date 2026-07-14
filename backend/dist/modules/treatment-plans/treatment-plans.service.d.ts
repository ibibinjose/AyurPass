import { PrismaService } from '../../prisma/prisma.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from '../../dtos/treatment-plan.dto';
export declare class TreatmentPlansService {
    private prisma;
    constructor(prisma: PrismaService);
    createTreatmentPlan(data: CreateTreatmentPlanDto): Promise<{
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
    getPlansForConsumer(consumerId: string): Promise<{
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
    updatePlan(id: string, data: UpdateTreatmentPlanDto): Promise<{
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
    removePlan(id: string): Promise<{
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
