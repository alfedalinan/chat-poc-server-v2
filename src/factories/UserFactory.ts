import { mysqlParameterizedPromise, mysqlToPromise } from '../utilities/DbHelper';

export const checkRegister = (data: Object) : Promise<any> => {
    return mysqlParameterizedPromise('SELECT * FROM user_registers WHERE ? LIMIT 1', data);
};

export const registerUser = (data: Object) : Promise<any> => {
    return mysqlParameterizedPromise('INSERT INTO user_registers SET ?', data);
};

export const updateUserRegister = (data: Array<any>) : Promise<any> => {
    return mysqlParameterizedPromise('UPDATE user_registers SET register_id = ? WHERE user_id = ?', data);
};

export const unregisterUser = (data: any) : Promise<any> => {
    return mysqlToPromise(`DELETE FROM user_registers WHERE user_id=${data.user_id}`)
};