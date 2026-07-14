import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from '../../dtos/room.dto';
export declare class RoomsController {
    private readonly service;
    constructor(service: RoomsService);
    create(createRoomDto: CreateRoomDto): Promise<{
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findByProvider(providerId: string): Promise<{
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    findOne(id: string): Promise<{
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    } | null>;
    update(id: string, updateRoomDto: UpdateRoomDto): Promise<{
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    remove(id: string): Promise<{
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
