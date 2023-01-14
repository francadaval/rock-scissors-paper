export interface MessageHandler {
	handleMessage(message: Message, connectionContext: any): void;
	acceptType(type: string): boolean;
}
