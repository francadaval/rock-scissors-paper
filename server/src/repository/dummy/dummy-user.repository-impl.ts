import { User } from "../../entities/user.entity";
import { UserRepository } from "../user.repository";

const USERS: {[id:string]: User} = {
    user1: {
        username: "user1",
        password: "password"
    },
    user2: {
        username: "user2",
        password: "password"
    },
    user3: {
        username: "user3",
        password: "password"
    },
} 

export class DummyUserRepositoryImpl implements UserRepository {

    async findOneById(id: string): Promise<User> {
        return USERS[id];
    }

    async save(user: User): Promise<void> {
        USERS[user.username] = user;
    }

    async delete(user: User): Promise<void> {
        delete USERS[user.username];
    }

    async findOneByUsernameAndPassword(username: string, password: string): Promise<User> {
        let user = USERS[username];
        return (user && user.password == password) ? user : null;
    }
}
