import { EventEmitter, Injectable } from "@angular/core";
import { filter, Observable } from "rxjs";
import { Game } from "../entities/game.entity";
import { Room } from "../entities/room.entity";
import { SessionService } from "./session.service";
import { Message, WebSocketService } from "./websocket.service";

const ROOMS_MESSAGE_TYPE = "rooms"

const LIST_ROOMS_COMMAND = "listRooms";
const CREATE_ROOM_COMMAND = "createRoom";
const JOIN_ROOM_COMMAND = "joinRoom";
const LEAVE_ROOM_COMMAND = "leaveRoom";
const GET_ROOM_COMMAND = "getRoom";
const CREATE_GAME_COMMAND = "createGame"

@Injectable({
	providedIn: 'root'
})
export class RoomsService {

    protected _freeRooms: Room[] = [];
    protected _userRooms: Room[] = [];

    get freeRooms(): Room[] { return this._freeRooms.filter(room => !room.users.includes(this.sessionService.userSession?.username)); }
    get userRooms(): Room[] { return this._userRooms; }

    public joinedToRoom: EventEmitter<Room> = new EventEmitter<Room>();

	constructor( protected wsService: WebSocketService, protected sessionService: SessionService ) {
		console.log( "Constructor SessionService" )

		wsService.connectToResponseType(ROOMS_MESSAGE_TYPE).subscribe(msg => {
            if(!msg.error) {
                if(msg.content.user_rooms) {
                    this._userRooms = [...msg.content.user_rooms];
                }

                if(msg.content.free_rooms) {
                    this._freeRooms = [...msg.content.free_rooms];
                }

                if(msg.content.room) {
                    let room: Room = msg.content.room;
                    let index = this._userRooms.findIndex(r => r._id == room._id);

                    if(room.users.includes(sessionService.userSession.username)) {
                        if(index >= 0) {
                            this._userRooms[index] = msg.content.room;
                        } else {
                            this._userRooms.push(msg.content.room);
                        }
                    } else {
                        if(index >= 0) {
                            this._userRooms.splice(index, 1);
                        }
                    }
                }

                if(msg.content.command == JOIN_ROOM_COMMAND && msg.content.room) {
                    this.joinedToRoom.emit(msg.content.room);
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

    public joinRoom(id: string) {
        this.wsService.send({
            type: ROOMS_MESSAGE_TYPE,
            content: {
                command: JOIN_ROOM_COMMAND,
                id: id
            }
        })
    }

    public leaveRoom(id: string) {
        this.wsService.send({
            type: ROOMS_MESSAGE_TYPE,
            content: {
                command: LEAVE_ROOM_COMMAND,
                id: id
            }
        })
    }

    public createRoom(name: string) {
        this.wsService.send({
            type: ROOMS_MESSAGE_TYPE,
            content: {
                command: CREATE_ROOM_COMMAND,
                name: name
            }
        })
    }

    public observeRoom(roomId: string): Observable<Message> {
        let observable: Observable<Message> = this.wsService.connectToResponseType(ROOMS_MESSAGE_TYPE)
            .pipe(filter(message => message.content?.room?._id == roomId));
        
        this.wsService.send({
            type: ROOMS_MESSAGE_TYPE,
            content: {
                command: GET_ROOM_COMMAND,
                roomId
            }
        })       

        return observable;
    }

    async createGame(roomId: string, rounds: number) {
        return new Promise((resolve, reject) => {
            let subscription = this.wsService.connectToResponseType(ROOMS_MESSAGE_TYPE)
                .pipe(filter(message => message.content?.command == CREATE_GAME_COMMAND))
                .subscribe((message) => {
                    if(!message.error) {
                        resolve(<Game>message.content.game);
                    } else {
                        reject(message.error);
                    }

                    subscription.unsubscribe();
                });

            this.wsService.send({
                type: ROOMS_MESSAGE_TYPE,
                content: {
                    command: CREATE_GAME_COMMAND,
                    roomId,
                    rounds
                }
            })
        })
    }
}