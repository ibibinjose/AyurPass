export declare class CreateConsentDto {
    consumerId: string;
    granteeId?: string;
    permissionType: string;
    scope?: any;
    expiresAt?: string;
    status?: string;
}
export declare class UpdateConsentDto {
    status?: string;
    scope?: any;
    expiresAt?: string;
}
