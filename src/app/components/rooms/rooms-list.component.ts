import { Component } from "@angular/core";
import { Room } from "src/app/entities/room.entity";
import { RoomsService } from "src/app/services/rooms.service";

@Component({
	selector: 'app-rooms-list',
	templateUrl: './rooms-list.component.html'
})
export class RoomsListComponent {

	constructor(protected roomsService: RoomsService) {}

    get freeRooms(): Room[] {
        return this.roomsService.freeRooms;
    }

    get userRooms(): Room[] {
        return this.roomsService.userRooms;
    }
}