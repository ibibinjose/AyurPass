import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from '../../dtos/enquiry.dto';
export declare class EnquiriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateEnquiryDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        message: string;
        status: string;
        createdAt: Date;
        providerId: string;
    }>;
    private providerForUser;
    listMine(userSub: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        message: string;
        status: string;
        createdAt: Date;
        providerId: string;
    }[]>;
    updateStatus(userSub: string, id: string, dto: UpdateEnquiryDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        message: string;
        status: string;
        createdAt: Date;
        providerId: string;
    }>;
}
