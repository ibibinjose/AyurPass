export declare class CreateOfferDto {
    title: string;
    description?: string;
    discipline?: string;
    discountLabel?: string;
    code?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    featured?: boolean;
    active?: boolean;
    startDate?: string;
    endDate?: string;
}
export declare class UpdateOfferDto {
    title?: string;
    description?: string;
    discipline?: string;
    discountLabel?: string;
    code?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    featured?: boolean;
    active?: boolean;
    startDate?: string;
    endDate?: string;
}
