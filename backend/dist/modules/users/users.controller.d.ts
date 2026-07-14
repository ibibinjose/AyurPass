import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../../dtos/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findById(id: string): Promise<Omit<{
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
    }, "passwordHash"> | null>;
    findByEmail(email: string): Promise<Omit<{
        email: string;
        fullName: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        passwordHash: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash"> | null>;
    create(createUserDto: CreateUserDto): Promise<Omit<{
        email: string;
        fullName: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        passwordHash: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash"> | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<{
        email: string;
        fullName: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        passwordHash: string | null;
        avatarUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, "passwordHash"> | null>;
}
