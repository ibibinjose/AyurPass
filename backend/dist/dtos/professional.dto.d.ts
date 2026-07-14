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
