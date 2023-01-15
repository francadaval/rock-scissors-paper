export interface Broadcaster {
    sendUserMessage(username: string, message: Message): void;
    sendUserErrorMessage(username: string, message: ErrorMessage): void;
	broadcastMessage( message: Message ): void; 
	broadcastError( message: ErrorMessage ): void;
}