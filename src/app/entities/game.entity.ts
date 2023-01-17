export enum Move {
    ROCK,
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
