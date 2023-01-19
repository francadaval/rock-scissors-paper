import { Game } from "../../entities/game.entity";
import { GamesRepository } from "../games.repository";

const GAMES: {
    [id:string]: Game
} = {};

export class DummyGamesRepository implements GamesRepository {
    public async findOneById(id: string): Promise<Game> {
        return GAMES[id];
    }

    public async save(game: Game): Promise<void> {
        GAMES[game._id] = game;
    }

    public async delete(game: Game): Promise<void> {
        delete GAMES[game._id];
    }
}