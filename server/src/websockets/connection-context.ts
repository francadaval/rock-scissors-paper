import { WebSocket } from "ws";
import { UserSession } from "../entities/user-session";

export interface ConnectionContext {
	ws: WebSocket;
	ip: string;
	session?: UserSession;
}