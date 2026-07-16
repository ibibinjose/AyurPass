import { ConsentsService } from './consents.service';
import { CreateConsentDto, UpdateConsentDto } from '../../dtos/consent.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
export declare class ConsentsController {
    private readonly consentsService;
    constructor(consentsService: ConsentsService);
    create(createConsentDto: CreateConsentDto, req: AuthedRequest): Promise<{
        id: string;
        createdAt: Date;
        consumerId: string;
        status: string;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }>;
    findByConsumer(consumerId: string, req: AuthedRequest): Promise<{
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
    update(id: string, updateConsentDto: UpdateConsentDto): Promise<{
        id: string;
        createdAt: Date;
        consumerId: string;
        status: string;
        granteeId: string | null;
        permissionType: string;
        scope: import("@prisma/client/runtime/library").JsonValue | null;
        expiresAt: Date | null;
    }>;
    revoke(id: string): Promise<{
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
