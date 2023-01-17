import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Room } from "src/app/entities/room.entity";
import { RoomsService } from "src/app/services/rooms.service";

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html'
})
export class RoomComponent implements OnInit {

	constructor(
		private route: ActivatedRoute,
		protected roomsService: RoomsService
	) {}
	
	ngOnInit() {
		this.route.queryParams.subscribe(params => {
		  this._roomId = params['id'];
		});
	}

	protected _roomId: string;
	public get room(): Room { return this.roomsService.userRooms.find(room => room._id == this._roomId); }
}