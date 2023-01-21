import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { RoomsService } from "../services/rooms.service";

@Injectable({
	providedIn: 'root'
})
export class RoomsGuard implements CanActivate {
    constructor(
        private roomsService: RoomsService,
        private router: Router
    ) {}
    
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
        const id = route.paramMap.get('id');
        console.log("RoomsGuard, check: " + id);
        await this.roomsService.$initializedService;
        let room = this.roomsService.userRooms.find(room => room._id == id);

        return room ? true : this.router.parseUrl('/');
    }
}