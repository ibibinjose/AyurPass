import { Role } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    fullName: string;
    phone?: string;
    role: Role;
    passwordHash?: string;
}
export declare class UpdateUserDto {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
}
