import { WebSocket } from "ws";
import { UserSession } from "../session/user-session";

export interface ConnectionContext {
	ws: WebSocket;
	ip: string;
	session?: UserSession;
}