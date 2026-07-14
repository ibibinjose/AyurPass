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
