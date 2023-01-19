import { Logger } from "log4js";
import { Broadcaster } from "../websockets/broadcaster";
import { ConnectionContext } from "../websockets/connection-context";
import { MessageHandler } from "../websockets/message-handler";
import { WebSocketsService } from "../websockets/websockets.service";

export abstract class AbstractService implements MessageHandler {

    protected logger: Logger;
    
    protected messageType: string;
    private websocketsService: WebSocketsService;
    private broadcaster: Broadcaster;

    private commandFunctions = [];

    constructor( websocketsService: WebSocketsService, broadcaster: Broadcaster, messageType: string ) {

            this.websocketsService = websocketsService;
            this.broadcaster = broadcaster;
            this.messageType = messageType;
    
            websocketsService.addHandler(this);
    }

    acceptType(type: string): boolean {
        return type === this.messageType;
    }

    async handleMessage(message: Message, connectionContext: ConnectionContext) {
        if (message.type == this.messageType) {
            let command = message.content.command;
            let username = connectionContext.session?.username;

            this.logger.trace("Command " + command + " from " + username);

            return (username && this.commandFunctions[command]) ? this.commandFunctions[command](message.content, connectionContext.session.username) : null;
        }
    }

    protected registerCommandFunction(command: string, commandFunction: (messageContent: any, username: string) => Promise<any>) {
        this.commandFunctions[command] = commandFunction;
    }
    
    protected async sendMessageToUser(username: string, content: any, command: string) {
        this.broadcaster.sendUserMessage(username, {
            type: this.messageType,
            content: { ...content, command }
        })
    }

    protected async sendMessageToUsers(users: string[], content, command: string) {
        users.forEach(username => this.sendMessageToUser(username, content, command));
    }

    protected async sendErrorMessageToUser(username: string, command: string, error: string = "Error", error_code: number = 0) {
        this.broadcaster.sendUserErrorMessage(username, {
            type: this.messageType,
            content: { command },
            error: error,
            error_code
        });
    }

    protected async sendErrorMessageToUsers(users: string[], command: string, error: string = "Error", error_code: number = 0) {
        users.forEach(username => this.sendErrorMessageToUser(username, command, error, error_code));
    }

    protected async broadcastMessage(content) {
        this.broadcaster.broadcastMessage({
            type: this.messageType,
            content
        })
    }
}