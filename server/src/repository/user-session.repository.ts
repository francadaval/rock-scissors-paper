import { UserSession } from "../entities/user-session";

export interface UserSessionRepository {
    save: (session: UserSession) => Promise<void>;
    deleteByUsername: (username: string) => Promise<void>;
    deleteById: (id: string) => Promise<void>;
}
