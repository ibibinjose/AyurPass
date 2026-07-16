import { Role, ProviderType } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: Role;
    businessName?: string;
    providerType?: ProviderType;
    listingTier?: string;
    title?: string;
    specializations?: string[];
    bio?: string;
    prakritiScores?: any;
    preferences?: any;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn?: number;
}
export declare class AuthResponse {
    message: string;
    success: boolean;
    user?: any;
    tokens?: AuthTokens;
}
export declare class RegisterPayload {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: Role;
    businessName?: string;
    providerType?: ProviderType;
    listingTier?: string;
    title?: string;
    specializations?: string[];
    bio?: string;
    prakritiScores?: any;
    preferences?: any;
}
