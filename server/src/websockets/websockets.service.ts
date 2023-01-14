import * as http from 'http';
import { getLogger, Logger } from 'log4js'
import { RawData, Server, WebSocket } from 'ws';
import { ConnectionContext } from './connection-context';
import { MessageHandler } from './message-handler';

export class WebSocketsService {

	protected logger: Logger = getLogger("WebSocketsServer");

	protected wss: Server;

	protected messageHandlers: MessageHandler[] = [];

	public constructor(port: number) {
		this.logger.info("Trying to start server on port " + port);

		this.wss = new Server({port});

		this.wss.on('listening', () => {
			this.logger.info("Server listening on port " + port);
		})

		this.wss.on('connection', (wss,ws,request) => this.initConnection(ws,request) );
		
		// TODO: this.wss.on('close', ... );
		// TODO: this.wss.on('error', ... );
		// TODO: this.wss.on('header', ... );
	}

	public addHandler(handler: MessageHandler) {
		if(!this.messageHandlers.includes(handler))
			this.messageHandlers.push(handler);
	}

	// TODO:
	// public removeHandler(handler: MessageHandler) {
	// 	...
	// }

	protected async initConnection( ws: WebSocket, request: http.IncomingMessage ) {
		this.logger.info( "Incoming connection from " + request.socket.remoteAddress + "." )
		this.sendMessage( ws, {
			type: "comm",
			content: {
				text: "Connection established!!"
			}
		})

		let connectionContext: ConnectionContext = {
			ws: ws,
			ip: request.socket.remoteAddress
		};

		ws.on('message', async rawMessage => {
			this.logger.trace('Received message: ' + rawMessage);
			let msg: Message = this.parseMessage(rawMessage);

			this.messageHandlers.forEach(handler => {
				if(handler.acceptType(msg.type)) {
					handler.handleMessage(msg, connectionContext);
				}
			});
		})
	}

	private parseMessage(rawMessage: RawData): Message {
		let msg: string;

		if(Array.isArray(rawMessage)) {
			msg = "";
			for(var b of rawMessage) {
				msg += b.toString();
			}
		} else {
			msg = rawMessage.toString();
		}

		return JSON.parse(msg);
	}

	protected sendMessage( ws: WebSocket, message: Message ) {
		this.send( ws, message );
	}

	protected sendErrorMessage( ws: WebSocket, errorMessage: ErrorMessage ) {
		this.send( ws, errorMessage );
	}

	protected send( ws: WebSocket, obj: object ) {
		let msg = JSON.stringify( obj )
		if( ws.readyState == WebSocket.OPEN ) {
			ws.send( msg )
			this.logger.trace( "Sent message: " + msg )
		} else {
			this.logger.error( "Couldn't send message: " + msg )
		}
	}
}
