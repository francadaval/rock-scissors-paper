import { Room } from "../entities/room.entity";

export interface RoomsRepository {

    findOneById: (id: string) => Promise<Room>;
    findByUsername: (username: string) => Promise<Room[]>;
    findFreeRooms: () => Promise<Room[]>;
    save: (room: Room) => Promise<void>;
    delete: (room: Room) => Promise<void>;
}