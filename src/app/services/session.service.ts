import { Injectable } from '@angular/core';
import { response } from 'express';
import { filter, Observable, Subscription } from 'rxjs'

import { Message, WebSocketService } from './websocket.service';

export interface UserSession {
	username: string,
	id: string
}

const SESSION_ID = 'sessionId';
const USER_SESSION_MESSAGE_TYPE = "user-session";
const LOGIN_COMMAND = "login";

@Injectable({
	providedIn: 'root'
})
export class SessionService {

	constructor( protected wsService: WebSocketService ) {
		console.log( "Constructor SessionService" )

		this.sessionObservable = wsService.connectToResponseType(USER_SESSION_MESSAGE_TYPE);
	}

	protected _userSession: UserSession;
	protected $userSession: Promise<UserSession>;

	protected sessionObservable: Observable<Message>;

	public get userSession(): Promise<UserSession> {
		return this.$userSession || Promise.resolve( this._userSession );
	}

	public checkUser(): Promise<UserSession> {
		return null;
	}

	public login( username: string, password: string ): Promise<UserSession> {
		if( !this.$userSession ) {
			this.$userSession = new Promise( (resolve,reject) => {
				let loginSubscription = this.sessionObservable
					.pipe(filter( response => response.content.command == LOGIN_COMMAND ))
					.subscribe( response => {
						console.log( "Login response: " + JSON.stringify(response) )
						if( !response.error && response.content.username == username ) {
							this.setUser( response.content );
							resolve( this.userSession )
						} else {
							this.setUser( null );
							reject( response )
						}
						loginSubscription.unsubscribe();
					})			

				this.wsService.send({
					type: USER_SESSION_MESSAGE_TYPE,
					content: {
						command: LOGIN_COMMAND,
						username: username,
						password: password
					}
				})
			})

			return this.$userSession
		} else {
			return Promise.reject()
		}
	}

	protected setUser( userSession: UserSession ) {
		if( userSession )
			localStorage.setItem( SESSION_ID, userSession.id );
		else
			localStorage.removeItem( SESSION_ID );

		this._userSession = userSession
		this.$userSession = null
	}
}
