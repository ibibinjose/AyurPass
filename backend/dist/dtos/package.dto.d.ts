export declare class CreatePackageDto {
    providerId: string;
    name: string;
    description?: string;
    totalPrice: number;
    durationDays?: number;
    includedServices?: any;
    includedProducts?: any;
    doshaFocus?: any;
    isRecurring?: boolean;
}
export declare class UpdatePackageDto {
    name?: string;
    description?: string;
    totalPrice?: number;
    durationDays?: number;
    includedServices?: any;
    includedProducts?: any;
    doshaFocus?: any;
    isRecurring?: boolean;
}
