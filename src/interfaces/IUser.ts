import { User } from "../entities/User";
import { UserSearchResult } from "../data-sets/UserSearchResult";

interface IUser {
    
    getUsers(): Promise<User[]>;
    getUserById(id: number): Promise<User>;
    searchUsers(username: string): Promise<UserSearchResult[]>;
    createUser(user: User): Promise<number>;
    updateUser(id: number, user: User): Promise<boolean>;

}

export { IUser }