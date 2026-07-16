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
        retreatId: string | null;
    }>;
    private providerForUser;
    listMine(userSub: string): Promise<({
        retreat: {
            slug: string;
            title: string;
        } | null;
    } & {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        message: string;
        status: string;
        createdAt: Date;
        providerId: string;
        retreatId: string | null;
    })[]>;
    updateStatus(userSub: string, id: string, dto: UpdateEnquiryDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        message: string;
        status: string;
        createdAt: Date;
        providerId: string;
        retreatId: string | null;
    }>;
}
