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

    async findOne(username: string, password: string): Promise<User> {
        let user = USERS[username];
        return (user && user.password == password) ? user : null;
    }
}