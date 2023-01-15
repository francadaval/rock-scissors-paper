import { Injectable } from '@angular/core';
import { Subject, Observable, Observer } from "rxjs";
import { map, filter } from 'rxjs/operators';

const URL = "ws://localhost:3001";

export interface Message {
    type: string;
    content: any;
    error_code?: number;
    error?: string;
}

@Injectable({
	providedIn: 'root'
})
export class WebSocketService {

	constructor() {
		this.create(URL);

		this._sent = new Subject<string>()
		this._errors = new Subject<string>()
		console.log("Successfully connected: " + URL);
	}

	private ws: WebSocket;
	private _connection: Observable<MessageEvent>;
	private _sent: Subject<string>;
	private _errors: Subject<string>;
	private pingTimeOut: any;

	protected connected: Promise<boolean>

	public get sent(): Observable<string> {
		return this._sent;
	}

	public get errors(): Observable<string> {
		return this._errors;
	}

	public connect(): Observable<MessageEvent> {
		return this._connection;
	}

	public connectToData(): Observable<any> {
		return this._connection.pipe( map( message => JSON.parse( message.data ) ) )
	}

	public connectToResponseType( type: string ): Observable<Message> {
		return this.connectToData().pipe( filter( response => response.type == type ) )
	}

	public send( data: Message ) {
		this.connected.then( () => {
			if( this.ws.readyState === WebSocket.OPEN ) {
				console.log( "Send Message" )
				let msg = JSON.stringify(data)
				this.ws.send( msg );
				this._sent.next( msg );
			} else {
				let error = "ERROR: Connection state " + this.readyState()
				console.log( error )
				this._errors.next( error )
			}
		})
	}

	private heartbeat() {
		clearTimeout( this.pingTimeOut )

		this.pingTimeOut = setTimeout( () => {
			this.ws.close()
		})
	}

	private readyState(): string {
		switch( this.ws.readyState ) {
			case WebSocket.OPEN:
				return 'open';
			case WebSocket.CLOSED:
				return 'closed';
			case WebSocket.CLOSING:
				return 'closing';
			case WebSocket.CONNECTING:
				return 'connecting';
			default:
				return '';
		}
	}

	private create(url:string) {
		this.ws = new WebSocket(url)
		let subject = new Subject<MessageEvent>()

		this.ws.onmessage = subject.next.bind( subject )
		this.ws.onerror = subject.error.bind( subject );
		this.ws.onclose = subject.complete.bind( subject );

		this.connected = new Promise( (resolve, reject) => {
			this.ws.onopen = () => {
				resolve( true )
			}
		} ) 

		this._connection = subject;
	}
}
