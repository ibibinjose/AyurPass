import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from '../../dtos/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
        email: string;
        fullName: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        passwordHash: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: string): Promise<({
        provider: {
            businessName: string;
            timezone: string | null;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            verificationStatus: string;
            id: string;
            userId: string | null;
            stripeAccountId: string | null;
            subscriptionTier: string | null;
            createdAt: Date;
        } | null;
        consumer: {
            prakritiScores: import("@prisma/client/runtime/library").JsonValue | null;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
            prakritiPrimary: string | null;
        } | null;
        professional: ({
            provider: {
                businessName: string;
                timezone: string | null;
                type: import(".prisma/client").$Enums.ProviderType;
                brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
                address: import("@prisma/client/runtime/library").JsonValue | null;
                verificationStatus: string;
                id: string;
                userId: string | null;
                stripeAccountId: string | null;
                subscriptionTier: string | null;
                createdAt: Date;
            };
        } & {
            title: string | null;
            specializations: string[];
            bio: string | null;
            providerId: string;
            id: string;
            userId: string;
            doshaExpertise: import("@prisma/client/runtime/library").JsonValue | null;
            certifications: import("@prisma/client/runtime/library").JsonValue | null;
            yearsExperience: number | null;
            hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            availabilityPreferences: import("@prisma/client/runtime/library").JsonValue | null;
            verificationDocuments: import("@prisma/client/runtime/library").JsonValue | null;
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        }) | null;
    } & {
        email: string;
        fullName: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        passwordHash: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    createUser(data: any): Promise<{
        email: string;
        fullName: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        passwordHash: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: string, data: UpdateUserDto): Promise<{
        email: string;
        fullName: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        passwordHash: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
