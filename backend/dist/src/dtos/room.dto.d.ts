export declare class CreateRoomDto {
    providerId: string;
    name: string;
    description?: string;
    capacity?: number;
    hourlyCost?: number;
}
export declare class UpdateRoomDto {
    name?: string;
    description?: string;
    capacity?: number;
    hourlyCost?: number;
}
