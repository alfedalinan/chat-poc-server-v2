import { mysqlParameterizedPromise, mysqlToPromise } from '../utilities/DbHelper';

export const getAllContacts = (id: number): Promise<any> => {
    return mysqlToPromise(`SELECT user_contacts.id, user_contacts.contact_id, users.username, user_registers.register_id, user_contacts.display_first_name, user_contacts.display_last_name, users.email FROM user_contacts JOIN users ON user_contacts.contact_id = users.id LEFT JOIN user_registers ON user_contacts.contact_id = user_registers.user_id WHERE user_contacts.user_id = ${id}`);
};

export const getSingleContactDetail = (contactId: number, ownerId: number): Promise<any> => {

    return mysqlToPromise(`SELECT users.id, users.username, user_contacts.contact_id FROM users JOIN user_contacts ON users.id = user_contacts.contact_id WHERE users.id = ${contactId} AND user_contacts.user_id = ${ownerId} LIMIT 1;`);

};

export const createNewContact = (data: Object): Promise<any> => {
    return mysqlParameterizedPromise(`INSERT INTO user_contacts SET ?`, data);
};

export const updateContactDetails = (data: Object, id: number): Promise<any> => {
    return mysqlParameterizedPromise(`UPDATE user_contacts SET ? WHERE id = ?`, [data, id]);
};

export const removeContact = (id: number) => {
    return mysqlToPromise(`DELETE FROM user_contacts WHERE id=${id}`);
};