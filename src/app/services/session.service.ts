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
const CONTINUE_SESSION_COMMAND = "continue_session";

@Injectable({
	providedIn: 'root'
})
export class SessionService {

	constructor( protected wsService: WebSocketService ) {
		console.log( "Constructor SessionService" )

		this.sessionObservable = wsService.connectToResponseType(USER_SESSION_MESSAGE_TYPE);

		this.checkUserSession();
	}

	protected _userSession: UserSession;
	protected _$userSession: Promise<UserSession>;

	protected sessionObservable: Observable<Message>;

	public get $userSession(): Promise<UserSession> {
		return this._$userSession || Promise.resolve( this._userSession );
	}

	public get userSession(): UserSession {
		return this._userSession;
	}

	public checkUser(): Promise<UserSession> {
		return null;
	}

	public login( username: string, password: string ): Promise<UserSession> {
		if( !this._$userSession ) {
			this._$userSession = new Promise( (resolve,reject) => {
				let loginSubscription = this.sessionObservable
					.pipe(filter( message => message.content.command == LOGIN_COMMAND ))
					.subscribe( message => {
						console.log( "Login response: " + JSON.stringify(message) )
						if( !message.error && message.content.username == username ) {
							this.setUserSession( message.content );
							resolve( this._userSession )
						} else {
							this.setUserSession( null );
							reject( message )
						}
						loginSubscription.unsubscribe();
					});		

				console.log( "Login user" )
				this.wsService.send({
					type: USER_SESSION_MESSAGE_TYPE,
					content: {
						command: LOGIN_COMMAND,
						username: username,
						password: password
					}
				})
			})

			return this._$userSession
		} else {
			return Promise.reject()
		}
	}

	protected checkUserSession(): Promise<UserSession> {
		let sessionId = localStorage.getItem( SESSION_ID )
		if( !this._$userSession && sessionId ) {
			this._$userSession = new Promise( (resolve,reject) => {
				
				let sessionSubscription = this.sessionObservable
					.pipe(filter( message => message.content.command == CONTINUE_SESSION_COMMAND ))
					.subscribe( message => {
						console.log( "Continue session response: " + JSON.stringify(message) )
						if( !message.error ) {
							this.setUserSession( message.content );
							resolve( this._userSession )
						} else {
							this.setUserSession( null );
							reject( message )
						}
						sessionSubscription.unsubscribe();
					});		

				console.log( "Ask to continue session" )
				this.wsService.send({
					type: USER_SESSION_MESSAGE_TYPE,
					content: {
						command: CONTINUE_SESSION_COMMAND,
						session_id: sessionId
					}
				})
			})

			return this._$userSession
		} else {
			console.log( this._$userSession ? "Ya existe $user" : ( !sessionId ? "No hay session previa" : "???" ) )
			return Promise.reject()
		}
	}

	protected setUserSession( userSession: UserSession ) {
		if( userSession )
			localStorage.setItem( SESSION_ID, userSession.id );
		else
			localStorage.removeItem( SESSION_ID );

		this._userSession = userSession
		this._$userSession = null
	}
}
