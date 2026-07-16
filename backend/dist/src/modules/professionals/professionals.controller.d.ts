import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from '../../dtos/professional.dto';
export declare class ProfessionalsController {
    private readonly professionalsService;
    constructor(professionalsService: ProfessionalsService);
    create(createProfessionalDto: CreateProfessionalDto): Promise<{
        user: {
            id: string;
            createdAt: Date;
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            passwordHash: string | null;
            avatarUrl: string | null;
            updatedAt: Date;
        };
    } & {
        id: string;
        code: string;
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
    }>;
    findAll(): Promise<({
        provider: {
            id: string;
            businessName: string;
            type: import(".prisma/client").$Enums.ProviderType;
            brandProfile: import("@prisma/client/runtime/library").JsonValue;
            address: import("@prisma/client/runtime/library").JsonValue;
            verificationStatus: string;
        };
        user: {
            id: string;
            createdAt: Date;
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            passwordHash: string | null;
            avatarUrl: string | null;
            updatedAt: Date;
        };
    } & {
        id: string;
        code: string;
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
    })[]>;
    findByProvider(providerId: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            passwordHash: string | null;
            avatarUrl: string | null;
            updatedAt: Date;
        };
    } & {
        id: string;
        code: string;
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
    })[]>;
    findOne(id: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            passwordHash: string | null;
            avatarUrl: string | null;
            updatedAt: Date;
        };
        services: {
            id: string;
            code: string;
            createdAt: Date;
            name: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            providerId: string;
            professionalId: string | null;
            durationMinutes: number;
            currency: string;
            imageUrl: string | null;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        }[];
        bookings: {
            id: string;
            timezone: string | null;
            createdAt: Date;
            providerId: string;
            consumerId: string;
            serviceId: string;
            professionalId: string | null;
            roomId: string | null;
            startTime: Date;
            endTime: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            notes: string | null;
            paymentIntentId: string | null;
            paymentStatus: string;
            giftCardRedeemed: import("@prisma/client/runtime/library").Decimal;
            pointsRedeemed: number;
            pointsEarned: number;
            platformCommission: import("@prisma/client/runtime/library").Decimal | null;
            providerPayout: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        treatmentPlans: {
            id: string;
            createdAt: Date;
            name: string | null;
            description: string | null;
            providerId: string;
            consumerId: string;
            professionalId: string | null;
            status: string;
            startDate: Date | null;
            endDate: Date | null;
            phases: import("@prisma/client/runtime/library").JsonValue | null;
            aiGenerated: boolean;
        }[];
    } & {
        id: string;
        code: string;
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
    }) | null>;
    update(id: string, updateProfessionalDto: UpdateProfessionalDto): Promise<{
        user: {
            id: string;
            createdAt: Date;
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            passwordHash: string | null;
            avatarUrl: string | null;
            updatedAt: Date;
        };
    } & {
        id: string;
        code: string;
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
    }>;
}
