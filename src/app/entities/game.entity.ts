export enum Move {
    ROCK = 1,
    PAPER,
    SCISSORS
}

export type RoundMoves = {[username: string]: Move};

export interface Game {
    _id: string;
    roomId: string;
    rounds: number;
    currentRound: number;
    moves: RoundMoves[];
}
