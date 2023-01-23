import { Injectable } from "@angular/core";
import { filter, map, Observable } from "rxjs";
import { Game, GameData, Move } from "../entities/game.entity";
import { Message, WebSocketService } from "./websocket.service";

const GAMES_MESSAGE_TYPE = "game"

const GET_GAME_COMMAND = "getGame";
const PLAY_GAME_COMMAND = "playGame";
const GET_PREVIOUS_ROOMS_COMMAND = "getRoomPreviousGames";

@Injectable({
	providedIn: 'root'
})
export class GamesService {

    constructor( protected wsService: WebSocketService ) {}

    observeGame(gameId: string): Observable<Message> {
        let observable: Observable<Message> = this.wsService.connectToResponseType(GAMES_MESSAGE_TYPE)
            .pipe(
                filter(message => message.content?.game?._id == gameId),
                map(message => {
                    message.content.game = new Game(message.content.game);
                    return message;
                })
            );
        
        this.wsService.send({
            type: GAMES_MESSAGE_TYPE,
            content: {
                command: GET_GAME_COMMAND,
                gameId
            }
        })       

        return observable;
    }

    public observePreviousGames(roomId: string): Observable<Message> {
        let observable: Observable<Message> = this.wsService.connectToResponseType(GAMES_MESSAGE_TYPE)
            .pipe(
                filter(message => (message.content?.roomId == roomId && message.content?.command == GET_PREVIOUS_ROOMS_COMMAND)),
                map(message => {
                    message.content.previousGames = message.content.previousGames
                        .map((gameData: GameData) => new Game(gameData))
                    return message;
                })
            );
        
        this.wsService.send({
            type: GAMES_MESSAGE_TYPE,
            content: {
                command: GET_PREVIOUS_ROOMS_COMMAND,
                roomId
            }
        })       

        return observable;
    }

    async playGame(gameId: string, move: Move) {
        this.wsService.send({
            type: GAMES_MESSAGE_TYPE,
            content: {
                command: PLAY_GAME_COMMAND,
                gameId,
                move
            }
        })
    }
}
