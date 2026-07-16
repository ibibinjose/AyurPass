import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthProfileDto, UpdateHealthProfileDto } from '../../dtos/health-profile.dto';
export declare class HealthProfilesService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrUpdateProfile(consumerId: string, data: CreateHealthProfileDto): Promise<{
        id: string;
        updatedAt: Date;
        consumerId: string;
        vataScore: import("@prisma/client/runtime/library").Decimal | null;
        pittaScore: import("@prisma/client/runtime/library").Decimal | null;
        kaphaScore: import("@prisma/client/runtime/library").Decimal | null;
        questionnaireResponses: import("@prisma/client/runtime/library").JsonValue | null;
        currentImbalances: import("@prisma/client/runtime/library").JsonValue | null;
        lastAssessment: Date | null;
    }>;
    getProfile(consumerId: string): Promise<{
        id: string;
        updatedAt: Date;
        consumerId: string;
        vataScore: import("@prisma/client/runtime/library").Decimal | null;
        pittaScore: import("@prisma/client/runtime/library").Decimal | null;
        kaphaScore: import("@prisma/client/runtime/library").Decimal | null;
        questionnaireResponses: import("@prisma/client/runtime/library").JsonValue | null;
        currentImbalances: import("@prisma/client/runtime/library").JsonValue | null;
        lastAssessment: Date | null;
    } | null>;
    updateProfile(consumerId: string, data: UpdateHealthProfileDto): Promise<{
        id: string;
        updatedAt: Date;
        consumerId: string;
        vataScore: import("@prisma/client/runtime/library").Decimal | null;
        pittaScore: import("@prisma/client/runtime/library").Decimal | null;
        kaphaScore: import("@prisma/client/runtime/library").Decimal | null;
        questionnaireResponses: import("@prisma/client/runtime/library").JsonValue | null;
        currentImbalances: import("@prisma/client/runtime/library").JsonValue | null;
        lastAssessment: Date | null;
    }>;
}
