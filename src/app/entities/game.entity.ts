export enum Move {
    ROCK = 1,
    PAPER,
    SCISSORS
}

export type RoundMoves = {[username: string]: Move};

const winnerMoveFunc = function (move1: Move, move2: Move): Move {
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

export interface GameData {
    _id: string;
    roomId: string;
    rounds: number;
    currentRound: number;
    moves: RoundMoves[];
}

export class Game implements GameData {
    _id: string;
    roomId: string;
    rounds: number;
    currentRound: number;
    moves: RoundMoves[];

    currentRoundMoves: RoundMoves;
    completedRounds: RoundMoves[];

    constructor(data: GameData) {
        this._id = data._id;
        this.roomId = data.roomId;
        this.currentRound = data.currentRound;
        this.rounds = data.rounds;
        this.moves = data.moves;

        this.currentRoundMoves = this.moves[this.currentRound];
        this.completedRounds = this.getCompletedRounds();
    }

    roundWinnerByIndex(roundIndex: number): string {
        if(this.isCompletedRound(roundIndex)) {
            let roundMoves = this.moves[roundIndex];
            return Game.roundMovesWinner(roundMoves); 
        }

        return null;
    }

    isCompletedRound(roundIndex: number) {
        return this.completedRounds.includes(this.moves[roundIndex]); 
    }

    isFinished() {
        return this.currentRound == -1; 
    }

    getResult() {
        let result: any = {};

        for(let roundMoves of this.moves) {
            let winner = Game.roundMovesWinner(roundMoves);
            if(winner) {
                result[winner] = result[winner] ? result[winner] + 1 : 1;
            }
        }

        return result;
    }

    static roundMovesWinner(roundMoves: RoundMoves): string {
        let moves = Object.values(roundMoves);
        let winnerMove = winnerMoveFunc(moves[0], moves[1]);

        if(winnerMove) {
            for (const username of Object.keys(roundMoves)) {
                if(roundMoves[username] == winnerMove)
                    return username;                
            }
        }

        return null;
    }

    protected getCompletedRounds(): RoundMoves[] {
        if( this.currentRound > 0 )
            return this.moves.slice(0, this.currentRound).reverse();
        if( this.currentRound < 0 )
            return this.moves.reverse();

        return [];
    }
}
