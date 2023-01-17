import { Game } from "../entities/Game.entity";
import { Repository } from "./repository";

export interface GamesRepository extends Repository<Game> {
    findOneById(id: string): Promise<Game>;
    save(game: Game): Promise<void>;
    delete(game: Game): Promise<void>;
}