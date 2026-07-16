import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from '../../dtos/enquiry.dto';
import { AuthedRequest } from '../../common/jwt-auth.guard';
export declare class EnquiriesController {
    private readonly service;
    constructor(service: EnquiriesService);
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
    listMine(req: AuthedRequest): Promise<({
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
    updateStatus(req: AuthedRequest, id: string, dto: UpdateEnquiryDto): Promise<{
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
