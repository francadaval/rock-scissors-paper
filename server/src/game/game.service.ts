import { MessageHandler } from '../websockets/message-handler';
import { RoomsRepository } from '../repository/rooms.repository';
import { WebSocketsService } from '../websockets/websockets.service';
import { Broadcaster } from '../websockets/broadcaster';
import { getLogger, Logger } from 'log4js';
import { ConnectionContext } from '../websockets/connection-context';
import { Game, Move } from '../entities/game.entity';

import crypto = require('crypto')
import { GamesRepository } from '../repository/games.repository';
import { Room } from '../entities/room.entity';

const GAMES_TYPE: string = "game";

export class GamesService implements MessageHandler {

    constructor(
        roomsRepository: RoomsRepository,
        gamesRepository: GamesRepository,
        websocketsService: WebSocketsService,
        broadcaster: Broadcaster ){

            this.roomsRepository = roomsRepository;
            this.gamesRepository = gamesRepository;
            this.websocketsService = websocketsService;
            this.broadcaster = broadcaster;
    
            websocketsService.addHandler(this);
    }
    acceptType(type: string): boolean {
        throw new Error('Method not implemented.');
    }

    protected roomsRepository: RoomsRepository;
    protected gamesRepository: GamesRepository;
    protected websocketsService: WebSocketsService;
    protected broadcaster: Broadcaster;

    protected logger: Logger = getLogger("RoomsService");

    async handleMessage(message: Message, connectionContext: ConnectionContext) {
        if (message.type == GAMES_TYPE) {
            let command = message.content.command;
            let username = connectionContext.session?.username;

            this.logger.trace("Command " + command + " from " + username);

            return (username && this[command]) ? this[command](message.content, connectionContext.session.username) : null;
        }
    }

    protected async createGame(messageContent: any, username: string) {
        const command = messageContent.command;
        const roomId = messageContent.roomId;
        const rounds = messageContent.rounds || 5;

        let room = await this.roomsRepository.findOneById(roomId);
        
        if(room.currentGameId || room.users.length != 2) {
            this.sendErrorMsg(username, command)
            return;
        }

        let game: Game = {
            _id: crypto.randomUUID(),
            roomId: (await room)._id,
            rounds: rounds,
            currentRound: 0,
            moves: []
        }

        room.currentGameId = game._id;

        this.gamesRepository.save(game);
        this.roomsRepository.save(room);

        this.sendUsersGameMsg(room, game, command);
    }

    protected async getGame(messageContent: any, username: string) {
        const gameId = messageContent.gameId;
        const command = messageContent.command;

        let game = await this.gamesRepository.findOneById(gameId);
        if(!game) {
            this.sendErrorMsg(username, command);
            return;
        }

        let room = await game?.roomId ? await this.roomsRepository.findOneById(game.roomId) : null;
        if(!room || !room.users.includes(username)) {
            this.sendErrorMsg(username, command);
            return;
        }

        this.sendGameMsg(username, game, command);
    }

    protected async playGame(messageContent: any, username: string) {
        const command = messageContent.command;
        const gameId = messageContent.gameId;
        const move = <Move>messageContent.move;

        let game = await this.gamesRepository.findOneById(gameId);
        if(!game || game.currentRound >= 0) {
            this.sendErrorMsg(username, command);
            return;
        }
        
        let room = await game?.roomId ? await this.roomsRepository.findOneById(game.roomId) : null;
        if(!room || !room.users.includes(username) || room.currentGameId != gameId) {
            this.sendErrorMsg(username, command);
            return;
        }

        let currentRoundMoves = game.moves[game.currentRound] || {};
        if(currentRoundMoves[username]) {
            this.sendErrorMsg(username, command);
            return;           
        }

        currentRoundMoves[username] = move;
        game.moves[game.currentRound] = currentRoundMoves;

        
        if(currentRoundMoves[room.users.find(otherUser => otherUser != username)]) {
            game.currentRound = ((game.currentRound + 1) < game.rounds) ? (game.currentRound + 1) : -1;
            this.gamesRepository.save(game);

            this.sendUsersGameMsg(room, game, command);
        } else {
            this.gamesRepository.save(game);
            
            this.sendGameMsg(username, game, command);
        }
    }

    protected async sendUsersGameMsg(room: Room, game: Game, command: string) {
        room.users.forEach(username => this.sendGameMsg(username, game, command));
    }

    protected async sendGameMsg(username: string, game: Game, command: string) {
        this.broadcaster.sendUserMessage(username, {
            type: GAMES_TYPE,
            content: {
                command,
                game
            }
        })
    }
    
    protected async sendErrorMsg(username, command) {
        this.broadcaster.sendUserErrorMessage(username, {
            type: GAMES_TYPE,
            content: {
                command: command
            },
            error: "Error",
            error_code: 1
        });
    }
};