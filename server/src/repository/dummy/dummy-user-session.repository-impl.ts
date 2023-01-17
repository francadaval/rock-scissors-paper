import { UserSession } from "../../entities/user-session";
import { UserSessionRepository } from "../user-session.repository";

const USER_SESSIONS: {[id:string]: UserSession} = {};

export class DummyUserSessionRepositoryImpl implements UserSessionRepository {

    async findOneById(id: string): Promise<UserSession> {
        return USER_SESSIONS[id];
    }

    async delete(entity: UserSession): Promise<void> {
        delete USER_SESSIONS[entity._id];
    }

    async save(session: UserSession) {
        USER_SESSIONS[session._id] = session;
    };

    async deleteByUsername(username: string) {
        Object.values(USER_SESSIONS)
            .filter(session => session.username == username)
            .forEach(session => delete USER_SESSIONS[session._id]);
    };
}
