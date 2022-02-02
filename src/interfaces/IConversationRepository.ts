import { ConversationMember } from "../data-sets/ConversationMember";
import { ConversationDetail } from "../data-sets/ConversationDetail";
import { ConversationBody } from "../data-sets/ConversationBody";

interface IConversationRepository {

    getConversations(memberId: number): Promise<ConversationMember[]>;
    getConversationById(conversationId: number, memberId: number): Promise<ConversationDetail[] | ConversationMember[]>; 
    createConversation(conversationBody: ConversationBody): Promise<any>;
    removeConversation(conversationId: number): Promise<any>;

}

export { IConversationRepository }