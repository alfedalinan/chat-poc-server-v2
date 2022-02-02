import { mysqlParameterizedPromise, mysqlToPromise } from "../utilities/DbHelper";
import { ConversationDetail } from "../data-sets/ConversationDetail";
import { ConversationMember } from "../data-sets/ConversationMember";
import { Conversation } from "../entities/Conversation";
import { IConversationRepository } from "../interfaces/IConversationRepository";
import { ConversationBody } from "../data-sets/ConversationBody";

class ConversationRepository implements IConversationRepository {

    async getConversations(memberId: number): Promise<ConversationMember[]> {
        
        let conversationIds: number[] = [];

        await mysqlToPromise(`SELECT conversations.id 
                                FROM conversations 
                                JOIN conversation_members 
                                  ON conversations.id = conversation_members.conversation_id 
                               WHERE member_id = ${memberId};`)
        .then((result) => {
            for (var i = 0; i < result.length; i++) {
                conversationIds.push(result[i].id);
            }
        })
        .catch();

        let convIdsString: string = conversationIds.length > 0 ? conversationIds.join(',') : '0';
        
        let queryResult: any = await mysqlToPromise(`SELECT users.id, 
                                                            users.username, 
                                                            users.first_name, 
                                                            users.last_name, 
                                                            conversation_members.conversation_id, 
                                                            user_registers.register_id 
                                                       FROM users 
                                                       JOIN conversation_members 
                                                         ON users.id = conversation_members.member_id 
                                                       LEFT 
                                                       JOIN user_registers on conversation_members.member_id = user_registers.user_id 
                                                      WHERE conversation_members.conversation_id 
                                                         IN (${convIdsString}) 
                                                        AND member_id != ${memberId} 
                                                      GROUP 
                                                         BY conversation_id`);
        
        let conversationMember: ConversationMember[] = [];

        for (let index = 0; index < queryResult.length; index++) {
            const item = queryResult[index];
            
            conversationMember.push({
                id: item.id,
                username: item.username,
                firstName: item.first_name,
                lastName: item.last_name,
                conversationId: item.conversation_id,
                registerId: item.register_id
            });
        }

        return conversationMember;
    }

    async getConversationById(conversationId: number, memberId?: number): Promise<ConversationDetail[] | ConversationMember[]> {
        
        let queryResult: any = null;
        let conversations: ConversationDetail[] | ConversationMember[] = [];


        if (memberId != null) {

            queryResult = mysqlToPromise(`SELECT conversation_members.conversation_id, 
                                                 conversation_members.member_id, 
                                                 users.first_name, 
                                                 users.last_name, 
                                                 users.email, 
                                                 user_registers.register_id 
                                            FROM conversations 
                                            JOIN conversation_members 
                                              ON conversations.id = conversation_members.conversation_id 
                                            LEFT 
                                            JOIN user_registers 
                                              ON conversation_members.member_id = user_registers.user_id 
                                            LEFT 
                                            JOIN users 
                                              ON conversation_members.member_id = users.id 
                                           WHERE conversations.id = ${conversationId} 
                                             AND conversation_members.member_id = ${memberId}`);

            for (let index = 0; index < queryResult.length; index++) {
                const item = queryResult[index];
                
                conversations.push({
                    conversationId: item.conversation_id,
                    memberId: item.memberId,
                    firstName: item.first_name,
                    lastName: item.last_name,
                    email: item.email,
                    registerId: item.register_id
                });
            }

        }
        else {
            
            queryResult = mysqlToPromise(`SELECT conversation_members.conversation_id, 
                                                 conversations.name, 
                                                 conversation_members.member_id 
                                            FROM conversations 
                                            JOIN conversation_members 
                                              ON conversations.id = conversation_members.conversation_id 
                                           WHERE conversations.id = ${conversationId}`);

            for (let index = 0; index < queryResult.length; index++) {
                const item = queryResult[index];
                
                conversations.push({
                    conversationId: item.conversation_id,
                    name: item.name,
                    memberId: item.member_id
                });
            }

        }

        return conversations;
    }

    async createConversation(conversationBody: ConversationBody): Promise<any> {
        
        let conversationId: number = 0;
        let userResults: any = [];
        let convInsertResult: any = [];

        await mysqlParameterizedPromise(`INSERT INTO conversations SET ?`, { name: conversationBody.name })
                .then((response) => {
                    conversationId = response.insertId;
                })
                .catch();


        await mysqlToPromise(`SELECT users.id, users.first_name, users.last_name, users.email, users.username, user_registers.register_id FROM users LEFT JOIN user_registers ON users.id = user_registers.user_id WHERE users.id IN (${conversationBody.members.join(',')})`)
            .then(result => {
                userResults = result;
            })
            .catch();
        
        let values: Array<any> = new Array();

        for (let i = 0; i < conversationBody.members.length; i++) {
            
            values.push([ conversationId, conversationBody.members[i] ]);
            
        }

        await mysqlParameterizedPromise(`INSERT INTO conversation_members(conversation_id, member_id) VALUES ?`, [values])
            .then(result => {
                convInsertResult = result;
            }).catch();

        return {
            rows: convInsertResult,
            users: userResults,
            conversation_id: conversationId
        }

    }

    removeConversation(conversationId: number): Promise<any> {

        mysqlToPromise(`DELETE FROM messages WHERE conversation_id = ${conversationId}`);
        mysqlToPromise(`DELETE FROM conversation_members WHERE conversation_id = ${conversationId}`);

        return mysqlToPromise(`DELETE FROM conversations WHERE id = ${conversationId}`);
    }
    
}

export { ConversationRepository }