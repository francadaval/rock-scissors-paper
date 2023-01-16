import { getLogger, Logger } from "log4js";
import { Room } from "../entities/room.entity";
import { RoomsRepository } from "../repository/rooms.repository";
import { Broadcaster } from "../websockets/broadcaster";
import { ConnectionContext } from "../websockets/connection-context";
import { MessageHandler } from "../websockets/message-handler";
import { WebSocketsService } from "../websockets/websockets.service";

const ROOMS_TYPE: string = "rooms";

export class RoomsService implements MessageHandler {

    constructor(
        roomsRepository: RoomsRepository,
        websocketsService: WebSocketsService,
        broadcaster: Broadcaster ){

        this.roomsRepository = roomsRepository;
        this.websocketsService = websocketsService;
        this.broadcaster = broadcaster;

        websocketsService.addHandler(this);
    }

    acceptType(type: string): boolean {
        return type === ROOMS_TYPE;
    }

    protected roomsRepository: RoomsRepository;
    protected websocketsService: WebSocketsService;
    protected broadcaster: Broadcaster;

    protected logger: Logger = getLogger("RoomsService");

    async handleMessage(message: Message, connectionContext: ConnectionContext) {
        if (message.type == ROOMS_TYPE) {
            let command = message.content.command;
            let username = connectionContext.session?.username;

            this.logger.trace("Command " + command + " from " + username);

            return (username && this[command]) ? this[command](message.content, connectionContext.session.username) : null;
        }
    }

    async listRooms(messageContent: any, username: string) {
        this.sendRoomsList(username);
    }

    async createRoom(messageContent: any, username: string) {
        let room: Room = {
            _id: crypto.randomUUID(),
            name: messageContent.name,
            users: [username],
        }

        this.roomsRepository.save(room);

        this.sendUserRoomMsg(room, messageContent.command);
        this.sendFreeRoomsMsg();
    }
    
    async joinRoom(messageContent: any, username: string) {
        let room: Room = await this.roomsRepository.findOneById(messageContent.id);

        if(room && room.users.length == 1) {
            room.users.push(username);
            this.sendUserRoomMsg(room, messageContent.command);
            this.sendFreeRoomsMsg();
        } else {
            this.sendError(messageContent.command, username);
        }
    }

    async leaveRoom(messageContent: any, username: string) {
        let room: Room = await this.roomsRepository.findOneById(messageContent.id);

        if(room && room.users.includes(username)) {
            room.users.splice(room.users.indexOf(username), 1);
        }

        if(room.users.length == 0) {
            this.roomsRepository.delete(room);
        } else {
            this.roomsRepository.save(room);
        }

        this.sendUserRoomMsg(room, messageContent.command);
        this.sendRoomMsg(username, room, messageContent.command);
        this.sendFreeRoomsMsg();
    }

    protected async sendRoomsList(username: string) {
        let free_rooms = await this.roomsRepository.findFreeRooms();
        let user_rooms = await this.roomsRepository.findByUsername(username);

        this.broadcaster.sendUserMessage(username, {
            type: ROOMS_TYPE,
            content: {
                free_rooms,
                user_rooms
            }
        });
    }

    protected async sendUserRoomMsg(room: Room, command: string) {
        room.users.forEach(username => {
            this.sendRoomMsg(username, room, command);
        })
    }

    protected async sendRoomMsg(username: string, room: Room, command: string) {
        this.broadcaster.sendUserMessage(username, {
            type: ROOMS_TYPE,
            content: {
                command,
                room
            }
        })
    }

    protected async sendFreeRoomsMsg() {
        let free_rooms = await this.roomsRepository.findFreeRooms();
        this.broadcaster.broadcastMessage({
            type: ROOMS_TYPE,
            content: {
                free_rooms
            }
        })
    }

    protected async sendError(command: string, username: string) {
        this.broadcaster.sendUserErrorMessage(username, {
            type: ROOMS_TYPE,
            error: "Error",
            error_code: 1,
            content: {
                command
            }
        })
    }
}
