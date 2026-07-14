import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from '../../dtos/professional.dto';
export declare class ProfessionalsService {
    private prisma;
    constructor(prisma: PrismaService);
    createProfessional(data: CreateProfessionalDto): Promise<{
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
        services: {
            professionalId: string | null;
            providerId: string;
            category: import(".prisma/client").$Enums.ServiceCategory;
            name: string;
            description: string | null;
            durationMinutes: number;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            doshaCompatibility: import("@prisma/client/runtime/library").JsonValue | null;
            isVirtual: boolean;
            maxParticipants: number;
            id: string;
            createdAt: Date;
        }[];
        bookings: {
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
            roomId: string | null;
            platformCommission: import("@prisma/client/runtime/library").Decimal | null;
            providerPayout: import("@prisma/client/runtime/library").Decimal | null;
            paymentStatus: string;
            id: string;
            createdAt: Date;
            paymentIntentId: string | null;
        }[];
        treatmentPlans: {
            consumerId: string;
            professionalId: string | null;
            providerId: string;
            status: string;
            name: string | null;
            description: string | null;
            id: string;
            createdAt: Date;
            startDate: Date | null;
            endDate: Date | null;
            phases: import("@prisma/client/runtime/library").JsonValue | null;
            aiGenerated: boolean;
        }[];
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
    }) | null>;
    updateProfessional(id: string, data: UpdateProfessionalDto): Promise<{
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
    }>;
}
