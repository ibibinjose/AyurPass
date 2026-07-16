import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from '../../dtos/enquiry.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
export declare class EnquiriesController {
    private readonly service;
    constructor(service: EnquiriesService);
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
    listMine(req: AuthedRequest): Promise<({
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
    updateStatus(req: AuthedRequest, id: string, dto: UpdateEnquiryDto): Promise<{
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
