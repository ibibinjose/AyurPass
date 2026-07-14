import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from '../../dtos/room.dto';
export declare class RoomsService {
    private prisma;
    constructor(prisma: PrismaService);
    createRoom(data: CreateRoomDto): Promise<{
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
    updateRoom(id: string, data: UpdateRoomDto): Promise<{
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    removeRoom(id: string): Promise<{
        providerId: string;
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
