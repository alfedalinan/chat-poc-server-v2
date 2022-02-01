import { LoginResult } from "data-sets/LoginResult";
import { mysqlToPromise } from "../utilities/DbHelper";
import { ILoginRepository } from "../interfaces/ILoginRepository";

class LoginRepository implements ILoginRepository {
    
    async login(username: string): Promise<LoginResult> {
        
        let queryResult: any = await mysqlToPromise(`SELECT users.id, 
                                                            users.username, 
                                                            users.first_name, 
                                                            users.last_name, 
                                                            users.email, 
                                                            users.password, 
                                                            user_registers.register_id 
                                                       FROM users 
                                                       LEFT 
                                                       JOIN user_registers 
                                                         ON users.id = user_registers.user_id 
                                                      WHERE username = '${username}' 
                                                      LIMIT 1`);


        let loginResult: LoginResult = {
            id: queryResult[0].id,
            username: queryResult[0].username,
            firstName: queryResult[0].first_name,
            lastName: queryResult[0].last_name,
            email: queryResult[0].email,
            password: queryResult[0].password,
            registerId: queryResult[0].register_id
        };

        return loginResult;
    }

    async removeRegisters(isSingle: boolean, registerId?: string): Promise<any> {
        
        if (isSingle) {
        
            await mysqlToPromise(`DELETE FROM user_registers WHERE register_id='${registerId}'`);
    
        }
        
        await mysqlToPromise('DELETE FROM user_registers');

    }

}

export { LoginRepository }