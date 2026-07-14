import { ConsentsService } from './consents.service';
import { CreateConsentDto, UpdateConsentDto } from '../../dtos/consent.dto';
export declare class ConsentsController {
    private readonly consentsService;
    constructor(consentsService: ConsentsService);
    create(createConsentDto: CreateConsentDto): Promise<{
        consumerId: string;
        status: string;
        id: string;
        createdAt: Date;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }>;
    findByConsumer(consumerId: string): Promise<{
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
    update(id: string, updateConsentDto: UpdateConsentDto): Promise<{
        consumerId: string;
        status: string;
        id: string;
        createdAt: Date;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }>;
    revoke(id: string): Promise<{
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
