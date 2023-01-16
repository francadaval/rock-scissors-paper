import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Room } from "src/app/entities/room.entity";
import { RoomsService } from "src/app/services/rooms.service";

@Component({
	selector: 'app-rooms-list',
	templateUrl: './rooms-list.component.html'
})
export class RoomsListComponent {

	constructor(protected roomsService: RoomsService, private router: Router) {}

    get freeRooms(): Room[] {
        return this.roomsService.freeRooms;
    }

    get userRooms(): Room[] {
        return this.roomsService.userRooms;
    }

    joinRoom(id: string) {
        let subscription = this.roomsService.joinedToRoom.subscribe(room => {
            this.router.navigate(['/room/' + room._id]);
            subscription.unsubscribe();
        });

        this.roomsService.joinRoom(id);
    }

    leaveRoom(id: string) {
        this.roomsService.leaveRoom(id);
    }

    createRoom() {
        this.roomsService.createRoom("New room");
    }
}