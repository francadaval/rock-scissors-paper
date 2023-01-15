import { Injectable, OnDestroy } from "@angular/core";
import { Room } from "../entities/room.entity";
import { WebSocketService } from "./websocket.service";

const ROOMS_MESSAGE_TYPE = "rooms"

const LIST_ROOMS_COMMAND = "listRooms";
const CREATE_ROOM_COMMAND = "createRoom";
const JOIN_ROOM_COMMAND = "joinRoom";
const LEAVE_ROOM_COMMAND = "leaveRoom";

@Injectable({
	providedIn: 'root'
})
export class RoomsService {

    protected freeRooms: Room[];
    protected userRooms: Room[];

	constructor( protected wsService: WebSocketService ) {
		console.log( "Constructor SessionService" )

		wsService.connectToResponseType(ROOMS_MESSAGE_TYPE).subscribe(msg => {
            if(msg.content.user_rooms) {
                this.userRooms = [...msg.content.user_rooms];
            }

            if(msg.content.free_rooms) {
                this.freeRooms = [...msg.content.free_rooms];
            }

            if(msg.content.room) {
                let index = this.userRooms.findIndex(room => room._id == msg.content.room._id);
                this.userRooms[index] = msg.content.room;
            }
        });

        wsService.send({
            type: ROOMS_MESSAGE_TYPE,
            content: {
                command: LIST_ROOMS_COMMAND
            }
        })
	}
}