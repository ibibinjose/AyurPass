import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from '../../dtos/room.dto';
export declare class RoomsService {
    private prisma;
    constructor(prisma: PrismaService);
    createRoom(data: CreateRoomDto): Promise<{
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
    updateRoom(id: string, data: UpdateRoomDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        providerId: string;
    }>;
    removeRoom(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        providerId: string;
    }>;
}
