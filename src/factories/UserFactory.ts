import { mysqlParameterizedPromise, mysqlToPromise } from '../utilities/DbHelper';

export const getAllUsers = () : Promise<any> => {
    return mysqlToPromise('SELECT id, username, created_at, update_at FROM users');
};

export const getUserByField = (field: string, value: any): Promise<any> => {
    return mysqlToPromise(`SELECT id, username, first_name, last_name, access_token, email, created_at, update_at FROM users WHERE ${field} = ${value} LIMIT 1`);
};

export const getUserExceptField = (exceptField: String, exceptionValue: any) : Promise<any> => {
    return mysqlToPromise(`SELECT users.id, user_registers.register_id AS register_id, username, users.created_at, users.update_at FROM users LEFT JOIN user_registers ON users.id = user_registers.user_id WHERE ${exceptField} != '${exceptionValue}'`);
};

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

export const createNewUer = (data: any): Promise<any> => {
    return mysqlParameterizedPromise(`INSERT INTO users SET ?`, data);
};

export const updateUser = (data: any, filter: any): Promise<any> => {
    return mysqlParameterizedPromise(`UPDATE users SET ? WHERE ?`, [data, filter]);
};