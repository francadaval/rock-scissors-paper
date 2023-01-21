import { getLogger, Logger } from "log4js";
import { Room } from "../entities/room.entity";
import { RoomsRepository } from "../repository/rooms.repository";
import { Broadcaster } from "../websockets/broadcaster";
import { WebSocketsService } from "../websockets/websockets.service";

import crypto = require('crypto')
import { Game } from "../entities/game.entity";
import { GamesRepository } from "../repository/games.repository";
import { AbstractService } from "./abstract.service";

const ROOMS_TYPE: string = "rooms";

export class RoomsService extends AbstractService {

    constructor(
        roomsRepository: RoomsRepository,
        gamesRepository: GamesRepository,
        websocketsService: WebSocketsService,
        broadcaster: Broadcaster ) {

        super(websocketsService, broadcaster, ROOMS_TYPE);

        this.roomsRepository = roomsRepository;
        this.gamesRepository = gamesRepository;

        this.registerCommandFunction("createGame", (messageContent, username) => this.createGame(messageContent, username));
        this.registerCommandFunction("listRooms", (messageContent, username) => this.listRooms(messageContent, username));
        this.registerCommandFunction("createRoom", (messageContent, username) => this.createRoom(messageContent, username));
        this.registerCommandFunction("leaveRoom", (messageContent, username) => this.leaveRoom(messageContent, username));
        this.registerCommandFunction("joinRoom", (messageContent, username) => this.joinRoom(messageContent, username));
        this.registerCommandFunction("getRoom", (messageContent, username) => this.getRoom(messageContent, username));
    }

    protected roomsRepository: RoomsRepository;
    protected gamesRepository: GamesRepository;
    protected logger: Logger = getLogger("RoomsService");

    protected async createGame(messageContent: any, username: string) {
        const command = messageContent.command;
        const roomId = messageContent.roomId;
        const rounds = messageContent.rounds || 5;

        let room = await this.roomsRepository.findOneById(roomId);
        
        if(!room || room.currentGameId || room.users.length != 2) {
            let error = !room ? "Room " + roomId + " not found." : (
                room.currentGameId ? "Room already have a current game." : (
                    room.users.length != 2 ? "There are not two players on room." : ""
                ));
            this.sendErrorMessageToUser(username, command, error)
            return;
        }

        let game: Game = {
            _id: crypto.randomUUID(),
            roomId: (await room)._id,
            rounds: rounds,
            currentRound: 0,
            moves: []
        }
        
        this.gamesRepository.save(game);

        room.currentGameId = game._id;
        this.roomsRepository.save(room);

        this.sendMessageToUsers(room.users, {room, game}, command);
    }

    protected async listRooms(messageContent: any, username: string) {
        let free_rooms = await this.roomsRepository.findFreeRooms();
        let user_rooms = await this.roomsRepository.findByUsername(username);

        this.sendMessageToUser(username, {free_rooms, user_rooms}, messageContent.command);
    }

    protected async createRoom(messageContent: any, username: string) {
        let room: Room = {
            _id: crypto.randomUUID(),
            name: messageContent.name,
            users: [username],
        }

        this.roomsRepository.save(room);

        this.sendMessageToUsers(room.users, {room}, messageContent.command);
        this.broadcastFreeRoomsMsg();
    }
    
    protected async joinRoom(messageContent: any, username: string) {
        let room: Room = await this.roomsRepository.findOneById(messageContent.id);

        if(room && room.users.length == 1) {
            room.users.push(username);
            this.sendMessageToUsers(room.users, {room}, messageContent.command);
            this.broadcastFreeRoomsMsg();
        } else {
            this.sendErrorMessageToUser(messageContent.command, username);
        }
    }

    protected async leaveRoom(messageContent: any, username: string) {
        let room: Room = await this.roomsRepository.findOneById(messageContent.id);

        if(room && room.users.includes(username)) {
            room.users.splice(room.users.indexOf(username), 1);
        }

        if(room.users.length == 0) {
            this.roomsRepository.delete(room);
        } else {
            this.roomsRepository.save(room);
        }

        this.sendMessageToUsers(room.users, {room}, messageContent.command);
        this.broadcastFreeRoomsMsg();
    }

    protected async getRoom(messageContent: any, username: string) {
        const roomId = messageContent.roomId;
        const command = messageContent.command;
        
        let room = await this.roomsRepository.findOneById(roomId);
        if(!room || !room.users.includes(username)) {
            this.sendErrorMessageToUser(username, command);
            return;
        }

        this.sendMessageToUsers(room.users, {room}, command);
    }

    protected async broadcastFreeRoomsMsg() {
        let free_rooms = await this.roomsRepository.findFreeRooms();
        this.broadcastMessage(free_rooms);
    }
}
