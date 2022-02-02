import { User } from "../entities/User";
import { IUserRepository } from "../interfaces/IUserRepository";
import { UserSearchResult } from "../data-sets/UserSearchResult";
import { mysqlParameterizedPromise, mysqlToPromise } from "../utilities/DbHelper";
import { mapKeys, rearg, snakeCase  } from "lodash";
import { UserRegister } from "../entities/UserRegister";

class UserRepository implements IUserRepository {
    
    async getUsers(): Promise<User[]> {
        
        let queryResult: any = await mysqlToPromise(`SELECT id, 
                                                            username, 
                                                            created_at, 
                                                            update_at 
                                                       FROM users`);
        let users: User[] = [];
        
        for (let index = 0; index < queryResult.length; index++) {
            const item = queryResult[index];
            
            users.push({
                id: item.id,
                username: item.username,
                createdAt: item.created_at
            });
        }

        return users;

    }

    async getUserById(id: number): Promise<User> {
        
        let queryResult: any = await mysqlToPromise(`SELECT id, 
                                                            username, 
                                                            first_name, 
                                                            last_name, 
                                                            access_token, 
                                                            email, 
                                                            created_at, 
                                                            update_at 
                                                       FROM users 
                                                      WHERE id = ${id} 
                                                      LIMIT 1`);

        let user: User = {
            id: queryResult[0].id,
            username: queryResult[0].username,
            firstName: queryResult[0].first_name,
            lastName: queryResult[0].last_name,
            accessToken: queryResult[0].access_token,
            email: queryResult[0].email,
            createdAt: queryResult[0].created_at,
            updateAt: queryResult[0].update_at
        };

        return user;

    }

    async searchUsers(username: string): Promise<UserSearchResult[]> {
        
        // username params is the user currently logged in
        let queryResult: any = await mysqlToPromise(`SELECT users.id, 
                                                            user_registers.register_id AS register_id, 
                                                            username, 
                                                            users.created_at, 
                                                            users.update_at 
                                                       FROM users 
                                                       LEFT 
                                                       JOIN user_registers 
                                                         ON users.id = user_registers.user_id 
                                                      WHERE username != '${username}'`);

        let userSearchResults: UserSearchResult[] = [];

        for (let index = 0; index < queryResult.length; index++) {
            const item = queryResult[index];
            
            userSearchResults.push({
                id: item.id,
                registerId: item.register_id,
                username: item.username,
                createdAt: item.created_at,
                updateAt: item.update_at
            });
        }
        
        return userSearchResults;
    }

    async createUser(user: User): Promise<number> {

        let data: any = mapKeys(user, rearg(snakeCase, 1));

        let queryResults: any = await mysqlParameterizedPromise(`INSERT INTO users SET ?`, data);
    
        return queryResults.insertId;
    }

    async updateUser(id: number, user: User): Promise<boolean> {

        let data: any = mapKeys(user, rearg(snakeCase, 1));
 
        return await mysqlParameterizedPromise(`UPDATE users SET ? WHERE ?`, [data, {id: id}]);
    }

    async checkRegister(userId: number): Promise<UserRegister[]> {
        
        let queryResult: any = await mysqlParameterizedPromise(`SELECT * 
                                                                  FROM user_registers 
                                                                 WHERE user_id = ? 
                                                                 LIMIT 1`, userId);
        let userRegister: UserRegister[] = [];

        for (let index = 0; index < queryResult.length; index++) {
            const item = queryResult[index];
            
            userRegister.push({
                id: item.id,
                userId: item.user_id,
                registerId: item.register_id,
                ipPort: item.ip_port,
                ipAddress: item.ip_address,
                expiresAt: item.expires_at,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            });
        }

        return userRegister;
    }

    registerUser(userRegister: UserRegister): Promise<any> {

        let data: any = mapKeys(userRegister, rearg(snakeCase, 1));

        return mysqlParameterizedPromise('INSERT INTO user_registers SET ?', data);
    }

    updateUserRegister(registerId: number, userId: number): Promise<any> {
        return mysqlParameterizedPromise('UPDATE user_registers SET register_id = ? WHERE user_id = ?', [registerId, userId]);
    }

    removeUserRegister(userId: number): Promise<any> {
        return mysqlToPromise(`DELETE FROM user_registers WHERE user_id = ${userId}`)
    }

}

export { UserRepository }