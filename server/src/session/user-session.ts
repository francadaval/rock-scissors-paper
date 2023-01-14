export interface UserSession {
	_id: string,
	username: string,
	name: string,
	ip: string,
	time: Date,
	sendMessage?: ( data: object, type: string ) => void,
	sendError?: ( data: object, type: string ) => void,
	terminate?: () => void
}