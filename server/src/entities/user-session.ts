export interface UserSession {
	_id: string,
	username: string,
	name: string,
	ip: string,
	time: Date,
	sendMessage?: ( message: Message ) => void,
	sendError?: ( errorMessage: ErrorMessage ) => void,
	terminate?: () => void
}