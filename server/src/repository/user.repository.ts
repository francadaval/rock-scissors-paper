import { User } from "../entities/user.entity";
import { Repository } from "./repository";

export interface UserRepository extends Repository<User> {
    findOneByUsernameAndPassword: (username: string, password: string) => Promise<User>;
}
