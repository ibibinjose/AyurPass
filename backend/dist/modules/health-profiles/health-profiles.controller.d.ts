import { HealthProfilesService } from './health-profiles.service';
import { CreateHealthProfileDto, UpdateHealthProfileDto } from '../../dtos/health-profile.dto';
export declare class HealthProfilesController {
    private readonly service;
    constructor(service: HealthProfilesService);
    createOrUpdate(consumerId: string, data: CreateHealthProfileDto): Promise<{
        consumerId: string;
        id: string;
        updatedAt: Date;
        vataScore: import("@prisma/client/runtime/library").Decimal | null;
        pittaScore: import("@prisma/client/runtime/library").Decimal | null;
        kaphaScore: import("@prisma/client/runtime/library").Decimal | null;
        questionnaireResponses: import("@prisma/client/runtime/library").JsonValue | null;
        currentImbalances: import("@prisma/client/runtime/library").JsonValue | null;
        lastAssessment: Date | null;
    }>;
    getProfile(consumerId: string): Promise<{
        consumerId: string;
        id: string;
        updatedAt: Date;
        vataScore: import("@prisma/client/runtime/library").Decimal | null;
        pittaScore: import("@prisma/client/runtime/library").Decimal | null;
        kaphaScore: import("@prisma/client/runtime/library").Decimal | null;
        questionnaireResponses: import("@prisma/client/runtime/library").JsonValue | null;
        currentImbalances: import("@prisma/client/runtime/library").JsonValue | null;
        lastAssessment: Date | null;
    } | null>;
    update(consumerId: string, updateHealthProfileDto: UpdateHealthProfileDto): Promise<{
        consumerId: string;
        id: string;
        updatedAt: Date;
        vataScore: import("@prisma/client/runtime/library").Decimal | null;
        pittaScore: import("@prisma/client/runtime/library").Decimal | null;
        kaphaScore: import("@prisma/client/runtime/library").Decimal | null;
        questionnaireResponses: import("@prisma/client/runtime/library").JsonValue | null;
        currentImbalances: import("@prisma/client/runtime/library").JsonValue | null;
        lastAssessment: Date | null;
    }>;
}
