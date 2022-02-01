import { UserContactResult } from "../data-sets/UserContactResult";
import { UserSingleContact } from "../data-sets/UserSingleContact";
import { UserContact } from "../entities/UserContact";
import { mysqlParameterizedPromise, mysqlToPromise } from "../utilities/DbHelper";
import { IUserContactRepository } from "../interfaces/IUserContactRepository";
import { mapKeys, rearg, snakeCase } from "lodash";

class UserContactRepository implements IUserContactRepository {

    async getContacts(id: number): Promise<UserContactResult[]> {
        
        let queryResult: any = await mysqlToPromise(`SELECT user_contacts.id, 
                                                            user_contacts.contact_id, 
                                                            users.username, 
                                                            user_registers.register_id, 
                                                            user_contacts.display_first_name, 
                                                            user_contacts.display_last_name, 
                                                            users.email 
                                                       FROM user_contacts 
                                                       JOIN users 
                                                         ON user_contacts.contact_id = users.id 
                                                       LEFT 
                                                       JOIN user_registers 
                                                         ON user_contacts.contact_id = user_registers.user_id 
                                                      WHERE user_contacts.user_id = ${id}`);

        
        let userContactResults: UserContactResult[] = [];

        for (let index = 0; index < queryResult.length; index++) {
            const item = queryResult[index];
            
            userContactResults.push({
                id: item.id,
                contactId: item.contact_id,
                username: item.username,
                registerId: item.register_id,
                displayFirstName: item.display_first_name,
                displayLastName: item.display_last_name,
                email: item.email
            });
        }

        return userContactResults;
    }

    async getSingleContact(contactId: number, ownerId: number): Promise<UserSingleContact> {
        
        let queryResult: any = await mysqlToPromise(`SELECT users.id, 
                                                            users.username, 
                                                            user_contacts.contact_id 
                                                       FROM users 
                                                       JOIN user_contacts 
                                                         ON users.id = user_contacts.contact_id 
                                                      WHERE users.id = ${contactId} 
                                                        AND user_contacts.user_id = ${ownerId} 
                                                      LIMIT 1`);

        let userSingleContact: UserSingleContact = {
            id: queryResult[0].id,
            username: queryResult[0].username,
            contactId: queryResult[0].contact_id
        };

        return userSingleContact;

    }

    async createContact(userContact: UserContact): Promise<any> {
        
        let data: any = mapKeys(userContact, rearg(snakeCase, 1));

        return await mysqlParameterizedPromise(`INSERT INTO user_contacts 
                                                   SET ?`, data);
    }

    async updateContact(id: number, userContact: UserContact): Promise<any> {
        
        let data: any = mapKeys(userContact, rearg(snakeCase, 1));

        return await mysqlParameterizedPromise(`UPDATE user_contacts 
                                                   SET ? 
                                                 WHERE id = ?`, [data, id]);

    }

    async removeContact(id: number): Promise<any> {
        
        return await mysqlToPromise(`DELETE FROM user_contacts WHERE id=${id}`);

    }

}

export { UserContactRepository }