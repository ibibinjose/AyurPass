import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsentDto, UpdateConsentDto } from '../../dtos/consent.dto';
export declare class ConsentsService {
    private prisma;
    constructor(prisma: PrismaService);
    createConsent(data: CreateConsentDto): Promise<{
        id: string;
        createdAt: Date;
        consumerId: string;
        status: string;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }>;
    getConsentsForConsumer(consumerId: string): Promise<{
        id: string;
        createdAt: Date;
        consumerId: string;
        status: string;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        consumerId: string;
        status: string;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    } | null>;
    updateConsent(id: string, data: UpdateConsentDto): Promise<{
        id: string;
        createdAt: Date;
        consumerId: string;
        status: string;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }>;
    revokeConsent(id: string): Promise<{
        id: string;
        createdAt: Date;
        consumerId: string;
        status: string;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }>;
}
