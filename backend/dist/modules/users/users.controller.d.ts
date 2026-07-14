import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../../dtos/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findById(id: string): Promise<Omit<{
        consumer: {
            userId: string;
            prakritiPrimary: string | null;
            prakritiScores: import("@prisma/client/runtime/library").JsonValue | null;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        professional: ({
            provider: {
                id: string;
                createdAt: Date;
                userId: string | null;
                businessName: string;
                type: import(".prisma/client").$Enums.ProviderType;
                brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
                address: import("@prisma/client/runtime/library").JsonValue | null;
                timezone: string | null;
                stripeAccountId: string | null;
                subscriptionTier: string | null;
                verificationStatus: string;
            };
        } & {
            id: string;
            userId: string;
            providerId: string;
            title: string | null;
            specializations: string[];
            doshaExpertise: import("@prisma/client/runtime/library").JsonValue | null;
            bio: string | null;
            certifications: import("@prisma/client/runtime/library").JsonValue | null;
            yearsExperience: number | null;
            hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
            availabilityPreferences: import("@prisma/client/runtime/library").JsonValue | null;
            verificationDocuments: import("@prisma/client/runtime/library").JsonValue | null;
            rating: import("@prisma/client/runtime/library").Decimal;
            reviewCount: number;
        }) | null;
        provider: {
            id: string;
            createdAt: Date;
            userId: string | null;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue | null;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            timezone: string | null;
            stripeAccountId: string | null;
            subscriptionTier: string | null;
            verificationStatus: string;
        } | null;
    } & {
        id: string;
        email: string;
        phone: string | null;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.Role;
        fullName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash"> | null>;
    findByEmail(email: string): Promise<Omit<{
        id: string;
        email: string;
        phone: string | null;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.Role;
        fullName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash"> | null>;
    create(createUserDto: CreateUserDto): Promise<Omit<{
        id: string;
        email: string;
        phone: string | null;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.Role;
        fullName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash"> | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<{
        id: string;
        email: string;
        phone: string | null;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.Role;
        fullName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash"> | null>;
}
