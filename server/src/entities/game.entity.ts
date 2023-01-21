export enum Move {
    ROCK = 1,
    PAPER,
    SCISSORS
}

export interface Game {
    _id: string;
    roomId: string;
    rounds: number;
    currentRound: number;
    moves: {[username: string]: Move}[];
}