import { Component, Input } from "@angular/core";
import { Game } from "src/app/entities/game.entity";

@Component({
	selector: 'app-previous-games',
	templateUrl: './previous-games.component.html'
})
export class PreviousGamesComponent {

    @Input()
    previousGames: Game[];

    resultText(game: Game): string {
        let result = game.getResult();
        let users = Object.keys(result).filter((u: string) => u != null);
        return users[0] + ": " + result[users[0]] + " - " + users[1] + ": " + result[users[1]];
    }
}