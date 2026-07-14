import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsentDto, UpdateConsentDto } from '../../dtos/consent.dto';
export declare class ConsentsService {
    private prisma;
    constructor(prisma: PrismaService);
    createConsent(data: CreateConsentDto): Promise<{
        consumerId: string;
        status: string;
        id: string;
        createdAt: Date;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }>;
    getConsentsForConsumer(consumerId: string): Promise<{
        consumerId: string;
        status: string;
        id: string;
        createdAt: Date;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        consumerId: string;
        status: string;
        id: string;
        createdAt: Date;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    } | null>;
    updateConsent(id: string, data: UpdateConsentDto): Promise<{
        consumerId: string;
        status: string;
        id: string;
        createdAt: Date;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }>;
    revokeConsent(id: string): Promise<{
        consumerId: string;
        status: string;
        id: string;
        createdAt: Date;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }>;
}
