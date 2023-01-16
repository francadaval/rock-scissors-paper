import { Room } from "../../entities/room.entity"
import { RoomsRepository } from "../rooms.repository";

const ROOMS: {
    [id:string]: Room
} = {
    "r1": {
        _id: "r1",
        name: "Room #1",
        users: ["user1"]
    }
};

export class DummyRoomsRepositoryImpl implements RoomsRepository {
    public async findOneById(id: string): Promise<Room>{
        return ROOMS[id];
    }

    public async findByUsername(username: string): Promise<Room[]>{
        return Object.values(ROOMS).filter(room => room.users.includes(username));
    }

    public async findFreeRooms(): Promise<Room[]>{
        return Object.values(ROOMS).filter(room => room.users.length < 2);
    }

    public async save(room: Room): Promise<void>{
        ROOMS[room._id] = room;
    }

    public async delete(room: Room): Promise<void>{
        delete ROOMS[room._id];
    }

}
