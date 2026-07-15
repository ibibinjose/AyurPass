import { HealthProfilesService } from './health-profiles.service';
import { CreateHealthProfileDto, UpdateHealthProfileDto } from '../../dtos/health-profile.dto';
export declare class HealthProfilesController {
    private readonly service;
    constructor(service: HealthProfilesService);
    createOrUpdate(consumerId: string, data: CreateHealthProfileDto): Promise<{
        id: string;
        consumerId: string;
        vataScore: import("@prisma/client/runtime/library").Decimal | null;
        pittaScore: import("@prisma/client/runtime/library").Decimal | null;
        kaphaScore: import("@prisma/client/runtime/library").Decimal | null;
        questionnaireResponses: import("@prisma/client/runtime/library").JsonValue | null;
        currentImbalances: import("@prisma/client/runtime/library").JsonValue | null;
        lastAssessment: Date | null;
        updatedAt: Date;
    }>;
    getProfile(consumerId: string): Promise<{
        id: string;
        consumerId: string;
        vataScore: import("@prisma/client/runtime/library").Decimal | null;
        pittaScore: import("@prisma/client/runtime/library").Decimal | null;
        kaphaScore: import("@prisma/client/runtime/library").Decimal | null;
        questionnaireResponses: import("@prisma/client/runtime/library").JsonValue | null;
        currentImbalances: import("@prisma/client/runtime/library").JsonValue | null;
        lastAssessment: Date | null;
        updatedAt: Date;
    } | null>;
    update(consumerId: string, updateHealthProfileDto: UpdateHealthProfileDto): Promise<{
        id: string;
        consumerId: string;
        vataScore: import("@prisma/client/runtime/library").Decimal | null;
        pittaScore: import("@prisma/client/runtime/library").Decimal | null;
        kaphaScore: import("@prisma/client/runtime/library").Decimal | null;
        questionnaireResponses: import("@prisma/client/runtime/library").JsonValue | null;
        currentImbalances: import("@prisma/client/runtime/library").JsonValue | null;
        lastAssessment: Date | null;
        updatedAt: Date;
    }>;
}
