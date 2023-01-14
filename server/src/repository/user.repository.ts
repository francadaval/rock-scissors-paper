import { User } from "../entities/user.entity";

export interface UserRepository {
    findOne: (username: string, password: string) => Promise<User>;
}
