import { mysqlParameterizedPromise, mysqlToPromise } from '../utilities/DbHelper';

export const findUser = (data) : Promise<any> => {
    return mysqlParameterizedPromise(`SELECT users.id, users.username, users.first_name, users.last_name, users.email, users.password, user_registers.register_id FROM users LEFT JOIN user_registers ON users.id = user_registers.user_id WHERE ? LIMIT 1`, data);
}

export const removeRegister = (isSingle: boolean, registerId?: String): Promise<any> => {
    
    if (isSingle) {
        
        return mysqlToPromise(`DELETE FROM user_registers WHERE register_id='${registerId}'`);

    }
    
    return mysqlToPromise('DELETE FROM user_registers');
}