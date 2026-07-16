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
    }>;
    listMine(req: AuthedRequest): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        message: string;
        status: string;
        createdAt: Date;
        providerId: string;
    }[]>;
    updateStatus(req: AuthedRequest, id: string, dto: UpdateEnquiryDto): Promise<{
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
