import { User } from "../entities/User";
import { UserSearchResult } from "../data-sets/UserSearchResult";
import { UserRegister } from "../entities/UserRegister";

interface IUserRepository {
    
    getUsers(): Promise<User[]>;
    getUserById(id: number): Promise<User>;
    searchUsers(username: string): Promise<UserSearchResult[]>;
    createUser(user: User): Promise<number>;
    updateUser(id: number, user: User): Promise<boolean>;
    checkRegister(userId: number): Promise<UserRegister[]>;
    registerUser(userRegister: UserRegister): Promise<any>;
    updateUserRegister(registerId: number, userId: number): Promise<any>;
    removeUserRegister(userId: number): Promise<any>;
}

export { IUserRepository }