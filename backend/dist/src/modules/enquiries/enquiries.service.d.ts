import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from '../../dtos/enquiry.dto';
export declare class EnquiriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateEnquiryDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        providerId: string;
        email: string;
        phone: string | null;
        status: string;
        message: string;
        retreatId: string | null;
    }>;
    private providerForUser;
    listMine(userSub: string): Promise<({
        retreat: {
            title: string;
            slug: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        name: string;
        providerId: string;
        email: string;
        phone: string | null;
        status: string;
        message: string;
        retreatId: string | null;
    })[]>;
    updateStatus(userSub: string, id: string, dto: UpdateEnquiryDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        providerId: string;
        email: string;
        phone: string | null;
        status: string;
        message: string;
        retreatId: string | null;
    }>;
}
