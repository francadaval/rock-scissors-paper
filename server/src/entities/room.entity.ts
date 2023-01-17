export interface Room {
    _id: string;
    users: string[];
    name: string;

    currentGameId?: string;
}