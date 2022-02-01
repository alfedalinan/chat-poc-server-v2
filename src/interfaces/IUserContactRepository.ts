import { UserContact } from "../entities/UserContact";
import { UserContactResult } from "../data-sets/UserContactResult";
import { UserSingleContact } from "../data-sets/UserSingleContact";

interface IUserContactRepository {

    getContacts(id: number): Promise<UserContactResult[]>;
    getSingleContact(contactId: number, ownerId: number): Promise<UserSingleContact>;
    createContact(userContact: UserContact): Promise<any>;
    updateContact(id: number, userContact: UserContact): Promise<any>;
    removeContact(id: number): Promise<any>;
}

export { IUserContactRepository }