import { UserRegister } from "./UserRegister";
import { User } from "./User";
import { ConversationMember } from "../data-sets/ConversationMember";

interface Conversation {
    id?: number,
    name?: string,
    createdAt?: string,
    updatedAt?: string,
    user?: User,
    userRegister?: UserRegister,
    member?: ConversationMember

}

export { Conversation }