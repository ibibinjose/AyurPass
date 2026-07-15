export declare class Professional {
    id: string;
    code: string;
    userId: string;
    providerId: string;
    title?: string;
    specializations?: string[];
    doshaExpertise?: any;
    bio?: string;
    certifications?: any;
    yearsExperience?: number;
    hourlyRate?: number;
    availabilityPreferences?: any;
    verificationDocuments?: any;
    rating?: number;
    reviewCount?: number;
    createdAt: Date;
    updatedAt?: Date;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    languages?: string;
    education?: string;
    licenseNumber?: string;
    licenseState?: string;
    isVerified?: boolean;
    isActive?: boolean;
    specialties?: any;
    approach?: any;
    modalities?: any;
    insuranceAccepted?: any;
    consultationTypes?: any;
    pricing?: any;
}
export declare class CreateProfessionalDto {
    userId: string;
    providerId: string;
    title?: string;
    specializations?: string[];
    doshaExpertise?: any;
    bio?: string;
    certifications?: any;
    yearsExperience?: number;
    hourlyRate?: number;
    availabilityPreferences?: any;
    verificationDocuments?: any;
}
export declare class UpdateProfessionalDto {
    title?: string;
    specializations?: string[];
    doshaExpertise?: any;
    bio?: string;
    certifications?: any;
    yearsExperience?: number;
    hourlyRate?: number;
    availabilityPreferences?: any;
    verificationDocuments?: any;
}
