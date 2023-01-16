import { Injectable, OnDestroy } from "@angular/core";
import { Room } from "../entities/room.entity";
import { SessionService } from "./session.service";
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

    protected _freeRooms: Room[] = [];
    protected _userRooms: Room[] = [];

    get freeRooms(): Room[] { return this._freeRooms.filter(room => !room.users.includes(this.sessionService.userSession?.username)); }
    get userRooms(): Room[] { return this._userRooms; }

	constructor( protected wsService: WebSocketService, protected sessionService: SessionService ) {
		console.log( "Constructor SessionService" )

		wsService.connectToResponseType(ROOMS_MESSAGE_TYPE).subscribe(msg => {
            if(msg.content.user_rooms) {
                this._userRooms = [...msg.content.user_rooms];
            }

            if(msg.content.free_rooms) {
                this._freeRooms = [...msg.content.free_rooms];
            }

            if(msg.content.room) {
                let index = this._userRooms.findIndex(room => room._id == msg.content.room._id);

                if(index >= 0) {
                    this._userRooms[index] = msg.content.room;
                } else {
                    this._userRooms.push(msg.content.room);
                }
            }
        });

        console.log("Ask for rooms lists.")
        wsService.send({
            type: ROOMS_MESSAGE_TYPE,
            content: {
                command: LIST_ROOMS_COMMAND
            }
        })
	}
}