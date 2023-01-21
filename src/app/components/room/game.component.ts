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
        this._currentRoundMoves = game?.moves[game.currentRound];
        this._completedRounds = this.getCompletedRounds(game);
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

    protected _currentRoundMoves: RoundMoves;
    protected _completedRounds: RoundMoves[] = [];
    get completedRounds(): RoundMoves[] {return this._completedRounds;}

    get Move() { return Move; }
    get username(): string { return this.sessionService.userSession?.username; }
    
    protected getCompletedRounds(game: Game) {
        if( game?.currentRound > 0 )
            return this.game.moves.slice(0, this.game.currentRound).reverse();
        if( game?.currentRound < 0 )
            return this.game.moves.reverse();

        return [];
    }

    protected selectedMove: Move = null;
    protected get sentMove(): Move {
        return this._currentRoundMoves ? this._currentRoundMoves[this.username] : null;
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

    winner(moves: RoundMoves) {
        let winnerMove: Move = this.winnerMove(moves[this.username], moves[this.opponent]);
        return winnerMove == null ? "DRAW!!" : (winnerMove == moves[this.username] ? "YOU WIN!!" : "OPPONENT WINS!!");
    }

    gameResult() {
        let userRounds = 0;
        let opponentRounds = 0;

        for(let move of this.game.moves) {
            let winnerMove: Move = this.winnerMove(move[this.username], move[this.opponent]);
            if(winnerMove == move[this.username]) userRounds++;
            if(winnerMove == move[this.opponent]) opponentRounds++;
        }

        let result = "You tied the game!!";
        if(userRounds > opponentRounds)
            result = "You won the game!!";
        else if(opponentRounds > userRounds)
            result = "You lost the game!!"

        return "You won " + userRounds + " rounds and lost " + opponentRounds + ". " + result;
    }

    protected winnerMove(move1: Move, move2: Move): Move {
        if( move1 == move2 ) return null;

        switch(move1) {
            case Move.ROCK:
                return move2 == Move.SCISSORS ? move1 : move2;
            case Move.SCISSORS:
                return move2 == Move.PAPER ? move1 : move2;
            case Move.PAPER:
                return move2 == Move.ROCK ? move1 : move2;
        }
    }
}