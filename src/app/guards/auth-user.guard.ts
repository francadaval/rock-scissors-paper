import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { SessionService } from "../services/session.service";

@Injectable({
	providedIn: 'root'
})
export class AuthUserGuard implements CanActivate {
    constructor(private sessionService: SessionService, private router: Router) {}
    
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
        return (await this.sessionService.$userSession) ? true : this.router.parseUrl('/login');
    }
}