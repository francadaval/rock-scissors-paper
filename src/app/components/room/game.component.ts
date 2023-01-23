import { Component, Input } from "@angular/core";
import { map, Observable } from "rxjs";
import { Game, Move, RoundMoves } from "src/app/entities/game.entity";
import { Room } from "src/app/entities/room.entity";
import { GamesService } from "src/app/services/games.service";
import { SessionService } from "src/app/services/session.service";

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html'
})
export class GameComponent {

    constructor( protected gamesService: GamesService, protected sessionService: SessionService ) {}
    
    protected $game: Observable<Game>;
    protected _game: Game;
    @Input("game")
    set game(game: Game) {
        this.selectedMove = null;
        this._game = game;
    }
    get game(): Game { return this._game; }

    protected _room: Room;
    @Input("room")
    set room(room: Room) {
        this._room = room;
        this._opponent = room?.users.filter(name => name != this.username)[0];
    }
    get room(): Room { return this._room; }

    protected _opponent: string;
    get opponent(): string {return this._opponent;}

    get Move() { return Move; }
    get username(): string { return this.sessionService.userSession?.username; }
    
    protected selectedMove: Move = null;
    protected get sentMove(): Move {
        return this.game?.currentRoundMoves ? this.game.currentRoundMoves[this.username] : null;
    }

    select( move: Move ) {
        if( this.game.currentRound >= 0 && !this.sentMove ) {
            this.selectedMove = move;
        }
    }

    isSelected( move: Move ): boolean {
        return this.selectedMove == move;
    }

    isSent( move: Move ): boolean {
        return this.sentMove == move;
    }

    disableSendMove(): boolean {
        return !this.selectedMove || this.sentMove != null;
    }

    sendMove() {
        this.gamesService.playGame(this._game._id, this.selectedMove);
    }

    userMoveClass(moves: RoundMoves): string {
        return Move[moves[this.username]].toLowerCase();
    }

    opponentMoveClass(moves: RoundMoves): string {
        return Move[moves[this.opponent]].toLowerCase();
    }

    winner(roundMoves: RoundMoves) {
        return Game.roundMovesWinner(roundMoves);
    }

    gameResult() {
        let gameResult = this.game.getResult();
        let userRounds = gameResult[this.username];
        let opponentRounds = gameResult[this.opponent];

        let result = "You tied the game!!";
        if(userRounds > opponentRounds)
            result = "You won the game!!";
        else if(opponentRounds > userRounds)
            result = "You lost the game!!"

        return "You won " + userRounds + " rounds and lost " + opponentRounds + ". " + result;
    }
}