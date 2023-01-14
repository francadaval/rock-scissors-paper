import { Injectable } from '@angular/core';

export interface UserSession {
	username: string,
	id: string
}

@Injectable({
	providedIn: 'root'
})
export class SessionService {
	protected _user: UserSession;
	protected $user: Promise<UserSession>;

	public get user(): Promise<UserSession> {
		return this.$user || Promise.resolve( this._user );
	}

	public checkUser(): Promise<UserSession> {
		return null;
	}

	public login( username: string, password: string ): Promise<UserSession> {
		return null;
	}
}
