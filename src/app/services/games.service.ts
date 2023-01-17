import { Injectable } from "@angular/core";
import { filter, Observable } from "rxjs";
import { Game, Move } from "../entities/game.entity";
import { Message, WebSocketService } from "./websocket.service";

const GAMES_MESSAGE_TYPE = "game"

const CREATE_GAME_COMMAND = "createGame";
const GET_GAME_COMMAND = "getGame";
const PLAY_GAME_COMMAND = "playGame";

@Injectable({
	providedIn: 'root'
})
export class GamesService {

    constructor( protected wsService: WebSocketService ) {}

    observeGame(gameId: string): Observable<Message> {
        let observable: Observable<Message> = this.wsService.connectToResponseType(GAMES_MESSAGE_TYPE)
            .pipe(filter(message => message.content?.game?._id == gameId));
        
            this.wsService.send({
                type: GAMES_MESSAGE_TYPE,
                content: {
                    command: GET_GAME_COMMAND,
                    gameId
                }
            })       

        return observable;
    }

    async createGame(roomId: string, rounds: number) {
        return new Promise((resolve, reject) => {
            let subscription = this.wsService.connectToResponseType(GAMES_MESSAGE_TYPE)
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
                type: GAMES_MESSAGE_TYPE,
                content: {
                    command: CREATE_GAME_COMMAND,
                    roomId,
                    rounds
                }
            })
        })
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