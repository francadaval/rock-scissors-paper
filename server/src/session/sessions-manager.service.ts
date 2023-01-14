import { getLogger, Logger } from "log4js"
import { ConnectionContext } from "../websockets/connection-context"
import { MessageHandler } from "../websockets/message-handler"
import { UserSession } from "./user-session"

export class SessionManagerService implements MessageHandler {

    protected logger: Logger = getLogger("WebSocketsServer")
    protected sessions: {
		[id:string]: UserSession
	} = {}

    async handleMessage(message: Message, connectionContext: ConnectionContext) {
        let content = message.content;

        switch( message.content.command ) {
            case 'login':
                this.logger.trace( 'Received login message from user: ' + content.username )
                connectionContext.session = await this.initUserSession( content.username, content.password, connectionContext.ip )
                break;
            case 'continue_session':
                this.logger.trace( 'Received continue_session message from user: ' + content.username )
                connectionContext.session = await this.getUserSession( content.session_id, connectionContext.ip )
                break;
            case 'logout':
                this.logger.trace( 'Received logout message from user: ' + content.username )
                await this.logout(content.session_id);
                connectionContext.session = null;
            default:
                this.logger.error('Unknown message of type "user-session".')
        }
    }

    protected getUserSession(session_id: any, ip: string): UserSession | PromiseLike<UserSession> {
        throw new Error("Method not implemented.")
    }

    protected initUserSession(username: any, password: any, ip: string): UserSession | PromiseLike<UserSession> {
        throw new Error("Method not implemented.")
    }

    protected logout(session_id: any) {
        throw new Error("Method not implemented.")
    }

    acceptType(type: string): boolean {
        return type === "user-session";
    }
}