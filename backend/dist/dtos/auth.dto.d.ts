import { Role, ProviderType } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: Role;
    businessName?: string;
    providerType?: ProviderType;
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
