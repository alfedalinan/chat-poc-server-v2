import { UserContact } from "../entities/UserContact";
import { UserContactResult } from "../data-sets/UserContactResult";
import { UserSingleContact } from "../data-sets/UserSingleContact";

interface IUserContact {

    getContacts(): Promise<UserContactResult[]>;
    getSingleContact(contactId: number, ownerId: number): Promise<UserSingleContact>;
    createContact(userContact: UserContact): Promise<number>;
}

export { IUserContact }