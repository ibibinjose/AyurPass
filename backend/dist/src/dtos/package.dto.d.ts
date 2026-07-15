export declare class WellnessPackage {
    id: string;
    code: string;
    providerId: string;
    name: string;
    description?: string;
    totalPrice: number;
    durationDays?: number;
    includedServices?: any;
    includedProducts?: any;
    doshaFocus?: any;
    isRecurring?: boolean;
    images?: string[];
    startDate?: string;
    endDate?: string;
    category?: string;
    benefits?: any;
    requirements?: any;
    schedule?: any;
    createdAt: Date;
    updatedAt?: Date;
}
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
    images?: string[];
    startDate?: string;
    endDate?: string;
    category?: string;
    benefits?: any;
    requirements?: any;
    schedule?: any;
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
    images?: string[];
    startDate?: string;
    endDate?: string;
    category?: string;
    benefits?: any;
    requirements?: any;
    schedule?: any;
}
