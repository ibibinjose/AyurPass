import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from '../../dtos/room.dto';
export declare class RoomsController {
    private readonly service;
    constructor(service: RoomsService);
    create(createRoomDto: CreateRoomDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        providerId: string;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findByProvider(providerId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        providerId: string;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        providerId: string;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    } | null>;
    update(id: string, updateRoomDto: UpdateRoomDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        providerId: string;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        providerId: string;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
