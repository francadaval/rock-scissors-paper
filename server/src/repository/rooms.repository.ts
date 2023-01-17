import { Room } from "../entities/room.entity";
import { Repository } from "./repository";

export interface RoomsRepository extends Repository<Room>{

    findByUsername(username: string): Promise<Room[]>;
    findFreeRooms(): Promise<Room[]>;
}