import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable, Subscription } from "rxjs";
import { Game } from "src/app/entities/game.entity";
import { Room } from "src/app/entities/room.entity";
import { GamesService } from "src/app/services/games.service";
import { RoomsService } from "src/app/services/rooms.service";

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html'
})
export class RoomComponent implements OnInit, OnDestroy {

	constructor(
		private route: ActivatedRoute,
		protected roomsService: RoomsService,
		protected gamesService: GamesService
	) {}

	protected _roomId: string;
	protected _room: Room;
	protected $currentGame: Observable<Game>;
	protected roomSubscription: Subscription;
	protected calledCreateGame = false;

	public get room(): Room { return this._room; };

	public get disabledCreateGame(): boolean {
		return this.calledCreateGame || !this.room || !!this.room.currentGameId;
	}
	
	ngOnInit() {
		this.route.params.subscribe(params => {
			console.log("Params: " + JSON.stringify(params));
			this._roomId = params['id'];
			
			if(this.roomSubscription) {
				this.roomSubscription.unsubscribe();
			}

			if(this._roomId) {
				this.roomSubscription = this.roomsService.observeRoom(this._roomId).subscribe(roomMessage => {
					this._room = roomMessage.content.room;

					if(this.room.currentGameId) {
						this.$currentGame = this.gamesService.observeGame(this.room.currentGameId).pipe(map(message => message.content.game));
					} else {
						this.$currentGame = null;
					}
				});
			}
		});
	}

	ngOnDestroy() {
		if(this.roomSubscription) {
			this.roomSubscription.unsubscribe();
		}
	}

	async createGame() {
		this.calledCreateGame = true;
		this.roomsService.createGame(this._roomId, 5);
		this.calledCreateGame = false;
	}
}
