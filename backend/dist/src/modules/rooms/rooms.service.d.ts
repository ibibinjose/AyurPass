import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from '../../dtos/room.dto';
export declare class RoomsService {
    private prisma;
    constructor(prisma: PrismaService);
    createRoom(data: CreateRoomDto): Promise<{
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
    updateRoom(id: string, data: UpdateRoomDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        providerId: string;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    removeRoom(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        providerId: string;
        capacity: number;
        hourlyCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
