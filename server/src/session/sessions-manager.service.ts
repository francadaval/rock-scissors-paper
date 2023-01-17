import { getLogger, Logger } from "log4js"
import { UserSessionRepository } from "../repository/user-session.repository"
import { UserRepository } from "../repository/user.repository"
import { ConnectionContext } from "../websockets/connection-context"
import { MessageHandler } from "../websockets/message-handler"
import { WebSocketsService } from "../websockets/websockets.service"
import { WebSocket } from 'ws';
import { UserSession } from "../entities/user-session"

import crypto = require('crypto')
import { Broadcaster } from "../websockets/broadcaster"

export const USER_SESSION_MESSAGE_TYPE = "user-session";

export class SessionManagerService implements MessageHandler, Broadcaster {

    protected userRepository: UserRepository;
    protected userSessionRepository: UserSessionRepository;
    protected websocketsService: WebSocketsService;

    protected logger: Logger = getLogger("WebSocketsServer")
    protected sessions: {
		[id:string]: UserSession
	} = {}

    constructor(
        userRepository: UserRepository,
        userSessionRepository: UserSessionRepository, 
        websocketsService: WebSocketsService ){

        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
        this.websocketsService = websocketsService;

        websocketsService.addHandler(this);
    }

    async handleMessage(message: Message, connectionContext: ConnectionContext) {
        let content = message.content;
        let session: UserSession = null;

        switch( message.content.command ) {
            case 'login':
                this.logger.trace( 'Received login message from user: ' + content.username );
                connectionContext.session = await this.login( content.username, content.password, connectionContext );
                this.sendSessionResponse(connectionContext, message.content.command);
                break;
            case 'continue_session':
                this.logger.trace( 'Received continue_session message from user: ' + content.username );
                connectionContext.session = await this.continue( content.session_id, connectionContext.ip );
                this.sendSessionResponse(connectionContext, message.content.command);
                break;
            case 'logout':
                this.logger.trace( 'Received logout message from user: ' + content.username )
                await this.logout(content.session_id);
                this.sendSessionResponse(connectionContext, message.content.command);
                connectionContext.session = null;
                break;
            default:
                this.logger.error('Unknown message of type "user-session".')
                return;
        }
    }

    public sendUserMessage(username: string, message: Message): void {
        Object.values(this.sessions)
            .filter(session => session.username == username)
            .forEach(session => session.sendMessage(message));
    }
    
    public sendUserErrorMessage(username: string, message: ErrorMessage): void {
        Object.values(this.sessions)
            .filter(session => session.username == username)
            .forEach(session => session.sendError(message));
    }
    
	public broadcastMessage( message: Message ): void {
		for( let session of Object.values( this.sessions ) ) {
			session.sendMessage( message );
		}
	}

	public broadcastError( message: ErrorMessage ): void {
		for( let session of Object.values( this.sessions ) ) {
			session.sendError( message );
		}
	}

    protected sendSessionResponse(connectionContext: ConnectionContext, command: string) {
        if(connectionContext.session) {
            this.linkSession(connectionContext.session, connectionContext.ws);

            this.websocketsService.sendMessage(connectionContext.ws, {
                type: USER_SESSION_MESSAGE_TYPE,
                content: {
                    command: command,
                    username: connectionContext.session.username,
                    id: connectionContext.session._id
                }
            });
        } else {
            this.websocketsService.sendErrorMessage(connectionContext.ws, {
                type: USER_SESSION_MESSAGE_TYPE,
                error: "Error",
                error_code: 1,
                content: {
                    command: command
                }
            })
        }
    }

    protected async login(username: any, password: any, connectionContext: ConnectionContext): Promise<UserSession> {
        let user = await this.userRepository.findOneByUsernameAndPassword(username, password);

        if( user ) {
			this.logger.info( "Init session: " + username )
			this.destroyUserSessions(username)
			return this.createSession(username, connectionContext);
		}

		return null;
    }

    protected async continue(session_id: any, ip: string): Promise<UserSession> {
        let session = this.sessions[session_id];
        return session?.ip == ip ? session : null;
    }

    protected async logout(session_id: string) {
        let session = this.sessions[session_id];

        if(session) {
            session.terminate();
            await this.userSessionRepository.delete(session);
            delete this.sessions[session_id];
        }
    }

    protected async createSession( username: string, connectionContext: ConnectionContext ) {
		this.logger.trace( "Create session for user: " + username )

		let session: UserSession = {
			_id: crypto.randomUUID(),
			username: username,
			name: username,
			ip: connectionContext.ip,
			time: new Date()
		}

		this.userSessionRepository.save(session);
		this.sessions[session._id] = session

		return session;
	}

    protected linkSession(session: UserSession, ws: WebSocket) {
        session.sendMessage = (message: Message) => this.websocketsService.sendMessage(ws, message);
        session.sendError = (errorMessage: ErrorMessage) => this.websocketsService.sendErrorMessage(ws, errorMessage );
        session.terminate = () => ws.terminate();
    }

    protected async destroyUserSessions(username: string) {
        Object.values(this.sessions)
            .filter(session => session.username == username)
            .forEach(session => {
                session.terminate();
                delete this.sessions[session._id];
            });

        this.userSessionRepository.deleteByUsername(username);
    }

    acceptType(type: string): boolean {
        return type === USER_SESSION_MESSAGE_TYPE;
    }
}
