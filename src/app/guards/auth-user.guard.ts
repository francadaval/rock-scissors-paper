import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { SessionService } from "../services/session.service";

@Injectable({
	providedIn: 'root'
})
export class AuthUserGuard implements CanActivate {
    constructor(private sessionService: SessionService) {}
    
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
        return (await this.sessionService.$userSession) ? true : false;
    }
}