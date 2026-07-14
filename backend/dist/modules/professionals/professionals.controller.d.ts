import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from '../../dtos/professional.dto';
export declare class ProfessionalsController {
    private readonly professionalsService;
    constructor(professionalsService: ProfessionalsService);
    create(createProfessionalDto: CreateProfessionalDto): Promise<{
        user: {
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            passwordHash: string | null;
            avatarUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        providerId: string;
        userId: string;
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
    findByProvider(providerId: string): Promise<({
        user: {
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            passwordHash: string | null;
            avatarUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        providerId: string;
        userId: string;
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
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            passwordHash: string | null;
            avatarUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        bookings: {
            id: string;
            createdAt: Date;
            consumerId: string;
            serviceId: string;
            professionalId: string | null;
            providerId: string;
            startTime: Date;
            endTime: Date;
            timezone: string | null;
            status: import(".prisma/client").$Enums.BookingStatus;
            totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            notes: string | null;
            platformCommission: import("@prisma/client/runtime/library").Decimal | null;
            providerPayout: import("@prisma/client/runtime/library").Decimal | null;
            paymentIntentId: string | null;
            paymentStatus: string;
            roomId: string | null;
        }[];
        services: {
            id: string;
            createdAt: Date;
            name: string;
            professionalId: string | null;
            providerId: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            description: string | null;
            durationMinutes: number;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
        }[];
        treatmentPlans: {
            id: string;
            createdAt: Date;
            name: string | null;
            consumerId: string;
            professionalId: string | null;
            providerId: string;
            status: string;
            description: string | null;
            startDate: Date | null;
            endDate: Date | null;
            phases: import("@prisma/client/runtime/library").JsonValue | null;
            aiGenerated: boolean;
        }[];
    } & {
        id: string;
        providerId: string;
        userId: string;
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
            email: string;
            fullName: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            passwordHash: string | null;
            avatarUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        providerId: string;
        userId: string;
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
