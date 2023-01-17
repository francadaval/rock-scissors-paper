import { UserSession } from "../entities/user-session";
import { Repository } from "./repository";

export interface UserSessionRepository extends Repository<UserSession> {
    deleteByUsername: (username: string) => Promise<void>;
}
