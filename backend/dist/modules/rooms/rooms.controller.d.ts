import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from '../../dtos/room.dto';
export declare class RoomsController {
    private readonly service;
    constructor(service: RoomsService);
    create(createRoomDto: CreateRoomDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        providerId: string;
    }>;
    findByProvider(providerId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        providerId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        providerId: string;
    } | null>;
    update(id: string, updateRoomDto: UpdateRoomDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        providerId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        providerId: string;
    }>;
}
