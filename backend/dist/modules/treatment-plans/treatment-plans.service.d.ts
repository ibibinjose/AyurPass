import { PrismaService } from '../../prisma/prisma.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from '../../dtos/treatment-plan.dto';
export declare class TreatmentPlansService {
    private prisma;
    constructor(prisma: PrismaService);
    createTreatmentPlan(data: CreateTreatmentPlanDto): Promise<{
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
    getPlansForConsumer(consumerId: string): Promise<{
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
    updatePlan(id: string, data: UpdateTreatmentPlanDto): Promise<{
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
    removePlan(id: string): Promise<{
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
