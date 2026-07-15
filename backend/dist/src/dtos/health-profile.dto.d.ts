export declare class HealthProfile {
    id: string;
    consumerId: string;
    vataScore?: number;
    pittaScore?: number;
    kaphaScore?: number;
    questionnaireResponses?: any;
    currentImbalances?: any;
    lastAssessment?: string;
    primaryDosha?: string;
    secondaryDosha?: string;
    tertiaryDosha?: string;
    constitution?: string;
    currentState?: any;
    recommendations?: any;
    lifestyleFactors?: any;
    medicalHistory?: any;
    allergies?: any;
    medications?: any;
    updatedAt: Date;
}
export declare class CreateHealthProfileDto {
    consumerId: string;
    vataScore?: number;
    pittaScore?: number;
    kaphaScore?: number;
    questionnaireResponses?: any;
    currentImbalances?: any;
    lastAssessment?: string;
}
export declare class UpdateHealthProfileDto {
    vataScore?: number;
    pittaScore?: number;
    kaphaScore?: number;
    questionnaireResponses?: any;
    currentImbalances?: any;
    lastAssessment?: string;
}
