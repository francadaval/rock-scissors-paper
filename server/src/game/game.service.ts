import { RoomsRepository } from '../repository/rooms.repository';
import { WebSocketsService } from '../websockets/websockets.service';
import { Broadcaster } from '../websockets/broadcaster';
import { getLogger, Logger } from 'log4js';
import { Game, Move } from '../entities/game.entity';

import { GamesRepository } from '../repository/games.repository';
import { Room } from '../entities/room.entity';
import { AbstractService } from './abstract.service';

const GAMES_TYPE: string = "game";

export class GamesService extends AbstractService {

    constructor(
        roomsRepository: RoomsRepository,
        gamesRepository: GamesRepository,
        websocketsService: WebSocketsService,
        broadcaster: Broadcaster ) {

        super(websocketsService, broadcaster, GAMES_TYPE)

        this.roomsRepository = roomsRepository;
        this.gamesRepository = gamesRepository;

        this.registerCommandFunction("playGame", (messageContent, username) => this.playGame(messageContent, username));
        this.registerCommandFunction("getGame", (messageContent, username) => this.getGame(messageContent, username));
        this.registerCommandFunction("getRoomPreviousGames", (messageContent, username) => this.getRoomPreviousGames(messageContent, username))
    }

    protected roomsRepository: RoomsRepository;
    protected gamesRepository: GamesRepository;

    protected logger: Logger = getLogger("RoomsService");

    protected async getGame(messageContent: any, username: string) {
        const gameId = messageContent.gameId;
        const command = messageContent.command;

        let game = await this.gamesRepository.findOneById(gameId);
        if(!game) {
            this.sendErrorMessageToUser(username, command);
            return;
        }

        let room = game?.roomId ? await this.roomsRepository.findOneById(game.roomId) : null;
        if(!room || !room.users.includes(username)) {
            this.sendErrorMessageToUser(username, command);
            return;
        }

        this.sendMessageToUser(username, {game}, command);
    }

    protected async getRoomPreviousGames(messageContent: any, username: string) {
        const roomId: string = messageContent.roomId;
        const command = messageContent.command;
        
        let room = roomId ? await this.roomsRepository.findOneById(roomId) : null;
        if(!room || !room.users.includes(username)) {
            this.sendErrorMessageToUser(username, command);
            return;
        }

        let previousGames = (await this.gamesRepository.findByRoomId(roomId)).filter(game => game._id != room.currentGameId);

        this.sendMessageToUser(username, {roomId, previousGames}, command);
    }

    protected async playGame(messageContent: any, username: string) {
        const command = messageContent.command;
        const gameId = messageContent.gameId;
        const move = <Move>messageContent.move;

        let game = await this.gamesRepository.findOneById(gameId);
        if(!game || game.currentRound < 0) {
            this.sendErrorMessageToUser(username, command, game ? "Game finished!" : "Game not found");
            return;
        }
        
        let room = await game?.roomId ? await this.roomsRepository.findOneById(game.roomId) : null;
        if(!room || !room.users.includes(username) || room.currentGameId != gameId) {
            this.sendErrorMessageToUser(username, command);
            return;
        }

        let currentRoundMoves = game.moves[game.currentRound] || {};
        if(currentRoundMoves[username]) {
            this.sendErrorMessageToUser(username, command);
            return;           
        }

        currentRoundMoves[username] = move;
        game.moves[game.currentRound] = currentRoundMoves;

        
        if(currentRoundMoves[room.users.find(otherUser => otherUser != username)]) {
            game.currentRound = ((game.currentRound + 1) < game.rounds) ? (game.currentRound + 1) : -1;
            this.gamesRepository.save(game);

            this.sendMessageToUsers(room.users, {game}, command);
        } else {
            this.gamesRepository.save(game);
            
            this.sendMessageToUser(username, {game}, command);
        }
    }

    protected async sendUsersGameMsg(room: Room, game: Game, command: string) {
        room.users.forEach(username => this.sendMessageToUser(username, {game}, command));
    }
};
